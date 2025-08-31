# Complete Hardware Inventory - Unified Reference

**Status**: ✅ **VERIFIED OPERATIONAL**
**Last Updated**: 2025-08-27 (Consolidated from all worktrees)
**Verification Method**: Direct SSH to 192.168.0.99
**Location**: `/home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/ARCHITECTURE/`

## 🖥️ **Core System Components**

### **CPU & Motherboard**
- **CPU**: Intel Core i7-8700 (Coffee Lake)
  - 6 physical cores, 12 threads
  - VT-x/VT-d enabled (virtualization support)
  - Base: 3.2 GHz, Turbo: 4.6 GHz
- **Motherboard**: 
  - 4x DIMM slots (all populated)
  - 6x SATA III ports (all occupied)
  - 2x M.2 NVMe slots (1 occupied)
  - Multiple PCIe slots available

### **Memory Configuration**
- **Total RAM**: 32GB DDR4
- **Configuration**: Dual-channel, mixed kit
  - DIMM_A1/A2: 16GB Corsair Vengeance LPX DDR4-2400 (2x8GB)
  - DIMM_B1/B2: 16GB T-Force DARK DDR4-3000 (2x8GB)
- **Operating Speed**: 2400MHz (limited by slower kit)

### **Power & Thermal**
- **PSU**: Seasonic Focus PX-750 (750W 80+ Platinum)
  - Efficiency: 92-94% at typical loads
  - Headroom: Adequate for dual GPU + expansion
- **Cooling**: Stock configuration
  - CPU temps: 28-32°C idle, 45-55°C load
  - System temps: Within normal ranges

## 🎮 **GPU Configuration**

### **Primary GPU - RTX 5070 Ti**
```
01:00.0 VGA compatible controller: NVIDIA Corporation GB203 [GeForce RTX 5070 Ti] (rev a1)
```
- **Model**: NVIDIA GeForce RTX 5070 Ti
- **VRAM**: 16GB GDDR7
- **Architecture**: Blackwell (GB203)
- **PCIe Slot**: x16_1 (primary)
- **Driver Status**: ❌ Requires NVIDIA 575+ (not yet released)
- **Current Issue**: `RmInitAdapter failed! (0x62:0x40:1860)`
- **Planned Use**: 
  - AI/LLM inference (when drivers available)
  - Hardware transcoding for Plex
  - Windows 11 VM passthrough

### **Integrated GPU**
```
00:02.0 VGA compatible controller: Intel Corporation CoffeeLake-S GT2 [UHD Graphics 630]
```
- **Model**: Intel UHD Graphics 630
- **Use Case**: Proxmox console, basic display output

### **Secondary GPU (Removed)**
- **GTX 970**: Removed 2025-08-25 (dual GPU complexity)

## 💾 **Storage Architecture**

### **NVMe Storage**
| Device | Capacity | Model | Usage | Mount |
|--------|----------|-------|-------|-------|
| nvme0n1 | 476.9G | HP SSD EX920 512GB | Proxmox OS + LVM | / |
| M.2_2 | Empty | Available slot | Future expansion | - |

### **SATA Storage**
| Device | Capacity | Model | Pool/Usage | Status |
|--------|----------|-------|------------|--------|
| sda | 232.9G | PNY 250GB SSD | service-pool | ZFS member |
| sdb | 232.9G | PNY 250GB SSD | ICY BAY hot-swap | Independent |
| sdc | 698.6G | WD7502AAEX | staging-pool | ZFS member |
| sdd | 223.6G | ST240HM000 | ICY BAY hot-swap | Independent |
| sde | 1.8T | ST2000DL003 | media-pool | ZFS member |
| sdf | 3.6T | WD40EZAZ | media-pool | ZFS member |
| sdg | 3.6T | ST4000DM004 | media-pool | ZFS member |

### **ZFS Pool Summary**
| Pool | Total Size | Used | Available | Drives | Purpose |
|------|------------|------|-----------|--------|---------|
| media-pool | 9.0TB | 540GB (6%) | 8.41TB | sde+sdf+sdg | Media storage |
| service-pool | 225GB | 411MB (1%) | 224GB | sda | Fast services |
| staging-pool | 675GB | 17.8GB (3%) | 657GB | sdc | Working space |

