# Proxmox Homelab Project Guide

**This document is the former project guide and has been refactored.**

The project's documentation has been broken down into smaller, more focused documents and is now maintained in a centralized location.

## Key Documents

*   **[📚 MASTER INDEX](./docs/UNIFIED-REFERENCE/MASTER-INDEX.md)**: The primary navigation hub for all project documentation. This is the best place to start.

*   **[📄 Core Principles](./docs/UNIFIED-REFERENCE/PROJECT_MANAGEMENT/CORE_PRINCIPLES.md)**: The fundamental rules and guiding principles of the project.

*   **[⚙️ 5-Thread Workflow](./docs/UNIFIED-REFERENCE/PROJECT_MANAGEMENT/5_THREAD_WORKFLOW.md)**: A detailed explanation of the 5-thread execution model.

*   **[🏗️ Services Overview](./docs/UNIFIED-REFERENCE/ARCHITECTURE/SERVICES_OVERVIEW.md)**: An overview of all deployed services and their architecture.

*   **[💾 Hardware Overview](./docs/UNIFIED-REFERENCE/ARCHITECTURE/HARDWARE_OVERVIEW.md)**: Details on the physical hardware and storage setup.

All detailed project information has been moved to the `docs/UNIFIED-REFERENCE/` directory. This file remains as a historical marker and entry point.

## Development Environment

### Frontend (Vue Dashboard)

The frontend is developed and served from **192.168.0.250** (not locally).

- **Source location**: `root@192.168.0.250:/var/www/vue-frontend/`
- **Edit files directly via SSH**: `ssh root@192.168.0.250` then edit in `/var/www/vue-frontend/src/`
- **Build after changes**: `cd /var/www/vue-frontend && npm run build`
- **Served by nginx** from `/var/www/vue-frontend/dist/`
- **Code-server available** at `http://192.168.0.250:8081` (no password)

When making frontend changes, always edit files on 192.168.0.250 directly, not the local copy.

## SSH Access

Use the configured SSH aliases for quick access:

```bash
ssh proxmox        # Proxmox host (192.168.0.99)
ssh frontend       # Frontend server (192.168.0.250) - if configured
```

SSH config is at `~/.ssh/config`.

## Obsidian Vault

The canonical Obsidian vault is on the frontend server (192.168.0.250), **not** the local machine.

- **Location**: `root@192.168.0.250:/opt/obsidian-vault/Obsidian Vault/`
- **Access**: `ssh frontend` or `ssh root@192.168.0.250`
- **Synced via**: CouchDB LiveSync at `vault.darrenarney.com`

When creating or editing Obsidian notes, always write to the remote vault on 192.168.0.250, not the local copy at `~/Documents/Obsidian Vault/`.

## Research Rule

When looking up information about existing systems, services, or infrastructure, **always check the Obsidian vault first** (`root@192.168.0.250:/opt/obsidian-vault/Obsidian Vault/02-Areas/Homelab/`). The vault is the canonical source of truth for how things are set up. Key areas:
- `02-Areas/Homelab/Services/` — per-service docs (Smart Home, Immich, etc.)
- `02-Areas/Homelab/Infrastructure/` — system status, session handoffs

## Command Server API

The Flask command server at `/opt/command_server.py` on CT 100 (port 5001) handles backend operations for the dashboard.

- **Direct access**: `http://192.168.0.250:5001/api/...` (internal only)
- **Via nginx proxy**: `/cmd-api/...` on both `http://192.168.0.250` (port 80) and `https://home.darrenarney.com` — this is what the frontend uses to avoid HTTPS mixed-content issues
- **Auth**: Bearer token in `Authorization` header (token in `/opt/.env` as `COMMAND_SERVER_TOKEN`)
- **Source**: `/opt/command_server.py` on CT 100

### Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/cmd-api/ha/states` | GET | Proxy Home Assistant states |
| `/cmd-api/ha/services/{domain}/{service}` | POST | Proxy HA service calls |
| `/cmd-api/oliver-quotes` | GET | Get Oliver's Almanac entries (optional `?date=YYYY-MM-DD`) |
| `/cmd-api/oliver-quotes` | POST | Submit today's quote (locked after first submission per day) |
| `/cmd-api/rescan-plex` | POST | Trigger Plex library rescan |
| `/cmd-api/refresh-cync` | POST | Reload Cync integration |
| `/cmd-api/upload-media` | POST | Upload file to media pool |

### Oliver's Almanac

Daily journal of things Oliver says. Entries are stored in `/opt/oliver-quotes.json` and automatically synced to the Nextcloud CalDAV calendar as all-day events.

