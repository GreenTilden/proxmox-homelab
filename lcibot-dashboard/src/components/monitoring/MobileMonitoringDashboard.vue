<template>
  <div class="mobile-monitoring-dashboard" :class="getThemeClass()">
    <!-- Mobile Header -->
    <div class="mobile-header" style="background: var(--section-bg); border-color: var(--primary-color);">
      <div class="header-content">
        <h2 class="text-xl font-bold" style="color: var(--text-color);">🤖 System Monitor</h2>
        <div class="mobile-controls">
          <button 
            @click="toggleAutoRefresh"
            class="mobile-control-btn"
            :class="{ active: autoRefreshEnabled }"
          >
            <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isRefreshing }" />
          </button>
          <button 
            @click="toggleFullscreen"
            class="mobile-control-btn"
          >
            <Maximize class="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <!-- Overall Health Banner -->
      <div class="health-banner" :class="healthBannerClass">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="health-indicator">{{ overallHealthIcon }}</div>
            <span class="text-sm font-medium">
              {{ serviceMetrics.onlineServices }}/{{ serviceMetrics.totalServices }} Online
            </span>
          </div>
          <span class="text-xs opacity-70">
            {{ serviceMetrics.healthyPercentage.toFixed(0) }}% Healthy
          </span>
        </div>
      </div>
    </div>
    
    <!-- Mobile Navigation Tabs -->
    <div class="mobile-tabs" style="background: var(--section-bg); border-color: var(--primary-color);">
      <button 
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="mobile-tab"
        :class="{ active: activeTab === tab.id }"
      >
        <component :is="tab.icon" class="w-4 h-4" />
        <span class="tab-label">{{ tab.label }}</span>
        <div v-if="tab.badge" class="tab-badge">{{ tab.badge }}</div>
      </button>
    </div>
    
    <!-- Mobile Content Area -->
    <div class="mobile-content">
      <!-- System Metrics Tab -->
      <div v-if="activeTab === 'system'" class="tab-content">
        <div class="mobile-metrics-grid">
          <MobileMetricCard
            v-for="metric in systemMetricsData"
            :key="metric.id"
            :metric="metric"
            @tap="showMetricDetail(metric)"
          />
        </div>
        
        <!-- System Chart -->
        <div class="mobile-chart-container mt-4" v-if="showChart">
          <h4 class="text-sm font-medium mb-2" style="color: var(--text-color);">CPU Usage Trend</h4>
          <MiniChart
            :data="chartData"
            type="area"
            height="100"
            :color="chartColor"
            :show-header="false"
          />
        </div>
      </div>
      
      <!-- Services Tab -->
      <div v-if="activeTab === 'services'" class="tab-content">
        <div class="mobile-services-list">
          <MobileServiceCard
            v-for="service in services"
            :key="service.id"
            :service="service"
            @tap="showServiceDetail(service)"
            @refresh="refreshService"
          />
        </div>
      </div>
      
      <!-- Alerts Tab -->
      <div v-if="activeTab === 'alerts'" class="tab-content">
        <div class="mobile-alerts-list">
          <div v-if="criticalServices.length === 0" class="no-alerts">
            <CheckCircle class="w-8 h-8 mx-auto mb-2" style="color: var(--monitoring-success);" />
            <p class="text-sm" style="color: var(--text-color);">All systems operational</p>
          </div>
          
          <MobileAlertCard
            v-for="alert in alertsData"
            :key="alert.id"
            :alert="alert"
          />
        </div>
      </div>
    </div>
    
    <!-- Mobile Metric Detail Modal -->
    <MobileMetricDetailModal
      v-if="selectedMetric"
      :metric="selectedMetric"
      @close="selectedMetric = null"
    />
    
    <!-- Mobile Service Detail Modal -->
    <MobileServiceDetailModal
      v-if="selectedService"
      :service="selectedService"
      @close="selectedService = null"
      @refresh="refreshService"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  RefreshCw, 
  Maximize, 
  Server, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Activity
} from 'lucide-vue-next'
import { useSystemMetrics } from '@/composables/useSystemMetrics'
import { useServiceMonitoring } from '@/composables/useServiceMonitoring'
import MiniChart from './MiniChart.vue'
import MobileMetricCard from './MobileMetricCard.vue'
import MobileServiceCard from './MobileServiceCard.vue'
import MobileAlertCard from './MobileAlertCard.vue'
import MobileMetricDetailModal from './MobileMetricDetailModal.vue'
import MobileServiceDetailModal from './MobileServiceDetailModal.vue'

