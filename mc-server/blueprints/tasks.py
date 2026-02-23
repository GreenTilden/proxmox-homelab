"""Nextcloud Tasks (VTODO) CRUD."""
import uuid
from datetime import datetime
from xml.etree import ElementTree as ET

import requests as http_requests
from flask import Blueprint, request, jsonify

from .shared import (CONFIG, nextcloud_auth, nextcloud_configured,
                     caldav_url, parse_ical_todos, parse_date, ical_escape_text)

bp = Blueprint('tasks', __name__)


@bp.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Fetch VTODOs from Nextcloud Tasks calendar."""
    if not nextcloud_configured():
        return jsonify({"error": "Nextcloud not configured"}), 500

    status_filter = request.args.get("status", "incomplete")
    tasks_calendar = request.args.get("calendar", CONFIG['nextcloud_tasks_calendar'])
    cal_url = caldav_url(tasks_calendar)

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

        tasks = []
        for response in root.findall(".//D:response", ns):
            cal_data_el = response.find(".//C:calendar-data", ns)
            if cal_data_el is not None and cal_data_el.text:
                parsed = parse_ical_todos(cal_data_el.text)
                for todo in parsed:
                    task = {
                        "uid": todo.get("uid", ""),
                        "summary": todo.get("summary", ""),
                        "description": todo.get("description", ""),
                        "status": todo.get("status", "NEEDS-ACTION"),
                        "priority": todo.get("priority", 0),
                        "due": parse_date(todo.get("due", "")),
                        "dueAllDay": todo.get("dueAllDay", False),
                        "percent_complete": todo.get("percent_complete", 0),
                        "categories": todo.get("categories", []),
                    }

                    if status_filter == "incomplete" and task["status"] == "COMPLETED":
                        continue
                    elif status_filter == "completed" and task["status"] != "COMPLETED":
                        continue

                    tasks.append(task)

        tasks.sort(key=lambda t: (t.get("priority") or 99, t.get("due") or "9999"))
        return jsonify({"tasks": tasks, "count": len(tasks)}), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch tasks", "details": str(e)}), 502


@bp.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a new VTODO in Nextcloud Tasks calendar."""
    if not nextcloud_configured():
        return jsonify({"error": "Nextcloud not configured"}), 500

    data = request.get_json()
    if not data or not data.get("summary", "").strip():
        return jsonify({"error": "summary is required"}), 400

    uid = str(uuid.uuid4())
    now = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    summary = ical_escape_text(data["summary"].strip())
    description = ical_escape_text(data.get("description") or "")
    priority = data.get("priority", 0)
    categories = data.get("categories", "")
    if isinstance(categories, list):
        categories = ",".join(categories)
    due = data.get("due", "")
    tasks_calendar = data.get("calendar", CONFIG['nextcloud_tasks_calendar'])

    ical_lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//LCiB Dashboard//Tasks//EN",
        "BEGIN:VTODO",
        "UID:" + uid,
        "DTSTAMP:" + now,
        "CREATED:" + now,
        "LAST-MODIFIED:" + now,
        "SUMMARY:" + summary,
        "STATUS:NEEDS-ACTION",
        "PERCENT-COMPLETE:0",
    ]

    if description:
        ical_lines.append("DESCRIPTION:" + description)
    if priority:
        ical_lines.append("PRIORITY:" + str(int(priority)))
    if categories:
        ical_lines.append("CATEGORIES:" + categories)
    if due:
        due_clean = due.replace("-", "")[:8]
        if len(due_clean) == 8 and due_clean.isdigit():
            ical_lines.append("DUE;VALUE=DATE:" + due_clean)
        else:
            dt_clean = due.replace("-", "").replace(":", "").replace(" ", "T")
            if "T" in dt_clean:
                dt_part = dt_clean[:15]
                if not dt_part.endswith("Z"):
                    dt_part = dt_part + "Z"
                ical_lines.append("DUE:" + dt_part)

    ical_lines.extend(["END:VTODO", "END:VCALENDAR", ""])
    ical = "\r\n".join(ical_lines)

    try:
        put_url = caldav_url(tasks_calendar) + uid + ".ics"
        r = http_requests.put(
            put_url,
            data=ical.encode('utf-8'),
            headers={"Content-Type": "text/calendar; charset=utf-8"},
            auth=nextcloud_auth(),
            timeout=10
        )
        if r.status_code in (200, 201, 204):
            return jsonify({"uid": uid, "summary": summary, "created": True}), 201
        else:
            return jsonify({"error": "CalDAV PUT failed", "status": r.status_code, "body": r.text[:300]}), 502
    except Exception as e:
        return jsonify({"error": "Failed to create task", "details": str(e)}), 502


