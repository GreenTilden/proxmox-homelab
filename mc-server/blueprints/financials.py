"""Operation Darrentan — financial planning: gates, timeline, goals, risks, expenses."""
import os
import json
import uuid
from datetime import datetime

from flask import Blueprint, request, jsonify

bp = Blueprint('financials', __name__)

FINANCIALS_DIR = '/opt/financials'
GATES_FILE = os.path.join(FINANCIALS_DIR, 'gates.json')
TIMELINE_FILE = os.path.join(FINANCIALS_DIR, 'timeline.json')
GOALS_FILE = os.path.join(FINANCIALS_DIR, 'goals.json')
RISKS_FILE = os.path.join(FINANCIALS_DIR, 'risks.json')
EXPENSES_FILE = os.path.join(FINANCIALS_DIR, 'expenses.json')

os.makedirs(FINANCIALS_DIR, exist_ok=True)


# --- JSON helpers ---

def _load(filepath, default_key='items'):
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {default_key: []}


def _save(filepath, data):
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)


def _gen_id():
    return str(uuid.uuid4())[:8]


# ============================================================
# Decision Gates
# ============================================================

def _load_gates():
    return _load(GATES_FILE, 'gates')


def _save_gates(data):
    _save(GATES_FILE, data)


@bp.route('/api/financials/gates', methods=['GET'])
def list_gates():
    data = _load_gates()
    gates = data.get('gates', [])
    # Compute dependency status for each gate
    completed_ids = {g['id'] for g in gates if g.get('status') == 'completed'}
    for g in gates:
        deps = g.get('dependencies', [])
        g['depsReady'] = all(d in completed_ids for d in deps)
    return jsonify({"gates": gates}), 200


@bp.route('/api/financials/gates', methods=['POST'])
def create_gate():
    body = request.get_json()
    if not body or not body.get('label'):
        return jsonify({"error": "label is required"}), 400
    data = _load_gates()
    gate = {
        "id": body.get('id') or _gen_id(),
        "label": body['label'],
        "description": body.get('description', ''),
        "status": body.get('status', 'not-started'),
        "phase": body.get('phase', 'foundation'),
        "dependencies": body.get('dependencies', []),
        "evidence": body.get('evidence'),
        "sortOrder": body.get('sortOrder', len(data.get('gates', [])) + 1),
        "createdAt": datetime.now().isoformat(),
    }
    data.setdefault('gates', []).append(gate)
    _save_gates(data)
    return jsonify(gate), 201


@bp.route('/api/financials/gates/<gate_id>', methods=['PUT'])
def update_gate(gate_id):
    body = request.get_json()
    if not body:
        return jsonify({"error": "Request body required"}), 400
    data = _load_gates()
    for i, g in enumerate(data.get('gates', [])):
        if g['id'] == gate_id:
            for key in ('label', 'description', 'status', 'phase',
                        'dependencies', 'evidence', 'sortOrder'):
                if key in body:
                    g[key] = body[key]
            g['updatedAt'] = datetime.now().isoformat()
            data['gates'][i] = g
            _save_gates(data)
            return jsonify(g), 200
    return jsonify({"error": "Gate not found"}), 404


@bp.route('/api/financials/gates/seed', methods=['POST'])
def seed_gates():
    data = _load_gates()
    if data.get('gates'):
        return jsonify({"message": "Gates already seeded", "count": len(data['gates'])}), 200

    defaults = [
        {
            "id": "savings-buffer",
            "label": "3-Month Savings Buffer",
            "description": "Build $15k emergency runway before giving notice",
            "status": "not-started",
            "phase": "foundation",
            "dependencies": [],
            "sortOrder": 1,
        },
        {
            "id": "health-insurance",
            "label": "Health Insurance Secured",
            "description": "Marketplace, COBRA, or wife's employer plan confirmed",
            "status": "not-started",
            "phase": "foundation",
            "dependencies": [],
            "sortOrder": 2,
        },
        {
            "id": "llc-filed",
            "label": "LLC Filed",
            "description": "Indiana LLC at inbiz.in.gov ($95), separate from nanny payroll LLC",
            "status": "not-started",
            "phase": "foundation",
            "dependencies": [],
            "sortOrder": 3,
        },
        {
            "id": "lilly-retainer",
            "label": "Lilly Retainer Confirmed",
            "description": "Rate, scope, and hours guaranteed — most critical gate",
            "status": "not-started",
            "phase": "foundation",
            "dependencies": [],
            "sortOrder": 4,
        },
        {
            "id": "notice-given",
            "label": "Notice Given",
            "description": "Give notice only after ALL other gates are completed",
            "status": "not-started",
            "phase": "transition",
            "dependencies": ["savings-buffer", "health-insurance", "llc-filed", "lilly-retainer"],
            "sortOrder": 5,
        },
    ]
    data['gates'] = defaults
    _save_gates(data)
    return jsonify({"message": "Seeded default gates", "count": len(defaults)}), 201


