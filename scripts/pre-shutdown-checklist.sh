#!/bin/bash
# Pre-shutdown system state capture script
# Captures critical system information before maintenance/shutdown

set -euo pipefail

# Create output filename with timestamp
OUTPUT_FILE="docs/pre-shutdown-state-$(date +%Y%m%d-%H%M%S).txt"

# Ensure docs directory exists
mkdir -p docs

echo "Capturing pre-shutdown system state..."
echo "Output will be saved to: $OUTPUT_FILE"

# Create the state capture file
cat > "$OUTPUT_FILE" << EOF
# Pre-Shutdown System State Capture
# Generated on: $(date)
# Hostname: $(hostname)
# IP Address: $(hostname -I | awk '{print $1}')

================================================================================
DRIVE CONFIGURATION
================================================================================

## Block Device Information (lsblk)
$(lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINT,UUID)

## Partition Information (fdisk -l)
$(fdisk -l 2>/dev/null || echo "Error running fdisk -l")

## ZFS Pool Status
$(zpool status 2>/dev/null || echo "No ZFS pools found or ZFS not available")

## ZFS Filesystem List
$(zfs list 2>/dev/null || echo "No ZFS filesystems found or ZFS not available")

================================================================================
RUNNING VMs AND CONTAINERS
================================================================================

## Proxmox Containers (pct list)
$(pct list 2>/dev/null || echo "Error running pct list - may not be on Proxmox host")

## Proxmox VMs (qm list)
$(qm list 2>/dev/null || echo "Error running qm list - may not be on Proxmox host")

## Docker Containers (if Docker is running)
$(docker ps -a 2>/dev/null || echo "Docker not available or not running")

================================================================================
MOUNT POINTS
================================================================================

## Current Mount Points
$(mount | column -t)

## Filesystem Usage
$(df -h)

## Mounted Filesystems by Type
$(findmnt -D)

================================================================================
HARDWARE INFORMATION
================================================================================

## Available SATA Ports/Controllers
$(lspci | grep -i sata || echo "No SATA controllers found via lspci")

## SCSI/SATA Device Information
$(lsscsi 2>/dev/null || echo "lsscsi not available")

## Hardware Block Devices
$(lshw -class disk 2>/dev/null | grep -E "(product|serial|size|logicalname)" || echo "lshw not available or insufficient permissions")

## PCI Devices (for expansion slots)
$(lspci | grep -E "(SATA|IDE|SCSI|Storage|RAID)")

================================================================================
NETWORK CONFIGURATION
================================================================================

## Network Interfaces
$(ip addr show)

## Network Bridges (Proxmox)
$(brctl show 2>/dev/null || echo "brctl not available")

================================================================================
SYSTEM RESOURCES
================================================================================

## Memory Usage
$(free -h)

## CPU Information
$(lscpu | head -20)

## System Load
$(uptime)

## Process Summary
$(ps aux --sort=-%cpu | head -10)

================================================================================
STORAGE DETAILS
================================================================================

## Physical Volume Information (LVM)
$(pvs 2>/dev/null || echo "No LVM physical volumes found")

## Volume Group Information (LVM)
$(vgs 2>/dev/null || echo "No LVM volume groups found")

## Logical Volume Information (LVM)
$(lvs 2>/dev/null || echo "No LVM logical volumes found")

## Proxmox Storage Configuration
$(pvesm status 2>/dev/null || echo "Proxmox storage manager not available")

================================================================================
END OF CAPTURE
================================================================================
Generated on: $(date)
EOF

echo "System state captured successfully!"
echo "File saved to: $OUTPUT_FILE"
echo ""
echo "Summary:"
echo "- Drive configuration and partitions captured"
echo "- VM/Container status recorded"
echo "- Mount points and filesystem usage documented"
echo "- Hardware information including SATA ports captured"
echo "- Network and system resource information included"