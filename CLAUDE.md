# Proxmox Homelab Project Guide

## Project Overview
Building a comprehensive home server on Proxmox VE 8.x with focus on media serving, storage pooling, and containerized services.

### Development Environment
- **Project Repository**: Hosted on development laptop (dinux)
- **Target System**: Proxmox server (PMB) at 192.168.0.99
- **Working Method**: All Proxmox server operations executed via SSH from dev laptop
- **Claude Sessions**: Run from dev laptop, connect to Proxmox server as needed

### Hardware

#### Current System Configuration
- **CPU**: Intel i7-8700 (6 cores, 12 threads, VT-x/VT-d enabled)
- **Motherboard**: 6 SATA ports, 2 M.2 slots, multiple PCIe slots
- **RAM**: 32GB total (all 4 DIMM slots occupied)
  - DIMM_A1/A2: 16GB Corsair Vengeance LPX DDR4-2400 (2x8GB)
  - DIMM_B1/B2: 16GB T-Force DARK DDR4-3000 (2x8GB)
- **GPU**: NVIDIA GeForce RTX 5070 Ti 16GB (PCIe x16_1 slot) - **INSTALLED** ✅
- **Secondary GPU**: GTX 970 4GB - **INSTALLED** ✅ (2025-08-23)
- **PSU**: Seasonic Focus PX-750 (750W 80+ Platinum) - Excellent for upgrades
- **Network**: 192.168.0.99

#### Current Storage Architecture (Post-Recovery)
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

#### Hardware Status Update (2025-08-23)
- ✅ **Dual GPU Setup**: RTX 5070 Ti + GTX 970 both installed
- ✅ **ICY DOCK**: MB024SP-B mobile rack operational  
- ⚠️ **GPU Drivers**: Need nvidia-smi configuration for both cards
- 🔧 **Storage Expansion Plans**:
  - LSI HBA card in PCIe x16_2 slot (adds 8 SATA ports)
  - SATA power splitters for additional drives
  - Shuck 3 external USB drives for pool growth
  - Configure M.2_2 to x2 mode (preserves SATA_5/6 ports)

### ✅ RECOVERY MISSION COMPLETE
**Date**: 2025-08-17 to 2025-08-23
**Status**: Complete data recovery and system rebuild finished
**Impact**: Original 3.6TB Plex data was unrecoverable, but 246MB of personal photos and metadata preserved
**Recovery**: Successfully saved 31 personal photos and 1,246 forensic files
**Current Status**: Production-ready homelab with 9TB+ storage capacity

### 🚀 Next Phase Services Plan
1. **✅ Data Recovery**: Complete - 246MB personal content preserved
2. **✅ Storage Architecture**: 9TB+ production capacity operational
3. **✅ Web Management**: FileBrowser + System Dashboard active
4. **🔧 Plex Media Server**: Deploy on 9TB media-pool
5. **🔧 GPU Configuration**: RTX 5070 Ti + GTX 970 driver setup
6. **🔧 AI/LLM Services**: Ollama + Open WebUI deployment
7. **🔧 Container Services**: Portainer, Home Assistant, monitoring
8. **🔧 Development Environment**: Code-server + AI coding assistants
9. **🔧 Network Services**: PiHole, VPN, reverse proxy
10. **🔧 Gaming VM**: Windows 11 with GPU passthrough

#### GPU Allocation Strategy

**RTX 5070 Ti (Primary - 16GB VRAM)**:
- Windows 11 gaming VM
- AI/LLM workloads (Ollama, local models)
- Heavy 4K transcoding when needed
- Large model inference (70B+ parameters)

**GTX 970 (Secondary - 4GB VRAM)**:
- Dedicated Plex transcoding (1080p optimized)
- Backup transcoding capacity
- Development/testing workloads
- Frees RTX 5070 Ti for gaming/AI

#### AI/LLM Service Stack
- **Ollama**: Primary LLM inference server (RTX 5070 Ti)
- **Continue.dev**: VSCode coding assistant integration
- **Open WebUI**: Web interface for LLM interaction
- **Models**: CodeLlama 34B, Deepseek Coder 33B, Mixtral 8x7B
- **Dynamic GPU Switching**: Script-based GPU reassignment

## Git Worktree Threading Strategy

### Overview
We use Git worktrees to create isolated working directories for different types of work, allowing parallel Claude sessions without conflicts.

### Directory Structure
```
~/projects/
├── proxmox-homelab/          (main branch - planning/documentation)
├── proxmox-homelab-reader/   (reader branch - research/status)
├── proxmox-homelab-writer/   (writer branch - implementation)
└── proxmox-homelab-features/ (feature branches)
    ├── plex-setup/
    └── storage-config/
```

### Quick Setup
```bash
# Initial setup (creates all worktrees)
./scripts/claude_threads.sh setup

# Open specific worktree
./scripts/claude_threads.sh reader   # Opens reader directory
./scripts/claude_threads.sh writer   # Opens writer directory
```

### Thread Types

