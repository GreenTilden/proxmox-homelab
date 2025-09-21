# 🎮 Homer Dashboard User Guide

**Service URL**: http://192.168.0.99:8090  
**Status**: ✅ OPERATIONAL  
**Theme**: 16-Bit Gaming Command Station  
**Updated**: 2025-09-11

## 🎯 Overview

Homer Dashboard serves as the **primary interface** for all homelab services, providing a unified 16-bit gaming themed portal with mobile-first responsive design. It replaces individual service bookmarks with a centralized, visually appealing command center.

### Quick Access
```
🎮 Primary URL: http://192.168.0.99:8090
📱 Mobile optimized: Touch-friendly interface
🖥️ Desktop enhanced: Full CRT effects and animations
```

## 📋 Service Categories

Homer organizes all homelab services into gaming-themed categories for intuitive navigation:

### 🏰 Command Center
Strategic oversight and monitoring services:
- **Grafana** (`http://192.168.0.99:3000`) - Battle Statistics Dashboard
  - Authentication: admin/test123
  - Features: 16-bit themed monitoring dashboards
- **Portainer** (`http://192.168.0.99:9000`) - Container Fortress Control
  - Authentication: Web interface setup required
  - Purpose: Docker container management

### ⚔️ Media Kingdom
Entertainment and media acquisition services:
- **Plex Media Server** (`http://192.168.0.99:32400`) - Royal Cinema Hall
  - Authentication: Google OAuth protected
  - Status: ⚠️ Container running, service needs restart
- **Firefox Container** (`http://192.168.0.99:3001`) - Quest Portal
  - Authentication: None required
  - Purpose: Secure web browsing for media acquisition
- **Deluge** (`http://192.168.0.111:8112`) - Treasure Acquisition
  - Authentication: Password "deluge"
  - Purpose: Torrent client for media downloads

### 🛡️ System Defense  
Infrastructure management and monitoring:
- **FileBrowser** (`http://192.168.0.99:8080`) - Vault Management
  - Authentication: None configured
  - Purpose: ZFS pool file management
- **Prometheus** (`http://192.168.0.99:9090`) - Metrics Forge
  - Authentication: None required
  - Purpose: System metrics collection
- **cAdvisor** (`http://192.168.0.99:8082`) - Container Watcher
  - Authentication: None required  
  - Purpose: Container performance monitoring

### 🤖 AI Companions
- **ChatBot UI** (`http://192.168.0.99:3002`) - AI Advisor
  - Authentication: None required

## 🎨 Visual Design & Theme

### 16-Bit Gaming Aesthetic
Homer implements authentic retro gaming visual elements:

#### Color Palette
```css
Electric Blue (#0066FF):  Headers, primary elements
Vibrant Red (#FF0066):    Highlights, hover states  
Neon Green (#00FF66):     Success indicators
Sunset Yellow (#FFCC00):  Warning states
```

#### Typography
- **Primary Font**: Press Start 2P (authentic pixel font)
- **Loading**: Google Fonts integration
- **Fallback**: Monospace system fonts

#### Visual Effects
- **CRT Monitor Effects**: Scanlines and glow animations
- **Hover Animations**: Service cards respond to interaction
- **Gaming Metaphors**: Services named with gaming terminology
- **Performance**: Effects optimized for mobile devices

## 📱 Cross-Device Compatibility

### Mobile Devices (320px - 768px)
```
✅ Font Scaling: 10px base for readability
✅ Touch Targets: 44px minimum for accessibility  
✅ Performance: Reduced effects for battery optimization
✅ Navigation: Touch-friendly service cards
```

**Mobile Navigation Tips**:
- Tap service cards for quick access
- Pinch-to-zoom supported for detailed reading
- Portrait and landscape orientations supported

### Tablet Devices (768px - 1024px) 
```
✅ Grid Layout: 2-column service arrangement
✅ Hover States: Touch-compatible feedback
✅ Icon Scaling: 28px service icons
✅ Responsive: Adapts to orientation changes
```

