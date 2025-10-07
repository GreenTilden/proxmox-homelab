# Proxmox Homelab Project Guide

## Core Development Principles

### 🚨 **CRITICAL: NO TRIXIE PACKAGES RULE**
**ABSOLUTELY NO packages from Trixie repositories may be installed during setup phase. This rule is IRONCLAD and NON-NEGOTIABLE.**
- See `/CRITICAL-REPOSITORY-RULE.md` for full details
- Installing Trixie packages will REMOVE Proxmox components
- Use manual installers or Docker containers instead
- This rule remains until system stable + explicit removal approval

### 🔥 **MANDATORY: 5-Thread Claude Code Execution Model**
**This project EXCLUSIVELY uses a 5-thread Claude Code execution model with SEQUENTIAL workflow processing.**

**NEVER work outside this model.** All development, research, and implementation MUST use the specialized Claude Code instances:

- **🎯 Main Thread (Opus)**: Orchestration, task delegation, sequential workflow coordination
- **🔍 Reader Thread (Sonnet)**: System verification, research, status analysis  
- **⚡ Writer Thread (Opus)**: Infrastructure implementation, deployments, system modifications
- **🔧 Debug Thread (Opus)**: Advanced troubleshooting, complex problem resolution
- **📚 Documentation Thread (Sonnet)**: Knowledge synthesis, documentation updates

**Sequential Workflow Protocol**: `Main → Reader → Writer → Debug (if needed) → Documentation → Main`

**Every thread execution MUST follow prompting standards and generate structured reports for the next thread in sequence.**

### 📚 **UNIFIED DOCUMENTATION - SINGLE SOURCE OF TRUTH**
**All project documentation is centralized at `/home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/`**

**Key Documents**:
- **Framework**: `/docs/UNIFIED-REFERENCE/FRAMEWORK/5-thread-execution-model.md` - Mandatory execution protocol
- **Handoffs**: `/docs/UNIFIED-REFERENCE/FRAMEWORK/thread-handoff-templates.md` - Standard templates
- **Current Cycle**: `/docs/UNIFIED-REFERENCE/THREAD-CYCLES/current-cycle.md` - Active execution status
- **Master Index**: `/docs/UNIFIED-REFERENCE/MASTER-INDEX.md` - Complete navigation hub

**All worktrees reference this single documentation source to prevent fragmentation.**

### Thread Status Reporting Integration
**Standard Template for All Thread Reports:**
```
## Current 5-Thread Execution Status
- **🎯 Main (Opus)**: [orchestration task]
- **🔍 Reader (Sonnet)**: [verification task]  
- **⚡ Writer (Opus)**: [implementation task]
- **🔧 Debug (Opus)**: [troubleshooting status]
- **📚 Documentation (Sonnet)**: [knowledge synthesis task]

## Sequential Workflow Position: [Current thread in sequence]
## Next Thread Handoff: [Target thread for next prompt]
```

**Use orchestrated commands ONLY:**
- `./scripts/claude_threads.sh status-all` - Comprehensive status
- `./scripts/claude_threads.sh reader` - Research session
- `./scripts/claude_threads.sh writer` - Implementation session
- `./scripts/claude_threads.sh sync-all` - Coordinate all branches

## Project Overview
Building a comprehensive home server on Proxmox VE 9.x with focus on media serving, storage pooling, and containerized services using **orchestrated multi-threaded development**.

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
- **GPU**: NVIDIA GeForce RTX 5070 Ti 16GB (PCIe x16_1 slot) - **INSTALLED** ⚠️ (Driver not available)
- **Secondary GPU**: GTX 970 4GB - **REMOVED** (2025-08-25)
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

#### Hardware Status Update (2025-08-25)
- ⚠️ **GPU Setup**: RTX 5070 Ti installed but no driver support (Blackwell GB203)
- ✅ **ICY DOCK**: MB024SP-B mobile rack operational  
- ❌ **GPU Drivers**: RTX 5070 Ti requires NVIDIA 575+ drivers (not yet available)
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

