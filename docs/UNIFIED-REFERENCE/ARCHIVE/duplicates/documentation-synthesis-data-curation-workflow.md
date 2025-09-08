# Data Curation Workflow Guide

## Overview
Web-based file management system for curating recovered data using FileBrowser and disk usage analysis tools.

## Access Points

### FileBrowser Web Interface
- **URL**: http://192.168.0.99:8080
- **Default Login**: admin/test123
- **Mounted Path**: `/srv` → `/mnt/staging` on Proxmox
- **Features**: Upload, download, delete, move, preview files

### Command Line Tools
```bash
# SSH into Proxmox
ssh root@192.168.0.99

# Midnight Commander (visual file browser)
mc

# NCDU (disk usage analyzer)
ncdu /mnt/staging

# Quick directory sizes
du -sh /mnt/staging/sdb/recovered/*
```

## Curation Workflow

### Step 1: Analyze Disk Usage
```bash
# Generate overview
ncdu /mnt/staging/sdb/recovered/

# Check specific areas
du -sh /mnt/staging/sdb/recovered/sdc3_full.img
ls -lah /mnt/staging/sdb/recovered/
```

### Step 2: Review via Web Interface
1. Open FileBrowser at http://192.168.0.99:8080
2. Navigate to recovered data directories
3. Use preview function to check file contents
4. Identify files/folders to keep vs delete

### Step 3: Bulk Operations
- **Delete**: Select multiple files → Delete button
- **Move**: Drag and drop to organize structure  
- **Download**: Select files → Download (for important files)

### Step 4: Monitor Progress
```bash
# Re-check disk usage after deletions
ncdu /mnt/staging

# Verify specific directory sizes
du -sh /mnt/staging/sdb/recovered/
```

## Best Practices

### Before Major Deletions
1. Run `ncdu /mnt/staging` to understand current usage
2. Identify largest directories first
3. Preview files in web interface before deleting
4. Consider downloading critical files as backup

### Organization Strategy
- Create `keep/` directories for confirmed good data
- Create `review/` for files needing further inspection
- Delete obvious junk (temp files, cache, duplicates)
- Leave uncertain files for final review

### Safety Measures
- Never delete entire directories without review
- Use web interface preview before deletion
- Keep running total of space freed
- Document any important findings

## Container Management

### Start/Stop FileBrowser
```bash
# Check status
docker ps | grep filebrowser

# Stop container
docker stop filebrowser

# Start container  
docker start filebrowser

# View logs
docker logs filebrowser
```

### Persistent Setup (Docker Compose)
Located at: `/home/darney/projects/proxmox-homelab/configs/filebrowser-docker.yml`

```bash
# Deploy with compose
cd /home/darney/projects/proxmox-homelab/configs/
docker-compose -f filebrowser-docker.yml up -d
```