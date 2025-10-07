<template>
  <aside class="app-sidebar" :class="{ 'sidebar-collapsed': collapsed }">
    <!-- Sidebar Header -->
    <div class="sidebar-header">
      <div class="sidebar-brand">
        <div class="brand-icon">🏠</div>
        <div class="brand-text" v-if="!collapsed">
          <div class="brand-title">LCiBot</div>
          <div class="brand-subtitle">Homelab</div>
        </div>
      </div>
      <button @click="toggleSidebar" class="sidebar-toggle">
        <Menu class="w-4 h-4" />
      </button>
    </div>

    <!-- Navigation Menu -->
    <nav class="sidebar-nav">
      <div class="nav-section">
        <div class="nav-section-title" v-if="!collapsed">Dashboard</div>
        <ul class="nav-list">
          <li class="nav-item">
            <a
              href="#"
              @click.prevent="$emit('navigate', 'services')"
              class="nav-link"
              :class="{ active: activeTab === 'services' }"
            >
              <Monitor class="nav-icon" />
              <span class="nav-text" v-if="!collapsed">Services</span>
            </a>
          </li>
          <li class="nav-item">
            <a
              href="#"
              @click.prevent="$emit('navigate', 'monitoring')"
              class="nav-link"
              :class="{ active: activeTab === 'monitoring' }"
            >
              <Activity class="nav-icon" />
              <span class="nav-text" v-if="!collapsed">System Monitor</span>
            </a>
          </li>
        </ul>
      </div>

      <div class="nav-section">
        <div class="nav-section-title" v-if="!collapsed">Services</div>
        <ul class="nav-list">
          <li class="nav-item">
            <a href="https://192.168.0.99:8006" target="_blank" class="nav-link">
              <Server class="nav-icon" />
              <span class="nav-text" v-if="!collapsed">Proxmox</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="http://192.168.0.99:3000" target="_blank" class="nav-link">
              <TrendingUp class="nav-icon" />
              <span class="nav-text" v-if="!collapsed">Grafana</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="http://192.168.0.99:32400" target="_blank" class="nav-link">
              <Play class="nav-icon" />
              <span class="nav-text" v-if="!collapsed">Plex</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="http://192.168.0.111:8112" target="_blank" class="nav-link">
              <Download class="nav-icon" />
              <span class="nav-text" v-if="!collapsed">Deluge</span>
            </a>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Sidebar Footer -->
    <div class="sidebar-footer" v-if="!collapsed">
      <div class="footer-info">
        <div class="text-xs opacity-60">Last Update</div>
        <div class="text-xs font-medium">{{ new Date().toLocaleTimeString() }}</div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Monitor, Activity, Server, TrendingUp, Play, Download, Menu } from 'lucide-vue-next'

interface Props {
  activeTab: string
}

const props = defineProps<Props>()

const collapsed = ref(false)

const toggleSidebar = () => {
  collapsed.value = !collapsed.value
}

defineEmits<{
  navigate: [tab: string]
}>()
</script>

<style scoped>
.app-sidebar {
  @apply card-base;
  width: 280px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background: linear-gradient(180deg,
    rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.03),
    rgba(var(--lakoba-surface-rgb, 22, 33, 62), 0.8)
  );
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.2);
  box-shadow: var(--shadow-xl);
  transition: all var(--transition-normal);
  z-index: 1000;
  overflow-y: auto;
}

.app-sidebar.sidebar-collapsed {
  width: 72px;
}

.sidebar-header {
  @apply flex items-center justify-between;
  padding: var(--space-6);
  border-bottom: 1px solid rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.1);
}

.sidebar-brand {
  @apply flex items-center;
  gap: var(--space-3);
}

.brand-icon {
  width: 2.5rem;
  height: 2.5rem;
  @apply flex items-center justify-center rounded-xl;
  background: linear-gradient(135deg, var(--lakoba-primary), var(--lakoba-secondary));
  font-size: 1.25rem;
  box-shadow: var(--shadow-md);
}

.brand-text {
  @apply flex flex-col;
}

.brand-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--lakoba-text);
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 0.75rem;
  color: var(--lakoba-text-muted);
  font-weight: 500;
}

.sidebar-toggle {
  @apply icon-container;
  padding: var(--space-2);
  background: rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.1);
  border: 1px solid rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.2);
}

.sidebar-nav {
  padding: var(--space-4) 0;
}

.nav-section {
  margin-bottom: var(--space-6);
}

.nav-section-title {
  padding: 0 var(--space-6) var(--space-2);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--lakoba-text-muted);
}

.nav-list {
  @apply space-y-1;
  padding: 0 var(--space-3);
}

.nav-item {
  @apply list-none;
}

.nav-link {
  @apply flex items-center w-full;
  padding: var(--space-3) var(--space-3);
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
  color: var(--lakoba-text-muted);
  text-decoration: none;
  gap: var(--space-3);
}

.nav-link:hover {
  background: rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.1);
  color: var(--lakoba-text);
  transform: translateX(4px);
}

.nav-link.active {
  background: linear-gradient(135deg,
    rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.2),
    rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.1)
  );
  color: var(--lakoba-primary);
  border: 1px solid rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.3);
  box-shadow: var(--shadow-sm);
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

.sidebar-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.1);
  background: rgba(var(--lakoba-surface-rgb, 22, 33, 62), 0.8);
}

.footer-info {
  @apply text-center;
  color: var(--lakoba-text-muted);
}

/* Responsive */
@media (max-width: 1024px) {
  .app-sidebar {
    transform: translateX(-100%);
  }

  .app-sidebar.sidebar-open {
    transform: translateX(0);
  }
}
</style>