# ============================================================
# Timeline / Milestones
# ============================================================

def _load_timeline():
    return _load(TIMELINE_FILE, 'milestones')


def _save_timeline(data):
    _save(TIMELINE_FILE, data)


@bp.route('/api/financials/timeline', methods=['GET'])
def list_milestones():
    data = _load_timeline()
    return jsonify({"milestones": data.get('milestones', [])}), 200


@bp.route('/api/financials/timeline', methods=['POST'])
def create_milestone():
    body = request.get_json()
    if not body or not body.get('label'):
        return jsonify({"error": "label is required"}), 400
    data = _load_timeline()
    milestone = {
        "id": body.get('id') or _gen_id(),
        "label": body['label'],
        "description": body.get('description', ''),
        "phase": body.get('phase', 'foundation'),
        "targetDate": body.get('targetDate'),
        "status": body.get('status', 'upcoming'),
        "sortOrder": body.get('sortOrder', len(data.get('milestones', [])) + 1),
        "createdAt": datetime.now().isoformat(),
    }
    data.setdefault('milestones', []).append(milestone)
    _save_timeline(data)
    return jsonify(milestone), 201


@bp.route('/api/financials/timeline/<milestone_id>', methods=['PUT'])
def update_milestone(milestone_id):
    body = request.get_json()
    if not body:
        return jsonify({"error": "Request body required"}), 400
    data = _load_timeline()
    for i, m in enumerate(data.get('milestones', [])):
        if m['id'] == milestone_id:
            for key in ('label', 'description', 'phase', 'targetDate', 'status', 'sortOrder'):
                if key in body:
                    m[key] = body[key]
            m['updatedAt'] = datetime.now().isoformat()
            data['milestones'][i] = m
            _save_timeline(data)
            return jsonify(m), 200
    return jsonify({"error": "Milestone not found"}), 404


@bp.route('/api/financials/timeline/<milestone_id>', methods=['DELETE'])
def delete_milestone(milestone_id):
    data = _load_timeline()
    before = len(data.get('milestones', []))
    data['milestones'] = [m for m in data.get('milestones', []) if m['id'] != milestone_id]
    if len(data['milestones']) == before:
        return jsonify({"error": "Milestone not found"}), 404
    _save_timeline(data)
    return jsonify({"deleted": True}), 200


# ============================================================
# Goals (server-persisted, migrated from localStorage)
# ============================================================

def _load_goals():
    return _load(GOALS_FILE, 'goals')


def _save_goals(data):
    _save(GOALS_FILE, data)


@bp.route('/api/financials/goals', methods=['GET'])
def list_goals():
    data = _load_goals()
    return jsonify({"goals": data.get('goals', [])}), 200


@bp.route('/api/financials/goals', methods=['POST'])
def create_goal():
    body = request.get_json()
    if not body or not body.get('label'):
        return jsonify({"error": "label is required"}), 400
    data = _load_goals()
    goal = {
        "id": body.get('id') or _gen_id(),
        "label": body['label'],
        "target": body.get('target', 0),
        "current": body.get('current', 0),
        "unit": body.get('unit', '$'),
        "color": body.get('color'),
        "createdAt": datetime.now().isoformat(),
    }
    data.setdefault('goals', []).append(goal)
    _save_goals(data)
    return jsonify(goal), 201


@bp.route('/api/financials/goals/<goal_id>', methods=['PUT'])
def update_goal(goal_id):
    body = request.get_json()
    if not body:
        return jsonify({"error": "Request body required"}), 400
    data = _load_goals()
    for i, g in enumerate(data.get('goals', [])):
        if g['id'] == goal_id:
            for key in ('label', 'target', 'current', 'unit', 'color'):
                if key in body:
                    g[key] = body[key]
            g['updatedAt'] = datetime.now().isoformat()
            data['goals'][i] = g
            _save_goals(data)
            return jsonify(g), 200
    return jsonify({"error": "Goal not found"}), 404