### 🚀 Services Deployment Status
1. **✅ Data Recovery**: Complete - 246MB personal content preserved
2. **✅ Storage Architecture**: 9TB+ production capacity operational
3. **✅ Web Management**: FileBrowser + Grafana + Prometheus active
4. **✅ Plex Media Server**: Deployed with Google auth, software transcoding ready
5. **✅ Media Acquisition**: Firefox + Deluge LXC operational, torrents active
6. **✅ Monitoring Stack**: 16-bit themed Grafana with mobile responsiveness
7. **❌ GPU Configuration**: RTX 5070 Ti blocked - awaiting NVIDIA 575+ drivers
8. **🔧 AI/LLM Services**: Ollama + Open WebUI deployment planned
9. **🔧 Container Services**: Portainer, Home Assistant, monitoring
10. **🔧 Development Environment**: Code-server + AI coding assistants
11. **🔧 Network Services**: PiHole, VPN, reverse proxy
12. **🔧 Gaming VM**: Windows 11 with GPU passthrough

#### Current GPU Configuration

**RTX 5070 Ti (16GB VRAM) - Single GPU Setup**:
- Current Status: Hardware installed, awaiting NVIDIA 575+ drivers
- Planned Usage: Windows 11 gaming VM, AI/LLM workloads (Ollama, local models)
- Transcoding: Software transcoding only until drivers available
- Future Capability: Heavy 4K transcoding, large model inference (70B+ parameters)

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

### Thread Types & Emoji Identifiers

#### 🎯 Main Thread (Coordination & Planning)
- **Directory**: `~/projects/proxmox-homelab`
- **Symbol**: 🎯
- **Role**: Project orchestration, task delegation, status consolidation
- **Tasks**:
  - Coordinate between all worktrees
  - Consolidate status reports
  - Assign tasks to appropriate threads
  - Maintain project-wide documentation

#### 🔍 Reader Thread (Research & Status)
- **Directory**: `~/projects/proxmox-homelab-reader`
- **Symbol**: 🔍
- **Model**: Sonnet (efficient)
- **Tasks**:
  - System status checks
  - Log analysis
  - Configuration file reading
  - Documentation lookups
  - Network diagnostics
  - Storage inventory

#### ⚡ Writer Thread (Implementation)
- **Directory**: `~/projects/proxmox-homelab-writer`
- **Symbol**: ⚡
- **Model**: Opus (powerful)
- **Tasks**:
  - Container creation
  - Service deployment
  - Complex troubleshooting
  - Architecture decisions
  - Security implementations

#### 🚀 Feature Branches (Specialized Development)
- **Directory**: `~/projects/proxmox-homelab-features/[name]`
- **Symbol**: 🚀
- **Purpose**: Isolated feature development and testing

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

### Thread Status Report Format

**🎯 Main Thread Coordination**:
```
## Current Worktree Thread Status  
- 🎯 **Main**: [current coordination task]
- 🔍 **Reader**: [current research/status task]  
- ⚡ **Writer**: [current implementation task]
- 🚀 **Active Features**: [list active feature branches]

## Task Delegation
🔍 **Reader Analysis Required**: [diagnostic tasks]
⚡ **Writer Implementation Required**: [deployment tasks] 
🚀 **Feature Development**: [specialized work]
```

**🔍 Reader Thread Reports**:
```
## 🔍 Reader Status Report - [DATE]
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

**⚡ Writer Thread Reports**:
```  
## ⚡ Writer Status Report - [DATE]
### Implementations Completed: [count]
- [List of completed tasks]

### In Progress: [count]  
- [Current implementation work]

### Blockers: [count]
- [Issues preventing progress]

