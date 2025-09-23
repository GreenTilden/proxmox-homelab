<template>
  <div
    class="nes-container is-rounded"
    :style="cardStyles"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <!-- Top Border Glow Effect -->
    <div :style="glowBarStyles" />

    <!-- Header Section -->
    <div :style="headerStyles">
      <div :style="serviceInfoStyles">
        <component
          :is="serviceIcon"
          :style="iconStyles"
        />
        <div>
          <h4 class="nes-text" :style="titleStyles">{{ service.name }}</h4>
          <p class="nes-text" :style="descriptionStyles">{{ service.description }}</p>
        </div>
      </div>

      <!-- Status Indicator -->
      <div :style="statusIndicatorStyles">
        {{ statusIcon }}
      </div>
    </div>

    <!-- Metrics Section -->
    <div v-if="service.metrics" :style="metricsStyles">
      <div v-if="service.metrics.uptime" :style="metricRowStyles">
        <span class="nes-text" :style="metricLabelStyles">Uptime:</span>
        <span class="nes-text" :style="metricValueStyles">{{ formatUptime(service.metrics.uptime) }}</span>
      </div>

      <div v-if="service.responseTime" :style="metricRowStyles">
        <span class="nes-text" :style="metricLabelStyles">Response:</span>
        <span class="nes-text" :style="metricValueStyles">{{ service.responseTime }}ms</span>
      </div>

      <!-- Service-specific metrics -->
      <div v-if="service.id === 'qbittorrent-exporter' && service.metrics.customMetrics">
        <div v-if="service.metrics.customMetrics.activeDownloads !== undefined" :style="metricRowStyles">
          <span :style="metricLabelStyles">Downloads:</span>
          <span :style="metricValueStyles">{{ service.metrics.customMetrics.activeDownloads }}</span>
        </div>
        <div v-if="service.metrics.customMetrics.downloadSpeed" :style="metricRowStyles">
          <span :style="metricLabelStyles">⬇ Speed:</span>
          <span :style="metricValueStyles">{{ formatBytes(service.metrics.customMetrics.downloadSpeed) }}/s</span>
        </div>
      </div>
    </div>

    <!-- Service Metrics for monitoring services -->
    <ServiceMetrics
      v-if="isMonitoringService"
      :service-id="service.id"
      :show-metrics="true"
    />

    <!-- URL Display -->
    <div v-if="service.url" :style="urlDisplayStyles">
      <span class="nes-text" :style="urlLabelStyles">URL:</span>
      <span class="nes-text" :style="urlTextStyles">{{ service.url }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { Server, Database, Shield, Activity, Download, Folder, TrendingUp, Play } from 'lucide-vue-next'
import type { ServiceStatus } from '@/composables/useServiceMonitoring'
import ServiceMetrics from '@/components/monitoring/ServiceMetrics.vue'

// IconScout icons (to be replaced with actual IconScout imports)
// TODO: Replace these with actual IconScout 8-bit status icons
const StatusOnlineIcon = '●'   // Replace with: import StatusOnlineIcon from '@iconscout/...'
const StatusOfflineIcon = '○'  // Replace with: import StatusOfflineIcon from '@iconscout/...'
const StatusCheckingIcon = '◐' // Replace with: import StatusCheckingIcon from '@iconscout/...'
const StatusWarningIcon = '▲'  // Replace with: import StatusWarningIcon from '@iconscout/...'
const StatusErrorIcon = '■'    // Replace with: import StatusErrorIcon from '@iconscout/...'
const StatusUnknownIcon = '?'  // Replace with: import StatusUnknownIcon from '@iconscout/...'

interface Props {
  service: ServiceStatus
  elevation?: 'low' | 'medium' | 'high'
  borderStyle?: 'solid' | 'gradient' | 'animated'
  glowEffect?: boolean
  compactMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  elevation: 'medium',
  borderStyle: 'gradient',
  glowEffect: true,
  compactMode: false
})

defineEmits<{
  open: [url: string]
}>()

