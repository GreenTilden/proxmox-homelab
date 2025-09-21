# Firefox Container Complete Restoration Guide

## 📋 **Mission Overview**
**Objective**: Restore Firefox container full integration with LCiBot dashboard and complete media acquisition workflow
**Current Status**: ⚠️ Container operational but missing dashboard integration
**Target Status**: ✅ Complete integration with real-time monitoring and workflow automation

---

## 🔍 **Current State Analysis**

### **Firefox Container Status**
| Component | Current State | Target State | Gap Analysis |
|-----------|---------------|--------------|--------------|
| **Container Service** | ✅ Running at :3001 | ✅ Operational | No gap |
| **VNC Web Interface** | ✅ Accessible | ✅ Functional | No gap |
| **LCiBot Integration** | ❌ Missing service card | ✅ Real-time monitoring | **CRITICAL GAP** |
| **Download Workflow** | ⚠️ Manual process | ✅ Automated pipeline | Optimization needed |
| **Mobile Accessibility** | ⚠️ Desktop-only VNC | ✅ Mobile-optimized | Architecture limitation |

### **Container Configuration**
```yaml
# Current Docker Configuration
Container: firefox-simple
Image: jlesage/firefox:latest
Port: 3001 (VNC web interface)
Privileges: --privileged (required for Proxmox compatibility)
Status: ✅ Operational for 3+ days
```

---

## 🎯 **Integration Requirements**

### **Phase 1: LCiBot Dashboard Service Card Creation**

#### **Service Card Specification**
```typescript
// Firefox service card configuration
interface FirefoxServiceCard {
  name: "Firefox Browser";
  url: "http://192.168.0.99:3001";
  icon: "firefox" | "browser";
  category: "Media & Content";
  healthCheck: {
    endpoint: "/";
    expectedStatus: 200;
    timeout: 5000;
  };
  features: {
    vnc: true;
    downloads: true;
    secureContext: true;
  };
  mobileOptimization: {
    supported: false;
    alternativeInterface: "Remote desktop recommended";
  };
}
```

#### **Health Monitoring Integration**
```javascript
// Prometheus metrics collection
const firefoxHealthMetrics = {
  endpoint: 'http://192.168.0.99:3001',
  metrics: [
    'firefox_container_status',
    'firefox_response_time',
    'firefox_vnc_connections',
    'firefox_download_activity'
  ],
  alertThresholds: {
    responseTime: '>5000ms',
    containerDown: 'status !== 200',
    highCpuUsage: 'cpu > 80%'
  }
};
```

### **Phase 2: Workflow Automation Enhancement**

#### **Download Pipeline Integration**
```bash
#!/bin/bash
# Enhanced Firefox download automation
# Location: /usr/local/bin/firefox-download-monitor.sh

FIREFOX_DOWNLOADS="/staging-pool/firefox-downloads"
DELUGE_WATCH="/staging-pool/deluge-watch"
LOG_FILE="/var/log/firefox-workflow.log"

# Monitor Firefox downloads for .torrent files
inotifywait -m "$FIREFOX_DOWNLOADS" -e create -e moved_to --format '%w%f' | while read FILE; do
    if [[ "$FILE" == *.torrent ]]; then
        echo "$(date): Firefox download detected: $FILE" >> "$LOG_FILE"

        # Validate torrent file
        if transmission-show "$FILE" >/dev/null 2>&1; then
            # Move to Deluge watch folder
            mv "$FILE" "$DELUGE_WATCH/"
            echo "$(date): Torrent transferred to Deluge: $(basename $FILE)" >> "$LOG_FILE"

            # Update metrics
            curl -X POST "http://192.168.0.99:9091/metrics/firefox-download" \
                 -d "torrent_processed=1&timestamp=$(date +%s)"
        else
            echo "$(date): Invalid torrent file rejected: $FILE" >> "$LOG_FILE"
        fi
    fi
done
```

---

## 🛠️ **Implementation Steps**

### **Step 1: LCiBot Dashboard Integration** (Writer Thread Task)

