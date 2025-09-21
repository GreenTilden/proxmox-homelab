# Vue.js Dashboard Deployment Procedures

## Overview

This document provides comprehensive operational procedures for deploying, maintaining, and troubleshooting Vue.js dashboards in the homelab environment, based on the successful LCiBot Dashboard implementation.

## 🚀 Production Deployment Workflow

### Prerequisites Checklist
- [ ] Node.js 18+ installed on development system
- [ ] Docker Engine operational on target Proxmox host  
- [ ] Network access to homelab infrastructure (192.168.0.x)
- [ ] Vue.js dashboard source code prepared and tested
- [ ] Port availability verified (default: 8091)

### Step 1: Development Environment Setup
```bash
# Clone or prepare Vue.js dashboard source
cd /path/to/dashboard/source

# Install dependencies
npm install

# Verify development build
npm run dev

# Test in browser at http://localhost:5173 or configured port
# Verify all themes work correctly
# Test responsive design on multiple screen sizes
# Confirm service health checks function properly
```

### Step 2: Production Build Process
```bash
# Build for production
npm run build

# Verify build output
ls -la dist/
# Expected: index.html, assets/ directory with JS/CSS files

# Test production build locally (optional)
python3 -m http.server 8000 --directory dist
# Access at http://localhost:8000 to verify build
```

### Step 3: Docker Image Creation
```dockerfile
# Create Dockerfile in project root
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built Vue.js assets
COPY dist/ /usr/share/nginx/html/

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Step 4: Container Deployment
```bash
# Build Docker image
docker build -t lcibot-dashboard:latest .

# Deploy container with proper networking
docker run -d \
  --name lcibot-dashboard \
  --restart unless-stopped \
  -p 8091:80 \
  --network bridge \
  --health-cmd="curl -f http://localhost/health || exit 1" \
  --health-interval=30s \
  --health-timeout=3s \
  --health-retries=3 \
  lcibot-dashboard:latest

# Verify deployment
curl http://192.168.0.99:8091
# Expected: 200 response with Vue.js dashboard
```

### Step 5: Post-Deployment Verification
```bash
# Check container status
docker ps | grep lcibot-dashboard
# Expected: "healthy" status

# Test service health monitoring
curl -s http://192.168.0.99:8091 | grep -o "vue-app"
# Expected: Vue.js app loaded successfully

# Verify theme switching functionality
# Access dashboard in browser and test all 5 themes

# Test mobile responsiveness
# Verify dashboard works on mobile devices
```

## 🔧 Maintenance Procedures

### Regular Health Checks
```bash
#!/bin/bash
# /usr/local/bin/vue-dashboard-health.sh

DASHBOARD_URL="http://192.168.0.99:8091"
LOG_FILE="/var/log/vue-dashboard-health.log"

# Function to log with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Check dashboard availability
if curl -f -s "$DASHBOARD_URL" > /dev/null; then
    log "✅ Dashboard accessible at $DASHBOARD_URL"
else
    log "❌ Dashboard unreachable at $DASHBOARD_URL"
    
    # Attempt container restart
    docker restart lcibot-dashboard
    log "🔄 Attempted container restart"
    
    # Wait and recheck
    sleep 10
    if curl -f -s "$DASHBOARD_URL" > /dev/null; then
        log "✅ Dashboard recovered after restart"
    else
        log "❌ Dashboard still unreachable - manual intervention required"
    fi
fi

# Check container resource usage
MEMORY_USAGE=$(docker stats --no-stream --format "{{.MemUsage}}" lcibot-dashboard)
log "📊 Memory usage: $MEMORY_USAGE"
```

### Update Deployment Process
```bash
#!/bin/bash
# /usr/local/bin/update-vue-dashboard.sh

# Safety checks
set -e

# Configuration
IMAGE_NAME="lcibot-dashboard"
CONTAINER_NAME="lcibot-dashboard"
BACKUP_TAG="backup-$(date +%Y%m%d-%H%M%S)"

