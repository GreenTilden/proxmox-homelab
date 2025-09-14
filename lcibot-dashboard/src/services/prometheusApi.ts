/**
 * Prometheus API Client for LCiBot Dashboard
 * Provides real-time metrics fetching with caching and error handling
 */

export interface PrometheusResponse {
  status: 'success' | 'error'
  data: {
    resultType: 'matrix' | 'vector' | 'scalar' | 'string'
    result: PrometheusMetric[]
  }
  error?: string
}

export interface PrometheusMetric {
  metric: Record<string, string>
  value?: [number, string]
  values?: Array<[number, string]>
}

interface CachedResponse {
  data: PrometheusResponse
  timestamp: number
}

export class PrometheusClient {
  private baseUrl = 'http://192.168.0.99:9090'
  private cache = new Map<string, CachedResponse>()
  private requestAbortControllers = new Map<string, AbortController>()
  
  constructor(baseUrl?: string) {
    if (baseUrl) {
      this.baseUrl = baseUrl
    }
  }

  /**
   * Execute a Prometheus instant query
   */
  async query(query: string, useCache: boolean = true): Promise<PrometheusResponse> {
    const cacheKey = `query:${query}`
    
    // Check cache first (30 second TTL)
    if (useCache) {
      const cached = this.cache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < 30000) {
        return cached.data
      }
    }
    
    // Cancel any existing request for this query
    const existingController = this.requestAbortControllers.get(cacheKey)
    if (existingController) {
      existingController.abort()
    }
    
    // Create new abort controller
    const controller = new AbortController()
    this.requestAbortControllers.set(cacheKey, controller)
    
    try {
      const url = `${this.baseUrl}/api/v1/query?query=${encodeURIComponent(query)}`
      const response = await fetch(url, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      })
      
      if (!response.ok) {
        throw new Error(`Prometheus API error: ${response.status} ${response.statusText}`)
      }
      
      const data: PrometheusResponse = await response.json()
      
      // Cache successful responses
      if (data.status === 'success') {
        this.cache.set(cacheKey, { data, timestamp: Date.now() })
      }
      
      return data
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request cancelled')
      }
      
      console.error('Prometheus query failed:', query, error)
      throw new Error(`Failed to fetch metrics: ${error.message}`)
    } finally {
      this.requestAbortControllers.delete(cacheKey)
    }
  }

  /**
   * Execute a Prometheus range query
   */
  async queryRange(
    query: string, 
    start: number, 
    end: number, 
    step: number
  ): Promise<PrometheusResponse> {
    const params = new URLSearchParams({
      query,
      start: start.toString(),
      end: end.toString(),
      step: step.toString()
    })
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout for range queries
    
    try {
      const url = `${this.baseUrl}/api/v1/query_range?${params}`
      const response = await fetch(url, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`Prometheus range query error: ${response.status} ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      console.error('Prometheus range query failed:', query, error)
      throw new Error(`Failed to fetch metrics range: ${error.message}`)
    }
  }

  /**
   * Get current targets from Prometheus
   */
  async getTargets(): Promise<any> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/targets`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch targets: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      throw new Error(`Failed to fetch Prometheus targets: ${error.message}`)
    }
  }

  /**
   * Check if Prometheus is accessible
   */
  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/-/healthy`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      })
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Clear cache for specific query or all cache
   */
  clearCache(query?: string): void {
    if (query) {
      this.cache.delete(`query:${query}`)
    } else {
      this.cache.clear()
    }
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests(): void {
    this.requestAbortControllers.forEach(controller => controller.abort())
    this.requestAbortControllers.clear()
  }
}

// Singleton instance
export const prometheusClient = new PrometheusClient()

// Common system metrics queries
export const SYSTEM_QUERIES = {
  // CPU Metrics
  cpuUsage: '100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)',
  cpuCores: 'count(count(node_cpu_seconds_total) by (cpu))',
  loadAverage1m: 'node_load1',
  loadAverage5m: 'node_load5', 
  loadAverage15m: 'node_load15',
  
  // Memory Metrics
  memoryTotal: 'node_memory_MemTotal_bytes',
  memoryAvailable: 'node_memory_MemAvailable_bytes',
  memoryUsagePercent: '100 * (1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)',
  memoryUsageBytes: 'node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes',
  
  // Storage Metrics
  diskUsagePercent: '100 - (node_filesystem_avail_bytes / node_filesystem_size_bytes * 100)',
  diskTotal: 'node_filesystem_size_bytes{fstype!="tmpfs",mountpoint="/"}',
  diskUsed: 'node_filesystem_size_bytes{fstype!="tmpfs",mountpoint="/"} - node_filesystem_free_bytes{fstype!="tmpfs",mountpoint="/"}',
  diskAvailable: 'node_filesystem_avail_bytes{fstype!="tmpfs",mountpoint="/"}',
  
  // Network Metrics
  networkReceiveBytesRate: 'rate(node_network_receive_bytes_total{device!="lo"}[5m])',
  networkTransmitBytesRate: 'rate(node_network_transmit_bytes_total{device!="lo"}[5m])',
  networkReceiveTotal: 'sum(node_network_receive_bytes_total{device!="lo"})',
  networkTransmitTotal: 'sum(node_network_transmit_bytes_total{device!="lo"})',
  
  // System Health
  uptime: 'node_time_seconds - node_boot_time_seconds',
  serviceHealth: 'up',
  prometheusTargets: 'prometheus_target_health',
  
  // ZFS Pool Metrics (custom exporter)
  zfsPoolHealth: 'zfs_pool_health',
  zfsPoolUsagePercent: 'zfs_pool_used_bytes / zfs_pool_size_bytes * 100',
  zfsPoolAvailableBytes: 'zfs_pool_available_bytes',
  
  // Container/Docker Metrics
  containerCount: 'count(container_last_seen{name!=""})',
  containerCpuUsage: 'sum(rate(container_cpu_usage_seconds_total{name!=""}[5m])) by (name)',
  containerMemoryUsage: 'sum(container_memory_usage_bytes{name!=""}) by (name)',
  
  // Deluge Torrent Metrics (custom exporter)
  delugeActiveDownloads: 'deluge_active_downloads',
  delugeDownloadSpeed: 'deluge_download_speed_bytes',
  delugeUploadSpeed: 'deluge_upload_speed_bytes'
}

// Utility functions for metrics processing
export const MetricsUtils = {
  /**
   * Extract numeric value from Prometheus metric result
   */
  extractValue(result: PrometheusMetric[]): number {
    if (!result || result.length === 0) return 0
    const value = result[0]?.value?.[1]
    return value ? parseFloat(value) : 0
  },

  /**
   * Extract multiple values with labels
   */
  extractValues(result: PrometheusMetric[]): Array<{label: string, value: number}> {
    return result.map(metric => ({
      label: Object.values(metric.metric).join(' '),
      value: metric.value ? parseFloat(metric.value[1]) : 0
    }))
  },

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  /**
   * Format percentage with precision
   */
  formatPercent(value: number): string {
    return `${Math.round(value * 100) / 100}%`
  },

  /**
   * Format uptime in human readable format
   */
  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }
}