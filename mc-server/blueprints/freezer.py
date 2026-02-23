"""Freezer Meal Planning — recipes, sessions, inventory, shopping lists."""
import os
import json
import uuid
import traceback
from datetime import datetime

import requests as http_requests
from flask import Blueprint, request, jsonify

from .shared import CONFIG

bp = Blueprint('freezer', __name__)

FREEZER_DATA_DIR = '/opt/freezer-meals'
SESSIONS_FILE = os.path.join(FREEZER_DATA_DIR, 'sessions.json')
INVENTORY_FILE = os.path.join(FREEZER_DATA_DIR, 'inventory.json')

os.makedirs(FREEZER_DATA_DIR, exist_ok=True)

_tandoor_session = None


def _get_tandoor_session():
    """Get a requests session with Remote-User auth and CSRF cookie."""
    global _tandoor_session
    if _tandoor_session is not None:
        try:
            r = _tandoor_session.get(f'{CONFIG["tandoor_url"]}/api/recipe/', timeout=5)
            if r.status_code == 200:
                return _tandoor_session
        except:
            pass

    session = http_requests.Session()
    session.headers.update({'Remote-User': CONFIG['tandoor_user']})
    session.get(f'{CONFIG["tandoor_url"]}/api/recipe/', timeout=10)
    _tandoor_session = session
    return session


def _tandoor_headers():
    """Get headers for mutating requests (POST/PUT/DELETE) with CSRF token."""
    session = _get_tandoor_session()
    csrf = session.cookies.get('csrftoken', '')
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRFToken': csrf,
        'Referer': CONFIG['tandoor_url'] + '/'
    }


# --- Tandoor Recipe Proxy ---

@bp.route('/api/freezer/recipes', methods=['GET'])
def list_recipes():
    """List all recipes from Tandoor."""
    try:
        params = {}
        query = request.args.get('query')
        if query:
            params['query'] = query
        page = request.args.get('page')
        if page:
            params['page'] = page
        r = _get_tandoor_session().get(
            f'{CONFIG["tandoor_url"]}/api/recipe/',
            params=params,
            timeout=15
        )
        return jsonify(r.json()), r.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 502


@bp.route('/api/freezer/recipes/<int:recipe_id>', methods=['GET'])
def get_recipe(recipe_id):
    """Get a single recipe with full details from Tandoor."""
    try:
        r = _get_tandoor_session().get(
            f'{CONFIG["tandoor_url"]}/api/recipe/{recipe_id}/',
            timeout=15
        )
        return jsonify(r.json()), r.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 502


