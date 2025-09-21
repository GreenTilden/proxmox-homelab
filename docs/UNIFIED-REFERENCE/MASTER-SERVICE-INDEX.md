# Master Service Index & User Guide

## 🎯 LCiBot Homelab Service Directory

**Last Updated**: 2025-09-12  
**Total Services**: 16/17 operational  
**Primary Interface**: LCiBot Dashboard at http://192.168.0.99:8091  
**Monitoring Stack**: Grafana, Prometheus, Node Exporter, cAdvisor

## 🎮 Primary Dashboard Interfaces

### 🎯 LCiBot Dashboard - Modern Vue.js Interface
| **Service** | **LCiBot Dashboard** |
|-------------|----------------------|
| **URL** | http://192.168.0.99:8091 |
| **Status** | ✅ **OPERATIONAL** |
| **Purpose** | Modern Vue.js dashboard with real-time monitoring and Mario-inspired themes |
| **Features** | • 5 theme options with real-time switching<br>• Service health monitoring for 16+ services<br>• Mobile-responsive with touch optimization<br>• 87% bundle size reduction (84KB total) |
| **Authentication** | None required |
| **Mobile Support** | ✅ Optimized with 44px touch targets |

### 🎮 Homer Dashboard - Static Service Directory  
| **Service** | **Homer Dashboard** |
|-------------|---------------------|
| **URL** | http://192.168.0.99:8090 |
| **Status** | ✅ **OPERATIONAL** |
| **Purpose** | Static service directory with 16-bit gaming theme |
| **Features** | • Comprehensive service catalog<br>• Gaming-themed interface<br>• Quick access to all services<br>• Categorized service organization |
| **Authentication** | None required |
| **Use Case** | Service discovery and quick navigation |

## 📊 Monitoring & Analytics Stack

### Core Monitoring Services
| Service | URL | Port | Purpose | Status |
|---------|-----|------|---------|--------|
| **Grafana** | http://192.168.0.99:3000 | 3000 | Monitoring dashboards with 16-bit gaming theme | ✅ |
| **Prometheus** | http://192.168.0.99:9090 | 9090 | Metrics collection and time-series database | ✅ |
| **Node Exporter** | http://192.168.0.99:9100 | 9100 | System metrics (CPU, memory, storage, network) | ✅ |
| **cAdvisor** | http://192.168.0.99:8082 | 8082 | Container resource monitoring | ✅ |

**Authentication Details**:
- **Grafana**: admin/test123
- **Others**: No authentication required

## 🛠️ Web Management Services

| Service | URL | Port | Purpose | Auth Required | Mobile |
|---------|-----|------|---------|---------------|--------|
| **FileBrowser** | http://192.168.0.99:8080 | 8080 | ZFS pool file management | ❌ None | ✅ |
| **Portainer** | http://192.168.0.99:9000 | 9000 | Docker container management | ✅ Login | ✅ |
| **Firefox** | http://192.168.0.99:3001 | 3001 | VNC web browser for secure browsing | ❌ None | ⚠️ Desktop |


### AI Model Services
| Service | URL | Port | Model | Purpose | Status |
|---------|-----|------|-------|---------|--------|

### Supporting Infrastructure
| Service | URL | Port | Purpose | Status |
|---------|-----|------|---------|--------|
| **PostgreSQL Database** | http://192.168.0.99:5433 | 5433 | AI laboratory database | ✅ |

**Integration Notes**:
- GPU utilization: 77% during AI processing (RTX 5070 Ti)
- Response times: 6-12 seconds for deepseek-coder:33b requests
- Memory allocation: 13.6GB for primary models

## 🎬 Media Services

| Service | URL | Port | Type | Purpose | Status |
|---------|-----|------|------|---------|--------|
| **Plex Media Server** | http://192.168.0.99:32400 | 32400 | Docker | Media streaming with Google auth | ⚠️ Service inactive |
| **Deluge** | http://192.168.0.111:8112 | 8112 | LXC | Torrent client for media acquisition | ✅ |

**Storage Integration**:
- **Media Pool**: 8.7TB capacity on /media-pool (ZFS)
- **Staging Pool**: 675GB capacity on /staging-pool (ZFS) 
- **Service Pool**: 232GB capacity on /service-pool (ZFS SSD)

**Authentication**:
- **Plex**: Google authentication configured
- **Deluge**: Password "deluge"

## 📱 Mobile Access Guide

