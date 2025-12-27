# Standardized Deployment Patterns

## Container Architecture Decision Matrix

### ✅ Proxmox LXC Containers (Recommended)
**Use Cases**: Native service deployment, maximum compatibility, storage-heavy applications
- **qBittorrent Torrent Client**: CT 110 - Proven reliable, bypasses Docker s6 permission issues
- **File Servers**: Direct hardware access, optimal I/O performance
- **Databases**: Maximum compatibility, efficient resource usage

### ⚠️ Docker Containers (Conditional)
**Use Cases**: Lightweight services, proven container images, development environments
- **Official Images**: Avoid LinuxServer.io, use upstream maintainers
- **Web Services**: APIs and other web services work well.

### ❌ LinuxServer.io Docker Images (Avoid)
**Issue**: All LinuxServer.io containers fail with `s6-ipcserver-socketbinder: fatal: unable to create socket: Permission denied`
**Affected**: qBittorrent, Deluge, Transmission, Plex, Radarr, Sonarr
**Root Cause**: s6 supervision system conflicts with Proxmox container security

## Storage Architecture Standards

### Critical Pattern: Direct Pool Mounting
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

### Storage Allocation Strategy
- **Container Root FS**: Minimal size (18GB+) for services only
- **Large Downloads**: Direct to ZFS pools (avoid container storage limits)
- **Processing**: Use staging-pool for temporary operations (675GB capacity)
- **Final Storage**: Use media-pool for long-term content (8.7TB capacity)

### Proven Storage Patterns
| Service Type | Storage Strategy | Pool Usage | Rationale |
|--------------|------------------|------------|-----------|
| Torrent Clients | Direct staging-pool downloads | 675GB available | Avoids container filesystem limits |
| Media Services | Mount media-pool read-only | 8.7TB content | Sequential access optimized |  
| Processing Tools | staging-pool working directory | High IOPS | Fast temporary file operations |
| Configuration | service-pool persistent configs | SSD performance | Quick service startup |

## Mobile-First Interface Standards

### Cross-Device UX Architecture
- **Desktop**: Full-featured interfaces (e.g., qBittorrent web UI).
- **Mobile**: Responsive web interfaces for key services.
- **Tablet**: Hybrid interfaces with touch-optimized controls.
- **API Integration**: Consistent backend for all interface types.

## Proxmox Web Interface Workflows

### Access Points
- **Primary Interface**: https://192.168.0.99:8006 (accept SSL certificate)
- **Node Console**: Direct shell access via web browser
- **Container Management**: Create, configure, and monitor LXC containers

### Common Administrative Tasks
```bash
# Via Proxmox Web Console (Node → Shell):
pct list                    # List containers
pct start/stop/restart 100  # Manage containers
zpool status               # Check pool health
zfs list                   # View datasets

# Via SSH (fallback):
ssh root@192.168.0.99 "command"  # Direct command execution
```
