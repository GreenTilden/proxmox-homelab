"""Today aggregation endpoint — daily briefing data for the dashboard."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta
from xml.etree import ElementTree as ET

import requests as http_requests
from flask import Blueprint, jsonify

from .shared import (CONFIG, nextcloud_auth, nextcloud_configured,
                     caldav_url, parse_ical_events, parse_ical_todos, parse_date)
from .health import (_load_habits, _load_habit_log, _load_json,
                     _load_family_scores, _family_score_streak,
                     WEIGHT_FILE, ROWING_FILE)

bp = Blueprint('today', __name__)

# --- Pillar Classification ---

CATEGORY_TO_PILLAR = {
    # Personal
    'health': 'personal', 'fitness': 'personal', 'personal': 'personal',
    'wellness': 'personal', 'mindfulness': 'personal', 'journal': 'personal',
    'learning': 'personal', 'reading': 'personal', 'meditation': 'personal',
    # Professional
    'work': 'professional', 'professional': 'professional', 'business': 'professional',
    'consulting': 'professional', 'biosero': 'professional', 'lilly': 'professional',
    'gbgreg': 'professional', 'dev': 'professional', 'development': 'professional',
    'meeting': 'professional', 'r&d': 'professional',
    # Domestic
    'domestic': 'domestic', 'home': 'domestic', 'family': 'domestic',
    'baby': 'domestic', 'oliver': 'domestic', 'meal': 'domestic',
    'freezer': 'domestic', 'cooking': 'domestic', 'cleaning': 'domestic',
    'maintenance': 'domestic', 'errand': 'domestic', 'shopping': 'domestic',
}

TITLE_KEYWORDS_PILLAR = {
    'professional': ['standup', 'sprint', 'retro', 'deploy', 'release',
                     'code review', 'pr review', 'client', 'invoice',
                     'biosero', 'lilly', 'gbgreg', 'consulting'],
    'domestic': ['grocery', 'doctor', 'pediatr', 'daycare', 'nanny',
                 'diaper', 'formula', 'laundry', 'dishes', 'vacuum',
                 'meal prep', 'freezer', 'oliver', 'alissa', 'baby'],
    'personal': ['workout', 'rowing', 'meditat', 'journal', 'read',
                 'stretch', 'walk', 'therapy', 'bath'],
}


def classify_pillar(categories, title=''):
    """Classify an item into a pillar based on categories then title keywords."""
    for cat in (categories or []):
        pillar = CATEGORY_TO_PILLAR.get(cat.lower().strip())
        if pillar:
            return pillar
    title_lower = (title or '').lower()
    for pillar, keywords in TITLE_KEYWORDS_PILLAR.items():
        if any(kw in title_lower for kw in keywords):
            return pillar
    return 'personal'


# --- Data Fetchers ---

def _fetch_calendar_events(today_str):
    """Fetch today's calendar events from Nextcloud CalDAV."""
    if not nextcloud_configured():
        return []

    start = today_str.replace('-', '') + 'T000000Z'
    end_date = (datetime.strptime(today_str, '%Y-%m-%d') + timedelta(days=1))
    end = end_date.strftime('%Y%m%dT%H%M%SZ')

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
            "REPORT", caldav_url(),
            data=report_body,
            headers={"Content-Type": "application/xml; charset=utf-8", "Depth": "1"},
            auth=nextcloud_auth(), timeout=10
        )
        if r.status_code not in (200, 207):
            return []

        root = ET.fromstring(r.text)
        ns = {"D": "DAV:", "C": "urn:ietf:params:xml:ns:caldav"}
        events = []
        for response in root.findall(".//D:response", ns):
            cal_data_el = response.find(".//C:calendar-data", ns)
            if cal_data_el is not None and cal_data_el.text:
                for ev in parse_ical_events(cal_data_el.text):
                    cats = ev.get('categories', [])
                    title = ev.get('summary', 'Untitled')
                    events.append({
                        'id': ev.get('uid', ''),
                        'title': title,
                        'startDate': parse_date(ev.get('dtstart', '')),
                        'endDate': parse_date(ev.get('dtend', '')),
                        'allDay': ev.get('allDay', False),
                        'category': cats[0] if cats else 'personal',
                        'pillar': classify_pillar(cats, title),
                    })
        events.sort(key=lambda e: (not e['allDay'], e.get('startDate') or ''))
        return events
    except Exception:
        return []


