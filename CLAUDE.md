# Proxmox Homelab Project Guide

## Project Overview
Building a comprehensive home server on Proxmox VE 8.x with focus on media serving, storage pooling, and containerized services.

### Hardware
- **CPU**: Intel i7-8700 (6 cores, VT-x/VT-d enabled)
- **RAM**: 32GB
- **GPU**: NVIDIA GTX 970 (for Plex hardware transcoding)
- **Network**: 192.168.0.99 (changed from .100 due to conflict)
- **Storage**:
  - NVMe 476.9G: Proxmox OS + 347.9G LVM for VMs
  - ZFS Pool (degraded, data preserved):
    - sda 1.8T: Storage drive
    - sdb 3.6T: Media drive  
    - sdc 698.6G: Games drive
    - sdd 223.6G: SSD
  - USB drives (future expansion)

### Core Services Plan
1. **Plex Media Server**: Hardware transcoding via GPU passthrough
2. **MergerFS**: Flexible storage pooling
3. **Docker/Portainer**: Container management
4. **Home Assistant**: Home automation
5. **Backup Solutions**: Automated backups
6. **Development Environment**: Code-server
7. **Network Services**: PiHole, VPN
8. **Minecraft Server**: Java Edition

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
# Import degraded pool when needed for Plex data
zpool import -f -d /dev/disk/by-id rpool
zfs list -r rpool
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
- **Data Preservation**: All existing ZFS pool data must be preserved
- **IP Changed**: Proxmox is at 192.168.0.99 (not .100)
- **GPU Passthrough**: Requires IOMMU configuration after basic setup
- **Repository**: Using Bookworm (stable), not Trixie
- **Security First**: Firewall and certificates before exposing services

## Current State
- ✅ Proxmox installed and accessible
- ✅ SSH configured with key auth
- ✅ Repository issues resolved
- ✅ Storage mapped but ZFS pool not yet imported
- ✅ Ready for first container deployment