<template>
  <div class="zfs-pool-chart mario-card">
    <div class="widget-header">
      <h3 class="text-lg font-semibold flex items-center gap-2" style="color: var(--text-color);">
        <Database class="w-5 h-5" />
        ZFS Pool Status
      </h3>
      <div class="flex items-center space-x-2">
        <div v-if="alertCount > 0" class="alert-indicator bg-yellow-500 text-white text-xs px-2 py-1 rounded">
          {{ alertCount }} alert{{ alertCount > 1 ? 's' : '' }}
        </div>
        <span class="text-xs opacity-70" style="color: var(--text-color);">
          {{ lastUpdated }}
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2" style="border-color: var(--primary-color);"></div>
      <span class="ml-2 text-sm opacity-70" style="color: var(--text-color);">Loading pool data...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4 mt-4 rounded-lg bg-red-100 dark:bg-red-900/30">
      <p class="text-sm text-red-700 dark:text-red-300">
        ⚠️ {{ error }}
      </p>
    </div>

    <!-- Chart Display -->
    <div v-else-if="zfsMetrics && zfsMetrics.pools.length > 0" class="mt-4">
      <!-- Pool Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div
          v-for="pool in zfsMetrics.pools"
          :key="pool.name"
          class="pool-card p-3 rounded-lg border transition-all hover:scale-105"
          :style="{
            background: 'var(--section-bg)',
            borderColor: getPoolStatusColor(pool),
            borderWidth: '2px'
          }"
        >
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-medium text-sm" style="color: var(--text-color);">{{ pool.name }}</h4>
            <div
              class="w-3 h-3 rounded-full"
              :style="{ backgroundColor: getPoolStatusColor(pool) }"
              :title="pool.health === 1 ? 'Healthy' : 'Warning'"
            ></div>
          </div>
          <div class="text-xs opacity-80 mb-1" style="color: var(--text-color);">
            {{ formatBytes(pool.allocatedBytes) }} / {{ formatBytes(pool.sizeBytes) }}
          </div>
          <div class="progress-bar w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div
              class="progress-fill h-2 rounded-full transition-all duration-300"
              :style="{
                width: `${Math.min(pool.usagePercent, 100)}%`,
                backgroundColor: getUsageColor(pool.usagePercent)
              }"
            ></div>
          </div>
          <div class="text-xs mt-1 font-medium" :style="{ color: getUsageColor(pool.usagePercent) }">
            {{ Math.round(pool.usagePercent) }}% used
          </div>
        </div>
      </div>

      <!-- Chart Canvas -->
      <div class="chart-container mb-4">
        <canvas ref="chartCanvas" height="300"></canvas>
      </div>

      <!-- Capacity Alerts -->
      <div v-if="capacityAlerts.length > 0" class="alerts-section">
        <h4 class="text-sm font-medium mb-2 opacity-80" style="color: var(--text-color);">
          ⚠️ Capacity Alerts
        </h4>
        <div class="space-y-2">
          <div
            v-for="alert in capacityAlerts"
            :key="alert.pool"
            class="alert-item p-2 rounded text-sm"
            :class="{
              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300': alert.level === 'warning',
              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': alert.level === 'critical'
            }"
          >
            {{ alert.message }}
          </div>
        </div>
      </div>

      <!-- Pool Statistics -->
      <div class="statistics-section mt-4 p-4 rounded-lg" style="background: var(--section-bg);">
        <h4 class="text-sm font-medium mb-3 opacity-80" style="color: var(--text-color);">Total Storage</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div class="text-lg font-bold" style="color: var(--primary-color);">
              {{ formatBytes(zfsMetrics.totalSizeBytes) }}
            </div>
            <div class="text-xs opacity-70" style="color: var(--text-color);">Total Capacity</div>
          </div>
          <div>
            <div class="text-lg font-bold" style="color: var(--primary-color);">
              {{ formatBytes(zfsMetrics.totalAllocatedBytes) }}
            </div>
            <div class="text-xs opacity-70" style="color: var(--text-color);">Used Space</div>
          </div>
          <div>
            <div class="text-lg font-bold" style="color: var(--primary-color);">
              {{ formatBytes(zfsMetrics.totalFreeBytes) }}
            </div>
            <div class="text-xs opacity-70" style="color: var(--text-color);">Free Space</div>
          </div>
          <div>
            <div class="text-lg font-bold" style="color: var(--primary-color);">
              {{ Math.round(zfsMetrics.averageUsagePercent) }}%
            </div>
            <div class="text-xs opacity-70" style="color: var(--text-color);">Average Usage</div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else class="text-center py-8">
      <Database class="w-12 h-12 mx-auto mb-2 opacity-50" style="color: var(--text-color);" />
      <p class="text-sm opacity-70" style="color: var(--text-color);">No ZFS pools detected</p>
    </div>

    <!-- Refresh Button -->
    <div class="widget-actions mt-4 flex items-center justify-between">
      <button
        @click="refreshData"
        :disabled="isLoading"
        class="mario-button-small flex items-center gap-1"
      >
        <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': isLoading }" />
        Refresh
      </button>
      <div class="text-xs opacity-50" style="color: var(--text-color);">
        Auto-refresh: {{ autoRefreshInterval }}s
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { Database, RefreshCw } from 'lucide-vue-next'
import { Chart, ChartConfiguration, DoughnutController, ArcElement, Tooltip, Legend, Title } from 'chart.js'
import { zfsService, type ZFSMetrics } from '../../services/zfsApi'
import { MetricsUtils } from '../../services/prometheusApi'

