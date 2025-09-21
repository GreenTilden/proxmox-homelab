<template>
  <div class="mario-card system-metrics-widget">
    <div class="widget-header">
      <h3 class="text-lg font-semibold flex items-center gap-2" style="color: var(--text-color);">
        <Server class="w-5 h-5" />
        System Metrics
      </h3>
      <div class="flex items-center space-x-2">
        <div class="status-indicator" :class="statusClass">
          {{ statusIcon }}
        </div>
        <span class="text-xs opacity-70" style="color: var(--text-color);">
          {{ lastUpdated }}
        </span>
      </div>
    </div>
    
    <div class="metrics-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
      <MetricCard
        title="CPU Usage"
        :value="formattedMetrics.cpuUsage"
        :raw-value="systemMetrics.cpuUsage"
        :status="cpuStatus"
        icon="Cpu"
        :cores="systemMetrics.cpuCores"
      />
      
      <MetricCard
        title="Memory Usage"
        :value="formattedMetrics.memoryUsage"
        :raw-value="systemMetrics.memoryUsage"
        :status="memoryStatus"
        icon="MemoryStick"
        :subtitle="`${formattedMetrics.memoryUsed} / ${formattedMetrics.memoryTotal}`"
      />
      
      <MetricCard
        title="Storage Usage"
        :value="formattedMetrics.diskUsage"
        :raw-value="systemMetrics.diskUsage"
        :status="diskStatus"
        icon="HardDrive"
        :subtitle="`${formattedMetrics.diskUsed} / ${formattedMetrics.diskTotal}`"
      />
      
      <MetricCard
        title="Load Average"
        :value="formattedMetrics.loadAverage"
        :raw-value="systemMetrics.loadAverage1m"
        :status="loadStatus"
        icon="Activity"
        :subtitle="`${systemMetrics.cpuCores} cores`"
      />
    </div>

    <!-- Storage & Download Monitoring Section -->
    <div class="storage-download-section mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- ZFS Pool Status -->
      <div class="zfs-section">
        <ZFSPoolChart />
      </div>

      <!-- qBittorrent Status -->
      <div class="torrent-section">
        <TorrentStatus />
      </div>
    </div>

    <div class="network-metrics mt-4 p-4 rounded-lg" style="background: var(--section-bg);">
      <h4 class="text-sm font-medium mb-2 opacity-80" style="color: var(--text-color);">Network Activity</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex items-center justify-between">
          <span class="text-sm opacity-70" style="color: var(--text-color);">↓ Download:</span>
          <span class="text-sm font-medium" style="color: var(--primary-color);">
            {{ formattedMetrics.networkReceiveRate }}
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm opacity-70" style="color: var(--text-color);">↑ Upload:</span>
          <span class="text-sm font-medium" style="color: var(--primary-color);">
            {{ formattedMetrics.networkTransmitRate }}
          </span>
        </div>
      </div>
    </div>
    
    <div class="system-info mt-4 p-4 rounded-lg" style="background: var(--section-bg);">
      <div class="flex items-center justify-between">
        <span class="text-sm opacity-70" style="color: var(--text-color);">System Uptime:</span>
        <span class="text-sm font-medium" style="color: var(--primary-color);">
          {{ formattedMetrics.uptime }}
        </span>
      </div>
    </div>
    
    <div class="metrics-chart mt-4" v-if="showChart && historicalData.length > 0">
      <MiniChart
        :data="chartData"
        type="area"
        height="120"
        :color="chartColor"
      />
    </div>
    
    <div class="widget-actions mt-4 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <button 
          @click="refreshMetrics"
          :disabled="isLoading"
          class="mario-button-small flex items-center gap-1"
        >
          <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </button>
        
        <button 
          @click="toggleChart"
          class="mario-button-small flex items-center gap-1"
        >
          <TrendingUp class="w-3 h-3" />
          {{ showChart ? 'Hide' : 'Show' }} Chart
        </button>
      </div>
      
      <div class="text-xs opacity-50" style="color: var(--text-color);" v-if="error">
        ⚠️ {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Server, Cpu, MemoryStick, HardDrive, Activity, RefreshCw, TrendingUp } from 'lucide-vue-next'