echo "🔄 Starting Vue.js dashboard update process..."

# Step 1: Backup current image
docker tag "$IMAGE_NAME:latest" "$IMAGE_NAME:$BACKUP_TAG"
echo "✅ Created backup: $IMAGE_NAME:$BACKUP_TAG"

# Step 2: Build new image
docker build -t "$IMAGE_NAME:latest" .
echo "✅ Built new image"

# Step 3: Stop current container
docker stop "$CONTAINER_NAME"
echo "✅ Stopped current container"

# Step 4: Remove old container
docker rm "$CONTAINER_NAME"
echo "✅ Removed old container"

# Step 5: Deploy new container
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  -p 8091:80 \
  --network bridge \
  --health-cmd="curl -f http://localhost/health || exit 1" \
  --health-interval=30s \
  --health-timeout=3s \
  --health-retries=3 \
  "$IMAGE_NAME:latest"

echo "✅ Deployed new container"

# Step 6: Verify deployment
sleep 5
if docker ps | grep -q "$CONTAINER_NAME.*healthy"; then
    echo "✅ Update successful - dashboard is healthy"
    
    # Cleanup old backup after successful deployment
    docker rmi "$IMAGE_NAME:$BACKUP_TAG" 2>/dev/null || true
    echo "✅ Cleaned up backup image"
else
    echo "❌ Update failed - rolling back"
    
    # Rollback process
    docker stop "$CONTAINER_NAME"
    docker rm "$CONTAINER_NAME"
    
    # Restore from backup
    docker tag "$IMAGE_NAME:$BACKUP_TAG" "$IMAGE_NAME:latest"
    docker run -d \
      --name "$CONTAINER_NAME" \
      --restart unless-stopped \
      -p 8091:80 \
      --network bridge \
      "$IMAGE_NAME:latest"
    
    echo "✅ Rolled back to previous version"
    exit 1
fi
```

### Log Management
```bash
# Container log rotation
docker logs lcibot-dashboard --tail 100 --follow

# Access Nginx logs
docker exec lcibot-dashboard cat /var/log/nginx/access.log | tail -20
docker exec lcibot-dashboard cat /var/log/nginx/error.log | tail -20

# Vue.js application logs (browser console)
# Access dashboard and open browser developer tools
# Check Console tab for JavaScript errors or warnings
```

## 🎨 Theme Management Procedures

### Theme Customization Workflow
```css
/* To add a new theme, create CSS variables */
/* Example: Mario Galaxy Theme */
.theme-galaxy {
  --mario-bg: rgba(5, 5, 20, 1);
  --mario-primary: rgba(100, 150, 255, 1);
  --mario-secondary: rgba(150, 100, 255, 1);
  --mario-accent: rgba(255, 200, 100, 1);
  --mario-text: rgba(240, 245, 255, 1);
  --mario-card: rgba(20, 25, 45, 1);
  --mario-section: rgba(10, 15, 35, 1);
  --mario-muted: rgba(150, 160, 200, 1);
}
```

### Theme Deployment Process
1. **Development**: Add new theme CSS to `src/style.css`
2. **Component Update**: Add theme option to theme selector component
3. **Testing**: Verify theme across all dashboard sections
4. **Build & Deploy**: Follow standard deployment workflow
5. **Verification**: Test theme switching in production

### Theme Backup & Recovery
```bash
# Backup current theme system
docker cp lcibot-dashboard:/usr/share/nginx/html/assets/index.css \
  ./backups/themes-$(date +%Y%m%d).css

# Restore theme system (if needed)
docker cp ./backups/themes-YYYYMMDD.css \
  lcibot-dashboard:/usr/share/nginx/html/assets/index.css
