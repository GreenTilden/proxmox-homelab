# Node 2 Build, Network Architecture & Service Migration Plan

**Created**: 2026-02-28
**Status**: Planning — execute pieces as time allows
**Hardware acquired**: Dell Precision 5820 tower + Xeon W-2145 (~$375 total)

## Context

The current Proxmox host (i7-8700, 32GB) is overloaded: 89% root disk, 87% swap, 29 Docker containers + 5 LXCs. This plan covers the complete build-out: hardware assembly, network topology, service migration, and future expansion.

This is a **"big plan" reference document** — individual pieces get executed as time allows, without re-deriving the architecture each session.

---

## Phase 1: Micro Center Shopping List

| Item | Purpose | ~Price | Priority |
|------|---------|--------|----------|
| 256-500GB SATA SSD | Node 2 Proxmox boot drive | $20-30 | Must |
| 500GB-1TB SATA SSD | Node 2 service pool (container rootfs, DBs) | $35-55 | Must |
| 2nd matching SATA SSD | ZFS mirror for service pool (consulting data integrity) | $35-55 | Recommended |
| Razer Pro Click Mini mouse | Laptop mouse, quiet clicks, Linux-friendly (openrazer) | $55-70 | Must |
| UPS (APC Back-UPS 1500VA) | Protect both nodes + networking from power loss | $170-200 | Recommended |
| Zigbee USB dongle (Sonoff ZBDongle-E) | HA gateway for cheap sensors, no cloud dependency | $20-25 | Nice-to-have |
| Water leak sensors (2-3) | Basement, under sinks — baby + peace of mind | $30-45 | Nice-to-have |
| Smart plug 4-pack (TP-Link Kasa) | Remote reboot anything, HA integration | $25 | Nice-to-have |
| **Total range** | | **$160-505** | |

**Skip at Micro Center:** RAM (ECC RDIMMs are $15-25/stick on eBay), GPU (using existing AMD RX 6800 XT), HDDs (2TB included with tower).

---

## Phase 2: Current Network Topology

### Physical Layout (Basement to House)

```
[INTERNET] ─── Modem (utility room, basement)
                  │
              [ROUTER] (utility room)
                  │
        ┌─────────┼──────────────┐
        │         │              │
   [4-PORT SW]  [SWITCH]    [SERVER CLOSET]
   (desk area)  (living rm)  (above sump pump)
        │         │              │
   ┌────┴────┐  ┌─┴────┐    ┌───┴────┐
   │ Work    │  │ TV   │    │ Proxmox│
   │ Laptop  │  │ Xbox │    │ .99    │
   │ Dev Box │  │ Switch│   │        │
   │ (dinux) │  │ Spare │   │ Node 2 │ ← NEW
   │ .127    │  │ ports │   │ .98    │
   └─────────┘  └──────┘   └────────┘

   [TP-Link AX3000] ← Old router, available for reuse
```

### Current IP Allocation

| Device | IP | Role |
|--------|-----|------|
| Router | 192.168.0.1 (assumed) | Gateway, DHCP |
| Proxmox host | 192.168.0.99 | Node 1 — GPU workloads |
| CT 100 (frontend) | 192.168.0.250 | Nginx, dashboard, APIs |
| CT 110 (qbittorrent) | 192.168.0.111 | Torrent client |
| CT 120 (gbgreg) | 192.168.0.120 | Kokoro TTS, Ollama |
| CT 131 (podcast) | 192.168.0.131 | FreshRSS, podcast feed |
| CT 140 (dillerqueen) | 192.168.0.140 | Game server |
| dinux (dev box) | 192.168.0.127 (WiFi) / .128 (Ethernet) | Development |
| **Node 2** | **192.168.0.98** | **Stable services** |

Node 2 at .98 keeps it adjacent to .99 for easy mental mapping.

### Network Improvements (Execute When Ready)

**Option A: TP-Link as IoT isolation AP**
- Factory reset the AX3000, set it as AP mode
- Different SSID (e.g., "Ellanet-IoT"), different subnet (192.168.1.x)
- SwitchBot, smart plugs, ESP32s, Zigbee bridge connect here
- Firewall rules: IoT can talk to HA (port 8123) but not to other devices
- Prevents compromised IoT devices from reaching dev boxes

**Option B: TP-Link as Wi-Fi extender**
- Same SSID, bridge mode
- Extends coverage to dead spots (basement? upstairs?)
- Simpler setup, no isolation benefit

