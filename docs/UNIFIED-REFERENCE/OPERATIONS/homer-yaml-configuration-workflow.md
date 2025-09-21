# 🔧 Homer Dashboard YAML Configuration Workflow

**Service Configuration Location**: `/service-pool/homer/config/config.yml`  
**Access Method**: SSH to root@192.168.0.99  
**Container**: homer-dashboard (Docker)  
**Theme Integration**: 16-bit gaming aesthetic with mobile responsiveness  
**Updated**: 2025-09-11

## 🎯 Overview

Homer Dashboard uses a YAML configuration file to define services, categories, and customization. This workflow provides comprehensive procedures for adding, modifying, and managing service configurations while maintaining the 16-bit gaming theme and mobile responsiveness.

## 📂 Configuration File Structure

### Current File Location
```bash
# Homer configuration directory structure
/service-pool/homer/config/
├── config.yml              # Main configuration file
├── assets/
│   ├── css/
│   │   └── retro-gaming.css # 16-bit gaming theme
│   ├── icons/
│   │   └── services/        # Service-specific icons
│   └── img/                 # Background images and assets
└── service-health.prom      # Prometheus health metrics (auto-generated)
```

### Configuration Access Commands
```bash
# SSH to Proxmox server
ssh root@192.168.0.99

# Navigate to Homer config directory  
cd /service-pool/homer/config

# Edit main configuration
nano config.yml

# View current configuration
cat config.yml

# Backup configuration before changes
cp config.yml config.yml.backup-$(date +%Y%m%d-%H%M%S)
```

## 🎮 Current Service Configuration

### Gaming-Themed Categories
The current Homer configuration organizes services into gaming-themed categories:

```yaml
# Homer Configuration Structure
title: "🎮 Homelab Retro Control Center"
subtitle: "16-Bit Gaming Command Station"

header: true
footer: false

theme: default
colors:
  light:
    highlight-primary: "#0066FF"    # Electric Blue
    highlight-secondary: "#FF0066"  # Vibrant Red
    highlight-hover: "#00FF66"      # Neon Green
    background: "#1a1a1a"           # Dark Gaming Background
  dark:
    highlight-primary: "#0066FF"
    highlight-secondary: "#FF0066" 
    highlight-hover: "#00FF66"
    background: "#000000"

stylesheet:
  - "assets/css/retro-gaming.css"

# Service Categories
services:
  - name: "🏰 Command Center"
    icon: "fas fa-crown"
    items:
      - name: "Grafana - Battle Statistics"
        logo: "assets/icons/grafana.png"
        url: "http://192.168.0.99:3000"
        target: "_blank"
      - name: "Portainer - Container Fortress"
        logo: "assets/icons/portainer.png" 
        url: "http://192.168.0.99:9000"
        target: "_blank"

  - name: "⚔️ Media Kingdom"
    icon: "fas fa-film"
    items:
      - name: "Plex - Royal Cinema Hall"
        logo: "assets/icons/plex.png"
        url: "http://192.168.0.99:32400"
        target: "_blank"
      - name: "Firefox - Quest Portal"
        logo: "assets/icons/firefox.png"
        url: "http://192.168.0.99:3001"
        target: "_blank"
      - name: "Deluge - Treasure Acquisition"
        logo: "assets/icons/deluge.png"
        url: "http://192.168.0.111:8112"
        target: "_blank"

  - name: "🛡️ System Defense"
    icon: "fas fa-shield-alt"
    items:
      - name: "FileBrowser - Vault Management"
        logo: "assets/icons/filebrowser.png"
        url: "http://192.168.0.99:8080"
        target: "_blank"
      - name: "Prometheus - Metrics Forge"
        logo: "assets/icons/prometheus.png"
        url: "http://192.168.0.99:9090"
        target: "_blank"
      - name: "cAdvisor - Container Watcher"
        logo: "assets/icons/cadvisor.png"
        url: "http://192.168.0.99:8082"
        target: "_blank"

  - name: "🤖 AI Companions"
    icon: "fas fa-robot"
    items:
      - name: "ChatBot UI - AI Advisor"
        logo: "assets/icons/chatbot.png"
        url: "http://192.168.0.99:3002"
        target: "_blank"
```

## ➕ Adding New Services

### Step-by-Step Service Addition Workflow

#### 1. Prepare Service Information
Before editing the configuration, gather:
- **Service Name**: Descriptive name with gaming theme
- **Service URL**: Complete HTTP/HTTPS URL with port
- **Service Icon**: Prepare icon file (64x64px recommended)
- **Category**: Determine which gaming category fits best

