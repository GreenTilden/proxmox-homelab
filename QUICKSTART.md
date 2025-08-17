# Quick Start Guide

## Thread Management

```bash
# Start appropriate thread
./scripts/claude_threads.sh reader   # For research/reading
./scripts/claude_threads.sh writer   # For implementation
./scripts/claude_threads.sh status   # Quick status check
```

## Common Workflows

### 1. Deploy New Container
```bash
# Reader thread: Research requirements
# Writer thread: Implement deployment
ssh proxmox
pct create [ID] [template] --hostname [name] ...
```

### 2. Storage Operations
```bash
# Check current storage
ssh proxmox "pvesm status"

# Import ZFS pool when ready
ssh proxmox "zpool import -f -d /dev/disk/by-id rpool"
```

### 3. Service Deployment Pattern
1. Reader thread: Check requirements, read docs
2. Writer thread: Create container, configure service
3. Document in configs/ and update inventory

## Next Immediate Step

Run writer thread and create first Plex container:
```bash
./scripts/claude_threads.sh writer
# Ask: "Create LXC container 100 for Plex on Proxmox"
```