// Get theme from provider
const themeContext = inject('fallTheme') as any
const { theme } = themeContext

const hover = ref(false)

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
  return serviceIcons[props.service.id] || Shield
})

// Determine if this service should show metrics
const isMonitoringService = computed(() => {
  const monitoringServices = ['node-exporter', 'zfs-exporter', 'cadvisor', 'prometheus']
  return monitoringServices.includes(props.service.id)
})

const statusColors = computed(() => {
  switch (props.service.status) {
    case 'online':
      return {
        bg: '#00ff00',  // 8-bit bright green
        border: '#00cc00',
        text: '#ffffff',
        glow: '#00ff0040'
      }
    case 'offline':
      return {
        bg: '#ff0000',  // 8-bit bright red
        border: '#cc0000',
        text: '#ffffff',
        glow: '#ff000040'
      }
    case 'checking':
      return {
        bg: '#ffff00',  // 8-bit bright yellow
        border: '#cccc00',
        text: '#000000',
        glow: '#ffff0040'
      }
    case 'warning':
      return {
        bg: '#ff8800',  // 8-bit orange
        border: '#cc6600',
        text: '#ffffff',
        glow: '#ff880040'
      }
    case 'error':
      return {
        bg: '#ff0066',  // 8-bit pink/magenta
        border: '#cc0044',
        text: '#ffffff',
        glow: '#ff006640'
      }
    case 'unknown':
    default:
      return {
        bg: '#888888',  // 8-bit gray
        border: '#666666',
        text: '#ffffff',
        glow: '#88888840'
      }
  }
})

// Card Styles with pixelated NES-inspired effects
const cardStyles = computed(() => ({
  background: `linear-gradient(135deg, ${theme.value.backgrounds.card}dd, ${theme.value.backgrounds.surface}dd)`,
  border: props.borderStyle === 'gradient'
    ? `4px solid ${statusColors.value.border}60`
    : `4px solid ${statusColors.value.border}`,
  borderRadius: '0px', // Pixelated - no rounded corners
  padding: props.compactMode ? 'var(--space-md)' : 'var(--space-lg)',
  position: 'relative' as const,
  overflow: 'hidden' as const,
  cursor: 'default',
  transition: 'all var(--transition-normal)',
  backdropFilter: 'blur(10px)',
  imageRendering: 'pixelated',
  boxShadow: hover.value
    ? `
      0 8px 32px ${theme.value.effects.shadow},
      0 0 20px ${statusColors.value.glow},
      inset 3px 3px 0px ${theme.value.text.primary}40,
      inset -3px -3px 0px ${theme.value.effects.shadow},
      4px 4px 0px ${statusColors.value.border}80
    `
    : `
      0 4px 12px ${theme.value.effects.shadow},
      inset 2px 2px 0px ${theme.value.text.primary}20,
      inset -2px -2px 0px ${theme.value.effects.shadow},
      2px 2px 0px ${statusColors.value.border}60
    `,
  transform: hover.value ? 'translateY(-2px)' : 'translateY(0)',
  borderColor: hover.value ? statusColors.value.border : statusColors.value.border + '60'
}))

const glowBarStyles = computed(() => ({
  position: 'absolute' as const,
  top: '0',
  left: '0',
  right: '0',
  height: '2px',
  background: `linear-gradient(90deg, transparent, ${statusColors.value.border}, transparent)`,
  opacity: hover.value ? '1' : '0',
  transition: 'opacity var(--transition-normal)'
}))

// Header Styles
const headerStyles = computed(() => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: 'var(--space-md)'
}))

const serviceInfoStyles = computed(() => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 'var(--space-sm)',
  flex: '1'
}))

const iconStyles = computed(() => ({
  width: '16px',
  height: '16px',
  color: theme.value.primary.ramp4,
  marginTop: '2px',
  filter: `drop-shadow(0 0 4px ${theme.value.primary.ramp4}40)`
}))

