# ZFS Pool Management Guide

## Current Pool Configuration

### Media-Pool Overview
- **Pool Name**: media-pool
- **Storage**: 4TB WD Blue (/dev/sdf)
- **Available Space**: 3.50T (compressed)
- **Current Usage**: 15.2G (shop drive recovery data)
- **Compression**: LZ4 (automatic ~23% space savings)
- **Status**: Healthy, no errors

### Dataset Structure
```
media-pool/                          # Root pool
├── archives/                        # High compression (gzip-9) for ZIP/archives
├── media/                           # Standard compression (lz4) for video/audio
└── recovered-data/                  # Recovery data organization
    └── shop-drive-sdc3-2025-08-22/  # Labeled recovery from shop system
        ├── wav/                     # 8.4GB audio files
        ├── zip/                     # 5.9GB archives  
        ├── wmv/                     # 1.1GB Windows video
        ├── mpg/                     # 887MB video files
        ├── png/                     # 522MB images
        └── pdf/                     # 76MB documents
```

## ZFS Features in Use

### Compression
- **Pool Default**: LZ4 (fast, good ratio)
- **Archives Dataset**: GZIP-9 (maximum compression)
- **Media Dataset**: LZ4 (optimized for already-compressed files)
- **Current Savings**: 1.23x compression ratio (18GB → 15.2GB)

### Snapshots
- **Initial Snapshot**: `@initial-recovery` - protects original recovered data
- **Usage**: Zero space until data changes (copy-on-write)
- **Recovery**: Instant rollback to any snapshot point

### Record Size Optimization
- **Recovery Data**: 1MB records (optimized for large media files)
- **Default Pool**: 128K records (general purpose)

## Common ZFS Commands

### Pool Management
```bash
# Check pool status
zpool status media-pool

# Check pool capacity
zpool list media-pool

# Pool health monitoring
zpool history media-pool
```

### Dataset Operations
```bash
# List all datasets with properties
zfs list -r -o name,used,compression,recordsize media-pool

# Check compression ratios
zfs get compressratio media-pool

# View snapshots
zfs list -t snapshot
```

### Snapshot Management  
```bash
# Create snapshot
zfs snapshot media-pool/recovered-data/shop-drive-sdc3-2025-08-22@backup-$(date +%Y%m%d)

# List snapshots
zfs list -t snapshot

# Rollback to snapshot (destroys newer data!)
zfs rollback media-pool/recovered-data/shop-drive-sdc3-2025-08-22@initial-recovery

# Delete snapshot
zfs destroy media-pool/recovered-data/shop-drive-sdc3-2025-08-22@snapshot-name
```

### Advanced Features
```bash
# Clone dataset (instant copy)
zfs clone media-pool/recovered-data/shop-drive-sdc3-2025-08-22@initial-recovery media-pool/review-copy

# Send/receive for backups
zfs send media-pool/recovered-data/shop-drive-sdc3-2025-08-22@initial-recovery > backup.zfs

# Check dataset properties
zfs get all media-pool/recovered-data/shop-drive-sdc3-2025-08-22
```

## Proxmox Integration

### Storage Configuration
- **Storage ID**: media-pool
- **Type**: zfspool  
- **Status**: Active
- **Content Types**: VM disk images, container rootfs
- **Web UI**: Datacenter → Storage → media-pool

### Expansion Options

#### Option 1: Convert to Mirror (Recommended)
```bash
# Add second drive to create mirror
zpool attach media-pool /dev/sdf /dev/sdX

# Result: 4TB usable, full redundancy
# Benefits: Fault tolerance, no data loss if drive fails
```

#### Option 2: Add Additional VDev
```bash  
# Add another single drive
zpool add media-pool /dev/sdX

# Result: ~8TB usable (sum of drives)
# Risk: No redundancy, lose everything if any drive fails
```

#### Option 3: Expand to RAIDZ
```bash
# Requires 3+ drives minimum
zpool create media-pool-v2 raidz /dev/sdf /dev/sdX /dev/sdY

# Result: N-1 drives usable capacity with 1-drive fault tolerance
```

## Backup Strategy

### Local Snapshots
- **Automated daily snapshots** of critical datasets
- **Retention policy**: 7 daily, 4 weekly, 12 monthly
- **Zero space cost** until data changes

### Remote Backup
```bash
# Send incremental backups to remote system
zfs send -i @previous @current | ssh backup-host zfs receive backup-pool/media
```

### VM/Container Storage
- **Instant snapshots** before system changes
- **Template cloning** for rapid VM deployment  
- **Thin provisioning** - only pay for used space

## Monitoring & Maintenance

### Health Checks
```bash
# Weekly scrub for data integrity
zpool scrub media-pool

# Check scrub progress
zpool status -v media-pool

# Email alerts for issues
echo "zpool status errors" | mail -s "ZFS Alert" admin@domain
```

### Performance Monitoring
- **Arc usage**: `cat /proc/spl/kstat/zfs/arcstats`
- **I/O statistics**: `zpool iostat media-pool 1`
- **Dataset usage**: `zfs list -r -o space media-pool`

## Next Steps

1. **Configure automated snapshots** with cron or systemd timers
2. **Set up monitoring** with Netdata or Prometheus
3. **Plan redundancy** by adding mirror drive
4. **Organize data** by moving files from recovery folder to logical structure
5. **Deploy media server** (Plex, Jellyfin) using ZFS datasets

## Recovery Context

The shop-drive-sdc3-2025-08-22 dataset contains files recovered from a corrupted drive using Foremost file carving. Original filenames and directory structure were lost, but 18GB of data was successfully recovered including:
- Audio files (WAV format)
- Video files (WMV, MPG formats) 
- Images (PNG format)
- Documents (PDF format)
- Archives (ZIP format)

Files use numeric names based on disk sectors where they were found. Manual review and organization will be needed to identify valuable content.