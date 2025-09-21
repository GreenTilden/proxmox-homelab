# ⚡ Writer Thread - LCiBot Real-time Monitoring Implementation (Cycle 3)

## Thread Identity & Authority
**Directory**: `~/projects/proxmox-homelab-writer/lcibot-dashboard/`  
**Symbol**: ⚡  
**Model**: Opus (Implementation & System Modifications)  
**Cycle**: **3** - LCiBot Live Dashboard Monitoring Integration  
**Date**: 2025-09-12  
**Sequential Position**: Thread 3 of 5 (Main → Reader → **Writer** → Debug → Documentation)

## Mission Objective
Implement comprehensive real-time monitoring integration into the existing LCiBot Dashboard, extending the proven Vue.js framework with live system metrics, service health monitoring, and dynamic data visualizations while maintaining performance excellence and theme compatibility.

## 🏗️ Implementation Foundation

### Cycle 2 Technical Heritage
**Proven Architecture**: LCiBot Dashboard at http://192.168.0.99:8091  
**Performance Baseline**: 84KB bundle size with <1.5s load time  
**Vue.js Framework**: Vue 3 + TypeScript + TailwindCSS architecture  
**Theme System**: 5 Mario-inspired themes with real-time switching  
**Mobile Optimization**: Touch-friendly interface with responsive design

### Reader Thread Integration Requirements
**Technical Specifications** (From Reader Analysis):
- **Prometheus API Integration** - Real-time metrics fetching patterns
- **Grafana Embedding Strategy** - Theme-aware monitoring widget integration
- **Vue.js Component Architecture** - Performance-optimized monitoring widgets
- **Mobile Optimization Requirements** - Touch interface and battery efficiency
- **Bundle Size Constraints** - Maintain <100KB total with monitoring features

## ⚡ Writer Thread Implementation Strategy

### 1. Prometheus API Integration Layer

#### API Client Implementation
```typescript
// src/services/prometheusApi.ts
interface PrometheusResponse {
  status: 'success' | 'error'
  data: {
    resultType: 'matrix' | 'vector' | 'scalar' | 'string'
    result: PrometheusMetric[]
  }
  error?: string
}

interface PrometheusMetric {
  metric: Record<string, string>
  value?: [number, string]
  values?: Array<[number, string]>
}

class PrometheusClient {
  private baseUrl = 'http://192.168.0.99:9090'
  private cache = new Map<string, CachedResponse>()
  
  async query(query: string): Promise<PrometheusResponse> {
    const cacheKey = `query:${query}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < 30000) {
      return cached.data
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/query?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      })
      
      if (!response.ok) throw new Error(`Prometheus API error: ${response.status}`)
      
      const data = await response.json()
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      
      return data
    } catch (error) {
      console.error('Prometheus query failed:', error)
      throw new Error(`Failed to fetch metrics: ${error.message}`)
    }
  }
  
  async queryRange(query: string, start: number, end: number, step: number): Promise<PrometheusResponse> {
    const params = new URLSearchParams({
      query,
      start: start.toString(),
      end: end.toString(),
      step: step.toString()
    })
    
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/query_range?${params}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      })
      
      if (!response.ok) throw new Error(`Prometheus range query error: ${response.status}`)
      
      return await response.json()
    } catch (error) {
      console.error('Prometheus range query failed:', error)
      throw new Error(`Failed to fetch metrics range: ${error.message}`)
    }
  }
}

