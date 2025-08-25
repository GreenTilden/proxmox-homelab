# 4TB Recovery Drive Installation Plan

## Hardware Installation
1. Shutdown Proxmox safely
2. Install 4TB HDD in available SATA port
3. Document which SATA port used
4. Verify all connections secure

## Post-Boot Tasks
1. Identify new drive (/dev/sdX)
2. Create single ext4 partition
3. Mount at /mnt/recovery
4. Begin ddrescue operations

## Recovery Priority
1. /dev/sdd (223G SSD) - Recent projects/documents
2. /dev/sda (1.8T) - General data
3. /dev/sdb (3.6T) - Media + possible personal data
4. /dev/sdc (698G) - Games/projects

## Drives Available for Reuse
- [Document which drives have no useful data]
