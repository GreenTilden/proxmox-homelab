# Service Access Information

## Current Service Status

### Working Services
- **Plex Media Server**: http://192.168.0.99:32400 ✅
- **File Browser**: http://192.168.0.99:8080 ✅
- **Prometheus**: http://192.168.0.99:9090 ✅
- **Deluge LXC**: http://192.168.0.111:8112 ✅

### Needs Configuration
- **Grafana Dashboard**: http://192.168.0.99:3000 ✅
  - **Credentials**: admin/test123
  - **Status**: Fully operational with 16-bit themed dashboards

- **qBittorrent**: http://192.168.0.111:8112 ⚠️
  - **Credentials**: admin/adminadmin
  - **Container Status**: LXC CT 110 running
  - **Service Status**: Web interface not accessible (port 8112 not responding)
  - **Fixed**: Updated service name from "Deluge Web UI" to "qBittorrent"
  - **Action Required**: Check qBittorrent service inside container

### Planned Services
- **System Control Links**: Not implemented yet ⏳
  - Earmarked for future development
  - Will provide container management functionality

## Quick Fixes Applied
✅ Removed old "LCiBot Homelab" header → "🤖 System Monitor"
✅ Fixed container overflow and grid expansion issues
✅ Standardized CSS architecture with design system

## Next Actions
1. Get Grafana login credentials from project documentation
2. Confirm qBittorrent container URL for service link update
3. Continue system metrics panel improvements