# Key Commands Reference

### SSH Access
```bash
ssh proxmox  # Alias to root@192.168.0.99
ssh root@192.168.0.99  # Direct connection to Proxmox server
```

### Development Workflow
```bash
# Proxmox operations executed via SSH:
ssh root@192.168.0.99 "command"
ssh root@192.168.0.99 "lspci | grep VGA"
ssh root@192.168.0.99 "lsblk"
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