@bp.route('/api/tasks/<uid>', methods=['PUT'])
def update_task(uid):
    """Update a VTODO by UID. Fetches existing, modifies fields, PUTs back."""
    if not nextcloud_configured():
        return jsonify({"error": "Nextcloud not configured"}), 500

    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON body required"}), 400

    tasks_calendar = data.pop("calendar", CONFIG['nextcloud_tasks_calendar'])
    cal_base = caldav_url(tasks_calendar)

    # Search for the task by UID
    report_body = """<?xml version="1.0" encoding="utf-8" ?>
<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop>
    <D:getetag/>
    <C:calendar-data/>
  </D:prop>
  <C:filter>
    <C:comp-filter name="VCALENDAR">
      <C:comp-filter name="VTODO">
        <C:prop-filter name="UID">
          <C:text-match collation="i;octet">{uid}</C:text-match>
        </C:prop-filter>
      </C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>""".format(uid=uid)

    try:
        r = http_requests.request(
            "REPORT",
            cal_base,
            data=report_body,
            headers={"Content-Type": "application/xml; charset=utf-8", "Depth": "1"},
            auth=nextcloud_auth(),
            timeout=10
        )

        if r.status_code not in (200, 207):
            return jsonify({"error": "CalDAV search failed", "status": r.status_code}), 502

        root = ET.fromstring(r.text)
        ns = {"D": "DAV:", "C": "urn:ietf:params:xml:ns:caldav"}

        href = None
        ical_text = None
        etag = None
        for response in root.findall(".//D:response", ns):
            href_el = response.find("D:href", ns)
            cal_data_el = response.find(".//C:calendar-data", ns)
            etag_el = response.find(".//D:getetag", ns)
            if href_el is not None and cal_data_el is not None and cal_data_el.text:
                href = href_el.text
                ical_text = cal_data_el.text
                if etag_el is not None:
                    etag = etag_el.text
                break

        if not href or not ical_text:
            return jsonify({"error": "Task not found", "uid": uid}), 404

        # Rebuild the VTODO with updated fields
        now = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")

        existing = {}
        in_todo = False
        other_lines_before = []
        other_lines_after = []
        section = "before"
        for line in ical_text.replace("\r\n", "\n").split("\n"):
            stripped = line.strip()
            if stripped == "BEGIN:VTODO":
                in_todo = True
                section = "in"
                continue
            elif stripped == "END:VTODO":
                in_todo = False
                section = "after"
                continue
            if section == "before":
                other_lines_before.append(stripped)
            elif section == "after":
                other_lines_after.append(stripped)
            elif in_todo:
                if ":" in stripped:
                    key_part, _, value = stripped.partition(":")
                    key = key_part.split(";")[0].upper()
                    existing[key] = stripped

        # Apply updates
        if "summary" in data:
            existing["SUMMARY"] = "SUMMARY:" + ical_escape_text(data["summary"])
        if "description" in data:
            desc = ical_escape_text(data["description"])
            if desc:
                existing["DESCRIPTION"] = "DESCRIPTION:" + desc
            else:
                existing.pop("DESCRIPTION", None)
        if "status" in data:
            status_val = data["status"].upper()
            if status_val in ("NEEDS-ACTION", "IN-PROCESS", "COMPLETED", "CANCELLED"):
                existing["STATUS"] = "STATUS:" + status_val
                if status_val == "COMPLETED":
                    existing["PERCENT-COMPLETE"] = "PERCENT-COMPLETE:100"
                    existing["COMPLETED"] = "COMPLETED:" + now
                elif status_val == "NEEDS-ACTION":
                    existing["PERCENT-COMPLETE"] = "PERCENT-COMPLETE:0"
                    existing.pop("COMPLETED", None)
        if "percent_complete" in data:
            pc = max(0, min(100, int(data["percent_complete"])))
            existing["PERCENT-COMPLETE"] = "PERCENT-COMPLETE:" + str(pc)
            if pc == 100:
                existing["STATUS"] = "STATUS:COMPLETED"
                existing["COMPLETED"] = "COMPLETED:" + now
            elif pc > 0:
                existing["STATUS"] = "STATUS:IN-PROCESS"
                existing.pop("COMPLETED", None)
            else:
                existing["STATUS"] = "STATUS:NEEDS-ACTION"
                existing.pop("COMPLETED", None)
        if "priority" in data:
            existing["PRIORITY"] = "PRIORITY:" + str(int(data["priority"]))
        if "due" in data:
            due = data["due"]
            if due:
                due_clean = due.replace("-", "")[:8]
                if len(due_clean) == 8 and due_clean.isdigit():
                    existing["DUE"] = "DUE;VALUE=DATE:" + due_clean
                else:
                    dt_clean = due.replace("-", "").replace(":", "").replace(" ", "T")
                    if "T" in dt_clean:
                        dt_part = dt_clean[:15]
                        if not dt_part.endswith("Z"):
                            dt_part = dt_part + "Z"
                        existing["DUE"] = "DUE:" + dt_part
            else:
                existing.pop("DUE", None)
        if "categories" in data:
            cats = data["categories"]
            if isinstance(cats, list):
                cats = ",".join(cats)
            if cats:
                existing["CATEGORIES"] = "CATEGORIES:" + cats
            else:
                existing.pop("CATEGORIES", None)

        existing["LAST-MODIFIED"] = "LAST-MODIFIED:" + now

        rebuild_lines = [l for l in other_lines_before if l]
        rebuild_lines.append("BEGIN:VTODO")
        for key, full_line in existing.items():
            if full_line:
                rebuild_lines.append(full_line)
        rebuild_lines.append("END:VTODO")
        rebuild_lines.extend([l for l in other_lines_after if l])

        new_ical = "\r\n".join(rebuild_lines) + "\r\n"

        put_url = CONFIG['nextcloud_url'] + href
        put_headers = {"Content-Type": "text/calendar; charset=utf-8"}
        if etag:
            put_headers["If-Match"] = etag

        r2 = http_requests.put(
            put_url,
            data=new_ical.encode('utf-8'),
            headers=put_headers,
            auth=nextcloud_auth(),
            timeout=10
        )

        if r2.status_code in (200, 201, 204):
            return jsonify({"uid": uid, "updated": True}), 200
        else:
            return jsonify({"error": "CalDAV PUT failed", "status": r2.status_code, "body": r2.text[:300]}), 502

    except Exception as e:
        return jsonify({"error": "Failed to update task", "details": str(e)}), 502


