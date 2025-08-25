#!/bin/bash

set -euo pipefail

SCRIPT_NAME="$(basename "$0")"
LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')] $SCRIPT_NAME:"

log() {
    echo "$LOG_PREFIX $1" >&2
}

error() {
    echo "$LOG_PREFIX ERROR: $1" >&2
    exit 1
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root"
    fi
}

stop_containers() {
    log "Stopping all running containers..."
    
    local running_containers
    running_containers=$(pct list | awk 'NR>1 && $2=="running" {print $1}')
    
    if [[ -z "$running_containers" ]]; then
        log "No running containers found"
        return 0
    fi
    
    for vmid in $running_containers; do
        log "Stopping container $vmid..."
        if ! pct stop "$vmid" --timeout 60; then
            log "WARNING: Failed to stop container $vmid gracefully, forcing shutdown..."
            pct stop "$vmid" --force || log "WARNING: Failed to force stop container $vmid"
        else
            log "Container $vmid stopped successfully"
        fi
    done
    
    log "Waiting for containers to fully stop..."
    sleep 5
    
    local still_running
    still_running=$(pct list | awk 'NR>1 && $2=="running" {print $1}')
    if [[ -n "$still_running" ]]; then
        log "WARNING: Some containers are still running: $still_running"
    else
        log "All containers stopped successfully"
    fi
}

stop_vms() {
    log "Stopping all running VMs..."
    
    local running_vms
    running_vms=$(qm list | awk 'NR>1 && $3=="running" {print $1}')
    
    if [[ -z "$running_vms" ]]; then
        log "No running VMs found"
        return 0
    fi
    
    for vmid in $running_vms; do
        log "Stopping VM $vmid..."
        if ! qm shutdown "$vmid" --timeout 120; then
            log "WARNING: Failed to shutdown VM $vmid gracefully, forcing stop..."
            qm stop "$vmid" || log "WARNING: Failed to force stop VM $vmid"
        else
            log "VM $vmid stopped successfully"
        fi
    done
    
    log "Waiting for VMs to fully stop..."
    sleep 10
    
    local still_running
    still_running=$(qm list | awk 'NR>1 && $3=="running" {print $1}')
    if [[ -n "$still_running" ]]; then
        log "WARNING: Some VMs are still running: $still_running"
    else
        log "All VMs stopped successfully"
    fi
}

sync_filesystems() {
    log "Syncing all filesystems..."
    
    log "Running sync command..."
    sync
    
    log "Flushing filesystem buffers..."
    echo 3 > /proc/sys/vm/drop_caches
    
    log "Syncing again to ensure all data is written..."
    sync
    
    log "Filesystem sync completed"
}

safe_poweroff() {
    log "Initiating safe system shutdown..."
    
    log "Final filesystem sync before shutdown..."
    sync
    
    log "System will power off in 5 seconds..."
    sleep 5
    
    log "Powering off system now"
    systemctl poweroff
}

main() {
    log "Starting safe Proxmox shutdown sequence"
    
    check_root
    
    log "Step 1: Stopping all containers"
    stop_containers
    
    log "Step 2: Stopping all VMs"
    stop_vms
    
    log "Step 3: Syncing filesystems"
    sync_filesystems
    
    log "Step 4: Safe power down"
    safe_poweroff
}

trap 'error "Script interrupted"' INT TERM

main "$@"