### Desktop (1024px+)
```
✅ Full Effects: Complete CRT glow and scanlines
✅ Multi-column: Optimal service organization
✅ Hover Animations: Enhanced visual feedback
✅ Performance: Full desktop graphics capabilities
```

## ⚙️ Configuration & Management

### Service Health Monitoring
Homer integrates with Prometheus for real-time service health:
```bash
Health Monitoring: /usr/local/bin/homer-service-health.sh
Update Frequency: Every 2 minutes  
Metrics Storage: /service-pool/homer/config/service-health.prom
Services Tracked: 15+ services
```

### Configuration Files
```bash
Homer Config: /service-pool/homer/config/config.yml
CSS Theme: /service-pool/homer/config/assets/css/retro-gaming.css
Service Icons: /service-pool/homer/config/assets/icons/
Background Assets: /service-pool/homer/config/assets/img/
```

## 🔧 Troubleshooting

### Common Issues

#### Homer Dashboard Not Loading
```bash
# Check container status
ssh root@192.168.0.99 "docker ps | grep homer"

# Expected output:
homer-dashboard   Up X hours (healthy)   0.0.0.0:8090->8080/tcp
```

#### Service Links Not Working
1. **Check individual service status** via Portainer or `docker ps`
2. **Verify network connectivity** between services
3. **Check service authentication** requirements

#### Mobile Display Issues
1. **Clear browser cache** on mobile device
2. **Test in incognito mode** to bypass cached resources
3. **Verify Press Start 2P font loading** (fallback to monospace is normal)

#### Theme Not Loading Correctly
```bash
# Verify CSS file exists
ssh root@192.168.0.99 "ls -la /service-pool/homer/config/assets/css/"

# Check file permissions  
ssh root@192.168.0.99 "ls -la /service-pool/homer/config/"
```

## 📊 Performance Metrics

### Current Performance Standards
```
Load Time: <1 second (sub-second loading achieved)
Service Health: 15/16 services operational (94% uptime)
Mobile Performance: Optimized for battery conservation
Desktop Experience: Full visual effects enabled
```

### Health Status Indicators
- **Green**: Service operational (200/302 response)
- **Yellow**: Service authentication required (401/403 response) 
- **Red**: Service unavailable (timeout/500 errors)

## 🚀 Advanced Usage

### Adding New Services
Homer services are configured via YAML. To add new services:

1. **Edit configuration file**:
   ```bash
   ssh root@192.168.0.99 "nano /service-pool/homer/config/config.yml"
   ```

2. **Add service entry** under appropriate category:
   ```yaml
   - name: "New Service"
     logo: "assets/icons/new-service.png"
     url: "http://192.168.0.99:PORT"
     target: "_blank"
   ```

3. **Restart Homer container**:
   ```bash
   ssh root@192.168.0.99 "docker restart homer-dashboard"
   ```

### Theme Customization
Modify the retro gaming theme by editing:
```bash
/service-pool/homer/config/assets/css/retro-gaming.css
```

Key customizable elements:
- Color palette via CSS custom properties
- CRT effect intensity
- Typography and sizing
- Mobile responsiveness breakpoints

## 🔗 Integration Points

### Grafana Integration
Homer integrates with existing Grafana monitoring:
- Service health metrics exported to Prometheus
- Gaming theme consistency with Grafana dashboards  
- Cross-device monitoring access

### Portainer Integration  
Container management accessible through Homer:
- Direct links to container details
- Service restart capabilities
- Resource monitoring integration

Homer provides unified access to AI laboratory:
- ChatBot UI as primary interaction point
- Individual AI model endpoints for specialized tasks
- Database connectivity for AI automation workflows

---

**This guide provides comprehensive usage instructions for the Homer Dashboard, serving as the central command interface for the complete homelab infrastructure.**