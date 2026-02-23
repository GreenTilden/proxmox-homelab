"""Cathy Comics Bot — daily comic post tracking."""
import json
from datetime import date, datetime

from flask import Blueprint, request, jsonify

bp = Blueprint('cathy', __name__)

CATHY_POSTS_FILE = '/opt/cathy-posts.json'


def _load_cathy_posts():
    """Load cathy posts, auto-migrating from old single-day format if needed."""
    try:
        with open(CATHY_POSTS_FILE, 'r') as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"dates": {}}

    # Auto-migrate old format: {"date": "...", "posts": [...]}
    if "date" in data and "posts" in data and "dates" not in data:
        old_date = data.get("date")
        old_posts = data.get("posts", [])
        new_data = {"dates": {}}
        if old_date and old_posts:
            new_data["dates"][old_date] = old_posts
        _save_cathy_posts(new_data)
        return new_data

    return data


def _save_cathy_posts(data):
    with open(CATHY_POSTS_FILE, 'w') as f:
        json.dump(data, f, indent=2)


@bp.route('/api/cathy-today', methods=['GET'])
def get_cathy_today():
    """Return Cathy comics for a given date (default today) with prev/next nav."""
    data = _load_cathy_posts()
    dates = data.get("dates", {})

    req_date = request.args.get('date') or date.today().isoformat()
    posts = dates.get(req_date, [])

    sorted_dates = sorted(dates.keys())
    prev_date = None
    next_date = None
    for d in sorted_dates:
        if d < req_date:
            prev_date = d
    for d in sorted_dates:
        if d > req_date:
            next_date = d
            break

    return jsonify({
        "date": req_date,
        "posts": posts,
        "prev_date": prev_date,
        "next_date": next_date,
    }), 200


@bp.route('/api/cathy-today', methods=['POST'])
def post_cathy_today():
    """Register a new Cathy comic post (called by poster.py on Proxmox)."""
    body = request.get_json()
    if not body or not body.get('year') or not body.get('bluesky_url'):
        return jsonify({"error": "year and bluesky_url are required"}), 400

    post_date = body.get("post_date") or date.today().isoformat()
    data = _load_cathy_posts()
    dates = data.get("dates", {})

    if post_date not in dates:
        dates[post_date] = []

    hour = datetime.now().hour
    time_map = {9: "09:00", 10: "09:00", 11: "09:00",
                12: "12:00", 13: "12:00", 14: "12:00",
                15: "15:00", 16: "15:00", 17: "15:00"}
    post_time = time_map.get(hour, f"{hour:02d}:00")

    post_entry = {
        "year": body["year"],
        "time": post_time,
        "bluesky_url": body["bluesky_url"],
        "image_url": body.get("image_url", ""),
    }

    dates[post_date].append(post_entry)
    data["dates"] = dates
    _save_cathy_posts(data)
    return jsonify(post_entry), 201
