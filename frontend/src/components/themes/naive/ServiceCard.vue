<template>
  <n-card
    :bordered="true"
    :hoverable="true"
    :class="cardClasses"
    :style="cardStyle"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <!-- Header Section -->
    <template #header>
      <div class="service-header">
        <div class="service-info">
          <component
            :is="serviceIcon"
            class="service-icon"
          />
          <div class="service-text">
            <h4 class="service-title">{{ service.name }}</h4>
            <p class="service-description">{{ service.description }}</p>
          </div>
        </div>

        <!-- Status Badge -->
        <n-badge
          :value="statusIcon"
          :type="statusType"
          :color="statusColor"
          :processing="service.status === 'checking'"
        />
      </div>
    </template>

    <!-- Metrics Section -->
    <div v-if="service.metrics || service.responseTime" class="metrics-section">
      <n-space vertical :size="8">
        <div v-if="service.metrics?.uptime" class="metric-row">
          <n-text depth="3" class="metric-label">Uptime</n-text>
          <n-text strong class="metric-value">{{ formatUptime(service.metrics.uptime) }}</n-text>
        </div>

        <div v-if="service.responseTime" class="metric-row">
          <n-text depth="3" class="metric-label">Response Time</n-text>
          <n-text strong class="metric-value">{{ service.responseTime }}ms</n-text>
        </div>

        <!-- Service-specific metrics -->
        <template v-if="service.id === 'qbittorrent-exporter' && service.metrics?.customMetrics">
          <div v-if="service.metrics.customMetrics.activeDownloads !== undefined" class="metric-row">
            <n-text depth="3" class="metric-label">Active Downloads</n-text>
            <n-text strong class="metric-value">{{ service.metrics.customMetrics.activeDownloads }}</n-text>
          </div>
          <div v-if="service.metrics.customMetrics.downloadSpeed" class="metric-row">
            <n-text depth="3" class="metric-label">Download Speed</n-text>
            <n-text strong class="metric-value">{{ formatBytes(service.metrics.customMetrics.downloadSpeed) }}/s</n-text>
          </div>
        </template>
      </n-space>
    </div>

    <!-- Service Metrics for monitoring services -->
    <ServiceMetrics
      v-if="isMonitoringService"
      :service-id="service.id"
      :show-metrics="true"
    />

    <!-- URL Display -->
    <template v-if="service.url" #footer>
      <n-space vertical :size="4" class="url-section">
        <n-text depth="3" class="url-label">Service URL</n-text>
        <n-text code class="url-text" @click="openService(service.url!)">
          {{ service.url }}
        </n-text>
      </n-space>
    </template>

    <!-- Last Checked -->
    <div v-if="service.lastChecked" class="last-checked">
      <n-text depth="3" size="tiny">
        Last checked {{ formatTimestamp(service.lastChecked) }}
      </n-text>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { NCard, NBadge, NSpace, NText } from 'naive-ui'
import { Server, Database, Shield, Activity, Download, Folder, TrendingUp, Play } from 'lucide-vue-next'
import type { ServiceStatus } from '@/composables/useServiceMonitoring'
import ServiceMetrics from '@/components/monitoring/ServiceMetrics.vue'
import { useTheme } from '@/composables/useTheme'

interface Props {
  service: ServiceStatus
  elevation?: 'low' | 'medium' | 'high'
  borderStyle?: 'solid' | 'gradient' | 'animated'
  glowEffect?: boolean
  compactMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  elevation: 'medium',
  borderStyle: 'solid',
  glowEffect: false,
  compactMode: false
})

const emit = defineEmits<{
  open: [url: string]
  refresh: [serviceId: string]
}>()

const hover = ref(false)

// Get Taylor Swift era theme
const { theme } = useTheme()

const serviceIcons = {
  'prometheus': Database,
  'node-exporter': Server,
  'cadvisor': Activity,
  'zfs-exporter': Database,
  'qbittorrent-exporter': Download,
  'plex': Play,
  'grafana': TrendingUp,
  'qbittorrent': Download,
  'filebrowser': Folder,
  'proxmox': Server
}

const serviceIcon = computed(() => {
  return serviceIcons[props.service.id as keyof typeof serviceIcons] || Shield
})

