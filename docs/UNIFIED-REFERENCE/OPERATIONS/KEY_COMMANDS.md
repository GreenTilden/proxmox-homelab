# Key Commands Reference

### SSH Access
```bash
ssh proxmox  # Alias to root@192.168.0.99
ssh root@192.168.0.99  # Direct connection to Proxmox server
```

### Development Workflow
```bash
# All Claude sessions run from dev laptop (dinux)
# Proxmox operations executed via SSH:
ssh root@192.168.0.99 "command"
ssh root@192.168.0.99 "lspci | grep VGA"
ssh root@192.168.0.99 "lsblk"
```

### ZFS Pool Management
```bash
# ⚠️ CRITICAL: Pool signatures wiped 2025-08-17
# DO NOT attempt import until data recovery plan executed
# Current status: zpool import shows "no pools available"

# Data recovery commands (use with extreme caution):
ddrescue /dev/sdb /path/to/backup/sdb_backup.img /path/to/logfile  # Clone 3.6TB media drive
photorec /path/to/backup/sdb_backup.img  # Extract media files
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
