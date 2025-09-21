<template>
  <div id="app" class="app-container" :class="getThemeClass()">
    <!-- Sidebar Navigation -->
    <SidebarNavigation
      @item-selected="handleNavItemSelected"
      @refresh-all="handleRefreshAll"
      @open-settings="handleOpenSettings"
    />

    <!-- Main Content Area with Sidebar Offset -->
    <div class="main-content" :class="{ 'main-content-collapsed': isSidebarCollapsed }">
      <!-- Mobile Header (visible on mobile only) -->
      <header class="mobile-header md:hidden">
        <button @click="toggleMobileSidebar" class="mobile-menu-button">
          <Menu class="w-6 h-6" />
        </button>
        <div class="mobile-brand">
          <span class="mobile-brand-text">LCiBot Homelab</span>
        </div>
        <div class="mobile-status">
          <div class="status-indicator" :class="overallStatusClass">
            {{ overallStatusText }}
          </div>
        </div>
      </header>

      <!-- Content Area -->
      <main class="content-area">
        <!-- Overview/Dashboard Tab -->
        <div v-if="activeView === 'dashboard'" class="view-content">
          <div class="view-header">
            <h1 class="view-title">Dashboard Overview</h1>
            <p class="view-subtitle">Complete homelab system status and quick access</p>
          </div>

          <div class="dashboard-grid">
            <!-- Quick Stats -->
            <div class="quick-stats-card">
              <h3 class="stats-title">System Health</h3>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">Services Online</span>
                  <span class="stat-value">{{ onlineServicesCount }}/{{ totalServicesCount }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">System Status</span>
                  <span class="stat-value" :class="systemHealthClass">{{ systemHealthText }}</span>
                </div>
              </div>
            </div>

            <!-- Service Overview Grid -->
            <div class="services-overview">
              <ServiceHealthCard
                v-for="service in homelabServices"
                :key="service.id"
                :service="service"
                @refresh="refreshService"
                @open="openService"
              />
            </div>
          </div>
        </div>

        <!-- System Metrics Tab -->
        <div v-if="activeView === 'system-metrics'" class="view-content">
          <div class="view-header">
            <h1 class="view-title">System Metrics</h1>
            <p class="view-subtitle">Real-time system performance monitoring</p>
          </div>

          <div class="space-y-8">
            <SystemMetricsWidget />
            <ServiceHealthDashboard />
          </div>
        </div>

        <!-- External Service Views (handled by navigation) -->
        <div v-if="activeView === 'external-service'" class="view-content">
          <div class="external-service-notice">
            <div class="notice-icon">🔗</div>
            <h2 class="notice-title">External Service</h2>
            <p class="notice-description">
              {{ selectedExternalService?.name }} is opening in a new tab.
            </p>
            <button @click="activeView = 'dashboard'" class="return-button">
              Return to Dashboard
            </button>
          </div>
        </div>

        <!-- Card Styles Demo (preserved for reference) -->
        <div v-if="activeView === 'card-styles'" class="view-content">
          <div class="view-header">
            <h1 class="view-title">Card Style Options</h1>
            <p class="view-subtitle">
              Compare different card styling approaches for your dashboard.
            </p>
          </div>
          <CardStyleDemo />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Menu, Monitor, Activity, Play as VideoPlay, TrendingUp as TrendCharts, Download, Folder as FolderOpened, Smartphone } from 'lucide-vue-next'
import SidebarNavigation from './components/layout/SidebarNavigation.vue'
import ServiceHealthCard from './components/monitoring/ServiceHealthCard.vue'
import SystemMetricsWidget from './components/monitoring/SystemMetricsWidget.vue'
import ServiceHealthDashboard from './components/monitoring/ServiceHealthDashboard.vue'
import CardStyleDemo from './components/monitoring/CardStyleDemo.vue'

// Navigation State
const activeView = ref('dashboard')
const activeTab = ref('services')
const isMobile = ref(false)
const isSidebarCollapsed = ref(false)
const selectedExternalService = ref(null)

// Jehkoba8 Single Theme System - No Theme Switching
const currentTheme = ref('jehkoba8')

const themes = {
  jehkoba8: 'theme-jehkoba8'
}

// Navigation tabs
const navigationTabs = computed(() => {
  const baseTabs = [
    {
      id: 'services',
      label: 'Services',
      icon: Monitor
    },
    {
      id: 'monitoring',
      label: 'System Monitoring',
      icon: Activity
    },
    {
      id: 'card-styles',
      label: 'Card Styles',
      icon: VideoPlay
    }
  ]
  
  // Add mobile-specific tab for smaller screens
  if (isMobile.value) {
    baseTabs.push({
      id: 'mobile',
      label: 'Mobile Monitor',
      icon: Smartphone
    })
  }
  
  return baseTabs
})