**Option C: Dual-purpose (Recommended)**
- 2.4GHz radio: "Ellanet-IoT" SSID, IoT devices only
- 5GHz radio: Same SSID as main router, bridge mode for coverage
- Most IoT devices are 2.4GHz-only anyway, so this is natural
- Requires router that supports per-band SSID (AX3000 does)

**Managed switch upgrade (future):**
- TP-Link TL-SG108E (~$30-60) at the server closet gives VLANs
- Isolate client traffic at L2 without separate physical networks
- Not urgent — current setup works fine for now

---

## Phase 3: Node 2 Hardware Build

### Dell Precision 5820 Specs

| Component | Detail |
|-----------|--------|
| Form factor | Full tower workstation |
| CPU socket | LGA 2066 |
| Stock CPU | Xeon W-2102 (4C/4T, 3.9GHz) |
| Upgrade CPU | **Xeon W-2145 (8C/16T, 3.7/4.5GHz)** — acquired |
| RAM | 32GB ECC RDIMM DDR4 (included with tower) |
| PSU | Check label — need 950W for RX 6800 XT (300W TDP) |
| Stock HDD | 2TB (included) |

### Assembly Steps

1. **Unbox Dell 5820**, remove side panel
2. **Check PSU wattage** — label on PSU inside. Need 950W for the RX 6800 XT (300W TDP). If 425W, run headless without GPU until PSU swap.
3. **Swap CPU**: Remove Xeon W-2102 stock cooler → swap in W-2145 → reinstall cooler (same LGA 2066 socket, same TDP class, stock cooler works)
4. **Install boot SSD**: SATA SSD into any available SATA bay
5. **Install service pool SSD(s)**: Second SATA SSD (or pair for ZFS mirror) into SATA bays
6. **Install AMD RX 6800 XT**: Into PCIe x16 slot (if PSU supports it — see step 2)
7. **Connect ethernet**: Run cable from server closet switch/router to Node 2
8. **Power on, enter BIOS**: Verify W-2145 detected, RAM detected (32GB), boot order set to SSD
9. **Enable VT-x/VT-d and IOMMU** in BIOS (for future VM passthrough)

### AMD RX 6800 XT Decision

**Move to Node 2: YES (if 950W PSU)**

| Factor | Keep on Node 1 | Move to Node 2 |
|--------|----------------|-----------------|
| Plex transcoding | VA-API (AMD) | NVENC (RTX 5070 Ti) — actually faster |
| Batocera gaming | Shared with AI workloads | Dedicated, no competition |
| macOS VM | Won't work (RDNA2 documented failure) | Won't work (same card) |
| Display output | Node 1 has iGPU fallback | Node 2 Xeon has NO iGPU — headless without it |
| Simplicity | Two GPUs competing for PCIe/power | Each node has one GPU, clean separation |

**Recommendation:** Move it. Node 1 simplifies to RTX 5070 Ti only (handles everything — NVENC is faster than VA-API anyway). Node 2 gets display output + Batocera gaming VM capability. macOS VM stays on Node 1 using Intel UHD 630 iGPU passthrough (the documented working approach).

**If 425W PSU:** Run Node 2 headless (no GPU). Manage via Proxmox web UI at `https://192.168.0.98:8006`. Batocera stays on Node 1. Revisit when a 950W PSU is available ($30-50 used on eBay for Dell 5820 specific unit).

### Storage Layout (Node 2)

```
Node 2 Storage:
├── Boot SSD (256-500GB) — Proxmox OS + local-lvm
├── Service Pool
│   ├── SSD 1 (500GB-1TB) ─┐
│   └── SSD 2 (matching)   ┘── ZFS mirror "service-pool"
│       ├── /services/          — container rootfs, app data
│       ├── /clients/           — consulting client isolation
│       │   ├── biosero/        — own snapshots, quotas
│       │   ├── lilly/          — own snapshots, quotas
│       │   └── template/       — clone-ready base
│       └── /backups/           — cross-node backup target
└── Stock 2TB HDD — staging, bulk, non-critical
```

---

## Phase 4: Node 2 Proxmox Setup

### Install Proxmox

1. Download Proxmox VE ISO, flash to USB
2. Boot Dell 5820 from USB
3. Install to boot SSD
4. Set hostname: `pve2`
5. Set IP: `192.168.0.98/24`, gateway `192.168.0.1`, DNS `192.168.0.99` (AdGuard)
6. Set root password, complete install

### Post-Install Configuration

