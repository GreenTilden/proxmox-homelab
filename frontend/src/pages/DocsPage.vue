<template>
  <div class="docs-page">
    <header class="docs-header">
      <router-link to="/" class="back-link">
        <span>&larr;</span> Dashboard
      </router-link>
      <h1 class="docs-title">Homelab Documentation</h1>
      <div class="sync-status">
        <span class="sync-icon">🔄</span>
        <span class="sync-text">Obsidian Sync Active</span>
      </div>
    </header>

    <div class="docs-content">
      <aside class="docs-sidebar">
        <h3 class="sidebar-title">Quick Links</h3>
        <nav class="docs-nav">
          <a href="#services" class="nav-link active">Services</a>
          <a href="#infrastructure" class="nav-link">Infrastructure</a>
          <a href="#credentials" class="nav-link">Credentials</a>
          <a href="#smarthome" class="nav-link">Smart Home</a>
          <a href="#development" class="nav-link">Development</a>
        </nav>

        <div class="sync-info">
          <h4>Obsidian Sync</h4>
          <p>Server: 192.168.0.250:5984</p>
          <p>Database: obsidian-vault</p>
          <a :href="couchDbUrl" target="_blank" class="admin-link">
            CouchDB Admin
          </a>
        </div>
      </aside>

      <main class="docs-main">
        <section id="services" class="doc-section">
          <h2>Services</h2>
          <div class="service-grid">
            <a v-for="service in services" :key="service.name" :href="service.url" target="_blank" class="service-card">
              <span class="service-icon">{{ service.icon }}</span>
              <span class="service-name">{{ service.name }}</span>
              <span class="service-desc">{{ service.desc }}</span>
            </a>
          </div>
        </section>

        <section id="infrastructure" class="doc-section">
          <h2>Infrastructure</h2>
          <div class="info-cards">
            <div class="info-card">
              <h3>LXC 100 - Frontend</h3>
              <p><strong>IP:</strong> 192.168.0.250</p>
              <ul>
                <li>Nginx (Vue dashboard)</li>
                <li>WeatherStar 4000+</li>
                <li>CouchDB (Obsidian sync)</li>
                <li>Code Server</li>
              </ul>
            </div>
            <div class="info-card">
              <h3>Proxmox Host</h3>
              <p><strong>IP:</strong> 192.168.0.99</p>
              <ul>
                <li>Home Assistant (Docker)</li>
                <li>Prometheus + Exporters</li>
                <li>Plex Media Server</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="credentials" class="doc-section">
          <h2>Credentials</h2>
          <div class="cred-list">
            <div class="cred-item">
              <span class="cred-service">Home Assistant</span>
              <span class="cred-user">darney</span>
              <span class="cred-pass">V23satchmo4685</span>
            </div>
            <div class="cred-item">
              <span class="cred-service">Obsidian Sync</span>
              <span class="cred-user">obsidian</span>
              <span class="cred-pass">sync-password-2024</span>
            </div>
            <div class="cred-item">
              <span class="cred-service">CouchDB Admin</span>
              <span class="cred-user">admin</span>
              <span class="cred-pass">obsidian-admin-2024</span>
            </div>
          </div>
        </section>

        <section id="smarthome" class="doc-section">
          <h2>Smart Home</h2>
          <div class="info-cards">
            <div class="info-card">
              <h3>Cync Lights</h3>
              <ul>
                <li>Above Desk, Shower Light, Balloon</li>
                <li>Basement Lights 1-8</li>
                <li>Library Lights 1-2</li>
              </ul>
            </div>
            <div class="info-card">
              <h3>Weather Automations</h3>
              <ul>
                <li><strong>Ambient Lighting:</strong> Syncs to weather</li>
                <li><strong>Rain Flicker:</strong> Lightning effects</li>
              </ul>
            </div>
            <div class="info-card">
              <h3>Google Cast Devices</h3>
              <ul>
                <li>Living Room TV & Speaker</li>
                <li>Basement TV</li>
                <li>Kitchen Display (Nest Hub)</li>
                <li>Bedroom Display</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="development" class="doc-section">
          <h2>Development Workflow</h2>
          <div class="workflow-steps">
            <div class="step">
              <span class="step-num">1</span>
              <span class="step-text">Open Code Server at <a href="http://192.168.0.250:8081" target="_blank">192.168.0.250:8081</a></span>
            </div>
            <div class="step">
              <span class="step-num">2</span>
              <span class="step-text">Edit files in <code>/var/www/vue-frontend/src/</code></span>
            </div>
            <div class="step">
              <span class="step-num">3</span>
              <span class="step-text">Run <code>npm run build</code> in terminal</span>
            </div>
            <div class="step">
              <span class="step-num">4</span>
              <span class="step-text">View changes at <a href="http://192.168.0.250" target="_blank">192.168.0.250</a></span>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const couchDbUrl = computed(() => 'http://192.168.0.250:5984/_utils/')