@bp.route('/api/freezer/recipes/import-url', methods=['POST'])
def import_recipe():
    """Import a recipe from a URL via Tandoor: parse, create, attach image."""
    data = request.get_json()
    if not data or not data.get('url'):
        return jsonify({"error": "URL is required"}), 400

    session = _get_tandoor_session()
    headers = _tandoor_headers()
    source_url = data['url']
    tandoor_url = CONFIG['tandoor_url']

    try:
        # Step 1: Parse the URL with recipe-from-source
        r = session.post(
            f'{tandoor_url}/api/recipe-from-source/',
            json={'url': source_url},
            headers=headers,
            timeout=30
        )
        if r.status_code != 200:
            return jsonify({"error": f"Failed to parse recipe URL: {r.status_code}"}), 502

        parsed = r.json()
        recipe_data = parsed.get('recipe', {})
        if not recipe_data or not recipe_data.get('name'):
            return jsonify({"error": "Could not parse recipe from URL"}), 400

        # Step 2: Build recipe creation payload
        steps = []
        for step in recipe_data.get('steps', []):
            ingredients = []
            for ing in step.get('ingredients', []):
                ingredient = {
                    'amount': ing.get('amount', 0) or 0,
                    'note': ing.get('note', '') or '',
                    'original_text': ing.get('original_text', '') or '',
                }
                if ing.get('food'):
                    ingredient['food'] = ing['food']
                if ing.get('unit') and isinstance(ing['unit'], dict) and ing['unit'].get('name'):
                    ingredient['unit'] = ing['unit']
                else:
                    ingredient['unit'] = {'name': 'whole'}
                ingredients.append(ingredient)
            steps.append({
                'instruction': step.get('instruction', ''),
                'ingredients': ingredients,
                'time': step.get('time', 0),
                'order': step.get('order', 0),
            })

        create_payload = {
            'name': recipe_data.get('name', 'Imported Recipe'),
            'description': recipe_data.get('description', ''),
            'servings': recipe_data.get('servings', 1),
            'servings_text': recipe_data.get('servings_text', ''),
            'working_time': recipe_data.get('working_time', 0),
            'waiting_time': recipe_data.get('waiting_time', 0),
            'internal': True,
            'source_url': source_url,
            'steps': steps,
        }
        if recipe_data.get('keywords'):
            create_payload['keywords'] = recipe_data['keywords']

        # Step 3: Create the recipe
        r2 = session.post(
            f'{tandoor_url}/api/recipe/',
            json=create_payload,
            headers=headers,
            timeout=15
        )
        if r2.status_code not in (200, 201):
            error_detail = r2.text[:500]
            print(f"Tandoor recipe creation failed: {r2.status_code} - {error_detail}")
            return jsonify({"error": f"Failed to create recipe: {error_detail}"}), 502

        created = r2.json()
        recipe_id = created.get('id')

        # Step 4: Download and attach image
        image_url = recipe_data.get('image_url', '')
        if not image_url:
            images = parsed.get('images', [])
            for img in images:
                if isinstance(img, str) and ('recipe' in img.lower() or recipe_data.get('name', '').split()[0].lower() in img.lower()):
                    image_url = img
                    break
            if not image_url and images:
                for img in images:
                    if isinstance(img, str) and not ('icon' in img.lower() or 'logo' in img.lower() or 'profile' in img.lower()) and ('jpg' in img.lower() or 'jpeg' in img.lower() or 'png' in img.lower() or 'webp' in img.lower()):
                        image_url = img
                        break

        if image_url and recipe_id:
            try:
                img_resp = http_requests.get(image_url, timeout=15, headers={
                    'User-Agent': 'Mozilla/5.0 (compatible; recipe-import)'
                })
                if img_resp.status_code == 200:
                    ext = os.path.splitext(image_url.split('?')[0])[1] or '.jpg'
                    filename = f"recipe_{recipe_id}{ext}"
                    csrf = session.cookies.get('csrftoken', '')
                    img_upload = session.put(
                        f'{tandoor_url}/api/recipe/{recipe_id}/image/',
                        files={'image': (filename, img_resp.content, img_resp.headers.get('Content-Type', 'image/jpeg'))},
                        headers={'X-CSRFToken': csrf, 'Referer': tandoor_url + '/'},
                        timeout=15
                    )
                    if img_upload.status_code not in (200, 204):
                        print(f"Image upload failed: {img_upload.status_code} - {img_upload.text[:200]}")
            except Exception as img_err:
                print(f"Failed to download/attach image: {img_err}")

        # Re-fetch the recipe to include image URL in response
        if recipe_id:
            try:
                r3 = session.get(f'{tandoor_url}/api/recipe/{recipe_id}/', timeout=10)
                if r3.status_code == 200:
                    created = r3.json()
            except:
                pass

        return jsonify(created), 201

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 502


@bp.route('/api/freezer/recipes/<int:recipe_id>', methods=['DELETE'])
def delete_recipe(recipe_id):
    """Delete a recipe from Tandoor."""
    try:
        r = _get_tandoor_session().delete(
            f'{CONFIG["tandoor_url"]}/api/recipe/{recipe_id}/',
            headers=_tandoor_headers(),
            timeout=15
        )
        if r.status_code == 204:
            return jsonify({"deleted": True}), 200
        return jsonify(r.json() if r.text else {"error": "Delete failed"}), r.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 502


@bp.route('/api/freezer/recipes/<int:recipe_id>/keywords', methods=['PUT'])
def update_recipe_keywords(recipe_id):
    """Update keywords/tags on a Tandoor recipe."""
    data = request.get_json()
    if not data or 'keywords' not in data:
        return jsonify({"error": "keywords array is required"}), 400
    try:
        r = _get_tandoor_session().get(
            f'{CONFIG["tandoor_url"]}/api/recipe/{recipe_id}/',
            timeout=15
        )
        if r.status_code != 200:
            return jsonify({"error": "Recipe not found"}), 404

        keyword_objects = []
        for kw in data['keywords']:
            if isinstance(kw, str):
                keyword_objects.append({"name": kw})
            else:
                keyword_objects.append(kw)

        r2 = _get_tandoor_session().patch(
            f'{CONFIG["tandoor_url"]}/api/recipe/{recipe_id}/',
            json={"keywords": keyword_objects},
            headers=_tandoor_headers(),
            timeout=15
        )
        return jsonify(r2.json()), r2.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 502


# --- Prep Sessions ---

def _load_sessions():
    try:
        with open(SESSIONS_FILE, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"sessions": []}


