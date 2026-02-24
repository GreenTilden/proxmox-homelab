"""Personal Health Tracking — weight, rowing, habits, and fitness data."""
import os
import json
import uuid
from datetime import datetime, timedelta

from flask import Blueprint, request, jsonify

bp = Blueprint('health', __name__)

HEALTH_DATA_DIR = '/opt/health-data'
WEIGHT_FILE = os.path.join(HEALTH_DATA_DIR, 'weight-log.json')
ROWING_FILE = os.path.join(HEALTH_DATA_DIR, 'rowing-log.json')
HABITS_FILE = os.path.join(HEALTH_DATA_DIR, 'habits.json')
HABIT_LOG_FILE = os.path.join(HEALTH_DATA_DIR, 'habit-log.json')

os.makedirs(HEALTH_DATA_DIR, exist_ok=True)

DEFAULT_HABITS = [
    {'name': 'Rowing', 'category': 'movement', 'emoji': '\U0001F6A3',
     'durationMinutes': 30, 'defaultDays': [1, 3, 5], 'linkedTracker': 'rowing'},
    {'name': 'Walking Pad', 'category': 'movement', 'emoji': '\U0001F6B6',
     'durationMinutes': 20, 'defaultDays': [1, 2, 3, 4, 5], 'linkedTracker': None},
    {'name': 'Stretching', 'category': 'movement', 'emoji': '\U0001F9D8',
     'durationMinutes': 10, 'defaultDays': [1, 2, 3, 4, 5, 6, 7], 'linkedTracker': None},
    {'name': 'Hot Bath', 'category': 'relaxation', 'emoji': '\U0001F6C1',
     'durationMinutes': 25, 'defaultDays': [2, 4, 6], 'linkedTracker': None},
    {'name': 'Meditation', 'category': 'mindfulness', 'emoji': '\U0001F9E0',
     'durationMinutes': 10, 'defaultDays': [1, 2, 3, 4, 5, 6, 7], 'linkedTracker': None},
    {'name': 'Journaling', 'category': 'mindfulness', 'emoji': '\U0001F4D3',
     'durationMinutes': 10, 'defaultDays': [1, 3, 5], 'linkedTracker': None},
]


def _load_json(path):
    """Load a JSON file, returning [] if missing or invalid."""
    try:
        if os.path.exists(path):
            with open(path, 'r') as f:
                return json.load(f)
    except (json.JSONDecodeError, IOError):
        pass
    return []


def _save_json(path, data):
    """Save data to a JSON file."""
    with open(path, 'w') as f:
        json.dump(data, f, indent=2, default=str)


def _load_habits():
    """Load habits, seeding defaults if empty."""
    data = _load_json(HABITS_FILE)
    if isinstance(data, dict):
        habits = data.get('habits', [])
    else:
        habits = data if isinstance(data, list) else []

    if not habits:
        now = datetime.now().isoformat()
        habits = []
        for h in DEFAULT_HABITS:
            habits.append({
                'id': str(uuid.uuid4())[:8],
                'name': h['name'],
                'category': h['category'],
                'emoji': h['emoji'],
                'durationMinutes': h['durationMinutes'],
                'defaultDays': h['defaultDays'],
                'linkedTracker': h['linkedTracker'],
                'active': True,
                'createdAt': now,
            })
        _save_json(HABITS_FILE, {'habits': habits})
    return habits


def _load_habit_log():
    """Load habit log entries."""
    data = _load_json(HABIT_LOG_FILE)
    if isinstance(data, dict):
        return data.get('entries', [])
    return data if isinstance(data, list) else []


def _save_habit_log(entries):
    """Save habit log entries."""
    _save_json(HABIT_LOG_FILE, {'entries': entries})


