/**
 * ZFS API Service for LCiBot Dashboard
 * Provides ZFS pool metrics via Prometheus with typed interfaces
 */

import { prometheusClient, PrometheusResponse, MetricsUtils } from './prometheusApi'

export interface ZFSPool {
  name: string
  health: number // 1 = healthy, 0 = unhealthy
  sizeBytes: number
  allocatedBytes: number
  freeBytes: number
  usagePercent: number
}

export interface ZFSMetrics {
  pools: ZFSPool[]
  totalSizeBytes: number
  totalAllocatedBytes: number
  totalFreeBytes: number
  averageUsagePercent: number
  lastUpdated: Date
}

// ZFS-specific Prometheus queries based on custom exporter
export const ZFS_QUERIES = {
  poolHealth: 'zfs_pool_health_status',
  poolCapacityPercent: 'zfs_pool_capacity_percent',
  poolSizeBytes: 'zfs_pool_size_bytes',
  poolAllocatedBytes: 'zfs_pool_allocated_bytes',
  poolFreeBytes: 'zfs_pool_free_bytes'
}

export class ZFSService {
  /**
   * Get current status of all ZFS pools
   */
  async getPoolMetrics(): Promise<ZFSMetrics> {
    try {
      // Fetch all ZFS metrics in parallel
      const [healthResponse, capacityResponse, sizeResponse, allocatedResponse, freeResponse] = await Promise.all([
        prometheusClient.query(ZFS_QUERIES.poolHealth),
        prometheusClient.query(ZFS_QUERIES.poolCapacityPercent),
        prometheusClient.query(ZFS_QUERIES.poolSizeBytes),
        prometheusClient.query(ZFS_QUERIES.poolAllocatedBytes),
        prometheusClient.query(ZFS_QUERIES.poolFreeBytes)
      ])

      // Process pool data
      const pools = this.processPoolData(
        healthResponse,
        capacityResponse,
        sizeResponse,
        allocatedResponse,
        freeResponse
      )

      // Calculate totals
      const totalSizeBytes = pools.reduce((sum, pool) => sum + pool.sizeBytes, 0)
      const totalAllocatedBytes = pools.reduce((sum, pool) => sum + pool.allocatedBytes, 0)
      const totalFreeBytes = pools.reduce((sum, pool) => sum + pool.freeBytes, 0)
      const averageUsagePercent = pools.reduce((sum, pool) => sum + pool.usagePercent, 0) / pools.length

      return {
        pools,
        totalSizeBytes,
        totalAllocatedBytes,
        totalFreeBytes,
        averageUsagePercent: averageUsagePercent || 0,
        lastUpdated: new Date()
      }
    } catch (error) {
      console.error('Failed to fetch ZFS metrics:', error)
      throw new Error(`ZFS metrics unavailable: ${error.message}`)
    }
  }

  /**
   * Process raw Prometheus responses into typed pool data
   */
  private processPoolData(
    healthResponse: PrometheusResponse,
    capacityResponse: PrometheusResponse,
    sizeResponse: PrometheusResponse,
    allocatedResponse: PrometheusResponse,
    freeResponse: PrometheusResponse
  ): ZFSPool[] {
    const pools = new Map<string, Partial<ZFSPool>>()

    // Process health metrics
    if (healthResponse.status === 'success') {
      healthResponse.data.result.forEach(metric => {
        const poolName = metric.metric.pool || metric.metric.instance || 'unknown'
        if (!pools.has(poolName)) pools.set(poolName, { name: poolName })
        pools.get(poolName)!.health = parseFloat(metric.value?.[1] || '0')
      })
    }

    // Process capacity percentages
    if (capacityResponse.status === 'success') {
      capacityResponse.data.result.forEach(metric => {
        const poolName = metric.metric.pool || metric.metric.instance || 'unknown'
        if (!pools.has(poolName)) pools.set(poolName, { name: poolName })
        pools.get(poolName)!.usagePercent = parseFloat(metric.value?.[1] || '0')
      })
    }

    // Process size metrics
    if (sizeResponse.status === 'success') {
      sizeResponse.data.result.forEach(metric => {
        const poolName = metric.metric.pool || metric.metric.instance || 'unknown'
        if (!pools.has(poolName)) pools.set(poolName, { name: poolName })
        pools.get(poolName)!.sizeBytes = parseFloat(metric.value?.[1] || '0')
      })
    }

    // Process allocated metrics
    if (allocatedResponse.status === 'success') {
      allocatedResponse.data.result.forEach(metric => {
        const poolName = metric.metric.pool || metric.metric.instance || 'unknown'
        if (!pools.has(poolName)) pools.set(poolName, { name: poolName })
        pools.get(poolName)!.allocatedBytes = parseFloat(metric.value?.[1] || '0')
      })
    }

    // Process free metrics
    if (freeResponse.status === 'success') {
      freeResponse.data.result.forEach(metric => {
        const poolName = metric.metric.pool || metric.metric.instance || 'unknown'
        if (!pools.has(poolName)) pools.set(poolName, { name: poolName })
        pools.get(poolName)!.freeBytes = parseFloat(metric.value?.[1] || '0')
      })
    }

    // Convert to complete ZFSPool objects with defaults
    return Array.from(pools.values()).map(pool => ({
      name: pool.name || 'unknown',
      health: pool.health ?? 1, // Default to healthy
      sizeBytes: pool.sizeBytes || 0,
      allocatedBytes: pool.allocatedBytes || 0,
      freeBytes: pool.freeBytes || (pool.sizeBytes || 0) - (pool.allocatedBytes || 0),
      usagePercent: pool.usagePercent ?? 0
    }))
  }

  /**
   * Get pool health status with human-readable labels
   */
  async getPoolHealthSummary(): Promise<Array<{name: string, status: string, color: string}>> {
    try {
      const metrics = await this.getPoolMetrics()
      return metrics.pools.map(pool => ({
        name: pool.name,
        status: pool.health === 1 ? 'Healthy' : 'Warning',
        color: pool.health === 1 ? '#10b981' : '#f59e0b' // Green or amber
      }))
    } catch (error) {
      console.error('Failed to get pool health summary:', error)
      return []
    }
  }

  /**
   * Format pool capacity for display
   */
  formatPoolCapacity(pool: ZFSPool): string {
    const used = MetricsUtils.formatBytes(pool.allocatedBytes)
    const total = MetricsUtils.formatBytes(pool.sizeBytes)
    const percent = Math.round(pool.usagePercent)
    return `${used} / ${total} (${percent}%)`
  }

  /**
   * Check if any pools are approaching capacity limits
   */
  getCapacityAlerts(pools: ZFSPool[]): Array<{pool: string, message: string, level: 'warning' | 'critical'}> {
    const alerts: Array<{pool: string, message: string, level: 'warning' | 'critical'}> = []

    pools.forEach(pool => {
      if (pool.usagePercent >= 90) {
        alerts.push({
          pool: pool.name,
          message: `Pool ${pool.name} is ${pool.usagePercent.toFixed(1)}% full`,
          level: 'critical'
        })
      } else if (pool.usagePercent >= 80) {
        alerts.push({
          pool: pool.name,
          message: `Pool ${pool.name} is ${pool.usagePercent.toFixed(1)}% full`,
          level: 'warning'
        })
      }
    })

    return alerts
  }
}

// Singleton instance
export const zfsService = new ZFSService()