### Next Priority:
- [Next task to be implemented]
```

### Real-Time Thread Activity Visibility
Every response should include thread identifier when work is performed:
- 🎯 **Main**: Coordinating task X
- 🔍 **Reader**: Analyzing logs for service Y  
- ⚡ **Writer**: Deploying container Z
- 🚀 **Feature**: Implementing feature W

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
├── scripts/           # Automation scripts
├── configs/           # Service configurations
├── docs/              # Documentation
├── inventory/         # Hardware/software inventory
├── frontend/          # Dual-theme Vue.js dashboard
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
└── .agents/           # Claude Code agent configurations
```

## Critical Reminders
- **🚨 DATA RECOVERY FIRST**: ZFS pool wiped, 3.6TB Plex data at risk
- **GPU Status**: RTX 5070 Ti installed, nvidia-smi not working (driver issue)
- **Storage Expansion**: Ready for LSI HBA card installation
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

### Priority 2: Future GPU Transcoding (Dependent on Drivers)

#### RTX 5070 Ti Hardware Transcoding
- **Status**: Awaiting NVIDIA 575+ driver release for Blackwell architecture
- **Current Workaround**: Software transcoding in Plex container
- **Future Setup**: Hardware transcoding with proper GPU passthrough
- **Power**: Already installed and powered

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
□ Wait for NVIDIA 575+ driver release
□ Configure single GPU passthrough when drivers available
□ Implement hardware transcoding in Plex