### Optimized Mobile Services
| Service | Mobile Rating | Notes |
|---------|---------------|-------|
| **LCiBot Dashboard** | ✅ **Excellent** | Touch-optimized with 44px targets, 5 themes, responsive design |
| **Homer Dashboard** | ✅ **Good** | Responsive layout with touch-friendly navigation |
| **Grafana** | ✅ **Good** | Mobile-responsive monitoring dashboards |
| **FileBrowser** | ✅ **Good** | Touch-friendly file management interface |
| **Portainer** | ✅ **Good** | Docker management optimized for mobile |
| **ChatBot UI** | ✅ **Good** | AI interface works well on mobile |
| **Firefox Container** | ⚠️ **Desktop Only** | VNC interface not mobile-optimized |

### Mobile-Specific Features
- **LCiBot Dashboard**: 
  - Touch gestures for chart interaction
  - Battery-aware refresh intervals
  - Progressive Web App ready
  - Offline capability for cached data
- **Theme Consistency**: All mobile interfaces use consistent theming
- **Performance**: All mobile services maintain 60fps scrolling

## 🔐 Security & Access Control

### Authentication Summary
| Service Category | Authentication Method | Details |
|------------------|----------------------|---------|
| **Public Services** | None required | LCiBot, Homer, FileBrowser, Firefox, ChatBot UI |
| **Monitoring Stack** | Grafana only | admin/test123 for dashboards |
| **Management Tools** | Login required | Portainer requires account creation |
| **Media Services** | Mixed | Plex (Google auth), Deluge (password: "deluge") |

### Network Security
- **Internal Network Only**: All services accessible only on 192.168.0.x network
- **Firewall Status**: Services responding to internal requests only
- **External Access**: Limited - requires VPN or direct network access
- **SSL/TLS**: Not implemented - internal network assumed secure

## 🚀 Performance Benchmarks

### Service Response Times
| Service | Response Time | Load Time | Bundle Size | Status |
|---------|---------------|-----------|-------------|--------|
| **LCiBot Dashboard** | <100ms | <1.5s | 84KB | ✅ Excellent |
| **Homer Dashboard** | <200ms | <2.0s | ~500KB | ✅ Good |
| **Grafana** | <300ms | <3.0s | ~2MB | ✅ Standard |
| **FileBrowser** | <150ms | <1.0s | ~300KB | ✅ Excellent |
| **Portainer** | <500ms | <4.0s | ~3MB | ✅ Standard |

### Infrastructure Performance
- **System Load**: CPU <20%, Memory 60% of 32GB, Storage 85% of pools
- **Container Resource**: 15 Docker containers, 109 tasks, 138MB memory usage
- **Network Performance**: Gigabit internal, responsive on all endpoints
- **GPU Utilization**: RTX 5070 Ti at 77% during AI processing

## 📋 Service Categories & Use Cases

### 🎯 Daily Operations
**Primary Services for Regular Use**:
1. **LCiBot Dashboard** - Real-time system monitoring and service status
2. **Homer Dashboard** - Quick service navigation and discovery
3. **Grafana** - Detailed system metrics and performance monitoring
4. **FileBrowser** - File management across ZFS storage pools

### 🔧 System Administration  
**Management and Configuration**:
1. **Portainer** - Docker container lifecycle management
2. **Prometheus** - Metrics collection configuration and queries
3. **Node Exporter/cAdvisor** - System and container metrics endpoints

### 🤖 AI & Automation
**Laboratory and AI Services**:
2. **ChatBot UI** - AI interaction interface for laboratory workflows
3. **PostgreSQL** - AI data persistence and laboratory records

### 🎬 Media & Entertainment
**Content Management**:
1. **Plex Media Server** - Media streaming (currently inactive)
2. **Deluge** - Content acquisition and torrent management
3. **Firefox Container** - Secure web browsing for content discovery

## 🔄 Service Health Monitoring

### Automated Health Checks
**LCiBot Dashboard Monitoring**:
- **Real-time Status**: All 16+ services checked every 30 seconds
- **Response Time Tracking**: API latency monitoring for all endpoints
- **Error Detection**: Automatic detection of service failures
- **Mobile Alerts**: Visual status indicators optimized for mobile devices

**Grafana Dashboard Monitoring**:
- **System Metrics**: CPU, memory, storage, network trending
- **Container Metrics**: Resource usage and health for all containers
- **Service Uptime**: Historical availability tracking
- **Custom Alerts**: Configurable thresholds for critical metrics

