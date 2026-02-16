import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import subprocess
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024 * 1024  # 50 GB max upload
CORS(app) # Enable CORS for all routes

# Get the secret token from environment variables
SECRET_TOKEN = os.getenv("COMMAND_SERVER_TOKEN")

@app.before_request
def check_token():
    """Check for a valid secret token on all requests."""
    # Allow OPTIONS requests (CORS preflight) without auth
    if request.method == 'OPTIONS':
        return

    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Authorization header missing"}), 401
    
    try:
        auth_type, token = auth_header.split()
        if auth_type.lower() != 'bearer' or token != SECRET_TOKEN:
            return jsonify({"error": "Invalid or missing token"}), 403
    except ValueError:
        return jsonify({"error": "Invalid Authorization header format"}), 401

@app.route('/api/rescan-plex', methods=['POST'])
def rescan_plex_endpoint():
    """Execute the Plex library rescan script."""
    script_path = '/home/darney/projects/proxmox-homelab/scripts/rescan_plex.sh' # Using absolute path

    if not os.path.exists(script_path):
        return jsonify({"error": f"Script not found at {script_path}"}), 500

    try:
        # Make the script executable and run it
        subprocess.run(['chmod', '+x', script_path], check=True)
        result = subprocess.run([script_path], capture_output=True, text=True, check=True)

        return jsonify({
            "message": "Plex rescan initiated successfully.",
            "output": result.stdout,
            "error_output": result.stderr
        }), 200
    except subprocess.CalledProcessError as e:
        return jsonify({
            "error": "Script execution failed.",
            "details": e.stderr
        }), 500
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred.", "details": str(e)}), 500

