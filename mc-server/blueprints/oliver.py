"""Oliver's Almanac — daily quote journal with CalDAV sync."""
import json
import uuid
from datetime import date, datetime

import requests as http_requests
from flask import Blueprint, request, jsonify

from .shared import CONFIG, nextcloud_auth

bp = Blueprint('oliver', __name__)

OLIVER_QUOTES_FILE = '/opt/oliver-quotes.json'


def _load_quotes():
    try:
        with open(OLIVER_QUOTES_FILE, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def _save_quotes(quotes):
    with open(OLIVER_QUOTES_FILE, 'w') as f:
        json.dump(quotes, f, indent=2, sort_keys=True)


def _create_caldav_event(date_str, quote_text):
    user, password = nextcloud_auth()
    if not user or not password:
        return False
    uid = str(uuid.uuid4())
    now = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
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
        caldav_url = (CONFIG['nextcloud_url'] + "/remote.php/dav/calendars/"
                      + CONFIG['nextcloud_user'] + "/" + CONFIG['nextcloud_calendar']
                      + "/" + uid + ".ics")
        r = http_requests.put(
            caldav_url,
            data=ical,
            headers={"Content-Type": "text/calendar; charset=utf-8"},
            auth=(user, password),
            timeout=10
        )
        return r.status_code in (200, 201, 204)
    except Exception as e:
        print("CalDAV event creation failed: " + str(e))
        return False


@bp.route('/api/oliver-quotes', methods=['GET'])
def get_oliver_quotes():
    quotes = _load_quotes()
    date_filter = request.args.get('date')
    if date_filter:
        entry = quotes.get(date_filter)
        if isinstance(entry, str):
            entry = {"quote": entry, "submitted_by": "unknown"}
        return jsonify({
            "date": date_filter,
            "quote": entry.get("quote") if entry else None,
            "submitted_by": entry.get("submitted_by") if entry else None
        }), 200
    result = {}
    for d, v in quotes.items():
        if isinstance(v, str):
            result[d] = {"quote": v, "submitted_by": "unknown"}
        else:
            result[d] = v
    return jsonify(result), 200


@bp.route('/api/oliver-quotes', methods=['POST'])
def save_oliver_quote():
    data = request.get_json()
    if not data or not data.get('quote', '').strip():
        return jsonify({"error": "Quote text is required"}), 400
    today = date.today().isoformat()
    quotes = _load_quotes()
    if today in quotes:
        existing = quotes[today]
        q = existing.get("quote", existing) if isinstance(existing, dict) else existing
        return jsonify({"error": "Already submitted for today", "date": today, "quote": q}), 409
    submitted_by = request.headers.get('X-Device-Name', '') or request.remote_addr or 'unknown'
    entry = {
        "quote": data['quote'].strip(),
        "submitted_by": submitted_by,
        "timestamp": datetime.now().isoformat()
    }
    quotes[today] = entry
    _save_quotes(quotes)
    caldav_ok = _create_caldav_event(today, entry['quote'])
    return jsonify({
        "date": today,
        "quote": entry['quote'],
        "submitted_by": entry['submitted_by'],
        "synced_to_calendar": caldav_ok
    }), 200
