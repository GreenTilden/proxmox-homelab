<template>
  <div class="sidebar-container" :class="{ 'sidebar-collapsed': isCollapsed, 'sidebar-mobile-open': isMobileOpen }">
    <!-- Sidebar Header -->
    <div class="sidebar-header">
      <div class="brand-section" v-if="!isCollapsed">
        <div class="brand-icon">🏠</div>
        <div class="brand-text">
          <h1 class="brand-title">LCiBot</h1>
          <p class="brand-subtitle">Homelab Control</p>
        </div>
      </div>
      <div class="brand-icon-only" v-else>🏠</div>

      <button @click="toggleSidebar" class="collapse-button">
        <ChevronLeft v-if="!isCollapsed" class="w-4 h-4" />
        <ChevronRight v-else class="w-4 h-4" />
      </button>
    </div>

    <!-- Navigation Categories -->
    <nav class="sidebar-nav">
      <div v-for="category in navigationCategories" :key="category.id" class="nav-category">
        <!-- Category Header -->
        <button
          @click="toggleCategory(category.id)"
          class="category-header"
          :class="{ 'category-collapsed': !category.isExpanded }"
        >
          <div class="category-info">
            <component :is="category.icon" class="category-icon" />
            <span v-if="!isCollapsed" class="category-title">{{ category.name }}</span>
          </div>
          <div v-if="!isCollapsed" class="category-controls">
            <div class="category-status" :class="getCategoryStatusClass(category)">
              {{ getCategoryStatusCount(category) }}
            </div>
            <ChevronDown
              class="category-chevron"
              :class="{ 'category-chevron-expanded': category.isExpanded }"
            />
          </div>
        </button>

        <!-- Category Items -->
        <div
          v-if="category.isExpanded || isCollapsed"
          class="category-items"
          :class="{ 'category-items-collapsed': isCollapsed }"
        >
          <button
            v-for="item in category.items"
            :key="item.id"
            @click="selectNavItem(item)"
            class="nav-item"
            :class="{
              'nav-item-active': activeItem === item.id,
              'nav-item-collapsed': isCollapsed
            }"
            :title="isCollapsed ? item.name : ''"
          >
            <div class="nav-item-icon">
              <component :is="item.icon" class="w-4 h-4" />
              <div class="status-dot" :class="getItemStatusClass(item)"></div>
            </div>
            <div v-if="!isCollapsed" class="nav-item-content">
              <span class="nav-item-name">{{ item.name }}</span>
              <span v-if="item.subtitle" class="nav-item-subtitle">{{ item.subtitle }}</span>
            </div>
            <div v-if="!isCollapsed && item.action" class="nav-item-action">
              <ExternalLink class="w-3 h-3" />
            </div>
          </button>
        </div>
      </div>
    </nav>

    <!-- Footer Actions -->
    <div class="sidebar-footer">
      <button
        @click="refreshAll"
        :disabled="isRefreshing"
        class="footer-button"
        :title="isCollapsed ? 'Refresh All' : ''"
      >
        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isRefreshing }" />
        <span v-if="!isCollapsed">Refresh All</span>
      </button>

      <button
        @click="openSettings"
        class="footer-button"
        :title="isCollapsed ? 'Settings' : ''"
      >
        <Settings class="w-4 h-4" />
        <span v-if="!isCollapsed">Settings</span>
      </button>
    </div>

    <!-- Mobile Overlay -->
    <div
      v-if="isMobileOpen"
      class="mobile-overlay"
      @click="closeMobileSidebar"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  RefreshCw,
  Settings,
  Monitor,
  Activity,
  Server,
  Database,
  Play,
  Download,
  Folder,
  TrendingUp,
  Shield,
  Cpu,
  HardDrive,
  Network
} from 'lucide-vue-next'

// Props and Emits
interface NavItem {
  id: string
  name: string
  subtitle?: string
  icon: any
  status: 'online' | 'offline' | 'checking' | 'unknown'
  action?: 'external' | 'internal'
  url?: string
}

interface NavCategory {
  id: string
  name: string
  icon: any
  isExpanded: boolean
  items: NavItem[]
}

const emit = defineEmits<{
  itemSelected: [item: NavItem]
  refreshAll: []
  openSettings: []
}>()

// Reactive State
const isCollapsed = ref(false)
const isMobileOpen = ref(false)
const isRefreshing = ref(false)
const activeItem = ref('overview')

