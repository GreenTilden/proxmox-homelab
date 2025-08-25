# Container Architecture Standards & Best Practices

## Overview
This document outlines proven patterns, deployment strategies, and architectural decisions based on real-world implementation experience in Proxmox environments.

## Container Technology Decision Matrix

### ✅ Proxmox LXC Containers (Recommended)
**Use Cases**: Native service deployment, maximum compatibility, storage-heavy applications

**Advantages**:
- Direct Proxmox integration
- No s6 supervision permission conflicts  
- Efficient resource usage
- ZFS pool mounting works reliably
- Better performance for I/O intensive tasks

**Disadvantages**:
- Manual software installation required
- No containerized isolation benefits
- Requires more initial setup

**Best For**: Torrent clients, file servers, databases, media processing

### ⚠️ Docker Containers (Conditional)
**Use Cases**: Lightweight services, proven container images, development environments

**Advantages**:
- Vast container ecosystem
- Standardized deployment
- Version pinning and rollback
- Isolation benefits

**Disadvantages**: 
- LinuxServer.io containers fail in Proxmox (s6 permission issues)
- Complex storage mounting requirements
- Resource overhead

**Best For**: Web services, APIs, monitoring tools, development tools

### ❌ Docker with LinuxServer.io Images (Avoid)
**Issue**: All LinuxServer.io containers fail with `s6-ipcserver-socketbinder: fatal: unable to create socket: Permission denied` in Proxmox environments.

**Affected Images**: qBittorrent, Deluge, Transmission, Plex, etc.

**Root Cause**: s6 supervision system conflicts with Proxmox container security policies.

## Storage Architecture Patterns

### ZFS Pool Integration Standards

#### Critical Pattern: Direct Pool Mounting
```yaml
# CORRECT: Mount actual ZFS pools
volumes:
  - /media-pool:/srv/media-pool
  - /service-pool:/srv/service-pool  
  - /staging-pool:/srv/staging-pool

# INCORRECT: Only mounting /mnt misses actual pools
volumes:
  - /mnt:/srv
```

#### LXC Container Storage Configuration
```bash
# Mount ZFS pools in LXC containers
pct set <VMID> \
  -mp0 /staging-pool,mp=/staging-pool \
  -mp1 /service-pool,mp=/service-pool \  
  -mp2 /media-pool,mp=/media-pool
```

#### Storage Allocation Strategy
- **Container Root FS**: Minimal size (18GB+) for services only
- **Large Downloads**: Direct to ZFS pools (avoid container storage)
- **Processing**: Use staging-pool for temporary operations
- **Final Storage**: Use media-pool for long-term content

### Capacity Planning Guidelines

| Pool | Purpose | Recommended Size | Usage Pattern |
|------|---------|------------------|---------------|
| service-pool | Fast storage, configs, services | 200GB+ SSD | High IOPS, small files |
| staging-pool | Downloads, processing, temp | 500GB+ | High throughput, mixed I/O |
| media-pool | Final media storage | 5TB+ HDD | Sequential reads, large files |

## Service Deployment Patterns

### Pattern 1: LXC Native Deployment (High Reliability)
```bash
# Create LXC container
pct create <VMID> <template> \
  --hostname service-name \
  --memory 2048 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --rootfs local-lvm:8 \
  --unprivileged 1

# Mount storage
pct set <VMID> \
  -mp0 /staging-pool,mp=/staging-pool \
  -mp1 /service-pool,mp=/service-pool

# Install service natively
pct exec <VMID> -- apt update
pct exec <VMID> -- apt install -y service-package
```

**Benefits**: Maximum compatibility, direct hardware access, optimal performance
**Use For**: Torrent clients, file servers, databases

### Pattern 2: Docker with Official Images (Medium Reliability) 
```bash
# Use official/community images (avoid LinuxServer.io)
docker run -d \
  --name service-name \
  -p 8080:8080 \
  -v /service-pool/config:/config \
  -v /staging-pool/data:/data \
  --restart unless-stopped \
  official/image:latest
```

**Benefits**: Easy deployment, version control, rollback capability
**Use For**: Web services, APIs, monitoring tools

### Pattern 3: Hybrid Approach (Maximum Flexibility)
```bash
# LXC for heavy services, Docker for lightweight services
# LXC: qBittorrent, Deluge, Plex
# Docker: Grafana, Prometheus, Web UIs
```

## Mobile-First Interface Standards

### Responsive Design Requirements
1. **Mobile Breakpoint**: 768px and below
2. **Tablet Breakpoint**: 1024px and below  
3. **Touch Targets**: Minimum 44px for clickable elements
4. **Viewport Meta**: `<meta name="viewport" content="width=device-width, initial-scale=1">`

