/**
 * Homer Dashboard Advanced Health Monitoring
 * Synchronized with LCiBot Dashboard health checking
 */

class HomerHealthMonitor {
  constructor() {
    this.services = [
      { name: 'LCiBot Dashboard', url: 'http://192.168.0.99:8091', critical: true },
      { name: 'Grafana', url: 'http://192.168.0.99:3000', critical: true },
      { name: 'Prometheus', url: 'http://192.168.0.99:9090', critical: true },
      { name: 'FileBrowser', url: 'http://192.168.0.99:8080', critical: false },
      { name: 'Portainer', url: 'http://192.168.0.99:9000', critical: false },
      { name: 'Firefox', url: 'http://192.168.0.99:3001', critical: false },
      { name: 'ChatBot UI', url: 'http://192.168.0.99:3002', critical: false },
      { name: 'PostgreSQL', url: 'http://192.168.0.99:5433', critical: false },
      { name: 'Plex', url: 'http://192.168.0.99:32400', critical: false },
      { name: 'Deluge', url: 'http://192.168.0.111:8112', critical: false },
      { name: 'Node Exporter', url: 'http://192.168.0.99:9100', critical: false },
      { name: 'cAdvisor', url: 'http://192.168.0.99:8082', critical: false }
    ];

    this.healthStatus = new Map();
    this.refreshInterval = 30000; // 30 seconds
    this.timeout = 5000; // 5 seconds
    this.retries = 3;

    this.init();
  }

  init() {
    console.log('🎮 Homer Health Monitor initializing...');
    this.addHealthIndicators();
    this.setupKeyboardShortcuts();
    this.startMonitoring();
    this.setupSearchFunctionality();
  }