// Theme handling
const currentTheme = ref('purple')
const themes = {
  purple: 'theme-purple',
  classic: 'theme-classic',
  paint: 'theme-paint', 
  italy: 'theme-italy',
  gameboy: 'theme-gameboy'
}

const getThemeClass = () => {
  return themes[currentTheme.value] || 'theme-purple'
}

// Tab management
const activeTab = ref('system')
const selectedMetric = ref(null)
const selectedService = ref(null)
const showChart = ref(true)

const tabs = computed(() => [
  { 
    id: 'system', 
    label: 'System', 
    icon: Server,
    badge: null
  },
  { 
    id: 'services', 
    label: 'Services', 
    icon: Shield,
    badge: serviceMetrics.value.onlineServices
  },
  { 
    id: 'alerts', 
    label: 'Alerts', 
    icon: AlertTriangle,
    badge: criticalServices.value.length > 0 ? criticalServices.value.length : null
  }
])

// System metrics composable
const {
  systemMetrics,
  historicalData,
  isLoading: systemLoading,
  healthStatus,
  formattedMetrics,
  startMonitoring: startSystemMonitoring,
  stopMonitoring: stopSystemMonitoring
} = useSystemMetrics()

// Service monitoring composable
const {
  services,
  serviceMetrics,
  isAutoRefreshEnabled: autoRefreshEnabled,
  isRefreshing,
  criticalServices,
  refreshService,
  refreshAllServices,
  toggleAutoRefresh,
  startAutoRefresh,
  stopAutoRefresh
} = useServiceMonitoring()

// Mobile-optimized system metrics data
const systemMetricsData = computed(() => [
  {
    id: 'cpu',
    title: 'CPU Usage',
    value: formattedMetrics.value.cpuUsage,
    rawValue: systemMetrics.value.cpuUsage,
    icon: 'Cpu',
    status: systemMetrics.value.cpuUsage > 90 ? 'critical' : systemMetrics.value.cpuUsage > 75 ? 'warning' : 'normal',
    subtitle: `${systemMetrics.value.cpuCores} cores`
  },
  {
    id: 'memory',
    title: 'Memory',
    value: formattedMetrics.value.memoryUsage,
    rawValue: systemMetrics.value.memoryUsage,
    icon: 'MemoryStick',
    status: systemMetrics.value.memoryUsage > 90 ? 'critical' : systemMetrics.value.memoryUsage > 75 ? 'warning' : 'normal',
    subtitle: formattedMetrics.value.memoryUsed
  },
  {
    id: 'storage',
    title: 'Storage',
    value: formattedMetrics.value.diskUsage,
    rawValue: systemMetrics.value.diskUsage,
    icon: 'HardDrive',
    status: systemMetrics.value.diskUsage > 90 ? 'critical' : systemMetrics.value.diskUsage > 80 ? 'warning' : 'normal',
    subtitle: formattedMetrics.value.diskUsed
  },
  {
    id: 'load',
    title: 'Load Avg',
    value: formattedMetrics.value.loadAverage,
    rawValue: systemMetrics.value.loadAverage1m,
    icon: 'Activity',
    status: (systemMetrics.value.loadAverage1m / systemMetrics.value.cpuCores) > 1.5 ? 'critical' : 
            (systemMetrics.value.loadAverage1m / systemMetrics.value.cpuCores) > 1.0 ? 'warning' : 'normal',
    subtitle: `${systemMetrics.value.cpuCores} cores`
  }
])

// Alerts data
const alertsData = computed(() => {
  const alerts = []
  
  // Critical services
  criticalServices.value.forEach(service => {
    alerts.push({
      id: `service-${service.id}`,
      type: 'critical',
      title: `${service.name} Offline`,
      description: service.description,
      timestamp: service.lastChecked || new Date(),
      action: 'Check service status'
    })
  })
  
  // System alerts
  if (systemMetrics.value.cpuUsage > 90) {
    alerts.push({
      id: 'cpu-critical',
      type: 'critical',
      title: 'High CPU Usage',
      description: `CPU usage at ${formattedMetrics.value.cpuUsage}`,
      timestamp: systemMetrics.value.lastUpdate || new Date(),
      action: 'Check running processes'
    })
  }
  
  if (systemMetrics.value.memoryUsage > 90) {
    alerts.push({
      id: 'memory-critical',
      type: 'critical',
      title: 'High Memory Usage',
      description: `Memory usage at ${formattedMetrics.value.memoryUsage}`,
      timestamp: systemMetrics.value.lastUpdate || new Date(),
      action: 'Check memory usage'
    })
  }
  
  return alerts
})