def _save_sessions(data):
    with open(SESSIONS_FILE, 'w') as f:
        json.dump(data, f, indent=2)


@bp.route('/api/freezer/sessions', methods=['GET'])
def list_sessions():
    """List all prep sessions."""
    return jsonify(_load_sessions()), 200


@bp.route('/api/freezer/sessions', methods=['POST'])
def create_session():
    """Create a new prep session."""
    body = request.get_json()
    if not body or not body.get('name'):
        return jsonify({"error": "Session name is required"}), 400

    data = _load_sessions()
    session_id = str(uuid.uuid4())[:8]
    session = {
        "id": session_id,
        "name": body['name'],
        "recipes": body.get('recipes', []),
        "shoppingList": None,
        "createdAt": datetime.now().isoformat(),
        "status": "planning"
    }
    data["sessions"].append(session)
    _save_sessions(data)
    return jsonify(session), 201


@bp.route('/api/freezer/sessions/<session_id>', methods=['PUT'])
def update_session(session_id):
    """Update a prep session."""
    body = request.get_json()
    data = _load_sessions()

    for i, s in enumerate(data["sessions"]):
        if s["id"] == session_id:
            if 'name' in body:
                s['name'] = body['name']
            if 'recipes' in body:
                s['recipes'] = body['recipes']
            if 'status' in body:
                s['status'] = body['status']
            data["sessions"][i] = s
            _save_sessions(data)
            return jsonify(s), 200

    return jsonify({"error": "Session not found"}), 404


@bp.route('/api/freezer/sessions/<session_id>', methods=['DELETE'])
def delete_session(session_id):
    """Delete a prep session."""
    data = _load_sessions()
    data["sessions"] = [s for s in data["sessions"] if s["id"] != session_id]
    _save_sessions(data)
    return jsonify({"deleted": True}), 200


# --- Ingredient Categories ---

INGREDIENT_CATEGORIES_ORDERED = [
    ("frozen", ["frozen vegetable", "frozen corn", "frozen pea", "frozen spinach",
                "frozen fruit", "ice cream"]),
    ("canned", ["diced tomato", "tomato sauce", "tomato paste", "coconut milk", "chickpea",
                "black bean", "kidney bean", "lentil", "broth", "stock",
                "crushed tomato", "fire roasted", "enchilada sauce", "salsa",
                "canned"]),
    ("spices", ["salt", "pepper", "cumin", "paprika", "chili powder", "oregano",
                "dried basil", "dried thyme", "dried rosemary", "thyme", "cinnamon",
                "nutmeg", "cayenne", "turmeric", "garlic powder", "onion powder",
                "red pepper flake", "bay leaf", "italian seasoning", "taco seasoning",
                "curry powder", "garam masala", "smoked paprika", "coriander",
                "black pepper", "white pepper", "seasoning"]),
    ("dairy", ["butter", "milk", "cream", "cheese", "yogurt", "sour cream", "half and half",
               "cream cheese", "parmesan", "cheddar", "mozzarella", "ricotta", "egg"]),
    ("pantry", ["oil", "olive oil", "vegetable oil", "flour", "sugar", "rice", "pasta",
                "noodle", "bread", "tortilla", "soy sauce", "vinegar", "honey",
                "maple syrup", "peanut butter", "mustard", "ketchup", "hot sauce",
                "worcestershire", "sesame oil", "cornstarch", "baking powder",
                "baking soda", "vanilla", "cocoa", "oat", "quinoa", "couscous",
                "nutritional yeast", "vegetable broth", "bouillon"]),
    ("produce", ["onion", "garlic", "potato", "carrot", "celery", "cabbage", "tomato",
                 "corn", "spinach", "kale", "lettuce", "broccoli", "zucchini",
                 "mushroom", "ginger", "lemon", "lime", "avocado", "cucumber", "bean sprout",
                 "scallion", "green onion", "cilantro", "parsley", "basil",
                 "jalapeno", "bell pepper", "sweet potato", "squash", "pumpkin", "eggplant",
                 "cauliflower", "pea", "green bean", "rosemary"]),
]


def _categorize_ingredient(name):
    name_lower = name.lower()
    for category, keywords in INGREDIENT_CATEGORIES_ORDERED:
        for keyword in keywords:
            if keyword in name_lower:
                return category
    return "other"


def _normalize_ingredient_name(name):
    """Basic normalization for ingredient aggregation."""
    name = name.lower().strip()
    for prefix in ['fresh ', 'dried ', 'ground ', 'large ', 'small ', 'medium ',
                   'minced ', 'chopped ', 'diced ', 'sliced ', 'whole ', 'crushed ']:
        if name.startswith(prefix):
            name = name[len(prefix):]
    return name.strip()


