/**
 * Service Monitoring Composable for LCiBot Dashboard
 * Provides real-time service health monitoring with Prometheus integration
 */

import { ref, reactive, onUnmounted, computed, readonly } from 'vue'
import { prometheusClient, SYSTEM_QUERIES, MetricsUtils } from '@/services/prometheusApi'

export interface ServiceStatus {
  id: string
  name: string
  description: string
  status: 'online' | 'offline' | 'checking' | 'unknown'
  lastChecked: Date | null
  responseTime: number | null
  job: string // Prometheus job name
  instance: string // Prometheus instance name
  url?: string
  healthEndpoint?: string
  metrics?: {
    uptime?: number
    requests?: number
    errors?: number
    customMetrics?: Record<string, number>
  }
}

export interface ServiceMetrics {
  totalServices: number
  onlineServices: number
  offlineServices: number
  healthyPercentage: number
  lastUpdateTime: Date | null
}

export const useServiceMonitoring = () => {
  // Service definitions based on Prometheus targets
  const services = ref<ServiceStatus[]>([
    {
      id: 'prometheus',
      name: 'Prometheus',
      description: 'Metrics Collection System',
      status: 'unknown',
      lastChecked: null,
      responseTime: null,
      job: 'prometheus',
      instance: 'localhost:9090',
      url: 'http://192.168.0.99:9090'
    },
    {
      id: 'node-exporter',
      name: 'Node Exporter',
      description: 'System Metrics Exporter',
      status: 'unknown',
      lastChecked: null,
      responseTime: null,
      job: 'node-exporter',
      instance: 'proxmox-host',
      url: 'http://192.168.0.99:9100',
      healthEndpoint: 'http://192.168.0.99:9100'
    },
    {
      id: 'cadvisor',
      name: 'cAdvisor',
      description: 'Container Metrics',
      status: 'unknown',
      lastChecked: null,
      responseTime: null,
      job: 'cadvisor',
      instance: 'container-metrics',
      url: 'http://192.168.0.99:8082/containers/',
      healthEndpoint: 'http://192.168.0.99:8082'
    },
    {
      id: 'zfs-exporter',
      name: 'ZFS Exporter',
      description: 'Storage Pool Metrics',
      status: 'unknown',
      lastChecked: null,
      responseTime: null,
      job: 'zfs-exporter',
      instance: 'zfs-pools',
      url: 'http://192.168.0.99:9101/metrics',
      healthEndpoint: 'http://192.168.0.99:9101'
    },
    {
      id: 'qbittorrent',
      name: 'qBittorrent',
      description: 'Torrent Client Web Interface',
      status: 'unknown',
      lastChecked: null,
      responseTime: null,
      job: 'qbittorrent',
      instance: 'torrent-client',
      url: 'http://192.168.0.111:8112/',
      healthEndpoint: 'http://192.168.0.111:8112'
    },
    {
      id: 'plex',
      name: 'Plex Media Server',
      description: 'Media Streaming Platform',
      status: 'unknown',
      lastChecked: null,
      responseTime: null,
      job: 'plex-server',
      instance: 'media-server',
      url: 'http://192.168.0.99:32400',
      healthEndpoint: 'http://192.168.0.99:32400/identity'
    },
    {
      id: 'mc-file-manager',
      name: 'File Manager (mc)',
      description: 'Midnight Commander in a web terminal',
      status: 'online', // This is a static link, so it's always online
      lastChecked: new Date(),
      responseTime: 0,
      job: 'local',
      instance: 'local',
      url: '/file-manager', // Internal Vue route
      healthEndpoint: undefined
    },
    {
      id: 'proxmox',
      name: 'Proxmox VE',
      description: 'Virtualization Management',
      status: 'unknown',
      lastChecked: null,
      responseTime: null,
      job: 'proxmox',
      instance: 'hypervisor',
      url: 'https://192.168.0.99:8006',
      healthEndpoint: 'https://192.168.0.99:8006/api2/json/version'
    },
    {
      id: "homeassistant",
      name: "Home Assistant",
      description: "Smart Home Automation",
      status: "unknown",
      lastChecked: null,
      responseTime: null,
      job: "homeassistant",
      instance: "smart-home",
      url: "http://192.168.0.99:8123",
      healthEndpoint: "http://192.168.0.99:8123"
    },
    {
      id: "nextcloud",
      name: "Nextcloud",
      description: "Hub (Calendar & Tasks)",
      status: "unknown",
      lastChecked: null,
      responseTime: null,
      job: "nextcloud",
      instance: "cloud-hub",
      url: "https://nextcloud.darrenarney.com",
      healthEndpoint: "https://nextcloud.darrenarney.com/status.php"
    }
    ,
    {
      id: "tandoor",
      name: "Tandoor Recipes",
      description: "Recipe Management",
      status: "unknown",
      lastChecked: null,
      responseTime: null,
      job: "tandoor",
      instance: "recipes",
      url: "https://tandoor.darrenarney.com",
      healthEndpoint: "http://192.168.0.99:8080"
    },
    {
      id: "sprite-forge",
      name: "Sprite Forge",
      description: "Local AI Sprite Generation with RAG",
      status: "unknown",
      lastChecked: null,
      responseTime: null,
      job: "sprite-forge",
      instance: "sprite-generator",
      url: "http://192.168.0.127:5173",
      healthEndpoint: "http://192.168.0.127:3456/api/health"
    },
    {
      id: "comfyui",
      name: "ComfyUI",
      description: "Stable Diffusion Image Generation",
      status: "unknown",
      lastChecked: null,
      responseTime: null,
      job: "comfyui",
      instance: "sd-generator",
      url: "http://192.168.0.99:8188",
      healthEndpoint: "http://192.168.0.99:8188/system_stats"
    },
    {
      id: "ellabot",
      name: "EllaBot",
      description: "RAG AI Assistant",
      status: "unknown",
      lastChecked: null,
      responseTime: null,
      job: "ellabot",
      instance: "rag-assistant",
      url: "http://192.168.0.120:5010",
      healthEndpoint: "http://192.168.0.120:5010/api/ellabot/health"
    },
    {
      id: "command-server",
      name: "Command Server",
      description: "Dashboard Backend API",
      status: "unknown",
      lastChecked: null,
      responseTime: null,
      job: "command-server",
      instance: "dashboard-api",
      url: "http://192.168.0.250:5001",
      healthEndpoint: "http://192.168.0.250:5001/api/health"
    },
    {
      id: "chatterbox-tts",
      name: "Chatterbox TTS",
      description: "GPU Voice Cloning",
      status: "unknown",
      lastChecked: null,
      responseTime: null,
      job: "chatterbox-tts",
      instance: "voice-cloning",
      url: "http://192.168.0.99:8004",
      healthEndpoint: "http://192.168.0.99:8004/docs"
    },
    {
      id: "kokoro-tts",
      name: "Kokoro TTS",
      description: "CPU Text-to-Speech",
      status: "unknown",
      lastChecked: null,
      responseTime: null,
      job: "kokoro-tts",
      instance: "tts-cpu",
      url: "http://192.168.0.120:5011",
      healthEndpoint: "http://192.168.0.120:5011"
    },
    {
      id: "podcast-feed",
      name: "Podcast Feed",
      description: "Article Digest Podcast",
      status: "unknown",
      lastChecked: null,
      responseTime: null,
      job: "podcast-feed",
      instance: "podcast-factory",
      url: "http://192.168.0.131:8081",
      healthEndpoint: "http://192.168.0.131:8081/feed.xml"
    }
  ])

  const serviceMetrics = ref<ServiceMetrics>({
    totalServices: 0,
    onlineServices: 0,
    offlineServices: 0,
    healthyPercentage: 0,
    lastUpdateTime: null
  })

  const isLoading = ref(false)
  const error = ref('')
  const isAutoRefreshEnabled = ref(true)
  const isRefreshing = ref(false)

  // Monitoring intervals
  let monitoringInterval: NodeJS.Timeout | null = null

  // Computed values
  const onlineServices = computed(() =>
    services.value.filter(service => service.status === 'online')
  )

  const offlineServices = computed(() =>
    services.value.filter(service => service.status === 'offline')
  )

  const checkingServices = computed(() =>
    services.value.filter(service => service.status === 'checking')
  )

  const criticalServices = computed(() =>
    services.value.filter(service =>
      service.status === 'offline' && ['prometheus', 'node-exporter'].includes(service.id)
    )
  )

  /**
   * Check service health via Prometheus up metric
   */
  const checkServiceViaPrometheus = async (service: ServiceStatus): Promise<void> => {
    try {
      const query = `up{job="${service.job}",instance="${service.instance}"}`
      const response = await prometheusClient.query(query)

      if (response.status === 'success' && response.data.result.length > 0) {
        const value = MetricsUtils.extractValue(response.data.result)
        service.status = value === 1 ? 'online' : 'offline'
        service.lastChecked = new Date()

        // Get additional metrics if available
        await fetchServiceMetrics(service)
      } else {
        service.status = 'unknown'
        service.lastChecked = new Date()
      }
    } catch (error) {
      console.warn(`Prometheus check failed for ${service.name}:`, error)
      service.status = 'unknown'
      service.lastChecked = new Date()
    }
  }

  /**
   * Check service health via direct HTTP call
   */
  const checkServiceViaHTTP = async (service: ServiceStatus): Promise<void> => {
    if (!service.healthEndpoint) return

    const startTime = Date.now()

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(service.healthEndpoint, {
        method: 'GET',
        signal: controller.signal,
        mode: 'no-cors' // Handle CORS for external services
      })

      clearTimeout(timeoutId)
      service.responseTime = Date.now() - startTime
      service.lastChecked = new Date()
      service.status = 'online'

    } catch (error) {
      service.responseTime = Date.now() - startTime
      service.lastChecked = new Date()
      service.status = 'offline'
      console.warn(`HTTP health check failed for ${service.name}:`, error)
    }
  }

  /**
   * Fetch additional metrics for a service
   */
  const fetchServiceMetrics = async (service: ServiceStatus): Promise<void> => {
    try {
      const promises: Promise<any>[] = []

      // Common metrics for all services
      promises.push(
        prometheusClient.query(`node_time_seconds - node_boot_time_seconds`).catch(() => null)
      )

      // Service-specific metrics
      switch (service.id) {
        case 'qbittorrent-exporter':
          promises.push(
            prometheusClient.query(SYSTEM_QUERIES.qbittorrentActiveDownloads).catch(() => null),
            prometheusClient.query(SYSTEM_QUERIES.qbittorrentDownloadSpeed).catch(() => null),
            prometheusClient.query(SYSTEM_QUERIES.qbittorrentUploadSpeed).catch(() => null)
          )
          break

        case 'zfs-exporter':
          promises.push(
            prometheusClient.query(SYSTEM_QUERIES.zfsPoolHealth).catch(() => null),
            prometheusClient.query(SYSTEM_QUERIES.zfsPoolUsagePercent).catch(() => null)
          )
          break

        case 'cadvisor':
          promises.push(
            prometheusClient.query(SYSTEM_QUERIES.containerCount).catch(() => null)
          )
          break
      }

      const results = await Promise.allSettled(promises)

      if (!service.metrics) service.metrics = {}

      // Process results
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value?.status === 'success') {
          const value = MetricsUtils.extractValue(result.value.data.result)

          switch (index) {
            case 0:
              service.metrics!.uptime = value
              break
            default:
              // Service-specific metrics handling
              if (service.id === 'qbittorrent-exporter') {
                switch (index) {
                  case 1: service.metrics!.customMetrics = { ...service.metrics!.customMetrics, activeDownloads: value }; break
                  case 2: service.metrics!.customMetrics = { ...service.metrics!.customMetrics, downloadSpeed: value }; break
                  case 3: service.metrics!.customMetrics = { ...service.metrics!.customMetrics, uploadSpeed: value }; break
                }
              }
              break
          }
        }
      })

    } catch (error) {
      console.warn(`Failed to fetch metrics for ${service.name}:`, error)
    }
  }

  /**
   * Check health of a single service
   */
  const checkServiceHealth = async (service: ServiceStatus): Promise<void> => {
    service.status = 'checking'

    // Try Prometheus first, fallback to HTTP
    await checkServiceViaPrometheus(service)

    if (service.status === 'unknown' && service.healthEndpoint) {
      await checkServiceViaHTTP(service)
    }
  }

  /**
   * Check health of all services
   */
  const checkAllServicesHealth = async (): Promise<void> => {
    try {
      isLoading.value = true
      error.value = ''

      // Check all services in parallel
      const promises = services.value.map(service => checkServiceHealth(service))
      await Promise.allSettled(promises)

      // Update service metrics
      updateServiceMetrics()

    } catch (err) {
      console.error('Failed to check services health:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update aggregate service metrics
   */
  const updateServiceMetrics = (): void => {
    const total = services.value.length
    const online = onlineServices.value.length
    const offline = offlineServices.value.length

    serviceMetrics.value = {
      totalServices: total,
      onlineServices: online,
      offlineServices: offline,
      healthyPercentage: total > 0 ? (online / total) * 100 : 0,
      lastUpdateTime: new Date()
    }
  }

  /**
   * Refresh a specific service
   */
  const refreshService = async (serviceId: string): Promise<void> => {
    const service = services.value.find(s => s.id === serviceId)
    if (service) {
      await checkServiceHealth(service)
      updateServiceMetrics()
    }
  }

  /**
   * Refresh all services
   */
  const refreshAllServices = async (): Promise<void> => {
    isRefreshing.value = true
    await checkAllServicesHealth()
    isRefreshing.value = false
  }

  /**
   * Start auto-refresh monitoring
   */
  const startAutoRefresh = (): void => {
    if (monitoringInterval) return

    // Initial check
    checkAllServicesHealth()

    // Set up interval (every 60 seconds)
    monitoringInterval = setInterval(checkAllServicesHealth, 60000)
  }

  /**
   * Stop auto-refresh monitoring
   */
  const stopAutoRefresh = (): void => {
    if (monitoringInterval) {
      clearInterval(monitoringInterval)
      monitoringInterval = null
    }
  }

  /**
   * Toggle auto-refresh
   */
  const toggleAutoRefresh = (): void => {
    isAutoRefreshEnabled.value = !isAutoRefreshEnabled.value

    if (isAutoRefreshEnabled.value) {
      startAutoRefresh()
    } else {
      stopAutoRefresh()
    }
  }

  /**
   * Get service by ID
   */
  const getServiceById = (id: string): ServiceStatus | undefined => {
    return services.value.find(service => service.id === id)
  }

  /**
   * Get services by status
   */
  const getServicesByStatus = (status: ServiceStatus['status']): ServiceStatus[] => {
    return services.value.filter(service => service.status === status)
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stopAutoRefresh()
  })

  return {
    // State
    services: readonly(services),
    serviceMetrics: readonly(serviceMetrics),
    isLoading: readonly(isLoading),
    error: readonly(error),
    isAutoRefreshEnabled: readonly(isAutoRefreshEnabled),
    isRefreshing: readonly(isRefreshing),

    // Computed
    onlineServices,
    offlineServices,
    checkingServices,
    criticalServices,

    // Actions
    checkServiceHealth,
    checkAllServicesHealth,
    refreshService,
    refreshAllServices,
    startAutoRefresh,
    stopAutoRefresh,
    toggleAutoRefresh,
    getServiceById,
    getServicesByStatus
  }
}