@app.route('/api/refresh-cync', methods=['POST'])
def refresh_cync_endpoint():
    """Reload the Cync integration in Home Assistant."""
    script_path = '/home/darney/projects/proxmox-homelab/scripts/refresh_cync.sh'

    if not os.path.exists(script_path):
        return jsonify({"error": f"Script not found at {script_path}"}), 500

    ha_token = os.getenv("HA_TOKEN")
    if not ha_token or ha_token == "YOUR_HA_TOKEN_HERE":
        return jsonify({"error": "HA_TOKEN not configured in .env file"}), 500

    try:
        subprocess.run(['chmod', '+x', script_path], check=True)
        env = os.environ.copy()
        env['HA_TOKEN'] = ha_token
        result = subprocess.run([script_path], capture_output=True, text=True, check=True, env=env)

        return jsonify({
            "message": "Cync integration refreshed successfully.",
            "output": result.stdout,
            "error_output": result.stderr
        }), 200
    except subprocess.CalledProcessError as e:
        return jsonify({
            "error": "Failed to refresh Cync integration.",
            "details": e.stderr or e.stdout
        }), 500
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred.", "details": str(e)}), 500

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/mnt/media_pool")
UPLOAD_TMP = os.path.join(UPLOAD_DIR, '.upload-tmp')
os.makedirs(UPLOAD_TMP, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_DIR

# Use media pool for temp files so large uploads don't fill root filesystem
import tempfile
tempfile.tempdir = UPLOAD_TMP

@app.route('/api/upload-media', methods=['POST'])
def upload_media():
    """Upload a file to the media pool for sorting via mc."""
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    filename = secure_filename(file.filename)
    if not filename:
        return jsonify({"error": "Invalid filename"}), 400

    dest = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(dest):
        return jsonify({"error": f"File '{filename}' already exists in media pool"}), 409

    try:
        file.save(dest)
        return jsonify({
            "message": f"Uploaded '{filename}' to media pool. Use mc to move it to the right folder.",
            "filename": filename
        }), 200
    except Exception as e:
        return jsonify({"error": "Upload failed.", "details": str(e)}), 500

import requests as http_requests

HA_URL = 'http://192.168.0.99:8123'

def _ha_headers():
    ha_token = os.getenv("HA_TOKEN")
    return {
        'Authorization': f'Bearer {ha_token}',
        'Content-Type': 'application/json'
    }

@app.route('/api/ha/states', methods=['GET'])
def ha_states():
    """Proxy HA states API to avoid CORS issues."""
    try:
        r = http_requests.get(f'{HA_URL}/api/states', headers=_ha_headers(), timeout=10)
        return jsonify(r.json()), r.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 502

@app.route('/api/ha/services/<domain>/<service>', methods=['POST'])
def ha_call_service(domain, service):
    """Proxy HA service calls to avoid CORS issues."""
    try:
        r = http_requests.post(
            f'{HA_URL}/api/services/{domain}/{service}',
            headers=_ha_headers(),
            json=request.get_json(),
            timeout=10
        )
        return jsonify(r.json() if r.text else {}), r.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 502


# --- Oliver's First Words Journal ---
import json as _json
from datetime import date as _date, datetime as _datetime
import uuid as _uuid

OLIVER_QUOTES_FILE = '/opt/oliver-quotes.json'

NEXTCLOUD_URL = os.getenv('NEXTCLOUD_URL', 'http://192.168.0.99:8090')
NEXTCLOUD_USER = os.getenv('NEXTCLOUD_USER', '')
NEXTCLOUD_APP_PASSWORD = os.getenv('NEXTCLOUD_APP_PASSWORD', '')
NEXTCLOUD_CALENDAR = os.getenv('NEXTCLOUD_CALENDAR', 'personal')

def _load_quotes():
    try:
        with open(OLIVER_QUOTES_FILE, 'r') as f:
            return _json.load(f)
    except (FileNotFoundError, _json.JSONDecodeError):
        return {}

def _save_quotes(quotes):
    with open(OLIVER_QUOTES_FILE, 'w') as f:
        _json.dump(quotes, f, indent=2, sort_keys=True)

def _create_caldav_event(date_str, quote_text):
    if not NEXTCLOUD_USER or not NEXTCLOUD_APP_PASSWORD:
        return False
    uid = str(_uuid.uuid4())
    now = _datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    date_compact = date_str.replace("-", "")
    safe_quote = quote_text.replace('"', "'")
    ical = "\r\n".join([
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//LCiB Dashboard//Oliver Almanac//EN",
        "BEGIN:VEVENT",
        "UID:" + uid,
        "DTSTAMP:" + now,
        "DTSTART;VALUE=DATE:" + date_compact,
        "DTEND;VALUE=DATE:" + date_compact,
        "SUMMARY:Olivers Almanac: " + safe_quote,
        "CATEGORIES:Olivers Almanac",
        "END:VEVENT",
        "END:VCALENDAR",
        ""
    ])
    try:
        caldav_url = NEXTCLOUD_URL + "/remote.php/dav/calendars/" + NEXTCLOUD_USER + "/" + NEXTCLOUD_CALENDAR + "/" + uid + ".ics"
        r = http_requests.put(
            caldav_url,
            data=ical,
            headers={"Content-Type": "text/calendar; charset=utf-8"},
            auth=(NEXTCLOUD_USER, NEXTCLOUD_APP_PASSWORD),
            timeout=10
        )
        return r.status_code in (200, 201, 204)
    except Exception as e:
        print("CalDAV event creation failed: " + str(e))
        return False

@app.route('/api/oliver-quotes', methods=['GET'])
def get_oliver_quotes():
    quotes = _load_quotes()
    date_filter = request.args.get('date')
    if date_filter:
        entry = quotes.get(date_filter)
        if isinstance(entry, str):
            entry = {"quote": entry, "submitted_by": "unknown"}
        return jsonify({"date": date_filter, "quote": entry.get("quote") if entry else None, "submitted_by": entry.get("submitted_by") if entry else None}), 200
    result = {}
    for d, v in quotes.items():
        if isinstance(v, str):
            result[d] = {"quote": v, "submitted_by": "unknown"}
        else:
            result[d] = v
    return jsonify(result), 200

@app.route('/api/oliver-quotes', methods=['POST'])
def save_oliver_quote():
    data = request.get_json()
    if not data or not data.get('quote', '').strip():
        return jsonify({"error": "Quote text is required"}), 400
    today = _date.today().isoformat()
    quotes = _load_quotes()
    if today in quotes:
        existing = quotes[today]
        q = existing.get("quote", existing) if isinstance(existing, dict) else existing
        return jsonify({"error": "Already submitted for today", "date": today, "quote": q}), 409
    submitted_by = request.headers.get('X-Device-Name', '') or request.remote_addr or 'unknown'
    entry = {
        "quote": data['quote'].strip(),
        "submitted_by": submitted_by,
        "timestamp": _datetime.now().isoformat()
    }
    quotes[today] = entry
    _save_quotes(quotes)
    caldav_ok = _create_caldav_event(today, entry['quote'])
    return jsonify({"date": today, "quote": entry['quote'], "submitted_by": entry['submitted_by'], "synced_to_calendar": caldav_ok}), 200


# --- Nextcloud Calendar Events Read ---
import re as _re
from xml.etree import ElementTree as _ET

def _parse_ical_events(ical_text):
    """Parse iCalendar text into a list of event dicts."""
    events = []
    in_event = False
    current = {}
    for line in ical_text.replace("\r\n", "\n").split("\n"):
        line = line.strip()
        if line == "BEGIN:VEVENT":
            in_event = True
            current = {}
        elif line == "END:VEVENT":
            in_event = False
            if current.get("summary"):
                events.append(current)
            current = {}
        elif in_event and ":" in line:
            # Handle properties with parameters like DTSTART;VALUE=DATE:20260215
            key_part, _, value = line.partition(":")
            key = key_part.split(";")[0].upper()
            if key == "SUMMARY":
                current["summary"] = value
            elif key == "DTSTART":
                current["dtstart"] = value
                current["allDay"] = "VALUE=DATE" in key_part and "DATE-TIME" not in key_part
            elif key == "DTEND":
                current["dtend"] = value
            elif key == "UID":
                current["uid"] = value
            elif key == "CATEGORIES":
                current["categories"] = value
            elif key == "DESCRIPTION":
                current["description"] = value
    return events

def _parse_date(date_str):
    """Parse iCal date string to ISO format."""
    if not date_str:
        return None
    # All-day: 20260215
    if len(date_str) == 8 and date_str.isdigit():
        return date_str[:4] + "-" + date_str[4:6] + "-" + date_str[6:8]
    # DateTime: 20260215T120000Z or 20260215T120000
    clean = date_str.replace("Z", "")
    if len(clean) >= 15 and "T" in clean:
        d = clean[:8]
        t = clean[9:15]
        return d[:4] + "-" + d[4:6] + "-" + d[6:8] + "T" + t[:2] + ":" + t[2:4] + ":" + t[4:6]
    return date_str

@app.route('/api/calendar-events', methods=['GET'])
def get_calendar_events():
    """Fetch upcoming events from Nextcloud CalDAV."""
    if not NEXTCLOUD_USER or not NEXTCLOUD_APP_PASSWORD:
        return jsonify({"error": "Nextcloud not configured"}), 500

    days = int(request.args.get('days', 30))
    now = _datetime.utcnow()
    from datetime import timedelta as _td
    start = (now - _td(days=7)).strftime("%Y%m%dT%H%M%SZ")
    end = (now + _td(days=days)).strftime("%Y%m%dT%H%M%SZ")

    caldav_url = NEXTCLOUD_URL + "/remote.php/dav/calendars/" + NEXTCLOUD_USER + "/" + NEXTCLOUD_CALENDAR + "/"

    # CalDAV REPORT request for time-range query
    report_body = """<?xml version="1.0" encoding="utf-8" ?>
<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop>
    <D:getetag/>
    <C:calendar-data/>
  </D:prop>
  <C:filter>
    <C:comp-filter name="VCALENDAR">
      <C:comp-filter name="VEVENT">
        <C:time-range start="{start}" end="{end}"/>
      </C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>""".format(start=start, end=end)

    try:
        r = http_requests.request(
            "REPORT",
            caldav_url,
            data=report_body,
            headers={
                "Content-Type": "application/xml; charset=utf-8",
                "Depth": "1",
            },
            auth=(NEXTCLOUD_USER, NEXTCLOUD_APP_PASSWORD),
            timeout=15
        )

        if r.status_code not in (200, 207):
            return jsonify({"error": "CalDAV request failed", "status": r.status_code, "body": r.text[:500]}), 502

        # Parse the multistatus XML response
        # Strip namespace prefixes for easier parsing
        xml_text = r.text
        root = _ET.fromstring(xml_text)

        # Define namespaces
        ns = {
            "D": "DAV:",
            "C": "urn:ietf:params:xml:ns:caldav",
        }

        events = []
        for response in root.findall(".//D:response", ns):
            cal_data_el = response.find(".//C:calendar-data", ns)
            if cal_data_el is not None and cal_data_el.text:
                parsed = _parse_ical_events(cal_data_el.text)
                for ev in parsed:
                    events.append({
                        "id": ev.get("uid", ""),
                        "title": ev.get("summary", "Untitled"),
                        "startDate": _parse_date(ev.get("dtstart", "")),
                        "endDate": _parse_date(ev.get("dtend", "")),
                        "allDay": ev.get("allDay", False),
                        "category": ev.get("categories", "personal"),
                        "description": ev.get("description", ""),
                    })

        # Sort by start date
        events.sort(key=lambda e: e.get("startDate") or "")

        return jsonify({"events": events, "count": len(events)}), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch calendar events", "details": str(e)}), 502



@app.route('/api/calendar-events', methods=['POST'])
def create_calendar_event():
    """Create a new event in Nextcloud CalDAV."""
    if not NEXTCLOUD_USER or not NEXTCLOUD_APP_PASSWORD:
        return jsonify({"error": "Nextcloud not configured"}), 500

    data = request.get_json()
    if not data or not data.get('title'):
        return jsonify({"error": "Title is required"}), 400

    uid = str(_uuid.uuid4())
    now = _datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    title = data['title'].replace('"', "'")
    description = (data.get('description') or '').replace('"', "'")
    category = data.get('category', 'personal')
    all_day = data.get('allDay', False)

    # Parse start date
    start_str = data.get('startDate', '')
    if not start_str:
        return jsonify({"error": "startDate is required"}), 400

    ical_lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//LCiB Dashboard//Calendar Hub//EN",
        "BEGIN:VEVENT",
        "UID:" + uid,
        "DTSTAMP:" + now,
    ]

    if all_day:
        # All-day: expect "YYYY-MM-DD" format
        date_compact = start_str.replace("-", "")[:8]
        ical_lines.append("DTSTART;VALUE=DATE:" + date_compact)
        ical_lines.append("DTEND;VALUE=DATE:" + date_compact)
    else:
        # Timed event: expect ISO datetime string
        # Convert to iCal format: 20260215T120000Z
        clean = start_str.replace("-", "").replace(":", "").replace(" ", "T")
        if "T" not in clean:
            clean = clean + "T000000"
        # Strip timezone info, take first 15 chars (YYYYMMDDTHHmmSS)
        dt_part = clean[:15]
        if not dt_part.endswith("Z"):
            dt_part = dt_part + "Z"
        ical_lines.append("DTSTART:" + dt_part)
        # Default 1 hour duration
        end_str = data.get('endDate', '')
        if end_str:
            end_clean = end_str.replace("-", "").replace(":", "").replace(" ", "T")
            if "T" not in end_clean:
                end_clean = end_clean + "T000000"
            end_dt = end_clean[:15]
            if not end_dt.endswith("Z"):
                end_dt = end_dt + "Z"
            ical_lines.append("DTEND:" + end_dt)

    ical_lines.append("SUMMARY:" + title)
    if description:
        ical_lines.append("DESCRIPTION:" + description)
    if category:
        ical_lines.append("CATEGORIES:" + category)
    ical_lines.extend(["END:VEVENT", "END:VCALENDAR", ""])

    ical = "\r\n".join(ical_lines)

    try:
        caldav_url = NEXTCLOUD_URL + "/remote.php/dav/calendars/" + NEXTCLOUD_USER + "/" + NEXTCLOUD_CALENDAR + "/" + uid + ".ics"
        r = http_requests.put(
            caldav_url,
            data=ical,
            headers={"Content-Type": "text/calendar; charset=utf-8"},
            auth=(NEXTCLOUD_USER, NEXTCLOUD_APP_PASSWORD),
            timeout=10
        )
        if r.status_code in (200, 201, 204):
            return jsonify({"id": uid, "title": title, "created": True}), 201
        else:
            return jsonify({"error": "CalDAV PUT failed", "status": r.status_code, "body": r.text[:300]}), 502
    except Exception as e:
        return jsonify({"error": "Failed to create event", "details": str(e)}), 502