@bp.route('/api/freezer/sessions/<session_id>/generate-list', methods=['POST'])
def generate_shopping_list(session_id):
    """Generate a shopping list for a prep session with prep guide."""
    data = _load_sessions()
    session = None
    for s in data["sessions"]:
        if s["id"] == session_id:
            session = s
            break
    if not session:
        return jsonify({"error": "Session not found"}), 404
    if not session.get("recipes"):
        return jsonify({"error": "No recipes in session"}), 400

    aggregated = {}
    recipe_details = []

    for entry in session["recipes"]:
        recipe_id = entry.get("recipeId")
        multiplier = entry.get("multiplier", 1)

        try:
            r = _get_tandoor_session().get(
                f'{CONFIG["tandoor_url"]}/api/recipe/{recipe_id}/',
                timeout=15
            )
            if r.status_code != 200:
                continue
            recipe = r.json()
            recipe_name = recipe.get("name", f"Recipe {recipe_id}")

            recipe_info = {
                "id": recipe_id,
                "name": recipe_name,
                "multiplier": multiplier,
                "servings": recipe.get("servings", 1),
                "totalPortions": (recipe.get("servings", 1) or 1) * multiplier,
                "instructions": [],
                "ingredients": []
            }

            for step in recipe.get("steps", []):
                if step.get("instruction"):
                    recipe_info["instructions"].append(step["instruction"])
                for ing in step.get("ingredients", []):
                    food = ing.get("food", {})
                    if not food:
                        continue
                    food_name = food.get("name", "")
                    if not food_name:
                        continue

                    normalized = _normalize_ingredient_name(food_name)
                    amount = (ing.get("amount", 0) or 0) * multiplier
                    unit_obj = ing.get("unit", {})
                    unit = unit_obj.get("name", "") if unit_obj else ""
                    note = ing.get("note", "")

                    recipe_info["ingredients"].append({
                        "name": food_name,
                        "amount": amount,
                        "originalAmount": ing.get("amount", 0) or 0,
                        "unit": unit,
                        "note": note
                    })

                    if normalized in aggregated:
                        existing = aggregated[normalized]
                        if existing["unit"] == unit:
                            existing["amount"] += amount
                        else:
                            alt_key = f"{normalized}_{unit}"
                            if alt_key in aggregated:
                                aggregated[alt_key]["amount"] += amount
                            else:
                                aggregated[alt_key] = {
                                    "name": food_name,
                                    "amount": amount,
                                    "unit": unit,
                                    "category": _categorize_ingredient(food_name),
                                    "recipes": [recipe_name]
                                }
                            continue
                        if recipe_name not in existing["recipes"]:
                            existing["recipes"].append(recipe_name)
                    else:
                        aggregated[normalized] = {
                            "name": food_name,
                            "amount": amount,
                            "unit": unit,
                            "category": _categorize_ingredient(food_name),
                            "recipes": [recipe_name]
                        }

            recipe_details.append(recipe_info)
        except Exception as e:
            print(f"Failed to fetch recipe {recipe_id}: {e}")
            continue

    # Subtract inventory
    inventory = _load_inventory()
    for item in inventory.get("items", []):
        inv_name = _normalize_ingredient_name(item.get("name", ""))
        if inv_name in aggregated:
            agg = aggregated[inv_name]
            on_hand = item.get("quantity", 0)
            agg["onHand"] = on_hand
            agg["toBuy"] = max(0, agg["amount"] - on_hand)
        else:
            for key in list(aggregated.keys()):
                if key.startswith(inv_name):
                    agg = aggregated[key]
                    on_hand = item.get("quantity", 0)
                    agg["onHand"] = on_hand
                    agg["toBuy"] = max(0, agg["amount"] - on_hand)

    # Build final list grouped by category
    shopping_list = {}
    for key, item in aggregated.items():
        cat = item["category"]
        if cat not in shopping_list:
            shopping_list[cat] = []
        if "toBuy" not in item:
            item["toBuy"] = item["amount"]
            item["onHand"] = 0
        item["checked"] = False
        item["id"] = key
        shopping_list[cat].append(item)

    for cat in shopping_list:
        shopping_list[cat].sort(key=lambda x: x["name"])

    prep_guide = _build_prep_guide(aggregated, recipe_details)

    session["shoppingList"] = shopping_list
    session["prepGuide"] = prep_guide
    _save_sessions(data)

    total_items = sum(len(items) for items in shopping_list.values())
    return jsonify({
        "shoppingList": shopping_list,
        "prepGuide": prep_guide,
        "totalItems": total_items,
        "categories": list(shopping_list.keys())
    }), 200


