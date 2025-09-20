# Complete Hardware Inventory - Unified Reference

**Status**: ✅ **VERIFIED OPERATIONAL WITH MAJOR EXPANSION**
**Last Updated**: 2025-09-20 (LCiBot Dashboard Implementation)
**Verification Method**: Direct SSH to 192.168.0.99  
**Current Services**: 8 Docker containers + 1 LXC container operational
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

## 🐳 **Container Architecture**

### **Docker Service Stack (8 Containers)**
```
Production Services:
├── homer-dashboard        (Primary Interface)
├── portainer             (Container Management)
├── grafana               (16-bit Gaming Monitoring)
├── prometheus            (Metrics Collection)
├── node-exporter         (System Metrics)
├── cadvisor              (Container Metrics)
├── filebrowser-zfs       (ZFS Storage Access)
├── firefox-simple        (VNC Browser)
└── plex                 (Media Server - Service Issue)

### **LXC Container (1 Container)**
```
Media Acquisition:
└── deluge-server (CT 110) - Torrent client with staging-pool downloads
```

### **Service Categories**
- **🎮 Primary Interface**: Homer Dashboard (unified service portal)
- **🏰 Command Center**: Grafana, Portainer (management & monitoring)
- **⚔️ Media Kingdom**: Plex, Firefox, Deluge (entertainment)
- **🛡️ System Defense**: FileBrowser, Prometheus, cAdvisor (infrastructure)

## 🌐 **Network Configuration**

### **Ethernet Interface**
- **IP Address**: 192.168.0.99 (static)
- **Gateway**: 192.168.0.1
- **DNS**: 8.8.8.8, 8.8.4.4
- **Speed**: 1 Gbps full duplex
- **Latency**: <1ms to local network

### **Service Endpoints (15 Services Operational)**
| Service | Port | URL | Status | Container Type |
|---------|------|-----|--------|----------------|
| **🎮 Homer Dashboard** | 8090 | http://192.168.0.99:8090 | ✅ PRIMARY INTERFACE | Docker |
| Proxmox UI | 8006 | https://192.168.0.99:8006 | ✅ Operational | Native |
| SSH | 22 | ssh root@192.168.0.99 | ✅ Key auth | Native |
| Portainer | 9000 | http://192.168.0.99:9000 | ✅ Container Mgmt | Docker |
| Grafana | 3000 | http://192.168.0.99:3000 | ✅ 16-bit Gaming Theme | Docker |
| Firefox | 3001 | http://192.168.0.99:3001 | ✅ VNC Browser | Docker |
| Plex | 32400 | http://192.168.0.99:32400 | ⚠️ Container Issue | Docker |
| FileBrowser | 8080 | http://192.168.0.99:8080 | ✅ ZFS Access | Docker |
| Prometheus | 9090 | http://192.168.0.99:9090 | ✅ Metrics | Docker |
| Node Exporter | 9100 | http://192.168.0.99:9100 | ✅ System Metrics | Docker |
| cAdvisor | 8082 | http://192.168.0.99:8082 | ✅ Container Metrics | Docker |
| Deluge | 8112 | http://192.168.0.111:8112 | ✅ Torrents | LXC CT 110 |

## 📊 **Performance Metrics**

- **CPU Usage**: 15-35% typical with AI processing (77% during GPU acceleration)
- **Memory Usage**: 18-24GB used (8-14GB available)  
- **Disk I/O**: Moderate utilization with AI model loading
- **Network**: <50Mbps during AI model communication
- **GPU**: 77% utilization during AI inference (RTX 5070 Ti)

### **Container Architecture Resource Usage**
- **Homer Dashboard**: 50MB RAM, minimal CPU
- **PostgreSQL**: 200MB RAM, moderate I/O
- **Monitoring Stack**: 500MB RAM (Grafana+Prometheus+exporters)
- **Media Services**: 1GB RAM (Plex transcoding when active)

### **Capacity Planning (Current Utilization)**
- **CPU**: Good headroom for additional containers (65% peak usage)
- **RAM**: 8-14GB available (depending on AI model usage)
- **Storage**: 9.36TB total available space
- **GPU**: ✅ OPERATIONAL - RTX 5070 Ti providing AI acceleration
- **Network**: Adequate for current service load

## 🛠️ **Maintenance & Issues**

### **Current Issues**
1. **Plex Media Server**: Container running but service inactive
   - Container status shows "Up 6 days" but systemctl reports inactive
   - Requires service restart or container troubleshooting
2. **Minor Service Optimization**: Room for memory optimization with 15 containers

### **Major Achievements (2025-09-11)**
- ✅ **RTX 5070 Ti OPERATIONAL**: GPU acceleration working with 77% utilization
- ✅ **Homer Dashboard**: Primary service interface with 16-bit gaming theme
- ✅ **Service Expansion**: Scaled from 8 to 15 operational services
- ✅ **Professional Polish**: Complete enterprise-grade monitoring and management

### **Completed Maintenance**
- ✅ ZFS pools recovered and operational (2025-08-23)
- ✅ ICY DOCK installation complete (2025-08-21)
- ✅ GTX 970 removed for simplification (2025-08-25)
- ✅ Recovery data preserved (246MB saved)
- ✅ Docker architecture standardized (2025-09-11)
- ✅ GPU acceleration restored (2025-09-01)

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