## 🔌 **Expansion & Peripherals**

### **ICY DOCK Mobile Rack**
- **Model**: MB024SP-B (2-bay SATA hot-swap)
- **Location**: 5.25" drive bay
- **Status**: ✅ Operational
- **Configuration**:
  - Bay 1: sdb (232GB SSD)
  - Bay 2: sdd (223GB SSD)
- **Use Case**: Hot-swap testing, experimental deployments

### **Available Expansion**
- **PCIe Slots**: 
  - x16_2: Available for LSI HBA card
  - x1 slots: Available for additional cards
- **M.2 Slots**: M.2_2 available for NVMe expansion
- **SATA Expansion**: Via LSI HBA card (adds 8 ports)
- **USB Drives**: 3 external drives ready to shuck

## 🌐 **Network Configuration**

### **Ethernet Interface**
- **IP Address**: 192.168.0.99 (static)
- **Gateway**: 192.168.0.1
- **DNS**: 8.8.8.8, 8.8.4.4
- **Speed**: 1 Gbps full duplex
- **Latency**: <1ms to local network

### **Service Endpoints**
| Service | Port | URL | Status |
|---------|------|-----|--------|
| Proxmox UI | 8006 | https://192.168.0.99:8006 | ✅ Operational |
| SSH | 22 | ssh root@192.168.0.99 | ✅ Key auth |
| Plex | 32400 | http://192.168.0.99:32400 | ✅ Running |
| Grafana | 3000 | http://192.168.0.99:3000 | ✅ Active |
| FileBrowser | 8080 | http://192.168.0.99:8080 | ✅ Working |

## 📊 **Performance Metrics**

### **System Load**
- **CPU Usage**: 5-15% typical (6 cores available)
- **Memory Usage**: 8-12GB used (20GB available)
- **Disk I/O**: Low utilization across all pools
- **Network**: <10Mbps typical usage

### **Capacity Planning**
- **CPU**: Excellent headroom for containers/VMs
- **RAM**: 20GB available for new services
- **Storage**: 9.36TB total available space
- **GPU**: Awaiting driver support for AI workloads

## 🛠️ **Maintenance & Issues**

### **Current Issues**
1. **RTX 5070 Ti Drivers**: Awaiting NVIDIA 575+ release
   - Hardware detected but not functional
   - Blocking GPU acceleration features

### **Completed Maintenance**
- ✅ ZFS pools recovered and operational (2025-08-23)
- ✅ ICY DOCK installation complete (2025-08-21)
- ✅ GTX 970 removed for simplification (2025-08-25)
- ✅ Recovery data preserved (246MB saved)

### **Planned Upgrades**
1. **LSI HBA Card**: Add 8 SATA ports (~$70)
2. **SATA Power Splitters**: Support additional drives (~$20)
3. **M.2 NVMe**: Fast storage expansion (future)
4. **External Drive Shucking**: Add 10-12TB capacity

## 🔍 **Verification Commands**

```bash
# Hardware detection
lspci | grep -E "VGA|3D"
lsblk -o NAME,SIZE,TYPE,MOUNTPOINT

# ZFS status
zpool status
zpool list
zfs list

# System resources
free -h
df -h
sensors

# Network verification
ip addr show
ss -tlpn
```

## 📝 **Historical Context**

### **Recovery Mission (2025-08-17 to 2025-08-23)**
- **Event**: ZFS pool signatures accidentally wiped
- **Impact**: 3.6TB Plex media library lost
- **Recovery**: 246MB personal photos and metadata preserved
- **Current State**: All pools rebuilt and operational

### **Hardware Evolution**
- **2025-08-17**: Initial system configuration
- **2025-08-21**: ICY DOCK mobile rack installed
- **2025-08-25**: GTX 970 removed, RTX 5070 Ti primary
- **2025-08-27**: Documentation consolidated

---

**This document is the single authoritative source for hardware configuration. All worktrees should reference this location.**