@app.route('/api/calendar-events/<event_uid>', methods=['DELETE'])
def delete_calendar_event(event_uid):
    """Delete an event from Nextcloud CalDAV."""
    if not NEXTCLOUD_USER or not NEXTCLOUD_APP_PASSWORD:
        return jsonify({"error": "Nextcloud not configured"}), 500

    # First, find the .ics file for this UID via PROPFIND + REPORT
    caldav_base = NEXTCLOUD_URL + "/remote.php/dav/calendars/" + NEXTCLOUD_USER + "/" + NEXTCLOUD_CALENDAR + "/"

    # Try direct deletion with UID as filename
    caldav_url = caldav_base + event_uid + ".ics"
    try:
        r = http_requests.delete(
            caldav_url,
            auth=(NEXTCLOUD_USER, NEXTCLOUD_APP_PASSWORD),
            timeout=10
        )
        if r.status_code in (200, 204):
            return jsonify({"deleted": True, "id": event_uid}), 200
    except:
        pass

    # If direct didn't work, search for the event by UID
    report_body = """<?xml version="1.0" encoding="utf-8" ?>
<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop>
    <D:getetag/>
    <C:calendar-data/>
  </D:prop>
  <C:filter>
    <C:comp-filter name="VCALENDAR">
      <C:comp-filter name="VEVENT">
        <C:prop-filter name="UID">
          <C:text-match collation="i;octet">{uid}</C:text-match>
        </C:prop-filter>
      </C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>""".format(uid=event_uid)

    try:
        r = http_requests.request(
            "REPORT",
            caldav_base,
            data=report_body,
            headers={"Content-Type": "application/xml; charset=utf-8", "Depth": "1"},
            auth=(NEXTCLOUD_USER, NEXTCLOUD_APP_PASSWORD),
            timeout=10
        )

        if r.status_code in (200, 207):
            root = _ET.fromstring(r.text)
            ns = {"D": "DAV:"}
            for response in root.findall(".//D:response", ns):
                href_el = response.find("D:href", ns)
                if href_el is not None and href_el.text:
                    delete_url = NEXTCLOUD_URL + href_el.text
                    dr = http_requests.delete(
                        delete_url,
                        auth=(NEXTCLOUD_USER, NEXTCLOUD_APP_PASSWORD),
                        timeout=10
                    )
                    if dr.status_code in (200, 204):
                        return jsonify({"deleted": True, "id": event_uid}), 200

        return jsonify({"error": "Event not found", "id": event_uid}), 404

    except Exception as e:
        return jsonify({"error": "Failed to delete event", "details": str(e)}), 502