// Navigation Structure
const navigationCategories = ref<NavCategory[]>([
  {
    id: 'overview',
    name: 'Overview',
    icon: Monitor,
    isExpanded: true,
    items: [
      {
        id: 'dashboard',
        name: 'Dashboard',
        subtitle: 'System Overview',
        icon: Monitor,
        status: 'online',
        action: 'internal'
      },
      {
        id: 'system-metrics',
        name: 'System Metrics',
        subtitle: 'Performance',
        icon: Activity,
        status: 'online',
        action: 'internal'
      }
    ]
  },
  {
    id: 'services',
    name: 'Services',
    icon: Server,
    isExpanded: true,
    items: [
      {
        id: 'proxmox',
        name: 'Proxmox VE',
        subtitle: 'Virtualization',
        icon: Server,
        status: 'checking',
        action: 'external',
        url: 'https://192.168.0.99:8006'
      },
      {
        id: 'plex',
        name: 'Plex Media',
        subtitle: 'Streaming',
        icon: Play,
        status: 'checking',
        action: 'external',
        url: 'http://192.168.0.99:32400'
      },
      {
        id: 'deluge',
        name: 'Deluge',
        subtitle: 'Downloads',
        icon: Download,
        status: 'checking',
        action: 'external',
        url: 'http://192.168.0.111:8112'
      },
      {
        id: 'firefox',
        name: 'Firefox Browser',
        subtitle: 'Secure Browsing',
        icon: Shield,
        status: 'checking',
        action: 'external',
        url: 'http://192.168.0.99:3001'
      },
      {
        id: 'filebrowser',
        name: 'File Browser',
        subtitle: 'File Management',
        icon: Folder,
        status: 'checking',
        action: 'external',
        url: 'http://192.168.0.99:8080'
      }
    ]
  },
  {
    id: 'monitoring',
    name: 'Monitoring',
    icon: TrendingUp,
    isExpanded: false,
    items: [
      {
        id: 'grafana',
        name: 'Grafana',
        subtitle: 'Dashboards',
        icon: TrendingUp,
        status: 'checking',
        action: 'external',
        url: 'http://192.168.0.99:3000'
      },
      {
        id: 'prometheus',
        name: 'Prometheus',
        subtitle: 'Metrics',
        icon: Database,
        status: 'checking',
        action: 'external',
        url: 'http://192.168.0.99:9090'
      }
    ]
  },
  {
    id: 'system',
    name: 'System Control',
    icon: Cpu,
    isExpanded: false,
    items: [
      {
        id: 'storage',
        name: 'Storage Pools',
        subtitle: 'ZFS Management',
        icon: HardDrive,
        status: 'unknown',
        action: 'internal'
      },
      {
        id: 'network',
        name: 'Network',
        subtitle: 'Configuration',
        icon: Network,
        status: 'unknown',
        action: 'internal'
      },
      {
        id: 'containers',
        name: 'Containers',
        subtitle: 'LXC Management',
        icon: Server,
        status: 'unknown',
        action: 'internal'
      }
    ]
  }
])

// Computed Properties
const totalOnlineServices = computed(() => {
  return navigationCategories.value
    .flatMap(cat => cat.items)
    .filter(item => item.status === 'online').length
})

const totalServices = computed(() => {
  return navigationCategories.value
    .flatMap(cat => cat.items)
    .filter(item => item.action === 'external').length
})

// Methods
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  if (isCollapsed.value) {
    // Expand all categories when collapsed for icon visibility
    navigationCategories.value.forEach(cat => {
      cat.isExpanded = true
    })
  }
}

const toggleCategory = (categoryId: string) => {
  if (isCollapsed.value) {
    // In collapsed mode, don't toggle categories
    return
  }

  const category = navigationCategories.value.find(cat => cat.id === categoryId)
  if (category) {
    category.isExpanded = !category.isExpanded
  }
}

const selectNavItem = (item: NavItem) => {
  activeItem.value = item.id
  emit('itemSelected', item)

  if (isMobileOpen.value) {
    closeMobileSidebar()
  }
}

const refreshAll = () => {
  isRefreshing.value = true
  emit('refreshAll')

  // Simulate refresh completion
  setTimeout(() => {
    isRefreshing.value = false
  }, 2000)
}

const openSettings = () => {
  emit('openSettings')
}

const closeMobileSidebar = () => {
  isMobileOpen.value = false
}

const getCategoryStatusClass = (category: NavCategory) => {
  const onlineCount = category.items.filter(item => item.status === 'online').length
  const totalCount = category.items.length

  if (onlineCount === totalCount) return 'status-all-online'
  if (onlineCount > 0) return 'status-partial-online'
  return 'status-offline'
}