#### 2. Add Service Icon (Optional)
```bash
# Navigate to icons directory
cd /service-pool/homer/config/assets/icons/services/

# Copy icon file (example: new-service.png)  
# Icon should be 64x64px for optimal display
# Supported formats: PNG, SVG, ICO

# Verify icon file
ls -la new-service.png
```

#### 3. Edit Configuration File
```bash
# Create backup before editing
cd /service-pool/homer/config
cp config.yml config.yml.backup-$(date +%Y%m%d-%H%M%S)

# Edit configuration
nano config.yml
```

#### 4. Add Service Entry
Add the new service to the appropriate category:

```yaml
# Example: Adding a new service to AI Companions category
- name: "🤖 AI Companions"
  icon: "fas fa-robot"
  items:
    - name: "ChatBot UI - AI Advisor"
      logo: "assets/icons/chatbot.png"
      url: "http://192.168.0.99:3002"
      target: "_blank"
    # NEW SERVICE ENTRY
    - name: "New AI Service - Gaming Description"
      logo: "assets/icons/new-service.png"
      url: "http://192.168.0.99:PORT"
      target: "_blank"
      subtitle: "Optional service description"
      tag: "beta"  # Optional tag (new, beta, etc.)
```

#### 5. Restart Homer Container
```bash
# Restart container to reload configuration
docker restart homer-dashboard

# Verify container started successfully
docker ps | grep homer-dashboard

# Check container logs for errors
docker logs homer-dashboard | tail -10
```

#### 6. Verify Service Addition
```bash
# Test Homer Dashboard accessibility
curl -I http://192.168.0.99:8090

# Expected response: HTTP/1.1 200 OK
```

## 📝 Service Configuration Examples

### Basic Service Entry
```yaml
- name: "Service Display Name"
  logo: "assets/icons/service-icon.png"
  url: "http://192.168.0.99:PORT"
  target: "_blank"
```

### Advanced Service Entry with Options
```yaml
- name: "Advanced Service - Gaming Name"
  logo: "assets/icons/advanced-service.png"
  url: "http://192.168.0.99:PORT"
  target: "_blank"
  subtitle: "Optional description text"
  tag: "new"                    # Badge tag (new, beta, etc.)
  keywords: "search keywords"   # For search functionality
  tagstyle: "is-success"        # Tag color (is-success, is-warning, is-danger)
```

### External Service Entry
```yaml
- name: "External Service"
  logo: "assets/icons/external.png"
  url: "https://external-domain.com"
  target: "_blank"
  subtitle: "External service access"
  tag: "external"
  tagstyle: "is-info"
```

## 🎨 Gaming Theme Customization

### Category Icons and Themes
Use Font Awesome icons that match the gaming aesthetic:

```yaml
# Gaming-themed category examples
- name: "🏰 Command Center"      # Management & Control
  icon: "fas fa-crown"
- name: "⚔️ Media Kingdom"       # Entertainment Services  
  icon: "fas fa-film"
- name: "🛡️ System Defense"      # Security & Monitoring
  icon: "fas fa-shield-alt"
- name: "🤖 AI Companions"       # AI & Automation
  icon: "fas fa-robot"
- name: "🔧 Workshop"            # Development Tools
  icon: "fas fa-tools"
- name: "🗃️ Treasure Vault"      # Storage & Backup
  icon: "fas fa-treasure-chest"
```

### Service Naming Conventions
Follow gaming-themed naming patterns:
```
Original Name -> Gaming Name
Grafana -> "Battle Statistics Dashboard"
Portainer -> "Container Fortress Control"  
Plex -> "Royal Cinema Hall"
FileBrowser -> "Vault Management"
Prometheus -> "Metrics Forge"
Deluge -> "Treasure Acquisition"
ChatBot UI -> "AI Advisor"
```

## 🔄 Configuration Management Workflows

### Creating Configuration Backups
```bash
# Create timestamped backup
cd /service-pool/homer/config
cp config.yml backups/config-backup-$(date +%Y%m%d-%H%M%S).yml

# Create configuration archive
tar -czf homer-config-backup-$(date +%Y%m%d).tar.gz config.yml assets/
```

### Rolling Back Configuration Changes
```bash
# List available backups
ls -la backups/

# Restore from backup
cp backups/config-backup-TIMESTAMP.yml config.yml

# Restart container with restored configuration
docker restart homer-dashboard
```

