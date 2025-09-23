<template>
  <div class="service-metrics" v-if="showMetrics">
    <!-- Node Exporter Metrics -->
    <div v-if="serviceId === 'node-exporter'" class="metrics-grid">
      <div class="metric-item">
        <span class="metric-label">CPU</span>
        <div class="metric-bar">
          <div class="bar-fill" :style="{ width: cpuUsage + '%', backgroundColor: getStatusColor(cpuUsage, 80) }"></div>
        </div>
        <span class="metric-value">{{ cpuUsage.toFixed(1) }}%</span>
      </div>

      <div class="metric-item">
        <span class="metric-label">MEM</span>
        <div class="metric-bar">
          <div class="bar-fill" :style="{ width: memoryUsage + '%', backgroundColor: getStatusColor(memoryUsage, 85) }"></div>
        </div>
        <span class="metric-value">{{ memoryUsage.toFixed(1) }}%</span>
      </div>

      <div class="metric-item">
        <span class="metric-label">LOAD</span>
        <span class="metric-value">{{ loadAverage }}</span>
      </div>
    </div>

    <!-- ZFS Exporter Metrics -->
    <div v-else-if="serviceId === 'zfs-exporter'" class="metrics-grid">
      <div v-for="pool in zfsPools" :key="pool.name" class="metric-item">
        <span class="metric-label">{{ pool.name }}</span>
        <div class="metric-bar">
          <div class="bar-fill" :style="{ width: pool.usage + '%', backgroundColor: getStatusColor(pool.usage, 90) }"></div>
        </div>
        <span class="metric-value">{{ pool.usage.toFixed(0) }}%</span>
      </div>
    </div>

    <!-- cAdvisor Metrics -->
    <div v-else-if="serviceId === 'cadvisor'" class="metrics-grid">
      <div class="metric-item">
        <span class="metric-label">Containers</span>
        <span class="metric-value">{{ containerCount }}</span>
      </div>

      <div class="metric-item">
        <span class="metric-label">CPU</span>
        <div class="metric-bar">
          <div class="bar-fill" :style="{ width: containerCpu + '%', backgroundColor: getStatusColor(containerCpu, 70) }"></div>
        </div>
        <span class="metric-value">{{ containerCpu.toFixed(1) }}%</span>
      </div>

      <div class="metric-item">
        <span class="metric-label">MEM</span>
        <div class="metric-bar">
          <div class="bar-fill" :style="{ width: containerMemory + '%', backgroundColor: getStatusColor(containerMemory, 80) }"></div>
        </div>
        <span class="metric-value">{{ containerMemory.toFixed(1) }}%</span>
      </div>
    </div>


    <!-- Prometheus Metrics -->
    <div v-else-if="serviceId === 'prometheus'" class="metrics-grid">
      <div class="metric-item">
        <span class="metric-label">Targets</span>
        <span class="metric-value">{{ activeTargets }}/{{ totalTargets }}</span>
      </div>

      <div class="metric-item">
        <span class="metric-label">Scrapes</span>
        <span class="metric-value">{{ scrapeRate }}/min</span>
      </div>

      <div class="metric-item">
        <span class="metric-label">Storage</span>
        <span class="metric-value">{{ formatBytes(storageSize) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  serviceId: string
  showMetrics?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showMetrics: true
})

// Reactive data
const cpuUsage = ref(0)
const memoryUsage = ref(0)
const loadAverage = ref('0.0')
const zfsPools = ref([])
const containerCount = ref(0)
const containerCpu = ref(0)
const containerMemory = ref(0)
const downloadSpeed = ref(0)
const uploadSpeed = ref(0)
const activeTorrents = ref(0)
const activeTargets = ref(0)
const totalTargets = ref(0)
const scrapeRate = ref(0)
const storageSize = ref(0)

let updateInterval: NodeJS.Timeout | null = null

