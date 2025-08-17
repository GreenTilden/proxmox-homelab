# Storage Devices

## Internal Drives
- nvme0n1 (476.9G): Proxmox OS, 347.9G LVM for VMs
- sda (1.8T): Data drive (ZFS pool member) - KEEP DATA
- sdb (3.6T): Media drive (ZFS pool member) - KEEP DATA  
- sdc (698.6G): Games drive (ZFS pool member) - KEEP DATA
- sdd (223.6G): SSD (ZFS pool member) - KEEP DATA

## USB Drives (unconnected)
- Seagate Game Drive PS4 (1.8TB)
- WD easystore 2648 (3.7TB) - CAN WIPE
- WD My Passport (465GB)

## Notes
- All drives part of old ZFS "rpool"
- Need to import and assess pool status
