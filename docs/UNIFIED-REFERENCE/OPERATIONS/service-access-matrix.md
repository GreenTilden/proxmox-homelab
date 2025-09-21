# 📊 Service Access Matrix

**Updated**: 2025-09-11  
**Total Services**: 15/16 Operational  
**Primary Interface**: Homer Dashboard (http://192.168.0.99:8090)

## 🎯 Complete Service Inventory

### 🎮 Primary Interface
| Service | URL | Auth | Mobile | Status | Purpose |
|---------|-----|------|--------|--------|---------|
| **Homer Dashboard** | http://192.168.0.99:8090 | None | ✅ Optimized | ✅ Operational | Primary service portal with 16-bit gaming theme |

### 🏰 Command Center Category
| Service | URL | Authentication | Mobile Access | Status | Notes |
|---------|-----|---------------|---------------|--------|--------|
| **Grafana** | http://192.168.0.99:3000 | admin/test123 | ✅ Responsive | ✅ Operational | 16-bit themed monitoring dashboards |
| **Portainer** | http://192.168.0.99:9000 | Web Setup Required | ✅ Touch-friendly | ✅ Operational | Docker container management interface |

### ⚔️ Media Kingdom Category
| Service | URL | Authentication | Mobile Access | Status | Notes |
|---------|-----|---------------|---------------|--------|--------|
| **Plex Media Server** | http://192.168.0.99:32400 | Google OAuth | ✅ Native Apps | ⚠️ Service Issue | Container running, service inactive |
| **Firefox Container** | http://192.168.0.99:3001 | None | ⚠️ Desktop VNC | ✅ Operational | VNC-based browser for media acquisition |
| **Deluge Torrent** | http://192.168.0.111:8112 | Password: "deluge" | ✅ Mobile Web | ✅ Operational | LXC container, direct downloads to staging-pool |

### 🛡️ System Defense Category  
| Service | URL | Authentication | Mobile Access | Status | Notes |
|---------|-----|---------------|---------------|--------|--------|
| **FileBrowser** | http://192.168.0.99:8080 | None Configured | ✅ Touch-friendly | ✅ Operational | Direct ZFS pool access and management |
| **Prometheus** | http://192.168.0.99:9090 | None | ✅ Responsive | ✅ Operational | Metrics collection and time-series database |
| **cAdvisor** | http://192.168.0.99:8082 | None | ✅ Mobile Compatible | ✅ Operational | Container performance monitoring |
| **Node Exporter** | http://192.168.0.99:9100 | None | ⚠️ Metrics Only | ✅ Operational | System metrics API endpoint |

### 🤖 AI Companions Category
| Service | URL | Authentication | Mobile Access | Status | Purpose |
|---------|-----|---------------|---------------|--------|---------|

## 📱 Mobile Access Patterns

### ✅ Fully Mobile Optimized
- **Homer Dashboard**: Touch-optimized 16-bit interface with responsive design
- **FileBrowser**: Mobile-friendly file management with touch gestures
- **ChatBot UI**: Responsive AI interface optimized for mobile devices
- **Grafana**: Mobile-responsive dashboards with touch navigation

### ⚠️ Mobile Compatible (Limited)
- **Portainer**: Functional but best on tablet-sized screens
- **Prometheus**: Responsive but complex interface better suited for desktop
- **cAdvisor**: Mobile compatible but data-dense interface
- **Deluge**: Mobile web interface functional but small touch targets

### ❌ Desktop Only
- **Firefox Container**: VNC interface requires mouse and keyboard
- **Node Exporter**: Metrics API, no user interface

## 🔐 Authentication Requirements

### No Authentication Required
```
✅ Homer Dashboard      - Direct access
✅ FileBrowser          - Open access to ZFS pools  
✅ Firefox Container    - VNC access
✅ ChatBot UI          - Direct AI interface access
✅ Prometheus          - Metrics dashboard
✅ cAdvisor            - Container monitoring  
✅ Node Exporter       - Metrics API
```

### Password Authentication
```
🔑 Grafana             - admin/test123
🔑 Deluge              - Password: "deluge"
```

### Advanced Authentication
```
🛡️ Plex Media Server   - Google OAuth integration
🛡️ Portainer          - Web-based user setup required
🛡️ PostgreSQL         - Database user authentication
```

## 🌐 Network Configuration

### External Access Status
```
⚠️ All services currently localhost-only (192.168.0.99)
⚠️ External firewall may block remote access
⚠️ VPN or port forwarding required for external use
```

### Internal Network Access
```
✅ All services accessible from local network (192.168.0.x)
✅ Cross-service communication functional
✅ Container networking properly configured
```

## 📊 Service Health Monitoring

### Automated Health Checks
Homer Dashboard includes automated service monitoring:
```bash
Script: /usr/local/bin/homer-service-health.sh
Frequency: Every 2 minutes
Storage: /service-pool/homer/config/service-health.prom
Integration: Prometheus metrics collection
```

### Health Status Codes
```
✅ 200 - Service operational and responding
✅ 302 - Service redirect (normal for some services)  
✅ 401 - Authentication required (service working)
⚠️ 403 - Forbidden access (check configuration)
❌ 500 - Server error (service issue)
❌ Timeout - Service unreachable (container down)
```

## 🔧 Troubleshooting Quick Reference

### Service Not Accessible
1. **Check container status**: `ssh root@192.168.0.99 "docker ps | grep service-name"`
2. **Verify port binding**: `ssh root@192.168.0.99 "ss -tlnp | grep :PORT"`
3. **Test local connectivity**: `ssh root@192.168.0.99 "curl -I http://localhost:PORT"`
4. **Review container logs**: `ssh root@192.168.0.99 "docker logs service-name"`

### Authentication Issues
1. **Reset Grafana admin password** if needed
2. **Check Plex claim token** for Google OAuth
3. **Verify Portainer initial setup** completion
4. **Test Deluge password**: "deluge" (case-sensitive)

### Mobile Access Problems
1. **Clear mobile browser cache** for updated interfaces
2. **Test in incognito/private mode** to bypass cached resources  
3. **Verify network connectivity** to 192.168.0.99
4. **Try desktop interface** if mobile version has issues

### Container Issues
1. **Restart individual containers**: `docker restart container-name`
2. **Check resource utilization**: Use cAdvisor or Portainer
3. **Verify ZFS pool mounts** for storage-dependent services
4. **Review system logs**: `journalctl -fu docker`

## 📈 Performance Metrics

### Current System Load
```
Total Containers: 15 Docker + 1 LXC
System Resources: Monitored via Node Exporter + cAdvisor
Load Balancing: Direct service access, no proxy
Response Times: Sub-second for most services
```

### Resource Usage Patterns
```
High Memory: AI models, Plex during transcoding  
High I/O: FileBrowser, Deluge downloads
High Network: AI model communication, media streaming
```

## 🚀 Service Integration Points

### Homer Dashboard Integration
- **Service Discovery**: Automatic health monitoring
- **Theme Consistency**: 16-bit gaming aesthetic across interfaces
- **Mobile Optimization**: Responsive design patterns

### Monitoring Stack Integration
- **Prometheus**: Collects metrics from all exporters
- **Grafana**: Visualizes metrics with gaming theme
- **cAdvisor**: Container-specific performance data
- **Node Exporter**: System-wide metrics collection

- **ChatBot UI**: Primary user interface for AI interaction
- **Model Coordination**: API-based communication between AI services
- **Database Integration**: PostgreSQL for persistent AI data
- **GPU Acceleration**: Shared RTX 5070 Ti utilization

---

**This service access matrix provides comprehensive documentation for all 15 operational services, including authentication, mobile access patterns, troubleshooting procedures, and integration points.**