docker restart lcibot-dashboard
```

## 📱 Mobile Optimization Procedures

### Mobile Testing Protocol
```bash
# Device simulation testing checklist
# [ ] iPhone SE (375x667) - Compact mobile
# [ ] iPhone 12 (390x844) - Modern mobile
# [ ] iPad Mini (768x1024) - Small tablet
# [ ] iPad Pro (1024x1366) - Large tablet
# [ ] Desktop (1920x1080) - Standard desktop

# Browser testing checklist  
# [ ] Chrome Mobile
# [ ] Safari Mobile (iOS)
# [ ] Firefox Mobile
# [ ] Samsung Internet
# [ ] Chrome Desktop
# [ ] Firefox Desktop
# [ ] Safari Desktop
```

### Touch Interface Validation
```javascript
// JavaScript validation for touch targets
const validateTouchTargets = () => {
  const touchElements = document.querySelectorAll('button, [role="button"], a, input, select');
  
  touchElements.forEach(element => {
    const rect = element.getBoundingClientRect();
    const minSize = 44; // Minimum 44px touch target
    
    if (rect.width < minSize || rect.height < minSize) {
      console.warn('Touch target too small:', element, `${rect.width}x${rect.height}`);
    }
  });
};

// Run validation in browser console
validateTouchTargets();
```

## 🔍 Troubleshooting Guide

### Common Issues & Solutions

#### Issue 1: Dashboard Won't Load (White Screen)
```bash
# Symptoms: Browser shows blank page, no Vue.js content
# Diagnosis:
docker logs lcibot-dashboard --tail 50

# Common causes & solutions:
# 1. Build errors - Check for missing assets
ls -la dist/assets/
# Expected: index-[hash].js, index-[hash].css files

# 2. Nginx configuration issues
docker exec lcibot-dashboard nginx -t
# Expected: "syntax is ok", "test is successful"

# 3. Port conflicts
netstat -tlnp | grep 8091
# If another process is using port 8091, reassign

# Solution: Rebuild and redeploy
docker stop lcibot-dashboard
docker rm lcibot-dashboard
docker build -t lcibot-dashboard:latest .
# Deploy with standard procedure
```

#### Issue 2: Service Health Checks Failing
```bash
# Symptoms: All services show offline status
# Diagnosis:
curl -v http://192.168.0.99:3000  # Test direct service access
curl -v http://192.168.0.99:8091  # Test dashboard access

# Common causes:
# 1. CORS issues with service APIs
# 2. Network connectivity problems
# 3. Service endpoints changed

# Solution: Update service configuration
# Edit services array in Vue.js source code
# Update healthEndpoint URLs if needed
# Rebuild and redeploy
```

#### Issue 3: Theme Switching Not Working
```bash
# Symptoms: Theme selector doesn't change appearance
# Diagnosis: Check browser console for JavaScript errors

# Common causes:
# 1. CSS variables not loaded properly
# 2. JavaScript theme switching function errors
# 3. localStorage permissions issues

# Solution: Clear browser cache and localStorage
# In browser console:
localStorage.clear();
location.reload();
```

#### Issue 4: Poor Mobile Performance
```bash
# Symptoms: Slow loading, unresponsive interface on mobile
# Diagnosis: Check bundle size and loading metrics

# Browser developer tools:
# 1. Network tab - Check asset sizes
# 2. Performance tab - Analyze loading timeline
# 3. Lighthouse - Run performance audit

# Common optimizations:
# 1. Reduce image sizes
# 2. Minimize JavaScript bundle
# 3. Enable gzip compression
# 4. Optimize CSS delivery
```

### Emergency Rollback Procedure
```bash
#!/bin/bash
# Emergency rollback to previous working version

# Find backup image
docker images | grep lcibot-dashboard
# Look for backup-YYYYMMDD-HHMMSS tags

# Stop current container
docker stop lcibot-dashboard
docker rm lcibot-dashboard