// Determine if this service should show metrics
const isMonitoringService = computed(() => {
  const monitoringServices = ['node-exporter', 'zfs-exporter', 'cadvisor', 'prometheus']
  return monitoringServices.includes(props.service.id)
})

// Status type mapping for Naive UI badge
const statusType = computed(() => {
  switch (props.service.status) {
    case 'online':
      return 'success'
    case 'offline':
      return 'error'
    case 'checking':
      return 'info'
    case 'warning':
      return 'warning'
    case 'unknown':
    default:
      return 'default'
  }
})

// Status icons
const statusIcon = computed(() => {
  switch (props.service.status) {
    case 'online':
      return '●'
    case 'offline':
      return '○'
    case 'checking':
      return '◐'
    case 'warning':
      return '▲'
    case 'error':
      return '■'
    case 'unknown':
    default:
      return '?'
  }
})

// Era-aware status colors
const statusColor = computed(() => {
  switch (props.service.status) {
    case 'online':
      return {
        color: theme.value.status.success,
        textColor: theme.value.text.bright
      }
    case 'offline':
      return {
        color: theme.value.status.error,
        textColor: theme.value.text.bright
      }
    case 'warning':
      return {
        color: theme.value.status.warning,
        textColor: theme.value.text.bright
      }
    case 'checking':
      return {
        color: theme.value.status.info,
        textColor: theme.value.text.bright
      }
    default:
      return {
        color: theme.value.neutral.ramp3,
        textColor: theme.value.text.secondary
      }
  }
})

// Dynamic card classes based on status and elevation
const cardClasses = computed(() => {
  const classes = ['service-card']

  if (props.elevation === 'high') classes.push('service-card--high-elevation')
  if (props.compactMode) classes.push('service-card--compact')
  if (hover.value) classes.push('service-card--hover')

  return classes.join(' ')
})

// Dynamic card styles with era colors
const cardStyle = computed(() => ({
  borderColor: props.service.status === 'online'
    ? theme.value.primary.ramp3
    : theme.value.neutral.ramp2,
  '--service-icon-color': theme.value.primary.ramp4,
  '--service-hover-color': theme.value.primary.ramp5,
  '--service-border-glow': props.glowEffect && hover.value
    ? `0 0 12px ${theme.value.effects.glow}`
    : 'none'
}))

// Methods
const openService = (url: string) => {
  emit('open', url)
}

// Helper functions
const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatTimestamp = (date: Date): string => {
  const now = Date.now()
  const diff = now - date.getTime()

  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  return `${Math.floor(diff / 3600000)}h ago`
}
</script>

<style scoped>
.service-card {
  transition: all 0.2s ease;
  box-shadow: var(--service-border-glow);
}

.service-card--high-elevation {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.service-card--compact {
  /* Compact mode handled by Naive UI props */
}

.service-card--hover {
  transform: translateY(-2px) perspective(1000px) rotateX(2deg);
  box-shadow: var(--service-border-glow);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.service-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.service-info {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex: 1;
}

.service-icon {
  width: 20px;
  height: 20px;
  color: var(--service-icon-color);
  margin-top: 2px;
  flex-shrink: 0;
  transition: color 0.2s ease;
}

.service-card--hover .service-icon {
  color: var(--service-hover-color);
}

.service-text {
  flex: 1;
  min-width: 0;
}

.service-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
}

.service-description {
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.4;
  opacity: 0.8;
}

.metrics-section {
  margin-top: 1rem;
}

.metric-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 1.5rem;
}

.metric-label {
  font-size: 0.875rem;
}

.metric-value {
  font-size: 0.875rem;
}

.url-section {
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color);
}

.url-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.url-text {
  font-size: 0.8125rem;
  cursor: pointer;
  user-select: all;
  word-break: break-all;
  transition: color 0.2s ease;
}

.url-text:hover {
  color: var(--service-hover-color);
}

.last-checked {
  margin-top: 0.75rem;
  text-align: center;
  opacity: 0.7;
}

/* Dark theme adjustments */
.n-card.n-theme-dark {
  background-color: rgba(255, 255, 255, 0.02);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .service-header {
    gap: 0.5rem;
  }

  .service-info {
    gap: 0.5rem;
  }

  .service-title {
    font-size: 0.9rem;
  }

  .service-description {
    font-size: 0.8125rem;
  }
}
</style>