#!/bin/bash
# Check ZFS pool status on Proxmox

echo "=== Checking for ZFS pools ==="
zpool import

echo -e "\n=== Attempting to import rpool read-only ==="
zpool import -o readonly=on rpool 2>&1

echo -e "\n=== Current ZFS pools ==="
zpool list

echo -e "\n=== ZFS filesystems ==="
zfs list

echo -e "\n=== Pool status ==="
zpool status
