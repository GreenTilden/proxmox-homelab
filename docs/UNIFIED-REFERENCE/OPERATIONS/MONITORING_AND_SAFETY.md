# System Monitoring & Safety Protocol

## Power & Thermal Management
- **Monitor Script**: `/usr/local/bin/system-monitor.sh` - comprehensive health check
- **Console Output**: All temp/power data MUST appear in Claude responses during operations
- **Safety Thresholds**: CPU >75°C, load >4.0, or drive failures = immediate abort
- **Pre-Op Check**: Always run health check before major operations
- **Post-Op Check**: Always verify system state after intensive tasks
- **Weekly Reminder**: Review thermal/power trends and system capacity

## Monitoring Integration Strategy
```bash
# Example integration in responses:
echo "=== PRE-OPERATION HEALTH CHECK ==="
/usr/local/bin/system-monitor.sh
echo "=== BEGINNING OPERATION ==="
# ... operation commands ...
echo "=== POST-OPERATION HEALTH CHECK ==="
/usr/local/bin/system-monitor.sh
```

## Data Review & Curation Protocol
- **Staging Access**: Always provide Proxmox web interface instructions for data review
- **File Browser**: Navigate via Proxmox UI to `/mnt/staging/` directories
- **User Review**: Manual deletion/curation of staged data before final migration
- **Web UI Path**: Proxmox Console → Node → Shell → File Manager or `mc` (midnight commander)
- **Alternative Access**: SSH file browser, SFTP, or direct console navigation
- **Workflow**: Stage → Review → Curate → Migrate → Verify

## DevOps Pipeline Integration
- **CI/CD Hooks**: Include health checks in automated workflows
- **Alert Thresholds**: Temperature, load, and storage capacity monitoring
- **Failure Recovery**: Automated rollback on thermal/power issues
- **Capacity Planning**: Track resource usage trends for scaling decisions