Optional Tools:
□ USB 3.0 to SATA adapter (~$25)
□ External drive dock (~$40)
```

### Expected Capabilities When Drivers Available
- **Storage Expansion**: 10+ drive capacity with LSI HBA card
- **RTX 5070 Ti Full Utilization**: Hardware transcoding, AI/LLM inference
- **Professional AI Stack**: Multiple models, custom agents, local development

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

## Claude Code Agent System

### Agent Architecture (2025-08-25)
**Hybrid Agent Strategy**: Combines persistent SME agents that build expertise over time with disposable task-specific agents that solve immediate problems then get archived.

#### **Persistent SME Agents** (Build Expertise Over Time)
Located in `.agents/` directory:

##### **📊 Dashboard Monitor Agent** - `dashboard-monitor.md`
- **Purpose**: Ensure all services maintain proper Grafana monitoring integration
- **Status**: ✅ **OPERATIONAL** - Successfully monitoring all 8 services
- **Expertise**: 16-bit gaming theme architecture, mobile responsiveness, alert thresholds
- **Current Knowledge**: All services operational, 3 exporters active, minor Gluetun VPN issues identified

##### **🔧 Debug SME Agent** - `debug-sme.md`
- **Purpose**: Persistent troubleshooting expert for all homelab services
- **Status**: ✅ **OPERATIONAL** - Comprehensive knowledge of 8-service architecture
- **Expertise**: Container diagnostics, LXC vs Docker patterns, permission issues, service health
- **Current Knowledge**: Plex chown warning is cosmetic, LinuxServer.io s6 incompatibility documented
- **Activation**: Use `debug-sme-prompt.md` for Opus-level debugging authority

#### **Disposable Project Agents** (Task-Specific, Then Archive)
##### **🎬 Plex GPU Setup Agent** - `plex-gpu-setup.md`
- **Purpose**: Configure GTX 970 transcoding for Plex Media Server  
- **Status**: ⚠️ **BLOCKED** - NVIDIA drivers not installed on system
- **Current Finding**: Both RTX 5070 Ti and GTX 970 detected, but no proprietary NVIDIA drivers present
- **Next Step**: Install NVIDIA drivers compatible with Debian 13 Trixie

### Agent Knowledge Transfer Process
**Template**: `.agents/KNOWLEDGE-TRANSFER-TEMPLATE.md` defines workflow for transferring insights from disposable agents to persistent agents upon project completion.

**Workflow**:
1. **Project Completion**: Disposable agent documents all learnings and configuration changes
2. **Knowledge Extraction**: System-wide insights identified for persistent agents
3. **Persistent Agent Updates**: Dashboard/Infrastructure agents updated with new patterns
4. **Next Project Creation**: New disposable agents inherit context from previous work

### Integration with Worktree System
- **🎯 Main Thread**: Coordinates agent knowledge transfer sessions
- **🔍 Reader Thread**: Archives disposable agents, validates documentation  
- **⚡ Writer Thread**: Updates persistent agent configurations
- **🚀 Feature Threads**: Create new disposable agents with inherited context

## Current State (2025-09-26) - Dual-Theme Dashboard Operational
- ✅ Proxmox VE 9.0.3 installed and accessible (192.168.0.99)
- ✅ SSH configured with key authentication
- ✅ RTX 5070 Ti 16GB installed and detected
- ✅ ICY DOCK MB024SP-B mobile rack installed
- ✅ **Dual-Theme Dashboard**:
  - **Retro Theme (EllBot)**: http://192.168.0.218:3000/ - Gaming aesthetic with seasonal themes
  - **Naive Theme (Alissa)**: http://192.168.0.218:3000/naive.html - Professional, clean interface
  - **Production Goal**: `ellabot.lcibot.local` and `alissa.lcibot.local` subdomains
- ✅ ZFS Storage: 9.06TB media-pool + 232GB service-pool + 696GB staging-pool
- ✅ Recovery Mission: Complete with 246MB personal content preserved
- ✅ **ORCHESTRATED WORKTREE SYSTEM**: Full multi-threaded development operational
- ✅ **Container Storage Architecture**: Comprehensive ZFS pool mounting best practices
- ✅ Git worktree system operational (main/reader/writer/features)
- ✅ Docker installed and operational
- ✅ **Plex Media Server**: Running with claim token, Google auth working (http://192.168.0.99:32400)
- ✅ FileBrowser web interface (http://192.168.0.99:8080) - No authentication, proper ZFS access
- ✅ **Grafana Monitoring Stack** (http://192.168.0.99:3000) - admin/test123
- ✅ **Prometheus Metrics** (http://192.168.0.99:9090)
- ✅ **16-bit Gaming Theme** - Modular CSS + JSON architecture
- ✅ **ZFS Custom Exporter** - Pool, dataset, recovery metrics
- ✅ **Media Acquisition Workflow**: Complete dual VPN architecture deployed
  - **Deluge LXC**: Torrent client (http://192.168.0.111:8112) - ✅ RESTORED 2025-08-25
  - **Firefox Container**: Secure web browsing (http://192.168.0.99:3001)
  - **WireGuard Server**: Remote VPN access (51820/udp)
- ✅ **Storage Workflow**: staging-pool → processing → media-pool → Plex
- ✅ Data curation and preservation workflows complete
- ✅ **Repository Cleanup**: All GBGreg references properly moved to separate project
- ⚠️ NVIDIA drivers (deferred for GPU transcoding implementation)
- 🚀 Ready for next phase: GPU transcoding, advanced automation

## Current Worktree Thread Status - Cycle 2
- **🎯 Main**: Vue.js dashboard orchestration, 5-thread coordination complete
- **🔍 Reader**: ✅ NEXT ACTIVE - greentilden.github.io template analysis and Mario theme requirements  
- **⚡ Writer**: PENDING - Vue.js Mario dashboard implementation
- **🔧 Debug**: PENDING - Performance optimization and mobile compatibility
- **📚 Documentation**: PENDING - Pattern capture for cross-project reuse
- **Active Features**: vue-mario-dashboard (Cycle 2 primary objective)

## Services Architecture

### Monitoring Stack (✅ DEPLOYED)
- **Grafana**: http://192.168.0.99:3000 (admin/test123)
  - 16-bit gaming themed interface with modular CSS architecture
  - **Mobile-Responsive Design**: Optimized for phone/tablet access
  - Custom ZFS, system, recovery, and **torrent management** dashboards
  - **Deluge Integration**: Real-time torrent stats, download progress, queue management
- **Prometheus**: http://192.168.0.99:9090
  - Metrics collection and time-series database
- **Exporters**:
  - **Node Exporter**: Port 9100 - System metrics
  - **ZFS Exporter**: Port 9101 - Custom pool/dataset metrics  
  - **Deluge Exporter**: Port 9102 - Torrent client metrics (custom Python exporter)
- **Theme Architecture**: 
  - `/configs/grafana-theme.json` - 16-bit color palette & component definitions
  - `/configs/grafana-custom.css` - Responsive CSS with mobile-first design
  - `/configs/grafana-deluge-panels.json` - Torrent management panel configurations

### Web Services (✅ ACTIVE)
- **FileBrowser**: http://192.168.0.99:8080/files/ - ZFS storage management (NoAuth, proper pool access)
- **System Dashboard**: http://192.168.0.99/system-status.html - Basic health check

### Media Services (✅ DEPLOYED)
- **Plex Media Server**: http://192.168.0.99:32400 - Claimed, Google auth working
  - Storage: 8.7TB media-pool + transcoding on staging-pool
  - Container: Proper ZFS pool mounts, software transcoding ready

### Media Acquisition Stack (✅ **OPERATIONAL**)
- **Firefox Container**: http://192.168.0.99:3001 - ✅ **WORKING** 
  - Type: jlesage/firefox with privileged mode
  - Interface: VNC-based web browser, desktop-optimized
  - Purpose: Secure torrent site browsing and .torrent file acquisition
  - Storage: Downloads to /service-pool/firefox-alt/downloads/
  
- **Deluge LXC Container**: http://192.168.0.111:8112 - ✅ **OPERATIONAL**
  - Type: Native Proxmox LXC (Ubuntu 22.04) - bypasses Docker s6 issues  
  - Authentication: Password "deluge"
  - Storage: **Direct downloads to /staging-pool/downloads/** (675GB capacity)
  - Features: Automatic .torrent processing, web interface accessible
  - Status: CT 110 running, both torrents active and downloading
  
- **Automation Pipeline**: ✅ **ACTIVE**
  - Cron job: 30-second .torrent file monitoring  
  - Workflow: Firefox downloads → staging-pool → Deluge processing
  - File transfer: Existing torrents moved to staging-pool successfully
  
- **WireGuard VPN Server**: Port 51820/udp - Remote homelab access
  - Clients: 5 peer configurations generated
  - Access: Full homelab network through secure tunnel

### Container Architecture Lessons Learned
**🚫 LinuxServer.io Docker Issues**: All LinuxServer.io containers (qBittorrent, Deluge, Transmission) fail with `s6-ipcserver-socketbinder: fatal: unable to create socket: Permission denied` in Proxmox environment.

**✅ Working Solutions**:
- **Firefox**: jlesage/firefox:latest with `--privileged` flag
- **Deluge**: Native LXC container approach bypasses Docker permission issues
- **Alternative**: Official container images without s6 supervision system

### Complete Media Workflow Architecture
```
🔍 Content Discovery → ⚡ Download → 🎯 Processing → 📺 Plex Integration

