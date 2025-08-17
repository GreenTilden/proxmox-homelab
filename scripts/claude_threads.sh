#!/bin/bash
# Claude Code Thread Management

case "$1" in
  reader)
    echo "Starting Reader Thread (efficient context gathering)..."
    echo "Use for: status checks, log reading, documentation lookups"
    cd ~/projects/proxmox-homelab
    claude-code --model claude-3-haiku-20240307
    ;;
    
  writer)
    echo "Starting Writer Thread (complex implementation)..."
    echo "Use for: coding, deployments, architecture decisions"
    cd ~/projects/proxmox-homelab
    claude-code --model claude-3-opus-20240229
    ;;
    
  status)
    echo "=== Checking Proxmox Status ==="
    ssh proxmox "pvesh get /nodes/lcib/status"
    echo -e "\n=== Container Status ==="
    ssh proxmox "pct list"
    echo -e "\n=== Storage Status ==="
    ssh proxmox "pvesm status"
    ;;
    
  *)
    echo "Usage: $0 {reader|writer|status}"
    echo "  reader - Start context gathering thread"
    echo "  writer - Start implementation thread"
    echo "  status - Quick system status check"
    exit 1
    ;;
esac