### Grafana Mobile Integration
```css
/* Mobile-first CSS approach */
@media (max-width: 768px) {
  .panel-container { margin: 4px; }
  .torrent-controls { flex-direction: column; }
  .dashboard-grid { grid-template-columns: 1fr; }
}
```

### Cross-Device UX Patterns
- **Progressive Web App**: Install-able interface
- **Unified API Access**: Consistent endpoints across devices
- **Responsive Tables**: Horizontal scroll with fixed headers
- **Touch-Optimized Controls**: Large buttons, swipe gestures

## Security & Performance Standards

### Container Security
```bash
# LXC Security Settings
--unprivileged 1              # Run as unprivileged container
--features nesting=1          # Enable nested containers if needed

# Docker Security Settings  
--security-opt no-new-privileges:true
--user 1000:1000             # Non-root user
--read-only                  # Read-only root filesystem where possible
```

### Network Configuration
```bash
# Static IP assignment for services
pct set <VMID> -net0 name=eth0,bridge=vmbr0,ip=192.168.0.111/24,gw=192.168.0.1

# Port forwarding for Docker containers
-p 127.0.0.1:8080:8080      # Local access only  
-p 0.0.0.0:8080:8080       # Network access
```

### Performance Optimization
- **Memory**: Allocate based on service requirements, not defaults
- **CPU**: Use CPU affinity for performance-critical services
- **Storage**: Match storage type to I/O patterns (SSD vs HDD)
- **Network**: Use bridge networking for performance, NAT for isolation

## Monitoring & Health Checks

### Service Health Monitoring
```bash
# Container health checks
pct status <VMID>           # LXC container status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Service availability checks  
curl -s -o /dev/null -w "%{http_code}" http://service:port
```

### Metrics Collection Standards
```yaml
# Prometheus exporters for each service type
prometheus_exporters:
  - node_exporter          # System metrics
  - cadvisor              # Container metrics  
  - custom_exporter       # Service-specific metrics (Deluge, etc.)
```

### Automated Health Monitoring
```bash
# Cron-based health checks
*/5 * * * * /usr/local/bin/health-check.sh
```

## Troubleshooting Patterns

### Common Issues & Solutions

#### Issue: "Permission denied" in LinuxServer.io containers
**Root Cause**: s6 supervision system conflicts with Proxmox
**Solution**: Use LXC native installation or official Docker images

#### Issue: "No space left on device" in containers
**Root Cause**: Container filesystem full, not host storage
**Solution**: Resize container or use direct pool mounting

#### Issue: Storage mount not visible in container
**Root Cause**: Incorrect mount syntax or permissions
**Solution**: Use proper ZFS pool paths, fix permissions

### Debugging Commands
```bash
# Container diagnostics
pct exec <VMID> -- df -h              # Check disk usage
pct exec <VMID> -- ps aux             # Check processes
pct exec <VMID> -- systemctl status   # Check services

# Docker diagnostics  
docker logs <container>                # Check container logs
docker exec <container> df -h         # Check container storage
docker inspect <container>            # Check configuration
```

## Deployment Automation

### Infrastructure as Code
```bash
# Standardized deployment script template
#!/bin/bash
set -euo pipefail

VMID=$1
SERVICE_NAME=$2
TEMPLATE=$3

# Create container
pct create $VMID $TEMPLATE \
  --hostname $SERVICE_NAME \
  --memory 2048 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --rootfs local-lvm:8 \
  --unprivileged 1

# Configure storage  
pct set $VMID \
  -mp0 /staging-pool,mp=/staging-pool \
  -mp1 /service-pool,mp=/service-pool

# Start and configure
pct start $VMID
sleep 10
pct exec $VMID -- apt update
pct exec $VMID -- apt install -y $SERVICE_NAME
```

### Version Control Integration
```yaml
# Git hooks for configuration management
post-receive:
  - validate_config.sh
  - deploy_changes.sh  
  - health_check.sh
```

## Future-Proofing Strategies

### Scalability Patterns
- **Horizontal Scaling**: Multiple container instances with load balancing
- **Vertical Scaling**: Resource allocation adjustments  
- **Storage Scaling**: ZFS pool expansion strategies
- **Network Scaling**: VLAN segmentation for service isolation

### Technology Evolution
- **Container Runtime**: Prepare for Podman/containerd migration
- **Orchestration**: Consider Kubernetes for complex deployments  
- **Storage**: Plan for NVMe, network storage integration
- **Monitoring**: Evolve to OpenTelemetry standards

### Maintenance Strategies
- **Automated Updates**: Container image and package updates
- **Backup/Restore**: Configuration and data backup procedures
- **Disaster Recovery**: Service restoration procedures  
- **Capacity Planning**: Resource usage trending and forecasting