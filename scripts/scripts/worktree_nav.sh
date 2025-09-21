#!/bin/bash
# Quick navigation between worktrees

case "$1" in
    main)
        cd ~/projects/proxmox-homelab
        ;;
    reader)
        cd ~/projects/proxmox-homelab-reader
        ;;
    writer)
        cd ~/projects/proxmox-homelab-writer
        ;;
    feature)
        if [ -z "$2" ]; then
            echo "Usage: worktree_nav.sh feature <name>"
            exit 1
        fi
        cd ~/projects/proxmox-homelab-features/$2
        ;;
    list)
        git worktree list
        ;;
    *)
        echo "Usage: $0 {main|reader|writer|feature <name>|list}"
        exit 1
        ;;
esac