@bp.route('/api/tasks/<uid>', methods=['DELETE'])
def delete_task(uid):
    """Delete a VTODO by UID."""
    if not nextcloud_configured():
        return jsonify({"error": "Nextcloud not configured"}), 500

    tasks_calendar = request.args.get("calendar", CONFIG['nextcloud_tasks_calendar'])
    cal_base = caldav_url(tasks_calendar)

    # Try direct deletion with UID as filename
    try:
        r = http_requests.delete(
            cal_base + uid + ".ics",
            auth=nextcloud_auth(),
            timeout=10
        )
        if r.status_code in (200, 204):
            return jsonify({"deleted": True, "uid": uid}), 200
    except:
        pass

    # Search for the task by UID
    report_body = """<?xml version="1.0" encoding="utf-8" ?>
<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop>
    <D:getetag/>
    <C:calendar-data/>
  </D:prop>
  <C:filter>
    <C:comp-filter name="VCALENDAR">
      <C:comp-filter name="VTODO">
        <C:prop-filter name="UID">
          <C:text-match collation="i;octet">{uid}</C:text-match>
        </C:prop-filter>
      </C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>""".format(uid=uid)

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
                        return jsonify({"deleted": True, "uid": uid}), 200

        return jsonify({"error": "Task not found", "uid": uid}), 404

    except Exception as e:
        return jsonify({"error": "Failed to delete task", "details": str(e)}), 502
