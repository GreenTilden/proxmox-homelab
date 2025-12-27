# Services Overview

## 🚀 Services Deployment Status
1. **✅ Data Recovery**: Complete - 246MB personal content preserved
2. **✅ Storage Architecture**: 9TB+ production capacity operational
3. **✅ Web Management**: FileBrowser active
4. **✅ Plex Media Server**: Deployed with Google auth, software transcoding ready
5. **✅ Media Acquisition**: qBittorrent operational, torrents active
6. **❌ GPU Configuration**: RTX 5070 Ti blocked - awaiting NVIDIA 575+ drivers
7. **🔧 AI/LLM Services**: Ollama + Open WebUI deployment planned
8. **🔧 Container Services**: Portainer, Home Assistant, monitoring
9. **🔧 Development Environment**: Code-server + AI coding assistants
10. **🔧 Network Services**: PiHole, VPN, reverse proxy
11. **🔧 Gaming VM**: Windows 11 with GPU passthrough

## Current GPU Configuration

**RTX 5070 Ti (16GB VRAM) - Single GPU Setup**:
- Current Status: Hardware installed, awaiting NVIDIA 575+ drivers
- Planned Usage: Windows 11 gaming VM, AI/LLM workloads (Ollama, local models)
- Transcoding: Software transcoding only until drivers available
- Future Capability: Heavy 4K transcoding, large model inference (70B+ parameters)

## AI/LLM Service Stack
- **Ollama**: Primary LLM inference server (RTX 5070 Ti)
- **Continue.dev**: VSCode coding assistant integration
- **Open WebUI**: Web interface for LLM interaction
- **Models**: CodeLlama 34B, Deepseek Coder 33B, Mixtral 8x7B
- **Dynamic GPU Switching**: Script-based GPU reassignment

## Services Architecture

### Web Services (✅ ACTIVE)
- **FileBrowser**: http://192.168.0.99:8080/files/ - ZFS storage management (NoAuth, proper pool access)
- **System Dashboard**: http://192.168.0.99/system-status.html - Basic health check

### Media Services (✅ DEPLOYED)
- **Plex Media Server**: http://192.168.0.99:32400 - Claimed, Google auth working
  - Storage: 8.7TB media-pool + transcoding on staging-pool
  - Container: Proper ZFS pool mounts, software transcoding ready

### Media Acquisition Stack (✅ **OPERATIONAL**)
- **qBittorrent Container**: http://192.168.0.111:8112 - ✅ **OPERATIONAL**
  - Type: Native Proxmox LXC (Ubuntu 22.04) - bypasses Docker s6 issues  
  - Authentication: Password "qbittorrent"
  - Storage: **Direct downloads to /staging-pool/downloads/** (675GB capacity)
  - Features: Automatic .torrent processing, web interface accessible
  - Status: CT 110 running, both torrents active and downloading
  

- **WireGuard VPN Server**: Port 51820/udp - Remote homelab access
  - Clients: 5 peer configurations generated
  - Access: Full homelab network through secure tunnel

### Container Architecture Lessons Learned
**🚫 LinuxServer.io Docker Issues**: All LinuxServer.io containers (qBittorrent, Deluge, Transmission) fail with `s6-ipcserver-socketbinder: fatal: unable to create socket: Permission denied` in Proxmox environment.

**✅ Working Solutions**:
- **qBittorrent**: Native LXC container approach bypasses Docker permission issues
- **Alternative**: Official container images without s6 supervision system

### Complete Media Workflow Architecture
```
🔍 Content Discovery → ⚡ Download → 🎯 Processing → 📺 Plex Integration

Phase 2: qBittorrent Container (✅ OPERATIONAL)
├── Native Ubuntu 22.04 installation - CT 110 running  
├── Direct downloads to /staging-pool/downloads/ (675GB capacity)
├── Web UI: http://192.168.0.111:8112 (password: "qbittorrent")
├── Both torrents active: Columbo + Disney collections downloading
└── Automatic .torrent processing via 30-second cron job
```

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
