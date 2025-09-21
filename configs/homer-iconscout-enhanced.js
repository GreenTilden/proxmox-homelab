// Homer Dashboard Iconscout Enhanced Integration
// Provides dynamic icon loading, fallbacks, and 16-bit aesthetic enhancements

class IconscoutManager {
  constructor() {
    this.iconPath = 'assets/iconscout-icons/';
    this.fallbackIcon = 'fas fa-cube';
    this.categories = ['gaming', 'media', 'science', 'development', 'infrastructure'];
    this.loadedIcons = new Set();
    this.failedIcons = new Set();
    
    this.init();
  }
  
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeIcons());
    } else {
      this.initializeIcons();
    }
    
    // Add global error handler for failed icon loads
    window.addEventListener('error', (e) => this.handleIconError(e), true);
    
    // Initialize gaming aesthetic enhancements
    this.initGamingEnhancements();
  }
  
  initializeIcons() {
    console.log('🎮 Initializing Iconscout 16-Bit Icon System...');
    
    // Find all cards and enhance with icon functionality
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => this.enhanceCard(card));
    
    // Add category data attributes for styling
    this.addCategoryAttributes();
    
    // Initialize icon preloading
    this.preloadCriticalIcons();
    
    console.log(`✅ Enhanced ${cards.length} service cards with 16-bit icon system`);
  }
  
  enhanceCard(card) {
    const logoImg = card.querySelector('.media-left img');
    const serviceLink = card.querySelector('a[href]');
    
    if (logoImg && logoImg.src.includes('iconscout-icons')) {
      // Add loading state
      logoImg.classList.add('icon-loading');
      
      // Enhance with gaming aesthetics
      logoImg.addEventListener('load', () => {
        logoImg.classList.remove('icon-loading');
        logoImg.classList.add('pixelated-icon');
        this.loadedIcons.add(logoImg.src);
      });
      
      // Handle loading errors
      logoImg.addEventListener('error', () => {
        this.handleIconLoadError(logoImg);
      });
    }
    
    // Add hover sound effect (optional, gaming aesthetic)
    if (serviceLink) {
      serviceLink.addEventListener('mouseenter', () => {
        this.playHoverSound();
      });
    }
  }
  
  handleIconLoadError(imgElement) {
    console.warn('⚠️ Failed to load icon:', imgElement.src);
    this.failedIcons.add(imgElement.src);
    
    // Create fallback icon
    const fallback = this.createFallbackIcon(imgElement);
    imgElement.parentNode.replaceChild(fallback, imgElement);
  }
  
  createFallbackIcon(originalImg) {
    const fallback = document.createElement('div');
    fallback.className = 'icon-fallback icon-error';
    fallback.style.width = '48px';
    fallback.style.height = '48px';
    fallback.title = `Icon failed to load: ${originalImg.alt || 'Service icon'}`;
    
    // Try to determine service type from URL or alt text
    const serviceType = this.guessServiceType(originalImg.src || originalImg.alt || '');
    fallback.innerHTML = this.getServiceEmoji(serviceType);
    
    return fallback;
  }
  
  guessServiceType(identifier) {
    const lower = identifier.toLowerCase();
    if (lower.includes('plex') || lower.includes('media')) return 'media';
    if (lower.includes('grafana') || lower.includes('prometheus')) return 'monitoring';
    if (lower.includes('browser') || lower.includes('firefox')) return 'browser';
    if (lower.includes('gaming') || lower.includes('arcade')) return 'gaming';
    if (lower.includes('code') || lower.includes('development')) return 'development';
    if (lower.includes('server') || lower.includes('infrastructure')) return 'infrastructure';
    return 'unknown';
  }
  
  getServiceEmoji(serviceType) {
    const emojis = {
      'media': '🎬',
      'monitoring': '📊',
      'browser': '🌐',
      'gaming': '🎮',
      'development': '💻',
      'infrastructure': '🔧',
      'unknown': '❓'
    };
    return emojis[serviceType] || emojis.unknown;
  }
  
  addCategoryAttributes() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      const logoSrc = card.querySelector('img')?.src || '';
      const category = this.extractCategory(logoSrc);
      if (category) {
        card.setAttribute('data-category', category);
      }
    });
  }
  
  extractCategory(iconPath) {
    for (const category of this.categories) {
      if (iconPath.includes(`/${category}/`)) {
        return category;
      }
    }
    return null;
  }
  
  preloadCriticalIcons() {
    // Preload commonly used icons for better performance
    const criticalIcons = [
      'infrastructure/infrastructure-grafana-dashboard.svg',
      'media/media-plex-streaming.svg',
      'infrastructure/infrastructure-proxmox-server.svg'
    ];
    
    criticalIcons.forEach(iconPath => {
      const img = new Image();
      img.src = this.iconPath + iconPath;
    });
  }
  
  initGamingEnhancements() {
    // Add 16-bit gaming visual effects
    this.addPixelatedCursor();
    this.initRetroSounds();
    this.addScreenScanlines();
  }
  
  addPixelatedCursor() {
    // Create custom 16-bit cursor
    const style = document.createElement('style');
    style.textContent = `
      .card:hover {
        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect x="0" y="0" width="16" height="16" fill="%23FF3366" opacity="0.8"/><rect x="4" y="4" width="8" height="8" fill="%2300FFFF"/></svg>'), auto;
      }
    `;
    document.head.appendChild(style);
  }
  
  initRetroSounds() {
    // Create audio context for retro sound effects (optional)
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.soundEnabled = true;
    } catch (e) {
      console.log('🔇 Audio context not available, sounds disabled');
      this.soundEnabled = false;
    }
  }
  
  playHoverSound() {
    if (!this.soundEnabled || !this.audioContext) return;
    
    // Generate a simple 16-bit style blip sound
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.value = 800; // 16-bit style frequency
      oscillator.type = 'square'; // Retro square wave
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.1);
    } catch (e) {
      // Silently fail if sound generation fails
    }
  }
  
  addScreenScanlines() {
    // Add subtle CRT scanlines effect for authentic retro feel
    const scanlines = document.createElement('div');
    scanlines.id = 'retro-scanlines';
    scanlines.innerHTML = `
      <style>
        #retro-scanlines {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1000;
          opacity: 0.03;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 255, 0.5) 2px,
            rgba(0, 255, 255, 0.5) 4px
          );
        }
        
        @media (max-width: 768px) {
          #retro-scanlines {
            display: none; /* Disable on mobile for performance */
          }
        }
      </style>
    `;
    document.body.appendChild(scanlines);
  }
  
  // Public API methods
  getIconStats() {
    return {
      loaded: this.loadedIcons.size,
      failed: this.failedIcons.size,
      categories: this.categories.length
    };
  }
  
  reloadFailedIcons() {
    console.log('🔄 Attempting to reload failed icons...');
    this.failedIcons.forEach(iconSrc => {
      const img = document.querySelector(`img[src="${iconSrc}"]`);
      if (img) {
        img.src = iconSrc + '?retry=' + Date.now();
      }
    });
    this.failedIcons.clear();
  }
}