export const prometheusClient = new PrometheusClient()
```

#### Common Metrics Queries
```typescript
// src/services/systemMetrics.ts
export const SYSTEM_QUERIES = {
  // CPU Metrics
  cpuUsage: '100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)',
  cpuCores: 'count(count(node_cpu_seconds_total) by (cpu))',
  loadAverage: 'node_load1',
  
  // Memory Metrics
  memoryTotal: 'node_memory_MemTotal_bytes',
  memoryAvailable: 'node_memory_MemAvailable_bytes',
  memoryUsagePercent: '100 * (1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)',
  
  // Storage Metrics
  diskUsage: '100 - (node_filesystem_avail_bytes / node_filesystem_size_bytes * 100)',
  diskTotal: 'node_filesystem_size_bytes{fstype!="tmpfs"}',
  diskUsed: 'node_filesystem_size_bytes{fstype!="tmpfs"} - node_filesystem_free_bytes{fstype!="tmpfs"}',
  
  // Network Metrics
  networkReceive: 'rate(node_network_receive_bytes_total[5m])',
  networkTransmit: 'rate(node_network_transmit_bytes_total[5m])',
  
  // Service Health
  serviceHealth: 'up',
  prometheusTargets: 'prometheus_target_health',
  
  // Container Metrics
  containerCpuUsage: 'sum(rate(container_cpu_usage_seconds_total{name!=""}[5m])) by (name)',
  containerMemoryUsage: 'sum(container_memory_usage_bytes{name!=""}) by (name)',
  containerCount: 'count(container_last_seen{name!=""})'
}
```

### 2. Vue.js Monitoring Components Implementation

#### System Metrics Widget
```vue
<!-- src/components/SystemMetricsWidget.vue -->
<template>
  <div class="lcibot-card system-metrics-widget">
    <div class="widget-header">
      <h3 class="text-lg font-semibold text-lcibot-text">
        <Server class="inline w-5 h-5 mr-2" />
        System Metrics
      </h3>
      <div class="flex items-center space-x-2">
        <div class="status-indicator" :class="statusClass">
          {{ statusIcon }}
        </div>
        <span class="text-xs text-lcibot-muted">
          {{ lastUpdated }}
        </span>
      </div>
    </div>
    
    <div class="metrics-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
      <MetricCard
        title="CPU Usage"
        :value="formatPercent(systemMetrics.cpuUsage)"
        :trend="cpuTrend"
        :status="getMetricStatus(systemMetrics.cpuUsage, 80, 90)"
        icon="Cpu"
      />
      
      <MetricCard
        title="Memory Usage"
        :value="formatPercent(systemMetrics.memoryUsage)"
        :trend="memoryTrend"
        :status="getMetricStatus(systemMetrics.memoryUsage, 75, 85)"
        icon="MemoryStick"
      />
      
      <MetricCard
        title="Storage Usage"
        :value="formatPercent(systemMetrics.diskUsage)"
        :trend="diskTrend"
        :status="getMetricStatus(systemMetrics.diskUsage, 80, 90)"
        icon="HardDrive"
      />
      
      <MetricCard
        title="Load Average"
        :value="formatLoad(systemMetrics.loadAverage)"
        :trend="loadTrend"
        :status="getLoadStatus(systemMetrics.loadAverage, systemMetrics.cpuCores)"
        icon="Activity"
      />
    </div>
    
    <div class="metrics-chart mt-6" v-if="showChart">
      <MiniChart
        :data="historicalData"
        :theme="currentTheme"
        type="area"
        height="120"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Server, Cpu, MemoryStick, HardDrive, Activity } from 'lucide-vue-next'
import { useSystemMetrics } from '@/composables/useSystemMetrics'
import { useTheme } from '@/composables/useTheme'
import MetricCard from './MetricCard.vue'
import MiniChart from './MiniChart.vue'

interface SystemMetrics {
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  loadAverage: number
  cpuCores: number
  lastUpdate: Date
}

const { currentTheme } = useTheme()
const { 
  systemMetrics, 
  historicalData, 
  isLoading, 
  error,
  startMonitoring,
  stopMonitoring 
} = useSystemMetrics()

const showChart = ref(true)

const statusClass = computed(() => ({
  'status-online': !isLoading.value && !error.value,
  'status-loading': isLoading.value,
  'status-error': error.value
}))

const statusIcon = computed(() => {
  if (error.value) return '❌'
  if (isLoading.value) return '🔄'
  return '✅'
})

const lastUpdated = computed(() => {
  if (!systemMetrics.value.lastUpdate) return 'Never'
  const diff = Date.now() - systemMetrics.value.lastUpdate.getTime()
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
  return `${Math.floor(diff / 60000)}m ago`
})

const formatPercent = (value: number): string => `${Math.round(value)}%`
const formatLoad = (value: number): string => value.toFixed(2)

const getMetricStatus = (value: number, warning: number, critical: number) => {
  if (value >= critical) return 'critical'
  if (value >= warning) return 'warning'  
  return 'normal'
}

const getLoadStatus = (load: number, cores: number) => {
  const ratio = load / cores
  if (ratio > 1.5) return 'critical'
  if (ratio > 1.0) return 'warning'
  return 'normal'
}

// Computed trends (simplified - would calculate from historical data)
const cpuTrend = computed(() => 'stable')
const memoryTrend = computed(() => 'stable')
const diskTrend = computed(() => 'stable')
const loadTrend = computed(() => 'stable')