def _fetch_tasks_due(today_str):
    """Fetch incomplete tasks due today or overdue."""
    if not nextcloud_configured():
        return []

    tasks_calendar = CONFIG['nextcloud_tasks_calendar']
    report_body = """<?xml version="1.0" encoding="utf-8" ?>
<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop>
    <D:getetag/>
    <C:calendar-data/>
  </D:prop>
  <C:filter>
    <C:comp-filter name="VCALENDAR">
      <C:comp-filter name="VTODO"/>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>"""

    try:
        r = http_requests.request(
            "REPORT", caldav_url(tasks_calendar),
            data=report_body,
            headers={"Content-Type": "application/xml; charset=utf-8", "Depth": "1"},
            auth=nextcloud_auth(), timeout=10
        )
        if r.status_code not in (200, 207):
            return []

        root = ET.fromstring(r.text)
        ns = {"D": "DAV:", "C": "urn:ietf:params:xml:ns:caldav"}
        tasks = []
        for response in root.findall(".//D:response", ns):
            cal_data_el = response.find(".//C:calendar-data", ns)
            if cal_data_el is not None and cal_data_el.text:
                for todo in parse_ical_todos(cal_data_el.text):
                    status = todo.get('status', 'NEEDS-ACTION')
                    if status == 'COMPLETED':
                        continue
                    due_raw = todo.get('due', '')
                    due_parsed = parse_date(due_raw)
                    # Include tasks with no due date, due today, or overdue
                    if due_parsed:
                        due_date = due_parsed[:10]
                        if due_date > today_str:
                            continue
                    cats = todo.get('categories', [])
                    summary = todo.get('summary', '')
                    tasks.append({
                        'uid': todo.get('uid', ''),
                        'summary': summary,
                        'status': status,
                        'priority': todo.get('priority', 0),
                        'due': due_parsed,
                        'categories': cats,
                        'pillar': classify_pillar(cats, summary),
                    })
        tasks.sort(key=lambda t: (t.get('priority') or 99, t.get('due') or '9999'))
        return tasks
    except Exception:
        return []


def _fetch_habits(today_str, iso_weekday):
    """Load habits for today and their completion status."""
    habits = _load_habits()
    active = [h for h in habits if h.get('active', True)]
    todays = [h for h in active if iso_weekday in h.get('defaultDays', [])]

    log = _load_habit_log()
    todays_log = [e for e in log if e.get('date') == today_str]
    completed_ids = [e['habitId'] for e in todays_log]

    suggested = [{
        'id': h['id'],
        'name': h['name'],
        'emoji': h.get('emoji', ''),
        'durationMinutes': h.get('durationMinutes', 0),
        'category': h.get('category', ''),
    } for h in todays]

    return {
        'suggested': suggested,
        'completed': completed_ids,
        'log': todays_log,
    }


def _fetch_health_snapshot(today_str):
    """Get latest weight, rowing count this week, and family time score."""
    weight_entries = _load_json(WEIGHT_FILE)
    rowing_entries = _load_json(ROWING_FILE)

    weight_entries.sort(key=lambda e: e.get('date', ''), reverse=True)
    latest = weight_entries[0] if weight_entries else None
    latest_weight = None
    if latest:
        latest_weight = {
            'weight': latest.get('weight'),
            'unit': latest.get('unit', 'lbs'),
            'date': latest.get('date'),
        }

    week_ago = (datetime.strptime(today_str, '%Y-%m-%d') - timedelta(days=7)).strftime('%Y-%m-%d')
    rowing_this_week = sum(1 for e in rowing_entries if e.get('date', '') >= week_ago)

    # Family time score
    family_scores = _load_family_scores()
    todays_family = next((e for e in family_scores if e.get('date') == today_str), None)
    family_streak = _family_score_streak(family_scores)

    return {
        'latestWeight': latest_weight,
        'rowingThisWeek': rowing_this_week,
        'familyScore': todays_family,
        'familyStreak': family_streak,
    }


# --- Main Endpoint ---

@bp.route('/api/today', methods=['GET'])
def get_today():
    """Aggregate daily briefing: events, tasks, habits, health snapshot."""
    now = datetime.now()
    today_str = now.strftime('%Y-%m-%d')
    iso_weekday = now.isoweekday()
    weekday_name = now.strftime('%A')

    results = {}
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = {
            pool.submit(_fetch_calendar_events, today_str): 'events',
            pool.submit(_fetch_tasks_due, today_str): 'tasks',
            pool.submit(_fetch_habits, today_str, iso_weekday): 'habits',
            pool.submit(_fetch_health_snapshot, today_str): 'health',
        }
        for future in as_completed(futures):
            key = futures[future]
            try:
                results[key] = future.result()
            except Exception:
                results[key] = [] if key in ('events', 'tasks') else {}

    return jsonify({
        'date': today_str,
        'weekday': weekday_name,
        'events': results.get('events', []),
        'tasks': results.get('tasks', []),
        'habits': results.get('habits', {'suggested': [], 'completed': [], 'log': []}),
        'health': results.get('health', {'latestWeight': None, 'rowingThisWeek': 0}),
    })
