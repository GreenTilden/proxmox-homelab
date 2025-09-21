// Homer System Health Dashboard - Real-time Metrics Integration
// Integrates with Prometheus API for live system monitoring

class HomeLab {
  constructor() {
    this.prometheusUrl = 'http://192.168.0.99:9090';
    this.grafanaUrl = 'http://192.168.0.99:3000';
    this.refreshInterval = 15000; // 15 seconds
    this.metrics = new Map();
    this.services = new Map();
    this.init();
  }

  async init() {
    this.injectHealthDashboard();
    this.startMonitoring();
    this.initServiceStatus();
    console.log('🎮 HomeLab System Health Dashboard initialized');
  }

  injectHealthDashboard() {
    const content = document.querySelector('.content');
    if (!content) return;

    const healthDashboard = document.createElement('div');
    healthDashboard.className = 'health-dashboard';
    healthDashboard.innerHTML = `
      <div class="health-header">
        <h2>🎯 SYSTEM HEALTH STATUS</h2>
        <div class="health-status">
          <div class="status-indicator good" id="system-status" title="System Status"></div>
          <div class="status-indicator good" id="services-status" title="Services Status"></div>
          <div class="status-indicator good" id="storage-status" title="Storage Status"></div>
        </div>
      </div>
      <div class="health-metrics" id="health-metrics">
        ${this.generateMetricCards()}
      </div>
    `;

    // Insert at the top of content
    content.insertBefore(healthDashboard, content.firstChild);
  }

  generateMetricCards() {
    const metrics = [
      { id: 'cpu-load', label: '⚡ CPU LOAD', value: '--', unit: '', type: 'good' },
      { id: 'memory-usage', label: '🧠 MEMORY', value: '--', unit: '%', type: 'good' },
      { id: 'storage-usage', label: '💾 STORAGE', value: '--', unit: '%', type: 'good' },
      { id: 'container-count', label: '📦 CONTAINERS', value: '--', unit: '', type: 'good' },
      { id: 'network-io', label: '🌐 NETWORK I/O', value: '--', unit: 'MB/s', type: 'good' },
      { id: 'zfs-health', label: '🛡️ ZFS POOLS', value: '--', unit: '', type: 'good' },
      { id: 'system-uptime', label: '⏰ UPTIME', value: '--', unit: '', type: 'good' },
      { id: 'service-count', label: '⚙️ SERVICES', value: '--', unit: 'UP', type: 'good' }
    ];

    return metrics.map(metric => `
      <div class="metric-card" id="${metric.id}-card">
        <div class="metric-label">${metric.label}</div>
        <div class="metric-value">
          <span id="${metric.id}-value">${metric.value}</span>
          <span class="metric-unit">${metric.unit}</span>
        </div>
        <div class="metric-chart">
          <div class="metric-bar ${metric.type}" id="${metric.id}-bar" style="width: 0%"></div>
        </div>
      </div>
    `).join('');
  }

  async startMonitoring() {
    // Initial load
    await this.updateMetrics();
    
    // Set up periodic refresh
    setInterval(() => {
      this.updateMetrics();
    }, this.refreshInterval);

    console.log('📊 Started metric monitoring');
  }

  async updateMetrics() {
    try {
      await Promise.all([
        this.updateCPULoad(),
        this.updateMemoryUsage(),
        this.updateStorageUsage(),
        this.updateContainerMetrics(),
        this.updateNetworkIO(),
        this.updateZFSHealth(),
        this.updateUptime(),
        this.updateServiceCount()
      ]);
      
      this.updateSystemStatus();
    } catch (error) {
      console.error('❌ Error updating metrics:', error);
      this.setSystemStatus('critical');
    }
  }

