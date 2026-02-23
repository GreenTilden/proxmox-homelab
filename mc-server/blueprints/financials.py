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
REVENUE_FILE = os.path.join(FINANCIALS_DIR, 'revenue.json')
SCENARIOS_FILE = os.path.join(FINANCIALS_DIR, 'scenarios.json')
RD_LOG_FILE = os.path.join(FINANCIALS_DIR, 'rd-log.json')

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
            "id": "llc-filed",
            "label": "LLC Filed + EIN + Bank",
            "description": "Indiana LLC at inbiz.in.gov ($115), EIN (free, instant), business bank account",
            "status": "not-started",
            "phase": "foundation",
            "dependencies": [],
            "sortOrder": 1,
        },
        {
            "id": "savings-buffer",
            "label": "3-Month Savings Buffer",
            "description": "Build $20-30k runway (salary savings + Kiva $15k at 0%)",
            "status": "not-started",
            "phase": "foundation",
            "dependencies": [],
            "sortOrder": 2,
        },
        {
            "id": "health-insurance",
            "label": "Health Insurance Secured",
            "description": "ACA individual Silver plan ~$564/mo ($6,768/yr). Kids on Alissa's employer plan.",
            "status": "not-started",
            "phase": "foundation",
            "dependencies": [],
            "sortOrder": 3,
        },
        {
            "id": "eo-insurance",
            "label": "E&O + GL Insurance",
            "description": "Professional liability ($2,000/yr) + general liability ($1,000/yr). Required for consulting.",
            "status": "not-started",
            "phase": "foundation",
            "dependencies": ["llc-filed"],
            "sortOrder": 4,
        },
        {
            "id": "lilly-retainer",
            "label": "Lilly Retainer Confirmed",
            "description": "Rate ($8-15k/mo), scope, and hours confirmed — most critical gate",
            "status": "not-started",
            "phase": "foundation",
            "dependencies": [],
            "sortOrder": 5,
        },
        {
            "id": "proposal-accepted",
            "label": "At Least One Proposal Accepted",
            "description": "Biosero transition, Lilly direct, or GBGreg premium — need at least one signed",
            "status": "not-started",
            "phase": "foundation",
            "dependencies": [],
            "sortOrder": 6,
        },
        {
            "id": "notice-given",
            "label": "Notice Given",
            "description": "Give notice only after ALL other gates are completed. Target: Jul/Aug 2026.",
            "status": "not-started",
            "phase": "transition",
            "dependencies": ["savings-buffer", "health-insurance", "llc-filed", "eo-insurance", "lilly-retainer", "proposal-accepted"],
            "sortOrder": 7,
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


@bp.route('/api/financials/goals/seed', methods=['POST'])
def seed_goals():
    """Seed financial goals from the verified 2026 financial model."""
    data = _load_goals()
    if data.get('goals'):
        return jsonify({"message": "Goals already seeded", "count": len(data['goals'])}), 200

    # All targets verified against 2026 IRS brackets, OBBBA, Indiana DOR
    # See: Operation Darrentan - Financial Model.md
    defaults = [
        {
            "id": "annual-gross",
            "label": "Annual Gross Revenue",
            "target": 221000,
            "current": 0,
            "unit": "$",
            "color": "#22c55e",
        },
        {
            "id": "savings-buffer",
            "label": "3-Month Buffer",
            "target": 30000,
            "current": 0,
            "unit": "$",
            "color": "#3b82f6",
        },
        {
            "id": "tax-reserve",
            "label": "Quarterly Tax Reserve",
            "target": 10644,
            "current": 0,
            "unit": "$",
            "color": "#ef4444",
        },
        {
            "id": "health-insurance",
            "label": "Health Insurance (Annual)",
            "target": 6768,
            "current": 0,
            "unit": "$",
            "color": "#8b5cf6",
        },
        {
            "id": "solo-401k",
            "label": "Solo 401(k) Contributions",
            "target": 40000,
            "current": 0,
            "unit": "$",
            "color": "#f59e0b",
        },
        {
            "id": "business-insurance",
            "label": "E&O + GL Insurance",
            "target": 3000,
            "current": 0,
            "unit": "$",
            "color": "#6366f1",
        },
        {
            "id": "llc-setup",
            "label": "LLC + EIN + Bank",
            "target": 115,
            "current": 0,
            "unit": "$",
            "color": "#14b8a6",
        },
        {
            "id": "kiva-bridge",
            "label": "Kiva Bridge Loan (0%)",
            "target": 15000,
            "current": 0,
            "unit": "$",
            "color": "#06b6d4",
        },
    ]
    data['goals'] = [
        {**g, "createdAt": datetime.now().isoformat()} for g in defaults
    ]
    _save_goals(data)
    return jsonify({"message": "Seeded default goals", "count": len(defaults)}), 201


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

    # Updated with verified 2026 research (Feb 23)
    known_knowns = [
        {"title": "Monthly nut: ~$3.5-4k", "description": "Housing, bills, food, misc — base survival cost", "impact": "high"},
        {"title": "No non-compete", "description": "Legally clear to consult for any client immediately", "impact": "low"},
        {"title": "LLC: $115 Indiana filing", "description": "inbiz.in.gov, 1 business day. Separate from nanny payroll LLC.", "impact": "low"},
        {"title": "Baby: Mar 19, 2026", "description": "Paternity leave starts, execute plan after leave", "impact": "high"},
        {"title": "Target: $221k gross / $125-149k net", "description": "Verified tax model: 19.3% effective rate, $10.4k/mo take-home with $40k 401(k)", "impact": "high"},
        {"title": "Biosero rate: $125/hr", "description": "Established rate for transition consulting", "impact": "medium"},
        {"title": "Wife is a lawyer", "description": "Contract review, MSA drafting — no LegalZoom needed", "impact": "low"},
        {"title": "Health insurance: $564/mo", "description": "ACA Silver individual, unsubsidized. Enhanced credits expired Jan 2026 (OBBBA).", "impact": "medium"},
        {"title": "Tax structure: Year 1 sole prop, Year 2 S-Corp", "description": "S-Corp saves ~$9k/yr SE tax. File Form 2553 by Mar 15, 2027.", "impact": "medium"},
        {"title": "Kiva: $15k at 0% interest", "description": "National program active. Indy hub status uncertain — verify with LISC.", "impact": "medium"},
        {"title": "Marion County tax: 2.02%", "description": "Combined state+county: 4.97% (not the outdated 1.62% on some sites)", "impact": "low"},
        {"title": "Solo 401(k) max: $72k", "description": "2026 limit. Biggest tax shelter available. Open at Fidelity/Schwab.", "impact": "medium"},
        {"title": "SBIR/STTR: FROZEN", "description": "Expired Sept 2025. H.R.5100 passed House, stuck in Senate. Year 2+ play.", "impact": "low"},
    ]
    known_unknowns = [
        {"title": "Lilly retainer rate and terms", "description": "What rate? What scope? How many hours guaranteed?", "impact": "high", "linkedGateId": "lilly-retainer"},
        {"title": "Biosero consulting demand", "description": "Actual demand post-departure — pipeline uncertain", "impact": "medium"},
        {"title": "GBGreg willingness to pay", "description": "Would they pay $60-100k for phased rebuild as consulting?", "impact": "medium"},
        {"title": "Invoice payment timing", "description": "Net 30-60 creates cash flow gaps. Stagger billing + Kiva bridge.", "impact": "medium"},
        {"title": "ACA plan selection", "description": "Specific plan TBD — Anthem cheapest in IN. SEP triggers on job loss.", "impact": "low", "linkedGateId": "health-insurance"},
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


@bp.route('/api/financials/expenses/summary', methods=['GET'])
def expense_summary():
    """Monthly aggregates by category."""
    data = _load_expenses()
    expenses = data.get('expenses', [])
    month = request.args.get('month')  # YYYY-MM, defaults to current
    if not month:
        month = datetime.now().strftime('%Y-%m')

    monthly = [e for e in expenses if e.get('date', '').startswith(month)]
    by_category = {}
    for e in monthly:
        cat = e.get('category', 'other')
        by_category.setdefault(cat, 0)
        by_category[cat] += e.get('amount', 0)

    total = sum(by_category.values())
    business = sum(e.get('amount', 0) for e in monthly if e.get('classification') == 'business')
    personal = sum(e.get('amount', 0) for e in monthly if e.get('classification') == 'personal')

    return jsonify({
        "month": month,
        "byCategory": {k: round(v, 2) for k, v in sorted(by_category.items())},
        "total": round(total, 2),
        "businessTotal": round(business, 2),
        "personalTotal": round(personal, 2),
    }), 200


# ============================================================
# Revenue Streams
# ============================================================

def _load_revenue():
    return _load(REVENUE_FILE, 'streams')


def _save_revenue(data):
    _save(REVENUE_FILE, data)


@bp.route('/api/financials/revenue', methods=['GET'])
def list_revenue():
    data = _load_revenue()
    return jsonify({"streams": data.get('streams', [])}), 200


@bp.route('/api/financials/revenue', methods=['POST'])
def create_revenue():
    body = request.get_json()
    if not body or not body.get('name'):
        return jsonify({"error": "name is required"}), 400
    data = _load_revenue()
    stream = {
        "id": body.get('id') or _gen_id(),
        "name": body['name'],
        "type": body.get('type', 'hourly'),  # hourly | retainer | project
        "monthlyAmount": body.get('monthlyAmount', 0),
        "hourlyRate": body.get('hourlyRate'),
        "hoursPerMonth": body.get('hoursPerMonth'),
        "startMonth": body.get('startMonth'),  # YYYY-MM
        "endMonth": body.get('endMonth'),       # YYYY-MM or null (ongoing)
        "probability": body.get('probability', 1.0),  # 0-1
        "color": body.get('color'),
        "notes": body.get('notes', ''),
        "createdAt": datetime.now().isoformat(),
    }
    data.setdefault('streams', []).append(stream)
    _save_revenue(data)
    return jsonify(stream), 201


@bp.route('/api/financials/revenue/<stream_id>', methods=['PUT'])
def update_revenue(stream_id):
    body = request.get_json()
    if not body:
        return jsonify({"error": "Request body required"}), 400
    data = _load_revenue()
    for i, s in enumerate(data.get('streams', [])):
        if s['id'] == stream_id:
            for key in ('name', 'type', 'monthlyAmount', 'hourlyRate',
                        'hoursPerMonth', 'startMonth', 'endMonth',
                        'probability', 'color', 'notes'):
                if key in body:
                    s[key] = body[key]
            s['updatedAt'] = datetime.now().isoformat()
            data['streams'][i] = s
            _save_revenue(data)
            return jsonify(s), 200
    return jsonify({"error": "Revenue stream not found"}), 404


@bp.route('/api/financials/revenue/<stream_id>', methods=['DELETE'])
def delete_revenue(stream_id):
    data = _load_revenue()
    before = len(data.get('streams', []))
    data['streams'] = [s for s in data.get('streams', []) if s['id'] != stream_id]
    if len(data['streams']) == before:
        return jsonify({"error": "Revenue stream not found"}), 404
    _save_revenue(data)
    return jsonify({"deleted": True}), 200


@bp.route('/api/financials/revenue/seed', methods=['POST'])
def seed_revenue():
    data = _load_revenue()
    if data.get('streams'):
        return jsonify({"message": "Revenue already seeded", "count": len(data['streams'])}), 200

    # Revenue streams matching Financial Model Scenario A ($221k gross)
    defaults = [
        {
            "id": "biosero",
            "name": "Biosero Consulting",
            "type": "hourly",
            "monthlyAmount": 7813,
            "hourlyRate": 125,
            "hoursPerMonth": 65,
            "startMonth": "2026-08",
            "endMonth": None,
            "probability": 0.8,
            "color": "#22c55e",
            "notes": "Transition consulting, $125/hr, 15 hrs/wk = $93,750/yr",
        },
        {
            "id": "lilly",
            "name": "Lilly Direct Retainer",
            "type": "retainer",
            "monthlyAmount": 8000,
            "hourlyRate": None,
            "hoursPerMonth": None,
            "startMonth": "2026-08",
            "endMonth": None,
            "probability": 0.6,
            "color": "#ef4444",
            "notes": "Retainer $8k/mo base ($96k/yr). Could expand to $12-15k.",
        },
        {
            "id": "ai-rag",
            "name": "AI/RAG Consulting",
            "type": "hourly",
            "monthlyAmount": 2604,
            "hourlyRate": 125,
            "hoursPerMonth": 22,
            "startMonth": "2026-09",
            "endMonth": None,
            "probability": 0.4,
            "color": "#8b5cf6",
            "notes": "1-2 clients, $125/hr, 5 hrs/wk = $31,250/yr",
        },
        {
            "id": "gbgreg",
            "name": "GBGreg Premium Rebuild",
            "type": "project",
            "monthlyAmount": 13333,
            "hourlyRate": None,
            "hoursPerMonth": None,
            "startMonth": "2026-09",
            "endMonth": "2027-02",
            "probability": 0.3,
            "color": "#f59e0b",
            "notes": "$60-80k phased rebuild, ~$13k/mo over 5-6 months",
        },
    ]
    data['streams'] = [
        {**s, "createdAt": datetime.now().isoformat()} for s in defaults
    ]
    _save_revenue(data)
    return jsonify({"message": "Seeded default revenue", "count": len(defaults)}), 201


# ============================================================
# Scenarios & Projections
# ============================================================

def _load_scenarios():
    return _load(SCENARIOS_FILE, 'scenarios')


def _save_scenarios(data):
    _save(SCENARIOS_FILE, data)


@bp.route('/api/financials/scenarios', methods=['GET'])
def list_scenarios():
    data = _load_scenarios()
    return jsonify({"scenarios": data.get('scenarios', [])}), 200


@bp.route('/api/financials/scenarios', methods=['POST'])
def create_scenario():
    body = request.get_json()
    if not body or not body.get('name'):
        return jsonify({"error": "name is required"}), 400
    data = _load_scenarios()
    scenario = {
        "id": body.get('id') or _gen_id(),
        "name": body['name'],
        "description": body.get('description', ''),
        "streamIds": body.get('streamIds', []),
        "monthlyExpenses": body.get('monthlyExpenses', 4500),
        "taxRate": body.get('taxRate', 0.30),  # SE tax + income
        "color": body.get('color'),
        "createdAt": datetime.now().isoformat(),
    }
    data.setdefault('scenarios', []).append(scenario)
    _save_scenarios(data)
    return jsonify(scenario), 201


@bp.route('/api/financials/scenarios/<scenario_id>', methods=['PUT'])
def update_scenario(scenario_id):
    body = request.get_json()
    if not body:
        return jsonify({"error": "Request body required"}), 400
    data = _load_scenarios()
    for i, s in enumerate(data.get('scenarios', [])):
        if s['id'] == scenario_id:
            for key in ('name', 'description', 'streamIds',
                        'monthlyExpenses', 'taxRate', 'color'):
                if key in body:
                    s[key] = body[key]
            s['updatedAt'] = datetime.now().isoformat()
            data['scenarios'][i] = s
            _save_scenarios(data)
            return jsonify(s), 200
    return jsonify({"error": "Scenario not found"}), 404


@bp.route('/api/financials/scenarios/<scenario_id>', methods=['DELETE'])
def delete_scenario(scenario_id):
    data = _load_scenarios()
    before = len(data.get('scenarios', []))
    data['scenarios'] = [s for s in data.get('scenarios', []) if s['id'] != scenario_id]
    if len(data['scenarios']) == before:
        return jsonify({"error": "Scenario not found"}), 404
    _save_scenarios(data)
    return jsonify({"deleted": True}), 200


@bp.route('/api/financials/scenarios/<scenario_id>/projection', methods=['GET'])
def scenario_projection(scenario_id):
    """12-month cash flow projection for a scenario."""
    scenarios_data = _load_scenarios()
    scenario = None
    for s in scenarios_data.get('scenarios', []):
        if s['id'] == scenario_id:
            scenario = s
            break
    if not scenario:
        return jsonify({"error": "Scenario not found"}), 404

    revenue_data = _load_revenue()
    all_streams = {s['id']: s for s in revenue_data.get('streams', [])}

    monthly_expenses = scenario.get('monthlyExpenses', 4500)
    tax_rate = scenario.get('taxRate', 0.30)
    start_month = request.args.get('start', datetime.now().strftime('%Y-%m'))

    months = []
    cumulative = 0
    for i in range(12):
        # Calculate month string
        year = int(start_month[:4])
        month_num = int(start_month[5:7]) + i
        while month_num > 12:
            month_num -= 12
            year += 1
        month_str = f"{year}-{month_num:02d}"

        # Sum revenue from included streams
        gross_revenue = 0
        stream_breakdown = []
        for sid in scenario.get('streamIds', []):
            stream = all_streams.get(sid)
            if not stream:
                continue
            s_start = stream.get('startMonth', '2026-01')
            s_end = stream.get('endMonth')
            if s_start and month_str < s_start:
                continue
            if s_end and month_str > s_end:
                continue
            amount = stream.get('monthlyAmount', 0) * stream.get('probability', 1.0)
            gross_revenue += amount
            stream_breakdown.append({
                "id": sid,
                "name": stream['name'],
                "amount": round(amount, 2),
            })

        taxes = gross_revenue * tax_rate
        net_revenue = gross_revenue - taxes
        net_cash_flow = net_revenue - monthly_expenses
        cumulative += net_cash_flow

        months.append({
            "month": month_str,
            "grossRevenue": round(gross_revenue, 2),
            "taxes": round(taxes, 2),
            "netRevenue": round(net_revenue, 2),
            "expenses": monthly_expenses,
            "netCashFlow": round(net_cash_flow, 2),
            "cumulative": round(cumulative, 2),
            "streams": stream_breakdown,
        })

    # Summary stats
    total_gross = sum(m['grossRevenue'] for m in months)
    total_net = sum(m['netCashFlow'] for m in months)
    break_even_month = None
    for m in months:
        if m['cumulative'] >= 0 and break_even_month is None and m['netCashFlow'] > 0:
            break_even_month = m['month']

    return jsonify({
        "scenario": scenario['name'],
        "scenarioId": scenario_id,
        "months": months,
        "totalGrossRevenue": round(total_gross, 2),
        "totalNetCashFlow": round(total_net, 2),
        "breakEvenMonth": break_even_month,
        "annualizedGross": round(total_gross, 2),
    }), 200


@bp.route('/api/financials/scenarios/seed', methods=['POST'])
def seed_scenarios():
    data = _load_scenarios()
    if data.get('scenarios'):
        return jsonify({"message": "Scenarios already seeded", "count": len(data['scenarios'])}), 200

    # Tax rate 0.193 = verified 19.3% effective rate (SE + fed + IN + Marion)
    # Monthly expenses include insurance ($814) + business costs ($279) = ~$1,093 + household
    defaults = [
        {
            "id": "conservative",
            "name": "Conservative",
            "description": "Biosero only — $94k/yr, baseline survival",
            "streamIds": ["biosero"],
            "monthlyExpenses": 4500,
            "taxRate": 0.193,
            "color": "#6b7280",
        },
        {
            "id": "moderate",
            "name": "Moderate",
            "description": "Biosero + Lilly — $190k/yr, comfortable independence",
            "streamIds": ["biosero", "lilly"],
            "monthlyExpenses": 4500,
            "taxRate": 0.193,
            "color": "#3a7bd5",
        },
        {
            "id": "optimistic",
            "name": "Optimistic",
            "description": "All streams — $221k/yr target with AI/RAG clients",
            "streamIds": ["biosero", "lilly", "ai-rag"],
            "monthlyExpenses": 4500,
            "taxRate": 0.193,
            "color": "#22c55e",
        },
        {
            "id": "full-throttle",
            "name": "Full Throttle",
            "description": "All streams + GBGreg premium — max Year 1 revenue",
            "streamIds": ["biosero", "lilly", "ai-rag", "gbgreg"],
            "monthlyExpenses": 4500,
            "taxRate": 0.193,
            "color": "#f59e0b",
        },
    ]
    data['scenarios'] = [
        {**s, "createdAt": datetime.now().isoformat()} for s in defaults
    ]
    _save_scenarios(data)
    return jsonify({"message": "Seeded default scenarios", "count": len(defaults)}), 201


# ============================================================
# Rewards Tracking
# ============================================================

REWARD_CARDS = {
    "costco-executive": {
        "name": "Costco Executive",
        "rewardRate": 0.02,
        "categories": ["food", "childcare", "other"],
        "description": "2% annual rebate on all Costco purchases",
    },
    "costco-citi": {
        "name": "Costco Citi Card",
        "rates": {"food": 0.02, "transportation": 0.04, "other": 0.01},
        "description": "2% Costco, 4% gas, 3% restaurants, 1% other",
    },
    "microcenter": {
        "name": "Microcenter Credit",
        "rewardRate": 0.05,
        "categories": ["equipment"],
        "description": "5% store credit on tech purchases",
    },
}


@bp.route('/api/financials/rewards', methods=['GET'])
def get_rewards():
    return jsonify({"cards": REWARD_CARDS}), 200


@bp.route('/api/financials/rewards/estimate', methods=['GET'])
def rewards_estimate():
    """Calculate projected annual rewards from actual expense data."""
    data = _load_expenses()
    expenses = data.get('expenses', [])

    card_totals = {}
    for e in expenses:
        card = e.get('rewardCard')
        if not card or card not in REWARD_CARDS:
            continue
        card_totals.setdefault(card, {})
        cat = e.get('category', 'other')
        card_totals[card].setdefault(cat, 0)
        card_totals[card][cat] += e.get('amount', 0)

    # Calculate rewards
    estimates = []
    total_rewards = 0
    for card_id, cat_spending in card_totals.items():
        card_info = REWARD_CARDS[card_id]
        card_reward = 0

        if 'rewardRate' in card_info:
            # Flat rate card
            card_reward = sum(cat_spending.values()) * card_info['rewardRate']
        elif 'rates' in card_info:
            # Category-based rates
            for cat, amount in cat_spending.items():
                rate = card_info['rates'].get(cat, card_info['rates'].get('other', 0.01))
                card_reward += amount * rate

        total_rewards += card_reward
        estimates.append({
            "card": card_id,
            "name": card_info['name'],
            "spending": round(sum(cat_spending.values()), 2),
            "reward": round(card_reward, 2),
        })

    # Annualize based on data period
    dates = [e.get('date', '') for e in expenses if e.get('rewardCard')]
    if dates:
        date_objs = sorted([datetime.strptime(d, '%Y-%m-%d') for d in dates if d])
        if len(date_objs) >= 2:
            days_span = (date_objs[-1] - date_objs[0]).days or 1
            annualization_factor = 365 / days_span
        else:
            annualization_factor = 12  # assume 1 month of data
    else:
        annualization_factor = 1

    return jsonify({
        "estimates": estimates,
        "totalRewards": round(total_rewards, 2),
        "annualizedRewards": round(total_rewards * annualization_factor, 2),
        "annualizationFactor": round(annualization_factor, 2),
    }), 200


# ============================================================
# R&D Hour Log (for Indiana 15% + Federal Startup R&D credits)
# ============================================================

RD_CATEGORIES = [
    'Software Development',
    'AI/ML Development',
    'RAG Pipeline',
    'Automation Engineering',
    'System Integration',
    'Prototyping',
    'Architecture Design',
]


def _load_rd_log():
    return _load(RD_LOG_FILE, 'entries')


def _save_rd_log(data):
    _save(RD_LOG_FILE, data)


@bp.route('/api/financials/rd-log', methods=['GET'])
def list_rd_entries():
    """List R&D hour log entries. Optional filters: ?project=X, ?quarter=YYYY-QN, ?month=YYYY-MM."""
    data = _load_rd_log()
    entries = data.get('entries', [])

    project = request.args.get('project')
    quarter = request.args.get('quarter')  # e.g. 2026-Q3
    month = request.args.get('month')      # e.g. 2026-08

    if project:
        entries = [e for e in entries if e.get('project', '').lower() == project.lower()]
    if month:
        entries = [e for e in entries if e.get('date', '').startswith(month)]
    if quarter:
        # Parse quarter: 2026-Q3 → months 07,08,09
        try:
            qy, qn = quarter.split('-Q')
            q_int = int(qn)
            q_months = {1: ('01','02','03'), 2: ('04','05','06'),
                        3: ('07','08','09'), 4: ('10','11','12')}[q_int]
            prefixes = [f"{qy}-{m}" for m in q_months]
            entries = [e for e in entries if any(e.get('date','').startswith(p) for p in prefixes)]
        except (ValueError, KeyError):
            pass

    entries.sort(key=lambda e: e.get('date', ''), reverse=True)

    total_hours = sum(e.get('hours', 0) for e in entries)

    return jsonify({
        "entries": entries,
        "totalHours": round(total_hours, 2),
        "count": len(entries),
        "categories": RD_CATEGORIES,
    }), 200


@bp.route('/api/financials/rd-log', methods=['POST'])
def create_rd_entry():
    """Log R&D hours. Body: {date, hours, project, description, category?}."""
    body = request.get_json()
    if not body or not body.get('hours'):
        return jsonify({"error": "hours is required"}), 400

    data = _load_rd_log()
    entry = {
        "id": _gen_id(),
        "date": body.get('date', datetime.now().strftime('%Y-%m-%d')),
        "hours": round(float(body['hours']), 2),
        "project": body.get('project', ''),
        "description": body.get('description', ''),
        "category": body.get('category', 'Software Development'),
        "createdAt": datetime.now().isoformat(),
    }
    data.setdefault('entries', []).append(entry)
    _save_rd_log(data)
    return jsonify(entry), 201


@bp.route('/api/financials/rd-log/<entry_id>', methods=['DELETE'])
def delete_rd_entry(entry_id):
    data = _load_rd_log()
    before = len(data.get('entries', []))
    data['entries'] = [e for e in data.get('entries', []) if e['id'] != entry_id]
    if len(data['entries']) == before:
        return jsonify({"error": "Entry not found"}), 404
    _save_rd_log(data)
    return jsonify({"deleted": True}), 200


@bp.route('/api/financials/rd-log/summary', methods=['GET'])
def rd_summary():
    """Quarterly aggregation for tax filing. Returns hours by quarter, project, and category."""
    data = _load_rd_log()
    entries = data.get('entries', [])

    by_quarter = {}
    by_project = {}
    by_category = {}

    for e in entries:
        hours = e.get('hours', 0)
        date = e.get('date', '')
        project = e.get('project', 'Unspecified')
        category = e.get('category', 'Other')

        # Quarter calculation
        if len(date) >= 7:
            year = date[:4]
            month = int(date[5:7])
            q = (month - 1) // 3 + 1
            qkey = f"{year}-Q{q}"
            by_quarter.setdefault(qkey, 0)
            by_quarter[qkey] += hours

        by_project.setdefault(project, 0)
        by_project[project] += hours

        by_category.setdefault(category, 0)
        by_category[category] += hours

    total_hours = sum(e.get('hours', 0) for e in entries)

    # Estimate credit value (Indiana 15% on qualifying expenses, rough $125/hr imputed rate)
    imputed_rd_spend = total_hours * 125
    estimated_indiana_credit = round(imputed_rd_spend * 0.15, 2)

    return jsonify({
        "totalHours": round(total_hours, 2),
        "totalEntries": len(entries),
        "byQuarter": {k: round(v, 2) for k, v in sorted(by_quarter.items())},
        "byProject": {k: round(v, 2) for k, v in sorted(by_project.items(), key=lambda x: -x[1])},
        "byCategory": {k: round(v, 2) for k, v in sorted(by_category.items(), key=lambda x: -x[1])},
        "imputedRdSpend": round(imputed_rd_spend, 2),
        "estimatedIndianaCreditAt15Pct": estimated_indiana_credit,
    }), 200