def _auto_complete_linked_habit(tracker_name, date_str):
    """Auto-create a habit-log entry for a linked tracker if not already logged."""
    habits = _load_habits()
    linked = [h for h in habits if h.get('linkedTracker') == tracker_name and h.get('active')]
    if not linked:
        return
    habit = linked[0]
    entries = _load_habit_log()
    already = any(e.get('habitId') == habit['id'] and e.get('date') == date_str for e in entries)
    if already:
        return
    entries.append({
        'id': str(uuid.uuid4())[:8],
        'habitId': habit['id'],
        'date': date_str,
        'completedAt': datetime.now().isoformat(),
        'durationMinutes': habit.get('durationMinutes'),
        'notes': '',
        'source': 'auto',
    })
    _save_habit_log(entries)


# --- Weight Tracking ---

@bp.route('/api/health/weight', methods=['GET'])
def get_weight():
    """Get weight log. Optional ?days=N to limit history."""
    entries = _load_json(WEIGHT_FILE)
    days = request.args.get('days', type=int)
    if days:
        cutoff_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
        entries = [e for e in entries if e.get('date', '') >= cutoff_date]
    # Sort newest first
    entries.sort(key=lambda e: e.get('date', ''), reverse=True)
    return jsonify({'entries': entries, 'count': len(entries)})


@bp.route('/api/health/weight', methods=['POST'])
def add_weight():
    """Log a weight entry. Body: {weight, date?, unit?, bodyFat?, notes?}."""
    data = request.get_json(force=True) or {}
    weight = data.get('weight')
    if not weight:
        return jsonify({'error': 'weight is required'}), 400

    entry = {
        'id': str(uuid.uuid4())[:8],
        'weight': float(weight),
        'unit': data.get('unit', 'lbs'),
        'date': data.get('date') or datetime.now().strftime('%Y-%m-%d'),
        'time': datetime.now().strftime('%H:%M'),
        'bodyFat': data.get('bodyFat'),
        'notes': data.get('notes', ''),
        'createdAt': datetime.now().isoformat(),
    }

    entries = _load_json(WEIGHT_FILE)
    entries.append(entry)
    _save_json(WEIGHT_FILE, entries)

    return jsonify({'entry': entry}), 201


@bp.route('/api/health/weight/<entry_id>', methods=['DELETE'])
def delete_weight(entry_id):
    """Delete a weight entry by ID."""
    entries = _load_json(WEIGHT_FILE)
    before = len(entries)
    entries = [e for e in entries if e.get('id') != entry_id]
    if len(entries) == before:
        return jsonify({'error': 'not found'}), 404
    _save_json(WEIGHT_FILE, entries)
    return jsonify({'deleted': entry_id})


# --- Rowing Sessions ---

@bp.route('/api/health/rowing', methods=['GET'])
def get_rowing():
    """Get rowing session log. Optional ?days=N to limit history."""
    entries = _load_json(ROWING_FILE)
    days = request.args.get('days', type=int)
    if days:
        cutoff_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
        entries = [e for e in entries if e.get('date', '') >= cutoff_date]
    entries.sort(key=lambda e: e.get('date', ''), reverse=True)
    return jsonify({'entries': entries, 'count': len(entries)})


@bp.route('/api/health/rowing', methods=['POST'])
def add_rowing():
    """Log a rowing session. Body: {meters, minutes, date?, splitPace?, strokeRate?, calories?, notes?}."""
    data = request.get_json(force=True) or {}
    meters = data.get('meters')
    minutes = data.get('minutes')
    if not meters and not minutes:
        return jsonify({'error': 'meters or minutes required'}), 400

    entry = {
        'id': str(uuid.uuid4())[:8],
        'date': data.get('date') or datetime.now().strftime('%Y-%m-%d'),
        'meters': int(meters) if meters else None,
        'minutes': float(minutes) if minutes else None,
        'splitPace': data.get('splitPace', ''),
        'strokeRate': data.get('strokeRate'),
        'calories': data.get('calories'),
        'notes': data.get('notes', ''),
        'createdAt': datetime.now().isoformat(),
    }

    entries = _load_json(ROWING_FILE)
    entries.append(entry)
    _save_json(ROWING_FILE, entries)

    # Auto-complete linked rowing habit
    _auto_complete_linked_habit('rowing', entry['date'])

    return jsonify({'entry': entry}), 201


