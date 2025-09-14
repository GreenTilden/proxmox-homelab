/**
 * System Metrics Composable for LCiBot Dashboard
 * Provides real-time system monitoring with Vue 3 reactivity
 */

import { ref, reactive, onUnmounted, computed, readonly } from 'vue'
import { prometheusClient, SYSTEM_QUERIES, MetricsUtils } from '@/services/prometheusApi'

export interface SystemMetrics {
  cpuUsage: number
  cpuCores: number
  memoryUsage: number
  memoryTotal: number
  memoryUsed: number
  diskUsage: number
  diskTotal: number
  diskUsed: number
  diskAvailable: number
  loadAverage1m: number
  loadAverage5m: number
  loadAverage15m: number
  networkReceiveRate: number
  networkTransmitRate: number
  uptime: number
  lastUpdate: Date | null
}

export interface HistoricalDataPoint {
  timestamp: number
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  loadAverage: number
}

export const useSystemMetrics = () => {
  // Reactive state
  const systemMetrics = ref<SystemMetrics>({
    cpuUsage: 0,
    cpuCores: 0,
    memoryUsage: 0,
    memoryTotal: 0,
    memoryUsed: 0,
    diskUsage: 0,
    diskTotal: 0,
    diskUsed: 0,
    diskAvailable: 0,
    loadAverage1m: 0,
    loadAverage5m: 0,
    loadAverage15m: 0,
    networkReceiveRate: 0,
    networkTransmitRate: 0,
    uptime: 0,
    lastUpdate: null
  })
  
  const historicalData = ref<HistoricalDataPoint[]>([])
  const isLoading = ref(false)
  const error = ref('')
  const isMonitoring = ref(false)
  
  // Monitoring intervals
  let monitoringInterval: NodeJS.Timeout | null = null
  let historicalInterval: NodeJS.Timeout | null = null
  
  // Computed values for better UX
  const healthStatus = computed(() => {
    if (error.value) return 'error'
    if (isLoading.value) return 'loading'
    if (!systemMetrics.value.lastUpdate) return 'no-data'
    
    const now = Date.now()
    const lastUpdate = systemMetrics.value.lastUpdate.getTime()
    if (now - lastUpdate > 120000) return 'stale' // 2 minutes
    
    return 'healthy'
  })
  
  const loadStatus = computed(() => {
    const { loadAverage1m, cpuCores } = systemMetrics.value
    if (cpuCores === 0) return 'unknown'
    
    const loadRatio = loadAverage1m / cpuCores
    if (loadRatio > 1.5) return 'critical'
    if (loadRatio > 1.0) return 'warning'
    return 'normal'
  })
  
  const memoryStatus = computed(() => {
    const usage = systemMetrics.value.memoryUsage
    if (usage > 90) return 'critical'
    if (usage > 75) return 'warning'
    return 'normal'
  })
  
  const diskStatus = computed(() => {
    const usage = systemMetrics.value.diskUsage
    if (usage > 90) return 'critical'
    if (usage > 80) return 'warning'
    return 'normal'
  })

  /**
   * Fetch current system metrics from Prometheus
   */
  const fetchCurrentMetrics = async (): Promise<void> => {
    try {
      isLoading.value = true
      error.value = ''
      
      // Execute all metric queries in parallel
      const metricPromises = [
        prometheusClient.query(SYSTEM_QUERIES.cpuUsage),
        prometheusClient.query(SYSTEM_QUERIES.cpuCores),
        prometheusClient.query(SYSTEM_QUERIES.memoryUsagePercent),
        prometheusClient.query(SYSTEM_QUERIES.memoryTotal),
        prometheusClient.query(SYSTEM_QUERIES.memoryUsageBytes),
        prometheusClient.query(SYSTEM_QUERIES.diskUsagePercent),
        prometheusClient.query(SYSTEM_QUERIES.diskTotal),
        prometheusClient.query(SYSTEM_QUERIES.diskUsed),
        prometheusClient.query(SYSTEM_QUERIES.diskAvailable),
        prometheusClient.query(SYSTEM_QUERIES.loadAverage1m),
        prometheusClient.query(SYSTEM_QUERIES.loadAverage5m),
        prometheusClient.query(SYSTEM_QUERIES.loadAverage15m),
        prometheusClient.query(SYSTEM_QUERIES.networkReceiveBytesRate),
        prometheusClient.query(SYSTEM_QUERIES.networkTransmitBytesRate),
        prometheusClient.query(SYSTEM_QUERIES.uptime)
      ]
      
      const responses = await Promise.allSettled(metricPromises)
      
      // Process successful responses
      responses.forEach((response, index) => {
        if (response.status === 'fulfilled' && response.value.status === 'success') {
          const value = MetricsUtils.extractValue(response.value.data.result)
          
          switch (index) {
            case 0: systemMetrics.value.cpuUsage = value; break
            case 1: systemMetrics.value.cpuCores = value; break
            case 2: systemMetrics.value.memoryUsage = value; break
            case 3: systemMetrics.value.memoryTotal = value; break
            case 4: systemMetrics.value.memoryUsed = value; break
            case 5: systemMetrics.value.diskUsage = value; break
            case 6: systemMetrics.value.diskTotal = value; break
            case 7: systemMetrics.value.diskUsed = value; break
            case 8: systemMetrics.value.diskAvailable = value; break
            case 9: systemMetrics.value.loadAverage1m = value; break
            case 10: systemMetrics.value.loadAverage5m = value; break
            case 11: systemMetrics.value.loadAverage15m = value; break
            case 12: systemMetrics.value.networkReceiveRate = value; break
            case 13: systemMetrics.value.networkTransmitRate = value; break
            case 14: systemMetrics.value.uptime = value; break
          }
        }
      })
      
      systemMetrics.value.lastUpdate = new Date()
      
      // Add to historical data
      addHistoricalDataPoint()
      
    } catch (err) {
      console.error('Failed to fetch system metrics:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Add current metrics to historical data
   */
  const addHistoricalDataPoint = (): void => {
    const dataPoint: HistoricalDataPoint = {
      timestamp: Date.now(),
      cpuUsage: systemMetrics.value.cpuUsage,
      memoryUsage: systemMetrics.value.memoryUsage,
      diskUsage: systemMetrics.value.diskUsage,
      loadAverage: systemMetrics.value.loadAverage1m
    }
    
    historicalData.value.push(dataPoint)
    
    // Keep only last 120 data points (1 hour at 30s intervals)
    if (historicalData.value.length > 120) {
      historicalData.value = historicalData.value.slice(-120)
    }
  }
  
  /**
   * Fetch historical metrics from Prometheus
   */
  const fetchHistoricalMetrics = async (): Promise<void> => {
    try {
      const endTime = Math.floor(Date.now() / 1000)
      const startTime = endTime - (3600) // Last hour
      const step = 300 // 5-minute intervals
      
      const historicalPromises = [
        prometheusClient.queryRange(SYSTEM_QUERIES.cpuUsage, startTime, endTime, step),
        prometheusClient.queryRange(SYSTEM_QUERIES.memoryUsagePercent, startTime, endTime, step),
        prometheusClient.queryRange(SYSTEM_QUERIES.diskUsagePercent, startTime, endTime, step),
        prometheusClient.queryRange(SYSTEM_QUERIES.loadAverage1m, startTime, endTime, step)
      ]
      
      const responses = await Promise.allSettled(historicalPromises)
      
      // Process historical data
      const dataPoints = new Map<number, Partial<HistoricalDataPoint>>()
      
      responses.forEach((response, metricIndex) => {
        if (response.status === 'fulfilled' && response.value.status === 'success') {
          const result = response.value.data.result[0]
          if (result?.values) {
            result.values.forEach(([timestamp, value]) => {
              const ts = timestamp * 1000 // Convert to milliseconds
              if (!dataPoints.has(ts)) {
                dataPoints.set(ts, { timestamp: ts })
              }
              const point = dataPoints.get(ts)!
              
              switch (metricIndex) {
                case 0: point.cpuUsage = parseFloat(value); break
                case 1: point.memoryUsage = parseFloat(value); break
                case 2: point.diskUsage = parseFloat(value); break
                case 3: point.loadAverage = parseFloat(value); break
              }
            })
          }
        }
      })
      
      // Convert to array and sort by timestamp
      const completeDataPoints: HistoricalDataPoint[] = Array.from(dataPoints.values())
        .filter(point => 
          point.timestamp !== undefined && 
          point.cpuUsage !== undefined &&
          point.memoryUsage !== undefined &&
          point.diskUsage !== undefined &&
          point.loadAverage !== undefined
        )
        .map(point => point as HistoricalDataPoint)
        .sort((a, b) => a.timestamp - b.timestamp)
      
      historicalData.value = completeDataPoints
      
    } catch (err) {
      console.error('Failed to fetch historical metrics:', err)
    }
  }
  
  /**
   * Start monitoring system metrics
   */
  const startMonitoring = async (): Promise<void> => {
    if (isMonitoring.value) return
    
    isMonitoring.value = true
    
    // Initial fetch
    await fetchCurrentMetrics()
    await fetchHistoricalMetrics()
    
    // Set up intervals
    monitoringInterval = setInterval(fetchCurrentMetrics, 30000) // Every 30 seconds
    historicalInterval = setInterval(fetchHistoricalMetrics, 300000) // Every 5 minutes
  }
  
  /**
   * Stop monitoring system metrics
   */
  const stopMonitoring = (): void => {
    isMonitoring.value = false
    
    if (monitoringInterval) {
      clearInterval(monitoringInterval)
      monitoringInterval = null
    }
    
    if (historicalInterval) {
      clearInterval(historicalInterval)
      historicalInterval = null
    }
  }
  
  /**
   * Refresh metrics immediately
   */
  const refreshMetrics = async (): Promise<void> => {
    await fetchCurrentMetrics()
  }
  
  // Formatted values for display
  const formattedMetrics = computed(() => ({
    cpuUsage: MetricsUtils.formatPercent(systemMetrics.value.cpuUsage),
    memoryUsage: MetricsUtils.formatPercent(systemMetrics.value.memoryUsage),
    memoryTotal: MetricsUtils.formatBytes(systemMetrics.value.memoryTotal),
    memoryUsed: MetricsUtils.formatBytes(systemMetrics.value.memoryUsed),
    diskUsage: MetricsUtils.formatPercent(systemMetrics.value.diskUsage),
    diskTotal: MetricsUtils.formatBytes(systemMetrics.value.diskTotal),
    diskUsed: MetricsUtils.formatBytes(systemMetrics.value.diskUsed),
    diskAvailable: MetricsUtils.formatBytes(systemMetrics.value.diskAvailable),
    networkReceiveRate: MetricsUtils.formatBytes(systemMetrics.value.networkReceiveRate) + '/s',
    networkTransmitRate: MetricsUtils.formatBytes(systemMetrics.value.networkTransmitRate) + '/s',
    uptime: MetricsUtils.formatUptime(systemMetrics.value.uptime),
    loadAverage: `${systemMetrics.value.loadAverage1m.toFixed(2)}`
  }))
  
  // Cleanup on unmount
  onUnmounted(() => {
    stopMonitoring()
  })
  
  return {
    // State
    systemMetrics: readonly(systemMetrics),
    historicalData: readonly(historicalData),
    isLoading: readonly(isLoading),
    error: readonly(error),
    isMonitoring: readonly(isMonitoring),
    
    // Computed
    healthStatus,
    loadStatus,
    memoryStatus,
    diskStatus,
    formattedMetrics,
    
    // Actions
    startMonitoring,
    stopMonitoring,
    refreshMetrics,
    fetchCurrentMetrics,
    fetchHistoricalMetrics
  }
}