// Mobile detection
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

const handleResize = () => {
  checkMobile()
  // Switch to services tab if mobile tab becomes unavailable
  if (!isMobile.value && activeTab.value === 'mobile') {
    activeTab.value = 'monitoring'
  }
}

const setTheme = () => {
  // Force Jehkoba8 theme only
  document.body.className = document.body.className.replace(/theme-\w+/g, '')
  document.body.classList.add('theme-jehkoba8')
}

const getThemeClass = () => {
  return 'theme-jehkoba8'
}

// Service health monitoring
const healthCheckInterval = ref<number | null>(null)
const lastHealthCheck = ref<Date>(new Date())

// Homelab Services with health monitoring
interface Service {
  id: string
  name: string
  description: string
  url: string
  icon: any
  status: 'online' | 'offline' | 'checking'
  healthEndpoint?: string
  lastChecked?: Date
  responseTime?: number
}

const homelabServices = ref<Service[]>([
  {
    id: 'proxmox',
    name: 'Proxmox VE',
    description: 'Virtualization Management',
    url: 'https://192.168.0.99:8006',
    icon: Monitor,
    status: 'checking',
    healthEndpoint: 'https://192.168.0.99:8006/api2/json/version'
  },
  {
    id: 'firefox',
    name: 'Firefox Browser',
    description: 'Secure Torrent Acquisition',
    url: 'http://192.168.0.99:3001',
    icon: Monitor,
    status: 'checking',
    healthEndpoint: 'http://192.168.0.99:3001'
  },
  {
    id: 'plex',
    name: 'Plex Media Server',
    description: 'Media Streaming Platform',
    url: 'http://192.168.0.99:32400',
    icon: VideoPlay,
    status: 'checking',
    healthEndpoint: 'http://192.168.0.99:32400/identity'
  },
  {
    id: 'grafana',
    name: 'Grafana Dashboard',
    description: 'Metrics Visualization',
    url: 'http://192.168.0.99:3000',
    icon: TrendCharts,
    status: 'checking',
    healthEndpoint: 'http://192.168.0.99:3000/api/health'
  },
  {
    id: 'deluge',
    name: 'Deluge Torrent Client',
    description: 'Download Management',
    url: 'http://192.168.0.111:8112',
    icon: Download,
    status: 'checking',
    healthEndpoint: 'http://192.168.0.111:8112/'
  },
  {
    id: 'filebrowser',
    name: 'File Browser',
    description: 'File Management Interface',
    url: 'http://192.168.0.99:8080',
    icon: FolderOpened,
    status: 'checking',
    healthEndpoint: 'http://192.168.0.99:8080/health'
  }
])

// Health monitoring functions
const checkServiceHealth = async (service: Service): Promise<void> => {
  if (!service.healthEndpoint) return
  
  const startTime = Date.now()
  service.status = 'checking'
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout
    
    const response = await fetch(service.healthEndpoint, {
      method: 'GET',
      signal: controller.signal,
      mode: 'no-cors', // Handle CORS for external services
    })
    
    clearTimeout(timeoutId)
    service.responseTime = Date.now() - startTime
    service.lastChecked = new Date()
    service.status = 'online'
  } catch (error) {
    service.responseTime = Date.now() - startTime
    service.lastChecked = new Date()
    service.status = 'offline'
    console.warn(`Health check failed for ${service.name}:`, error)
  }
}

const checkAllServicesHealth = async (): Promise<void> => {
  lastHealthCheck.value = new Date()
  const promises = homelabServices.value.map(service => checkServiceHealth(service))
  await Promise.allSettled(promises)
}

const startHealthMonitoring = (): void => {
  // TEMPORARILY DISABLED FOR DEBUGGING
  console.log('Health monitoring disabled for debugging redirect issue')
  // checkAllServicesHealth()
  // healthCheckInterval.value = window.setInterval(checkAllServicesHealth, 30000)
}

const stopHealthMonitoring = (): void => {
  if (healthCheckInterval.value) {
    clearInterval(healthCheckInterval.value)
    healthCheckInterval.value = null
  }
}

// Navigation Handlers
const handleNavItemSelected = (item: any) => {
  if (item.action === 'external') {
    // Handle external service links
    selectedExternalService.value = item
    if (item.url) {
      window.open(item.url, '_blank')
    }
    activeView.value = 'external-service'
  } else {
    // Handle internal navigation
    activeView.value = item.id
  }
}

const handleRefreshAll = () => {
  checkAllServicesHealth()
}

