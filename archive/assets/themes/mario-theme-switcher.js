/**
 * Mario Theme Switcher for Multi-Dashboard Homelab
 * Compatible with Homer, Heimdall, Homarr, and other dashboard solutions
 * Inspired by Vue.js theme switching patterns
 */

class MarioThemeSwitcher {
  constructor(options = {}) {
    this.storageKey = options.storageKey || 'mario-homelab-theme';
    this.defaultTheme = options.defaultTheme || 'jehkoba16';
    this.syncKey = options.syncKey || 'mario-theme-sync';
    this.debug = options.debug || false;
    
    // Available themes based on Lospec Mario palettes
    this.themes = {
      'jehkoba16': {
        name: 'Jehkoba16',
        description: 'Classic NES-style 16-color Mario palette',
        category: 'retro',
        colors: {
          primary: '#FF004D',
          secondary: '#29ADFF', 
          success: '#00E436',
          warning: '#FFEC27',
          background: '#1D2B53'
        }
      },
      'mario-paint': {
        name: 'Mario Paint',
        description: 'SNES Mario Paint creative studio palette',
        category: 'creative',
        colors: {
          primary: '#D82800',
          secondary: '#0040FF',
          success: '#00A800', 
          warning: '#FFFF00',
          background: '#F8F8F8'
        }
      },
      'italy-4': {
        name: 'Italy-4',
        description: 'Minimal 4-color versatile Mario palette',
        category: 'minimal',
        colors: {
          primary: '#B55088',
          secondary: '#68386C',
          success: '#F8E2CF',
          warning: '#B55088', 
          background: '#0F0F23'
        }
      },
      'game-boy': {
        name: 'Game Boy',
        description: 'SMM2 Superball Game Boy monochrome',
        category: 'monochrome',
        colors: {
          primary: '#9BBD0F',
          secondary: '#8BAC0F',
          success: '#8BAC0F',
          warning: '#9BBD0F',
          background: '#0F380F'
        }
      }
    };
    
    this.currentTheme = this.loadTheme();
    this.init();
  }
  
  /**
   * Initialize the theme switcher
   */
  init() {
    this.log('Initializing Mario Theme Switcher');
    
    // Apply saved theme
    this.applyTheme(this.currentTheme);
    
    // Set up cross-tab synchronization
    this.setupSyncListener();
    
    // Create theme switcher UI if not exists
    this.createThemeSwitcherUI();
    
    // Detect dashboard type and apply specific integrations
    this.detectAndIntegrateDashboard();
    
    // Set up accessibility features
    this.setupAccessibility();
    
    this.log('Mario Theme Switcher initialized successfully');
  }
  
  /**
   * Detect current dashboard and apply specific integration
   */
  detectAndIntegrateDashboard() {
    const dashboardType = this.detectDashboardType();
    this.log(`Detected dashboard type: ${dashboardType}`);
    
    switch (dashboardType) {
      case 'homer':
        this.integrateWithHomer();
        break;
      case 'heimdall':
        this.integrateWithHeimdall();
        break;
      case 'homarr':
        this.integrateWithHomarr();
        break;
      case 'grafana':
        this.integrateWithGrafana();
        break;
      default:
        this.integrateGeneric();
    }
  }
  
  /**
   * Detect which dashboard we're running on
   */
  detectDashboardType() {
    // Check for specific dashboard indicators
    if (document.querySelector('#homer-dashboard, .homer')) return 'homer';
    if (document.querySelector('.heimdall, [class*="heimdall"]')) return 'heimdall';
    if (document.querySelector('.homarr, [data-app="homarr"]')) return 'homarr';
    if (document.querySelector('.grafana-app, [ng-app="grafana"]')) return 'grafana';
    
    // Check URL patterns
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    
    if (pathname.includes('grafana') || hostname.includes('grafana')) return 'grafana';
    if (document.title.toLowerCase().includes('homer')) return 'homer';
    if (document.title.toLowerCase().includes('heimdall')) return 'heimdall';
    if (document.title.toLowerCase().includes('homarr')) return 'homarr';
    
    return 'generic';
  }
  