// Chart data for mobile view
const chartData = computed(() => {
  return historicalData.value.map(point => ({
    timestamp: point.timestamp,
    value: point.cpuUsage
  })).slice(-20) // Last 20 data points for mobile
})

const chartColor = computed(() => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--primary-color').trim()
})

// Health status
const overallHealthIcon = computed(() => {
  const percentage = serviceMetrics.value.healthyPercentage
  if (percentage >= 90) return '🟢'
  if (percentage >= 75) return '🟡'
  if (percentage >= 50) return '🟠'
  return '🔴'
})

const healthBannerClass = computed(() => {
  const percentage = serviceMetrics.value.healthyPercentage
  if (percentage >= 90) return 'health-excellent'
  if (percentage >= 75) return 'health-good'
  if (percentage >= 50) return 'health-warning'
  return 'health-critical'
})

// Methods
const showMetricDetail = (metric: any) => {
  selectedMetric.value = metric
}

const showServiceDetail = (service: any) => {
  selectedService.value = service
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

onMounted(() => {
  startSystemMonitoring()
  refreshAllServices()
  if (autoRefreshEnabled.value) {
    startAutoRefresh()
  }
})

onUnmounted(() => {
  stopSystemMonitoring()
  stopAutoRefresh()
})
</script>

<style scoped>
.mobile-monitoring-dashboard {
  @apply flex flex-col h-screen;
  background: var(--bg-color);
}

.mobile-header {
  @apply border-b border-opacity-20 p-4;
}

.header-content {
  @apply flex items-center justify-between mb-3;
}

.mobile-controls {
  @apply flex items-center space-x-2;
}

.mobile-control-btn {
  @apply p-2 rounded-lg border border-opacity-20 transition-colors;
  background: var(--card-bg);
  color: var(--text-color);
  border-color: var(--primary-color);
}

.mobile-control-btn.active,
.mobile-control-btn:active {
  background: var(--primary-color);
  color: white;
}

.health-banner {
  @apply p-3 rounded-lg;
}

.health-excellent {
  background: var(--monitoring-success);
  background-opacity: 0.1;
  color: var(--monitoring-success);
}

.health-good {
  background: var(--monitoring-warning);
  background-opacity: 0.1;
  color: var(--monitoring-warning);
}

.health-warning {
  background: var(--monitoring-warning);
  background-opacity: 0.15;
  color: var(--monitoring-warning);
}

.health-critical {
  background: var(--monitoring-critical);
  background-opacity: 0.15;
  color: var(--monitoring-critical);
}

.health-indicator {
  @apply text-lg;
}

.mobile-tabs {
  @apply flex border-b border-opacity-20;
}

.mobile-tab {
  @apply flex-1 flex flex-col items-center justify-center py-3 px-2 relative transition-colors;
  color: var(--text-color);
  border-color: var(--primary-color);
}

.mobile-tab.active {
  color: var(--primary-color);
  border-bottom: 2px solid var(--primary-color);
  background: var(--primary-color);
  background-opacity: 0.1;
}

.tab-label {
  @apply text-xs font-medium mt-1;
}

.tab-badge {
  @apply absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center;
  background: var(--monitoring-critical);
  color: white;
}

.mobile-content {
  @apply flex-1 overflow-y-auto;
}

.tab-content {
  @apply p-4;
}

.mobile-metrics-grid {
  @apply grid grid-cols-2 gap-3;
}

.mobile-services-list,
.mobile-alerts-list {
  @apply space-y-3;
}

.no-alerts {
  @apply text-center py-8;
}

.mobile-chart-container {
  @apply p-3 rounded-lg;
  background: var(--section-bg);
  border: 1px solid var(--primary-color);
  border-opacity: 0.2;
}

/* Touch-friendly sizing */
@media (max-width: 480px) {
  .mobile-metrics-grid {
    @apply grid-cols-1 gap-4;
  }
  
  .mobile-tab {
    @apply py-4;
  }
  
  .mobile-control-btn {
    @apply p-3;
    min-height: 44px;
    min-width: 44px;
  }
}
</style>