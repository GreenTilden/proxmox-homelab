# ZFS Storage Pool Architecture - Unified Reference

**Status**: ✅ **OPERATIONAL** - All pools online
**Last Updated**: 2025-08-27 (Consolidated documentation)
**Verification**: Direct SSH to 192.168.0.99
**Location**: `/home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/ARCHITECTURE/`

## 🗄️ **ZFS Pool Overview**

### **Production Pools Summary**
| Pool | Capacity | Used | Available | Type | Health | Purpose |
|------|----------|------|-----------|------|--------|---------|
| media-pool | 9.0TB | 540GB | 8.41TB | HDD | ONLINE | Media storage |
| service-pool | 225GB | 411MB | 224GB | SSD | ONLINE | Fast services |
| staging-pool | 675GB | 17.8GB | 657GB | HDD | ONLINE | Working space |

### **Total Storage Capacity**
- **Combined Capacity**: 9.9TB
- **Total Used**: 558GB (5.6%)
- **Total Available**: 9.36TB (94.4%)

## 📀 **media-pool Configuration**

### **Pool Composition**
```bash
pool: media-pool
state: ONLINE
config:
  NAME        STATE     READ WRITE CKSUM
  media-pool  ONLINE       0     0     0
    sde       ONLINE       0     0     0  # 1.8TB ST2000DL003
    sdf       ONLINE       0     0     0  # 3.6TB WD40EZAZ
    sdg       ONLINE       0     0     0  # 3.6TB ST4000DM004
```

### **Pool Characteristics**
- **Type**: Striped (RAID0-like for maximum capacity)
- **Redundancy**: None (backup strategy required)
- **Performance**: Optimized for sequential reads
- **Compression**: LZ4 enabled
- **Mount Point**: `/media-pool`

### **Content Organization**
```
/media-pool/
├── recovered-data/        # 30.4GB - Recovery staging
├── carved-originals/      # 122MB - Forensic preservation
├── media/                 # 155MB - Organized content
│   ├── personal-photos/   # 43MB - Curated photos
│   └── final-recovery/    # 80MB - Thumbnails
└── plex-library/         # Future Plex media
    ├── movies/
    ├── tv-shows/
    └── music/
```

## ⚡ **service-pool Configuration**

### **Pool Composition**
```bash
pool: service-pool
state: ONLINE
config:
  NAME          STATE     READ WRITE CKSUM
  service-pool  ONLINE       0     0     0
    sda         ONLINE       0     0     0  # 232GB PNY SSD
```

### **Pool Characteristics**
- **Type**: Single SSD pool
- **Performance**: Optimized for random I/O
- **Use Cases**: 
  - Container root filesystems
  - Database storage
  - Application configurations
  - High-IOPS workloads
- **Mount Point**: `/service-pool`

### **Planned Content**
```
/service-pool/
├── containers/           # LXC/Docker persistent data
├── databases/           # PostgreSQL, MySQL data
├── configs/             # Service configurations
└── cache/              # Application caches
```

## 🔄 **staging-pool Configuration**

### **Pool Composition**
```bash
pool: staging-pool
state: ONLINE
config:
  NAME          STATE     READ WRITE CKSUM
  staging-pool  ONLINE       0     0     0
    sdc         ONLINE       0     0     0  # 698GB WD7502AAEX
```

### **Pool Characteristics**
- **Type**: Single HDD pool
- **Performance**: Balanced capacity/speed
- **Use Cases**:
  - Download staging area
  - Temporary processing space
  - Transcoding workspace
  - Build artifacts
- **Mount Point**: `/staging-pool`

### **Content Structure**
```
/staging-pool/
├── downloads/           # Active downloads
├── processing/         # Temporary work area
├── transcoding/        # Plex transcoding cache
└── builds/            # Development artifacts
```

## 🔧 **ZFS Configuration & Features**

### **Active Features**
```yaml
ZFS_Features:
  compression: lz4        # ~10-30% space savings
  checksum: on           # Data integrity verification
  atime: off            # Performance optimization
  xattr: sa             # Extended attributes
  snapshots: enabled    # Point-in-time backups
  dedup: off           # Disabled (RAM intensive)
```

### **Performance Tuning**
```bash
# Current ARC (cache) settings
cat /proc/spl/kstat/zfs/arcstats | grep size
# c_max: 16GB (50% of system RAM)
# c_min: 2GB
# size: ~8GB typical usage

# Recommended tuning for media server
echo 17179869184 > /sys/module/zfs/parameters/zfs_arc_max  # 16GB max
```