const getCategoryStatusCount = (category: NavCategory) => {
  const onlineCount = category.items.filter(item => item.status === 'online').length
  const totalCount = category.items.length
  return `${onlineCount}/${totalCount}`
}

const getItemStatusClass = (item: NavItem) => {
  return {
    'status-online': item.status === 'online',
    'status-offline': item.status === 'offline',
    'status-checking': item.status === 'checking',
    'status-unknown': item.status === 'unknown'
  }
}

// Mobile detection
const checkMobile = () => {
  const isMobile = window.innerWidth < 768
  if (isMobile && !isCollapsed.value) {
    isCollapsed.value = true
  }
}

// Lifecycle
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

// Watch for responsive changes
watch(() => window.innerWidth, () => {
  checkMobile()
})
</script>

<style scoped>
.sidebar-container {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 280px;
  background: linear-gradient(135deg,
    rgba(var(--lakoba-surface-rgb, 22, 33, 62), 0.95),
    rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.02)
  );
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.sidebar-collapsed {
  width: 80px;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 100px;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-icon, .brand-icon-only {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--lakoba-primary), var(--lakoba-secondary));
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.2);
}

.brand-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--lakoba-text);
  margin: 0;
}

.brand-subtitle {
  font-size: 0.75rem;
  color: var(--lakoba-text-muted);
  margin: 0;
  opacity: 0.8;
}

.collapse-button {
  padding: 0.5rem;
  border: 1px solid rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.2);
  border-radius: 6px;
  background: rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.05);
  color: var(--lakoba-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.collapse-button:hover {
  background: rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.1);
  border-color: rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.3);
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.nav-category {
  margin-bottom: 0.5rem;
}

.category-header {
  width: 100%;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  border: none;
  color: var(--lakoba-text);
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 0;
}

.category-header:hover {
  background: rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.05);
}

.category-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--lakoba-primary);
}

.category-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--lakoba-text);
}

.category-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.category-status {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.625rem;
  font-weight: 500;
}

.status-all-online {
  background: rgba(34, 197, 94, 0.1);
  color: rgb(34, 197, 94);
}

.status-partial-online {
  background: rgba(245, 158, 11, 0.1);
  color: rgb(245, 158, 11);
}

.status-offline {
  background: rgba(239, 68, 68, 0.1);
  color: rgb(239, 68, 68);
}

.category-chevron {
  width: 1rem;
  height: 1rem;
  transition: transform 0.2s ease;
  color: var(--lakoba-text-muted);
}

.category-chevron-expanded {
  transform: rotate(180deg);
}

.category-items {
  padding-left: 0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.category-items-collapsed {
  padding-left: 0;
}

.nav-item {
  width: 100%;
  padding: 0.75rem 1.5rem 0.75rem 3rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: transparent;
  border: none;
  color: var(--lakoba-text);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  position: relative;
}

.nav-item-collapsed {
  padding: 0.75rem 1.5rem;
  justify-content: center;
}

.nav-item:hover {
  background: rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.05);
}

.nav-item-active {
  background: rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.1);
  border-right: 3px solid var(--lakoba-primary);
}

.nav-item-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid rgba(var(--lakoba-surface-rgb, 22, 33, 62), 1);
}

.status-dot.status-online {
  background: rgb(34, 197, 94);
}

.status-dot.status-offline {
  background: rgb(239, 68, 68);
}

.status-dot.status-checking {
  background: rgb(245, 158, 11);
  animation: pulse 2s infinite;
}

.status-dot.status-unknown {
  background: rgb(156, 163, 175);
}

.nav-item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.nav-item-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--lakoba-text);
}

.nav-item-subtitle {
  font-size: 0.75rem;
  color: var(--lakoba-text-muted);
  opacity: 0.7;
}

.nav-item-action {
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.nav-item:hover .nav-item-action {
  opacity: 1;
}

.sidebar-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.2);
  border-radius: 6px;
  background: rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.05);
  color: var(--lakoba-text);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  justify-content: center;
}

.footer-button:hover {
  background: rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.1);
  border-color: rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.3);
}

.footer-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Mobile Styles */
@media (max-width: 768px) {
  .sidebar-container {
    transform: translateX(-100%);
  }

  .sidebar-mobile-open {
    transform: translateX(0);
  }

  .mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
}

/* Hide scrollbar but keep functionality */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.2);
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.3);
}
</style>