#### Reader Thread (Research & Status)
- **Directory**: `~/projects/proxmox-homelab-reader`
- **Model**: Sonnet (efficient)
- **Tasks**:
  - System status checks
  - Log analysis
  - Configuration file reading
  - Documentation lookups
  - Network diagnostics
  - Storage inventory

#### Writer Thread (Implementation)
- **Directory**: `~/projects/proxmox-homelab-writer`
- **Model**: Opus (powerful)
- **Tasks**:
  - Container creation
  - Service deployment
  - Complex troubleshooting
  - Architecture decisions
  - Security implementations

### Workflow Commands
```bash
# Setup worktrees
./scripts/claude_threads.sh setup

# Start sessions
./scripts/claude_threads.sh reader    # Research session
./scripts/claude_threads.sh writer    # Implementation session

# Create feature branch
./scripts/claude_threads.sh feature plex-setup

# Sync changes between worktrees
./scripts/claude_threads.sh sync

# Check status
./scripts/claude_threads.sh status

# List all worktrees
./scripts/claude_threads.sh list
```

### Best Practices
1. **Always update CLAUDE.md** in any worktree when project state changes
2. **Use reader worktree** for research before implementation
3. **Use writer worktree** for actual system changes
4. **Create feature branches** for major features (e.g., plex-setup)
5. **Sync regularly** to keep branches aligned
6. **Document changes** in respective WORKTREE.md files

## Key Commands Reference

### SSH Access
```bash
ssh proxmox  # Alias to root@192.168.0.99
ssh root@192.168.0.99  # Direct connection to Proxmox server
```

### Development Workflow
```bash
# All Claude sessions run from dev laptop (dinux)
# Proxmox operations executed via SSH:
ssh root@192.168.0.99 "command"
ssh root@192.168.0.99 "lspci | grep VGA"
ssh root@192.168.0.99 "lsblk"
```

### ZFS Pool Management
```bash
# ⚠️ CRITICAL: Pool signatures wiped 2025-08-17
# DO NOT attempt import until data recovery plan executed
# Current status: zpool import shows "no pools available"

# Data recovery commands (use with extreme caution):
ddrescue /dev/sdb /path/to/backup/sdb_backup.img /path/to/logfile  # Clone 3.6TB media drive
photorec /path/to/backup/sdb_backup.img  # Extract media files
```

### Proxmox Commands
```bash
# Container management
pct list
pct create [VMID] [template] --hostname [name] --memory [MB] --rootfs [storage:size]

# Storage management
pvesm status
pvesm list [storage]
```

## Project Structure
```
proxmox-homelab/
├── scripts/       # Automation scripts
├── configs/       # Service configurations
├── docs/          # Documentation
└── inventory/     # Hardware/software inventory
```

## Critical Reminders
- **🚨 DATA RECOVERY FIRST**: ZFS pool wiped, 3.6TB Plex data at risk
- **GPU Status**: RTX 5070 Ti installed, nvidia-smi not working (driver issue)
- **Secondary GPU**: GTX 970 ready to install (pending audio cable clearance)
- **IP Address**: ProxMoxBox (PMB) is at 192.168.0.99 (not .100)
- **Repository**: Using Bookworm (stable), debian.sources needs Trixie→Bookworm fix
- **4TB Recovery Drive**: Available for data staging operations

## Hardware Shopping Guide

### Current System Summary for Shopping
- **Motherboard**: 6 SATA ports (3-4 used), PCIe x16_2 slot available
- **PSU**: 750W 80+ Platinum (excellent for upgrades)
- **Available Storage**: 4TB blank drive ready for data recovery staging
- **Expansion Ready**: 3 USB drives to shuck, multiple PCIe slots free
- **Goal**: ZFS pool recovery + AI/LLM inference capabilities

### Priority 1: Storage Infrastructure (Essential - $80-120)

#### LSI HBA Card ($50-70)
- **LSI 9211-8i in IT Mode** - Install in PCIe x16_2 slot
- **Include**: 2x SFF-8087 to 4x SATA breakout cables
- **Result**: Adds 8 SATA ports (total: 14 drives possible)