const handleOpenSettings = () => {
  // Future settings implementation
  console.log('Settings panel not yet implemented')
}

const toggleMobileSidebar = () => {
  // This will be handled by the sidebar component
  console.log('Mobile sidebar toggle')
}

// Service Management
const openService = (url: string) => {
  window.open(url, '_blank')
}

const refreshService = async (serviceId: string) => {
  const service = homelabServices.value.find(s => s.id === serviceId)
  if (service) {
    await checkServiceHealth(service)
  }
}

// Computed Properties for Status
const onlineServicesCount = computed(() => {
  return homelabServices.value.filter(service => service.status === 'online').length
})

const totalServicesCount = computed(() => {
  return homelabServices.value.length
})

const overallStatusClass = computed(() => {
  const onlineCount = onlineServicesCount.value
  const totalCount = totalServicesCount.value

  if (onlineCount === totalCount) return 'status-all-online'
  if (onlineCount > totalCount / 2) return 'status-mostly-online'
  if (onlineCount > 0) return 'status-partial-online'
  return 'status-offline'
})

const overallStatusText = computed(() => {
  return `${onlineServicesCount.value}/${totalServicesCount.value}`
})

const systemHealthClass = computed(() => {
  const ratio = onlineServicesCount.value / totalServicesCount.value
  if (ratio === 1) return 'text-green-400'
  if (ratio > 0.7) return 'text-yellow-400'
  return 'text-red-400'
})

const systemHealthText = computed(() => {
  const ratio = onlineServicesCount.value / totalServicesCount.value
  if (ratio === 1) return 'Excellent'
  if (ratio > 0.7) return 'Good'
  if (ratio > 0.3) return 'Degraded'
  return 'Critical'
})

const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'online': return '✅'
    case 'offline': return '❌'
    case 'checking': return '🔄'
    default: return '❓'
  }
}

const getStatusText = (status: string): string => {
  switch (status) {
    case 'online': return 'Online'
    case 'offline': return 'Offline'
    case 'checking': return 'Checking...'
    default: return 'Unknown'
  }
}

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'online': return 'mario-tag-success'
    case 'offline': return 'mario-tag-danger'
    case 'checking': return 'mario-tag-warning'
    default: return 'mario-tag'
  }
}

// Lifecycle hooks
onMounted(() => {
  setTheme() // Force Jehkoba8 theme
  startHealthMonitoring()

  // Initialize mobile detection
  checkMobile()
  window.addEventListener('resize', handleResize)

  // Auto-switch to monitoring tab on desktop if coming from mobile
  if (!isMobile.value && window.innerWidth >= 1024) {
    activeTab.value = 'monitoring'
  }
})

onUnmounted(() => {
  stopHealthMonitoring()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* App Layout */
.app-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg,
    rgba(var(--lakoba-surface-rgb, 22, 33, 62), 0.95),
    rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.01)
  );
}

.main-content {
  flex: 1;
  margin-left: 280px;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content-collapsed {
  margin-left: 80px;
}

/* Mobile Header */
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(var(--lakoba-surface-rgb, 22, 33, 62), 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.mobile-menu-button {
  padding: 0.5rem;
  border: 1px solid rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.2);
  border-radius: 6px;
  background: rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.05);
  color: var(--lakoba-text);
  cursor: pointer;
}

.mobile-brand-text {
  font-weight: 600;
  color: var(--lakoba-text);
}

.mobile-status .status-indicator {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.625rem;
  font-weight: 500;
}

/* Content Area */
.content-area {
  flex: 1;
  padding: 2rem;
  position: relative;
}

.view-content {
  animation: fadeIn 0.3s ease-in-out;
}

.view-header {
  margin-bottom: 2rem;
}

.view-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--lakoba-text);
  margin: 0 0 0.5rem 0;
}

.view-subtitle {
  font-size: 1.125rem;
  color: var(--lakoba-text-muted);
  opacity: 0.8;
  margin: 0;
}

/* Dashboard Layout */
.dashboard-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;
}

.quick-stats-card {
  background: linear-gradient(135deg,
    rgba(var(--lakoba-surface-rgb, 22, 33, 62), 0.9),
    rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.02)
  );
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.stats-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--lakoba-text);
  margin: 0 0 1rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--lakoba-text-muted);
  opacity: 0.8;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--lakoba-primary);
}

.services-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* External Service Notice */
.external-service-notice {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg,
    rgba(var(--lakoba-surface-rgb, 22, 33, 62), 0.9),
    rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.02)
  );
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.1);
  border-radius: 12px;
}

.notice-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.notice-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--lakoba-text);
  margin: 0 0 0.5rem 0;
}

