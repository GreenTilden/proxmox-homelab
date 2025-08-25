# Container Storage Architecture Guide

## Overview
This guide establishes best practices for mounting ZFS storage pools in containerized services on the Proxmox homelab. Proper storage architecture is critical for performance, security, and data accessibility.

## Core Principle: Direct Pool Mounting

### ✅ Correct Pattern
```bash
docker run -d --name service-name \
  -v /media-pool:/srv/media-pool \
  -v /service-pool:/srv/service-pool \
  -v /staging-pool:/srv/staging-pool \
  -e PUID=0 -e PGID=0 \
  image:tag
```

### ❌ Incorrect Pattern  
```bash
# This misses actual ZFS pools!
docker run -d --name service-name \
  -v /mnt:/srv \
  image:tag
```

## ZFS Pool Architecture

### Current Pool Structure
```
/media-pool/     (9.06TB) - Media content and archives
├── archives/    - Long-term archive storage
├── carved-originals/ - Forensic recovery data (122MB)
├── media/       - Active media files (155MB)  
└── recovered-data/ - Recovery staging (30.4GB)

/service-pool/   (232GB) - High-speed SSD storage
├── containers/  - Container persistent data
├── databases/   - Database storage
└── cache/       - Application cache

/staging-pool/   (696GB) - Working and temporary storage
├── uploads/     - File upload staging
├── processing/ - Temporary processing space
└── backups/     - Backup staging area
```

## Service-Specific Storage Patterns

### Media Services (Plex, Jellyfin, Emby)
```bash
# Primary focus: media-pool for content
docker run -d --name plex \
  -v /media-pool:/data \
  -v /service-pool/plex:/config \
  -v /staging-pool/transcoding:/transcode \
  --device /dev/nvidia0:/dev/nvidia0 \
  plexinc/pms-docker
```

**Rationale**: 
- Media content lives on large, slower pool
- Configuration on fast SSD pool  
- Transcoding uses temporary staging space

### Development Services (code-server, GitLab)
```bash
# Primary focus: service-pool for performance
docker run -d --name code-server \
  -v /service-pool/workspace:/home/coder/workspace \
  -v /staging-pool/temp:/tmp \
  -v /media-pool/projects:/data \
  codercom/code-server
```

**Rationale**:
- Active development on fast SSD
- Temporary files on staging pool
- Archive projects on media pool

### Management Services (FileBrowser, Portainer)
```bash
# Full access pattern: all pools mounted
docker run -d --name filebrowser \
  -v /media-pool:/srv/media-pool \
  -v /service-pool:/srv/service-pool \
  -v /staging-pool:/srv/staging-pool \
  -v /mnt:/srv/mnt \
  filebrowser/filebrowser --noauth
```

**Rationale**:
- Management tools need visibility into all storage
- Maintains pool structure in web interface
- Enables cross-pool operations

### Processing Services (Video encoding, AI/ML)
```bash
# Staging-focused with selective access
docker run -d --name processor \
  -v /staging-pool:/workspace \
  -v /media-pool/media:/input \
  -v /media-pool/archives:/output \
  -v /service-pool/models:/models \
  --gpus all \
  processing-image
```

**Rationale**:
- Working space on staging pool
- Input/output on appropriate pools
- Models cached on fast storage

## Security Considerations

### Permission Management
```bash
# Set proper ownership before container creation
chown -R nobody:nogroup /media-pool/public
chown -R 1000:1000 /service-pool/user-data
chmod -R 755 /staging-pool/shared
```

### Container User Mapping
```bash
# Match container users to system permissions
-e PUID=1000 -e PGID=1000  # For user services
-e PUID=0 -e PGID=0        # For system services (careful!)
```

### Read-Only Mounts
```bash
# Protect critical data with read-only mounts
-v /media-pool/archives:/data:ro
```

## Performance Optimization

### Pool Characteristics
- **media-pool**: Optimized for large sequential reads (media streaming)
- **service-pool**: Optimized for random I/O (databases, applications)  
- **staging-pool**: Balance of capacity and performance (temporary workloads)

### Mount Strategy by Workload
```bash
# High I/O applications
-v /service-pool/app-data:/data

# Large file processing  
-v /staging-pool/processing:/workspace

# Media streaming
-v /media-pool/content:/media

# Archive access (infrequent)
-v /media-pool/archives:/archives:ro
```

## Troubleshooting Guide

### Common Issues

#### Container Can't Access Pools
```bash
# Check ZFS mount status
zfs list -o name,mounted,mountpoint

# Verify pool is mounted
ls -la /media-pool /service-pool /staging-pool

# Check permissions
stat /media-pool /service-pool /staging-pool
```

#### Performance Issues
```bash
# Check pool I/O status
zpool iostat -v 1

# Monitor container disk usage
docker stats --format "table {{.Container}}\\t{{.BlockIO}}"

# Check for competing I/O
iotop -o
```

#### Storage Full Errors
```bash
# Check pool usage
zfs list -o space

# Check container overlay usage
docker system df

# Clean up if needed
docker system prune -f
```

## Docker Compose Templates

### FileBrowser with Proper Mounts
```yaml
version: '3.8'
services:
  filebrowser:
    image: filebrowser/filebrowser:latest
    container_name: filebrowser-zfs
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      - /media-pool:/srv/media-pool
      - /service-pool:/srv/service-pool  
      - /staging-pool:/srv/staging-pool
      - /mnt:/srv/mnt
    environment:
      - PUID=0
      - PGID=0
    command: --noauth
```

### Plex with GPU Transcoding
```yaml
version: '3.8'
services:
  plex:
    image: plexinc/pms-docker
    container_name: plex
    restart: unless-stopped
    ports:
      - "32400:32400"
    volumes:
      - /service-pool/plex:/config
      - /media-pool:/data
      - /staging-pool/plex-transcode:/transcode
    environment:
      - PUID=0
      - PGID=0
      - VERSION=docker
    devices:
      - /dev/nvidia0:/dev/nvidia0
```

## Monitoring Integration

### Storage Metrics to Track
- Pool capacity and usage percentages
- I/O patterns per pool  
- Container storage utilization
- Cross-pool data movement

### Grafana Dashboard Components  
- ZFS pool health and capacity
- Container volume usage
- Storage I/O performance
- Pool-specific error rates

## Backup Strategies

### Pool-Aware Backup Patterns
```bash
# Service pool: Frequent, small backups
zfs snapshot service-pool@$(date +%Y%m%d-%H%M%S)

# Media pool: Infrequent, large backups  
zfs snapshot media-pool@weekly-$(date +%Y%m%d)

# Staging pool: No persistent backups (temporary data)
```

This architecture ensures consistent, performant, and secure access to ZFS storage across all containerized services while maintaining clear separation of concerns between different types of data and workloads.