### Manual Health Verification
```bash
# Quick health check commands:
curl http://192.168.0.99:8091    # LCiBot Dashboard
curl http://192.168.0.99:8090    # Homer Dashboard
curl http://192.168.0.99:3000    # Grafana
curl http://192.168.0.99:8080    # FileBrowser
curl http://192.168.0.99:9000    # Portainer
```

## 🎨 Theme System Guide

### LCiBot Dashboard Themes
**5 Available Themes with Real-time Switching**:
1. **💜 Purple Magic** (Default) - Professional purple/magenta gradients
2. **🤖 Classic Mario** - Dark red/brown retro gaming aesthetic  
3. **🎨 Mario Paint** - Light pink creative workspace theme
4. **🇮🇹 Italy** - Green/red Italian flag colors
5. **🟢 Game Boy** - Green monochrome terminal aesthetic

**Theme Features**:
- **Real-time Switching**: Instant theme changes without page reload
- **Persistent Preferences**: Theme selection saved in localStorage
- **Mobile Compatibility**: All themes optimized for touch devices
- **Service Integration**: Consistent theming across monitoring widgets
- **High Contrast**: All themes meet WCAG accessibility guidelines

### Cross-Service Theme Consistency
- **Grafana**: Custom 16-bit gaming theme matching dashboard aesthetics
- **Homer**: Gaming-themed interface complementing LCiBot themes
- **Other Services**: Native themes maintained for optimal functionality

## 🛠️ Troubleshooting Guide

### Common Issues & Solutions

#### LCiBot Dashboard Issues
**Problem**: Dashboard shows white screen or won't load
**Solution**: 
1. Clear browser cache and reload
2. Check console for JavaScript errors
3. Verify network connectivity to 192.168.0.99:8091
4. Try different browser or incognito mode

**Problem**: Service health checks showing all services offline
**Solution**:
1. Verify Prometheus is running: `curl http://192.168.0.99:9090`
2. Check network connectivity to individual services
3. Review browser console for CORS errors
4. Restart LCiBot dashboard container if needed

#### Theme System Issues
**Problem**: Theme switching not working or themes not loading
**Solution**:
1. Clear localStorage: Run `localStorage.clear()` in browser console
2. Hard refresh browser: Ctrl+F5 or Cmd+Shift+R
3. Check network connection and reload page
4. Verify theme CSS files are loading properly

#### Mobile Access Issues
**Problem**: Services not responsive on mobile devices
**Solution**:
1. Use LCiBot Dashboard for optimal mobile experience
2. Check if service supports mobile interface (see Mobile Access Guide)
3. Try landscape orientation for better layout
4. Use desktop interface via remote desktop if needed

#### Service Connectivity Issues
**Problem**: Cannot access services from external network
**Solution**:
1. Verify you're on the same network (192.168.0.x)
2. Check firewall settings on Proxmox host
3. Use VPN connection for remote access
4. Verify service is running: Check in Portainer or system status

### Emergency Contact Information
**System Information**:
- **Host System**: Proxmox VE at 192.168.0.99
- **SSH Access**: Available for administrative access
- **Backup Status**: Regular ZFS snapshots, critical data preserved
- **Recovery Options**: All services can be restarted via Portainer or SSH

## 📈 Usage Statistics & Analytics

### Service Utilization (Based on Monitoring Data)
| Service | Daily Requests | Primary Users | Peak Hours |
|---------|----------------|---------------|------------|
| **LCiBot Dashboard** | High | System monitoring, mobile users | All day |
| **Homer Dashboard** | Medium | Service discovery | Morning, evening |
| **Grafana** | Medium | System administration | Work hours |
| **FileBrowser** | High | File management | Evening |

### Performance Trends
- **System Load**: Consistently <20% CPU usage
- **Memory Usage**: Stable at 60% of available 32GB
- **Storage Growth**: Steady growth in media-pool usage
- **Network Traffic**: Internal traffic only, efficient utilization
- **Service Reliability**: 99%+ uptime across all services

---

**Master Index Status**: ✅ **COMPLETE**  
**Service Count**: 16/17 operational  
**Primary Access**: LCiBot Dashboard (http://192.168.0.99:8091)  
**Documentation**: Comprehensive guides available in UNIFIED-REFERENCE  
**Support**: All services documented with troubleshooting procedures  
**Mobile Support**: Optimized interfaces available for mobile access