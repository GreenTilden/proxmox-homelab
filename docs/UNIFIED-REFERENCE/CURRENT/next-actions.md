# Immediate Next Actions

**Generated**: 2025-08-25 11:24 EDT  
**Based on**: Verified system state and identified service issues

## 🔥 Critical Actions (Immediate)

### 1. Restore Monitoring Stack
```bash
# Restart stopped Grafana container
ssh root@192.168.0.99 "docker start grafana"

# Verify Grafana accessibility
curl -I http://192.168.0.99:3000

# Expected: HTTP 200/302 response (dashboard restored)
```

### 2. Restore Torrent Client
```bash  
# Start stopped Deluge LXC container
ssh root@192.168.0.99 "pct start 110"

# Verify container started
ssh root@192.168.0.99 "pct status 110"

# Test Deluge web interface
curl -I http://192.168.0.111:8112

# Expected: HTTP 200 response (torrent client accessible)
```

### 3. Verify Missing Exporters
```bash
# Check for ZFS exporter process
ssh root@192.168.0.99 "ps aux | grep zfs-exporter"

# Check for Deluge exporter
ssh root@192.168.0.99 "ps aux | grep deluge-exporter"

# Test exporter endpoints
curl -I http://192.168.0.99:9101  # ZFS metrics
curl -I http://192.168.0.99:9102  # Deluge metrics
```

## ⚡ High Priority Actions (Today)

### 4. Install NVIDIA Drivers
```bash
# Check current driver status
ssh root@192.168.0.99 "nvidia-smi"
# Expected: "No devices were found" (known issue)

# Research available drivers for RTX 5070 Ti
ssh root@192.168.0.99 "apt search nvidia-driver"

# Note: RTX 5070 Ti requires NVIDIA 575+ (not yet released)
```

### 5. Document Service Status Corrections
- Update all documentation claiming "8/8 services operational" 
- Change to accurate "6/8 services operational" until Grafana/Deluge restored
- Add service status verification procedures for future use

### 6. Investigate External Network Access
```bash
# Test firewall status
ssh root@192.168.0.99 "ufw status"

# Check Proxmox firewall settings
# Navigate to: Datacenter → Firewall in web UI (https://192.168.0.99:8006)

# Test external access from different host
# curl http://192.168.0.99:8080 (from external machine)
```

## 📋 Medium Priority Actions (This Week)

### 7. Container Health Monitoring
```bash
# Set up automated health checks for all containers
# Create monitoring script to detect stopped containers
# Implement alerting for service failures
```

### 8. Service Documentation Update
- Correct service counts in all documentation files
- Add service status verification procedures  
- Document container restart procedures
- Create service troubleshooting guide

### 9. ZFS Pool Optimization
```bash
# Schedule regular ZFS scrub operations
ssh root@192.168.0.99 "zpool scrub media-pool"

# Set up automated snapshots for critical datasets
# Configure ZFS monitoring and alerting
```

## 🎯 Planning Actions (Next Week)

### 10. GPU Configuration Planning
- Research NVIDIA driver availability for RTX 5070 Ti
- Plan GPU passthrough configuration for both cards
- Design GPU allocation strategy (gaming vs transcoding)

### 11. Service Expansion Planning  
- Plan AI/LLM service deployment (pending GPU drivers)
- Design container orchestration strategy
- Plan storage expansion with LSI HBA card

### 12. Monitoring Enhancement
- Implement comprehensive service health dashboard
- Set up automated alerting for service failures
- Create performance monitoring and capacity planning

## ✅ Verification Commands

### Service Status Check
```bash
# Quick service health verification
ssh root@192.168.0.99 "docker ps --format 'table {{.Names}}\\t{{.Status}}'"
ssh root@192.168.0.99 "pct list"

# Web interface accessibility test
for port in 8080 9090 3001 32400 3000; do
  echo "Testing port $port:"
  curl -I "http://192.168.0.99:$port" 2>/dev/null | head -1
done
```

### System Health Check
```bash
# Storage status
ssh root@192.168.0.99 "zpool status && df -h"

# System resources
ssh root@192.168.0.99 "uptime && free -h"

# GPU detection
ssh root@192.168.0.99 "lspci | grep VGA"
```

## Success Metrics

### Immediate (Within 2 hours)
- [ ] Grafana dashboard accessible at http://192.168.0.99:3000
- [ ] Deluge web interface working at http://192.168.0.111:8112  
- [ ] Service count accurate in documentation (6/8 operational)

### Short-term (Within 1 week)
- [ ] All exporters (ZFS, Deluge) providing metrics
- [ ] External network access restored (if desired)
- [ ] Automated service monitoring implemented

### Medium-term (Within 1 month)
- [ ] GPU drivers installed and functional
- [ ] Service expansion proceeding as planned
- [ ] Comprehensive monitoring and alerting operational

**These actions address the critical discrepancies identified by the Reader Agent verification and provide a clear path to restore full system functionality.**