Phase 1: Firefox Container (✅ WORKING)
├── Browse torrent sites securely  
├── Download .torrent files to /config/downloads/
└── Transfer to Deluge watch folder

Phase 2: Deluge LXC Container (✅ OPERATIONAL)
├── Native Ubuntu 22.04 installation - CT 110 running  
├── Direct downloads to /staging-pool/downloads/ (675GB capacity)
├── Web UI: http://192.168.0.111:8112 (password: "deluge")
├── Both torrents active: Columbo + Disney collections downloading
└── Automatic .torrent processing via 30-second cron job

Phase 3: Media Processing Pipeline (📋 PLANNED)
├── FileBot: Rename & organize (TV Shows/Movies)
├── Bazarr: Automatic subtitle acquisition & sync
├── Custom scripts: Quality control & sorting
└── Final placement in /media-pool/ for Plex

Phase 4: Subtitle Integration (📋 PLANNED)
├── Extract embedded subtitles from video files
├── Download external subs (OpenSubtitles, Addic7ed) 
├── Auto-sync timing corrections with FFmpeg
├── Convert formats (.ass → .srt for Plex compatibility)
└── Place alongside video files in Plex structure
```

## Standardized Deployment Patterns

### Container Architecture Decision Matrix

#### ✅ Proxmox LXC Containers (Recommended)
**Use Cases**: Native service deployment, maximum compatibility, storage-heavy applications
- **Deluge Torrent Client**: CT 110 - Proven reliable, bypasses s6 permission issues
- **File Servers**: Direct hardware access, optimal I/O performance  
- **Databases**: Maximum compatibility, efficient resource usage

#### ⚠️ Docker Containers (Conditional)
**Use Cases**: Lightweight services, proven container images, development environments
- **Firefox**: jlesage/firefox with `--privileged` flag - working solution
- **Official Images**: Avoid LinuxServer.io, use upstream maintainers
- **Web Services**: Grafana, Prometheus, APIs work well

#### ❌ LinuxServer.io Docker Images (Avoid)
**Issue**: All LinuxServer.io containers fail with `s6-ipcserver-socketbinder: fatal: unable to create socket: Permission denied`
**Affected**: qBittorrent, Deluge, Transmission, Plex, Radarr, Sonarr
**Root Cause**: s6 supervision system conflicts with Proxmox container security

### Storage Architecture Standards

#### Critical Pattern: Direct Pool Mounting
```bash
# CORRECT: Mount actual ZFS pools
docker run -d --name service-name \
  -v /media-pool:/srv/media-pool \
  -v /service-pool:/srv/service-pool \
  -v /staging-pool:/srv/staging-pool \
  image:tag