// Register only the Chart.js components we need
Chart.register(DoughnutController, ArcElement, Tooltip, Legend, Title)

// Reactive data
const zfsMetrics = ref<ZFSMetrics | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const chartCanvas = ref<HTMLCanvasElement | null>(null)
const chartInstance = ref<Chart | null>(null)

// Settings
const autoRefreshInterval = 30 // seconds
let refreshTimer: NodeJS.Timeout | null = null

// Computed properties
const lastUpdated = computed(() => {
  if (!zfsMetrics.value?.lastUpdated) return 'Never'
  return zfsMetrics.value.lastUpdated.toLocaleTimeString()
})

const capacityAlerts = computed(() => {
  if (!zfsMetrics.value?.pools) return []
  return zfsService.getCapacityAlerts(zfsMetrics.value.pools)
})

const alertCount = computed(() => capacityAlerts.value.length)

// Chart data
const chartData = computed<ChartConfiguration>(() => {
  if (!zfsMetrics.value?.pools) {
    return { type: 'doughnut', data: { labels: [], datasets: [] } }
  }

  const pools = zfsMetrics.value.pools
  const labels = pools.map(pool => pool.name)
  const data = pools.map(pool => pool.usagePercent)
  const backgroundColors = pools.map(pool => getUsageColor(pool.usagePercent))

  return {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        label: 'Pool Usage %',
        data,
        backgroundColor: backgroundColors,
        borderColor: 'var(--card-bg)',
        borderWidth: 2,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            usePointStyle: true,
            color: 'var(--text-color)'
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const pool = pools[context.dataIndex]
              const capacity = zfsService.formatPoolCapacity(pool)
              return `${context.label}: ${capacity}`
            }
          }
        }
      },
      cutout: '60%'
    }
  }
})

// Methods
const refreshData = async () => {
  if (isLoading.value) return

  isLoading.value = true
  error.value = null

  try {
    zfsMetrics.value = await zfsService.getPoolMetrics()
    await nextTick()
    updateChart()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch ZFS metrics'
    console.error('ZFS metrics error:', err)
  } finally {
    isLoading.value = false
  }
}

const updateChart = () => {
  if (!chartCanvas.value || !chartData.value) return

  // Destroy existing chart
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }

  // Create new chart
  const ctx = chartCanvas.value.getContext('2d')
  if (ctx) {
    chartInstance.value = new Chart(ctx, chartData.value)
  }
}

const getPoolStatusColor = (pool: { health: number }) => {
  return pool.health === 1 ? '#10b981' : '#f59e0b' // green or amber
}

const getUsageColor = (percentage: number) => {
  if (percentage >= 90) return '#ef4444' // red
  if (percentage >= 80) return '#f59e0b' // amber
  if (percentage >= 60) return '#eab308' // yellow
  return '#10b981' // green
}

const formatBytes = (bytes: number) => {
  return MetricsUtils.formatBytes(bytes)
}

const startAutoRefresh = () => {
  refreshTimer = setInterval(refreshData, autoRefreshInterval * 1000)
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// Lifecycle
onMounted(async () => {
  await refreshData()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
})
</script>

<style scoped>
.pool-card {
  transition: all 0.2s ease;
}

.pool-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.progress-bar {
  background: rgba(0, 0, 0, 0.1);
}

.progress-fill {
  transition: width 0.5s ease, background-color 0.3s ease;
}

.alert-indicator {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.chart-container {
  position: relative;
  height: 300px;
  margin: 0 auto;
}

.statistics-section {
  border: 1px solid rgba(var(--primary-color-rgb), 0.2);
}

@media (max-width: 768px) {
  .chart-container {
    height: 250px;
  }

  .statistics-section .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}
</style>