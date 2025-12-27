# Service Verification Workflow

**Created**: 2025-08-25  
**Thread Origin**: Debug Thread Analysis  
**Purpose**: Standardized service health verification methods

## 🔍 **HTTP Status Code Verification**

### **Proper Status Code Interpretation**

#### **✅ Healthy Service Indicators**
```bash
# 200 OK - Direct service availability
curl -sI http://192.168.0.99:9090    # Prometheus metrics endpoint
curl -sI http://192.168.0.99:8080    # FileBrowser web interface  
curl -sI http://192.168.0.99:9100/metrics    # Node Exporter

# 302 Redirect - Service healthy with authentication
curl -sI http://192.168.0.99:3000    # Grafana (redirects to login)

# 401 Authentication Required - Service operational but protected  
curl -sI http://192.168.0.111:8112   # Deluge web interface
```

#### **❌ Service Failure Indicators**
```bash
# Connection refused - Service down or wrong port
curl -sI http://192.168.0.99:9999    # No response

# 500 Internal Server Error - Service misconfigured
# 404 Not Found - Wrong endpoint or service not running
# Timeout - Network issues or service hanging
```

### **Debug Thread Learning**
**Previous Error**: Using content matching (`curl -s | grep "text"`) for Single Page Applications (SPAs) and auth-protected services provided inconsistent results.

**Corrected Approach**: HTTP status codes provide reliable service health indicators regardless of authentication state or frontend technology.

## 🛠️ **Service-Specific Verification Commands**

### **Monitoring Stack**
```bash
# Grafana - Expects 302 redirect to login
curl -sI http://192.168.0.99:3000
# Expected: HTTP/1.1 302 Found → Login page redirect = HEALTHY

# Prometheus - Direct access to query interface  
curl -sI http://192.168.0.99:9090
# Expected: HTTP/1.1 200 OK → Direct access = HEALTHY

# Node Exporter - Metrics endpoint
curl -sI http://192.168.0.99:9100/metrics
# Expected: HTTP/1.1 200 OK → Metrics available = HEALTHY

# ZFS Custom Exporter - Custom metrics
curl -sI http://192.168.0.99:9101/metrics  
# Expected: HTTP/1.1 200 OK → ZFS metrics = HEALTHY
```

### **File Management**
```bash
# FileBrowser - Open access web interface
curl -sI http://192.168.0.99:8080
# Expected: HTTP/1.1 200 OK → Interface accessible = HEALTHY
```

### **Media Services**  
```bash
# Plex Media Server - Claimed server with auth
curl -sI http://192.168.0.99:32400/web
# Expected: HTTP/1.1 200 OK → Plex web interface = HEALTHY

# Firefox Container - VNC web interface
curl -sI http://192.168.0.99:3001
# Expected: HTTP/1.1 200 OK → noVNC interface = HEALTHY

# Deluge LXC - Password protected
curl -sI http://192.168.0.111:8112
# Expected: HTTP/1.1 401 Unauthorized → Auth required = HEALTHY
```

## 📊 **Automated Health Check Script**

### **Complete Service Verification**
```bash
#!/bin/bash
# /usr/local/bin/service-health-check.sh

echo "=== Service Health Check - $(date) ==="

declare -A services=(
    ["Grafana"]="http://192.168.0.99:3000:302"
    ["Prometheus"]="http://192.168.0.99:9090:200"  
    ["FileBrowser"]="http://192.168.0.99:8080:200"
    ["Plex"]="http://192.168.0.99:32400/web:200"
    ["Firefox"]="http://192.168.0.99:3001:200"
    ["Deluge"]="http://192.168.0.111:8112:401"
    ["Node Exporter"]="http://192.168.0.99:9100/metrics:200"
    ["ZFS Exporter"]="http://192.168.0.99:9101/metrics:200"
)

for service in "${!services[@]}"; do
    IFS=':' read -r url expected_code <<< "${services[$service]}"
    
    response=$(curl -sI "$url" | head -n1 | awk '{print $2}')
    
    if [ "$response" = "$expected_code" ]; then
        echo "✅ $service: HEALTHY ($response)"
    else
        echo "❌ $service: FAILED (got $response, expected $expected_code)"
    fi
done

echo "=== Health Check Complete ==="
```

## 🔄 **Integration with Monitoring**

### **Prometheus Health Checks**
```yaml
# /configs/prometheus-health-checks.yml
- job_name: 'service-health'
  static_configs:
    - targets: ['192.168.0.99:3000']  # Grafana
      labels:
        service: 'grafana'
        expected_status: '302'
    - targets: ['192.168.0.99:8080']  # FileBrowser  
      labels:
        service: 'filebrowser'
        expected_status: '200'
```

### **Grafana Alert Rules**
```yaml  
groups:
- name: service_health
  rules:
  - alert: ServiceDown
    expr: up == 0
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "Service {{ $labels.service }} is down"
      description: "HTTP health check failed with status {{ $labels.status }}"
```

## 📱 **Mobile Dashboard Integration**

### **Health Status Panels**
```json
{
  "title": "Service Health Overview",
  "type": "stat",
  "targets": [
    {
      "expr": "up{job=\"service-health\"}",  
      "legendFormat": "{{ service }}"
    }
  ],
  "fieldConfig": {
    "custom": {
      "displayMode": "basic",
      "cellHeight": "sm"
    }
  }
}
```

## 🚨 **Troubleshooting Guide**

### **Common Verification Issues**
1. **302 vs 200 Confusion**: 
   - 302 redirects are normal for authenticated services
   - Don't treat redirects as failures

2. **Authentication False Negatives**:
   - 401 responses indicate healthy service with auth
   - Don't use content matching on login pages

3. **Timeout Handling**:
   - Set appropriate curl timeouts (5-10 seconds)
   - Network delays ≠ service failures

### **Debug Commands**
```bash
# Full response headers for analysis
curl -vI http://192.168.0.99:3000

# Check service logs for context  
docker logs grafana  # Docker services
journalctl -u deluge # LXC services

# Network connectivity test
nc -zv 192.168.0.99 3000  # Test port accessibility
```

## 📈 **Verification Metrics**

### **Expected Response Times**
- **Grafana**: <500ms for login redirect
- **Prometheus**: <200ms for query interface  
- **FileBrowser**: <300ms for file listing
- **Plex**: <1000ms for web interface
- **Deluge**: <400ms for auth challenge

### **Success Criteria**
- ✅ All services return expected HTTP status codes
- ✅ Response times within acceptable thresholds  
- ✅ No connection timeouts or network errors
- ✅ Authentication challenges working properly

---

**Key Learning**: HTTP status codes provide reliable service health indicators. Content matching approaches fail with modern SPAs and authentication systems. Always verify expected status codes per service type.