# LXC Pool Mounting
pct set <VMID> \
  -mp0 /staging-pool,mp=/staging-pool \
  -mp1 /service-pool,mp=/service-pool \
  -mp2 /media-pool,mp=/media-pool

# INCORRECT: Only mounting /mnt misses actual pools
docker run -d --name service-name -v /mnt:/srv image:tag
```

#### Storage Allocation Strategy
- **Container Root FS**: Minimal size (18GB+) for services only
- **Large Downloads**: Direct to ZFS pools (avoid container storage limits)
- **Processing**: Use staging-pool for temporary operations (675GB capacity)
- **Final Storage**: Use media-pool for long-term content (8.7TB capacity)

#### Proven Storage Patterns
| Service Type | Storage Strategy | Pool Usage | Rationale |
|--------------|------------------|------------|-----------|
| Torrent Clients | Direct staging-pool downloads | 675GB available | Avoids container filesystem limits |
| Media Services | Mount media-pool read-only | 8.7TB content | Sequential access optimized |  
| Processing Tools | staging-pool working directory | High IOPS | Fast temporary file operations |
| Configuration | service-pool persistent configs | SSD performance | Quick service startup |

### Mobile-First Interface Standards

#### Cross-Device UX Architecture
- **Desktop**: Full-featured interfaces (Firefox VNC, Deluge web UI)
- **Mobile**: Grafana responsive dashboard with torrent management panels
- **Tablet**: Hybrid interface with touch-optimized controls
- **API Integration**: Consistent backend for all interface types

#### Mobile Interface Components
```css
/* Mobile-responsive torrent management */
@media (max-width: 768px) {
  .torrent-controls { flex-direction: column; }
  .torrent-queue-mobile { touch-optimized interface }
  .dashboard-grid { single-column layout }
}
```

### Service Health Monitoring Standards
```bash
# Automated health checks
*/5 * * * * /usr/local/bin/system-monitor.sh
*/1 * * * * /staging-pool/torrent-automation.sh