  addHealthIndicators() {
    // Add health status indicators to service cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      const title = card.querySelector('.title');
      if (title) {
        const statusIndicator = document.createElement('div');
        statusIndicator.className = 'service-status unknown';
        statusIndicator.title = 'Service status: Unknown';
        card.querySelector('.card-content').appendChild(statusIndicator);
      }
    });
  }

  async checkServiceHealth(service) {
    const startTime = performance.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(service.url, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors'
      });

      clearTimeout(timeoutId);
      const responseTime = Math.round(performance.now() - startTime);

      return {
        status: 'healthy',
        responseTime,
        timestamp: new Date()
      };
    } catch (error) {
      const responseTime = Math.round(performance.now() - startTime);

      if (error.name === 'AbortError') {
        return {
          status: 'timeout',
          responseTime,
          error: 'Request timeout',
          timestamp: new Date()
        };
      }

      return {
        status: 'error',
        responseTime,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  async monitorServices() {
    console.log('🔍 Checking service health...');

    const healthChecks = this.services.map(async service => {
      const health = await this.checkServiceHealth(service);
      this.healthStatus.set(service.name, { ...service, ...health });
      return { service, health };
    });

    const results = await Promise.all(healthChecks);
    this.updateHealthIndicators(results);
    this.updateSystemStatus();
  }

  updateHealthIndicators(results) {
    results.forEach(({ service, health }) => {
      const card = this.findServiceCard(service.name);
      if (card) {
        const indicator = card.querySelector('.service-status');
        if (indicator) {
          // Remove existing status classes
          indicator.classList.remove('healthy', 'warning', 'error', 'unknown');

          // Add new status class
          if (health.status === 'healthy') {
            indicator.classList.add('healthy');
            indicator.title = `✅ ${service.name}: Online (${health.responseTime}ms)`;
          } else if (health.status === 'timeout') {
            indicator.classList.add('warning');
            indicator.title = `⚠️ ${service.name}: Timeout (${health.responseTime}ms)`;
          } else {
            indicator.classList.add('error');
            indicator.title = `❌ ${service.name}: Offline (${health.error})`;
          }
        }
      }
    });
  }

  findServiceCard(serviceName) {
    const cards = document.querySelectorAll('.card');
    return Array.from(cards).find(card => {
      const title = card.querySelector('.title');
      return title && title.textContent.toLowerCase().includes(serviceName.toLowerCase());
    });
  }

  updateSystemStatus() {
    const healthyServices = Array.from(this.healthStatus.values())
      .filter(service => service.status === 'healthy').length;

    const totalServices = this.services.length;
    const healthPercentage = Math.round((healthyServices / totalServices) * 100);

    // Update page title with health status
    document.title = `🎮 Homelab (${healthyServices}/${totalServices}) - ${healthPercentage}%`;

    // Update message banner if it exists
    const message = document.querySelector('.message .message-body');
    if (message) {
      const criticalServices = Array.from(this.healthStatus.values())
        .filter(service => service.critical && service.status !== 'healthy');

      if (criticalServices.length > 0) {
        message.innerHTML = `⚠️ ${criticalServices.length} critical service(s) offline | Total: ${healthyServices}/${totalServices} services healthy`;
        message.parentElement.classList.add('is-warning');
        message.parentElement.classList.remove('is-success', 'is-danger');
      } else if (healthPercentage === 100) {
        message.innerHTML = `✅ All ${totalServices} services operational | System health: Excellent`;
        message.parentElement.classList.add('is-success');
        message.parentElement.classList.remove('is-warning', 'is-danger');
      } else if (healthPercentage >= 80) {
        message.innerHTML = `🟡 ${healthyServices}/${totalServices} services healthy | System health: Good`;
        message.parentElement.classList.add('is-warning');
        message.parentElement.classList.remove('is-success', 'is-danger');
      } else {
        message.innerHTML = `🔴 ${healthyServices}/${totalServices} services healthy | System health: Poor`;
        message.parentElement.classList.add('is-danger');
        message.parentElement.classList.remove('is-success', 'is-warning');
      }
    }
  }

  setupKeyboardShortcuts() {
    const shortcuts = {
      'Alt+L': 'http://192.168.0.99:8091',  // LCiBot Dashboard
      'Alt+G': 'http://192.168.0.99:3000',  // Grafana
      'Alt+P': 'http://192.168.0.99:9090',  // Prometheus
      'Alt+A': 'http://192.168.0.99:3002',  // AI ChatBot
      'Alt+F': 'http://192.168.0.99:8080',  // FileBrowser
      'Alt+M': 'http://192.168.0.99:32400', // Plex Media
      'Alt+R': 'refresh'                    // Refresh health checks
    };

    let shortcutIndicator = null;
    let hideTimeout = null;

    document.addEventListener('keydown', (event) => {
      const key = event.key;
      const shortcut = `${event.altKey ? 'Alt+' : ''}${key.toUpperCase()}`;

      if (shortcuts[shortcut]) {
        event.preventDefault();

        if (shortcut === 'Alt+R') {
          this.monitorServices();
          this.showNotification('🔄 Refreshing service health checks...');
        } else {
          window.open(shortcuts[shortcut], '_blank');
          this.showNotification(`🚀 Opening ${shortcut} service...`);
        }
      }

      // Show keyboard shortcuts on Alt key
      if (event.altKey && !shortcutIndicator) {
        shortcutIndicator = this.createShortcutIndicator(shortcuts);
        document.body.appendChild(shortcutIndicator);

        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
          if (shortcutIndicator) {
            shortcutIndicator.remove();
            shortcutIndicator = null;
          }
        }, 3000);
      }
    });

    document.addEventListener('keyup', (event) => {
      if (!event.altKey && shortcutIndicator) {
        clearTimeout(hideTimeout);
        shortcutIndicator.remove();
        shortcutIndicator = null;
      }
    });
  }

  createShortcutIndicator(shortcuts) {
    const indicator = document.createElement('div');
    indicator.className = 'keyboard-shortcuts visible';

    const shortcutList = Object.entries(shortcuts)
      .map(([key, url]) => {
        const label = key === 'Alt+R' ? 'Refresh' :
                     key === 'Alt+L' ? 'LCiBot' :
                     key === 'Alt+G' ? 'Grafana' :
                     key === 'Alt+P' ? 'Prometheus' :
                     key === 'Alt+A' ? 'AI Chat' :
                     key === 'Alt+F' ? 'Files' :
                     key === 'Alt+M' ? 'Plex' : key;
        return `<div><kbd>${key}</kbd> ${label}</div>`;
      })
      .join('');

    indicator.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 0.5rem;">⌨️ Keyboard Shortcuts</div>
      ${shortcutList}
    `;

    return indicator;
  }

  setupSearchFunctionality() {
    // Add search bar if it doesn't exist
    let searchBar = document.querySelector('.search-bar');
    if (!searchBar) {
      searchBar = document.createElement('input');
      searchBar.type = 'text';
      searchBar.className = 'search-bar';
      searchBar.placeholder = '🔍 Search services... (Press / to focus)';

      const header = document.querySelector('.first-line');
      if (header) {
        header.appendChild(searchBar);
      }
    }

    // Search functionality
    searchBar.addEventListener('input', (event) => {
      const query = event.target.value.toLowerCase();
      this.filterServices(query);
    });

    // Focus search with '/' key
    document.addEventListener('keydown', (event) => {
      if (event.key === '/' && !event.target.matches('input')) {
        event.preventDefault();
        searchBar.focus();
      }
    });
  }

  filterServices(query) {
    const cards = document.querySelectorAll('.card');
    const groups = document.querySelectorAll('.group');

    cards.forEach(card => {
      const title = card.querySelector('.title').textContent.toLowerCase();
      const subtitle = card.querySelector('.subtitle')?.textContent.toLowerCase() || '';
      const tags = Array.from(card.querySelectorAll('.tag'))
        .map(tag => tag.textContent.toLowerCase()).join(' ');

      const matches = title.includes(query) ||
                     subtitle.includes(query) ||
                     tags.includes(query);

      card.style.display = matches ? 'block' : 'none';
    });

    // Hide/show groups based on visible cards
    groups.forEach(group => {
      const visibleCards = group.querySelectorAll('.card[style*="block"], .card:not([style])');
      group.style.display = visibleCards.length > 0 ? 'block' : 'none';
    });
  }

  showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(107, 70, 193, 0.95);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      font-weight: 500;
      backdrop-filter: blur(8px);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  startMonitoring() {
    // Initial health check
    this.monitorServices();

    // Set up interval monitoring
    setInterval(() => {
      this.monitorServices();
    }, this.refreshInterval);

    console.log(`🎮 Health monitoring started (${this.refreshInterval/1000}s interval)`);
  }

  getHealthSummary() {
    const summary = {
      total: this.services.length,
      healthy: 0,
      warning: 0,
      error: 0,
      critical_offline: 0
    };

    this.healthStatus.forEach(service => {
      switch (service.status) {
        case 'healthy':
          summary.healthy++;
          break;
        case 'timeout':
          summary.warning++;
          break;
        case 'error':
          summary.error++;
          if (service.critical) {
            summary.critical_offline++;
          }
          break;
      }
    });

    return summary;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.homerHealth = new HomerHealthMonitor();
});

// Expose health monitor for debugging
window.getHealthSummary = () => window.homerHealth?.getHealthSummary();
window.checkService = (serviceName) => {
  const service = window.homerHealth?.services.find(s =>
    s.name.toLowerCase().includes(serviceName.toLowerCase())
  );
  return service ? window.homerHealth?.checkServiceHealth(service) : null;
};

console.log('🎮 Homer Advanced Health Monitor loaded');