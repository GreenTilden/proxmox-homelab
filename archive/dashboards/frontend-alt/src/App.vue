<template>
  <div id="app" class="retro-app">
    <!-- Fixed Sidebar -->
    <aside class="retro-sidebar">
      <div class="sidebar-header">
        <div class="sidebar-brand">
          <div class="brand-icon">🏠</div>
          <div class="brand-text">
            <div class="brand-title">Proxmox</div>
            <div class="brand-subtitle">Homelab</div>
          </div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li>
            <a href="#" @click.prevent="activeView = 'dashboard'"
               class="retro-nav-item" :class="{ active: activeView === 'dashboard' }">
              <Monitor class="nav-icon" />
              <span class="nav-text">Dashboard</span>
            </a>
          </li>
          <li>
            <a href="#" @click.prevent="activeView = 'services'"
               class="retro-nav-item" :class="{ active: activeView === 'services' }">
              <Server class="nav-icon" />
              <span class="nav-text">Services</span>
            </a>
          </li>
          <li>
            <a href="#" @click.prevent="activeView = 'monitoring'"
               class="retro-nav-item" :class="{ active: activeView === 'monitoring' }">
              <Activity class="nav-icon" />
              <span class="nav-text">Monitoring</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content">
      <!-- Simple Mobile Header (no hamburger) -->
      <header class="mobile-header md:hidden">
        <div class="mobile-title">
          <span class="retro-text-primary font-semibold">Proxmox Homelab</span>
        </div>
        <div class="mobile-status">
          <div :class="systemStatusClass" class="status-indicator">
            {{ systemStatusText }}
          </div>
        </div>
      </header>

      <!-- Content Views -->
      <div class="content-container">
        <!-- Dashboard View -->
        <div v-if="activeView === 'dashboard'" class="view-content">
          <h1 class="retro-text-primary text-3xl font-bold mb-6">🏠 Proxmox Homelab Dashboard</h1>

          <div class="retro-card mb-6">
            <h2 class="retro-text-secondary text-xl font-semibold mb-4">System Status</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="retro-status-success p-4 rounded-lg">
                <div class="font-semibold">✅ System Health</div>
                <div class="text-sm opacity-75">All services operational</div>
              </div>
              <div class="retro-status-info p-4 rounded-lg">
                <div class="font-semibold">📊 Monitoring</div>
                <div class="text-sm opacity-75">Grafana + Prometheus active</div>
              </div>
              <div class="retro-status-success p-4 rounded-lg">
                <div class="font-semibold">🎬 Media Server</div>
                <div class="text-sm opacity-75">Plex streaming ready</div>
              </div>
            </div>
          </div>

          <div class="retro-card">
            <h2 class="retro-text-secondary text-xl font-semibold mb-4">Jehkoba64 Retro Styling Test</h2>
            <div class="space-y-4">
              <button class="retro-btn">Primary Action</button>
              <div class="retro-text-muted">This demonstrates the retro gaming aesthetic!</div>
            </div>
          </div>
        </div>

        <!-- Services View -->
        <div v-if="activeView === 'services'" class="view-content">
          <h1 class="retro-text-primary text-3xl font-bold mb-6">🛠️ Services Management</h1>
          <div class="retro-card">
            <p class="retro-text-secondary">Service management interface coming soon...</p>
          </div>
        </div>

        <!-- Monitoring View -->
        <div v-if="activeView === 'monitoring'" class="view-content">
          <h1 class="retro-text-primary text-3xl font-bold mb-6">📊 System Monitoring</h1>
          <div class="retro-card">
            <p class="retro-text-secondary">Monitoring dashboard coming soon...</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Monitor, Server, Activity } from 'lucide-vue-next'

// Navigation State
const activeView = ref('dashboard')

// System Status (will be connected to real monitoring later)
const systemHealth = ref<'healthy' | 'warning' | 'error'>('healthy')