# Status verification endpoints
curl http://192.168.0.99:3000    # Grafana dashboard
curl http://192.168.0.111:8112   # Deluge web interface  
curl http://192.168.0.99:3001    # Firefox container
```

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

## Next Phase Priority Queue (Multi-Threaded Assignments)
1. **GPU Drivers** → **On Hold**: Awaiting NVIDIA 575+ driver release for RTX 5070 Ti
2. **Repository Fix** → **✅ COMPLETED**: All repositories now using Bookworm
3. **AI Services** → **In Planning**: Ollama + Open WebUI deployment for local AI/LLM
4. **Container Orchestration** → **Feature Branch**: Add Portainer with proper storage architecture (container-mgmt branch)
5. **Advanced Monitoring** → **Reader Thread**: Custom alerting and performance thresholds
6. **Automation Enhancement** → **Writer Thread**: Media processing pipeline automation

**Orchestrated Workflow**: Main branch coordinates, Reader provides system status, Writer implements infrastructure, Features handle specialized deployments.

### ✅ Phase 1 Complete - Production Homelab Operational
- **Service Stack**: 8/8 services running with proper monitoring
- **Storage Architecture**: 9TB ZFS pools with proven mounting patterns
- **Media Pipeline**: Content acquisition workflow fully operational
- **Documentation**: Agent knowledge archived, deployment patterns captured
- **Multi-Threading**: Orchestrated worktree system proven effective

## 📚 **Documentation Architecture**

### New Hierarchical Structure (Deployed 2025-08-25)
**Location**: `/home/darney/projects/proxmox-homelab-writer/docs/`
```
docs/
├── README.md                          # Main navigation hub
├── CURRENT/                           # SSH-verified system state
│   ├── hardware-inventory.md
│   ├── storage-architecture.md
│   ├── services-deployed.md           # ✅ All 8/8 services operational
│   └── next-actions.md
├── ARCHITECTURE/                      # Proven design patterns
│   ├── storage-mounting.md
│   ├── worktree-strategy.md
│   └── gpu-allocation.md
├── WORKFLOWS/                         # Operational procedures
│   ├── data-curation-workflow.md
│   ├── media-processing.md
│   └── backup-procedures.md
└── ARCHIVE/                           # Historical preservation
    ├── 2025-08-recovery/             # Recovery mission docs
    └── legacy-planning/              # Early planning docs
```

### Comprehensive Guides
- **[Container Architecture Standards](/docs/container-architecture-standards.md)**: Complete deployment patterns, troubleshooting guides, and best practices based on real-world Proxmox implementation experience
- **Theme Configuration**: Grafana 16-bit gaming theme with mobile-responsive design in `/configs/`
- **Automation Scripts**: Torrent processing, health monitoring, and system status tools in `/scripts/`

### Quick Reference
- **Working Service URLs**: All confirmed operational endpoints documented with authentication details
- **Storage Patterns**: Proven ZFS pool mounting strategies and capacity planning guidelines  
- **Container Deployment**: LXC vs Docker decision matrix with specific use cases and compatibility notes
- **Mobile Interface**: Cross-device UX patterns and responsive design implementation strategies

## ⚠️ Critical System Updates (2025-08-25)

### Repository Configuration FIXED
**Previous Issue**: System was incorrectly using Debian Trixie (13) repositories
**Resolution**: All repositories now properly configured for Debian Bookworm (12)
- Fixed `/etc/apt/sources.list.d/debian.sources`
- Removed all Trixie package conflicts
- System stability restored

### RTX 5070 Ti Status
**Hardware**: NVIDIA Corporation GB203 [GeForce RTX 5070 Ti] detected
**Driver Issue**: Blackwell architecture requires NVIDIA driver 575+ (not yet released)
**Current State**: 
- Driver 570.86.16 installed but cannot initialize GPU
- Error: `RmInitAdapter failed! (0x62:0x40:1860)`
- nvidia-smi returns "No devices were found"
**Action Required**: Wait for NVIDIA to release 575+ series drivers

### Known Console Messages
**AppArmor/Audit Logs**: Continuous scrolling of `s6-ipcserver-so` permission denials
- Source: LinuxServer.io containers (Plex, WireGuard)
- Status: Expected behavior, not a security issue
- Impact: Cosmetic only, services functioning normally