```bash
# Remove enterprise repo (no subscription), add no-subscription repo
sed -i 's/^deb/#deb/' /etc/apt/sources.list.d/pve-enterprise.list
echo "deb http://download.proxmox.com/debian/pve bookworm pve-no-subscription" > /etc/apt/sources.list.d/pve-no-subscription.list
apt update && apt dist-upgrade -y

# Install useful tools
apt install -y lm-sensors htop iotop

# Create ZFS service pool (if using mirror)
zpool create service-pool mirror /dev/sdX /dev/sdY
zfs create service-pool/services
zfs create service-pool/clients
zfs create service-pool/backups

# Set up ZFS datasets for consulting isolation
zfs create service-pool/clients/template
zfs set quota=50G service-pool/clients/template
# Clone per-client: zfs clone service-pool/clients/template@base service-pool/clients/biosero

# If AMD GPU installed, verify passthrough capability
dmesg | grep -i iommu
lspci | grep -i amd
```

### Do NOT Cluster

Run Node 1 and Node 2 as **standalone Proxmox instances**. Clustering requires:
- Shared storage (not set up)
- Quorum (minimum 3 nodes, or 2 + corosync hacks)
- Adds complexity with minimal benefit at this scale

Migrate containers manually via `vzdump` backup → SCP → `pct restore`. Simple and reliable.

---

## Phase 5: Service Migration

### Migration Order (execute incrementally)

Each step is independent — do one per session, verify, move on.

**Wave 1: DNS & Gateway (highest impact, must go first)**

| # | Service | Notes |
|---|---------|-------|
| 1 | AdGuard Home → Node 2 Docker | If Node 1 reboots, DNS dies for whole house without this. Update router DHCP DNS to 192.168.0.98 |
| 2 | nginx reverse proxy → Node 2 LXC | Copy /etc/nginx/ config from CT 100. Update router port forwarding: 80/443 → 192.168.0.98. This is the Big Switch — all *.darrenarney.com traffic moves. Test thoroughly. |

**Wave 2: Auth & Home Automation**

| # | Service | Notes |
|---|---------|-------|
| 3 | Authelia → Node 2 Docker | Auth gateway — if down, everything behind it breaks. nginx on Node 2 can talk to Authelia locally. |
| 4 | Home Assistant → Node 2 Docker | Critical home infra, shouldn't share with GPU experiments. Move HA config volume, verify integrations (Cync, Zigbee). If Zigbee dongle is USB: plug into Node 2 physically. |

**Wave 3: Databases & Core Services**

| # | Service | Notes |
|---|---------|-------|
| 5 | CouchDB (Obsidian sync) → Node 2 Docker | |
| 6 | PostgreSQL instances (n8n, Immich) → Node 2 Docker | Immich's Postgres can move even if Immich stays on Node 1. Update connection strings to 192.168.0.98. |
| 7 | Command Server (Flask) → Node 2 LXC | Move /opt/command_server.py + /opt/blueprints/. Update nginx proxy_pass targets. |

**Wave 4: Application Services**

| # | Service | Notes |
|---|---------|-------|
| 8 | Nextcloud → Node 2 Docker | |
| 9 | n8n → Node 2 Docker | |
| 10 | Tandoor → Node 2 Docker | |
| 11 | SearXNG + Valkey → Node 2 Docker | |
| 12 | ArchiveBox → Node 2 Docker | |
| 13 | Headscale → Node 2 Docker | |
| 14 | Uptime Kuma → Node 2 Docker | Monitors BOTH nodes now |

**Wave 5: Content & LXCs**

| # | Service | Notes |
|---|---------|-------|
| 15 | FreshRSS + Podcast Factory → Node 2 LXC or Docker | |
| 16 | qBittorrent → Node 2 LXC | Frees CT 110 on Node 1 |
| 17 | Diller Queen → Node 2 LXC | Frees CT 140, no GPU needed |

### What Stays on Node 1 (GPU workloads)

| Service | Why |
|---------|-----|
| Plex | NVENC transcoding (RTX 5070 Ti) |
| Immich | ML classification uses GPU |
| Chatterbox TTS | GPU voice cloning |
| Ollama / CT 120 (gbgreg) | LLM inference |
| ComfyUI | Image generation |
| Gaming VMs | GPU passthrough |
| macOS VM | Intel UHD 630 iGPU passthrough |
| Prometheus + Node Exporter | Run exporters on BOTH nodes |
| Minecraft | Ephemeral, doesn't matter |

### Cross-Node Backup Strategy