@bp.route('/api/health/rowing/<entry_id>', methods=['DELETE'])
def delete_rowing(entry_id):
    """Delete a rowing session by ID."""
    entries = _load_json(ROWING_FILE)
    before = len(entries)
    entries = [e for e in entries if e.get('id') != entry_id]
    if len(entries) == before:
        return jsonify({'error': 'not found'}), 404
    _save_json(ROWING_FILE, entries)
    return jsonify({'deleted': entry_id})


# --- Habit Definitions ---

@bp.route('/api/health/habits', methods=['GET'])
def get_habits():
    """List active habits. Auto-seeds defaults on first call."""
    habits = _load_habits()
    active = [h for h in habits if h.get('active', True)]
    return jsonify({'habits': active})


@bp.route('/api/health/habits', methods=['POST'])
def create_habit():
    """Create a habit definition."""
    data = request.get_json(force=True) or {}
    name = data.get('name', '').strip()
    if not name:
        return jsonify({'error': 'name is required'}), 400

    habit = {
        'id': str(uuid.uuid4())[:8],
        'name': name,
        'category': data.get('category', 'movement'),
        'emoji': data.get('emoji', '\u2B50'),
        'durationMinutes': int(data.get('durationMinutes', 15)),
        'defaultDays': data.get('defaultDays', [1, 2, 3, 4, 5, 6, 7]),
        'linkedTracker': data.get('linkedTracker'),
        'active': True,
        'createdAt': datetime.now().isoformat(),
    }

    habits = _load_habits()
    habits.append(habit)
    _save_json(HABITS_FILE, {'habits': habits})
    return jsonify({'habit': habit}), 201


@bp.route('/api/health/habits/<habit_id>', methods=['PUT'])
def update_habit(habit_id):
    """Update a habit definition."""
    data = request.get_json(force=True) or {}
    habits = _load_habits()
    habit = next((h for h in habits if h['id'] == habit_id), None)
    if not habit:
        return jsonify({'error': 'not found'}), 404

    for key in ('name', 'category', 'emoji', 'durationMinutes', 'defaultDays', 'linkedTracker', 'active'):
        if key in data:
            habit[key] = data[key]

    _save_json(HABITS_FILE, {'habits': habits})
    return jsonify({'habit': habit})


@bp.route('/api/health/habits/<habit_id>', methods=['DELETE'])
def delete_habit(habit_id):
    """Soft-delete a habit (set active: false)."""
    habits = _load_habits()
    habit = next((h for h in habits if h['id'] == habit_id), None)
    if not habit:
        return jsonify({'error': 'not found'}), 404
    habit['active'] = False
    _save_json(HABITS_FILE, {'habits': habits})
    return jsonify({'deleted': habit_id})


# --- Habit Log ---

@bp.route('/api/health/habit-log', methods=['GET'])
def get_habit_log():
    """Get habit log entries. Optional ?date=YYYY-MM-DD or ?days=N."""
    entries = _load_habit_log()
    date_filter = request.args.get('date')
    days = request.args.get('days', type=int)

    if date_filter:
        entries = [e for e in entries if e.get('date') == date_filter]
    elif days:
        cutoff = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
        entries = [e for e in entries if e.get('date', '') >= cutoff]

    entries.sort(key=lambda e: e.get('date', ''), reverse=True)
    return jsonify({'entries': entries, 'count': len(entries)})


@bp.route('/api/health/habit-log', methods=['POST'])
def log_habit():
    """Check off a habit. Body: {habitId, date?, durationMinutes?, notes?}. 409 if duplicate."""
    data = request.get_json(force=True) or {}
    habit_id = data.get('habitId')
    if not habit_id:
        return jsonify({'error': 'habitId is required'}), 400

    date_str = data.get('date') or datetime.now().strftime('%Y-%m-%d')
    entries = _load_habit_log()

    # Prevent duplicate check-off for same habit+date
    already = any(e.get('habitId') == habit_id and e.get('date') == date_str for e in entries)
    if already:
        return jsonify({'error': 'already logged for this date'}), 409

    entry = {
        'id': str(uuid.uuid4())[:8],
        'habitId': habit_id,
        'date': date_str,
        'completedAt': datetime.now().isoformat(),
        'durationMinutes': data.get('durationMinutes'),
        'notes': data.get('notes', ''),
        'source': 'manual',
    }

    entries.append(entry)
    _save_habit_log(entries)
    return jsonify({'entry': entry}), 201