### Configuration Validation
```bash
# Check YAML syntax before applying
python3 -c "import yaml; yaml.safe_load(open('config.yml'))"

# If no errors, YAML syntax is valid
# If errors appear, fix syntax before restarting container
```

## 🚀 Advanced Configuration Features

### Search Functionality
Homer includes built-in search. Enhance with keywords:
```yaml
- name: "Service Name"
  keywords: "monitoring grafana dashboard stats"
  # Keywords help users find services via search
```

### Service Health Monitoring Integration
Homer can integrate with Prometheus metrics:
```yaml
# Add to main configuration
connectivityCheck: true
proxy:
  useCredentials: false
  
# Individual service health checks
- name: "Service with Health Check"
  url: "http://192.168.0.99:PORT"  
  target: "_blank"
  endpoint: "http://192.168.0.99:PORT/health"  # Health check endpoint
```

### Custom CSS Theme Integration
The 16-bit gaming theme is loaded via CSS:
```yaml
# In main config.yml
stylesheet:
  - "assets/css/retro-gaming.css"
  
# CSS provides:
# - Press Start 2P font loading
# - 16-bit color palette
# - CRT monitor effects
# - Mobile responsiveness
# - Gaming-themed animations
```

## 📱 Mobile Optimization Configuration

### Mobile-Specific Settings
```yaml
# Ensure mobile-friendly configuration
title: "🎮 Homelab Control"        # Shorter title for mobile
subtitle: "Gaming Station"         # Shorter subtitle

# Mobile-optimized layout
columns: "auto"                    # Responsive columns
gap: "1rem"                        # Appropriate spacing for touch

# Touch-friendly service cards
card-blur: "5px"                   # Visual depth
card-opacity: 0.9                  # Semi-transparency
```

### Mobile Testing Checklist
After configuration changes:
1. ✅ Test on mobile browser (Chrome/Safari)
2. ✅ Verify touch targets are 44px minimum
3. ✅ Check text readability at small sizes
4. ✅ Confirm CRT effects don't impact performance
5. ✅ Validate orientation changes work properly

## 🔧 Troubleshooting Configuration Issues

### Common Configuration Problems

#### YAML Syntax Errors
```bash
# Error: Configuration not loading
# Solution: Validate YAML syntax
python3 -c "import yaml; yaml.safe_load(open('config.yml'))"

# Common issues:
# - Missing quotes around URLs with special characters
# - Incorrect indentation (use 2 spaces, not tabs)
# - Missing colons after keys
# - Unescaped quotes in strings
```

#### Missing Icons
```bash
# Error: Icons not displaying
# Solution: Check icon file paths
ls -la assets/icons/service-icon.png

# Common issues:
# - Icon file doesn't exist at specified path
# - Incorrect file permissions
# - Wrong file format (use PNG/SVG)
```

#### Service Links Not Working
```bash
# Error: Service links return 404/timeout
# Solution: Test service URLs directly
curl -I http://192.168.0.99:PORT

# Common issues:
# - Service not running (check docker ps)
# - Wrong port number in configuration
# - Network connectivity issues
```

### Emergency Recovery
```bash
# If configuration breaks Homer completely:

# 1. Restore from backup
cp backups/config-backup-LAST-WORKING.yml config.yml

# 2. Or use minimal working configuration
cat > config.yml << 'EOF'
title: "Homelab Services"
services:
  - name: "Services"
    items:
      - name: "Grafana"
        url: "http://192.168.0.99:3000"
        target: "_blank"
EOF

# 3. Restart container
docker restart homer-dashboard
```

## 📊 Configuration Performance Optimization

### Optimizing for Large Service Lists
```yaml
# For 15+ services, organize efficiently
# Group related services together
# Use descriptive but concise names
# Optimize icon file sizes (<50KB each)

# Performance settings
connectivityCheck: false    # Disable if too many services
proxy:
  timeout: 3000            # 3-second timeout for health checks
```

### Monitoring Configuration Impact
```bash
# Check Homer container resource usage
docker stats homer-dashboard

# Monitor configuration reload times
time docker restart homer-dashboard

# Verify service response times
curl -w "@curl-format.txt" -o /dev/null -s http://192.168.0.99:8090
```

---

**This YAML configuration workflow provides comprehensive procedures for managing Homer Dashboard service configuration while maintaining the 16-bit gaming theme and ensuring mobile responsiveness across all service additions and modifications.**