## 🛡️ **Data Protection Strategy**

### **Snapshot Schedule**
```bash
# Daily snapshots for all pools
0 2 * * * zfs snapshot -r media-pool@daily-$(date +\%Y\%m\%d)
0 2 * * * zfs snapshot -r service-pool@daily-$(date +\%Y\%m\%d)
0 2 * * * zfs snapshot -r staging-pool@daily-$(date +\%Y\%m\%d)

# Weekly cleanup (keep 30 days)
0 3 * * 0 zfs-prune-snapshots --keep=30d
```

### **Backup Recommendations**
1. **media-pool**: External backup for irreplaceable content
2. **service-pool**: Regular config exports, database dumps
3. **staging-pool**: No backup needed (temporary data)

## 📊 **Storage Monitoring**

### **Health Check Commands**
```bash
# Pool status
zpool status -v
zpool list -H -o name,size,alloc,free,health

# Dataset usage
zfs list -o name,used,avail,refer,mountpoint

# I/O statistics
zpool iostat -v 5

# Scrub schedule (monthly)
0 0 1 * * zpool scrub media-pool
0 0 2 * * zpool scrub service-pool
0 0 3 * * zpool scrub staging-pool
```

### **Monitoring Metrics**
- **Capacity Alerts**: Warning at 80%, Critical at 90%
- **Health Checks**: Every 5 minutes via Prometheus
- **Scrub Reports**: Monthly integrity verification
- **Performance**: I/O latency monitoring

## 🔄 **Container Mounting Patterns**

### **Best Practices**
```bash
# Docker container mounting
docker run -d --name service \
  -v /media-pool:/data/media:ro \
  -v /service-pool/app:/config \
  -v /staging-pool/downloads:/downloads \
  image:tag

# LXC container mounting
pct set VMID -mp0 /media-pool,mp=/media-pool
pct set VMID -mp1 /service-pool,mp=/service-pool
pct set VMID -mp2 /staging-pool,mp=/staging-pool
```

### **Mount Strategy**
| Pool | Container Access | Permissions | Use Case |
|------|------------------|-------------|----------|
| media-pool | Read-only | 755 | Media serving |
| service-pool | Read-write | 775 | Service data |
| staging-pool | Read-write | 777 | Downloads/temp |

## 📈 **Expansion Planning**

### **Growth Projections**
- **media-pool**: Add drives as needed (LSI HBA ready)
- **service-pool**: Consider RAID1 mirror for redundancy
- **staging-pool**: Adequate for current needs

### **Future Architecture**
```yaml
Planned_Expansion:
  LSI_HBA_Card:
    ports: 8 additional SATA
    drives: 3x USB drives to shuck (10-12TB)
  
  Pool_Evolution:
    media-pool: Migrate to RAIDZ1 for redundancy
    service-pool: Mirror with second SSD
    fast-pool: New NVMe pool for databases
```

## 🚨 **Recovery History**

### **2025-08-17 Incident**
- **Event**: ZFS pool signatures accidentally wiped
- **Impact**: 3.6TB media library unrecoverable
- **Recovery**: 246MB personal data preserved
- **Lessons**: Snapshot strategy implemented

### **Current Recovery Status**
```
Recovery Statistics:
- Personal Photos: 31 files (43MB) ✅ 
- Forensic Archive: 1,246 files (123MB) ✅
- Organized Content: 929 files (80MB) ✅
- Total Preserved: 246MB across all categories
```

## 🔍 **Troubleshooting Guide**

### **Common Issues**
1. **Pool Import Failures**
   ```bash
   zpool import -f pool-name
   zpool clear pool-name
   ```

2. **Dataset Mount Issues**
   ```bash
   zfs mount -a
   zfs set mountpoint=/path pool/dataset
   ```

3. **Performance Degradation**
   ```bash
   # Check for scrub/resilver
   zpool status
   # Adjust ARC size
   echo $SIZE > /sys/module/zfs/parameters/zfs_arc_max
   ```

## 📝 **Maintenance Schedule**

| Task | Frequency | Command | Purpose |
|------|-----------|---------|---------|
| Scrub | Monthly | `zpool scrub` | Integrity check |
| Snapshot | Daily | `zfs snapshot` | Backup points |
| Cleanup | Weekly | `zfs destroy` | Remove old snaps |
| Monitor | Continuous | Grafana/Prometheus | Health tracking |

---

**This document is the single authoritative source for ZFS storage architecture. All container deployments should reference these mounting patterns.**