.notice-description {
  font-size: 1rem;
  color: var(--lakoba-text-muted);
  margin: 0 0 2rem 0;
}

.return-button {
  padding: 0.75rem 1.5rem;
  border: 1px solid rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.2);
  border-radius: 6px;
  background: rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.05);
  color: var(--lakoba-text);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.return-button:hover {
  background: rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.1);
  border-color: rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.3);
}

/* Status Classes */
.status-all-online {
  background: rgba(34, 197, 94, 0.1);
  color: rgb(34, 197, 94);
}

.status-mostly-online {
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

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .main-content-collapsed {
    margin-left: 0;
  }

  .content-area {
    padding: 1rem;
  }

  .view-title {
    font-size: 1.5rem;
  }

  .view-subtitle {
    font-size: 1rem;
  }

  .dashboard-grid {
    gap: 1rem;
  }

  .services-overview {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .quick-stats-card {
    padding: 1rem;
  }
}

/* Tab Content */
.tab-content {
  @apply w-full;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile Navigation Optimizations */
@media (max-width: 768px) {
  .nav-tab {
    @apply px-3 py-3 text-sm;
  }
  
  nav .max-w-6xl {
    @apply px-4;
  }
  
  nav .flex {
    @apply space-x-4;
  }
}

@media (max-width: 480px) {
  .nav-tab {
    @apply px-2 text-xs;
  }
  
  .nav-tab span {
    @apply hidden;
  }
  
  nav .flex {
    @apply space-x-2 justify-center;
  }
}

/* Theme-aware responsive design */
.nav-tab:active {
  background: var(--primary-color);
  background-opacity: 0.2;
}

/* Enhanced CoreUI-inspired styling */
.enhanced-header {
  padding: var(--space-8);
  background: linear-gradient(135deg,
    rgba(var(--lakoba-surface-rgb, 22, 33, 62), 0.95),
    rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.05)
  );
  backdrop-filter: blur(20px);
  border-bottom: 2px solid rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.3);
  box-shadow: var(--shadow-lg);
  position: relative;
}

.enhanced-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.header-content {
  position: relative;
  z-index: 1;
}

.brand-section {
  @apply flex items-center justify-center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.brand-icon {
  width: 4rem;
  height: 4rem;
  @apply flex items-center justify-center rounded-xl;
  background: linear-gradient(135deg, var(--lakoba-primary), var(--lakoba-secondary));
  font-size: 2rem;
  box-shadow: var(--shadow-xl);
  animation: gentle-glow 3s ease-in-out infinite alternate;
}

.brand-text {
  @apply text-center;
}

.brand-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--lakoba-text);
  margin-bottom: var(--space-2);
  background: linear-gradient(135deg, var(--lakoba-primary), var(--lakoba-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-subtitle {
  font-size: 1.25rem;
  color: var(--lakoba-text-muted);
  font-weight: 400;
}

.enhanced-services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--space-6);
}

@keyframes gentle-glow {
  0% {
    box-shadow: var(--shadow-xl);
    transform: scale(1);
  }
  100% {
    box-shadow: var(--shadow-2xl), 0 0 30px rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.3);
    transform: scale(1.02);
  }
}

/* Enhanced navigation tabs */
nav {
  background: linear-gradient(135deg,
    rgba(var(--lakoba-surface-rgb, 22, 33, 62), 0.9),
    rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.02)
  ) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.2) !important;
  box-shadow: var(--shadow-md);
}

.nav-tab {
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  transition: all var(--transition-normal);
}

.nav-tab:hover {
  background: rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.1) !important;
  transform: translateY(-2px);
}

.nav-tab.active {
  background: linear-gradient(135deg,
    rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.2),
    rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.1)
  ) !important;
  border: 1px solid rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.3);
  border-bottom: none;
  box-shadow: var(--shadow-sm);
}

/* Enhanced main content with subtle depth */
main {
  background: linear-gradient(135deg,
    rgba(var(--lakoba-surface-rgb, 22, 33, 62), 0.1),
    rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.02),
    rgba(var(--lakoba-secondary-rgb, 136, 0, 255), 0.01)
  );
  backdrop-filter: blur(1px);
  position: relative;
}

main::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 20%,
    rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.03) 0%,
    transparent 50%),
    radial-gradient(circle at 70% 80%,
    rgba(var(--lakoba-secondary-rgb, 136, 0, 255), 0.02) 0%,
    transparent 50%);
  pointer-events: none;
  z-index: -1;
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .brand-section {
    @apply flex-col;
    gap: var(--space-3);
  }

  .brand-title {
    font-size: 1.875rem;
  }

  .brand-subtitle {
    font-size: 1rem;
  }

  .enhanced-services-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
}
</style>