// Helper functions
const getStatusColor = (value: number, threshold: number): string => {
  if (value > threshold) return '#ff0000'  // Red
  if (value > threshold * 0.7) return '#ffff00'  // Yellow
  return '#00ff00'  // Green
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Metric fetchers
const fetchNodeMetrics = async () => {
  try {
    // CPU usage
    const cpuResponse = await fetch('http://192.168.0.99:9090/api/v1/query?query=100 - (avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)')
    const cpuData = await cpuResponse.json()
    if (cpuData.status === 'success' && cpuData.data.result.length > 0) {
      cpuUsage.value = parseFloat(cpuData.data.result[0].value[1])
    }

    // Memory usage
    const memResponse = await fetch('http://192.168.0.99:9090/api/v1/query?query=(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100')
    const memData = await memResponse.json()
    if (memData.status === 'success' && memData.data.result.length > 0) {
      memoryUsage.value = parseFloat(memData.data.result[0].value[1])
    }

    // Load average
    const loadResponse = await fetch('http://192.168.0.99:9090/api/v1/query?query=node_load1')
    const loadData = await loadResponse.json()
    if (loadData.status === 'success' && loadData.data.result.length > 0) {
      loadAverage.value = parseFloat(loadData.data.result[0].value[1]).toFixed(1)
    }
  } catch (error) {
    console.warn('Failed to fetch node metrics:', error)
  }
}

const fetchZfsMetrics = async () => {
  try {
    const response = await fetch('http://192.168.0.99:9090/api/v1/query?query=zfs_pool_capacity_percent')
    const data = await response.json()
    if (data.status === 'success') {
      zfsPools.value = data.data.result.map(pool => ({
        name: pool.metric.pool.replace('-pool', ''),
        usage: parseFloat(pool.value[1])
      }))
    }
  } catch (error) {
    console.warn('Failed to fetch ZFS metrics:', error)
  }
}

const fetchContainerMetrics = async () => {
  try {
    // Container count
    const countResponse = await fetch('http://192.168.0.99:9090/api/v1/query?query=count(container_last_seen)')
    const countData = await countResponse.json()
    if (countData.status === 'success' && countData.data.result.length > 0) {
      containerCount.value = parseInt(countData.data.result[0].value[1])
    }

    // Container CPU (placeholder - would need proper aggregation)
    containerCpu.value = Math.random() * 30 + 10
    containerMemory.value = Math.random() * 40 + 20
  } catch (error) {
    console.warn('Failed to fetch container metrics:', error)
  }
}

const fetchQbittorrentMetrics = async () => {
  try {
    // Fetch real qBittorrent metrics from Prometheus
    const downloadResponse = await fetch('http://192.168.0.99:9090/api/v1/query?query=qbittorrent_session_downloaded_bytes_total')
    const downloadData = await downloadResponse.json()

    const uploadResponse = await fetch('http://192.168.0.99:9090/api/v1/query?query=qbittorrent_session_uploaded_bytes_total')
    const uploadData = await uploadResponse.json()

    const torrentsResponse = await fetch('http://192.168.0.99:9090/api/v1/query?query=qbittorrent_torrents_count')
    const torrentsData = await torrentsResponse.json()

    // Parse actual download speed (or 0 if no data)
    if (downloadData.status === 'success' && downloadData.data.result.length > 0) {
      downloadSpeed.value = parseFloat(downloadData.data.result[0].value[1]) || 0
    } else {
      downloadSpeed.value = 0
    }

    // Parse actual upload speed (or 0 if no data)
    if (uploadData.status === 'success' && uploadData.data.result.length > 0) {
      uploadSpeed.value = parseFloat(uploadData.data.result[0].value[1]) || 0
    } else {
      uploadSpeed.value = 0
    }

    // Parse active torrents count
    if (torrentsData.status === 'success' && torrentsData.data.result.length > 0) {
      activeTorrents.value = parseInt(torrentsData.data.result[0].value[1]) || 0
    } else {
      activeTorrents.value = 0
    }
  } catch (error) {
    console.warn('Failed to fetch qBittorrent metrics:', error)
    // Set to 0 if fetch fails
    downloadSpeed.value = 0
    uploadSpeed.value = 0
    activeTorrents.value = 0
  }
}

const fetchPrometheusMetrics = async () => {
  try {
    const response = await fetch('http://192.168.0.99:9090/api/v1/targets')
    const data = await response.json()
    if (data.status === 'success') {
      totalTargets.value = data.data.activeTargets.length
      activeTargets.value = data.data.activeTargets.filter(t => t.health === 'up').length
    }

    scrapeRate.value = Math.floor(Math.random() * 200) + 400  // Demo data
    storageSize.value = Math.random() * 100000000 + 50000000  // Demo data
  } catch (error) {
    console.warn('Failed to fetch Prometheus metrics:', error)
  }
}

const updateMetrics = async () => {
  switch (props.serviceId) {
    case 'node-exporter':
      await fetchNodeMetrics()
      break
    case 'zfs-exporter':
      await fetchZfsMetrics()
      break
    case 'cadvisor':
      await fetchContainerMetrics()
      break
    case 'prometheus':
      await fetchPrometheusMetrics()
      break
  }
}

onMounted(() => {
  updateMetrics()
  updateInterval = setInterval(updateMetrics, 30000) // Update every 30 seconds
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped>
.service-metrics {
  margin-top: var(--space-md);
  padding: var(--space-sm);
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--color-primary-3);
  border-radius: 0px; /* 8-bit style */
  image-rendering: pixelated;
}

.metrics-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.metric-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 0.75rem;
  font-family: 'Press Start 2P', monospace;
}

.metric-label {
  color: var(--text-muted);
  min-width: 40px;
  font-size: 0.65rem;
}

.metric-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--color-primary-3);
  position: relative;
  image-rendering: pixelated;
}

.bar-fill {
  height: 100%;
  transition: width 0.3s ease;
  image-rendering: pixelated;
}

.metric-value {
  color: var(--text-bright);
  min-width: 50px;
  text-align: right;
  font-size: 0.65rem;
}

@media (max-width: 768px) {
  .metric-item {
    font-size: 0.7rem;
  }

  .metric-label,
  .metric-value {
    font-size: 0.6rem;
  }
}
</style>