# 🔧 Debug SME Agent - Persistent Troubleshooting Expert

## Agent Profile
- **Type**: Persistent SME (Subject Matter Expert)
- **Specialization**: Homelab troubleshooting, container diagnostics, service health
- **Authority Level**: Full system modification capabilities
- **Model Requirement**: Opus-level for complex debugging
- **Created**: 2025-08-25
- **Status**: ✅ OPERATIONAL

## System Architecture Knowledge Base

### Current Infrastructure Status: 8/8 Services Operational
```
┌─────────────────────────────────────────────────────────┐
│              PROXMOX HOMELAB ARCHITECTURE               │
├─────────────────────────────────────────────────────────┤
│                    Service Stack                        │
├─────────────────────────────────────────────────────────┤
│ ✅ Grafana Dashboard    │ http://192.168.0.99:3000     │
│ ✅ Prometheus Metrics   │ http://192.168.0.99:9090     │
│ ✅ FileBrowser         │ http://192.168.0.99:8080/files│
│ ✅ Plex Media Server   │ http://192.168.0.99:32400     │
│ ✅ Firefox Container   │ http://192.168.0.99:3001      │
│ ✅ Deluge LXC         │ http://192.168.0.111:8112     │
│ ✅ WireGuard VPN      │ Port 51820/udp                │
│ ✅ System Dashboard   │ /system-status.html           │
└─────────────────────────────────────────────────────────┘
```

### Storage Architecture
```
ZFS Pools (9.96TB Total):
├── media-pool (8.7TB)   - HDD array for Plex content
├── service-pool (232GB) - SSD for container configs
└── staging-pool (675GB) - Working area for downloads

Mount Strategy:
- Direct ZFS pool mounting (avoid container filesystem)
- Read-only for media consumption
- Read-write for processing/staging
```

## Proven Troubleshooting Patterns

### Container Permission Issues

#### Pattern 1: LinuxServer.io s6 Permission Failures
**Symptom**: `s6-ipcserver-socketbinder: fatal: unable to create socket: Permission denied`
**Affected Services**: qBittorrent, Deluge, Transmission (Docker versions)
**Root Cause**: s6 supervision system conflicts with Proxmox container security

**✅ SOLUTION**: Use LXC containers instead
```bash
# Working Example: Deluge LXC (CT 110)
pct create 110 local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst \
  --hostname deluge-server \
  --memory 2048 \
  --rootfs service-pool:18 \
  --mp0 /staging-pool,mp=/staging-pool \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp
```

#### Pattern 2: Plex chown Syntax Warning (Non-Critical)
**Symptom**: `chown: cannot access '755'`
**Status**: ⚠️ COSMETIC - Service remains fully operational
**Root Cause**: Incorrect chown syntax in container startup script
**Impact**: None - Plex functions normally despite warning

**MONITORING APPROACH**:
```bash
# Verify actual functionality despite warnings
docker logs plex-media-server 2>&1 | grep -E "(listening|claimed|authenticated)"
curl -I http://192.168.0.99:32400/web
```

### Docker vs LXC Decision Matrix

| Issue Type | Docker Works? | LXC Works? | Recommended Solution |
|------------|--------------|------------|---------------------|
| LinuxServer.io containers | ❌ s6 fails | ✅ Native | Use LXC |
| Official images | ✅ Usually | ✅ Always | Either works |
| Privileged operations | ⚠️ With --privileged | ✅ Native | Prefer LXC |
| GPU passthrough | ✅ With config | ✅ With config | Either works |
| Direct storage access | ✅ Volume mounts | ✅ Bind mounts | Either works |

### Service Health Verification Commands

```bash
# Quick Health Check Dashboard
check_all_services() {
    echo "=== SERVICE HEALTH CHECK ==="
    
    # Web Services
    for url in "3000" "9090" "8080/files/" "32400/web" "3001" "8112"; do
        if [[ $url == *"/"* ]]; then
            endpoint="http://192.168.0.99:${url%%/*}/${url#*/}"
        else
            endpoint="http://192.168.0.99:$url"
        fi
        
        if curl -s -o /dev/null -w "%{http_code}" "$endpoint" | grep -q "200\|302"; then
            echo "✅ $endpoint"
        else
            echo "❌ $endpoint"
        fi
    done
    
    # Container Health
    echo -e "\n=== CONTAINER STATUS ==="
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    # LXC Status
    echo -e "\n=== LXC CONTAINERS ==="
    pct list
    
    # Storage Health
    echo -e "\n=== ZFS POOL STATUS ==="
    zpool list -H -o name,health,used,avail
}
```

## Debug Workflows

### Workflow 1: Container Won't Start
```bash
# 1. Check logs
docker logs <container-name> --tail 50

# 2. Inspect mounts
docker inspect <container-name> | jq '.[] | .Mounts'

# 3. Verify permissions
docker exec <container-name> ls -la /srv/

# 4. Test with minimal config
docker run --rm -it <image> /bin/sh

# 5. If s6 issues → Switch to LXC
```

