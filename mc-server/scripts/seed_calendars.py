#!/usr/bin/env python3
"""Seed Nextcloud calendars with milestones, date nights, and fitness events.

Usage: python3 seed_calendars.py [--dry-run]

Requires COMMAND_SERVER_TOKEN, NEXTCLOUD_USER, NEXTCLOUD_APP_PASSWORD in /opt/.env
"""
import os
import sys
import uuid
import argparse
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv('/opt/.env')

NC_URL = os.getenv('NEXTCLOUD_URL', 'http://192.168.0.99:8090')
NC_USER = os.getenv('NEXTCLOUD_USER', '')
NC_PASS = os.getenv('NEXTCLOUD_APP_PASSWORD', '')


def nc_auth():
    return (NC_USER, NC_PASS)


def caldav_base(calendar):
    return f"{NC_URL}/remote.php/dav/calendars/{NC_USER}/{calendar}/"


def create_calendar(name, display_name, color="#4a6741"):
    """Create a new calendar via MKCALENDAR if it doesn't exist."""
    url = caldav_base(name)
    # Check if it exists
    r = requests.request("PROPFIND", url, auth=nc_auth(),
                         headers={"Depth": "0"}, timeout=10)
    if r.status_code in (200, 207):
        print(f"  Calendar '{name}' already exists")
        return True

    body = f"""<?xml version="1.0" encoding="UTF-8" ?>
<C:mkcalendar xmlns:D="DAV:"
              xmlns:C="urn:ietf:params:xml:ns:caldav"
              xmlns:I="http://apple.com/ns/ical/">
  <D:set>
    <D:prop>
      <D:displayname>{display_name}</D:displayname>
      <I:calendar-color>{color}</I:calendar-color>
      <C:supported-calendar-component-set>
        <C:comp name="VEVENT"/>
      </C:supported-calendar-component-set>
    </D:prop>
  </D:set>
</C:mkcalendar>"""

    r = requests.request("MKCALENDAR", url, data=body, auth=nc_auth(),
                         headers={"Content-Type": "application/xml"}, timeout=10)
    if r.status_code in (201, 207):
        print(f"  Created calendar '{name}' ({display_name})")
        return True
    else:
        print(f"  FAILED to create calendar '{name}': {r.status_code} {r.text[:200]}")
        return False


def create_event(calendar, title, start_date, all_day=True, description="",
                 category="", rrule="", dry_run=False):
    """Create a single CalDAV event."""
    uid = str(uuid.uuid4())
    now = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")

    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//LCiB Dashboard//Calendar Seed//EN",
        "BEGIN:VEVENT",
        f"UID:{uid}",
        f"DTSTAMP:{now}",
    ]

    if all_day:
        date_compact = start_date.replace("-", "")[:8]
        lines.append(f"DTSTART;VALUE=DATE:{date_compact}")
        lines.append(f"DTEND;VALUE=DATE:{date_compact}")
    else:
        clean = start_date.replace("-", "").replace(":", "").replace(" ", "T")
        if "T" not in clean:
            clean += "T000000"
        lines.append(f"DTSTART:{clean[:15]}Z")

    lines.append(f"SUMMARY:{title}")
    if description:
        # Fold long descriptions per RFC 5545
        desc_escaped = description.replace("\n", "\\n")
        lines.append(f"DESCRIPTION:{desc_escaped}")
    if category:
        lines.append(f"CATEGORIES:{category}")
    if rrule:
        lines.append(f"RRULE:{rrule}")

    lines.extend(["END:VEVENT", "END:VCALENDAR", ""])
    ical = "\r\n".join(lines)

    tag = "[DRY RUN] " if dry_run else ""
    print(f"  {tag}{start_date} — {title}")

    if dry_run:
        return True

    url = caldav_base(calendar) + uid + ".ics"
    r = requests.put(url, data=ical.encode('utf-8'),
                     headers={"Content-Type": "text/calendar; charset=utf-8"},
                     auth=nc_auth(), timeout=10)
    if r.status_code in (200, 201, 204):
        return True
    else:
        print(f"    FAILED: {r.status_code} {r.text[:200]}")
        return False


