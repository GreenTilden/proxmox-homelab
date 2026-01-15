# Session Status Review - January 2026

## Completed This Session

### 1. Obsidian Sync Server
- CouchDB running on LXC 100 (port 5984)
- Database: `obsidian-vault`
- Credentials: `obsidian` / `sync-password-2024`
- HTTPS: https://sync.darrenarney.com

### 2. HTTPS External Access
SSL certificates active for:
- https://home.darrenarney.com → Vue Dashboard
- https://sync.darrenarney.com → Obsidian CouchDB
- https://weather.darrenarney.com → WeatherStar 4000+

### 3. WeatherStar Integration
- Running on LXC 100 port 8082
- Kiosk mode enabled (hides location bar)
- Embedded in `/weather` page with retro TV styling
- Pre-filled with 46220 Broad Ripple location

### 4. Documentation Hub
- `/docs` page with all services, credentials, infrastructure
- Quick links to everything
- Development workflow guide

### 5. Home Assistant Enhancements
- Kiosk dashboard created at `/kiosk`
- Weather automations (ambient lighting, rain flicker)
- Cync lights integrated
- Google Cast devices discovered
- Google Home integration downloaded (needs restart + config)

---

## In Progress / Needs Action

### 1. DNS Records Needed
Add A records pointing to your public IP:
| Name | Status |
|------|--------|
| home | Done |
| sync | Done |
| weather | Done |
| auth | **NEEDED** |
| ha | **NEEDED** |

### 2. Authelia 2FA
- Container running on Proxmox (192.168.0.99:9091)
- Config created with user `darney`
- Password same as HA: `V23satchmo4685`
- **Waiting for:** auth DNS + Duo integration keys

### 3. Nanit Baby Monitor
- Docker compose ready at `/opt/nanit/`
- **Action needed:** Run auth command interactively:
  ```bash
  ssh root@192.168.0.99
  cd /opt/nanit
  docker run --rm -it -v /opt/nanit/data:/data indiefan/nanit init
  ```
- Enter Nanit email, password, 2FA when prompted
- Then: `docker compose up -d`

---

## Planned / Ideas Discussed

### 1. Duo Push 2FA (Priority)
- Push-to-approve on Pixel Watch 3
- Protects: dashboard, obsidian sync
- Need Duo account + integration keys

### 2. 1Password Integration
- Can use for TOTP codes on watch
- Store all homelab credentials
- Alternative to Duo if preferred

### 3. Pixel Watch Integration
- HA Wear OS app for light control
- 2FA approval notifications
- Voice commands via Google Assistant

### 4. HA External Access
- ha.darrenarney.com (needs DNS + SSL)
- HA has its own auth, Authelia optional

---

## Infrastructure Summary

| LXC/VM | IP | Services |
|--------|-----|----------|
| LXC 100 | 192.168.0.250 | Nginx, Vue, WeatherStar, CouchDB, Code Server |
| LXC 110 | 192.168.0.111 | qBittorrent |
| LXC 120 | 192.168.0.218 | Rustdesk, PostgreSQL |
| Proxmox | 192.168.0.99 | HA, Plex, Prometheus, Authelia, Nanit |

## Port Forwards (Router)

| Name | External | Internal | IP |
|------|----------|----------|-----|
| Obsidian_80 | 80 | 80 | 192.168.0.250 |
| Obsidian_443 | 443 | 443 | 192.168.0.250 |
| RustDesk_* | 54010-54014 | 21115-21119 | 192.168.0.218 |

---

## Quick Reference

### URLs (External)
- Dashboard: https://home.darrenarney.com
- Obsidian Sync: https://sync.darrenarney.com
- Weather: https://weather.darrenarney.com

### URLs (Internal)
- Dashboard: http://192.168.0.250
- Home Assistant: http://192.168.0.99:8123
- HA Kiosk: http://192.168.0.99:8123/kiosk
- Code Server: http://192.168.0.250:8081
- Proxmox: https://192.168.0.99:8006
- Portainer: http://192.168.0.99:9000

### Credentials
| Service | User | Password |
|---------|------|----------|
| Home Assistant | darney | V23satchmo4685 |
| Obsidian Sync | obsidian | sync-password-2024 |
| CouchDB Admin | admin | obsidian-admin-2024 |
| Authelia | darney | V23satchmo4685 |

---

## Next Steps (Recommended Order)

1. **Add DNS records** for `auth` and `ha`
2. **Run Nanit auth** (SSH interactive command)
3. **Create Duo account** and get integration keys
4. **Get SSL certs** for auth + ha subdomains
5. **Configure Duo** in Authelia
6. **Set up Pixel Watch** with HA app + 2FA
7. **Test everything** from external network

---

*Generated: January 8, 2026*
