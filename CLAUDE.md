# Proxmox Homelab Project Guide

## Project Overview
Building a comprehensive home server on Proxmox VE 8.x with focus on media serving, storage pooling, and containerized services.

### Hardware

#### Current System Configuration
- **CPU**: Intel i7-8700 (6 cores, 12 threads, VT-x/VT-d enabled)
- **Motherboard**: 6 SATA ports, 2 M.2 slots, multiple PCIe slots
- **RAM**: 32GB total (all 4 DIMM slots occupied)
  - DIMM_A1/A2: 16GB Corsair Vengeance LPX DDR4-2400 (2x8GB)
  - DIMM_B1/B2: 16GB T-Force DARK DDR4-3000 (2x8GB)
- **GPU**: NVIDIA GeForce RTX 5070 Ti 16GB (PCIe x16_1 slot) - **INSTALLED** ✅
- **Secondary GPU**: GTX 970 4GB - **PENDING** (waiting for right angle audio cables)
- **PSU**: Seasonic Focus PX-750 (750W 80+ Platinum) - Excellent for upgrades
- **Network**: 192.168.0.99

#### Current Storage & Port Usage
- **M.2_1**: HP SSD EX920 512GB NVMe (Proxmox OS + 347.9G LVM)
- **M.2_2**: Available
- **SATA Ports**: 3-4 drives connected of 6 total
  - sda 1.8T: Storage drive
  - sdb 3.6T: Media drive  
  - sdc 698.6G: Games drive
  - sdd 223.6G: SSD
- **PCIe Slots Available**:
  - PCIe x16_2: Available (x8 electrical) - Perfect for LSI HBA
  - PCIe x16_3: Available (x4 electrical)
  - PCIe x1: 3 available (1 used by USB card)
- **USB Expansion**: 3 external drives ready for shucking
- **Recovery Storage**: 4TB blank drive available for data staging

#### Planned Upgrades
- **Primary**: LSI HBA card in PCIe x16_2 slot (adds 8 SATA ports)
- **Storage**: SATA power splitters to support all drives
- **Secondary GPU**: GTX 970 4GB (dedicated Plex transcoding)
- **ICY DOCK**: MB024SP-B mobile rack installed for hot-swap testing
- **Expansion**: Shuck 3 external USB drives for storage pool growth
- **BIOS**: Configure M.2_2 to x2 mode (preserves SATA_5/6 ports)

### 🚨 CRITICAL ISSUE: ZFS Data Loss
**Date**: 2025-08-17
**Status**: ZFS pool signatures accidentally wiped
**Impact**: Plex media data (3.6TB) currently inaccessible
**Recovery**: No attempts made yet, raw data intact
**Priority**: Data recovery must precede all other tasks

### Core Services Plan
1. **🔥 DATA RECOVERY**: ZFS pool signature restoration (URGENT)
2. **Plex Media Server**: Restore service after data recovery
3. **GPU Configuration**: RTX 5070 Ti + GTX 970 dual setup
4. **AI/LLM Services**: Local inference with RTX 5070 Ti
5. **Storage Expansion**: ICY DOCK testing and drive shucking
6. **Container Services**: Docker/Portainer, Home Assistant
7. **Development Environment**: Code-server + AI coding assistants
8. **Network Services**: PiHole, VPN
9. **Gaming**: Windows 11 VM with RTX 5070 Ti passthrough

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
- **IP Address**: Proxmox is at 192.168.0.99 (not .100)
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

## Current State
- ✅ Proxmox VE 9.0.3 installed and accessible (192.168.0.99)
- ✅ SSH configured with key authentication
- ✅ RTX 5070 Ti 16GB installed and detected
- ✅ ICY DOCK MB024SP-B mobile rack installed
- ✅ 4TB recovery drive available for data staging
- ✅ Git worktree system operational (main/reader/writer/features)
- ⚠️ Repository mixing Bookworm/Trixie (needs fix)
- ❌ ZFS pool signatures wiped - DATA RECOVERY URGENT
- ❌ nvidia-smi not working (driver configuration needed)
- ⏳ GTX 970 ready to install (waiting for cable clearance)

## Immediate Priority Queue
1. **ZFS Data Recovery**: Clone 3.6TB drive, attempt file carving
2. **GPU Drivers**: Fix nvidia-smi, enable passthrough
3. **Secondary GPU**: Install GTX 970 for dedicated Plex transcoding
4. **Repository Fix**: Correct debian.sources to use Bookworm
5. **Storage Testing**: Use ICY DOCK for drive health verification