# reader Worktree

## Purpose
Research, status checks, and read-only operations. Use with Sonnet model for efficiency.

## Usage
This is a git worktree for the reader branch.
- Main project: /home/darney/projects/proxmox-homelab
- This worktree: /home/darney/projects/proxmox-homelab-reader

## Syncing Changes
```bash
# Pull changes from main
git pull origin main

# Push changes to branch
git push origin reader

# Merge back to main (from main directory)
cd /home/darney/projects/proxmox-homelab
git merge reader
```