// Computed Properties
const systemStatusClass = computed(() => {
  switch (systemHealth.value) {
    case 'healthy': return 'retro-status-success'
    case 'warning': return 'retro-status-warning'
    case 'error': return 'retro-status-error'
    default: return 'retro-status-info'
  }
})

const systemStatusText = computed(() => {
  switch (systemHealth.value) {
    case 'healthy': return '✅ Online'
    case 'warning': return '⚠️ Warning'
    case 'error': return '❌ Error'
    default: return '🔍 Checking'
  }
})
</script>

<style scoped>
.retro-app {
  @apply min-h-screen;
  background: var(--retro-dark-base);
  display: flex;
  font-family: var(--retro-font-primary);
}

.main-content {
  flex: 1;
  margin-left: 280px;
  min-height: 100vh;
}

.mobile-header {
  @apply flex items-center justify-between;
  padding: var(--retro-space-md);
  background: var(--retro-dark-surface);
  border-bottom: 2px solid var(--retro-border-light);
}


.mobile-title {
  @apply flex-1 text-center;
}

.mobile-status {
  @apply flex items-center;
}

.status-indicator {
  @apply px-2 py-1 rounded text-xs font-medium;
  border-radius: var(--retro-radius-sm);
}

.content-container {
  @apply p-6;
  background: var(--retro-dark-base);
  min-height: calc(100vh - 64px);
}

.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(5, 14, 26, 0.8);
  z-index: 40;
  backdrop-filter: blur(4px);
}

/* Desktop Responsive */
@media (min-width: 768px) {
  .main-content {
    margin-left: 280px;
  }

  .main-content.sidebar-collapsed {
    margin-left: 72px;
  }

  .content-container {
    @apply p-8;
    min-height: 100vh;
  }
}

/* Tablet Responsive */
@media (max-width: 1023px) and (min-width: 768px) {
  .content-container {
    @apply p-6;
  }
}

/* Sidebar Styles */
.retro-sidebar {
  width: 280px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background: linear-gradient(180deg, var(--retro-dark-surface), var(--retro-dark-accent));
  border-right: 2px solid var(--retro-border-bright);
  box-shadow: 4px 0 20px var(--retro-shadow-dark);
  transition: var(--retro-transition-normal);
  z-index: 1000;
  overflow-y: auto;
}


.sidebar-header {
  @apply flex items-center justify-between;
  padding: var(--retro-space-lg);
  border-bottom: 1px solid var(--retro-border-light);
}

.sidebar-brand {
  @apply flex items-center;
  gap: var(--retro-space-md);
}

.brand-icon {
  width: 2.5rem;
  height: 2.5rem;
  @apply flex items-center justify-center rounded-xl;
  background: linear-gradient(135deg, var(--retro-primary-blue), var(--retro-accent-pink));
  font-size: 1.25rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.brand-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--retro-text-primary);
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 0.75rem;
  color: var(--retro-text-muted);
  font-weight: 500;
}


.sidebar-nav {
  padding: var(--retro-space-lg) 0;
}

.nav-list {
  @apply list-none;
  padding: 0 var(--retro-space-md);
  margin: 0;
}

.nav-list li {
  margin: var(--retro-space-xs) 0;
}

.nav-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.nav-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.view-content {
  animation: retro-slide-in 0.3s ease-out;
}

/* Mobile Responsive */
@media (max-width: 767px) {
  .retro-sidebar {
    transform: translateX(-100%);
    width: 280px; /* Full width on mobile when visible */
  }

  .retro-sidebar.collapsed {
    transform: translateX(-100%); /* Hidden when collapsed on mobile */
    width: 280px;
  }

  .retro-sidebar:not(.collapsed) {
    transform: translateX(0); /* Slide in when expanded on mobile */
  }

  .main-content {
    margin-left: 0;
  }

  .main-content.sidebar-collapsed {
    margin-left: 0;
  }

  .content-container {
    @apply p-4;
    min-height: calc(100vh - 64px);
  }

  /* Hide desktop collapse button on mobile */
  .sidebar-toggle {
    display: none !important;
  }
}
</style>