@bp.route('/api/financials/goals/<goal_id>', methods=['DELETE'])
def delete_goal(goal_id):
    data = _load_goals()
    before = len(data.get('goals', []))
    data['goals'] = [g for g in data.get('goals', []) if g['id'] != goal_id]
    if len(data['goals']) == before:
        return jsonify({"error": "Goal not found"}), 404
    _save_goals(data)
    return jsonify({"deleted": True}), 200


# ============================================================
# Risk Board (Kanban)
# ============================================================

def _load_risks():
    return _load(RISKS_FILE, 'risks')


def _save_risks(data):
    _save(RISKS_FILE, data)


@bp.route('/api/financials/risks', methods=['GET'])
def list_risks():
    data = _load_risks()
    risks = data.get('risks', [])
    # Optional column filter
    col = request.args.get('column')
    if col:
        risks = [r for r in risks if r.get('column') == col]
    return jsonify({"risks": risks}), 200


@bp.route('/api/financials/risks', methods=['POST'])
def create_risk():
    body = request.get_json()
    if not body or not body.get('title'):
        return jsonify({"error": "title is required"}), 400
    data = _load_risks()
    risk = {
        "id": body.get('id') or _gen_id(),
        "title": body['title'],
        "description": body.get('description', ''),
        "column": body.get('column', 'known-unknown'),
        "phase": body.get('phase', 'foundation'),
        "impact": body.get('impact', 'medium'),
        "mitigation": body.get('mitigation'),
        "linkedGateId": body.get('linkedGateId'),
        "createdAt": datetime.now().isoformat(),
    }
    data.setdefault('risks', []).append(risk)
    _save_risks(data)
    return jsonify(risk), 201


@bp.route('/api/financials/risks/<risk_id>', methods=['PUT'])
def update_risk(risk_id):
    body = request.get_json()
    if not body:
        return jsonify({"error": "Request body required"}), 400
    data = _load_risks()
    for i, r in enumerate(data.get('risks', [])):
        if r['id'] == risk_id:
            for key in ('title', 'description', 'column', 'phase',
                        'impact', 'mitigation', 'linkedGateId'):
                if key in body:
                    r[key] = body[key]
            r['updatedAt'] = datetime.now().isoformat()
            data['risks'][i] = r
            _save_risks(data)
            return jsonify(r), 200
    return jsonify({"error": "Risk not found"}), 404


@bp.route('/api/financials/risks/<risk_id>', methods=['DELETE'])
def delete_risk(risk_id):
    data = _load_risks()
    before = len(data.get('risks', []))
    data['risks'] = [r for r in data.get('risks', []) if r['id'] != risk_id]
    if len(data['risks']) == before:
        return jsonify({"error": "Risk not found"}), 404
    _save_risks(data)
    return jsonify({"deleted": True}), 200


@bp.route('/api/financials/risks/seed', methods=['POST'])
def seed_risks():
    data = _load_risks()
    if data.get('risks'):
        return jsonify({"message": "Risks already seeded", "count": len(data['risks'])}), 200

    known_knowns = [
        {"title": "Monthly nut: ~$3.5-4k", "description": "Housing, bills, food, misc — base survival cost", "impact": "high"},
        {"title": "No non-compete", "description": "Legally clear to consult for any client immediately", "impact": "low"},
        {"title": "LLC: $95 Indiana filing", "description": "inbiz.in.gov, separate from nanny payroll LLC", "impact": "low"},
        {"title": "Baby: Mar 19, 2026", "description": "Paternity leave starts, execute plan after leave", "impact": "high"},
        {"title": "Target: $150k net / $215-225k gross", "description": "Revenue target for independence", "impact": "high"},
        {"title": "Biosero rate: $125/hr", "description": "Established rate for transition consulting", "impact": "medium"},
        {"title": "Wife is a lawyer", "description": "Contract review, MSA drafting — no LegalZoom needed", "impact": "low"},
    ]
    known_unknowns = [
        {"title": "Lilly retainer rate and terms", "description": "What rate? What scope? How many hours guaranteed?", "impact": "high", "linkedGateId": "lilly-retainer"},
        {"title": "Health insurance cost", "description": "Marketplace vs COBRA vs wife's employer — need quotes", "impact": "high", "linkedGateId": "health-insurance"},
        {"title": "Biosero consulting demand", "description": "Actual demand post-departure — pipeline uncertain", "impact": "medium"},
        {"title": "GBGreg willingness to pay", "description": "Would they pay $60-100k for phased rebuild as consulting?", "impact": "medium"},
        {"title": "SBA loan terms", "description": "E-brake contingency — terms and timeline if needed", "impact": "low"},
        {"title": "LLC tax structure", "description": "S-corp election? Tax implications need CPA input", "impact": "medium"},
        {"title": "Contracting infrastructure", "description": "MSA template, W-9, business insurance ($500-1500/yr E&O)", "impact": "medium"},
    ]

    risks = []
    for item in known_knowns:
        risks.append({
            "id": _gen_id(),
            "title": item["title"],
            "description": item["description"],
            "column": "known-known",
            "phase": "foundation",
            "impact": item["impact"],
            "mitigation": None,
            "linkedGateId": item.get("linkedGateId"),
            "createdAt": datetime.now().isoformat(),
        })
    for item in known_unknowns:
        risks.append({
            "id": _gen_id(),
            "title": item["title"],
            "description": item["description"],
            "column": "known-unknown",
            "phase": "foundation",
            "impact": item["impact"],
            "mitigation": None,
            "linkedGateId": item.get("linkedGateId"),
            "createdAt": datetime.now().isoformat(),
        })

    data['risks'] = risks
    _save_risks(data)
    return jsonify({"message": "Seeded default risks", "count": len(risks)}), 201