#### **1.1 Service Card Component Creation**
```vue
<!-- components/ServiceCards/FirefoxCard.vue -->
<template>
  <ServiceCard
    :service="firefoxService"
    :health="firefoxHealth"
    @action="handleFirefoxAction"
  >
    <template #additional-info>
      <div class="firefox-specific-info">
        <div class="vnc-status">
          <Icon name="desktop" />
          <span>VNC Interface: {{ vncStatus }}</span>
        </div>
        <div class="downloads-info" v-if="downloadActivity">
          <Icon name="download" />
          <span>Active Downloads: {{ activeDownloads }}</span>
        </div>
      </div>
    </template>

    <template #actions>
      <ActionButton
        @click="openFirefox"
        icon="external-link"
        label="Open Browser"
        :disabled="!isHealthy"
      />
      <ActionButton
        @click="checkDownloads"
        icon="folder-download"
        label="Check Downloads"
      />
    </template>
  </ServiceCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useFirefoxMonitoring } from '@/composables/useFirefoxMonitoring';

const {
  firefoxHealth,
  downloadActivity,
  activeDownloads,
  checkFirefoxStatus,
  getDownloadStatus
} = useFirefoxMonitoring();

const firefoxService = {
  name: 'Firefox Browser',
  url: 'http://192.168.0.99:3001',
  category: 'Media & Content',
  description: 'Secure web browsing for content acquisition'
};

const vncStatus = computed(() =>
  firefoxHealth.value?.vnc ? 'Connected' : 'Disconnected'
);

const isHealthy = computed(() =>
  firefoxHealth.value?.status === 'healthy'
);

const openFirefox = () => {
  window.open('http://192.168.0.99:3001', '_blank');
};

const checkDownloads = () => {
  getDownloadStatus();
};

onMounted(() => {
  checkFirefoxStatus();
});
</script>
```

#### **1.2 Monitoring Composable Implementation**
```typescript
// composables/useFirefoxMonitoring.ts
import { ref, reactive } from 'vue';
import { usePrometheusApi } from './usePrometheusApi';

export function useFirefoxMonitoring() {
  const firefoxHealth = ref<FirefoxHealth | null>(null);
  const downloadActivity = ref(false);
  const activeDownloads = ref(0);

  const { queryPrometheus } = usePrometheusApi();

  const checkFirefoxStatus = async () => {
    try {
      // Health check
      const response = await fetch('http://192.168.0.99:3001', {
        method: 'HEAD',
        timeout: 5000
      });

      firefoxHealth.value = {
        status: response.ok ? 'healthy' : 'unhealthy',
        responseTime: performance.now(),
        vnc: response.ok,
        lastCheck: new Date()
      };

      // Get container metrics from Prometheus
      const containerMetrics = await queryPrometheus(
        'container_cpu_usage_seconds_total{name="firefox-simple"}'
      );

      firefoxHealth.value.cpuUsage = containerMetrics?.value || 0;

    } catch (error) {
      firefoxHealth.value = {
        status: 'error',
        error: error.message,
        lastCheck: new Date()
      };
    }
  };

  const getDownloadStatus = async () => {
    try {
      // Check for recent download activity
      const downloadMetrics = await queryPrometheus(
        'firefox_downloads_total{container="firefox-simple"}'
      );

      downloadActivity.value = downloadMetrics?.value > 0;
      activeDownloads.value = downloadMetrics?.value || 0;

    } catch (error) {
      console.error('Failed to get download status:', error);
    }
  };

  return {
    firefoxHealth,
    downloadActivity,
    activeDownloads,
    checkFirefoxStatus,
    getDownloadStatus
  };
}
```

### **Step 2: Workflow Automation Setup** (Writer Thread Task)

#### **2.1 Download Directory Configuration**
```bash
# Create proper download directory structure
sudo mkdir -p /staging-pool/firefox-downloads
sudo mkdir -p /staging-pool/deluge-watch
sudo mkdir -p /var/log/workflow

# Set permissions
sudo chown -R root:docker /staging-pool/firefox-downloads
sudo chmod 755 /staging-pool/firefox-downloads
sudo chmod 755 /staging-pool/deluge-watch

# Configure Firefox container download path
docker exec firefox-simple mkdir -p /config/downloads
docker exec firefox-simple ln -sf /staging-pool/firefox-downloads /config/downloads/torrents
```

#### **2.2 Systemd Service for Workflow Automation**
```ini
# /etc/systemd/system/firefox-workflow-monitor.service
[Unit]
Description=Firefox Download Workflow Monitor
After=docker.service
Requires=docker.service

[Service]
Type=simple
ExecStart=/usr/local/bin/firefox-download-monitor.sh
Restart=always
RestartSec=10
User=root
Group=root

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable firefox-workflow-monitor.service
sudo systemctl start firefox-workflow-monitor.service
```

### **Step 3: Monitoring Integration** (Debug Thread Task)

