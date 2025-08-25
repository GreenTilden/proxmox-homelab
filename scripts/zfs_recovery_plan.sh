#!/bin/bash
# ZFS Pool Recovery Plan

echo "=== ZFS Pool Recovery Analysis ==="
echo "Pool 'rpool' is degraded - missing NVMe drive (now has Proxmox)"
echo "Other 4 drives are intact and contain data to preserve"
echo ""
echo "=== Option 1: Import degraded pool (RECOMMENDED) ==="
echo "zpool import -f -o readonly=on -d /dev/disk/by-id rpool"
echo ""
echo "=== Option 2: Import read-write (after backup) ==="
echo "zpool import -f -d /dev/disk/by-id rpool"
echo "zpool clear rpool"
echo ""
echo "=== After import, check data with: ==="
echo "zfs list -r rpool"
echo "zfs get all rpool | grep mount"