# ============================================================
# Expenses
# ============================================================

EXPENSE_CATEGORIES = [
    {"id": "housing", "label": "Housing", "icon": "🏠"},
    {"id": "insurance", "label": "Insurance", "icon": "🛡️"},
    {"id": "food", "label": "Food & Grocery", "icon": "🛒"},
    {"id": "medical", "label": "Medical / Rx", "icon": "💊"},
    {"id": "equipment", "label": "Equipment / Tech", "icon": "💻"},
    {"id": "legal", "label": "Legal / Filing", "icon": "📋"},
    {"id": "transportation", "label": "Transportation", "icon": "🚗"},
    {"id": "childcare", "label": "Childcare", "icon": "👶"},
    {"id": "subscriptions", "label": "Subscriptions", "icon": "📦"},
    {"id": "utilities", "label": "Utilities", "icon": "⚡"},
    {"id": "other", "label": "Other", "icon": "📌"},
]


def _load_expenses():
    return _load(EXPENSES_FILE, 'expenses')


def _save_expenses(data):
    _save(EXPENSES_FILE, data)


@bp.route('/api/financials/categories', methods=['GET'])
def list_categories():
    return jsonify({"categories": EXPENSE_CATEGORIES}), 200


@bp.route('/api/financials/expenses', methods=['GET'])
def list_expenses():
    data = _load_expenses()
    expenses = data.get('expenses', [])
    # Filters
    month = request.args.get('month')  # YYYY-MM
    category = request.args.get('category')
    classification = request.args.get('classification')

    if month:
        expenses = [e for e in expenses if e.get('date', '').startswith(month)]
    if category:
        expenses = [e for e in expenses if e.get('category') == category]
    if classification:
        expenses = [e for e in expenses if e.get('classification') == classification]

    # Sort by date descending
    expenses.sort(key=lambda e: e.get('date', ''), reverse=True)

    # Compute totals
    total = sum(e.get('amount', 0) for e in expenses)
    business_total = sum(e.get('amount', 0) for e in expenses if e.get('classification') == 'business')
    personal_total = sum(e.get('amount', 0) for e in expenses if e.get('classification') == 'personal')

    return jsonify({
        "expenses": expenses,
        "total": round(total, 2),
        "businessTotal": round(business_total, 2),
        "personalTotal": round(personal_total, 2),
        "count": len(expenses),
    }), 200


@bp.route('/api/financials/expenses', methods=['POST'])
def create_expense():
    body = request.get_json()
    if not body or not body.get('amount'):
        return jsonify({"error": "amount is required"}), 400
    data = _load_expenses()
    expense = {
        "id": _gen_id(),
        "date": body.get('date', datetime.now().strftime('%Y-%m-%d')),
        "amount": round(float(body['amount']), 2),
        "category": body.get('category', 'other'),
        "classification": body.get('classification', 'personal'),
        "description": body.get('description', ''),
        "vendor": body.get('vendor', ''),
        "rewardCard": body.get('rewardCard'),
        "createdAt": datetime.now().isoformat(),
    }
    data.setdefault('expenses', []).append(expense)
    _save_expenses(data)
    return jsonify(expense), 201
