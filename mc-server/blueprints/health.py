"""Personal Health Tracking — weight, rowing, and fitness data."""
import os
import json
import uuid
from datetime import datetime

from flask import Blueprint, request, jsonify

bp = Blueprint('health', __name__)

HEALTH_DATA_DIR = '/opt/health-data'
WEIGHT_FILE = os.path.join(HEALTH_DATA_DIR, 'weight-log.json')
ROWING_FILE = os.path.join(HEALTH_DATA_DIR, 'rowing-log.json')

os.makedirs(HEALTH_DATA_DIR, exist_ok=True)


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


# --- Weight Tracking ---

@bp.route('/api/health/weight', methods=['GET'])
def get_weight():
    """Get weight log. Optional ?days=N to limit history."""
    entries = _load_json(WEIGHT_FILE)
    days = request.args.get('days', type=int)
    if days:
        cutoff = datetime.now().isoformat()[:10]
        from datetime import timedelta
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
        from datetime import timedelta
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


# --- Summary ---

@bp.route('/api/health/summary', methods=['GET'])
def health_summary():
    """Get a summary of latest health metrics."""
    weight_entries = _load_json(WEIGHT_FILE)
    rowing_entries = _load_json(ROWING_FILE)

    # Latest weight
    weight_entries.sort(key=lambda e: e.get('date', ''), reverse=True)
    latest_weight = weight_entries[0] if weight_entries else None

    # Weight trend (last 7 entries)
    weight_trend = weight_entries[:7]

    # Rowing stats this week
    from datetime import timedelta
    week_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
    month_ago = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    rowing_this_week = [e for e in rowing_entries if e.get('date', '') >= week_ago]
    rowing_this_month = [e for e in rowing_entries if e.get('date', '') >= month_ago]

    # Total meters this week/month
    week_meters = sum(e.get('meters', 0) or 0 for e in rowing_this_week)
    month_meters = sum(e.get('meters', 0) or 0 for e in rowing_this_month)

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
    })