  async prometheusQuery(query) {
    try {
      const response = await fetch(`${this.prometheusUrl}/api/v1/query?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      return data.data.result;
    } catch (error) {
      console.error('Prometheus query failed:', query, error);
      return [];
    }
  }

  async updateCPULoad() {
    const result = await this.prometheusQuery('node_load1');
    if (result.length > 0) {
      const load = parseFloat(result[0].value[1]);
      this.setMetric('cpu-load', load.toFixed(2), '', this.getLoadStatus(load));
      this.setMetricBar('cpu-load', Math.min(load * 25, 100), this.getLoadStatus(load));
    }
  }

  async updateMemoryUsage() {
    const totalResult = await this.prometheusQuery('node_memory_MemTotal_bytes');
    const freeResult = await this.prometheusQuery('node_memory_MemFree_bytes');
    const bufferResult = await this.prometheusQuery('node_memory_Buffers_bytes');
    const cacheResult = await this.prometheusQuery('node_memory_Cached_bytes');

    if (totalResult.length > 0 && freeResult.length > 0) {
      const total = parseFloat(totalResult[0].value[1]);
      const free = parseFloat(freeResult[0].value[1]);
      const buffers = bufferResult.length > 0 ? parseFloat(bufferResult[0].value[1]) : 0;
      const cached = cacheResult.length > 0 ? parseFloat(cacheResult[0].value[1]) : 0;
      
      const used = total - free - buffers - cached;
      const usagePercent = (used / total) * 100;
      
      this.setMetric('memory-usage', usagePercent.toFixed(1), '%', this.getUsageStatus(usagePercent));
      this.setMetricBar('memory-usage', usagePercent, this.getUsageStatus(usagePercent));
    }
  }

  async updateStorageUsage() {
    const result = await this.prometheusQuery('(1 - node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100');
    if (result.length > 0) {
      const usage = parseFloat(result[0].value[1]);
      this.setMetric('storage-usage', usage.toFixed(1), '%', this.getUsageStatus(usage));
      this.setMetricBar('storage-usage', usage, this.getUsageStatus(usage));
    }
  }

  async updateContainerMetrics() {
    const result = await this.prometheusQuery('count(container_last_seen{name!=""})');
    if (result.length > 0) {
      const count = parseInt(result[0].value[1]);
      this.setMetric('container-count', count, '', count > 0 ? 'good' : 'warning');
      this.setMetricBar('container-count', Math.min(count * 10, 100), count > 0 ? 'good' : 'warning');
    }
  }

  async updateNetworkIO() {
    const rxResult = await this.prometheusQuery('rate(node_network_receive_bytes_total{device!="lo"}[5m])');
    const txResult = await this.prometheusQuery('rate(node_network_transmit_bytes_total{device!="lo"}[5m])');
    
    if (rxResult.length > 0 || txResult.length > 0) {
      const rxBytes = rxResult.reduce((sum, r) => sum + parseFloat(r.value[1]), 0);
      const txBytes = txResult.reduce((sum, r) => sum + parseFloat(r.value[1]), 0);
      const totalMBps = (rxBytes + txBytes) / 1024 / 1024;
      
      this.setMetric('network-io', totalMBps.toFixed(2), 'MB/s', totalMBps > 100 ? 'warning' : 'good');
      this.setMetricBar('network-io', Math.min(totalMBps * 2, 100), totalMBps > 100 ? 'warning' : 'good');
    }
  }

  async updateZFSHealth() {
    // ZFS pool health - would need custom exporter for full details
    // For now, show a simple indicator
    this.setMetric('zfs-health', 'ONLINE', '', 'good');
    this.setMetricBar('zfs-health', 100, 'good');
  }

  async updateUptime() {
    const result = await this.prometheusQuery('node_time_seconds - node_boot_time_seconds');
    if (result.length > 0) {
      const uptimeSeconds = parseFloat(result[0].value[1]);
      const days = Math.floor(uptimeSeconds / 86400);
      const hours = Math.floor((uptimeSeconds % 86400) / 3600);
      
      this.setMetric('system-uptime', `${days}d ${hours}h`, '', 'good');
      this.setMetricBar('system-uptime', 100, 'good');
    }
  }

  async updateServiceCount() {
    const result = await this.prometheusQuery('count(up == 1)');
    if (result.length > 0) {
      const upCount = parseInt(result[0].value[1]);
      this.setMetric('service-count', upCount, 'UP', upCount >= 8 ? 'good' : 'warning');
      this.setMetricBar('service-count', Math.min(upCount * 12.5, 100), upCount >= 8 ? 'good' : 'warning');
    }
  }

  async initServiceStatus() {
    // Add real-time status indicators to service cards
    const serviceConfigs = [
      { name: 'grafana', url: 'http://192.168.0.99:3000/api/health' },
      { name: 'prometheus', url: 'http://192.168.0.99:9090/-/healthy' },
      { name: 'cadvisor', url: 'http://192.168.0.99:8082/healthz' },
      { name: 'filebrowser', url: 'http://192.168.0.99:8080/health' },
      { name: 'plex', url: 'http://192.168.0.99:32400/web' }
    ];

    // Add status indicators to existing service cards
    document.querySelectorAll('.media-left figure').forEach((figure, index) => {
      if (index < serviceConfigs.length) {
        const statusIndicator = document.createElement('div');
        statusIndicator.className = 'service-status unknown';
        statusIndicator.id = `${serviceConfigs[index].name}-status`;
        figure.appendChild(statusIndicator);
      }
    });

    // Start monitoring service health
    this.monitorServices(serviceConfigs);
  }

  async monitorServices(configs) {
    const checkService = async (config) => {
      try {
        const response = await fetch(config.url, { 
          method: 'HEAD',
          mode: 'no-cors',
          timeout: 5000 
        });
        return 'online';
      } catch (error) {
        return 'offline';
      }
    };

    setInterval(async () => {
      for (const config of configs) {
        const status = await checkService(config);
        const indicator = document.getElementById(`${config.name}-status`);
        if (indicator) {
          indicator.className = `service-status ${status}`;
        }
      }
    }, 30000); // Check every 30 seconds
  }

  setMetric(id, value, unit, type) {
    const valueElement = document.getElementById(`${id}-value`);
    const unitElement = valueElement?.nextElementSibling;
    
    if (valueElement) {
      valueElement.textContent = value;
      if (unitElement && unit) {
        unitElement.textContent = unit;
      }
    }

    this.metrics.set(id, { value, unit, type });
  }

  setMetricBar(id, percentage, type) {
    const bar = document.getElementById(`${id}-bar`);
    if (bar) {
      bar.style.width = `${percentage}%`;
      bar.className = `metric-bar ${type}`;
    }
  }

  getLoadStatus(load) {
    if (load < 1.0) return 'good';
    if (load < 2.0) return 'warning';
    return 'critical';
  }

  getUsageStatus(percentage) {
    if (percentage < 70) return 'good';
    if (percentage < 90) return 'warning';
    return 'critical';
  }

  updateSystemStatus() {
    const metrics = Array.from(this.metrics.values());
    const criticalCount = metrics.filter(m => m.type === 'critical').length;
    const warningCount = metrics.filter(m => m.type === 'warning').length;

    let overallStatus = 'good';
    if (criticalCount > 0) overallStatus = 'critical';
    else if (warningCount > 0) overallStatus = 'warning';

    this.setSystemStatus(overallStatus);
  }

  setSystemStatus(status) {
    const indicators = ['system-status', 'services-status', 'storage-status'];
    indicators.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.className = `status-indicator ${status}`;
      }
    });
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure Homer has loaded
  setTimeout(() => {
    window.homeLab = new HomeLab();
  }, 1000);
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'h' && e.ctrlKey) {
    e.preventDefault();
    const healthDashboard = document.querySelector('.health-dashboard');
    if (healthDashboard) {
      healthDashboard.scrollIntoView({ behavior: 'smooth' });
    }
  }
});

// Add service quick access
document.addEventListener('keydown', (e) => {
  const serviceKeys = {
    'g': 'grafana',
    'p': 'prometheus', 
    'f': 'filebrowser',
    'm': 'plex'
  };

  if (e.altKey && serviceKeys[e.key]) {
    e.preventDefault();
    const serviceName = serviceKeys[e.key];
    const serviceCard = document.querySelector(`[href*="${serviceName}"], [href*="3000"], [href*="9090"], [href*="8080"], [href*="32400"]`);
    if (serviceCard) {
      serviceCard.click();
    }
  }
});

console.log('🎮 Homer Health Dashboard script loaded - Ready for retro monitoring!');