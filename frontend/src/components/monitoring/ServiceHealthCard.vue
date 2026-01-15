<template>
  <div class="service-card" :class="statusClass" @click="handleCardClick">
    <div class="service-header">
      <div class="service-info">
        <component :is="serviceIcon" class="service-icon w-4 h-4" />
        <div>
          <h4 class="service-name">{{ service.name }}</h4>
          <p class="service-description">{{ service.description }}</p>
        </div>
      </div>
      
      <div class="service-status">
        <div class="status-indicator" :class="statusIndicatorClass">
          {{ statusIcon }}
        </div>
      </div>
    </div>
    
    <div class="service-metrics" v-if="service.metrics">
      <div class="metric-row" v-if="service.metrics.uptime">
        <span class="metric-label">Uptime:</span>
        <span class="metric-value">{{ formatUptime(service.metrics.uptime) }}</span>
      </div>
      
      <div class="metric-row" v-if="service.responseTime">
        <span class="metric-label">Response:</span>
        <span class="metric-value">{{ service.responseTime }}ms</span>
      </div>
      
      <!-- qBittorrent-specific metrics -->
      <div v-if="service.id === 'qbittorrent-exporter' && service.metrics.customMetrics">
        <div class="metric-row" v-if="service.metrics.customMetrics.activeDownloads !== undefined">
          <span class="metric-label">Downloads:</span>
          <span class="metric-value">{{ service.metrics.customMetrics.activeDownloads }}</span>
        </div>
        <div class="metric-row" v-if="service.metrics.customMetrics.downloadSpeed">
          <span class="metric-label">⬇ Speed:</span>
          <span class="metric-value">{{ formatBytes(service.metrics.customMetrics.downloadSpeed) }}/s</span>
        </div>
      </div>
    </div>
    
    <div class="service-timestamp" v-if="service.lastChecked">
      <span class="text-xs opacity-60">
        Last checked: {{ formatTimestamp(service.lastChecked) }}
      </span>
    </div>
    
    <div class="service-actions">
      <button 
        @click.stop="$emit('refresh', service.id)"
        :disabled="service.status === 'checking'"
        class="action-button refresh-button"
      >
        <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': service.status === 'checking' }" />
        Refresh
      </button>
      
      <button 
        v-if="service.url"
        @click.stop="$emit('open', service.url)"
        class="action-button open-button"
      >
        <ExternalLink class="w-3 h-3" />
        Open
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RefreshCw, ExternalLink, Server, Database, Shield, Activity, Download, Folder, TrendingUp, Play, Code } from 'lucide-vue-next'
import type { ServiceStatus } from '@/composables/useServiceMonitoring'

interface Props {
  service: ServiceStatus
}

const props = defineProps<Props>()

defineEmits<{
  refresh: [serviceId: string]
  open: [url: string]
}>()

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
  'proxmox': Server,
  'code-server': Code
}

const serviceIcon = computed(() => {
  return serviceIcons[props.service.id] || Shield
})

const statusClass = computed(() => ({
  'service-online': props.service.status === 'online',
  'service-offline': props.service.status === 'offline',
  'service-checking': props.service.status === 'checking',
  'service-unknown': props.service.status === 'unknown'
}))

const statusIndicatorClass = computed(() => ({
  'status-online': props.service.status === 'online',
  'status-offline': props.service.status === 'offline',
  'status-checking': props.service.status === 'checking',
  'status-unknown': props.service.status === 'unknown'
}))

const statusIcon = computed(() => {
  switch (props.service.status) {
    case 'online': return '✅'
    case 'offline': return '❌'
    case 'checking': return '🔄'
    case 'unknown': return '❓'
    default: return '❓'
  }
})

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

const handleCardClick = () => {
  if (props.service.url) {
    window.open(props.service.url, '_blank')
  }
}
</script>

<style scoped>
.service-card {
  @apply p-4 rounded-lg border transition-all duration-300 cursor-pointer;
  background: linear-gradient(135deg, var(--card-bg), var(--section-bg));
  border-color: var(--primary-color);
  border-width: 1px;
  border-opacity: 0.3;
}

.service-card:hover {
  border-opacity: 0.6;
  transform: translateY(-2px);
}

.service-header {
  @apply flex items-start justify-between mb-3;
}

.service-info {
  @apply flex items-start gap-2 flex-1;
}

.service-icon {
  @apply mt-1;
  color: var(--primary-color);
}

.service-name {
  @apply text-sm font-medium;
  color: var(--text-color);
}

.service-description {
  @apply text-xs opacity-70 mt-1;
  color: var(--text-color);
}

.service-status {
  @apply flex-shrink-0;
}

.status-indicator {
  @apply w-6 h-6 rounded-full flex items-center justify-center text-xs;
}

.status-online {
  background: rgba(0, 255, 0, 0.2);
  color: rgba(0, 255, 0, 1);
}

.status-offline {
  background: rgba(255, 0, 0, 0.2);
  color: rgba(255, 0, 0, 1);
}

.status-checking {
  background: rgba(255, 165, 0, 0.2);
  color: rgba(255, 165, 0, 1);
  animation: pulse 2s infinite;
}

.status-unknown {
  background: rgba(128, 128, 128, 0.2);
  color: rgba(128, 128, 128, 1);
}

.service-metrics {
  @apply space-y-1 mb-3;
}

.metric-row {
  @apply flex items-center justify-between text-xs;
}

.metric-label {
  @apply opacity-70;
  color: var(--text-color);
}

.metric-value {
  @apply font-medium;
  color: var(--primary-color);
}

.service-timestamp {
  @apply mb-3 pb-2 border-b border-opacity-20;
  border-color: var(--primary-color);
  color: var(--text-color);
}

.service-actions {
  @apply flex items-center justify-between gap-2;
}

.action-button {
  @apply px-2 py-1 text-xs rounded font-medium transition-all duration-200 flex items-center gap-1;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  opacity: 0.8;
}

.action-button:hover {
  opacity: 1;
  transform: translateY(-1px);
}

.action-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.refresh-button {
  flex: 1;
}

.open-button {
  flex: 1;
}

/* Status-specific card styling */
.service-online {
  border-color: rgba(0, 255, 0, 0.3);
}

.service-online:hover {
  border-color: rgba(0, 255, 0, 0.6);
  box-shadow: 0 4px 12px rgba(0, 255, 0, 0.2);
}

.service-offline {
  border-color: rgba(255, 0, 0, 0.5);
}

.service-offline:hover {
  border-color: rgba(255, 0, 0, 0.8);
  box-shadow: 0 4px 12px rgba(255, 0, 0, 0.3);
}

.service-checking {
  border-color: rgba(255, 165, 0, 0.5);
}

.service-checking:hover {
  border-color: rgba(255, 165, 0, 0.8);
  box-shadow: 0 4px 12px rgba(255, 165, 0, 0.3);
}

.service-unknown {
  border-color: rgba(128, 128, 128, 0.3);
  opacity: 0.8;
}

@media (max-width: 768px) {
  .service-card {
    @apply p-3;
  }
  
  .service-actions {
    @apply flex-col gap-2;
  }
  
  .action-button {
    @apply w-full justify-center;
  }
}
</style>