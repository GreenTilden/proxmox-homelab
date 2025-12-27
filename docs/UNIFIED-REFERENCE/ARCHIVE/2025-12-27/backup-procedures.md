# Backup Procedures and Data Protection

**Purpose**: Comprehensive backup strategies and data protection procedures for the Proxmox homelab infrastructure.

## Overview

Multi-tier backup strategy designed to prevent data loss incidents like the ZFS pool corruption that occurred on 2025-08-17. This document establishes automated and manual backup procedures for all critical system components.

## Backup Architecture

### Tier 1: ZFS Snapshots (Local)
**Purpose**: Instant recovery from filesystem-level changes  
**Retention**: 7 daily, 4 weekly, 12 monthly  
**Space Cost**: Minimal (copy-on-write technology)

```bash
# Automated snapshot creation
zfs snapshot media-pool@$(date +%Y%m%d-%H%M%S)
zfs snapshot service-pool@daily-$(date +%Y%m%d)
zfs snapshot staging-pool@hourly-$(date +%H%M)

# List existing snapshots
zfs list -t snapshot

# Rollback to snapshot (emergency recovery)
zfs rollback media-pool@snapshot-name
```

### Tier 2: ZFS Replication (Local Network)
**Purpose**: Pool-level redundancy and off-system backup  
**Method**: ZFS send/receive to secondary storage  
**Frequency**: Daily incremental, weekly full

```bash
# Initial replication setup
zfs send -R media-pool@initial > /backup-pool/media-pool-initial.zfs
zfs receive backup-pool/media-pool < /backup-pool/media-pool-initial.zfs

# Incremental replication
zfs send -i media-pool@previous media-pool@current | zfs receive backup-pool/media-pool

# Remote replication (if backup system available)
zfs send -i @previous @current | ssh backup-host zfs receive backup-pool/media
```

### Tier 3: File-Level Backup (Cloud/External)
**Purpose**: Geographic redundancy and platform-independent recovery  
**Tools**: rclone, rsync, cloud storage integration  
**Frequency**: Weekly for critical data, monthly for media

```bash
# Critical configuration backup
rsync -av /etc/pve/ /backup/proxmox-config/
rsync -av /service-pool/containers/ /backup/container-configs/

# Personal data backup to cloud
rclone sync /media-pool/personal-photos/ gdrive:homelab-backup/photos/
rclone sync /media-pool/recovered-data/ gdrive:homelab-backup/recovery/

# Media library backup (selective)
rclone sync /media-pool/plex/favorites/ gdrive:homelab-backup/media/
```

## Recovery Data Protection (Lessons Learned)

### Current Recovery Data Backup Status
Based on the 2025-08-17 to 2025-08-23 recovery mission, the following data is now protected:

```bash
# Tier 1: ZFS snapshots created
zfs snapshot media-pool/carved-originals@recovery-complete-20250823
zfs snapshot media-pool/recovered-data@recovery-complete-20250823

# Tier 2: Read-only protection
zfs set readonly=on media-pool/carved-originals

# Tier 3: File-level backup recommended
rsync -av /media-pool/personal-photos/ /backup/personal-photos-$(date +%Y%m%d)/
```

### Critical Recovery Data Inventory
- **Personal Photos**: 31 files (43MB) - High sentimental value
- **Forensic Archive**: 1,246 files (122MB) - Historical preservation
- **Organized Recovery**: 929 files (80MB) - Categorized content

## Automated Backup Scheduling

### Systemd Timer Configuration
```ini
# /etc/systemd/system/zfs-snapshot.timer
[Unit]
Description=Daily ZFS Snapshot

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
# /usr/local/bin/zfs-snapshot.sh
#!/bin/bash
# Automated ZFS snapshot script

# Create daily snapshots
zfs snapshot media-pool@daily-$(date +%Y%m%d)
zfs snapshot service-pool@daily-$(date +%Y%m%d)

# Cleanup old snapshots (keep 7 days)
zfs list -t snapshot | grep daily | tail -n +8 | awk '{print $1}' | xargs -n1 zfs destroy

# Log snapshot creation
echo "$(date): Snapshots created successfully" >> /var/log/zfs-backups.log
```

### Cron-based Backup Jobs
```bash
# Add to root crontab
crontab -e

# ZFS snapshots
0 2 * * * /usr/local/bin/zfs-snapshot.sh
0 4 * * 0 /usr/local/bin/zfs-weekly-backup.sh

# Configuration backup
0 3 * * * rsync -av /etc/pve/ /service-pool/backups/proxmox-config-$(date +%Y%m%d)/

# Personal data backup
0 5 * * 0 rclone sync /media-pool/personal-photos/ gdrive:homelab-backup/photos/
```

## Container and VM Backup

### Docker Container Backup
```bash
# Backup container configurations
docker-compose -f /service-pool/docker/compose.yml config > /backup/docker-configs/compose-$(date +%Y%m%d).yml

# Backup container data volumes
docker run --rm -v service-pool:/data -v /backup:/backup alpine tar czf /backup/container-data-$(date +%Y%m%d).tar.gz /data

# Export container images
docker save $(docker images --format "table {{.Repository}}:{{.Tag}}" | tail -n +2) > /backup/docker-images-$(date +%Y%m%d).tar
```

### LXC Container Backup
```bash
# Proxmox LXC backup
vzdump --mode suspend --storage local --compress gzip 110

# Manual LXC backup
pct backup 110 /backup/ct-110-$(date +%Y%m%d).tar.gz --compress gzip
```

