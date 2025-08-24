# 🏠 Proxmox Homelab Project

**Production-ready Proxmox VE homelab with ZFS storage, dual GPU setup, 16-bit gaming dashboard, AI/LLM services, and orchestrated multi-threaded development workflow.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Proxmox VE](https://img.shields.io/badge/Proxmox-VE%209.0.3-orange)](https://www.proxmox.com/en/proxmox-virtual-environment)
[![ZFS](https://img.shields.io/badge/Storage-ZFS-blue)](https://openzfs.org/)
[![NVIDIA](https://img.shields.io/badge/GPU-RTX%205070%20Ti%20+%20GTX%20970-green)](https://www.nvidia.com/)

## 🎯 Project Overview

This repository documents the complete journey of building and maintaining a production-grade homelab server on Proxmox VE, from initial hardware setup through data recovery to advanced service deployment.

### 🚀 Current Status (August 2025)
- ✅ **Hardware**: Dual GPU (RTX 5070 Ti + GTX 970), 32GB RAM, i7-8700
- ✅ **Storage**: 9TB+ ZFS pools with data recovery capabilities  
- ✅ **Monitoring**: Grafana + Prometheus with 16-bit gaming theme
- ✅ **Services**: FileBrowser, system dashboard, ZFS metrics exporter
- ✅ **Development**: Orchestrated multi-threaded workflow with Git worktrees
- 🔧 **In Progress**: NVIDIA driver configuration, Plex deployment via multi-threaded approach

## 🏗️ Architecture

### Hardware Configuration
```
Intel i7-8700 (6c/12t) + 32GB DDR4
├── RTX 5070 Ti 16GB (AI/Gaming/4K transcoding)
├── GTX 970 4GB (Dedicated Plex transcoding)  
├── 9.06TB media-pool (3x HDD in ZFS)
├── 232GB service-pool (SSD for containers)
└── 696GB staging-pool (Working storage)
```

### Service Stack
```
Proxmox VE 9.0.3
├── Docker Containers
│   ├── Grafana (16-bit gaming themed)
│   ├── Prometheus + Node Exporter
│   ├── FileBrowser (ZFS management)
│   └── Custom ZFS Exporter
├── Planned Services
│   ├── Plex Media Server
│   ├── Ollama + Open WebUI (AI/LLM)
│   ├── Portainer (Container management)
│   └── Home Assistant + PiHole
└── Gaming VM (Windows 11 + GPU passthrough)
```

## 📂 Repository Structure

This repository uses an **orchestrated multi-threaded development strategy** with specialized Git worktrees - a key innovation for complex homelab projects.

### 🚀 Multi-Threaded Development

**Revolutionary Approach**: Instead of single-threaded development, we use coordinated parallel threads for maximum efficiency:

- **Main Thread**: Project orchestration, documentation, coordination
- **Reader Thread**: Research, system analysis, status monitoring  
- **Writer Thread**: Implementation, deployments, system modifications
- **Feature Branches**: Specialized development (AI services, container management)

### 🌟 Branch Overview

| Branch | Purpose | Use Case | Development Focus |
|--------|---------|----------|-------------------|
| [`main`](../../tree/main) | 📋 **Orchestration Hub** | Coordination, planning, documentation | Multi-threaded coordination |
| [`reader`](../../tree/reader) | 🔍 **Research & Analysis** | System status, interface exploration, diagnostics | Read-only operations |
| [`writer`](../../tree/writer) | ⚡ **Implementation** | Active development, service deployment, configs | System modifications |
| [`feature/web-interfaces`](../../tree/feature/web-interfaces) | 🌐 **Web Services** | Dashboard enhancements, web interface improvements | Specialized UI work |
| [`feature/data-recovery-urgent`](../../tree/feature/data-recovery-urgent) | 🔄 **Data Recovery** | Complete 3.6TB recovery project (completed) | Recovery operations |
| [`feature/retro-gaming-dashboard`](../../tree/feature/retro-gaming-dashboard) | 🎮 **Gaming Dashboard** | 16-bit themed Grafana interface | Visual design |

**Key Advantage**: This approach enables **parallel development** where research, implementation, and specialized features can progress simultaneously without conflicts.

For detailed technical documentation, see [CLAUDE.md](CLAUDE.md) - the comprehensive project guide.

## 🎮 Featured: 16-Bit Gaming Dashboard

Our custom Grafana theme brings **retro gaming aesthetics** to modern infrastructure monitoring with pixel-perfect design and real-time ZFS metrics.

## 🔧 Quick Start

```bash
# Clone the repository
git clone https://github.com/GreenTilden/proxmox-homelab.git
cd proxmox-homelab

# Set up orchestrated multi-threaded development  
./scripts/claude_threads.sh setup

# Comprehensive system status across all threads
./scripts/claude_threads.sh status-all

# Launch specialized development threads
./scripts/claude_threads.sh reader    # Research & analysis
./scripts/claude_threads.sh writer    # Implementation
./scripts/claude_threads.sh feature <name>  # Feature development
```

### Access Services
- **Grafana Dashboard**: http://your-server:3000
- **FileBrowser**: http://your-server:8080
- **Prometheus**: http://your-server:9090

## 🔄 Data Recovery Journey

This project included a **complete 3.6TB data recovery mission** (August 2025) with 31 personal photos and 1,246 forensic files successfully recovered from damaged drives.

## 📄 License

MIT - Feel free to use, modify, and distribute

---

**⭐ Star this repository if it helps with your homelab journey!**

*Built with ❤️ for the homelab community*