```bash
# Node 1 → Node 2 (nightly cron)
zfs snapshot service-pool/services@daily-$(date +%Y%m%d)
zfs send service-pool/services@daily-$(date +%Y%m%d) | \
  ssh root@192.168.0.98 zfs recv service-pool/backups/node1

# Node 2 → Node 1 (nightly cron)
# On Node 2:
zfs send service-pool/services@daily-$(date +%Y%m%d) | \
  ssh root@192.168.0.99 zfs recv backup-pool/node2
```

---

## Phase 6: UPS & Power

### Placement: Server Closet

The UPS goes in the server closet (above the sump pump) protecting:

| Device | Why |
|--------|-----|
| Node 1 (Proxmox) | ZFS dirty shutdown = potential data loss |
| Node 2 (Dell 5820) | Same — ZFS + consulting data |
| Router | Keep internet up during brief outages |
| Server closet switch | Keep LAN connectivity |

**NOT on the UPS** (too far away, separate circuits):
- Furnace, water softener (utility room, different concern)
- Desk switch, TV switch (not critical)

### NUT (Network UPS Tools) Setup

1. Install NUT on Node 2 (the "stable" one) — USB connects UPS to Node 2
2. Configure as NUT server, Node 1 as NUT client
3. HA integration: NUT sensor in Home Assistant for battery %, load, status
4. Auto-shutdown: Both nodes gracefully shut down at 20% battery
5. Dashboard: Add UPS status widget to the ops dashboard

---

## Phase 7: TP-Link AX3000 Router Options

### Option A: IoT Isolation Network
- Factory reset AX3000, static IP: 192.168.1.1 (different subnet)
- SSID: "Ellanet-IoT"
- Connect WAN port to main router LAN port
- Devices: SwitchBot hub, smart plugs, ESP32s, Zigbee bridge
- Benefit: Compromised IoT device can't reach dev machines
- Downside: Devices on 192.168.1.x can't directly reach 192.168.0.x (need routing rules for HA access)

### Option B: Wi-Fi Range Extender
- Set to AP/bridge mode, same SSID as main router
- Place in area with weak coverage
- Benefit: Simple, no network segmentation to manage
- Downside: No security isolation

### Option C: Dual-Purpose (Recommended)
- 2.4GHz radio: "Ellanet-IoT" SSID, IoT devices only
- 5GHz radio: Same SSID as main router, bridge mode for coverage
- Most IoT devices are 2.4GHz-only anyway, so this is natural
- Requires router that supports per-band SSID (AX3000 does)

---

## Phase 8: Future Enhancements (Parked Ideas)

### Quick Wins (weekend projects)
- **ESPHome**: Flash existing ESP32 boards via HA, wire up DHT22/BME280 sensors
- **Mosquitto MQTT**: Lightweight Docker on Node 2, central IoT message bus
- **Grafana**: Visualization layer on top of existing Prometheus data
- **NFC tags**: $8 for a 10-pack, trigger HA automations by phone tap

### Medium Projects
- **Frigate NVR**: AI camera DVR, runs on Node 1 with RTX 5070 Ti or Coral TPU
- **Batocera VM on Node 2**: Retro gaming with AMD GPU passthrough (confirmed working)
- **macOS VM on Node 1**: Intel UHD 630 iGPU + HDMI dummy plug (~$10), Screen Sharing + RustDesk

### Consulting Infrastructure
- **Per-client ZFS datasets**: Isolated snapshots, quotas, independent backup/teardown
- **VLAN segmentation**: Managed switch at server closet, client traffic isolated at L2
- **VPN per client**: Headscale namespaces or WireGuard tunnels for client access

---

## Verification & Testing

After each migration wave:
1. `curl https://home.darrenarney.com` — dashboard loads
2. `curl https://auth.darrenarney.com` — Authelia responds
3. Check Uptime Kuma — all monitored services green
4. Test from phone (external, over cellular) — HTTPS works end-to-end
5. Run `zpool status` on Node 2 — all pools ONLINE, no errors
6. Check `free -h` on Node 1 — confirm RAM/swap pressure reduced

---

## Files Updated

- `docs/UNIFIED-REFERENCE/ARCHITECTURE/HARDWARE_OVERVIEW.md` — Node 2 section added
- `docs/UNIFIED-REFERENCE/ARCHITECTURE/SERVICES_OVERVIEW.md` — migration plan and Node 2 services
- `docs/UNIFIED-REFERENCE/MASTER-INDEX.md` — Node 2 build plan linked
- Obsidian: `02-Areas/Homelab/Infrastructure/Node2-Build-Plan.md`
- Obsidian: `02-Areas/Homelab/Infrastructure/Node2-Shopping-List.md`
- Memory: MEMORY.md updated with Node 2 facts
