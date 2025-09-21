<template>
  <div class="mobile-service-card" :class="statusClass" @click="$emit('tap', service)">
    <div class="service-content">
      <div class="service-main">
        <div class="service-icon-status">
          <component :is="serviceIcon" class="service-icon w-5 h-5" />
          <div class="status-indicator" :class="statusIndicatorClass">
            {{ statusIcon }}
          </div>
        </div>
        
        <div class="service-info">
          <h4 class="service-name">{{ service.name }}</h4>
          <p class="service-description">{{ service.description }}</p>
          
          <div class="service-details" v-if="hasMetrics">
            <div class="detail-item" v-if="service.responseTime">
              <span class="detail-label">Response:</span>
              <span class="detail-value">{{ service.responseTime }}ms</span>
            </div>
            
            <div class="detail-item" v-if="service.metrics?.uptime">
              <span class="detail-label">Uptime:</span>
              <span class="detail-value">{{ formatUptime(service.metrics.uptime) }}</span>
            </div>
            
            <!-- qBittorrent-specific metrics -->
            <div v-if="service.id === 'qbittorrent-exporter' && service.metrics?.customMetrics">
              <div class="detail-item" v-if="service.metrics.customMetrics.activeDownloads !== undefined">
                <span class="detail-label">Downloads:</span>
                <span class="detail-value">{{ service.metrics.customMetrics.activeDownloads }}</span>
              </div>
              <div class="detail-item" v-if="service.metrics.customMetrics.downloadSpeed">
                <span class="detail-label">⬇ Speed:</span>
                <span class="detail-value">{{ formatBytes(service.metrics.customMetrics.downloadSpeed) }}/s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="service-actions">
        <button 
          @click.stop="$emit('refresh', service.id)"
          :disabled="service.status === 'checking'"
          class="action-button refresh-button"
        >
          <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': service.status === 'checking' }" />
        </button>
        
        <button 
          v-if="service.url"
          @click.stop="openService"
          class="action-button open-button"
        >
          <ExternalLink class="w-3 h-3" />
        </button>
      </div>
    </div>
    
    <div class="service-timestamp" v-if="service.lastChecked">
      <span class="text-xs opacity-60">
        Last checked: {{ formatTimestamp(service.lastChecked) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RefreshCw, ExternalLink, Server, Database, Shield, Activity, Download, Folder, TrendingUp, Play } from 'lucide-vue-next'
import type { ServiceStatus } from '@/composables/useServiceMonitoring'

interface Props {
  service: ServiceStatus
}

const props = defineProps<Props>()

defineEmits<{
  tap: [service: ServiceStatus]
  refresh: [serviceId: string]
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
  'proxmox': Server
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
    case 'online': return '●'
    case 'offline': return '●'
    case 'checking': return '○'
    case 'unknown': return '?'
    default: return '?'
  }
})

const hasMetrics = computed(() => {
  return props.service.responseTime || 
         props.service.metrics?.uptime ||
         (props.service.metrics?.customMetrics && Object.keys(props.service.metrics.customMetrics).length > 0)
})

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h`
  return '<1h'
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

const openService = () => {
  if (props.service.url) {
    window.open(props.service.url, '_blank')
  }
}
</script>

<style scoped>
.mobile-service-card {
  @apply p-4 rounded-lg border transition-all duration-300 cursor-pointer;
  background: linear-gradient(135deg, var(--card-bg), var(--section-bg));
  border-color: var(--primary-color);
  border-width: 1px;
  border-opacity: 0.3;
}

.mobile-service-card:active {
  transform: scale(0.98);
  border-opacity: 0.6;
}

.service-content {
  @apply flex items-start justify-between;
}

.service-main {
  @apply flex items-start gap-3 flex-1;
}

.service-icon-status {
  @apply relative;
}

.service-icon {
  color: var(--primary-color);
}

.status-indicator {
  @apply absolute -bottom-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center text-xs;
}

.status-online {
  background: var(--monitoring-success);
  color: white;
}

.status-offline {
  background: var(--monitoring-critical);
  color: white;
}

.status-checking {
  background: var(--monitoring-warning);
  color: white;
  animation: pulse 2s infinite;
}

.status-unknown {
  background: rgba(128, 128, 128, 1);
  color: white;
}

.service-info {
  @apply flex-1;
}

.service-name {
  @apply text-sm font-medium mb-1;
  color: var(--text-color);
}

.service-description {
  @apply text-xs opacity-70 mb-2;
  color: var(--text-color);
}

.service-details {
  @apply space-y-1;
}

.detail-item {
  @apply flex items-center justify-between text-xs;
}

.detail-label {
  @apply opacity-60;
  color: var(--text-color);
}

.detail-value {
  @apply font-medium;
  color: var(--primary-color);
}

.service-actions {
  @apply flex flex-col gap-2 ml-2;
}

.action-button {
  @apply p-2 rounded-lg transition-all duration-200 flex items-center justify-center;
  background: var(--section-bg);
  border: 1px solid var(--primary-color);
  border-opacity: 0.3;
  color: var(--primary-color);
  min-height: 36px;
  min-width: 36px;
}

.action-button:active {
  background: var(--primary-color);
  color: white;
  transform: scale(0.95);
}

.action-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.service-timestamp {
  @apply mt-2 pt-2 border-t border-opacity-20;
  border-color: var(--primary-color);
  color: var(--text-color);
}

/* Status-specific card styling */
.service-online {
  border-color: var(--monitoring-success);
  border-opacity: 0.3;
}

.service-online:active {
  border-color: var(--monitoring-success);
  border-opacity: 0.6;
  box-shadow: 0 4px 12px var(--monitoring-success);
  box-shadow-opacity: 0.2;
}

.service-offline {
  border-color: var(--monitoring-critical);
  border-opacity: 0.5;
}

.service-offline:active {
  border-color: var(--monitoring-critical);
  border-opacity: 0.8;
  box-shadow: 0 4px 12px var(--monitoring-critical);
  box-shadow-opacity: 0.3;
}

.service-checking {
  border-color: var(--monitoring-warning);
  border-opacity: 0.5;
}

.service-checking:active {
  border-color: var(--monitoring-warning);
  border-opacity: 0.8;
  box-shadow: 0 4px 12px var(--monitoring-warning);
  box-shadow-opacity: 0.3;
}

.service-unknown {
  border-color: rgba(128, 128, 128, 0.3);
  opacity: 0.8;
}

/* Touch feedback */
@media (hover: none) and (pointer: coarse) {
  .mobile-service-card:hover {
    transform: none;
  }
  
  .mobile-service-card:active {
    background: var(--section-bg);
  }
  
  .action-button:hover {
    background: var(--section-bg);
  }
}

/* Compact layout for smaller screens */
@media (max-width: 360px) {
  .mobile-service-card {
    @apply p-3;
  }
  
  .service-actions {
    @apply flex-row gap-1;
  }
  
  .action-button {
    min-height: 32px;
    min-width: 32px;
  }
}
</style>