### VM Backup (When Deployed)
```bash
# Proxmox VM backup
vzdump --mode snapshot --storage local --compress gzip 100

# Custom VM backup script
qm backup 100 /backup/vm-100-$(date +%Y%m%d).vma.gz
```

## Configuration Backup

### Proxmox System Configuration
```bash
# Complete Proxmox configuration backup
cp -r /etc/pve/ /backup/pve-config-$(date +%Y%m%d)/

# Network configuration
cp -r /etc/network/ /backup/network-config-$(date +%Y%m%d)/

# Storage configuration
pvesm status > /backup/storage-status-$(date +%Y%m%d).txt
zpool status > /backup/zpool-status-$(date +%Y%m%d).txt
```

### Application Configurations
```bash
# Service-specific configurations
rsync -av /service-pool/plex/ /backup/plex-config-$(date +%Y%m%d)/
rsync -av /service-pool/grafana/ /backup/grafana-config-$(date +%Y%m%d)/

# Custom scripts and automation
cp -r /usr/local/bin/ /backup/custom-scripts-$(date +%Y%m%d)/
```

## Disaster Recovery Procedures

### ZFS Pool Recovery Process
```bash
# 1. Assessment - Check pool status
zpool status
zpool import

# 2. Attempt pool import with force
zpool import -f -d /dev/disk/by-id pool-name

# 3. If import fails, use backup replication
zfs receive recovered-pool < /backup/pool-backup.zfs

# 4. Last resort: File carving from images
ddrescue /dev/failed-drive /staging/drive-image.img /staging/ddrescue.log
foremost -i /staging/drive-image.img -o /staging/carved-files/
```

### Complete System Recovery
```bash
# 1. Proxmox reinstallation
# - Boot from Proxmox installer
# - Install to new/replacement drive
# - Configure basic networking

# 2. Restore Proxmox configuration
rsync -av /backup/pve-config-YYYYMMDD/ /etc/pve/

# 3. Import ZFS pools
zpool import media-pool
zpool import service-pool  
zpool import staging-pool

# 4. Restore containers and VMs
pct restore 110 /backup/ct-110-YYYYMMDD.tar.gz
qm restore 100 /backup/vm-100-YYYYMMDD.vma.gz

# 5. Restart services and verify functionality
systemctl restart pveproxy
docker-compose up -d
```

### Personal Data Recovery
```bash
# Recover from cloud backup
rclone copy gdrive:homelab-backup/photos/ /media-pool/personal-photos/

# Restore from local file backup
rsync -av /backup/personal-photos-YYYYMMDD/ /media-pool/personal-photos/

# Verify data integrity
find /media-pool/personal-photos/ -name "*.jpg" -exec jpeginfo -c {} \; | grep -v OK
```

## Backup Monitoring and Alerting

### Backup Status Monitoring
```bash
# Check backup completion status
#!/bin/bash
# /usr/local/bin/backup-health-check.sh

# Verify recent snapshots exist
RECENT_SNAPSHOT=$(zfs list -t snapshot | grep $(date +%Y%m%d) | wc -l)
if [ $RECENT_SNAPSHOT -eq 0 ]; then
    echo "ERROR: No recent ZFS snapshots found"
    exit 1
fi

# Verify backup directory sizes
BACKUP_SIZE=$(du -sh /service-pool/backups/ | cut -f1)
echo "Current backup size: $BACKUP_SIZE"

# Check cloud backup sync status  
CLOUD_STATUS=$(rclone check /media-pool/personal-photos/ gdrive:homelab-backup/photos/ 2>&1)
if [ $? -ne 0 ]; then
    echo "WARNING: Cloud backup sync issues detected"
fi

echo "Backup health check completed successfully"
```

### Alerting Integration
```bash
# Email alerts for backup failures
echo "Backup failure detected on $(hostname) at $(date)" | \
    mail -s "URGENT: Backup Failure Alert" admin@domain.com

# Log to system journal
logger -p daemon.error "ZFS backup failed: $ERROR_MESSAGE"

# Integration with monitoring system
curl -X POST http://192.168.0.99:9090/api/v1/alerts \
    -d "backup_failure{instance=\"homelab\", severity=\"critical\"}"
```

## Backup Testing and Validation

### Regular Testing Schedule
- **Monthly**: Test snapshot rollback procedure
- **Quarterly**: Verify cloud backup restore functionality
- **Annually**: Complete disaster recovery simulation

### Validation Procedures
```bash
# Test snapshot rollback (in safe environment)
zfs clone media-pool@snapshot-name media-pool/test-clone
# Verify data integrity in clone
# Destroy test clone: zfs destroy media-pool/test-clone

# Validate cloud backups
rclone check /media-pool/personal-photos/ gdrive:homelab-backup/photos/

# Test configuration restore
rsync -av /backup/pve-config-test/ /tmp/pve-test/
diff -r /etc/pve/ /tmp/pve-test/
```

## Best Practices and Lessons Learned

### From ZFS Pool Loss (2025-08-17)
1. **Never run `wipefs` on pool members without confirmed backups**
2. **Multiple backup tiers prevent single points of failure**
3. **File-level backups enable partial recovery when pool recovery fails**
4. **Regular testing prevents backup surprises during emergencies**

### Backup Strategy Evolution
1. **Automated Snapshots**: Prevent human error in backup timing
2. **Geographic Distribution**: Cloud backups protect against physical disasters
3. **Documentation**: Clear procedures reduce recovery time under stress
4. **Monitoring**: Early detection of backup failures prevents data loss

This comprehensive backup strategy ensures multiple recovery options and prevents the total data loss that occurred during the original ZFS pool corruption incident.