def seed_baby_milestones(dry_run=False):
    """Seed baby sister milestones from Mar 19 onward."""
    print("\n=== Baby Sister Milestones ===")
    baby_dob = datetime(2026, 3, 19)

    milestones = [
        (0,   "Baby Sister arrives!"),
        (7,   "Baby: First week — umbilical cord check, regain birth weight"),
        (14,  "Baby: 2 weeks — newborn photos deadline"),
        (30,  "Baby: 1 month — first real smile, tummy time starts"),
        (42,  "Baby: 6 weeks — postpartum checkup"),
        (60,  "Baby: 2 months — first vaccinations, tracking objects, cooing"),
        (90,  "Baby: 3 months — holds head up, laughing, discovers hands"),
        (105, "Baby: 3.5 months — June vacation (she'll be portable!)"),
        (120, "Baby: 4 months — rolls over, grabs toys, sleep regression incoming"),
        (150, "Baby: 5 months — sits with support, babbling"),
        (180, "Baby: 6 months — sitting up, starts solids, first tooth watch"),
        (210, "Baby: 7 months — stranger awareness, crawling attempts"),
        (270, "Baby: 9 months — crawling, separation anxiety, first words?"),
        (300, "Baby: 10 months — pulling to stand, cruising furniture"),
        (365, "Baby: 1 year! — first steps, first birthday party planning"),
    ]

    created = 0
    for days_offset, title in milestones:
        event_date = (baby_dob + timedelta(days=days_offset)).strftime("%Y-%m-%d")
        if create_event("personal", title, event_date, all_day=True,
                        category="milestone", dry_run=dry_run):
            created += 1

    print(f"  → {created}/{len(milestones)} milestone events {'would be ' if dry_run else ''}created")


def seed_date_nights(dry_run=False):
    """Seed recurring date night events."""
    print("\n=== Date Night Events ===")

    # Kan-Kan Cinema — weekly on Fridays starting next Friday
    today = datetime.now()
    # Find next Friday
    days_until_friday = (4 - today.weekday()) % 7
    if days_until_friday == 0:
        days_until_friday = 7
    next_friday = (today + timedelta(days=days_until_friday)).strftime("%Y-%m-%d")

    create_event(
        "personal",
        "Kan-Kan Cinema — check showtimes",
        next_friday,
        all_day=True,
        description="Weekly date night option. Check Kan-Kan showtimes and pick a movie.",
        category="date-night",
        rrule="FREQ=WEEKLY;BYDAY=FR",
        dry_run=dry_run,
    )

    # Jazz Kitchen — monthly on first Saturday starting next month
    if today.month == 12:
        first_of_next = datetime(today.year + 1, 1, 1)
    else:
        first_of_next = datetime(today.year, today.month + 1, 1)
    # Find first Saturday
    days_until_sat = (5 - first_of_next.weekday()) % 7
    first_saturday = (first_of_next + timedelta(days=days_until_sat)).strftime("%Y-%m-%d")

    create_event(
        "personal",
        "Jazz Kitchen — book reservation",
        first_saturday,
        all_day=True,
        description="Monthly date night. Book a reservation at Jazz Kitchen.",
        category="date-night",
        rrule="FREQ=MONTHLY;BYDAY=1SA",
        dry_run=dry_run,
    )

    print("  → 2 recurring date night events created (weekly + monthly)")


def seed_fitness(dry_run=False):
    """Create Fitness calendar and seed recurring rowing schedule."""
    print("\n=== Fitness Calendar ===")

    if not dry_run:
        create_calendar("fitness", "Fitness", "#2d7d46")

    # Rowing 3x/week: Mon, Wed, Fri mornings
    today = datetime.now()
    # Find next Monday
    days_until_monday = (0 - today.weekday()) % 7
    if days_until_monday == 0:
        days_until_monday = 7
    next_monday = today + timedelta(days=days_until_monday)
    rowing_start = next_monday.strftime("%Y-%m-%dT06:00:00")

    create_event(
        "fitness",
        "Rowing — 30 min",
        rowing_start,
        all_day=False,
        description="Target: 6000m in 30 min. Log session on /health page after.",
        category="fitness",
        rrule="FREQ=WEEKLY;BYDAY=MO,WE,FR",
        dry_run=dry_run,
    )

    # Weigh-in reminder — weekly on Monday mornings
    weigh_start = next_monday.strftime("%Y-%m-%dT06:30:00")
    create_event(
        "fitness",
        "Weekly weigh-in",
        weigh_start,
        all_day=False,
        description="Step on the scale, log on /health page.",
        category="fitness",
        rrule="FREQ=WEEKLY;BYDAY=MO",
        dry_run=dry_run,
    )

    print("  → Rowing 3x/week + weekly weigh-in recurring events created")


def main():
    parser = argparse.ArgumentParser(description="Seed Nextcloud calendars")
    parser.add_argument("--dry-run", action="store_true", help="Print what would be created without creating")
    args = parser.parse_args()

    if not NC_USER or not NC_PASS:
        print("ERROR: NEXTCLOUD_USER and NEXTCLOUD_APP_PASSWORD must be set in /opt/.env")
        sys.exit(1)

    print(f"Nextcloud: {NC_URL}")
    print(f"User: {NC_USER}")
    if args.dry_run:
        print("MODE: DRY RUN (no changes will be made)\n")

    seed_baby_milestones(dry_run=args.dry_run)
    seed_date_nights(dry_run=args.dry_run)
    seed_fitness(dry_run=args.dry_run)

    print("\nDone!")


if __name__ == "__main__":
    main()
