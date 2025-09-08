# Debug SME Agent Knowledge Base

## Agent Profile
- **Role**: Persistent Debug Subject Matter Expert
- **Model**: Opus (complex diagnostics and troubleshooting)
- **Authority**: Full system modification capabilities
- **Workspace**: debug-agent branch

## Core Competencies

### 1. Container Diagnostics
- **Pattern**: Container health status can be misleading
- **Key Learning**: Always verify actual process logs over container status
- **Common Issues**:
  - Thread creation failures (requires --privileged)
  - Permission errors (often cosmetic with s6-overlay)
  - libusb_init errors (usually ignorable)

### 2. GPU Driver Troubleshooting
- **Pattern**: Kernel module struct size mismatches
- **Key Learning**: ABI incompatibility requires reboot after driver changes
- **Common Issues**:
  - "Exec format error" when loading modules
  - DKMS builds succeed but runtime fails
  - Kernel version mismatches

### 3. Service Health Analysis
- **Pattern**: Differentiate cosmetic vs functional failures
- **Key Learning**: Warning messages don't always indicate failure
- **Validation Method**: Test actual functionality, not just logs

## Proven Resolution Patterns

### Plex "Core Component Failed" (2025-08-25)
**Issue**: Service reported failure despite healthy container
**Root Cause**: Insufficient privileges preventing thread creation
**Solution**: Deploy with --privileged and enhanced capabilities
**Validation**: Web interface accessibility test

### NVIDIA Driver Installation (2025-08-25)
**Issue**: Module refuses to load with struct size mismatch
**Root Cause**: Kernel ABI incompatibility (6.14.8-2-pve anomaly)
**Solution**: System reboot required to sync kernel/modules
**Validation**: nvidia-smi functionality test

## Diagnostic Workflows

### Container Issue Workflow
```bash
# 1. Check container status
docker ps -a | grep [container]

# 2. Review logs for actual errors
docker logs [container] 2>&1 | grep -E "ERROR|failed|thread"

# 3. Verify process is running
docker exec [container] ps aux | grep [service]

# 4. Test functionality directly
curl -s -o /dev/null -w '%{http_code}' http://localhost:[port]
```

### GPU Driver Workflow
```bash
# 1. Check module loading
lsmod | grep nvidia
dmesg | grep -i nvidia

# 2. Verify DKMS status
dkms status

# 3. Check kernel compatibility
uname -r
ls /usr/src/linux-headers-*

# 4. Force rebuild if needed
dkms remove [module]/[version] --all
dkms build [module]/[version]
dkms install [module]/[version]
```

## System Architecture Understanding

### Current Infrastructure
- **Services**: 8/8 operational (Docker + LXC hybrid)
- **Storage**: 9.96TB ZFS pools (media, service, staging)
- **GPUs**: RTX 5070 Ti + GTX 970 (IOMMU configured)
- **Network**: 192.168.0.99 (Proxmox host)

### Service Deployment Matrix
| Service | Platform | Status | Notes |
|---------|----------|--------|-------|
| Plex | Docker | ✅ Running | Requires --privileged |
| Grafana | Docker | ✅ Running | Port 3000 |
| FileBrowser | Docker | ✅ Running | Port 8080 |
| Prometheus | Docker | ✅ Running | Port 9090 |
| Node Exporter | Docker | ✅ Running | Port 9100 |
| WireGuard | Docker | ✅ Running | VPN server |
| Firefox | Docker | ✅ Running | Remote browser |
| Deluge | LXC 110 | ✅ Running | Torrent client |

## Automation Scripts

### Health Check Script
**Location**: `/scripts/debug/health-check.sh`
**Purpose**: Comprehensive system health verification
**Features**:
- Docker service status
- LXC container status
- ZFS pool health
- Web interface checks
- Process verification

### Quick Diagnostics
```bash
# Run comprehensive health check
./scripts/debug/health-check.sh

# Check all services at once
for c in $(docker ps -q); do 
  echo "=== $(docker ps -f id=$c --format '{{.Names}}') ==="
  docker logs $c --tail 5 2>&1
done
```

## Knowledge Evolution Log

### 2025-08-25 Session Achievements
1. **Plex Resolution**: Diagnosed and fixed thread creation issue
2. **GPU Driver Analysis**: Identified kernel ABI mismatch pattern
3. **Health Check Automation**: Created comprehensive diagnostic script
4. **Troubleshooting Guide**: Built quick-reference documentation
5. **Pattern Recognition**: Established cosmetic vs functional error classification

## Critical Insights

### Lessons Learned
1. **Container Health Misleading**: Always verify actual process functionality
2. **Kernel Module Issues**: Struct size mismatches require reboot
3. **Permission Warnings**: Often cosmetic with LinuxServer.io containers
4. **Thread Creation**: Critical indicator of privilege issues
5. **GPU Drivers**: DKMS success doesn't guarantee runtime loading

### Best Practices
1. Always check process logs directly
2. Test actual functionality over status indicators
3. Document resolution patterns immediately
4. Create automation for repeated diagnostics
5. Maintain knowledge evolution log

## Admin Review Preparation

### Debug SME Agent Status
- **Operational Status**: ✅ Fully functional
- **Knowledge Base**: Enhanced with 2 major resolutions
- **Automation**: Health check script deployed
- **Documentation**: Troubleshooting guide created
- **Integration**: Ready for Main thread coordination

### Value Delivered
1. Resolved critical Plex service failure
2. Diagnosed GPU driver installation blocker
3. Created reusable diagnostic automation
4. Built institutional knowledge base
5. Established pattern recognition framework

### Next Evolution Steps
1. Integrate with Grafana for automated alerts
2. Expand health check script with GPU checks
3. Create predictive failure detection
4. Build automated resolution workflows
5. Enhance cross-thread coordination

## Handoff Notes for Main Thread

### Current System State
- **Services**: 8/8 operational
- **GPU Drivers**: Installed but require reboot
- **IOMMU**: Configured and ready
- **Storage**: All ZFS pools healthy
- **Network**: All interfaces accessible

### Pending Actions
1. **System Reboot**: Required for GPU driver activation
2. **Writer Thread**: Awaiting reboot approval
3. **AI Services**: Blocked on GPU driver resolution

### Debug SME Recommendations
1. Schedule maintenance window for reboot
2. Verify GPU functionality post-reboot
3. Deploy AI/LLM services once GPUs active
4. Monitor for kernel version anomaly recurrence

---
*Debug SME Agent Knowledge Base v1.1*
*Last Updated: 2025-08-25*
*Status: Ready for Admin Review*