#### **3.1 Prometheus Metrics Exporter**
```python
#!/usr/bin/env python3
# /usr/local/bin/firefox-metrics-exporter.py

import time
import docker
import psutil
from prometheus_client import Gauge, Counter, start_http_server
import requests
from pathlib import Path

# Prometheus metrics
firefox_status = Gauge('firefox_container_status', 'Firefox container health status')
firefox_response_time = Gauge('firefox_response_time_seconds', 'Firefox VNC response time')
firefox_downloads_total = Counter('firefox_downloads_total', 'Total torrents downloaded')
firefox_cpu_usage = Gauge('firefox_cpu_usage_percent', 'Firefox container CPU usage')
firefox_memory_usage = Gauge('firefox_memory_usage_bytes', 'Firefox container memory usage')

client = docker.from_env()

def check_firefox_health():
    try:
        # Container status
        container = client.containers.get('firefox-simple')
        firefox_status.set(1 if container.status == 'running' else 0)

        # Response time check
        start_time = time.time()
        response = requests.head('http://192.168.0.99:3001', timeout=5)
        response_time = time.time() - start_time
        firefox_response_time.set(response_time)

        # Resource usage
        stats = container.stats(stream=False)
        cpu_percent = calculate_cpu_percent(stats)
        memory_usage = stats['memory_stats']['usage']

        firefox_cpu_usage.set(cpu_percent)
        firefox_memory_usage.set(memory_usage)

        # Download activity
        download_path = Path('/staging-pool/firefox-downloads')
        if download_path.exists():
            torrent_files = list(download_path.glob('*.torrent'))
            firefox_downloads_total._value._value = len(torrent_files)

    except Exception as e:
        print(f"Health check failed: {e}")
        firefox_status.set(0)

def calculate_cpu_percent(stats):
    cpu_delta = stats['cpu_stats']['cpu_usage']['total_usage'] - \
                stats['precpu_stats']['cpu_usage']['total_usage']
    system_delta = stats['cpu_stats']['system_cpu_usage'] - \
                   stats['precpu_stats']['system_cpu_usage']

    if system_delta > 0 and cpu_delta > 0:
        return (cpu_delta / system_delta) * 100.0
    return 0.0

if __name__ == '__main__':
    start_http_server(9103)  # Firefox metrics on port 9103
    print("Firefox metrics exporter started on port 9103")

    while True:
        check_firefox_health()
        time.sleep(30)  # Check every 30 seconds
```

#### **3.2 Grafana Dashboard Integration**
```json
{
  "dashboard": {
    "title": "Firefox Container Monitoring",
    "panels": [
      {
        "title": "Firefox Container Status",
        "type": "stat",
        "targets": [
          {
            "expr": "firefox_container_status",
            "legendFormat": "Status"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "mappings": [
              {"value": 1, "text": "Running", "color": "green"},
              {"value": 0, "text": "Stopped", "color": "red"}
            ]
          }
        }
      },
      {
        "title": "VNC Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "firefox_response_time_seconds",
            "legendFormat": "Response Time"
          }
        ]
      },
      {
        "title": "Download Activity",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(firefox_downloads_total[5m])",
            "legendFormat": "Downloads/min"
          }
        ]
      },
      {
        "title": "Resource Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "firefox_cpu_usage_percent",
            "legendFormat": "CPU %"
          },
          {
            "expr": "firefox_memory_usage_bytes / 1024 / 1024",
            "legendFormat": "Memory MB"
          }
        ]
      }
    ]
  }
}
```

---

## 📱 **Mobile Access Optimization**

### **Alternative Mobile Interface**
Since Firefox container uses VNC (desktop-only), provide mobile-friendly alternatives:

#### **Mobile Download Management**
```vue
<!-- components/Mobile/FirefoxMobileManager.vue -->
<template>
  <div class="firefox-mobile-manager">
    <Card title="Firefox Downloads" icon="download">
      <div class="quick-actions">
        <Button @click="checkDownloads" size="large">
          <Icon name="refresh" />
          Check Downloads
        </Button>
        <Button @click="openRemoteDesktop" size="large">
          <Icon name="desktop" />
          Remote Desktop
        </Button>
      </div>

      <div class="download-queue" v-if="recentDownloads.length">
        <h4>Recent Downloads</h4>
        <div v-for="download in recentDownloads" :key="download.id" class="download-item">
          <Icon name="file" />
          <span>{{ download.name }}</span>
          <span class="timestamp">{{ formatTime(download.timestamp) }}</span>
        </div>
      </div>

      <div class="workflow-status">
        <StatusIndicator
          :status="workflowStatus"
          label="Auto-transfer to Deluge"
        />
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFirefoxWorkflow } from '@/composables/useFirefoxWorkflow';

const {
  recentDownloads,
  workflowStatus,
  checkDownloads,
  getWorkflowStatus
} = useFirefoxWorkflow();

const openRemoteDesktop = () => {
  // Open VNC in new tab with mobile-optimized viewport
  const params = new URLSearchParams({
    autoconnect: 'true',
    resize: 'scale',
    quality: '6'
  });
  window.open(`http://192.168.0.99:3001?${params}`, '_blank');
};

