# writer Worktree

## Purpose
Implementation, coding, and system changes. Use with Opus model for complex tasks.

## Usage
This is a git worktree for the writer branch.
- Main project: /home/darney/projects/proxmox-homelab
- This worktree: /home/darney/projects/proxmox-homelab-writer

## Syncing Changes
```bash
# Pull changes from main
git pull origin main

# Push changes to branch
git push origin writer

# Merge back to main (from main directory)
cd /home/darney/projects/proxmox-homelab
git merge writer
```