const services = [
  { name: 'Dashboard', icon: '🖥️', desc: 'Main Vue Dashboard', url: 'http://192.168.0.250' },
  { name: 'Weather', icon: '🌤️', desc: 'Weather Command Center', url: 'http://192.168.0.250/weather' },
  { name: 'Home Assistant', icon: '🏠', desc: 'Smart Home', url: 'http://192.168.0.99:8123' },
  { name: 'Kiosk', icon: '📱', desc: 'HA Kiosk Dashboard', url: 'http://192.168.0.99:8123/kiosk' },
  { name: 'Code Server', icon: '💻', desc: 'VS Code in Browser', url: 'http://192.168.0.250:8081' },
  { name: 'Proxmox', icon: '🖧', desc: 'Virtualization', url: 'https://192.168.0.99:8006' },
  { name: 'Plex', icon: '🎬', desc: 'Media Streaming', url: 'http://192.168.0.99:32400' },
  { name: 'qBittorrent', icon: '📥', desc: 'Torrent Client', url: 'http://192.168.0.111:8112' },
  { name: 'WeatherStar', icon: '📺', desc: 'Retro Weather', url: 'http://192.168.0.250:8082' },
  { name: 'CouchDB', icon: '🗄️', desc: 'Obsidian Sync', url: 'http://192.168.0.250:5984/_utils/' },
  { name: 'Nanit', icon: '👶', desc: 'Baby Monitor', url: 'http://192.168.0.99:8123/lovelace/kiosk' },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.docs-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%);
  color: #c9d1d9;
  font-family: 'Segoe UI', sans-serif;
}

.docs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(22, 27, 34, 0.95);
  border-bottom: 2px solid #30363d;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-link {
  color: #58a6ff;
  text-decoration: none;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.6rem;
  padding: 0.5rem 1rem;
  border: 2px solid #58a6ff;
  border-radius: 4px;
  transition: all 0.2s;
}

.back-link:hover {
  background: #58a6ff;
  color: #0d1117;
}

.docs-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.9rem;
  color: #58a6ff;
  margin: 0;
}

.sync-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #3fb950;
  font-size: 0.8rem;
}

.sync-icon {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.docs-content {
  display: flex;
  min-height: calc(100vh - 60px);
}

.docs-sidebar {
  width: 250px;
  background: rgba(22, 27, 34, 0.8);
  padding: 1.5rem;
  border-right: 1px solid #30363d;
  position: sticky;
  top: 60px;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.sidebar-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.6rem;
  color: #8b949e;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
}

.docs-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.nav-link {
  color: #8b949e;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.nav-link:hover, .nav-link.active {
  background: rgba(88, 166, 255, 0.1);
  color: #58a6ff;
}

.sync-info {
  background: rgba(48, 54, 61, 0.5);
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
}

.sync-info h4 {
  margin: 0 0 0.5rem 0;
  color: #58a6ff;
  font-size: 0.75rem;
}

.sync-info p {
  margin: 0.25rem 0;
  color: #8b949e;
}

.admin-link {
  display: inline-block;
  margin-top: 0.5rem;
  color: #58a6ff;
  text-decoration: none;
  font-size: 0.75rem;
}

.admin-link:hover {
  text-decoration: underline;
}

.docs-main {
  flex: 1;
  padding: 2rem;
  max-width: 1000px;
}

.doc-section {
  margin-bottom: 3rem;
}

.doc-section h2 {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.8rem;
  color: #58a6ff;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #30363d;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.service-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.25rem;
  background: rgba(48, 54, 61, 0.4);
  border: 1px solid #30363d;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s;
}

.service-card:hover {
  background: rgba(88, 166, 255, 0.1);
  border-color: #58a6ff;
  transform: translateY(-2px);
}

.service-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.service-name {
  color: #c9d1d9;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.service-desc {
  color: #8b949e;
  font-size: 0.75rem;
  text-align: center;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.info-card {
  background: rgba(48, 54, 61, 0.4);
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 1.25rem;
}

.info-card h3 {
  color: #58a6ff;
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
}

.info-card p {
  margin: 0.25rem 0;
  color: #8b949e;
}

.info-card ul {
  margin: 0.5rem 0 0 0;
  padding-left: 1.25rem;
  color: #c9d1d9;
}

.info-card li {
  margin: 0.25rem 0;
}

.cred-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cred-item {
  display: grid;
  grid-template-columns: 150px 120px 1fr;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(48, 54, 61, 0.4);
  border: 1px solid #30363d;
  border-radius: 6px;
  font-family: monospace;
}

.cred-service {
  color: #58a6ff;
  font-weight: 600;
}

.cred-user {
  color: #8b949e;
}

.cred-pass {
  color: #3fb950;
}

.workflow-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(48, 54, 61, 0.4);
  border: 1px solid #30363d;
  border-radius: 8px;
}

.step-num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #58a6ff;
  color: #0d1117;
  border-radius: 50%;
  font-weight: bold;
}

.step-text {
  color: #c9d1d9;
}

.step-text a {
  color: #58a6ff;
}

.step-text code {
  background: rgba(88, 166, 255, 0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  color: #58a6ff;
}

@media (max-width: 768px) {
  .docs-content {
    flex-direction: column;
  }

  .docs-sidebar {
    width: 100%;
    height: auto;
    position: static;
  }

  .docs-nav {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .cred-item {
    grid-template-columns: 1fr;
  }
}
</style>
