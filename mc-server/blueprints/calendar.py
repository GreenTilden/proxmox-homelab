"""Nextcloud Calendar Events — read, create, delete."""
import uuid
from datetime import datetime, timedelta
from xml.etree import ElementTree as ET

import requests as http_requests
from flask import Blueprint, request, jsonify

from .shared import (CONFIG, nextcloud_auth, nextcloud_configured,
                     caldav_url, parse_ical_events, parse_date)

bp = Blueprint('calendar', __name__)


@bp.route('/api/calendar-events', methods=['GET'])
def get_calendar_events():
    """Fetch upcoming events from Nextcloud CalDAV."""
    if not nextcloud_configured():
        return jsonify({"error": "Nextcloud not configured"}), 500

    days = int(request.args.get('days', 30))
    now = datetime.utcnow()
    start = (now - timedelta(days=7)).strftime("%Y%m%dT%H%M%SZ")
    end = (now + timedelta(days=days)).strftime("%Y%m%dT%H%M%SZ")

    cal_url = caldav_url()

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
            cal_url,
            data=report_body,
            headers={"Content-Type": "application/xml; charset=utf-8", "Depth": "1"},
            auth=nextcloud_auth(),
            timeout=15
        )

        if r.status_code not in (200, 207):
            return jsonify({"error": "CalDAV request failed", "status": r.status_code, "body": r.text[:500]}), 502

        root = ET.fromstring(r.text)
        ns = {"D": "DAV:", "C": "urn:ietf:params:xml:ns:caldav"}

        events = []
        for response in root.findall(".//D:response", ns):
            cal_data_el = response.find(".//C:calendar-data", ns)
            if cal_data_el is not None and cal_data_el.text:
                parsed = parse_ical_events(cal_data_el.text)
                for ev in parsed:
                    events.append({
                        "id": ev.get("uid", ""),
                        "title": ev.get("summary", "Untitled"),
                        "startDate": parse_date(ev.get("dtstart", "")),
                        "endDate": parse_date(ev.get("dtend", "")),
                        "allDay": ev.get("allDay", False),
                        "category": ev.get("categories", "personal"),
                        "description": ev.get("description", ""),
                    })

        events.sort(key=lambda e: e.get("startDate") or "")
        return jsonify({"events": events, "count": len(events)}), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch calendar events", "details": str(e)}), 502


@bp.route('/api/calendar-events', methods=['POST'])
def create_calendar_event():
    """Create a new event in Nextcloud CalDAV."""
    if not nextcloud_configured():
        return jsonify({"error": "Nextcloud not configured"}), 500

    data = request.get_json()
    if not data or not data.get('title'):
        return jsonify({"error": "Title is required"}), 400

    uid = str(uuid.uuid4())
    now = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    title = data['title'].replace('"', "'")
    description = (data.get('description') or '').replace('"', "'")
    category = data.get('category', 'personal')
    all_day = data.get('allDay', False)
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
        date_compact = start_str.replace("-", "")[:8]
        ical_lines.append("DTSTART;VALUE=DATE:" + date_compact)
        ical_lines.append("DTEND;VALUE=DATE:" + date_compact)
    else:
        clean = start_str.replace("-", "").replace(":", "").replace(" ", "T")
        if "T" not in clean:
            clean = clean + "T000000"
        dt_part = clean[:15]
        if not dt_part.endswith("Z"):
            dt_part = dt_part + "Z"
        ical_lines.append("DTSTART:" + dt_part)
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
        put_url = caldav_url() + uid + ".ics"
        r = http_requests.put(
            put_url,
            data=ical,
            headers={"Content-Type": "text/calendar; charset=utf-8"},
            auth=nextcloud_auth(),
            timeout=10
        )
        if r.status_code in (200, 201, 204):
            return jsonify({"id": uid, "title": title, "created": True}), 201
        else:
            return jsonify({"error": "CalDAV PUT failed", "status": r.status_code, "body": r.text[:300]}), 502
    except Exception as e:
        return jsonify({"error": "Failed to create event", "details": str(e)}), 502


@bp.route('/api/calendar-events/<event_uid>', methods=['DELETE'])
def delete_calendar_event(event_uid):
    """Delete an event from Nextcloud CalDAV."""
    if not nextcloud_configured():
        return jsonify({"error": "Nextcloud not configured"}), 500

    cal_base = caldav_url()

    # Try direct deletion with UID as filename
    try:
        r = http_requests.delete(
            cal_base + event_uid + ".ics",
            auth=nextcloud_auth(),
            timeout=10
        )
        if r.status_code in (200, 204):
            return jsonify({"deleted": True, "id": event_uid}), 200
    except:
        pass

    # Search for the event by UID
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
            cal_base,
            data=report_body,
            headers={"Content-Type": "application/xml; charset=utf-8", "Depth": "1"},
            auth=nextcloud_auth(),
            timeout=10
        )

        if r.status_code in (200, 207):
            root = ET.fromstring(r.text)
            ns = {"D": "DAV:"}
            for response in root.findall(".//D:response", ns):
                href_el = response.find("D:href", ns)
                if href_el is not None and href_el.text:
                    delete_url = CONFIG['nextcloud_url'] + href_el.text
                    dr = http_requests.delete(
                        delete_url,
                        auth=nextcloud_auth(),
                        timeout=10
                    )
                    if dr.status_code in (200, 204):
                        return jsonify({"deleted": True, "id": event_uid}), 200

        return jsonify({"error": "Event not found", "id": event_uid}), 404

    except Exception as e:
        return jsonify({"error": "Failed to delete event", "details": str(e)}), 502
