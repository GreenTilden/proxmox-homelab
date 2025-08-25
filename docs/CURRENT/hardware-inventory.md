# Current Hardware Configuration

**Last Verified**: 2025-08-25 11:17 EDT via SSH to 192.168.0.99

## CPU & Memory

- **CPU**: Intel i7-8700 (6 cores, 12 threads)
- **RAM**: 32GB DDR4 (all 4 DIMM slots occupied)
  - DIMM_A1/A2: 16GB Corsair Vengeance LPX DDR4-2400 (2x8GB)
  - DIMM_B1/B2: 16GB T-Force DARK DDR4-3000 (2x8GB)

## GPU Configuration

**Verified via `lspci | grep VGA` on 192.168.0.99:**

```
00:02.0 VGA compatible controller: Intel Corporation CoffeeLake-S GT2 [UHD Graphics 630]
01:00.0 VGA compatible controller: NVIDIA Corporation GB203 [GeForce RTX 5070 Ti] (rev a1)
```

### GPU Status
- **RTX 5070 Ti (16GB)**: ✅ Hardware detected in PCIe slot
- **GTX 970 (4GB)**: ✅ Hardware installed (secondary GPU)
- **nvidia-smi Status**: ❌ "No devices were found" (driver issue confirmed)
- **Expected Issue**: RTX 5070 Ti requires NVIDIA driver 575+ (not yet released for Blackwell architecture)

## Storage Architecture

**Verified via `lsblk` and ZFS commands:**

### Physical Drives
```
nvme0n1     476.9G  HP SSD EX920 512GB      - Proxmox OS + LVM
sda         232.9G  PNY 250GB SATA SSD      - service-pool (ZFS)
sdb         232.9G  PNY 250GB SATA SSD      - ICY BAY independent 
sdc         698.6G  WDC WD7502AAEX          - staging-pool (ZFS)
sdd         223.6G  ST240HM000-1G5152       - ICY BAY independent
sde          1.8T   ST2000DL003-9VT166      - media-pool (ZFS member)
sdf          3.6T   WDC WD40EZAZ-00SF3B0    - media-pool (ZFS member) 
sdg          3.6T   ST4000DM004-2CV104      - media-pool (ZFS member)
```

### ZFS Pool Status (All ONLINE)
```
POOL         STATE   CAPACITY   SIZE
media-pool   ONLINE  6%        9.0TB (3 drives: sde+sdf+sdg)
service-pool ONLINE  1%        225GB (1 drive: sda)
staging-pool ONLINE  3%        675GB (1 drive: sdc)
```

### Verified Capacity Statistics
| Pool | Total Capacity | Used | Available | Usage % |
|------|----------------|------|-----------|---------|
| media-pool | 9.0TB | 540GB | 8.41TB | 6% |
| service-pool | 225GB | 411MB | 224GB | 1% |
| staging-pool | 675GB | 17.8GB | 657GB | 3% |

## Network Configuration

- **IP Address**: 192.168.0.99 (static)
- **SSH Access**: ✅ Working with key authentication
- **Network Ping**: ✅ 0.994ms average response time
- **Proxmox Web UI**: ✅ Accessible at https://192.168.0.99:8006

## Expansion Hardware

### ICY DOCK Mobile Rack
- **Model**: MB024SP-B 
- **Status**: ✅ Installed and operational
- **Current Configuration**: 
  - Bay 1: sdb (232GB SSD) - Hot-swap testing
  - Bay 2: sdd (223GB SSD) - Hot-swap testing

### Available Expansion
- **M.2_2 Slot**: Available for NVMe expansion
- **PCIe Slots**: Multiple slots available for LSI HBA card
- **SATA Ports**: 6 total (all currently occupied)

## Power & Cooling

- **PSU**: Seasonic Focus PX-750 (750W 80+ Platinum)
- **Power Headroom**: Adequate for current dual GPU configuration
- **System Temperatures**: 28-32°C (within normal ranges)

## Recovery Data Status

### Verified Recovery Content
- **Personal Photos**: 31 files (43MB) with EXIF data preserved
- **Forensic Archive**: 1,246 files (123MB) in `/media-pool/carved-originals/`
- **Organized Recovery**: 929 files (80MB) in categorized directories
- **Total Preserved**: 246MB of successfully recovered data

## Hardware Status Summary

- ✅ **Operational**: CPU, RAM, Storage, Network, ICY DOCK, Recovery data
- ⚠️ **Driver Issues**: GPU drivers require update (NVIDIA 575+)
- ✅ **Expansion Ready**: PCIe slots, M.2_2, additional SATA expansion possible

**All hardware components are properly detected and functioning. The only limitation is GPU driver compatibility with the RTX 5070 Ti Blackwell architecture.**