def _build_prep_guide(aggregated, recipe_details):
    """Build a combined prep guide from aggregated ingredients and recipe details."""
    shared_prep = []
    for key, item in aggregated.items():
        if len(item.get("recipes", [])) > 1:
            per_recipe = []
            for rd in recipe_details:
                for ing in rd["ingredients"]:
                    norm = _normalize_ingredient_name(ing["name"])
                    if norm == key or f"{norm}_{ing['unit']}" == key:
                        amt = ing["amount"]
                        unit = ing["unit"]
                        amt_str = str(int(amt)) if amt == int(amt) else f"{amt:.1f}"
                        per_recipe.append(f"{amt_str} {unit} for {rd['name']}")
                        break
            total_amt = item["amount"]
            total_str = str(int(total_amt)) if total_amt == int(total_amt) else f"{total_amt:.1f}"
            shared_prep.append({
                "ingredient": item["name"],
                "totalAmount": total_str,
                "unit": item["unit"],
                "breakdown": per_recipe
            })

    recipe_instructions = []
    for rd in recipe_details:
        mult_note = f" (x{rd['multiplier']})" if rd["multiplier"] > 1 else ""
        recipe_instructions.append({
            "name": rd["name"] + mult_note,
            "portions": rd["totalPortions"],
            "instructions": rd["instructions"],
            "ingredients": [{
                "name": ing["name"],
                "amount": str(int(ing["amount"])) if ing["amount"] == int(ing["amount"]) else f"{ing['amount']:.1f}",
                "unit": ing["unit"],
                "note": ing.get("note", "")
            } for ing in rd["ingredients"]]
        })

    return {
        "sharedPrep": shared_prep,
        "recipes": recipe_instructions
    }


@bp.route('/api/freezer/sessions/<session_id>/check-item', methods=['PATCH'])
def check_item(session_id):
    """Toggle a shopping list item's checked state."""
    body = request.get_json()
    if not body or 'itemId' not in body:
        return jsonify({"error": "itemId is required"}), 400

    data = _load_sessions()
    for s in data["sessions"]:
        if s["id"] == session_id:
            shopping_list = s.get("shoppingList", {})
            item_id = body["itemId"]
            checked = body.get("checked", True)
            for cat, items in shopping_list.items():
                for item in items:
                    if item.get("id") == item_id:
                        item["checked"] = checked
                        _save_sessions(data)
                        return jsonify({"updated": True, "itemId": item_id, "checked": checked}), 200
            return jsonify({"error": "Item not found"}), 404
    return jsonify({"error": "Session not found"}), 404


# --- Inventory Management ---

def _load_inventory():
    try:
        with open(INVENTORY_FILE, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"items": []}


def _save_inventory(data):
    with open(INVENTORY_FILE, 'w') as f:
        json.dump(data, f, indent=2)


@bp.route('/api/freezer/inventory', methods=['GET'])
def get_inventory():
    """Get all inventory items."""
    return jsonify(_load_inventory()), 200


@bp.route('/api/freezer/inventory', methods=['POST'])
def add_inventory():
    """Add or update an inventory item."""
    body = request.get_json()
    if not body or not body.get('name'):
        return jsonify({"error": "Item name is required"}), 400

    data = _load_inventory()
    name = body['name'].strip()
    quantity = body.get('quantity', 1)
    unit = body.get('unit', '')
    location = body.get('location', 'pantry')

    for item in data["items"]:
        if item["name"].lower() == name.lower():
            item["quantity"] = quantity
            item["unit"] = unit
            item["location"] = location
            item["updatedAt"] = datetime.now().isoformat()
            _save_inventory(data)
            return jsonify(item), 200

    new_item = {
        "name": name,
        "quantity": quantity,
        "unit": unit,
        "location": location,
        "addedAt": datetime.now().isoformat()
    }
    data["items"].append(new_item)
    _save_inventory(data)
    return jsonify(new_item), 201


@bp.route('/api/freezer/inventory/<path:item_name>', methods=['DELETE'])
def delete_inventory(item_name):
    """Remove an inventory item by name."""
    data = _load_inventory()
    original_len = len(data["items"])
    data["items"] = [i for i in data["items"] if i["name"].lower() != item_name.lower()]
    if len(data["items"]) == original_len:
        return jsonify({"error": "Item not found"}), 404
    _save_inventory(data)
    return jsonify({"deleted": True, "name": item_name}), 200
