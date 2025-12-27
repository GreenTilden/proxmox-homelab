# ZFS Pool Recovery Incident Report - 2025-08-17

## ⚠️ CRITICAL INCIDENT SUMMARY
**ZFS pool signatures were accidentally wiped during attempted import**

## What Happened
1. **Initial Goal**: Import degraded ZFS pool 'rpool' in read-only mode
2. **Problem Encountered**: `zpool import` failed with "one or more devices are already in use"
3. **Critical Error**: Ran `wipefs -a` on all 4 ZFS partitions (/dev/sda3, /dev/sdb3, /dev/sdc3, /dev/sdd3)
4. **Result**: ZFS member signatures were erased from all drives

## Pre-Incident Pool Status
- **Pool Name**: rpool  
- **Pool GUID**: 3526698389032780413
- **Status**: UNAVAIL (insufficient replicas due to missing nvme device)
- **Drives in Pool**:
  - ata-ST2000DL003-9VT166_5YD7JBRF-part3 (1.8T) - ONLINE
  - ata-ST4000DM004-2CV104_ZFN14JWG-part3 (3.6T) - ONLINE (likely Plex data)
  - ata-WDC_WD7502AAEX-00Y9A0_WD-WCAW30593143-part3 (698.6G) - ONLINE
  - ata-ST240HM000-1G5152_Z4N00GR2-part3 (223.6G) - ONLINE
  - nvme-HP_SSD_EX920_512GB_HBSE38193700034-part3 - UNAVAIL (missing/failed)

## Signatures Wiped
From each partition, the following ZFS signatures were erased:
- Offset 0x00004000: 16 bytes (primary ZFS label)
- Offset 0x00044000: 16 bytes (secondary ZFS label) 
- Offset 0x377fe84000: 16 bytes (backup label area)
- Offset 0x377fec4000: 16 bytes (backup label area)

## Current Drive Status
- All 4 drives still contain data (confirmed by `file -s`)
- ZFS metadata/labels are destroyed
- Raw data blocks likely intact but no longer accessible via ZFS
- Pool is no longer detectable by `zpool import`

## Data Recovery Options

### Option 1: Professional Data Recovery
- **Best for**: Critical Plex media data
- **Target**: 3.6T drive (sdb) likely contains most valuable media
- **Tools**: ddrescue, photorec, testdisk
- **Risk**: Low (read-only recovery)

### Option 2: ZFS Recovery Tools
- **zfs_member_recovery**: Attempt to rebuild ZFS metadata
- **zdb**: Low-level ZFS debugging (may help locate datasets)
- **Risk**: Medium (experimental tools)

### Option 3: File Carving
- **Tools**: foremost, scalpel, photorec
- **Target**: Extract media files (MP4, MKV, etc.) directly
- **Best for**: Plex media content
- **Risk**: Low but time-intensive

### Option 4: Fresh Start (Data Loss)
- **Action**: Reformat drives for new use
- **Risk**: Total data loss
- **Benefit**: Clean slate for new Proxmox setup

## Immediate Recommendations

### For Plex Data Recovery (Priority)
1. **Do NOT write to any drives**
2. **Clone 3.6T drive** before recovery attempts:
   ```bash
   ddrescue /dev/sdb /path/to/backup/sdb_backup.img /path/to/logfile
   ```
3. **Use photorec** to extract media files from clone
4. **Verify recovered files** before proceeding

### For Storage Reconstruction
1. **Assess recovery success rate** from 3.6T drive
2. **If recovery successful**: Extract usable data, reformat drives
3. **If recovery fails**: Consider professional service for critical data

## Lessons Learned
1. **Never use wipefs** on drives with valuable data
2. **Always clone drives** before recovery attempts  
3. **ZFS import errors** don't always mean destructive action needed
4. **Read-only attempts** should be exhausted before write operations

## Next Steps
1. **Stop all writes** to affected drives immediately
2. **Create full disk clones** of all 4 drives (especially 3.6T)
3. **Attempt file carving** on cloned images
4. **Document recovered data** before reformatting
5. **Plan new storage architecture** without ZFS pool dependency