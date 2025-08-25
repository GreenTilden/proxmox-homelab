# Current Storage Architecture

**Last Verified**: 2025-08-25 11:17 EDT via SSH to 192.168.0.99

## ZFS Pool Configuration

**All pools verified ONLINE with `zpool status`:**

### media-pool (9.0TB Total)
- **Drives**: 3x drives (sde 1.8TB + sdf 3.6TB + sdg 3.6TB)
- **Used**: 540GB (6% utilization)
- **Available**: 8.41TB
- **ZFS Devices**: 
  - `wwn-0x50014ee2c07020c1` (sde)
  - `wwn-0x5000c50045746b22` (sdf)  
  - `wwn-0x5000c500aff04b52` (sdg)

### service-pool (225GB Total) 
- **Drive**: 1x SSD (sda 232GB)
- **Used**: 411MB (1% utilization)  
- **Available**: 224GB
- **ZFS Device**: `sda`
- **Purpose**: Fast SSD storage for containers and services

### staging-pool (675GB Total)
- **Drive**: 1x HDD (sdc 698GB)
- **Used**: 17.8GB (3% utilization)
- **Available**: 657GB  
- **ZFS Device**: `sdc`
- **Purpose**: Working storage and temporary operations

## Storage Content Verification

**Verified via directory listings:**

### media-pool Content
```
/media-pool/recovered-data/     30.4GB  (recovery staging data)
/media-pool/carved-originals/   122MB   (forensic preservation)
/media-pool/media/              155MB   (organized recovery content)
```

#### Recovery Data Breakdown
- **Personal Photos**: 31 high-resolution photos (43MB)
- **Forensic Archive**: 1,246 carved JPEG files (122MB) 
- **Organized Thumbnails**: 929 Plex metadata files (80MB)

### service-pool Content
- **Available for Services**: 224GB fast SSD storage
- **Intended Use**: Container configurations, databases, application data

### staging-pool Content  
- **Working Space**: 657GB available for temporary operations
- **Current Use**: Download staging, processing workflows

## Storage Mount Points

**Verified accessible via filesystem:**

- `/media-pool` → ZFS mount point for media storage
- `/service-pool` → ZFS mount point for service data
- `/staging-pool` → ZFS mount point for temporary work

## Independent Drives (ICY BAY)

### Hot-Swap Testing Drives
- **sdb** (232GB SSD): Independent drive for testing
- **sdd** (223GB SSD): Independent drive for experiments
- **Status**: Not part of ZFS pools, available for testing workflows

## Storage Performance Characteristics

### Pool Optimization
- **media-pool**: Large sequential reads (media streaming optimized)
- **service-pool**: Random I/O performance (SSD-based) 
- **staging-pool**: Balanced capacity/performance for temporary workloads

### ZFS Features Active
- **Compression**: LZ4 enabled on all pools
- **Checksumming**: Data integrity protection enabled
- **Snapshots**: Available for all datasets

## Recovery Mission Status

### ✅ Completed Recovery Operations
- **Timeline**: 2025-08-17 to 2025-08-23
- **Original Loss**: 3.6TB Plex media library unrecoverable
- **Successful Recovery**: 246MB personal content preserved
- **Data Protection**: All recovered data protected with ZFS snapshots

### Recovery Data Preservation
```
/media-pool/carved-originals/      122MB   (original carved files, read-only)
/media-pool/media/personal-photos/ 43MB    (curated personal photos) 
/media-pool/media/final-recovery/  80MB    (organized thumbnails)
```

## Current Storage Utilization Summary

### Available Capacity
- **Total Storage**: 9.9TB across all pools
- **Used Storage**: 558GB (5.6% total utilization)
- **Available**: 9.36TB free space
- **Growth Capacity**: Excellent expansion room available

### Per-Pool Status
- **media-pool**: 93% available (8.41TB free) - Ready for content
- **service-pool**: 99% available (224GB free) - Ready for containers
- **staging-pool**: 97% available (657GB free) - Ready for processing

**The storage architecture is production-ready with excellent capacity for service deployment and content growth.**