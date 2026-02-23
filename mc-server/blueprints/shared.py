"""Shared config, auth middleware, and Nextcloud CalDAV helpers."""
import os
import re
import json
import uuid
from datetime import date, datetime, timedelta
from xml.etree import ElementTree as ET

import requests as http_requests
from flask import request, jsonify
from dotenv import load_dotenv

load_dotenv()

# --- Centralized Config ---

def load_config():
    """Load all env vars into a single config dict."""
    return {
        'secret_token': os.getenv('COMMAND_SERVER_TOKEN', ''),
        'ha_url': os.getenv('HA_URL', 'http://192.168.0.99:8123'),
        'ha_token': os.getenv('HA_TOKEN', ''),
        'nextcloud_url': os.getenv('NEXTCLOUD_URL', 'http://192.168.0.99:8090'),
        'nextcloud_user': os.getenv('NEXTCLOUD_USER', ''),
        'nextcloud_app_password': os.getenv('NEXTCLOUD_APP_PASSWORD', ''),
        'nextcloud_calendar': os.getenv('NEXTCLOUD_CALENDAR', 'personal'),
        'nextcloud_tasks_calendar': os.getenv('NEXTCLOUD_TASKS_CALENDAR', 'tasks'),
        'upload_dir': os.getenv('UPLOAD_DIR', '/mnt/media_pool'),
        'tandoor_url': os.getenv('TANDOOR_URL', 'http://192.168.0.99:8080'),
        'tandoor_user': os.getenv('TANDOOR_USER', ''),
        'tandoor_password': os.getenv('TANDOOR_PASSWORD', ''),
        'cors_origins': [
            'http://192.168.0.250',
            'https://home.darrenarney.com',
        ],
    }


CONFIG = load_config()


# --- Auth Middleware ---

def check_token():
    """Check for a valid secret token on all requests."""
    if request.method == 'OPTIONS':
        return
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Authorization header missing"}), 401
    try:
        auth_type, token = auth_header.split()
        if auth_type.lower() != 'bearer' or token != CONFIG['secret_token']:
            return jsonify({"error": "Invalid or missing token"}), 403
    except ValueError:
        return jsonify({"error": "Invalid Authorization header format"}), 401


# --- Nextcloud Helpers ---

def nextcloud_auth():
    """Return (user, password) tuple for Nextcloud CalDAV."""
    return (CONFIG['nextcloud_user'], CONFIG['nextcloud_app_password'])


def nextcloud_configured():
    """Check if Nextcloud credentials are configured."""
    return bool(CONFIG['nextcloud_user'] and CONFIG['nextcloud_app_password'])


def caldav_url(calendar=None):
    """Build the CalDAV base URL for a calendar."""
    cal = calendar or CONFIG['nextcloud_calendar']
    return (CONFIG['nextcloud_url'] + "/remote.php/dav/calendars/"
            + CONFIG['nextcloud_user'] + "/" + cal + "/")


# --- iCal Parsers ---

def parse_ical_events(ical_text):
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


def parse_ical_todos(ical_text):
    """Parse iCalendar text into a list of VTODO dicts."""
    todos = []
    in_todo = False
    current = {}
    for line in ical_text.replace("\r\n", "\n").split("\n"):
        line = line.strip()
        if line == "BEGIN:VTODO":
            in_todo = True
            current = {}
        elif line == "END:VTODO":
            in_todo = False
            if current.get("summary") or current.get("uid"):
                todos.append(current)
            current = {}
        elif in_todo and ":" in line:
            key_part, _, value = line.partition(":")
            key = key_part.split(";")[0].upper()
            if key == "UID":
                current["uid"] = value
            elif key == "SUMMARY":
                current["summary"] = value
            elif key == "DESCRIPTION":
                current["description"] = value
            elif key == "STATUS":
                current["status"] = value
            elif key == "PRIORITY":
                try:
                    current["priority"] = int(value)
                except ValueError:
                    current["priority"] = 0
            elif key == "DUE":
                current["due"] = value
                current["dueAllDay"] = "VALUE=DATE" in key_part and "DATE-TIME" not in key_part
            elif key == "PERCENT-COMPLETE":
                try:
                    current["percent_complete"] = int(value)
                except ValueError:
                    current["percent_complete"] = 0
            elif key == "CATEGORIES":
                current["categories"] = value
    return todos


def parse_date(date_str):
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
