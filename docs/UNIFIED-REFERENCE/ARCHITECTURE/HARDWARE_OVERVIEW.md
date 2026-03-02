# Hardware Overview

## Node 1 — Current Proxmox Host (192.168.0.99)

- **CPU**: Intel i7-8700 (6 cores, 12 threads, VT-x/VT-d enabled)
- **Motherboard**: 6 SATA ports, 2 M.2 slots, multiple PCIe slots
- **RAM**: 32GB total (all 4 DIMM slots occupied)
  - DIMM_A1/A2: 16GB Corsair Vengeance LPX DDR4-2400 (2x8GB)
  - DIMM_B1/B2: 16GB T-Force DARK DDR4-3000 (2x8GB)
- **GPU**: NVIDIA GeForce RTX 5070 Ti 16GB (PCIe x16_1 slot) - **INSTALLED** ✅
  - Reserved for: AI/LLM inference, Plex NVENC transcoding, Gaming VMs
  - Driver: NVIDIA 570.86.16 with CUDA 12.5
- **PSU**: Seasonic Focus PX-750 (750W 80+ Platinum)
- **Network**: 192.168.0.99
- **Role**: GPU workloads — Plex, Immich ML, Chatterbox TTS, Ollama, ComfyUI, gaming VMs

## Node 2 — Dell Precision 5820 (192.168.0.98) — ACTIVE

- **Chassis**: Dell Precision 5820 Tower (~$275 acquired)
- **CPU**: Intel Xeon W-2145 (8 cores, 16 threads, 3.7/4.5GHz turbo) — upgraded from stock W-2102 (~$100 acquired)
- **Socket**: LGA 2066
- **RAM**: 32GB ECC RDIMM DDR4 (included with tower)
- **GPU**: Quadro K2200 (display output only, no compute use)
- **PSU**: Dell 5820 stock (425W)
- **Storage**: pve-root 94G (52% used as of 2026-03-02), stock 2TB HDD
- **Network**: 192.168.0.98
- **Role**: Stable services — Immich, Nextcloud, Uptime Kuma, SearXNG, ArchiveBox, n8n, Headscale, Kavita, Prometheus
- **Known issue**: 3.5" flex bays need 2.5"-to-3.5" adapter brackets for SSDs (loose SSD caused POST failure on first move)

### Node 2 Storage Layout

```
├── Boot SSD (256-500GB SATA) — Proxmox OS + local-lvm
├── Service Pool (ZFS mirror recommended)
│   ├── SSD 1 (500GB-1TB SATA) ─┐
│   └── SSD 2 (matching SATA)   ┘── ZFS mirror "service-pool"
│       ├── /services/          — container rootfs, app data
│       ├── /clients/           — consulting client isolation (per-client snapshots, quotas)
│       └── /backups/           — cross-node backup target
└── Stock 2TB HDD — staging, bulk, non-critical
```

### Node 2 Setup Notes
- **Do NOT cluster** with Node 1 — standalone instances, migrate via vzdump/SCP
- **Hostname**: `pve2`
- **DNS**: Points to Node 1 AdGuard initially, then to itself after AdGuard migrates
- **Full build plan**: [Node 2 Build Plan](../../NODE2-BUILD-PLAN.md)

## Node 1 Storage Architecture (Post-Recovery)
- **M.2_1**: HP SSD EX920 512GB NVMe (Proxmox OS + 347.9G LVM)
- **M.2_2**: Available

**ZFS Production Pools:**
- **media-pool** (9.06TB): sdf (3.6TB) + sde (1.8TB) + sdg (3.6TB) - All HDDs for Plex
- **service-pool** (232GB): sda (232GB SSD) - Fast storage for containers/services
- **staging-pool** (696GB): sdc (698GB) - Working storage and staging area

**ICY BAY Independent Drives:**
- **sdb** (232GB SSD) - Hot-swap testing and experiments
- **sdd** (223GB SSD) - Hot-swap testing and experiments

**Recovery Data Protected:**
- Personal photos: 31 files (43MB) with EXIF data preserved
- Carved originals: 1,246 files (123MB) forensic archive
- Organized recovery: 929 files (80MB) categorized content

## Hardware Status Update (2026-03-02)
- ✅ **Node 2 ACTIVE**: Dell 5820 online, 11 services migrated, stable at 52% disk
- ✅ **GPU Setup**: RTX 5070 Ti operational with NVIDIA 570.86.16 drivers
- ✅ **ICY DOCK**: MB024SP-B mobile rack operational
- ✅ **Cross-node monitoring**: Prometheus scraping both nodes, watchdog on Node 1
- ⚠️ **Node 1 pve-root at 76%**: Clean up stopped containers from pre-migration
- 🔧 **Node 2 SSD**: Needs 2.5"-to-3.5" adapter bracket for flex bay
- 🔧 **Storage Expansion Plans** (parked):
  - LSI HBA card in PCIe x16_2 slot (adds 8 SATA ports)
  - SATA power splitters for additional drives
  - Shuck 3 external USB drives for pool growth
  - Configure M.2_2 to x2 mode (preserves SATA_5/6 ports)

## Hardware Shopping Guide

### Node 2 Build (Next Micro Center Trip)

| Item | Purpose | ~Price | Priority |
|------|---------|--------|----------|
| 256-500GB SATA SSD | Node 2 Proxmox boot drive | $20-30 | Must |
| 500GB-1TB SATA SSD | Node 2 service pool | $35-55 | Must |
| 2nd matching SATA SSD | ZFS mirror for service pool | $35-55 | Recommended |
| Razer Pro Click Mini | Laptop mouse, quiet clicks | $55-70 | Must |
| UPS (APC Back-UPS 1500VA) | Protect both nodes + networking | $170-200 | Recommended |
| **Total range** | | **$160-505** | |

**Skip at Micro Center:** ECC RDIMMs ($15-25/stick on eBay), GPU (existing RX 6800 XT), HDDs (2TB included).

### Node 1 Expansion (Parked)

#### LSI HBA Card ($50-70)
- **LSI 9211-8i in IT Mode** - Install in PCIe x16_2 slot
- **Include**: 2x SFF-8087 to 4x SATA breakout cables
- **Result**: Adds 8 SATA ports (total: 14 drives possible)

#### SATA Power Expansion ($20-30)
- **2x GELRHONR 4-Way SATA Power Splitters**
- **SATA cable variety pack** (18", 24", 36" lengths)

### IoT & Smart Home (Nice-to-have)

| Item | Purpose | ~Price |
|------|---------|--------|
| Zigbee USB dongle (Sonoff ZBDongle-E) | HA gateway, no cloud dependency | $20-25 |
| Water leak sensors (2-3) | Basement, under sinks — baby safety | $30-45 |
| Smart plug 4-pack (TP-Link Kasa) | Remote reboot, HA integration | $25 |

### Full build plan: [Node 2 Build Plan](../../NODE2-BUILD-PLAN.md)