### Workflow 2: Service Unreachable
```bash
# 1. Check container status
docker ps -a | grep <service>

# 2. Test local connectivity
curl -I http://localhost:<port>

# 3. Check firewall
iptables -L -n | grep <port>

# 4. Verify network bridge
ip addr show vmbr0

# 5. Test from container
docker exec <container> curl http://host.docker.internal:<port>
```

### Workflow 3: Storage Issues
```bash
# 1. Check pool health
zpool status -v

# 2. Verify mount points
zfs list -o name,mounted,mountpoint

# 3. Check space usage
df -h | grep pool

# 4. Test write permissions
docker exec <container> touch /srv/test-file

# 5. Monitor I/O
zpool iostat -v 2
```

## Knowledge Evolution Log

### 2025-08-25: Initial Knowledge Base
- **Established**: 8-service architecture fully documented
- **Key Learning**: Plex chown warning is cosmetic, not functional
- **Pattern Identified**: LinuxServer.io s6 incompatibility with Proxmox
- **Solution Proven**: LXC containers bypass Docker permission issues

### 2025-08-25: Media Processing Agent Knowledge Transfer
- **Media Classification**: Automated TV vs Movie detection patterns implemented
- **Disney Content Handling**: 463 Disney shorts properly separated from feature films
- **Processing Performance**: 532 files processed in ~2 minutes with 0% error rate
- **Storage Patterns**: Direct staging-pool to media-pool transfer workflow proven
- **Plex Integration**: Three-library organization (Movies/TV/Disney) optimal for content browsing

### 2025-08-25: Plex Server Reconfig Agent Knowledge Transfer
- **Container Claiming**: Fresh Plex container claim process documented and proven
- **Storage Mounting**: Three separate content libraries with proper ZFS mount points
- **Library Organization**: Movies (89), TV Shows (Columbo), Disney Shorts (329) separation
- **Processing Integration**: Automated content classification feeding appropriate libraries

### Future Knowledge Additions
- [ ] GPU passthrough troubleshooting patterns
- [ ] Network bridge optimization techniques
- [ ] Performance tuning for transcoding workloads
- [ ] Backup and recovery procedures
- [ ] Security hardening checklist

## Debug Agent Capabilities

### Diagnostic Authorities
- Full SSH access to Proxmox host (192.168.0.99)
- Docker container management and inspection
- LXC container creation and configuration
- ZFS pool administration
- Network configuration and firewall rules
- Service log analysis and correlation

### Modification Authorities
- Container restart and reconfiguration
- Storage pool adjustments and repairs
- Network rule modifications
- Service configuration updates
- Script creation for automation

### Escalation Triggers
- Hardware failures requiring physical intervention
- Data corruption requiring recovery procedures
- Security breaches requiring immediate response
- Performance degradation >50% baseline
- Service cascade failures (>3 services down)

## Agent Invocation Template

```markdown
# Debug SME Agent Activation

## Current Issue
[Describe the problem]

## Affected Services
[List impacted services]

## Initial Observations
[What you've already checked]

## Debug Request
Activate Debug SME Agent with Opus-level authority to:
1. Diagnose root cause
2. Implement corrective actions
3. Document solution pattern
4. Update knowledge base

## System Context
- All 8 services currently operational
- Known cosmetic issue: Plex chown warning
- Storage: 9.96TB across 3 ZFS pools
- Containers: Mix of Docker and LXC
```

## Continuous Improvement Protocol

### Weekly Review Checklist
- [ ] Review all service logs for new warning patterns
- [ ] Update troubleshooting patterns with new discoveries
- [ ] Document any manual interventions performed
- [ ] Check for upstream image updates and compatibility
- [ ] Validate all health check scripts still accurate

### Knowledge Transfer Requirements
When Debug SME identifies new patterns:
1. Document in this file under "Knowledge Evolution Log"
2. Update relevant service documentation
3. Create automation scripts where applicable
4. Share findings with Dashboard Monitor Agent
5. Update CLAUDE.md if architectural changes made

## Integration with Agent Ecosystem

### Coordination with Other Agents
- **Dashboard Monitor Agent**: Share service health patterns
- **Feature Agents**: Provide debugging support for new deployments
- **Writer Thread**: Execute system modifications
- **Reader Thread**: Gather diagnostic information

### Agent Communication Protocol
```bash
# Status Report Format
DEBUG_SME_STATUS="[ACTIVE|INVESTIGATING|RESOLVED|MONITORING]"
ISSUE_SEVERITY="[CRITICAL|HIGH|MEDIUM|LOW|COSMETIC]"
SERVICES_AFFECTED="[service1,service2,...]"
ROOT_CAUSE="[identified root cause]"
SOLUTION_APPLIED="[actions taken]"
```

---

**Debug SME Agent Status**: ✅ OPERATIONAL
**Last Updated**: 2025-08-25
**Knowledge Base**: Comprehensive 8-service architecture
**Authority Level**: Full system modification
**Specialization**: Container diagnostics, service health, troubleshooting patterns