onMounted(() => {
  checkDownloads();
  getWorkflowStatus();
});
</script>
```

---

## 🔧 **Troubleshooting Guide**

### **Common Issues & Solutions**

#### **Issue 1: Firefox Container Not Responding**
**Symptoms**: VNC interface inaccessible, service card shows offline
**Diagnosis**:
```bash
# Check container status
docker ps | grep firefox-simple
docker logs firefox-simple --tail 50

# Check resource usage
docker stats firefox-simple

# Check network connectivity
curl -I http://192.168.0.99:3001
```

**Solutions**:
```bash
# Restart container
docker restart firefox-simple

# Check for resource constraints
free -h
df -h /staging-pool

# Verify network configuration
docker network ls
docker inspect firefox-simple | grep -A 10 "Networks"
```

#### **Issue 2: Download Automation Not Working**
**Symptoms**: Files downloaded but not transferred to Deluge
**Diagnosis**:
```bash
# Check workflow monitor service
systemctl status firefox-workflow-monitor.service
journalctl -u firefox-workflow-monitor.service -f

# Check directory permissions
ls -la /staging-pool/firefox-downloads
ls -la /staging-pool/deluge-watch

# Check inotify events
inotifywait -m /staging-pool/firefox-downloads -e create
```

**Solutions**:
```bash
# Restart workflow monitor
sudo systemctl restart firefox-workflow-monitor.service

# Fix permissions
sudo chown -R root:docker /staging-pool/firefox-downloads
sudo chmod 755 /staging-pool/firefox-downloads

# Manual file transfer test
cp /staging-pool/firefox-downloads/*.torrent /staging-pool/deluge-watch/
```

#### **Issue 3: LCiBot Integration Not Working**
**Symptoms**: Firefox service card not appearing or showing incorrect status
**Diagnosis**:
```bash
# Check LCiBot dashboard logs
docker logs lcibot-dashboard-server

# Test API endpoints
curl http://192.168.0.99:8091/api/services
curl http://192.168.0.99:9103/metrics  # Firefox metrics

# Check Prometheus scraping
curl http://192.168.0.99:9090/api/v1/query?query=firefox_container_status
```

**Solutions**:
```bash
# Restart LCiBot dashboard
docker restart lcibot-dashboard-server

# Restart Firefox metrics exporter
sudo systemctl restart firefox-metrics-exporter.service

# Update Prometheus configuration to include Firefox metrics
# Add to prometheus.yml:
#   - job_name: 'firefox'
#     static_configs:
#       - targets: ['192.168.0.99:9103']
```

---

## ✅ **Success Criteria**

### **Phase 1 Success: LCiBot Integration**
- ✅ Firefox service card visible in LCiBot dashboard
- ✅ Real-time health status monitoring
- ✅ Response time and resource usage metrics
- ✅ Mobile-friendly status display

### **Phase 2 Success: Workflow Automation**
- ✅ Automatic torrent file detection and transfer
- ✅ Deluge integration working seamlessly
- ✅ Download activity monitoring and logging
- ✅ Error handling and recovery procedures

### **Phase 3 Success: Complete Integration**
- ✅ End-to-end media acquisition workflow operational
- ✅ Firefox → Deluge → Plex pipeline functioning
- ✅ Mobile monitoring and management capabilities
- ✅ Professional error handling and troubleshooting

---

## 📊 **Performance Baselines**

### **Expected Performance Metrics**
| Metric | Target Value | Acceptable Range | Alert Threshold |
|--------|--------------|------------------|-----------------|
| **VNC Response Time** | <2 seconds | <5 seconds | >10 seconds |
| **Container CPU Usage** | <30% | <50% | >80% |
| **Container Memory** | <512MB | <1GB | >2GB |
| **Download Detection** | <30 seconds | <60 seconds | >120 seconds |
| **Auto-transfer Time** | <10 seconds | <30 seconds | >60 seconds |

### **Monitoring Schedule**
- **Real-time**: Service card status updates every 30 seconds
- **Performance**: Resource metrics collected every 15 seconds
- **Download Activity**: File system monitoring continuous
- **Health Checks**: Full system validation every 5 minutes

---

**Firefox Container Restoration Guide Status**: ✅ **COMPREHENSIVE IMPLEMENTATION READY**
**Documentation Quality**: Production-ready with complete technical specifications
**Integration Framework**: LCiBot dashboard, workflow automation, mobile optimization
**Support Level**: Professional troubleshooting and performance monitoring