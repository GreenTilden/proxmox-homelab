# Proxmox Homelab Project Guide

## Core Development Principles

### 🔥 **MANDATORY: Multi-Threaded Development**
**This project EXCLUSIVELY uses orchestrated multi-threaded development via Git worktrees.**

**Never work in single-threaded mode.** All development, research, and implementation MUST use the specialized worktree threads:

- **Main Branch**: Coordination, planning, documentation, project orchestration
- **Reader Branch**: Research, system status, interface exploration, monitoring
- **Writer Branch**: Implementation, deployments, system modifications, configurations  
- **Feature Branches**: Isolated feature development, specialized projects

**Every Claude session MUST include current worktree thread status reporting.**

### System Prompt Integration
**Standard Template for All Claude Responses:**
```
## Current Worktree Thread Status
- **Main**: [current coordination task]
- **Reader**: [current research/status task]
- **Writer**: [current implementation task]  
- **Active Features**: [list active feature branches]
```

**Use orchestrated commands ONLY:**
- `./scripts/claude_threads.sh status-all` - Comprehensive status
- `./scripts/claude_threads.sh reader` - Research session
- `./scripts/claude_threads.sh writer` - Implementation session
- `./scripts/claude_threads.sh sync-all` - Coordinate all branches

## Project Overview
Building a comprehensive home server on Proxmox VE 8.x with focus on media serving, storage pooling, and containerized services using **orchestrated multi-threaded development**.

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

## Orchestrated Multi-Thread Workflow

### Thread Coordination Strategy
**Main Branch** acts as orchestration hub:
- Coordinates between all worktrees
- Consolidates status reports from reader/writer threads
- Assigns tasks to appropriate branches
- Maintains project-wide documentation and priorities

### Status Reporting Protocol
Each thread reports to main branch using standardized format:

**Reader Thread Reports**:
```
## Reader Status Report - [DATE]
### System Health: ✅/⚠️/❌
- CPU Load: [current load average]
- Memory Usage: [usage percentage]  
- ZFS Pools: [pool health status]

### Service Status: ✅/⚠️/❌
- Proxmox: [interface accessible/issues]
- Grafana: [dashboard operational/issues]
- FileBrowser: [working/permission issues]

### Research Findings:
- [Key discoveries or status changes]
```

**Writer Thread Reports**:
```  
## Writer Status Report - [DATE]
### Implementations Completed: [count]
- [List of completed tasks]

### In Progress: [count]  
- [Current implementation work]

### Blockers: [count]
- [Issues preventing progress]

### Next Priority:
- [Next task to be implemented]
```

### Task Distribution Matrix

| Task Type | Assigned Thread | Rationale |
|-----------|----------------|-----------|
| System Status Checks | Reader | Read-only operations, efficient |
| Interface Exploration | Reader | Research and documentation |
| Container Deployments | Writer | System modifications required |
| GPU Configuration | Writer | Hardware changes needed |
| Documentation Updates | Main | Cross-cutting concerns |
| Feature Development | Feature Branch | Isolated development |