const titleStyles = computed(() => ({
  fontSize: '0.875rem',
  fontWeight: '600',
  color: theme.value.text.bright,
  margin: '0',
  lineHeight: '1.25'
}))

const descriptionStyles = computed(() => ({
  fontSize: '0.75rem',
  color: theme.value.text.muted,
  margin: '4px 0 0 0',
  lineHeight: '1.25',
  opacity: '0.8'
}))

// Status Indicator Styles - 8-bit pixelated
const statusIndicatorStyles = computed(() => ({
  width: '24px',
  height: '24px',
  borderRadius: '0px', // Pixelated - no rounded corners
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  fontWeight: 'bold',
  background: statusColors.value.bg,
  border: `2px solid ${statusColors.value.border}`,
  color: statusColors.value.text,
  flexShrink: '0',
  imageRendering: 'pixelated',
  animation: props.service.status === 'checking' ? 'blink 1s infinite' : 'none',
  boxShadow: props.glowEffect
    ? `
      0 0 8px ${statusColors.value.glow},
      inset 1px 1px 0px rgba(255,255,255,0.3),
      inset -1px -1px 0px rgba(0,0,0,0.3)
    `
    : `
      inset 1px 1px 0px rgba(255,255,255,0.2),
      inset -1px -1px 0px rgba(0,0,0,0.2)
    `,
  textShadow: props.service.status === 'checking' ? 'none' : '1px 1px 0px rgba(0,0,0,0.5)',
  transition: 'all 0.2s ease'
}))

// Status icons with 8-bit representation (IconScout ready)
const statusIcon = computed(() => {
  switch (props.service.status) {
    case 'online': return StatusOnlineIcon    // Green dot - service running
    case 'offline': return StatusOfflineIcon  // Red dot - service stopped
    case 'checking': return StatusCheckingIcon // Loading indicator - checking
    case 'warning': return StatusWarningIcon   // Warning triangle - caution
    case 'error': return StatusErrorIcon       // Error square - failed
    case 'unknown': return StatusUnknownIcon   // Question mark - unknown
    default: return StatusUnknownIcon
  }
})

// Metrics Styles
const metricsStyles = computed(() => ({
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 'var(--space-xs)',
  marginBottom: 'var(--space-md)'
}))

const metricRowStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: '0.75rem'
}))

const metricLabelStyles = computed(() => ({
  color: theme.value.text.muted,
  opacity: '0.8'
}))

const metricValueStyles = computed(() => ({
  color: theme.value.primary.ramp4,
  fontWeight: '500'
}))

// Timestamp Styles
const timestampStyles = computed(() => ({
  marginBottom: 'var(--space-md)',
  paddingBottom: 'var(--space-sm)',
  borderBottom: `1px solid ${theme.value.neutral.ramp3}30`
}))

const timestampTextStyles = computed(() => ({
  fontSize: '0.75rem',
  color: theme.value.text.muted,
  opacity: '0.6',
  textAlign: 'center' as const
}))

// URL Display Styles
const urlDisplayStyles = computed(() => ({
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 'var(--space-xs)',
  marginTop: 'var(--space-md)',
  paddingTop: 'var(--space-sm)',
  borderTop: `1px solid ${theme.value.neutral.ramp3}30`
}))

const urlLabelStyles = computed(() => ({
  fontSize: '0.7rem',
  color: theme.value.text.muted,
  opacity: '0.8'
}))

const urlTextStyles = computed(() => ({
  fontSize: '0.75rem',
  color: theme.value.primary.ramp4,
  fontFamily: 'monospace',
  wordBreak: 'break-all' as const,
  userSelect: 'all' as const,
  cursor: 'text'
}))

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
/* 8-bit Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0.3;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 8-bit pixelated rendering */
* {
  image-rendering: optimizeSpeed;
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: -o-crisp-edges;
  image-rendering: pixelated;
  -ms-interpolation-mode: nearest-neighbor;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  /* Mobile styles are handled via props.compactMode */
}
</style>