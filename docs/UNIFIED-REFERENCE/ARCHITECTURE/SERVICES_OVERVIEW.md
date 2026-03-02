# Services Overview

## Two-Node Architecture (Active — Migrated 2026-03-02)

Node 1 (192.168.0.99) handles GPU workloads. Node 2 (192.168.0.98, Dell Precision 5820) runs stable/infrastructure services. See [Node 2 Build Plan](../../NODE2-BUILD-PLAN.md) for the migration history.

## Active Services — Node 1 (192.168.0.99, GPU & Auth)

| Service | Port | Subdomain | Auth | Purpose |
|---------|------|-----------|------|---------|
| Home Assistant | 8123 | ha.darrenarney.com | Own auth | Smart home control |
| Plex | 32400 | - | Own auth | Media server (NVENC) |
| Authelia | 9091 | auth.darrenarney.com | - | SSO/2FA gateway |
| AdGuard Home | 53, 3000, 8083 | - | Own auth | DNS ad blocking |
| Chatterbox TTS | 8004 | - | - | GPU voice cloning (RTX 5070 Ti) |
| Casey Junior | 8902 | - | - | Automation API |
| Nanit Proxy | 8085 | - | Token | Baby monitor streams |
| RustDesk | 21115-21119 | - | Own auth | Remote desktop |
| Node Exporter | 9100 | - | - | System metrics |
| Tandoor | 8080 | tandoor.darrenarney.com | Authelia | Recipe management (stopped) |
| Minecraft | - | - | - | Game server (stopped) |

## Active Services — Node 2 (192.168.0.98, Stable Services)

| Service | Port | Subdomain | Auth | Purpose |
|---------|------|-----------|------|---------|
| Immich | 2283 | photos.darrenarney.com | Own auth | Photo management |
| Nextcloud | 8090 | nextcloud.darrenarney.com | Authelia + OIDC | File sync, CalDAV |
| Uptime Kuma | 3001 | status.darrenarney.com | Own auth (public) | Status monitoring |
| SearXNG | 8888 | search.darrenarney.com | Authelia | Private search engine |
| ArchiveBox | 8200 | archive.darrenarney.com | Authelia | Web archiving |
| n8n | 5678 | n8n.darrenarney.com | Authelia | Workflow automation |
| Headscale | 8180 | headscale.darrenarney.com | OIDC | VPN mesh network |
| Kavita | 25600 | comics.darrenarney.com | Own auth | Comic/manga reader |
| Prometheus | 9090 | - | - | Metrics collection |
| Node Exporter | 9100 | - | - | System metrics |

## Cross-Node Monitoring

| Component | Location | Scope |
|-----------|----------|-------|
| Prometheus | Node 2 (:9090) | Scrapes node-exporter on both nodes |
| Uptime Kuma | Node 2 (:3001) | Service health checks |
| Node 2 Watchdog | Node 1 cron (*/5) | Pings Node 2 + 5 key services, logs to `/var/log/node2-watchdog.log` |

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

### Node 1 (192.168.0.99)

| Service | Compose Location |
|---------|-----------------|
| Tandoor | `/opt/docker/apps/tandoor/docker-compose.yml` |
| Chatterbox TTS | `/opt/docker/apps/chatterbox/docker-compose.yml` |

### Node 2 (192.168.0.98)

All compose files at `/opt/docker/apps/SERVICE/docker-compose.yml`, data at `/opt/data/SERVICE/`.

| Service | Compose Location |
|---------|-----------------|
| Immich | `/opt/docker/apps/immich/docker-compose.yml` |
| Nextcloud | `/opt/docker/apps/nextcloud/docker-compose.yml` |
| Uptime Kuma | `/opt/docker/apps/uptime-kuma/docker-compose.yml` |
| SearXNG | `/opt/docker/apps/searxng/docker-compose.yml` |
| ArchiveBox | `/opt/docker/apps/archivebox/docker-compose.yml` |
| n8n | `/opt/docker/apps/n8n/docker-compose.yml` |
| Headscale | `/opt/docker/apps/headscale/docker-compose.yml` |
| Kavita | `/opt/docker/apps/kavita/docker-compose.yml` |
| Prometheus | `/opt/docker/apps/prometheus/docker-compose.yml` |

## Docker Network

- **homelab-net**: Shared bridge network for cross-service communication
- Individual service stacks also create their own networks

## Proxmox Docker Notes

- Most containers need `security_opt: apparmor=unconfined` (AppArmor blocks process spawning)
- Docker log rotation configured: max-size 10m, max-file 3
- Weekly Docker prune cron at `/etc/cron.weekly/docker-prune`

## Migration Status (Completed 2026-03-02)

### Stays on Node 1 (GPU workloads)

| Service | Reason |
|---------|--------|
| Plex | NVENC transcoding (RTX 5070 Ti) |
| Chatterbox TTS | GPU voice cloning |
| Ollama / CT 120 | LLM inference |
| ComfyUI | Image generation |
| Home Assistant | Cync integration, not yet migrated |
| Authelia | Auth gateway, not yet migrated |
| AdGuard Home | DNS, not yet migrated |
| Gaming VMs | GPU passthrough |

### Migrated to Node 2 (Wave 4 complete)

| Service | Port | Status |
|---------|------|--------|
| Immich | 2283 | Running |
| Nextcloud | 8090 | Running |
| Uptime Kuma | 3001 | Running |
| SearXNG | 8888 | Running |
| ArchiveBox | 8200 | Running |
| n8n | 5678 | Running |
| Headscale | 8180 | Running |
| Kavita | 25600 | Running |
| Prometheus | 9090 | Running |
| RustDesk | 21115-21119 | Running |
| Neo4j | 7474 | Stopped (start when GBGreg needs it) |

### Not Yet Migrated

Waves 1-3 and 5 deferred — DNS, auth, databases, and LXC containers remain on Node 1/CT 100 for now.

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
