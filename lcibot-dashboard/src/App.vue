<template>
  <div id="app" class="min-h-screen" :class="getThemeClass()">
    <!-- Mario Dashboard Header -->
    <header class="p-8 text-center border-b-2" style="background: var(--section-bg); border-color: var(--primary-color);">
      <div class="header-content">
        <h1 class="text-4xl mb-2" style="color: var(--text-color);">🏠 Proxmox Homelab Dashboard</h1>
        <p class="text-xl mb-8 opacity-80" style="color: var(--text-color);">Proxmox Services & System Monitoring</p>
        
        <!-- Health Status Indicator -->
        <div class="flex items-center justify-center gap-2 mb-4 text-sm opacity-80">
          <span style="color: var(--text-color);">Last Health Check:</span>
          <span class="font-semibold" style="color: var(--primary-color);">{{ lastHealthCheck.toLocaleTimeString() }}</span>
        </div>
        
        <!-- Professional Homelab Dashboard - Single Jehkoba8 Theme -->
        <div class="flex items-center justify-center gap-2 opacity-70">
          <span class="text-sm" style="color: var(--text-color);">Professional Homelab Dashboard</span>
        </div>
      </div>
    </header>

    <!-- Navigation Tabs -->
    <nav class="border-b border-opacity-20" style="border-color: var(--primary-color); background: var(--card-bg);">
      <div class="max-w-6xl mx-auto px-8">
        <div class="flex space-x-8">
          <button 
            v-for="tab in navigationTabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="nav-tab"
            :class="{ active: activeTab === tab.id }"
          >
            <component :is="tab.icon" class="w-4 h-4 mr-2" />
            {{ tab.label }}
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content Area -->
    <main class="p-8 max-w-6xl mx-auto">
      <!-- Services Tab -->
      <div v-if="activeTab === 'services'" class="tab-content">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Service Cards -->
          <div v-for="service in homelabServices" :key="service.id" class="mario-card">
            <div class="flex items-start gap-4 mb-4">
              <component :is="service.icon" class="w-8 h-8 flex-shrink-0" style="color: var(--primary-color);" />
              <div class="flex-1">
                <h3 class="text-lg font-semibold mb-1" style="color: var(--text-color);">{{ service.name }}</h3>
                <p class="text-sm opacity-80" style="color: var(--text-color);">{{ service.description }}</p>
              </div>
              <div class="text-right flex flex-col items-end gap-1">
                <span :class="getStatusClass(service.status)">
                  {{ getStatusIcon(service.status) }} {{ getStatusText(service.status) }}
                </span>
                <div v-if="service.responseTime" class="text-xs opacity-70" style="color: var(--text-color);">
                  {{ service.responseTime }}ms
                </div>
              </div>
            </div>
            <div class="text-right">
              <button @click="openService(service.url)" class="mario-button inline-flex items-center gap-2">
                <Link class="w-4 h-4" />
                Access
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- System Monitoring Tab -->
      <div v-if="activeTab === 'monitoring'" class="tab-content">
        <div class="space-y-8">
          <!-- System Metrics Widget -->
          <SystemMetricsWidget />
          
          <!-- Service Health Dashboard -->
          <ServiceHealthDashboard />
        </div>
      </div>

      <!-- Mobile Monitoring Tab (Hidden on Desktop) -->
      <div v-if="activeTab === 'mobile'" class="tab-content md:hidden">
        <MobileMonitoringDashboard />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ExternalLink as Link, Monitor, Play as VideoPlay, TrendingUp as TrendCharts, Download, Folder as FolderOpened, Activity, Smartphone } from 'lucide-vue-next'
import SystemMetricsWidget from './components/monitoring/SystemMetricsWidget.vue'
import ServiceHealthDashboard from './components/monitoring/ServiceHealthDashboard.vue'
import MobileMonitoringDashboard from './components/monitoring/MobileMonitoringDashboard.vue'

// Navigation and Theme System
const activeTab = ref('services')
const isMobile = ref(false)

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
    id: 'qbittorrent',
    name: 'qBittorrent Torrent Client',
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
  },
  {
    id: 'gbgreg-coordinator',
    name: 'GBGreg Coordinator AI',
    description: 'AI Orchestration Service',
    url: 'http://192.168.0.99:11436',
    icon: Activity,
    status: 'checking',
    healthEndpoint: 'http://192.168.0.99:11436'
  },
  {
    id: 'gbgreg-technical',
    name: 'GBGreg Technical AI',
    description: 'Technical Analysis AI',
    url: 'http://192.168.0.99:11437',
    icon: Activity,
    status: 'checking',
    healthEndpoint: 'http://192.168.0.99:11437'
  },
  {
    id: 'gbgreg-documentation',
    name: 'GBGreg Documentation AI',
    description: 'Documentation Generation AI',
    url: 'http://192.168.0.99:11438',
    icon: Activity,
    status: 'checking',
    healthEndpoint: 'http://192.168.0.99:11438'
  },
  {
    id: 'gbgreg-vision',
    name: 'GBGreg Vision AI',
    description: 'Vision Processing AI',
    url: 'http://192.168.0.99:11439',
    icon: Activity,
    status: 'checking',
    healthEndpoint: 'http://192.168.0.99:11439'
  },
  {
    id: 'gbgreg-postgres',
    name: 'GBGreg Database',
    description: 'Laboratory Database',
    url: 'http://192.168.0.99:5433',
    icon: Monitor,
    status: 'checking',
    healthEndpoint: 'http://192.168.0.99:5433'
  },
  {
    id: 'gbgreg-dashboard',
    name: 'GBGreg Laboratory Dashboard',
    description: 'AI Laboratory Control Center',
    url: 'http://192.168.0.127:8021',
    icon: Monitor,
    status: 'checking',
    healthEndpoint: 'http://192.168.0.127:8021'
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
  // Initial check
  checkAllServicesHealth()
  
  // Set up periodic checks every 30 seconds
  healthCheckInterval.value = window.setInterval(checkAllServicesHealth, 30000)
}

const stopHealthMonitoring = (): void => {
  if (healthCheckInterval.value) {
    clearInterval(healthCheckInterval.value)
    healthCheckInterval.value = null
  }
}

// Methods
const openService = (url: string) => {
  window.open(url, '_blank')
}

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
/* Navigation Tabs */
.nav-tab {
  @apply flex items-center py-4 px-6 font-medium transition-all duration-200 border-b-2 border-transparent;
  color: var(--text-color);
  opacity: 0.7;
}

.nav-tab:hover {
  opacity: 1;
  background: var(--section-bg);
}

.nav-tab.active {
  opacity: 1;
  border-bottom-color: var(--primary-color);
  color: var(--primary-color);
  background: var(--primary-color);
  background-opacity: 0.1;
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
</style>