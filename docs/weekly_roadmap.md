# ⚠️ **ARCHIVED** - Legacy Weekly Implementation Roadmap

**Status**: This document represents legacy single-threaded development approach and is archived as of v1.0.1.

**Current Approach**: Multi-threaded orchestrated development via Git worktrees.
**Active Documents**: 
- `/docs/orchestrated-worktree-strategy.md` - Comprehensive multi-threaded strategy
- `/docs/next-phase-roadmap.md` - Current roadmap with thread assignments

---

# Legacy Weekly Implementation Roadmap

## Week 1: Foundation (Current)

### Completed ✓
- [x] Repository configuration (Bookworm)
- [x] SSH access and key setup
- [x] Network configuration (IP: 192.168.0.99)
- [x] Storage inventory
- [x] Project structure

### Remaining Tasks
- [ ] Import ZFS pool (when ready for Plex data)
- [ ] Create first LXC container (Ubuntu 22.04 for Plex)
- [ ] Basic Plex installation (no GPU yet)
- [ ] Configure Proxmox firewall
- [ ] Set up SSL certificates
- [ ] Create backup of Proxmox config

### Week 1 Commands
```bash
# Create Plex container
pct create 100 local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.gz \
  --hostname plex \
  --memory 4096 \
  --cores 2 \
  --rootfs local-lvm:32 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --start 1

# Import ZFS pool
zpool import -f -d /dev/disk/by-id rpool
```

## Week 2: Storage & Services

### Goals
- Configure GPU passthrough for Plex
- Set up MergerFS for flexible storage
- Deploy Portainer for Docker management
- Create file sharing solution (SMB/NFS)
- Implement first backup strategy
- Deploy Home Assistant container

### Key Tasks

#### GPU Passthrough
1. Configure IOMMU groups
2. Blacklist nvidia driver on host
3. Pass GTX 970 to Plex container

#### MergerFS Setup
1. Plan drive organization
2. Install MergerFS
3. Create unified storage pool
4. Set up Plex to use MergerFS

#### Container Deployment
1. Portainer on dedicated container
2. Home Assistant with persistent storage
3. Configure inter-container networking

## Week 3: Advanced Services

### Goals
- Deploy remaining services (PiHole, VPN, etc.)
- Set up automated backups
- Implement monitoring solution
- Configure reverse proxy (Nginx/Traefik)
- Security hardening
- Performance optimization

### Services Priority

#### Network Services
1. PiHole for ad blocking
2. WireGuard/OpenVPN server
3. Cloudflare tunnel for external access

#### Development Tools
1. Code-server for remote development
2. Git server (Gitea)
3. CI/CD pipeline

#### Entertainment
1. Minecraft server
2. Additional media services
3. Game streaming setup

## Quick Reference Commands

### Container Creation Template
```bash
pct create [ID] [template] \
  --hostname [name] \
  --memory [RAM-MB] \
  --cores [CPU-cores] \
  --rootfs local-lvm:[size-GB] \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp
```

### Storage Operations
```bash
# Check storage status
pvesm status
df -h
zfs list

# Mount points for containers
pct set [ID] -mp0 /host/path,mp=/container/path
```

### Monitoring Commands
```bash
# System resources
htop
iotop -a
pvesh get /nodes/lcib/status

# Container resources  
pct status [ID]
pct exec [ID] -- command
```