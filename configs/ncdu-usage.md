# NCDU Disk Usage Analysis

## Command Reference

### Basic Analysis
```bash
# Analyze staging directory
ncdu /mnt/staging

# Export to JSON for web visualization
ncdu -o staging-usage.json /mnt/staging

# Quick size check
du -sh /mnt/staging/*
```

### Navigation in NCDU
- **Arrow keys**: Navigate files/directories
- **Enter**: Enter directory
- **Backspace**: Go up one level
- **d**: Delete selected file/directory
- **g**: Show percentage and graph
- **c**: Show item counts
- **q**: Quit

### Web Visualization (Future)
```bash
# Generate JSON export
ncdu -o /tmp/staging-analysis.json /mnt/staging

# Use with ncdu-web-viewer (when deployed):
# Upload JSON to web interface for treemap visualization
```

## Integration with FileBrowser
1. Use NCDU to identify large directories
2. Navigate to those directories in FileBrowser web interface
3. Review and delete files through web UI
4. Re-run NCDU to verify space savings