onMounted(() => {
  startMonitoring()
})

onUnmounted(() => {
  stopMonitoring()
})
</script>

<style scoped>
.system-metrics-widget {
  @apply p-6 rounded-xl bg-gradient-to-br from-lcibot-card to-lcibot-section border border-lcibot-muted/20;
}

.widget-header {
  @apply flex items-center justify-between;
}

.status-indicator {
  @apply px-2 py-1 rounded-full text-xs font-medium;
}

.status-online {
  @apply bg-green-500/20 text-green-300;
}

.status-loading {
  @apply bg-yellow-500/20 text-yellow-300 animate-pulse;
}

.status-error {
  @apply bg-red-500/20 text-red-300;
}

.metrics-grid {
  @apply transition-all duration-300;
}

@media (max-width: 768px) {
  .metrics-grid {
    @apply grid-cols-2 gap-3;
  }
  
  .system-metrics-widget {
    @apply p-4;
  }
}
</style>
```

#### Service Health Dashboard Component
```vue
<!-- src/components/ServiceHealthDashboard.vue -->
<template>
  <div class="lcibot-card service-health-dashboard">
    <div class="dashboard-header">
      <h3 class="text-lg font-semibold text-lcibot-text">
        <Shield class="inline w-5 h-5 mr-2" />
        Service Health Dashboard
      </h3>
      <div class="health-summary">
        <span class="service-count online">{{ onlineServices.length }} Online</span>
        <span class="service-count offline">{{ offlineServices.length }} Offline</span>
        <span class="service-count checking">{{ checkingServices.length }} Checking</span>
      </div>
    </div>
    
    <div class="services-grid">
      <ServiceHealthCard
        v-for="service in services"
        :key="service.id"
        :service="service"
        :theme="currentTheme"
        @refresh="refreshService"
      />
    </div>
    
    <div class="health-actions mt-4">
      <button 
        @click="refreshAllServices"
        :disabled="isRefreshing"
        class="lcibot-button lcibot-button-primary"
      >
        <RefreshCw class="w-4 h-4 mr-2" :class="{ 'animate-spin': isRefreshing }" />
        Refresh All Services
      </button>
      
      <button 
        @click="toggleAutoRefresh"
        class="lcibot-button"
        :class="autoRefreshEnabled ? 'lcibot-button-accent' : 'lcibot-button-secondary'"
      >
        <Clock class="w-4 h-4 mr-2" />
        Auto-refresh: {{ autoRefreshEnabled ? 'On' : 'Off' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Shield, RefreshCw, Clock } from 'lucide-vue-next'
import { useServiceMonitoring } from '@/composables/useServiceMonitoring'
import { useTheme } from '@/composables/useTheme'
import ServiceHealthCard from './ServiceHealthCard.vue'

const { currentTheme } = useTheme()
const {
  services,
  isRefreshing,
  autoRefreshEnabled,
  refreshAllServices,
  refreshService,
  toggleAutoRefresh,
  startAutoRefresh,
  stopAutoRefresh
} = useServiceMonitoring()

const onlineServices = computed(() => 
  services.value.filter(service => service.status === 'online')
)

const offlineServices = computed(() =>
  services.value.filter(service => service.status === 'offline')
)

const checkingServices = computed(() =>
  services.value.filter(service => service.status === 'checking')
)

onMounted(() => {
  refreshAllServices()
  if (autoRefreshEnabled.value) {
    startAutoRefresh()
  }
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.service-health-dashboard {
  @apply p-6 rounded-xl bg-gradient-to-br from-lcibot-card to-lcibot-section border border-lcibot-muted/20;
}

.dashboard-header {
  @apply flex items-center justify-between mb-4;
}

.health-summary {
  @apply flex items-center space-x-4 text-sm;
}

.service-count {
  @apply px-3 py-1 rounded-full font-medium;
}

.service-count.online {
  @apply bg-green-500/20 text-green-300;
}

.service-count.offline {
  @apply bg-red-500/20 text-red-300;  
}

.service-count.checking {
  @apply bg-yellow-500/20 text-yellow-300;
}

.services-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4;
}

.health-actions {
  @apply flex items-center space-x-3 pt-4 border-t border-lcibot-muted/20;
}

@media (max-width: 768px) {
  .dashboard-header {
    @apply flex-col items-start space-y-2;
  }
  
  .health-summary {
    @apply flex-wrap;
  }
  
  .services-grid {
    @apply grid-cols-1;
  }
  
  .health-actions {
    @apply flex-col items-stretch space-y-2 space-x-0;
  }
}
</style>
```

#### Real-time Chart Component
```vue
<!-- src/components/MiniChart.vue -->
<template>
  <div class="mini-chart" :style="{ height: height + 'px' }">
    <canvas 
      ref="chartCanvas"
      :width="canvasWidth"
      :height="canvasHeight"
      class="chart-canvas"
    ></canvas>
    <div v-if="loading" class="chart-loading">
      <div class="animate-pulse text-lcibot-muted">Loading chart data...</div>
    </div>
    <div v-if="error" class="chart-error">
      <div class="text-red-300 text-sm">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

interface ChartDataPoint {
  timestamp: number
  value: number
}

interface Props {
  data: ChartDataPoint[]
  theme: string
  type?: 'line' | 'area' | 'bar'
  height?: number
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'line',
  height: 120,
  color: 'var(--lcibot-primary)'
})

const chartCanvas = ref<HTMLCanvasElement>()
const canvasWidth = ref(400)
const canvasHeight = ref(props.height)
const loading = ref(false)
const error = ref('')

let resizeObserver: ResizeObserver | null = null

const drawChart = () => {
  if (!chartCanvas.value || !props.data.length) return
  
  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return
  
  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // Chart styling based on theme
  const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--lcibot-primary').trim()
  const textColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--lcibot-text').trim()
  
  // Data processing
  const values = props.data.map(d => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const valueRange = maxValue - minValue || 1
  
  // Chart dimensions
  const padding = 20
  const chartWidth = canvasWidth.value - (padding * 2)
  const chartHeight = canvasHeight.value - (padding * 2)
  
  // Draw chart based on type
  ctx.strokeStyle = primaryColor
  ctx.lineWidth = 2
  
  if (props.type === 'area') {
    // Area chart with gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, chartHeight)
    gradient.addColorStop(0, primaryColor + '40')
    gradient.addColorStop(1, primaryColor + '10')
    ctx.fillStyle = gradient
  }
  
  ctx.beginPath()
  
  props.data.forEach((point, index) => {
    const x = padding + (index / (props.data.length - 1)) * chartWidth
    const y = padding + ((maxValue - point.value) / valueRange) * chartHeight
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()
  
  if (props.type === 'area') {
    // Complete area path
    const lastX = padding + chartWidth
    const bottomY = padding + chartHeight
    ctx.lineTo(lastX, bottomY)
    ctx.lineTo(padding, bottomY)
    ctx.closePath()
    ctx.fill()
  }
  
  // Add data points
  ctx.fillStyle = primaryColor
  props.data.forEach((point, index) => {
    const x = padding + (index / (props.data.length - 1)) * chartWidth
    const y = padding + ((maxValue - point.value) / valueRange) * chartHeight
    
    ctx.beginPath()
    ctx.arc(x, y, 2, 0, 2 * Math.PI)
    ctx.fill()
  })
}

const handleResize = () => {
  if (!chartCanvas.value) return
  
  const rect = chartCanvas.value.parentElement?.getBoundingClientRect()
  if (rect) {
    canvasWidth.value = rect.width
    canvasHeight.value = props.height
    
    nextTick(() => {
      drawChart()
    })
  }
}

onMounted(() => {
  if (chartCanvas.value) {
    resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(chartCanvas.value.parentElement!)
    
    handleResize()
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

// Redraw when data or theme changes
watch([() => props.data, () => props.theme], () => {
  nextTick(() => {
    drawChart()
  })
}, { deep: true })
</script>

<style scoped>
.mini-chart {
  @apply relative w-full overflow-hidden rounded-lg bg-lcibot-section/50;
}

.chart-canvas {
  @apply w-full h-full;
}

.chart-loading,
.chart-error {
  @apply absolute inset-0 flex items-center justify-center;
}
</style>
```

### 3. Real-time Data Management Composables

#### System Metrics Composable
```typescript
// src/composables/useSystemMetrics.ts
import { ref, reactive, onUnmounted } from 'vue'
import { prometheusClient, SYSTEM_QUERIES } from '@/services/prometheusApi'

interface SystemMetrics {
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  loadAverage: number
  cpuCores: number
  networkReceive: number
  networkTransmit: number
  lastUpdate: Date
}

interface HistoricalDataPoint {
  timestamp: number
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  loadAverage: number
}

export const useSystemMetrics = () => {
  const systemMetrics = ref<SystemMetrics>({
    cpuUsage: 0,
    memoryUsage: 0, 
    diskUsage: 0,
    loadAverage: 0,
    cpuCores: 0,
    networkReceive: 0,
    networkTransmit: 0,
    lastUpdate: new Date()
  })
  
  const historicalData = ref<HistoricalDataPoint[]>([])
  const isLoading = ref(false)
  const error = ref('')
  
  let monitoringInterval: NodeJS.Timeout | null = null
  let historicalInterval: NodeJS.Timeout | null = null
  
  const fetchCurrentMetrics = async (): Promise<void> => {
    try {
      isLoading.value = true
      error.value = ''
      
      // Fetch all metrics in parallel
      const [
        cpuResponse,
        memoryResponse,
        diskResponse,
        loadResponse,
        coresResponse,
        networkRxResponse,
        networkTxResponse
      ] = await Promise.allSettled([
        prometheusClient.query(SYSTEM_QUERIES.cpuUsage),
        prometheusClient.query(SYSTEM_QUERIES.memoryUsagePercent),
        prometheusClient.query(SYSTEM_QUERIES.diskUsage),
        prometheusClient.query(SYSTEM_QUERIES.loadAverage),
        prometheusClient.query(SYSTEM_QUERIES.cpuCores),
        prometheusClient.query(SYSTEM_QUERIES.networkReceive),
        prometheusClient.query(SYSTEM_QUERIES.networkTransmit)
      ])
      
      // Process successful responses
      if (cpuResponse.status === 'fulfilled' && cpuResponse.value.status === 'success') {
        const result = cpuResponse.value.data.result[0]
        systemMetrics.value.cpuUsage = parseFloat(result?.value?.[1] || '0')
      }
      
      if (memoryResponse.status === 'fulfilled' && memoryResponse.value.status === 'success') {
        const result = memoryResponse.value.data.result[0]
        systemMetrics.value.memoryUsage = parseFloat(result?.value?.[1] || '0')
      }
      
      if (diskResponse.status === 'fulfilled' && diskResponse.value.status === 'success') {
        const result = diskResponse.value.data.result[0]
        systemMetrics.value.diskUsage = parseFloat(result?.value?.[1] || '0')
      }
      
      if (loadResponse.status === 'fulfilled' && loadResponse.value.status === 'success') {
        const result = loadResponse.value.data.result[0]
        systemMetrics.value.loadAverage = parseFloat(result?.value?.[1] || '0')
      }
      
      if (coresResponse.status === 'fulfilled' && coresResponse.value.status === 'success') {
        const result = coresResponse.value.data.result[0]
        systemMetrics.value.cpuCores = parseFloat(result?.value?.[1] || '0')
      }
      
      systemMetrics.value.lastUpdate = new Date()
      
    } catch (err) {
      console.error('Failed to fetch system metrics:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      isLoading.value = false
    }
  }
  
  const fetchHistoricalMetrics = async (): Promise<void> => {
    try {
      const endTime = Math.floor(Date.now() / 1000)
      const startTime = endTime - (3600) // Last hour
      const step = 300 // 5-minute intervals
      
      const [cpuHistory, memoryHistory, diskHistory, loadHistory] = await Promise.allSettled([
        prometheusClient.queryRange(SYSTEM_QUERIES.cpuUsage, startTime, endTime, step),
        prometheusClient.queryRange(SYSTEM_QUERIES.memoryUsagePercent, startTime, endTime, step),
        prometheusClient.queryRange(SYSTEM_QUERIES.diskUsage, startTime, endTime, step),
        prometheusClient.queryRange(SYSTEM_QUERIES.loadAverage, startTime, endTime, step)
      ])
      
      // Combine historical data points
      const dataPoints: HistoricalDataPoint[] = []
      
      if (cpuHistory.status === 'fulfilled' && cpuHistory.value.status === 'success') {
        const cpuData = cpuHistory.value.data.result[0]?.values || []
        
        cpuData.forEach(([timestamp, value]) => {
          const existing = dataPoints.find(p => p.timestamp === timestamp)
          if (existing) {
            existing.cpuUsage = parseFloat(value)
          } else {
            dataPoints.push({
              timestamp: timestamp * 1000, // Convert to milliseconds
              cpuUsage: parseFloat(value),
              memoryUsage: 0,
              diskUsage: 0,
              loadAverage: 0
            })
          }
        })
      }
      
      // Process other metrics similarly...
      historicalData.value = dataPoints.sort((a, b) => a.timestamp - b.timestamp)
      
    } catch (err) {
      console.error('Failed to fetch historical metrics:', err)
    }
  }
  
  const startMonitoring = (): void => {
    // Initial fetch
    fetchCurrentMetrics()
    fetchHistoricalMetrics()
    
    // Set up intervals
    monitoringInterval = setInterval(fetchCurrentMetrics, 30000) // Every 30 seconds
    historicalInterval = setInterval(fetchHistoricalMetrics, 300000) // Every 5 minutes
  }
  
  const stopMonitoring = (): void => {
    if (monitoringInterval) {
      clearInterval(monitoringInterval)
      monitoringInterval = null
    }
    
    if (historicalInterval) {
      clearInterval(historicalInterval)
      historicalInterval = null
    }
  }
  
  // Cleanup on unmount
  onUnmounted(() => {
    stopMonitoring()
  })
  
  return {
    systemMetrics: readonly(systemMetrics),
    historicalData: readonly(historicalData),
    isLoading: readonly(isLoading),
    error: readonly(error),
    startMonitoring,
    stopMonitoring,
    fetchCurrentMetrics,
    fetchHistoricalMetrics
  }
}
```

### 4. Theme System Extension for Monitoring

#### Monitoring Theme Variables
```css
/* src/style.css - Extend existing theme system */

/* Add monitoring-specific variables to existing theme classes */

.theme-purple {
  /* ... existing purple theme variables ... */
  
  /* Monitoring widget colors */
  --lcibot-monitoring-success: rgba(34, 197, 94, 1);
  --lcibot-monitoring-warning: rgba(251, 191, 36, 1);
  --lcibot-monitoring-critical: rgba(239, 68, 68, 1);
  --lcibot-monitoring-info: rgba(59, 130, 246, 1);
  
  /* Chart colors */
  --lcibot-chart-line: var(--lcibot-primary);
  --lcibot-chart-area: rgba(220, 100, 180, 0.1);
  --lcibot-chart-grid: rgba(220, 100, 180, 0.1);
  --lcibot-chart-text: var(--lcibot-muted);
  
  /* Widget backgrounds */
  --lcibot-widget-bg: var(--lcibot-card);
  --lcibot-widget-border: rgba(220, 100, 180, 0.2);
  --lcibot-widget-header: var(--lcibot-section);
}

.theme-classic {
  /* ... existing classic theme variables ... */
  
  /* Monitoring colors adapted for Mario classic theme */
  --lcibot-monitoring-success: rgba(76, 175, 80, 1);
  --lcibot-monitoring-warning: rgba(255, 193, 7, 1);
  --lcibot-monitoring-critical: rgba(244, 67, 54, 1);
  --lcibot-monitoring-info: rgba(33, 150, 243, 1);
  
  --lcibot-chart-line: var(--lcibot-primary);
  --lcibot-chart-area: rgba(200, 80, 80, 0.1);
  --lcibot-chart-grid: rgba(200, 80, 80, 0.1);
  --lcibot-chart-text: var(--lcibot-muted);
  
  --lcibot-widget-bg: var(--lcibot-card);
  --lcibot-widget-border: rgba(200, 80, 80, 0.2);
  --lcibot-widget-header: var(--lcibot-section);
}

/* Add monitoring variables to remaining themes... */

/* Monitoring component styles */
.monitoring-widget {
  background: var(--lcibot-widget-bg);
  border: 1px solid var(--lcibot-widget-border);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.metric-status-normal { color: var(--lcibot-monitoring-success); }
.metric-status-warning { color: var(--lcibot-monitoring-warning); }
.metric-status-critical { color: var(--lcibot-monitoring-critical); }

.chart-container {
  background: var(--lcibot-widget-header);
  border-radius: 0.5rem;
}
```

### 5. Mobile-Optimized Monitoring Interface

#### Mobile Monitoring Layout Component
```vue
<!-- src/components/MobileMonitoringDashboard.vue -->
<template>
  <div class="mobile-monitoring-dashboard">
    <div class="mobile-header">
      <h2 class="text-xl font-bold text-lcibot-text">System Monitor</h2>
      <div class="mobile-controls">
        <button 
          @click="toggleAutoRefresh"
          class="mobile-control-btn"
          :class="{ active: autoRefreshEnabled }"
        >
          <RefreshCw class="w-4 h-4" />
        </button>
        <button 
          @click="toggleFullscreen"
          class="mobile-control-btn"
        >
          <Maximize class="w-4 h-4" />
        </button>
      </div>
    </div>
    
    <div class="mobile-tabs">
      <button 
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="mobile-tab"
        :class="{ active: activeTab === tab.id }"
      >
        <component :is="tab.icon" class="w-4 h-4" />
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>
    
    <div class="mobile-content">
      <div v-if="activeTab === 'system'" class="tab-content">
        <div class="mobile-metrics-grid">
          <MobileMetricCard
            v-for="metric in systemMetrics"
            :key="metric.id"
            :metric="metric"
            @tap="showMetricDetail(metric)"
          />
        </div>
      </div>
      
      <div v-if="activeTab === 'services'" class="tab-content">
        <div class="mobile-services-list">
          <MobileServiceCard
            v-for="service in services"
            :key="service.id"
            :service="service"
            @tap="showServiceDetail(service)"
          />
        </div>
      </div>
      
      <div v-if="activeTab === 'alerts'" class="tab-content">
        <div class="mobile-alerts-list">
          <MobileAlertCard
            v-for="alert in alerts"
            :key="alert.id"
            :alert="alert"
          />
        </div>
      </div>
    </div>
    
    <!-- Mobile metric detail modal -->
    <MobileMetricDetailModal
      v-if="selectedMetric"
      :metric="selectedMetric"
      @close="selectedMetric = null"
    />
    
    <!-- Mobile service detail modal -->
    <MobileServiceDetailModal
      v-if="selectedService"
      :service="selectedService"
      @close="selectedService = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RefreshCw, Maximize, Server, Shield, AlertTriangle } from 'lucide-vue-next'
import { useSystemMetrics } from '@/composables/useSystemMetrics'
import { useServiceMonitoring } from '@/composables/useServiceMonitoring'

const activeTab = ref('system')
const selectedMetric = ref(null)
const selectedService = ref(null)
const autoRefreshEnabled = ref(true)

const tabs = [
  { id: 'system', label: 'System', icon: Server },
  { id: 'services', label: 'Services', icon: Shield },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle }
]

const { systemMetrics, startMonitoring } = useSystemMetrics()
const { services } = useServiceMonitoring()

const alerts = ref([]) // Would be populated from monitoring system

const showMetricDetail = (metric: any) => {
  selectedMetric.value = metric
}

const showServiceDetail = (service: any) => {
  selectedService.value = service
}

const toggleAutoRefresh = () => {
  autoRefreshEnabled.value = !autoRefreshEnabled.value
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

onMounted(() => {
  startMonitoring()
})
</script>

<style scoped>
.mobile-monitoring-dashboard {
  @apply flex flex-col h-screen bg-lcibot-bg;
}

.mobile-header {
  @apply flex items-center justify-between p-4 bg-lcibot-section border-b border-lcibot-muted/20;
}

.mobile-controls {
  @apply flex items-center space-x-2;
}

.mobile-control-btn {
  @apply p-2 rounded-lg bg-lcibot-card text-lcibot-text border border-lcibot-muted/20 transition-colors;
}

.mobile-control-btn.active,
.mobile-control-btn:active {
  @apply bg-lcibot-primary text-white;
}

.mobile-tabs {
  @apply flex bg-lcibot-section border-b border-lcibot-muted/20;
}

.mobile-tab {
  @apply flex-1 flex flex-col items-center justify-center py-3 space-y-1 transition-colors;
}

.mobile-tab.active {
  @apply bg-lcibot-primary/20 text-lcibot-primary border-b-2 border-lcibot-primary;
}

.tab-label {
  @apply text-xs font-medium;
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

/* Touch-friendly sizing for mobile */
@media (max-width: 480px) {
  .mobile-metrics-grid {
    @apply grid-cols-1;
  }
}
</style>
```

### 6. Performance Optimization Implementation

#### Bundle Size Monitoring
```typescript
// src/utils/bundleAnalysis.ts
export const BUNDLE_SIZE_TARGETS = {
  total: 100 * 1024, // 100KB
  javascript: 70 * 1024, // 70KB
  css: 15 * 1024, // 15KB
  assets: 15 * 1024 // 15KB
}

export const trackBundleSize = () => {
  if (process.env.NODE_ENV === 'production') {
    // Bundle size tracking for production builds
    console.log('🎯 LCiBot Bundle Analysis:')
    
    // Would integrate with webpack-bundle-analyzer or similar
    // Track against performance targets
    
    const performanceMetrics = {
      bundleSize: document.documentElement.innerHTML.length,
      loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
      interactiveTime: performance.timing.domInteractive - performance.timing.navigationStart
    }
    
    console.table(performanceMetrics)
  }
}
```

#### Lazy Loading for Monitoring Components
```typescript
// src/router/index.ts - Add lazy loading for monitoring components
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // ... existing routes ...
  {
    path: '/monitoring',
    name: 'Monitoring',
    component: () => import('@/views/MonitoringDashboard.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/mobile-monitoring', 
    name: 'MobileMonitoring',
    component: () => import('@/views/MobileMonitoringDashboard.vue'),
    meta: { requiresAuth: false, mobile: true }
  }
]

// Mobile detection for routing
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

router.beforeEach((to, from, next) => {
  // Redirect to mobile monitoring on mobile devices
  if (isMobile && to.path === '/monitoring') {
    next('/mobile-monitoring')
  } else {
    next()
  }
})
```

## 🎯 Writer Thread Success Criteria

### Implementation Completeness Checklist
- [ ] **Prometheus API Integration** - Real-time metrics fetching with error handling
- [ ] **Vue.js Monitoring Components** - SystemMetricsWidget, ServiceHealthDashboard, MiniChart
- [ ] **Real-time Data Management** - useSystemMetrics and useServiceMonitoring composables
- [ ] **Theme System Extension** - Monitoring colors for all 5 Mario themes
- [ ] **Mobile-Optimized Interface** - Touch-friendly monitoring controls and layouts
- [ ] **Performance Optimization** - Bundle size <100KB, efficient API caching
- [ ] **Error Handling** - Graceful degradation when monitoring services unavailable
- [ ] **Production Deployment** - Docker integration and health checks

### Performance Targets
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Bundle Size** | <100KB total | Webpack bundle analyzer |
| **API Response Time** | <500ms | Prometheus query timing |
| **Chart Rendering** | <100ms | requestAnimationFrame timing |
| **Mobile Scroll Performance** | 60fps | Chrome DevTools performance |
| **Memory Usage** | <50MB sustained | Browser task manager |

### Quality Standards
- **Cross-Browser Compatibility** - Chrome, Firefox, Safari, Edge support
- **Mobile Responsiveness** - Touch targets ≥44px, smooth scrolling
- **Theme Consistency** - All monitoring components work with 5 themes
- **Error Resilience** - Monitoring works when individual services unavailable
- **Production Stability** - No console errors, proper error boundaries

## 🔄 Current 5-Thread Execution Status - Cycle 3
- **🎯 Main (Opus)**: ✅ COMPLETE - Monitoring integration architecture established  
- **🔍 Reader (Sonnet)**: ✅ COMPLETE - Infrastructure analysis and implementation specifications provided
- **⚡ Writer (Opus)**: **ACTIVE** - Real-time monitoring integration implementation in progress
- **🔧 Debug (Opus)**: **READY** - Performance optimization framework prepared for handoff
- **📚 Documentation (Sonnet)**: **PREPARED** - Knowledge synthesis framework initialized

## Sequential Workflow Position
**Previous**: Reader Thread (Technical Analysis Complete)  
**Current**: Writer Thread (Real-time Monitoring Implementation)  
**Next**: Debug Thread (Performance Optimization & Production Polish)  
**Handoff Target**: Complete monitoring integration ready for optimization and production deployment

## 🏆 Writer Thread Success Definition
Complete real-time monitoring integration into LCiBot Dashboard:
- **✅ Live System Metrics** - CPU, memory, storage, network monitoring widgets
- **✅ Real-time Service Health** - Dynamic status for all 16+ homelab services  
- **✅ Theme-Aware Monitoring** - Visualizations compatible with all 5 Mario themes
- **✅ Mobile-Optimized Interface** - Touch-friendly monitoring controls and layouts
- **✅ Performance Excellence** - <100KB bundle size with real-time features
- **✅ Production-Ready Integration** - Stable monitoring deployment with error handling

---

**Expected Completion**: Enhanced LCiBot Dashboard with comprehensive real-time monitoring capabilities, maintaining performance excellence while providing unified system visibility and mobile-optimized monitoring interface for complete homelab infrastructure management.