// System Health Integration (from original config)
class SystemHealthMonitor {
  constructor() {
    this.init();
  }
  
  init() {
    this.fetchSystemHealth();
    setInterval(() => this.fetchSystemHealth(), 30000); // Every 30 seconds
  }
  
  async fetchSystemHealth() {
    try {
      const response = await fetch('/service-health.prom');
      if (response.ok) {
        const data = await response.text();
        this.updateHealthIndicators(data);
      }
    } catch (error) {
      console.log('ℹ️ System health data not available');
    }
  }
  
  updateHealthIndicators(healthData) {
    // Parse Prometheus metrics and update visual indicators
    const lines = healthData.split('\n');
    const services = {};
    
    lines.forEach(line => {
      if (line.startsWith('service_health')) {
        const match = line.match(/service_health{service="([^"]+)"} (\d+)/);
        if (match) {
          services[match[1]] = parseInt(match[2]);
        }
      }
    });
    
    // Update card visual states based on health
    Object.entries(services).forEach(([service, health]) => {
      const card = this.findServiceCard(service);
      if (card) {
        this.updateCardHealth(card, health);
      }
    });
  }
  
  findServiceCard(serviceName) {
    const links = document.querySelectorAll('a[href]');
    for (const link of links) {
      if (link.href.includes(serviceName) || 
          link.textContent.toLowerCase().includes(serviceName.toLowerCase())) {
        return link.closest('.card');
      }
    }
    return null;
  }
  
  updateCardHealth(card, health) {
    const healthIndicator = card.querySelector('.health-indicator') || 
                           this.createHealthIndicator(card);
    
    healthIndicator.className = `health-indicator ${health === 1 ? 'healthy' : 'unhealthy'}`;
    healthIndicator.title = health === 1 ? 'Service Online' : 'Service Offline';
  }
  
  createHealthIndicator(card) {
    const indicator = document.createElement('div');
    indicator.className = 'health-indicator';
    indicator.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.3);
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      .health-indicator.healthy {
        background: #00CC44;
        box-shadow: 0 0 8px rgba(0, 204, 68, 0.6);
      }
      .health-indicator.unhealthy {
        background: #FF4757;
        box-shadow: 0 0 8px rgba(255, 71, 87, 0.6);
      }
    `;
    document.head.appendChild(style);
    
    card.style.position = 'relative';
    card.appendChild(indicator);
    return indicator;
  }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎮 Starting Homer 16-Bit Gaming Dashboard...');
  
  // Initialize icon management
  window.iconscoutManager = new IconscoutManager();
  
  // Initialize system health monitoring
  window.healthMonitor = new SystemHealthMonitor();
  
  console.log('✅ 16-Bit Gaming Dashboard fully operational!');
});

// Export for console debugging
window.getIconStats = () => window.iconscoutManager?.getIconStats();
window.reloadFailedIcons = () => window.iconscoutManager?.reloadFailedIcons();