### Coordination Commands
```bash
# Status consolidation from main branch
./scripts/claude_threads.sh status-all    # All worktree status
./scripts/claude_threads.sh report        # Generate consolidated report
./scripts/claude_threads.sh sync-all      # Sync all branches

# Thread-specific operations
./scripts/claude_threads.sh reader        # Switch to reader
./scripts/claude_threads.sh writer        # Switch to writer  
./scripts/claude_threads.sh feature [name] # Create/switch feature branch
```

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
- ✅ **ORCHESTRATED WORKTREE SYSTEM**: Full multi-threaded development operational
- ✅ **Container Storage Architecture**: Comprehensive ZFS pool mounting best practices
- ✅ Git worktree system operational (main/reader/writer/features)
- ✅ Docker installed and operational
- ✅ FileBrowser web interface (http://192.168.0.99:8080) - No authentication, proper ZFS access
- ✅ **Grafana Monitoring Stack** (http://192.168.0.99:3000) - admin/admin
- ✅ **Prometheus Metrics** (http://192.168.0.99:9090)
- ✅ **16-bit Gaming Theme** - Modular CSS + JSON architecture
- ✅ **ZFS Custom Exporter** - Pool, dataset, recovery metrics
- ✅ **Orchestrated Status Reporting** - Automated comprehensive system status
- ✅ Data curation and preservation workflows complete
- ⚠️ Repository mixing Bookworm/Trixie (needs fix - Writer thread)
- ⚠️ NVIDIA drivers partially installed (package conflicts resolved, needs final reboot - Writer thread)
- 🚀 Ready for next phase: Multi-threaded Plex + AI/LLM + Container deployments

## Current Worktree Thread Status
- **Main**: Documentation cleanup and v1.0.1 release preparation
- **Reader**: Available for Proxmox/Grafana interface exploration  
- **Writer**: Available for GPU driver implementation and service deployments
- **Active Features**: web-interfaces, data-recovery-urgent, retro-gaming-dashboard

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

### Container Storage Best Practices
**Critical Pattern**: Always mount actual ZFS pool paths, not just `/mnt`

#### Proper ZFS Pool Mounting
```bash
# CORRECT: Mount actual ZFS pools
docker run -d --name service-name \
  -v /media-pool:/srv/media-pool \
  -v /service-pool:/srv/service-pool \
  -v /staging-pool:/srv/staging-pool \
  image:tag

# INCORRECT: Only mounting /mnt misses actual pools
docker run -d --name service-name \
  -v /mnt:/srv \
  image:tag
```

#### Storage Access Patterns
- **Media Services** (Plex, Jellyfin): Mount media-pool for content access
- **Development Services** (code-server, Git): Mount service-pool for fast I/O  
- **Management Services** (FileBrowser, Portainer): Mount all pools for full access
- **Temporary Services** (Processing, uploads): Mount staging-pool primarily

#### Web Interface Integration
- **Proxmox VE**: https://192.168.0.99:8006 - System/VM/container management
- **FileBrowser**: http://192.168.0.99:8080 - Direct ZFS pool file management
- **Grafana**: http://192.168.0.99:3000 - Storage metrics and monitoring

### Proxmox Web Interface Workflows

#### Access Points
- **Primary Interface**: https://192.168.0.99:8006 (accept SSL certificate)
- **Node Console**: Direct shell access via web browser
- **File Manager**: Built-in file browser through node shell
- **Container Management**: Create, configure, and monitor LXC containers

#### Integration with FileBrowser
**Complementary Usage Pattern**:
1. **Proxmox**: System-level operations (containers, VMs, storage pools)
2. **FileBrowser**: File-level operations (data management, transfers, preview)

**Workflow Examples**:
- **Container Deployment**: Create container in Proxmox → Mount storage via FileBrowser → Monitor in Grafana
- **Data Management**: Check pool status in Proxmox → Move/organize files in FileBrowser → Verify metrics in Grafana
- **Troubleshooting**: System logs in Proxmox → File system access via FileBrowser → Performance data in Grafana

#### Common Administrative Tasks
```bash
# Via Proxmox Web Console (Node → Shell):
pct list                    # List containers
pct start/stop/restart 100  # Manage containers
zpool status               # Check pool health
zfs list                   # View datasets

# Via FileBrowser Web Interface:
# Navigate to /srv/media-pool, /srv/service-pool, /srv/staging-pool
# Upload, download, preview, and organize files
# Create directories and manage permissions

# Via SSH (fallback):
ssh root@192.168.0.99 "command"  # Direct command execution
```

## Immediate Priority Queue (Multi-Threaded Assignments)
1. **GPU Drivers** → **Writer Thread**: Fix nvidia-smi, enable passthrough for both GPUs
2. **Plex Deployment** → **Writer Thread**: Install on media-pool with RTX transcoding using proper ZFS mounts
3. **Repository Fix** → **Writer Thread**: Correct debian.sources to use Bookworm consistently  
4. **Interface Research** → **Reader Thread**: Comprehensive Proxmox + Grafana + monitoring validation
5. **AI Services** → **Feature Branch**: Deploy Ollama + Open WebUI stack (ai-services branch)
6. **Container Orchestration** → **Feature Branch**: Add Portainer with proper storage architecture (container-mgmt branch)

**Orchestrated Workflow**: Main branch coordinates, Reader provides system status, Writer implements infrastructure, Features handle specialized deployments.