# --- Freezer Meal Planning System ---

TANDOOR_URL = os.getenv('TANDOOR_URL', 'http://192.168.0.99:8080')
TANDOOR_USER = os.getenv('TANDOOR_USER', '')
TANDOOR_PASSWORD = os.getenv('TANDOOR_PASSWORD', '')

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
            r = _tandoor_session.get(f'{TANDOOR_URL}/api/recipe/', timeout=5)
            if r.status_code == 200:
                return _tandoor_session
        except:
            pass

    import requests as _req
    session = _req.Session()
    # Set Remote-User header on all requests from this session
    session.headers.update({
        'Remote-User': TANDOOR_USER,
    })
    # Make a GET to establish CSRF cookie
    session.get(f'{TANDOOR_URL}/api/recipe/', timeout=10)
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
        'Referer': TANDOOR_URL + '/'
    }


# --- Tandoor Recipe Proxy ---

@app.route('/api/freezer/recipes', methods=['GET'])
def freezer_list_recipes():
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
            f'{TANDOOR_URL}/api/recipe/',
            params=params,
            timeout=15
        )
        return jsonify(r.json()), r.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 502


@app.route('/api/freezer/recipes/<int:recipe_id>', methods=['GET'])
def freezer_get_recipe(recipe_id):
    """Get a single recipe with full details from Tandoor."""
    try:
        r = _get_tandoor_session().get(
            f'{TANDOOR_URL}/api/recipe/{recipe_id}/',
            timeout=15
        )
        return jsonify(r.json()), r.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 502


