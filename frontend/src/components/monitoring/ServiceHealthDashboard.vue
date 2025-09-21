<template>
  <div class="mario-card service-health-dashboard">
    <div class="dashboard-header">
      <h3 class="text-lg font-semibold flex items-center gap-2" style="color: var(--text-color);">
        <Shield class="w-5 h-5" />
        Service Health Dashboard
      </h3>
      <div class="health-summary">
        <span class="service-count online">{{ onlineServices.length }} Online</span>
        <span class="service-count offline">{{ offlineServices.length }} Offline</span>
        <span class="service-count checking">{{ checkingServices.length }} Checking</span>
      </div>
    </div>
    
    <div class="overall-health mb-4 p-3 rounded-lg" style="background: var(--section-bg);">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="health-indicator" :class="overallHealthClass">
            {{ overallHealthIcon }}
          </div>
          <span class="text-sm font-medium" style="color: var(--text-color);">
            Overall Health: {{ serviceMetrics.healthyPercentage.toFixed(1) }}%
          </span>
        </div>
        <div class="text-xs opacity-60" style="color: var(--text-color);" v-if="serviceMetrics.lastUpdateTime">
          Last updated {{ formatLastUpdate }}
        </div>
      </div>
      
      <div class="health-bar mt-2">
        <div class="health-fill" :style="healthBarStyle"></div>
      </div>
    </div>
    
    <div class="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <ServiceHealthCard
        v-for="service in services"
        :key="service.id"
        :service="service"
        @refresh="refreshService"
        @open="openService"
      />
    </div>
    
    <div class="critical-alerts mb-4" v-if="criticalServices.length > 0">
      <h4 class="text-sm font-medium text-red-300 mb-2 flex items-center gap-1">
        <AlertTriangle class="w-4 h-4" />
        Critical Services Down
      </h4>
      <div class="space-y-2">
        <div 
          v-for="service in criticalServices" 
          :key="service.id"
          class="p-2 rounded bg-red-900/20 border border-red-500/30 text-red-200 text-sm"
        >
          {{ service.name }} - {{ service.description }}
        </div>
      </div>
    </div>
    
    <div class="health-actions flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-center space-x-3">
        <button 
          @click="refreshAllServices"
          :disabled="isRefreshing"
          class="mario-button flex items-center gap-2"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isRefreshing }" />
          Refresh All Services
        </button>
        
        <button 
          @click="toggleAutoRefresh"
          class="mario-button"
          :class="isAutoRefreshEnabled ? 'mario-button-accent' : 'mario-button-secondary'"
        >
          <Clock class="w-4 h-4 mr-2" />
          Auto-refresh: {{ isAutoRefreshEnabled ? 'On' : 'Off' }}
        </button>
      </div>
      
      <div class="service-stats text-xs opacity-60" style="color: var(--text-color);">
        {{ serviceMetrics.totalServices }} services monitored
      </div>
    </div>
    
    <div class="error-message mt-3 p-2 rounded bg-red-900/20 border border-red-500/30 text-red-200 text-sm" v-if="error">
      ⚠️ {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { Shield, RefreshCw, Clock, AlertTriangle, ExternalLink } from 'lucide-vue-next'
import { useServiceMonitoring } from '@/composables/useServiceMonitoring'
import ServiceHealthCard from './ServiceHealthCard.vue'

const {
  services,
  serviceMetrics,
  isLoading,
  error,
  isAutoRefreshEnabled,
  isRefreshing,
  onlineServices,
  offlineServices,
  checkingServices,
  criticalServices,
  refreshService,
  refreshAllServices,
  toggleAutoRefresh,
  startAutoRefresh,
  stopAutoRefresh
} = useServiceMonitoring()

const overallHealthClass = computed(() => {
  const percentage = serviceMetrics.value.healthyPercentage
  if (percentage >= 90) return 'health-excellent'
  if (percentage >= 75) return 'health-good'
  if (percentage >= 50) return 'health-warning'
  return 'health-critical'
})

const overallHealthIcon = computed(() => {
  const percentage = serviceMetrics.value.healthyPercentage
  if (percentage >= 90) return '🟢'
  if (percentage >= 75) return '🟡'
  if (percentage >= 50) return '🟠'
  return '🔴'
})

const healthBarStyle = computed(() => {
  const percentage = serviceMetrics.value.healthyPercentage
  let color = '#ef4444' // red for critical
  if (percentage >= 90) color = '#10b981' // green for excellent
  else if (percentage >= 75) color = '#f59e0b' // yellow for good  
  else if (percentage >= 50) color = '#f97316' // orange for warning
  
  return {
    width: `${percentage}%`,
    backgroundColor: color,
    transition: 'all 0.5s ease'
  }
})

const formatLastUpdate = computed(() => {
  if (!serviceMetrics.value.lastUpdateTime) return 'never'
  const diff = Date.now() - serviceMetrics.value.lastUpdateTime.getTime()
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  return `${Math.floor(diff / 3600000)}h ago`
})

const openService = (url: string) => {
  if (url) {
    window.open(url, '_blank')
  }
}

onMounted(() => {
  refreshAllServices()
  if (isAutoRefreshEnabled.value) {
    startAutoRefresh()
  }
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.service-health-dashboard {
  @apply transition-all duration-300;
}

.dashboard-header {
  @apply flex items-center justify-between mb-4 pb-3 border-b border-opacity-20;
  border-color: var(--primary-color);
}

.health-summary {
  @apply flex items-center space-x-3 text-sm;
}

.service-count {
  @apply px-3 py-1 rounded-full font-medium;
}

.service-count.online {
  background: rgba(0, 255, 0, 0.2);
  color: rgba(0, 255, 0, 1);
}

.service-count.offline {
  background: rgba(255, 0, 0, 0.2);
  color: rgba(255, 0, 0, 1);
}

.service-count.checking {
  background: rgba(255, 165, 0, 0.2);
  color: rgba(255, 165, 0, 1);
}

.health-indicator {
  @apply w-6 h-6 rounded-full flex items-center justify-center text-sm;
}

.health-excellent {
  background: rgba(16, 185, 129, 0.2);
  color: rgba(16, 185, 129, 1);
}

.health-good {
  background: rgba(245, 158, 11, 0.2);
  color: rgba(245, 158, 11, 1);
}

.health-warning {
  background: rgba(249, 115, 22, 0.2);
  color: rgba(249, 115, 22, 1);
}

.health-critical {
  background: rgba(239, 68, 68, 0.2);
  color: rgba(239, 68, 68, 1);
}

.health-bar {
  @apply h-2 bg-gray-700 rounded-full overflow-hidden;
  background: rgba(255, 255, 255, 0.1);
}

.health-fill {
  @apply h-full rounded-full;
}

.services-grid {
  @apply transition-all duration-300;
}

.health-actions {
  @apply pt-4 border-t border-opacity-20 mt-4;
  border-color: var(--primary-color);
}

.mario-button-accent {
  background: linear-gradient(135deg, var(--accent-color, var(--primary-color)), var(--primary-color));
}

.mario-button-secondary {
  background: linear-gradient(135deg, var(--secondary-color), var(--card-bg));
  opacity: 0.8;
}

@media (max-width: 768px) {
  .dashboard-header {
    @apply flex-col items-start space-y-3;
  }
  
  .health-summary {
    @apply flex-wrap gap-2;
  }
  
  .services-grid {
    @apply grid-cols-1;
  }
  
  .health-actions {
    @apply flex-col items-stretch space-y-3;
  }
  
  .health-actions > div {
    @apply flex-col items-stretch space-y-2 space-x-0;
  }
}

@media (max-width: 480px) {
  .service-count {
    @apply px-2 py-1 text-xs;
  }
  
  .health-summary {
    @apply grid grid-cols-2 gap-2;
  }
}
</style>