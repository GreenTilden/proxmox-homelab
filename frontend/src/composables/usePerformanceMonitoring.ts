import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  unit: string
}

interface PerformanceThresholds {
  calendarLoadTime: number // ms
  eventRenderTime: number // ms
  touchResponseTime: number // ms
  memoryUsage: number // MB
  frameRate: number // FPS
}

interface PerformanceAlert {
  type: 'warning' | 'error'
  metric: string
  value: number
  threshold: number
  timestamp: number
  message: string
}

export function usePerformanceMonitoring() {
  // Performance state
  const metrics = ref<PerformanceMetric[]>([])
  const alerts = ref<PerformanceAlert[]>([])
  const isMonitoring = ref(false)

  // Performance thresholds
  const thresholds: PerformanceThresholds = {
    calendarLoadTime: 2000, // 2 seconds
    eventRenderTime: 100, // 100ms
    touchResponseTime: 50, // 50ms
    memoryUsage: 50, // 50MB
    frameRate: 45 // 45 FPS minimum
  }

  // Current performance data
  const currentMetrics = ref({
    calendarLoadTime: 0,
    eventRenderTime: 0,
    touchResponseTime: 0,
    memoryUsage: 0,
    frameRate: 60,
    domNodes: 0,
    eventListeners: 0,
    cacheMisses: 0,
    cacheHits: 0,
    renderCalls: 0
  })

  // Frame rate monitoring
  const frameCount = ref(0)
  const lastFrameTime = ref(0)
  const frameHistory = ref<number[]>([])
  let animationFrameId: number | null = null

  // Memory monitoring
  const memoryHistory = ref<number[]>([])
  let memoryMonitorInterval: number | null = null

  // Performance observer for navigation timing
  let performanceObserver: PerformanceObserver | null = null

  // Record a performance metric
  const recordMetric = (name: string, value: number, unit: string = 'ms') => {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      unit
    }

    metrics.value.push(metric)

    // Keep only last 100 metrics per type
    if (metrics.value.length > 1000) {
      metrics.value = metrics.value.slice(-1000)
    }

    // Update current metrics
    if (name in currentMetrics.value) {
      (currentMetrics.value as any)[name] = value
    }

    // Check thresholds
    checkThreshold(name, value)
  }

  // Check if metric exceeds threshold
  const checkThreshold = (metricName: string, value: number) => {
    const threshold = (thresholds as any)[metricName]
    if (!threshold) return

    const isWarning = value > threshold * 0.8
    const isError = value > threshold

    if (isError || isWarning) {
      const alert: PerformanceAlert = {
        type: isError ? 'error' : 'warning',
        metric: metricName,
        value,
        threshold,
        timestamp: Date.now(),
        message: `${metricName} ${isError ? 'exceeded' : 'approaching'} threshold: ${value}${getMetricUnit(metricName)} (limit: ${threshold}${getMetricUnit(metricName)})`
      }

      alerts.value.push(alert)

      // Keep only last 50 alerts
      if (alerts.value.length > 50) {
        alerts.value = alerts.value.slice(-50)
      }

      console.warn(`Performance Alert: ${alert.message}`)
    }
  }

  // Get unit for metric
  const getMetricUnit = (metricName: string): string => {
    if (metricName.includes('Time')) return 'ms'
    if (metricName.includes('Memory')) return 'MB'
    if (metricName.includes('Rate')) return 'FPS'
    return ''
  }

  // Monitor frame rate
  const monitorFrameRate = (timestamp: number) => {
    if (lastFrameTime.value > 0) {
      const delta = timestamp - lastFrameTime.value
      const fps = 1000 / delta

      frameHistory.value.push(fps)
      if (frameHistory.value.length > 60) {
        frameHistory.value.shift()
      }

      // Calculate average FPS
      const avgFPS = frameHistory.value.reduce((a, b) => a + b, 0) / frameHistory.value.length
      currentMetrics.value.frameRate = Math.round(avgFPS)

      // Record metric every 60 frames (~1 second)
      frameCount.value++
      if (frameCount.value % 60 === 0) {
        recordMetric('frameRate', avgFPS, 'FPS')
      }
    }

    lastFrameTime.value = timestamp

    if (isMonitoring.value) {
      animationFrameId = requestAnimationFrame(monitorFrameRate)
    }
  }

  // Monitor memory usage
  const monitorMemory = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const usedMB = memory.usedJSHeapSize / 1024 / 1024

      memoryHistory.value.push(usedMB)
      if (memoryHistory.value.length > 60) {
        memoryHistory.value.shift()
      }

      currentMetrics.value.memoryUsage = usedMB
      recordMetric('memoryUsage', usedMB, 'MB')
    }
  }

  // Monitor DOM complexity
  const monitorDOMComplexity = () => {
    const nodeCount = document.querySelectorAll('*').length
    currentMetrics.value.domNodes = nodeCount
    recordMetric('domNodes', nodeCount, 'nodes')
  }

  // Performance timing utilities
  const createTimer = (name: string) => {
    const startTime = performance.now()

    return {
      end: () => {
        const duration = performance.now() - startTime
        recordMetric(name, duration)
        return duration
      }
    }
  }

  // Measure calendar load time
  const measureCalendarLoad = () => {
    return createTimer('calendarLoadTime')
  }

  // Measure event render time
  const measureEventRender = () => {
    return createTimer('eventRenderTime')
  }

  // Measure touch response time
  const measureTouchResponse = () => {
    return createTimer('touchResponseTime')
  }

  // Monitor cache performance
  const monitorCachePerformance = (hits: number, misses: number) => {
    currentMetrics.value.cacheHits = hits
    currentMetrics.value.cacheMisses = misses

    const totalRequests = hits + misses
    const hitRatio = totalRequests > 0 ? (hits / totalRequests) * 100 : 0

    recordMetric('cacheHitRatio', hitRatio, '%')
  }

  // Monitor render calls
  const incrementRenderCalls = () => {
    currentMetrics.value.renderCalls++
  }

  // Get performance summary
  const getPerformanceSummary = () => {
    const recentMetrics = metrics.value.filter(m =>
      Date.now() - m.timestamp < 60000 // Last minute
    )

    const summary = {
      totalMetrics: metrics.value.length,
      recentMetrics: recentMetrics.length,
      alerts: alerts.value.length,
      currentPerformance: {
        ...currentMetrics.value,
        memoryTrend: getMemoryTrend(),
        frameRateStability: getFrameRateStability()
      }
    }

    return summary
  }

  // Analyze memory trend
  const getMemoryTrend = (): 'increasing' | 'stable' | 'decreasing' => {
    if (memoryHistory.value.length < 10) return 'stable'

    const recent = memoryHistory.value.slice(-10)
    const older = memoryHistory.value.slice(-20, -10)

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length

    const difference = recentAvg - olderAvg
    const threshold = olderAvg * 0.1 // 10% change threshold

    if (difference > threshold) return 'increasing'
    if (difference < -threshold) return 'decreasing'
    return 'stable'
  }

  // Analyze frame rate stability
  const getFrameRateStability = (): number => {
    if (frameHistory.value.length < 10) return 100

    const mean = frameHistory.value.reduce((a, b) => a + b, 0) / frameHistory.value.length
    const variance = frameHistory.value.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / frameHistory.value.length
    const standardDeviation = Math.sqrt(variance)

    // Lower standard deviation = more stable
    const stability = Math.max(0, 100 - (standardDeviation * 2))
    return Math.round(stability)
  }

  // Get recommendations
  const getOptimizationRecommendations = (): string[] => {
    const recommendations: string[] = []

    // Memory recommendations
    if (currentMetrics.value.memoryUsage > thresholds.memoryUsage * 0.8) {
      recommendations.push('Consider clearing unnecessary caches or reducing data retention')
    }

    // Frame rate recommendations
    if (currentMetrics.value.frameRate < thresholds.frameRate) {
      recommendations.push('Consider reducing animation complexity or enabling power saving mode')
    }

    // DOM complexity recommendations
    if (currentMetrics.value.domNodes > 1000) {
      recommendations.push('Consider implementing virtual scrolling to reduce DOM complexity')
    }

    // Cache recommendations
    const cacheTotal = currentMetrics.value.cacheHits + currentMetrics.value.cacheMisses
    const hitRatio = cacheTotal > 0 ? (currentMetrics.value.cacheHits / cacheTotal) * 100 : 0
    if (hitRatio < 70) {
      recommendations.push('Cache hit ratio is low, consider improving caching strategy')
    }

    return recommendations
  }

  // Performance reporting
  const generatePerformanceReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      summary: getPerformanceSummary(),
      metrics: {
        calendar: {
          loadTime: getAverageMetric('calendarLoadTime'),
          renderTime: getAverageMetric('eventRenderTime')
        },
        interaction: {
          touchResponse: getAverageMetric('touchResponseTime'),
          frameRate: currentMetrics.value.frameRate
        },
        memory: {
          current: currentMetrics.value.memoryUsage,
          trend: getMemoryTrend(),
          peak: Math.max(...memoryHistory.value.slice(-60))
        },
        cache: {
          hits: currentMetrics.value.cacheHits,
          misses: currentMetrics.value.cacheMisses,
          hitRatio: currentMetrics.value.cacheHits + currentMetrics.value.cacheMisses > 0
            ? (currentMetrics.value.cacheHits / (currentMetrics.value.cacheHits + currentMetrics.value.cacheMisses)) * 100
            : 0
        }
      },
      alerts: alerts.value.slice(-10), // Last 10 alerts
      recommendations: getOptimizationRecommendations()
    }

    return report
  }

  // Get average for a metric type
  const getAverageMetric = (metricName: string): number => {
    const recentMetrics = metrics.value
      .filter(m => m.name === metricName && Date.now() - m.timestamp < 300000) // Last 5 minutes
      .map(m => m.value)

    if (recentMetrics.length === 0) return 0

    return recentMetrics.reduce((a, b) => a + b, 0) / recentMetrics.length
  }

  // Start monitoring
  const startMonitoring = () => {
    if (isMonitoring.value) return

    isMonitoring.value = true

    // Start frame rate monitoring
    animationFrameId = requestAnimationFrame(monitorFrameRate)

    // Start memory monitoring
    memoryMonitorInterval = window.setInterval(monitorMemory, 5000) // Every 5 seconds

    // Start DOM monitoring
    const domMonitorInterval = setInterval(monitorDOMComplexity, 30000) // Every 30 seconds

    // Setup performance observer for navigation timing
    if ('PerformanceObserver' in window) {
      try {
        performanceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming
              recordMetric('pageLoadTime', navEntry.loadEventEnd - navEntry.navigationStart)
              recordMetric('domContentLoaded', navEntry.domContentLoadedEventEnd - navEntry.navigationStart)
            }
          }
        })

        performanceObserver.observe({ entryTypes: ['navigation', 'measure'] })
      } catch (e) {
        console.warn('PerformanceObserver not supported or failed to initialize')
      }
    }

    console.debug('Performance monitoring started')
  }

  // Stop monitoring
  const stopMonitoring = () => {
    isMonitoring.value = false

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }

    if (memoryMonitorInterval) {
      clearInterval(memoryMonitorInterval)
      memoryMonitorInterval = null
    }

    if (performanceObserver) {
      performanceObserver.disconnect()
      performanceObserver = null
    }

    console.debug('Performance monitoring stopped')
  }

  // Clear all data
  const clearMetrics = () => {
    metrics.value = []
    alerts.value = []
    frameHistory.value = []
    memoryHistory.value = []
    frameCount.value = 0
  }

  // Auto-start monitoring
  onMounted(() => {
    startMonitoring()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    // State
    isMonitoring: readonly(isMonitoring),
    metrics: readonly(metrics),
    alerts: readonly(alerts),
    currentMetrics: readonly(currentMetrics),

    // Recording
    recordMetric,
    incrementRenderCalls,
    monitorCachePerformance,

    // Timing utilities
    createTimer,
    measureCalendarLoad,
    measureEventRender,
    measureTouchResponse,

    // Analysis
    getPerformanceSummary,
    getOptimizationRecommendations,
    generatePerformanceReport,

    // Control
    startMonitoring,
    stopMonitoring,
    clearMetrics,

    // Configuration
    thresholds
  }
}