  /**
   * Apply theme to the document
   */
  applyTheme(themeName) {
    const theme = this.themes[themeName];
    if (!theme) {
      this.log(`Theme ${themeName} not found, using default`, 'warn');
      themeName = this.defaultTheme;
    }
    
    this.log(`Applying theme: ${themeName}`);
    
    // Set theme data attribute on document root
    document.documentElement.setAttribute('data-mario-theme', themeName);
    
    // Update body class for additional styling hooks
    document.body.classList.remove(...Object.keys(this.themes).map(t => `mario-theme-${t}`));
    document.body.classList.add(`mario-theme-${themeName}`);
    
    // Fire custom event for other components to listen to
    const themeEvent = new CustomEvent('marioThemeChanged', {
      detail: { 
        theme: themeName, 
        colors: theme.colors,
        previous: this.currentTheme 
      }
    });
    document.dispatchEvent(themeEvent);
    
    // Update current theme
    this.currentTheme = themeName;
    
    // Save to storage
    this.saveTheme(themeName);
    
    // Sync across tabs
    this.syncTheme(themeName);
    
    // Update theme switcher UI
    this.updateThemeSwitcherUI();
    
    // Apply dashboard-specific styling
    this.applyDashboardSpecificStyling(themeName);
  }
  
  /**
   * Create theme switcher UI
   */
  createThemeSwitcherUI() {
    // Check if already exists
    if (document.getElementById('mario-theme-switcher')) return;
    
    const switcher = document.createElement('div');
    switcher.id = 'mario-theme-switcher';
    switcher.className = 'mario-theme-switcher';
    
    switcher.innerHTML = `
      <div class="mario-theme-switcher-toggle" title="Mario Theme Switcher">
        🎮
      </div>
      <div class="mario-theme-switcher-panel">
        <h3>🎮 Mario Themes</h3>
        <div class="mario-theme-options">
          ${Object.entries(this.themes).map(([key, theme]) => `
            <div class="mario-theme-option ${key === this.currentTheme ? 'active' : ''}" 
                 data-theme="${key}">
              <div class="mario-theme-preview" style="background: ${theme.colors.background}">
                <div class="mario-theme-colors">
                  <span style="background: ${theme.colors.primary}"></span>
                  <span style="background: ${theme.colors.secondary}"></span>
                  <span style="background: ${theme.colors.success}"></span>
                  <span style="background: ${theme.colors.warning}"></span>
                </div>
              </div>
              <div class="mario-theme-info">
                <strong>${theme.name}</strong>
                <small>${theme.description}</small>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="mario-theme-actions">
          <button class="mario-button mario-theme-random" title="Random Theme">🎲</button>
          <button class="mario-button mario-theme-auto" title="Auto Switch">⏰</button>
          <button class="mario-button mario-theme-sync" title="Sync Across Dashboards">🔄</button>
        </div>
      </div>
    `;
    
    // Add CSS styles
    this.addThemeSwitcherStyles();
    
    // Add event listeners
    this.setupThemeSwitcherEvents(switcher);
    
    // Append to body
    document.body.appendChild(switcher);
    
    this.log('Theme switcher UI created');
  }
  
  /**
   * Add CSS styles for theme switcher
   */
  addThemeSwitcherStyles() {
    if (document.getElementById('mario-theme-switcher-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'mario-theme-switcher-styles';
    styles.textContent = `
      .mario-theme-switcher {
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 10000;
        font-family: 'Courier New', monospace;
      }
      
      .mario-theme-switcher-toggle {
        width: 48px;
        height: 48px;
        background: var(--card-bg);
        border: 2px solid var(--card-border);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
      }
      
      .mario-theme-switcher-toggle:hover {
        transform: scale(1.1) rotate(15deg);
        box-shadow: 0 0 20px var(--glow-primary);
        border-color: var(--accent-gaming);
      }
      
      .mario-theme-switcher-panel {
        position: absolute;
        top: 60px;
        left: 0;
        width: 320px;
        background: var(--card-bg);
        border: 2px solid var(--card-border);
        border-radius: 12px;
        padding: 1rem;
        backdrop-filter: blur(20px);
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      }
      
      .mario-theme-switcher.open .mario-theme-switcher-panel {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
      
      .mario-theme-switcher h3 {
        margin: 0 0 1rem 0;
        color: var(--text-primary);
        text-align: center;
        font-size: 1.1rem;
      }
      
      .mario-theme-option {
        display: flex;
        align-items: center;
        padding: 0.75rem;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-bottom: 0.5rem;
        border: 2px solid transparent;
      }
      
      .mario-theme-option:hover {
        background: var(--card-bg-hover);
        border-color: var(--card-border);
      }
      
      .mario-theme-option.active {
        background: var(--service-bg);
        border-color: var(--service-accent);
        box-shadow: 0 0 12px var(--service-glow);
      }
      
      .mario-theme-preview {
        width: 40px;
        height: 40px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 0.75rem;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .mario-theme-colors {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2px;
        width: 24px;
        height: 24px;
      }
      
      .mario-theme-colors span {
        border-radius: 2px;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }
      
      .mario-theme-info strong {
        color: var(--text-primary);
        display: block;
        font-size: 0.9rem;
      }
      
      .mario-theme-info small {
        color: var(--text-secondary);
        font-size: 0.75rem;
      }
      
      .mario-theme-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
        justify-content: center;
      }
      
      .mario-theme-actions .mario-button {
        padding: 0.5rem;
        min-width: 40px;
        font-size: 1rem;
      }
      
      @media (max-width: 768px) {
        .mario-theme-switcher-panel {
          width: calc(100vw - 40px);
          left: -20px;
        }
      }
    `;
    
    document.head.appendChild(styles);
  }
  
  /**
   * Set up event listeners for theme switcher
   */
  setupThemeSwitcherEvents(switcher) {
    const toggle = switcher.querySelector('.mario-theme-switcher-toggle');
    const panel = switcher.querySelector('.mario-theme-switcher-panel');
    const options = switcher.querySelectorAll('.mario-theme-option');
    const randomBtn = switcher.querySelector('.mario-theme-random');
    const autoBtn = switcher.querySelector('.mario-theme-auto');
    const syncBtn = switcher.querySelector('.mario-theme-sync');
    
    // Toggle panel
    toggle.addEventListener('click', () => {
      switcher.classList.toggle('open');
    });
    
    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (!switcher.contains(e.target)) {
        switcher.classList.remove('open');
      }
    });
    
    // Theme selection
    options.forEach(option => {
      option.addEventListener('click', () => {
        const themeName = option.getAttribute('data-theme');
        this.applyTheme(themeName);
        switcher.classList.remove('open');
      });
    });
    
    // Random theme
    randomBtn.addEventListener('click', () => {
      const themeNames = Object.keys(this.themes);
      const randomTheme = themeNames[Math.floor(Math.random() * themeNames.length)];
      this.applyTheme(randomTheme);
    });
    
    // Auto theme switching (time-based)
    autoBtn.addEventListener('click', () => {
      this.toggleAutoTheme();
    });
    
    // Sync across dashboards
    syncBtn.addEventListener('click', () => {
      this.syncTheme(this.currentTheme, true);
      this.showNotification('Theme synced across dashboards! 🎮');
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        switcher.classList.toggle('open');
      }
    });
  }
  
  /**
   * Dashboard-specific integrations
   */
  integrateWithHomer() {
    this.log('Integrating with Homer dashboard');
    document.body.classList.add('mario-homer-integration');
    
    // Wait for Homer to load
    const checkHomer = () => {
      const cards = document.querySelectorAll('.card');
      if (cards.length > 0) {
        cards.forEach(card => {
          card.classList.add('mario-card');
          
          // Add service category based on service name or URL
          const serviceLink = card.querySelector('a[href]');
          if (serviceLink) {
            const category = this.detectServiceCategory(serviceLink.href, serviceLink.textContent);
            card.setAttribute('data-service-category', category);
            card.classList.add(`service-${category}`);
          }
        });
        
        // Enhance icons
        const icons = document.querySelectorAll('.media-left img, .logo');
        icons.forEach(icon => {
          icon.classList.add('mario-icon');
        });
      } else {
        setTimeout(checkHomer, 500);
      }
    };
    
    checkHomer();
  }
  
  integrateWithHeimdall() {
    this.log('Integrating with Heimdall dashboard');
    document.body.classList.add('mario-heimdall-integration');
    
    // Heimdall integration logic
    const items = document.querySelectorAll('.item');
    items.forEach(item => {
      item.classList.add('mario-card');
    });
  }
  
  integrateWithHomarr() {
    this.log('Integrating with Homarr dashboard');
    document.body.classList.add('mario-homarr-integration');
    
    // Homarr integration logic
    const widgets = document.querySelectorAll('.widget, .service-tile');
    widgets.forEach(widget => {
      widget.classList.add('mario-card');
    });
  }
  
  integrateWithGrafana() {
    this.log('Integrating with Grafana (preserving existing theme)');
    document.body.classList.add('mario-grafana-integration');
    
    // Minimal Grafana integration - preserve existing 16-bit theme
    // Just coordinate colors with Mario palette
  }
  
  integrateGeneric() {
    this.log('Applying generic Mario theme integration');
    document.body.classList.add('mario-generic-integration');
  }
  
  /**
   * Detect service category based on URL or name
   */
  detectServiceCategory(url, name) {
    const lowerUrl = url.toLowerCase();
    const lowerName = name.toLowerCase();
    
    // Gaming
    if (lowerUrl.includes('game') || lowerName.includes('game') || 
        lowerName.includes('arcade') || lowerName.includes('retro')) {
      return 'gaming';
    }
    
    // Media
    if (lowerUrl.includes('plex') || lowerUrl.includes('media') || 
        lowerUrl.includes('deluge') || lowerUrl.includes('torrent') ||
        lowerName.includes('plex') || lowerName.includes('media')) {
      return 'media';
    }
    
    // Infrastructure
    if (lowerUrl.includes('grafana') || lowerUrl.includes('prometheus') ||
        lowerUrl.includes('proxmox') || lowerUrl.includes('file') ||
        lowerName.includes('monitor') || lowerName.includes('server')) {
      return 'infrastructure';
    }
    
    // Development
    if (lowerUrl.includes('code') || lowerUrl.includes('git') ||
        lowerUrl.includes('firefox') || lowerName.includes('browser') ||
        lowerName.includes('development')) {
      return 'development';
    }
    
    // Science
    if (lowerName.includes('research') || lowerName.includes('lab') ||
        lowerName.includes('science') || lowerName.includes('analysis')) {
      return 'science';
    }
    
    return 'gaming'; // Default to gaming category
  }
  
  /**
   * Storage and synchronization methods
   */
  loadTheme() {
    try {
      return localStorage.getItem(this.storageKey) || this.defaultTheme;
    } catch (e) {
      this.log('Failed to load theme from storage', 'warn');
      return this.defaultTheme;
    }
  }
  
  saveTheme(themeName) {
    try {
      localStorage.setItem(this.storageKey, themeName);
    } catch (e) {
      this.log('Failed to save theme to storage', 'warn');
    }
  }
  
  syncTheme(themeName, force = false) {
    try {
      const syncData = {
        theme: themeName,
        timestamp: Date.now(),
        force: force
      };
      localStorage.setItem(this.syncKey, JSON.stringify(syncData));
    } catch (e) {
      this.log('Failed to sync theme', 'warn');
    }
  }
  
  setupSyncListener() {
    window.addEventListener('storage', (e) => {
      if (e.key === this.syncKey && e.newValue) {
        try {
          const syncData = JSON.parse(e.newValue);
          if (syncData.theme && syncData.theme !== this.currentTheme) {
            this.log(`Syncing theme from another tab: ${syncData.theme}`);
            this.applyTheme(syncData.theme);
          }
        } catch (err) {
          this.log('Failed to parse sync data', 'warn');
        }
      }
    });
  }
  
  /**
   * Utility methods
   */
  updateThemeSwitcherUI() {
    const switcher = document.getElementById('mario-theme-switcher');
    if (switcher) {
      const options = switcher.querySelectorAll('.mario-theme-option');
      options.forEach(option => {
        const themeName = option.getAttribute('data-theme');
        option.classList.toggle('active', themeName === this.currentTheme);
      });
    }
  }
  
  showNotification(message, duration = 3000) {
    const notification = document.createElement('div');
    notification.className = 'mario-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--card-bg);
      color: var(--text-primary);
      padding: 1rem 1.5rem;
      border-radius: 8px;
      border: 2px solid var(--accent-gaming);
      box-shadow: 0 0 20px var(--glow-primary);
      z-index: 10001;
      font-family: 'Courier New', monospace;
      backdrop-filter: blur(20px);
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }
  
  setupAccessibility() {
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.shiftKey) {
        switch (e.key) {
          case '1':
            this.applyTheme('jehkoba16');
            break;
          case '2':
            this.applyTheme('mario-paint');
            break;
          case '3':
            this.applyTheme('italy-4');
            break;
          case '4':
            this.applyTheme('game-boy');
            break;
        }
      }
    });
  }
  
  log(message, level = 'info') {
    if (this.debug) {
      console[level](`[Mario Theme Switcher] ${message}`);
    }
  }
  
  /**
   * Public API methods
   */
  getThemes() {
    return this.themes;
  }
  
  getCurrentTheme() {
    return this.currentTheme;
  }
  
  setTheme(themeName) {
    this.applyTheme(themeName);
  }
  
  toggleTheme() {
    const themeNames = Object.keys(this.themes);
    const currentIndex = themeNames.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    this.applyTheme(themeNames[nextIndex]);
  }
  
  destroy() {
    // Clean up event listeners and UI
    const switcher = document.getElementById('mario-theme-switcher');
    if (switcher) {
      switcher.remove();
    }
    
    const styles = document.getElementById('mario-theme-switcher-styles');
    if (styles) {
      styles.remove();
    }
  }
}

// Auto-initialize if DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if theme switcher should be initialized
  const shouldInit = !document.querySelector('[data-mario-theme-disabled]');
  
  if (shouldInit) {
    window.marioThemeSwitcher = new MarioThemeSwitcher({
      debug: document.location.hostname === 'localhost' || document.location.hostname.includes('192.168')
    });
    
    // Add CSS animations
    const animationStyles = document.createElement('style');
    animationStyles.textContent = `
      @keyframes slideIn {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
      
      @keyframes slideOut {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
      }
    `;
    document.head.appendChild(animationStyles);
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MarioThemeSwitcher;
}