@bp.route('/api/health/habit-log/<entry_id>', methods=['DELETE'])
def delete_habit_log(entry_id):
    """Un-check a habit (delete log entry)."""
    entries = _load_habit_log()
    before = len(entries)
    entries = [e for e in entries if e.get('id') != entry_id]
    if len(entries) == before:
        return jsonify({'error': 'not found'}), 404
    _save_habit_log(entries)
    return jsonify({'deleted': entry_id})


# --- Summary ---

@bp.route('/api/health/summary', methods=['GET'])
def health_summary():
    """Get a summary of latest health metrics including habits."""
    weight_entries = _load_json(WEIGHT_FILE)
    rowing_entries = _load_json(ROWING_FILE)

    # Latest weight
    weight_entries.sort(key=lambda e: e.get('date', ''), reverse=True)
    latest_weight = weight_entries[0] if weight_entries else None

    # Weight trend (last 7 entries)
    weight_trend = weight_entries[:7]

    # Rowing stats this week
    week_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
    month_ago = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    rowing_this_week = [e for e in rowing_entries if e.get('date', '') >= week_ago]
    rowing_this_month = [e for e in rowing_entries if e.get('date', '') >= month_ago]

    week_meters = sum(e.get('meters', 0) or 0 for e in rowing_this_week)
    month_meters = sum(e.get('meters', 0) or 0 for e in rowing_this_month)

    # Habit summary
    today = datetime.now().strftime('%Y-%m-%d')
    iso_weekday = datetime.now().isoweekday()  # 1=Mon .. 7=Sun
    habits = _load_habits()
    active_habits = [h for h in habits if h.get('active', True)]
    todays_habits = [h for h in active_habits if iso_weekday in h.get('defaultDays', [])]
    log_entries = _load_habit_log()
    todays_log = [e for e in log_entries if e.get('date') == today]
    completed_ids = {e['habitId'] for e in todays_log}
    completed_today = [h for h in todays_habits if h['id'] in completed_ids]

    suggested_minutes = sum(h.get('durationMinutes', 0) for h in todays_habits)
    completed_minutes = sum(h.get('durationMinutes', 0) for h in completed_today)

    # Weekly habit stats
    week_start = (datetime.now() - timedelta(days=datetime.now().weekday())).strftime('%Y-%m-%d')
    week_log = [e for e in log_entries if e.get('date', '') >= week_start]
    week_completed = len(week_log)
    # Total possible = sum of habits suggested per day this week (up to today)
    days_so_far = datetime.now().weekday() + 1  # Mon=1 .. Sun=7
    week_total_possible = 0
    for d in range(days_so_far):
        wd = d + 1  # ISO weekday: Mon=1
        week_total_possible += sum(1 for h in active_habits if wd in h.get('defaultDays', []))
    week_rate = round(week_completed / week_total_possible, 2) if week_total_possible else 0

    return jsonify({
        'latestWeight': latest_weight,
        'weightTrend': weight_trend,
        'rowingThisWeek': {
            'sessions': len(rowing_this_week),
            'totalMeters': week_meters,
        },
        'rowingThisMonth': {
            'sessions': len(rowing_this_month),
            'totalMeters': month_meters,
        },
        'totalWeightEntries': len(weight_entries),
        'totalRowingSessions': len(rowing_entries),
        'habitsToday': {
            'suggested': len(todays_habits),
            'completed': len(completed_today),
            'totalMinutes': suggested_minutes,
            'completedMinutes': completed_minutes,
        },
        'habitsThisWeek': {
            'totalPossible': week_total_possible,
            'completed': week_completed,
            'completionRate': week_rate,
        },
    })