import { useSystemMetrics } from '@/composables/useSystemMetrics'
import MetricCard from './MetricCard.vue'
import MiniChart from './MiniChart.vue'
import ZFSPoolChart from './ZFSPoolChart.vue'
import TorrentStatus from './TorrentStatus.vue'

const showChart = ref(true)

const {
  systemMetrics,
  historicalData,
  isLoading,
  error,
  healthStatus,
  loadStatus,
  memoryStatus,
  diskStatus,
  formattedMetrics,
  startMonitoring,
  stopMonitoring,
  refreshMetrics
} = useSystemMetrics()

const statusClass = computed(() => ({
  'status-healthy': healthStatus.value === 'healthy',
  'status-loading': healthStatus.value === 'loading',
  'status-error': healthStatus.value === 'error',
  'status-stale': healthStatus.value === 'stale',
  'status-no-data': healthStatus.value === 'no-data'
}))

const statusIcon = computed(() => {
  switch (healthStatus.value) {
    case 'healthy': return '✅'
    case 'loading': return '🔄'
    case 'error': return '❌'
    case 'stale': return '⚠️'
    case 'no-data': return '❓'
    default: return '❓'
  }
})

const lastUpdated = computed(() => {
  if (!systemMetrics.value.lastUpdate) return 'Never'
  const diff = Date.now() - systemMetrics.value.lastUpdate.getTime()
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  return `${Math.floor(diff / 3600000)}h ago`
})

const cpuStatus = computed(() => {
  const usage = systemMetrics.value.cpuUsage
  if (usage > 90) return 'critical'
  if (usage > 75) return 'warning'
  return 'normal'
})

const chartData = computed(() => {
  return historicalData.value.map(point => ({
    timestamp: point.timestamp,
    value: point.cpuUsage
  }))
})

const chartColor = computed(() => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--primary-color').trim()
})

const toggleChart = () => {
  showChart.value = !showChart.value
}

onMounted(() => {
  startMonitoring()
})

onUnmounted(() => {
  stopMonitoring()
})
</script>

<style scoped>
.system-metrics-widget {
  @apply transition-all duration-300;
}

.widget-header {
  @apply flex items-center justify-between pb-2 border-b border-opacity-20;
  border-color: var(--primary-color);
}

.status-indicator {
  @apply px-2 py-1 rounded-full text-xs font-medium;
}

.status-healthy {
  background: rgba(0, 255, 0, 0.2);
  color: rgba(0, 255, 0, 1);
}

.status-loading {
  background: rgba(255, 165, 0, 0.2);
  color: rgba(255, 165, 0, 1);
}

.status-error {
  background: rgba(255, 0, 0, 0.2);
  color: rgba(255, 0, 0, 1);
}

.status-stale {
  background: rgba(255, 255, 0, 0.2);
  color: rgba(255, 255, 0, 1);
}

.status-no-data {
  background: rgba(128, 128, 128, 0.2);
  color: rgba(128, 128, 128, 1);
}

.metrics-grid {
  @apply transition-all duration-300;
}

.mario-button-small {
  @apply px-2 py-1 text-xs rounded font-medium transition-all duration-200;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  opacity: 0.9;
}

.mario-button-small:hover {
  opacity: 1;
  transform: translateY(-1px);
}

.mario-button-small:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .metrics-grid {
    @apply grid-cols-2 gap-3;
  }

  .widget-header {
    @apply flex-col items-start space-y-2;
  }

  .widget-actions {
    @apply flex-col items-stretch space-y-2;
  }

  .storage-download-section {
    @apply grid-cols-1 gap-4;
  }
}

@media (max-width: 480px) {
  .metrics-grid {
    @apply grid-cols-1;
  }
}
</style>