# Restore from backup (replace BACKUP_TAG with actual tag)
BACKUP_TAG="backup-20240912-143000"
docker tag lcibot-dashboard:$BACKUP_TAG lcibot-dashboard:latest

# Deploy backup version
docker run -d \
  --name lcibot-dashboard \
  --restart unless-stopped \
  -p 8091:80 \
  --network bridge \
  lcibot-dashboard:latest

# Verify rollback
sleep 5
curl http://192.168.0.99:8091
echo "🔄 Rollback completed"
```

## 📊 Performance Monitoring

### Key Performance Indicators (KPIs)
```bash
# Container resource monitoring
docker stats lcibot-dashboard --no-stream

# Expected values:
# CPU: < 2% during normal operation
# Memory: < 50MB for container + assets
# Network I/O: Minimal unless actively serving requests

# Response time monitoring
curl -w "@curl-format.txt" -o /dev/null -s http://192.168.0.99:8091

# curl-format.txt content:
#     time_namelookup:  %{time_namelookup}\n
#        time_connect:  %{time_connect}\n
#     time_appconnect:  %{time_appconnect}\n
#    time_pretransfer:  %{time_pretransfer}\n
#       time_redirect:  %{time_redirect}\n
#  time_starttransfer:  %{time_starttransfer}\n
#                     ----------\n
#          time_total:  %{time_total}\n

# Expected: time_total < 0.5 seconds for local network
```

### Automated Monitoring Integration
```bash
# Prometheus metrics (if available)
# Add to prometheus.yml:
scrape_configs:
  - job_name: 'vue-dashboard'
    static_configs:
      - targets: ['192.168.0.99:8091']
    metrics_path: '/health'
    scrape_interval: 30s

# Grafana dashboard queries:
# Container status: up(nginx_up)
# Response time: histogram_quantile(0.95, nginx_request_duration_seconds_bucket)
# Error rate: rate(nginx_http_requests_total{status=~"5.."}[5m])
```

## 🔐 Security Considerations

### Network Security
```bash
# Firewall configuration (if using UFW)
ufw allow 8091/tcp comment "LCiBot Dashboard"
ufw reload

# Nginx security headers (add to nginx.conf)
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### Container Security
```bash
# Run container with non-root user (if needed)
# Add to Dockerfile:
RUN addgroup -g 1001 -S nginx
RUN adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx
USER nginx

# Limit container capabilities
docker run -d \
  --name lcibot-dashboard \
  --restart unless-stopped \
  -p 8091:80 \
  --cap-drop=ALL \
  --cap-add=CHOWN \
  --cap-add=SETGID \
  --cap-add=SETUID \
  --read-only \
  --tmpfs /tmp \
  --tmpfs /var/cache/nginx \
  lcibot-dashboard:latest
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Source code tested in development environment
- [ ] All themes verified functional
- [ ] Service health checks tested with actual services
- [ ] Mobile responsiveness validated on multiple devices
- [ ] Build process completed successfully
- [ ] Docker image built and tested locally

### Deployment
- [ ] Container deployed with correct port mapping
- [ ] Health checks configured and passing
- [ ] Network connectivity verified
- [ ] SSL/TLS configuration (if applicable)
- [ ] Firewall rules updated (if needed)

### Post-Deployment  
- [ ] Dashboard accessible from expected URL
- [ ] All themes switch correctly
- [ ] Service monitoring functional
- [ ] Mobile interface working properly
- [ ] Performance metrics within acceptable ranges
- [ ] Logs show no errors or warnings
- [ ] Backup plan tested and documented
- [ ] Monitoring integration configured
- [ ] Documentation updated with any changes

---

**Deployment Status**: ✅ Production Procedures Documented  
**Reference Implementation**: LCiBot Dashboard (http://192.168.0.99:8091)  
**Last Tested**: 2025-09-12  
**Procedure Validation**: Successful deployment confirmed  
**Maintained By**: Proxmox Homelab Documentation Thread