- **Submit**: POST to `/cmd-api/oliver-quotes` with `{"quote": "..."}` and optional `X-Device-Name` header
- **Lock**: Once submitted for a day, further submissions return 409
- **Calendar sync**: Creates event in Nextcloud `personal` calendar for user `darney` (credentials in `/opt/.env`)
- **Dashboard widget**: Shows on RetroApp dashboard in the calendar/events row
- **Nanit page**: Input field on `/nanit` sidebar, switches to display-only after submission

## Home Assistant / Smart Lights

- **HA URL**: http://192.168.0.99:8123
- **Command Server Proxy**: `/cmd-api/ha/...` via nginx (backed by port 5001)
- **Cync lights**: Above Desk, Shower, Balloon, Basement 1-8, Library 1-2
- **Key entities**: `light.above_desk` (office), `light.basement_light_1`-`8`, `input_number.office_brightness`, `input_number.basement_brightness`

### Troubleshooting: Lights unavailable / sliders not working

1. Check if the light entity is `unavailable` via the HA states API or dashboard
2. If unavailable, the **Cync cloud token has likely expired**
3. First try: `POST /cmd-api/refresh-cync` on the command server (reloads Cync config entry)
4. If that fails with "User token invalid" in HA logs (`docker logs homeassistant`), you must **re-authenticate Cync** in the HA UI: Settings > Devices & Services > Cync > Reconfigure
5. The Cync integration uses cloud auth — tokens expire periodically, this is a known issue

## Ops-Driven Development Principle

Every project follows a dashboard-first workflow:
1. Daily ops check: tasks, goals, gates, R&D log — update the dashboard before writing code
2. All work is trackable: hours logged, expenses captured, decisions documented
3. The system runs itself: if the developer steps away, the dashboard reflects current state
4. Build the ops system AS the product — improving traceability and automation is always valid work
5. The goal is not maximum output — it's sustainable output with full visibility

This is both a development methodology and a business requirement. The ops dashboard
at /ops is the single source of truth for project status, financial health, and decision readiness.

## Audio Briefing Generation

When a substantial analysis, plan, or decision document is produced, **offer to generate an audio briefing** the user can listen to on the go (shower, walk, drive). This is a core workflow — it allows context-switching without losing the thread.

### How to generate a briefing

1. **Write a narrative script** — Convert the analysis into spoken-word format. No tables, no markdown. Spell out numbers. Use conversational phrasing. Save to `/tmp/<name>-briefing.txt`.
2. **Send to Chatterbox TTS** — Use the Olivia voice (premium), `split_text: true`, `speed_factor: 0.95`, `exaggeration: 0.4`. API at `http://192.168.0.99:8004/tts`.
   ```bash
   curl -X POST http://192.168.0.99:8004/tts \
     -H "Content-Type: application/json" \
     -d '{"text": "...", "voice_mode": "predefined", "predefined_voice_id": "Olivia.wav", "output_format": "mp3", "split_text": true, "chunk_size": 120, "temperature": 0.7, "exaggeration": 0.4, "speed_factor": 0.95}' \
     --output /tmp/<name>-briefing.mp3 --max-time 600
   ```
3. **Push to podcast feed** — Copy MP3 to CT 131 episodes dir and add to episodes.json:
   ```bash
   scp /tmp/<name>-briefing.mp3 root@192.168.0.99:/tmp/
   ssh root@192.168.0.99 'pct push 131 /tmp/<name>-briefing.mp3 /var/www/podcast/episodes/<name>.mp3'
   ```
   Then add episode entry to `/opt/podcast/episodes.json` on CT 131 (via `pct exec 131`) and regenerate feeds with the feed_generator.py module.
4. **Episode metadata** — Use `tier: "premium"` and `category: "Darrentan Briefings"` for personal briefings.
5. **Feed URL** — `https://podcasts.darrenarney.com/feed-premium.xml` (premium feed includes briefings).
6. **Also drop a direct link** on the frontend server for quick access: `scp` to `root@192.168.0.250:/var/www/vue-frontend/dist/` — accessible at `https://home.darrenarney.com/<filename>.mp3`.

### When to offer

- After generating a financial analysis, decision matrix, or strategy document
- After a long brain dump session that produced organized output
- When the user says they're about to switch contexts (shower, walk, commute)
- Any time a document would benefit from a "listen while you think" format

## Post-Plan Rule

At the end of any plan or infrastructure change, always update the relevant Obsidian notes on the remote vault (192.168.0.250) to reflect what was done.