#### SATA Power Expansion ($20-30)
- **2x GELRHONR 4-Way SATA Power Splitters**
- **SATA cable variety pack** (18", 24", 36" lengths)
- **Result**: Power for all current + shucked drives

### Priority 2: Secondary GPU Installation (Immediate - $0)

#### GTX 970 4GB Installation
- **Status**: Ready to install, waiting for right angle audio cables
- **Purpose**: Dedicated Plex transcoding, frees RTX 5070 Ti
- **Power**: 145W (well within PSU capacity)
- **Slot**: PCIe x16_2 (currently available)

### Priority 3: GPU Driver Configuration (Essential - $0)
- **Fix nvidia-smi**: Install proper NVIDIA drivers
- **Enable Passthrough**: Configure IOMMU for both GPUs
- **Container Access**: Set up GPU sharing for Plex/AI services

### Optimized Microcenter Shopping List
```
Essential (Phase 1) - ~$100:
□ LSI 9211-8i HBA Card (IT Mode) + breakout cables
□ 2x 4-way SATA power splitters
□ SATA cable variety pack (3-4 cables)

Immediate Hardware Tasks:
□ Install GTX 970 (waiting for right angle audio cables)
□ Configure dual GPU passthrough
□ Fix nvidia-smi driver issues

Optional Tools:
□ USB 3.0 to SATA adapter (~$25)
□ External drive dock (~$40)
```

### What You Get With Each Upgrade
- **Storage Only**: Full ZFS pool recovery, 10+ drive capacity, professional setup
- **+ RTX 3060**: Local coding assistants, offline AI development
- **+ RTX 4060 Ti**: Professional AI capabilities, multiple models, custom agents

## System Monitoring & Safety Protocol

### Power & Thermal Management
- **Monitor Script**: `/usr/local/bin/system-monitor.sh` - comprehensive health check
- **Console Output**: All temp/power data MUST appear in Claude responses during operations
- **Safety Thresholds**: CPU >75°C, load >4.0, or drive failures = immediate abort
- **Pre-Op Check**: Always run health check before major operations
- **Post-Op Check**: Always verify system state after intensive tasks
- **Weekly Reminder**: Review thermal/power trends and system capacity

### Monitoring Integration Strategy
```bash
# Example integration in responses:
echo "=== PRE-OPERATION HEALTH CHECK ==="
/usr/local/bin/system-monitor.sh
echo "=== BEGINNING OPERATION ==="
# ... operation commands ...
echo "=== POST-OPERATION HEALTH CHECK ==="
/usr/local/bin/system-monitor.sh
```

### Data Review & Curation Protocol
- **Staging Access**: Always provide Proxmox web interface instructions for data review
- **File Browser**: Navigate via Proxmox UI to `/mnt/staging/` directories
- **User Review**: Manual deletion/curation of staged data before final migration
- **Web UI Path**: Proxmox Console → Node → Shell → File Manager or `mc` (midnight commander)
- **Alternative Access**: SSH file browser, SFTP, or direct console navigation
- **Workflow**: Stage → Review → Curate → Migrate → Verify

### DevOps Pipeline Integration
- **CI/CD Hooks**: Include health checks in automated workflows
- **Alert Thresholds**: Temperature, load, and storage capacity monitoring
- **Failure Recovery**: Automated rollback on thermal/power issues
- **Capacity Planning**: Track resource usage trends for scaling decisions

## Current State (2025-08-23)
- ✅ Proxmox VE 9.0.3 installed and accessible (192.168.0.99)
- ✅ SSH configured with key authentication  
- ✅ RTX 5070 Ti 16GB installed and detected
- ✅ GTX 970 4GB installed (secondary GPU)
- ✅ ICY DOCK MB024SP-B mobile rack installed
- ✅ ZFS Storage: 9.06TB media-pool + 232GB service-pool + 696GB staging-pool
- ✅ Recovery Mission: Complete with 246MB personal content preserved
- ✅ Git worktree system operational (main/reader/writer/features)
- ✅ Docker installed and operational
- ✅ FileBrowser web interface (http://192.168.0.99:8080)
- ✅ **NEW: Grafana Monitoring Stack** (http://192.168.0.99:3000) - admin/admin
- ✅ **NEW: Prometheus Metrics** (http://192.168.0.99:9090)
- ✅ **NEW: 16-bit Gaming Theme** - Modular CSS + JSON architecture
- ✅ **NEW: ZFS Custom Exporter** - Pool, dataset, recovery metrics
- ✅ Data curation and preservation workflows complete
- ⚠️ Repository mixing Bookworm/Trixie (needs fix)
- ⚠️ NVIDIA drivers not configured (both GPUs need setup)
- 🚀 Ready for next phase: Plex + AI/LLM + Container services

## Services Architecture

### Monitoring Stack (✅ DEPLOYED)
- **Grafana**: http://192.168.0.99:3000 (admin/admin)
  - 16-bit gaming themed interface with modular CSS
  - Custom ZFS, system, and recovery data dashboards
- **Prometheus**: http://192.168.0.99:9090
  - Metrics collection and time-series database
- **Node Exporter**: Port 9100 - System metrics
- **ZFS Exporter**: Port 9101 - Custom pool/dataset metrics
- **Theme Files**: 
  - `/configs/grafana-theme.json` - Color palette & components
  - `/configs/grafana-custom.css` - 16-bit visual architecture

### Web Services (✅ ACTIVE)
- **FileBrowser**: http://192.168.0.99:8080 - ZFS storage management
- **System Dashboard**: http://192.168.0.99/system-status.html - Basic health check

## Immediate Priority Queue
1. **GPU Drivers**: Fix nvidia-smi, enable passthrough for both GPUs
2. **Plex Deployment**: Install on media-pool with RTX transcoding
3. **Repository Fix**: Correct debian.sources to use Bookworm consistently
4. **AI Services**: Deploy Ollama + Open WebUI stack
5. **Container Orchestration**: Add Portainer for easier management