@app.route('/api/freezer/recipes/import-url', methods=['POST'])
def freezer_import_recipe():
    """Import a recipe from a URL via Tandoor: parse, create, attach image."""
    data = request.get_json()
    if not data or not data.get('url'):
        return jsonify({"error": "URL is required"}), 400

    session = _get_tandoor_session()
    headers = _tandoor_headers()
    source_url = data['url']

    try:
        # Step 1: Parse the URL with recipe-from-source
        r = session.post(
            f'{TANDOOR_URL}/api/recipe-from-source/',
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

        # Add keywords if present
        if recipe_data.get('keywords'):
            create_payload['keywords'] = recipe_data['keywords']

        # Step 3: Create the recipe
        r2 = session.post(
            f'{TANDOOR_URL}/api/recipe/',
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
            # Try to find a good image from the parsed images list
            images = parsed.get('images', [])
            for img in images:
                if isinstance(img, str) and ('recipe' in img.lower() or recipe_data.get('name', '').split()[0].lower() in img.lower()):
                    image_url = img
                    break
            if not image_url and images:
                # Use the first non-icon image
                for img in images:
                    if isinstance(img, str) and not ('icon' in img.lower() or 'logo' in img.lower() or 'profile' in img.lower()) and ('jpg' in img.lower() or 'jpeg' in img.lower() or 'png' in img.lower() or 'webp' in img.lower()):
                        image_url = img
                        break

        if image_url and recipe_id:
            try:
                import requests as _req
                img_resp = _req.get(image_url, timeout=15, headers={
                    'User-Agent': 'Mozilla/5.0 (compatible; recipe-import)'
                })
                if img_resp.status_code == 200:
                    import os
                    ext = os.path.splitext(image_url.split('?')[0])[1] or '.jpg'
                    filename = f"recipe_{recipe_id}{ext}"
                    csrf = session.cookies.get('csrftoken', '')
                    img_upload = session.put(
                        f'{TANDOOR_URL}/api/recipe/{recipe_id}/image/',
                        files={'image': (filename, img_resp.content, img_resp.headers.get('Content-Type', 'image/jpeg'))},
                        headers={
                            'X-CSRFToken': csrf,
                            'Referer': TANDOOR_URL + '/',
                        },
                        timeout=15
                    )
                    if img_upload.status_code not in (200, 204):
                        print(f"Image upload failed: {img_upload.status_code} - {img_upload.text[:200]}")
            except Exception as img_err:
                print(f"Failed to download/attach image: {img_err}")

        # Re-fetch the recipe to include image URL in response
        if recipe_id:
            try:
                r3 = session.get(f'{TANDOOR_URL}/api/recipe/{recipe_id}/', timeout=10)
                if r3.status_code == 200:
                    created = r3.json()
            except:
                pass

        return jsonify(created), 201

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 502


@app.route('/api/freezer/recipes/<int:recipe_id>', methods=['DELETE'])
def freezer_delete_recipe(recipe_id):
    """Delete a recipe from Tandoor."""
    try:
        r = _get_tandoor_session().delete(
            f'{TANDOOR_URL}/api/recipe/{recipe_id}/',
            headers=_tandoor_headers(),
            timeout=15
        )
        if r.status_code == 204:
            return jsonify({"deleted": True}), 200
        return jsonify(r.json() if r.text else {"error": "Delete failed"}), r.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 502


@app.route('/api/freezer/recipes/<int:recipe_id>/keywords', methods=['PUT'])
def freezer_update_recipe_keywords(recipe_id):
    """Update keywords/tags on a Tandoor recipe."""
    data = request.get_json()
    if not data or 'keywords' not in data:
        return jsonify({"error": "keywords array is required"}), 400
    try:
        # First get existing recipe to preserve other fields
        r = _get_tandoor_session().get(
            f'{TANDOOR_URL}/api/recipe/{recipe_id}/',
            timeout=15
        )
        if r.status_code != 200:
            return jsonify({"error": "Recipe not found"}), 404
        recipe = r.json()

        # Build keyword objects - Tandoor expects {name: str} for new, {id, name} for existing
        keyword_objects = []
        for kw in data['keywords']:
            if isinstance(kw, str):
                keyword_objects.append({"name": kw})
            else:
                keyword_objects.append(kw)

        # Patch the recipe with new keywords
        r2 = _get_tandoor_session().patch(
            f'{TANDOOR_URL}/api/recipe/{recipe_id}/',
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
            return _json.load(f)
    except (FileNotFoundError, _json.JSONDecodeError):
        return {"sessions": []}

def _save_sessions(data):
    with open(SESSIONS_FILE, 'w') as f:
        _json.dump(data, f, indent=2)


@app.route('/api/freezer/sessions', methods=['GET'])
def freezer_list_sessions():
    """List all prep sessions."""
    data = _load_sessions()
    return jsonify(data), 200


@app.route('/api/freezer/sessions', methods=['POST'])
def freezer_create_session():
    """Create a new prep session."""
    body = request.get_json()
    if not body or not body.get('name'):
        return jsonify({"error": "Session name is required"}), 400

    data = _load_sessions()
    session_id = str(_uuid.uuid4())[:8]
    session = {
        "id": session_id,
        "name": body['name'],
        "recipes": body.get('recipes', []),  # [{recipeId, multiplier, servings}]
        "shoppingList": None,
        "createdAt": _datetime.now().isoformat(),
        "status": "planning"
    }
    data["sessions"].append(session)
    _save_sessions(data)
    return jsonify(session), 201


@app.route('/api/freezer/sessions/<session_id>', methods=['PUT'])
def freezer_update_session(session_id):
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


@app.route('/api/freezer/sessions/<session_id>', methods=['DELETE'])
def freezer_delete_session(session_id):
    """Delete a prep session."""
    data = _load_sessions()
    data["sessions"] = [s for s in data["sessions"] if s["id"] != session_id]
    _save_sessions(data)
    return jsonify({"deleted": True}), 200


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
    # Remove common quantity-related prefixes
    for prefix in ['fresh ', 'dried ', 'ground ', 'large ', 'small ', 'medium ',
                   'minced ', 'chopped ', 'diced ', 'sliced ', 'whole ', 'crushed ']:
        if name.startswith(prefix):
            name = name[len(prefix):]
    return name.strip()


@app.route('/api/freezer/sessions/<session_id>/generate-list', methods=['POST'])
def freezer_generate_shopping_list(session_id):
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

    # Fetch recipe details from Tandoor and aggregate ingredients
    aggregated = {}  # {normalized_name: {name, amount, unit, category, recipes}}
    recipe_details = []  # For prep guide

    for entry in session["recipes"]:
        recipe_id = entry.get("recipeId")
        multiplier = entry.get("multiplier", 1)

        try:
            r = _get_tandoor_session().get(
                f'{TANDOOR_URL}/api/recipe/{recipe_id}/',
                timeout=15
            )
            if r.status_code != 200:
                continue
            recipe = r.json()
            recipe_name = recipe.get("name", f"Recipe {recipe_id}")

            # Collect recipe details for prep guide
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

                    # Track per-recipe ingredients for prep guide
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

    # Build prep guide: combine shared ingredients across recipes
    prep_guide = _build_prep_guide(aggregated, recipe_details)

    # Save to session
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
    # Shared ingredients (used in 2+ recipes)
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

    # Per-recipe instructions
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

@app.route('/api/freezer/sessions/<session_id>/check-item', methods=['PATCH'])
def freezer_check_item(session_id):
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
            return _json.load(f)
    except (FileNotFoundError, _json.JSONDecodeError):
        return {"items": []}

def _save_inventory(data):
    with open(INVENTORY_FILE, 'w') as f:
        _json.dump(data, f, indent=2)


@app.route('/api/freezer/inventory', methods=['GET'])
def freezer_get_inventory():
    """Get all inventory items."""
    return jsonify(_load_inventory()), 200


@app.route('/api/freezer/inventory', methods=['POST'])
def freezer_add_inventory():
    """Add or update an inventory item."""
    body = request.get_json()
    if not body or not body.get('name'):
        return jsonify({"error": "Item name is required"}), 400

    data = _load_inventory()
    name = body['name'].strip()
    quantity = body.get('quantity', 1)
    unit = body.get('unit', '')
    location = body.get('location', 'pantry')

    # Check if item exists (update) or new (add)
    for item in data["items"]:
        if item["name"].lower() == name.lower():
            item["quantity"] = quantity
            item["unit"] = unit
            item["location"] = location
            item["updatedAt"] = _datetime.now().isoformat()
            _save_inventory(data)
            return jsonify(item), 200

    new_item = {
        "name": name,
        "quantity": quantity,
        "unit": unit,
        "location": location,
        "addedAt": _datetime.now().isoformat()
    }
    data["items"].append(new_item)
    _save_inventory(data)
    return jsonify(new_item), 201


@app.route('/api/freezer/inventory/<path:item_name>', methods=['DELETE'])
def freezer_delete_inventory(item_name):
    """Remove an inventory item by name."""
    data = _load_inventory()
    original_len = len(data["items"])
    data["items"] = [i for i in data["items"] if i["name"].lower() != item_name.lower()]
    if len(data["items"]) == original_len:
        return jsonify({"error": "Item not found"}), 404
    _save_inventory(data)
    return jsonify({"deleted": True, "name": item_name}), 200


if __name__ == '__main__':
    if not SECRET_TOKEN:
        raise ValueError("COMMAND_SERVER_TOKEN environment variable not set. Please create a .env file.")
    app.run(host='0.0.0.0', port=5001)


