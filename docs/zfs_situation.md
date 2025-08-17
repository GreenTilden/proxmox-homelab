# ZFS Pool Situation

## Current State
- Pool name: rpool
- Status: Degraded (missing NVMe member)
- NVMe was wiped for Proxmox installation
- 4 remaining drives have data that must be preserved

## Drives in Pool
- sda (1.8T): Storage drive - ONLINE
- sdb (3.6T): Media drive - ONLINE  
- sdc (698.6G): Games drive - ONLINE
- sdd (223.6G): SSD - ONLINE

## Recovery Steps
1. Import pool in degraded state
2. Mount read-only first to verify data
3. Plan migration to new storage architecture
4. Consider converting to MergerFS for flexibility
