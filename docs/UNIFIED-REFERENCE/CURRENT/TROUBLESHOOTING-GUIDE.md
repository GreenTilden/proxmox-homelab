# Proxmox Homelab Quick Troubleshooting Guide

## 🚨 Common Issues & Solutions

### Container Shows "Healthy" But Service Fails

**Symptoms:**
- Docker reports container as healthy
- Web interface inaccessible
- "Core component failed" errors

**Diagnosis:**
```bash
# Check actual process logs, not container status
docker logs [container] 2>&1 | grep -E "ERROR|thread|failed"

# Look for thread creation failures
docker logs [container] 2>&1 | grep "thread failed to start"

# Verify main process is running
docker exec [container] ps aux | grep -i [service-name]
```

**Solution:**
Deploy with enhanced privileges:
```bash
docker run -d \
  --name [container] \
  --privileged \
  --cap-add SYS_ADMIN \
  --cap-add SYS_NICE \
  --ulimit memlock=-1:-1 \
  --ulimit nofile=32768:40960 \
  [other-options] \
  [image]
```

### LinuxServer.io Container Permission Issues

**Symptoms:**
- "chown: missing operand" warnings
- s6-overlay permission errors
- PUID/PGID not respected

**Key Insight:** These warnings are often cosmetic if service starts

**Verification:**
```bash
# Check if service process is actually running
docker exec [container] ps aux | grep -i [service]

# Test service functionality directly
curl -s -o /dev/null -w '%{http_code}' http://localhost:[port]
```

**Alternative:** Use LXC containers for persistent permission issues

### Service Not Accessible Despite Running

**Quick Checks:**
```bash
# 1. Verify process is running
docker exec [container] ps aux

# 2. Check network connectivity
docker exec [container] curl -s http://google.com

# 3. Test localhost access
curl http://localhost:[port]

# 4. Check firewall rules
iptables -L -n | grep [port]
```

### ZFS Pool Issues

**Health Check:**
```bash
zpool status
zpool list -o name,health,size,alloc,free
zfs list -o name,used,avail,mountpoint
```

**Common Fixes:**
```bash
# Clear errors
zpool clear [pool-name]

# Scrub pool
zpool scrub [pool-name]
```

## 🔍 Diagnostic Workflow

### Step 1: System Overview
```bash
# Run comprehensive health check
/home/darney/projects/proxmox-homelab-debug-agent/scripts/debug/health-check.sh
```

### Step 2: Container-Specific Diagnosis
```bash
# For any problematic container
CONTAINER="service-name"

# Check status
docker ps -a | grep $CONTAINER

# Recent logs
docker logs $CONTAINER --tail 50

# Process check
docker exec $CONTAINER ps aux

# Resource usage
docker stats $CONTAINER --no-stream
```

### Step 3: Deep Dive
```bash
# Check for thread/permission issues
docker logs $CONTAINER 2>&1 | grep -E "thread|permission|denied|failed"

# Inspect configuration
docker inspect $CONTAINER | jq '.[0].HostConfig'

# Network debugging
docker exec $CONTAINER cat /etc/resolv.conf
```

## 🎯 Key Diagnostic Patterns

### Pattern Recognition

| Symptom | Likely Cause | Quick Fix |
|---------|--------------|-----------|
| "thread failed to start" | Insufficient privileges | Add --privileged flag |
| "libusb_init failed" | USB access denied (usually cosmetic) | Can be ignored for most services |
| "chown: missing operand" | s6-overlay issue (often cosmetic) | Verify service actually works |
| HTTP 302 on health check | Normal redirect | Update expected response code |
| "getaddrinfo() failed" | DNS/thread creation issue | Check privileges and DNS config |

### Critical vs Cosmetic

**Cosmetic Warnings (Can Ignore):**
- libusb_init errors (unless using USB devices)
- chown warnings if service starts
- HTTP 302 redirects on web interfaces

**Critical Errors (Must Fix):**
- "thread failed to start"
- "permission denied" on core files
- "cannot bind to port"
- OOM (Out of Memory) kills

## 🚀 Quick Commands Reference

```bash
# Service Health Overview
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# All Container Logs
for c in $(docker ps -q); do echo "=== $(docker ps -f id=$c --format '{{.Names}}') ==="; docker logs $c --tail 10 2>&1; done

# System Resources
free -h && df -h && docker system df

# Network Test
docker run --rm alpine ping -c 1 google.com

# Quick Restart
docker restart [container] && sleep 5 && docker logs [container] --tail 20
```

## 📊 Monitoring Integration

### Grafana Alerts Setup
1. Navigate to http://192.168.0.99:3000
2. Create alert for thread creation errors
3. Monitor container restart frequency
4. Track resource utilization trends

### Prometheus Queries
```promql
# Container restart rate
rate(container_restart_count[5m]) > 0

# High memory usage
container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9

# Thread creation failures (custom metric needed)
plex_thread_errors_total > 0
```

## 🔧 Automation Scripts

Located in `/home/darney/projects/proxmox-homelab-debug-agent/scripts/debug/`:
- `health-check.sh` - Comprehensive system health check
- More scripts to be added based on patterns

## 📝 Notes

- Always check actual service functionality, not just container status
- Container "healthy" status can be misleading
- When in doubt, check process logs directly
- Document new patterns in Knowledge Evolution Log

---
*Last Updated: 2025-08-25 by Debug SME Agent*
*Based on proven resolution patterns from production issues*