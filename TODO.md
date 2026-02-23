# Homelab TODO

## Frontend

### Pages to Build
- [ ] **Podcast Page** (`/podcast`) — Episode browser, playback, A/B voice sampler, tier comparison, category filter, generation controls
- [ ] **Route FamilyDashboard** — exists at `pages/FamilyDashboard.vue` but not in router (has Cathy comics, Almanac, lights)
- [ ] **Route NotesPage** — exists at `pages/NotesPage.vue` but not in router

### Dashboard (RetroApp.vue)
- [ ] Add podcast nav button to main dashboard
- [ ] Verify all service monitors reflect current infrastructure (podcast, chatterbox, kokoro, etc.)

### General
- [ ] Clean up unused composables/components if any are dead code

---

## Documentation

### Obsidian System Status (`Homelab System Status.md`)
- [ ] Fix CT 120 IP: listed as 192.168.0.218, actual is 192.168.0.120
- [ ] Add CT 131 (podcast-factory, 192.168.0.131) to LXC table
- [ ] Add Chatterbox TTS to Docker containers table
- [ ] Add Kokoro TTS (CT 120 systemd service) to notes
- [ ] Add podcasts.darrenarney.com to DNS/subdomain table
- [ ] Add photos.darrenarney.com to DNS table (if missing)
- [ ] Add Feb 22 services to Docker table (SearXNG, Valkey, ArchiveBox, n8n, n8n-postgres, Headscale, Headscale-UI)
- [ ] Update roadmap items — remove stale (Duo Push, ESP32, Notion migration), add current priorities
- [ ] Add Chatterbox TTS port 8004 to internal ports list

### Repo Docs (`docs/UNIFIED-REFERENCE/`)
- [ ] **MASTER-INDEX.md** — last updated Aug 2025, references dead worktrees, old Gemini Framework, 5-thread model. Needs full rewrite for current reality
- [ ] **SERVICES_OVERVIEW.md** — update with all Feb 2026 services, podcast system, Chatterbox
- [ ] Remove/archive stale docs (Gemini framework, enterprise AI assessment, cycle reports) or mark clearly as historical
- [ ] Add frontend architecture doc (pages, routes, composables, themes)

---

## Podcast / Article Digest

### Pipeline
- [ ] Pick final annoying voice for free tier (voice sampler testing in progress)
- [ ] Generate real A/B test episode with content from own feeds (Starter Set / Gaming Deep Dives)
- [ ] Set up batch job scheduling — rate-limit TTS generation to avoid overloading homelab (GPU contention with other services, power draw)
- [ ] Consider time-of-day scheduling — generate during off-peak hours (overnight)
- [ ] Clean up test scripts from CT 131 (`voice_sampler*.py`, `voice_tests.py`, `ab_test_episode.py`, `list_feeds.py`)
- [ ] Clean up test episodes from feed (samplers, A/B test)

### Freemium Model
- [ ] Pricing incentive: batch queue for free tier (delayed generation), instant for premium
- [ ] Premium feed authentication (private RSS feed URL with token?)
- [ ] Landing page / subscribe flow

### Product (Article Digest)
- [ ] Source blocklist implementation
- [ ] Power monitoring integration (homelab sensors → published metrics)
- [ ] Ko-fi/Patreon setup
- [ ] Public landing page
- [ ] Platform branding and trademark
- [ ] Open-source repo setup (separate from homelab repo)

---

## Infrastructure

### Maintenance
- [ ] Review Proxmox host disk usage (was 73% after Feb 16 cleanup)
- [ ] Verify all Prometheus scrape targets are healthy
- [ ] Check if podcast-generator.timer needs updating for category/tier episodes

### Pending from Obsidian Roadmap
- [ ] Pixel Watch HA integration
- [ ] Google Home voice commands setup
- [ ] IoT isolation network (TP-Link Archer router)
