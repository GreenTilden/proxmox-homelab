# Services Overview

## Two-Node Architecture (Planned)

Node 2 (192.168.0.98, Dell Precision 5820) will take over stable/infrastructure services. Node 1 (192.168.0.99) retains GPU workloads. See [Node 2 Build Plan](../../NODE2-BUILD-PLAN.md) for the full migration plan and wave order.

## Active Services (Docker on Proxmox 192.168.0.99 — Node 1)

| Service | Port | Subdomain | Auth | Purpose |
|---------|------|-----------|------|---------|
| Home Assistant | 8123 | ha.darrenarney.com | Own auth | Smart home control |
| Plex | 32400 | - | Own auth | Media server |
| Authelia | 9091 | auth.darrenarney.com | - | SSO/2FA gateway |
| AdGuard Home | 53, 8083 | - | Own auth | DNS ad blocking |
| Prometheus | 9090 | - | - | Metrics collection |
| Node Exporter | 9100 | - | - | System metrics |
| Immich | 2283 | photos.darrenarney.com | Own auth | Photo management |
| Kavita | 25600 | comics.darrenarney.com | Own auth | Comic/manga reader |
| Tandoor | 8080 | tandoor.darrenarney.com | Authelia | Recipe management |
| Nanit Proxy | 8085 | - | Token | Baby monitor streams |
| Nextcloud | 8090 | nextcloud.darrenarney.com | Authelia + OIDC | File sync, CalDAV |
| Uptime Kuma | 3001 | status.darrenarney.com | Own auth (public) | Status monitoring |
| SearXNG | 8888 | search.darrenarney.com | Authelia | Private search engine |
| ArchiveBox | 8200 | archive.darrenarney.com | Authelia | Web archiving |
| n8n | 5678 | n8n.darrenarney.com | Authelia | Workflow automation |
| Headscale | 8180 | headscale.darrenarney.com | OIDC | VPN mesh network |
| RustDesk | 21115-21119 | - | Own auth | Remote desktop |
| Chatterbox TTS | 8004 | - | - | GPU voice cloning (RTX 5070 Ti) |

## Services on LXC 100 (192.168.0.250)

| Service | Port | Purpose |
|---------|------|---------|
| Nginx | 80, 443 | Reverse proxy, SSL termination |
| WeatherStar | 8082 | Weather display |
| Code Server | 8081 | VS Code in browser |
| CouchDB | 5984 | Obsidian sync |
| Flask API | 5001 | Command server (10 blueprints: shared, infrastructure, ha, oliver, calendar, cathy, freezer, tasks, financials, health) |
| FreshRSS | 8085 | RSS reader (dashboard link; primary instance on CT 131) |

## LXC Containers

| VMID | Name | IP | Purpose |
|------|------|-----|---------|
| 100 | frontend-server | 192.168.0.250 | Nginx, dashboard, APIs |
| 110 | qbittorrent-secure | 192.168.0.111 | qBittorrent client |
| 120 | gbgreg | 192.168.0.120 | Ollama, Kokoro TTS API (:5011), EllaBot RAG (:5010) |
| 131 | podcast-factory | 192.168.0.131 | FreshRSS (:80), Podcast Feed (:8081) |

## Docker Compose Locations

All Docker services on Proxmox are managed via compose files:

| Service | Compose Location |
|---------|-----------------|
| Tandoor | `/opt/docker/apps/tandoor/docker-compose.yml` |
| Uptime Kuma | `/opt/docker/apps/uptime-kuma/docker-compose.yml` |
| SearXNG | `/opt/docker/apps/searxng/docker-compose.yml` |
| ArchiveBox | `/opt/docker/apps/archivebox/docker-compose.yml` |
| n8n | `/opt/docker/apps/n8n/docker-compose.yml` |
| Headscale | `/opt/docker/apps/headscale/docker-compose.yml` |
| Immich | `/opt/immich/docker-compose.yml` |
| Chatterbox TTS | `/opt/docker/apps/chatterbox/docker-compose.yml` |

## Docker Network

- **homelab-net**: Shared bridge network for cross-service communication
- Individual service stacks also create their own networks

## Proxmox Docker Notes

- Most containers need `security_opt: apparmor=unconfined` (AppArmor blocks process spawning)
- Docker log rotation configured: max-size 10m, max-file 3
- Weekly Docker prune cron at `/etc/cron.weekly/docker-prune`

## Service Migration Plan (Node 1 → Node 2)

### Stays on Node 1 (GPU workloads)

| Service | Reason |
|---------|--------|
| Plex | NVENC transcoding (RTX 5070 Ti) |
| Immich | ML classification uses GPU |
| Chatterbox TTS | GPU voice cloning |
| Ollama / CT 120 | LLM inference |
| ComfyUI | Image generation |
| Gaming VMs | GPU passthrough |
| Prometheus + Node Exporter | Run exporters on BOTH nodes |

### Migrates to Node 2 (5 waves)

| Wave | Services | Priority |
|------|----------|----------|
| 1 - DNS & Gateway | AdGuard Home, nginx reverse proxy | Must-first |
| 2 - Auth & HA | Authelia, Home Assistant | High |
| 3 - Databases | CouchDB, PostgreSQL instances, Command Server | High |
| 4 - Applications | Nextcloud, n8n, Tandoor, SearXNG, ArchiveBox, Headscale, Uptime Kuma | Medium |
| 5 - Content & LXCs | FreshRSS, Podcast Factory, qBittorrent, Diller Queen | Low |

Each wave is independent. Execute one per session, verify, move on.

## Frontend Dashboard

This section details the dual-theme Vue.js dashboard.

```
frontend/          # Dual-theme Vue.js dashboard
│   ├── src/           # Vue components and source code
│   │   ├── components/themes/retro/  # Gaming theme components
│   │   ├── components/themes/naive/  # Professional theme components
│   │   └── themes/    # Main theme entry points
│   ├── dist/          # Built production files (retro)
│   ├── dist-naive/    # Built production files (naive)
│   ├── DEPLOYMENT-STRATEGY.md  # Dual-theme deployment docs
│   ├── nginx-dual-theme.conf   # Production nginx config
│   ├── package.json   # Dependencies and scripts
│   └── vite.config.ts # Development server configuration
```
