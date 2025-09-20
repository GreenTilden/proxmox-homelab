<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header" style="background: var(--section-bg); border-color: var(--primary-color);">
        <div class="header-info">
          <h3 class="modal-title" style="color: var(--text-color);">{{ service.name }}</h3>
          <p class="service-description" style="color: var(--text-color);">{{ service.description }}</p>
        </div>
        <button @click="$emit('close')" class="close-button">
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <div class="modal-body">
        <!-- Service Status -->
        <div class="status-section">
          <div class="status-display">
            <component :is="serviceIcon" class="service-large-icon w-12 h-12" />
            <div class="status-info">
              <div class="status-badge" :class="statusBadgeClass">
                {{ statusIcon }} {{ statusText }}
              </div>
              <div class="last-check" style="color: var(--text-color);" v-if="service.lastChecked">
                Last checked: {{ formatTimestamp(service.lastChecked) }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Service Details -->
        <div class="details-section">
          <h4 class="section-title" style="color: var(--text-color);">Service Details</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Job:</span>
              <span class="detail-value">{{ service.job }}</span>
            </div>
            
            <div class="detail-item">
              <span class="detail-label">Instance:</span>
              <span class="detail-value">{{ service.instance }}</span>
            </div>
            
            <div class="detail-item" v-if="service.responseTime">
              <span class="detail-label">Response Time:</span>
              <span class="detail-value">{{ service.responseTime }}ms</span>
            </div>
            
            <div class="detail-item" v-if="service.url">
              <span class="detail-label">URL:</span>
              <span class="detail-value url-value">{{ service.url }}</span>
            </div>
          </div>
        </div>
        
        <!-- Metrics Section -->
        <div class="metrics-section" v-if="hasMetrics">
          <h4 class="section-title" style="color: var(--text-color);">Metrics</h4>
          <div class="metrics-grid">
            <div class="metric-item" v-if="service.metrics?.uptime">
              <span class="metric-label">Uptime:</span>
              <span class="metric-value">{{ formatUptime(service.metrics.uptime) }}</span>
            </div>
            
            <!-- Deluge-specific metrics -->
            <template v-if="service.id === 'deluge-exporter' && service.metrics?.customMetrics">
              <div class="metric-item" v-if="service.metrics.customMetrics.activeDownloads !== undefined">
                <span class="metric-label">Active Downloads:</span>
                <span class="metric-value">{{ service.metrics.customMetrics.activeDownloads }}</span>
              </div>
              
              <div class="metric-item" v-if="service.metrics.customMetrics.downloadSpeed">
                <span class="metric-label">Download Speed:</span>
                <span class="metric-value">{{ formatBytes(service.metrics.customMetrics.downloadSpeed) }}/s</span>
              </div>
              
              <div class="metric-item" v-if="service.metrics.customMetrics.uploadSpeed">
                <span class="metric-label">Upload Speed:</span>
                <span class="metric-value">{{ formatBytes(service.metrics.customMetrics.uploadSpeed) }}/s</span>
              </div>
            </template>
          </div>
        </div>
        
        <!-- Health Recommendations -->
        <div class="recommendations-section" v-if="recommendations.length > 0">
          <h4 class="section-title" style="color: var(--text-color);">Health Status</h4>
          <div class="recommendations-list">
            <div 
              v-for="recommendation in recommendations" 
              :key="recommendation.id"
              class="recommendation-item"
              :class="recommendation.type"
            >
              <component :is="recommendation.icon" class="w-4 h-4 recommendation-icon" />
              <span class="recommendation-text">{{ recommendation.text }}</span>
            </div>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="actions-section">
          <h4 class="section-title" style="color: var(--text-color);">Actions</h4>
          <div class="action-buttons">
            <button 
              class="action-button primary"
              @click="refreshService"
              :disabled="service.status === 'checking'"
            >
              <RefreshCw class="w-4 h-4 mr-2" :class="{ 'animate-spin': service.status === 'checking' }" />
              {{ service.status === 'checking' ? 'Checking...' : 'Refresh Status' }}
            </button>
            
            <button 
              class="action-button secondary"
              v-if="service.url"
              @click="openService"
            >
              <ExternalLink class="w-4 h-4 mr-2" />
              Open Service
            </button>
            
            <button 
              class="action-button secondary"
              v-if="service.healthEndpoint"
              @click="testHealthEndpoint"
            >
              <Activity class="w-4 h-4 mr-2" />
              Test Health Endpoint
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  X, 
  RefreshCw, 
  ExternalLink, 
  Activity,
  Server, 
  Database, 
  Shield, 
  Download, 
  Folder, 
  TrendingUp, 
  Play,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-vue-next'
import type { ServiceStatus } from '../../composables/useServiceMonitoring'

interface Props {
  service: ServiceStatus
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  refresh: [serviceId: string]
}>()

const serviceIcons = {
  'prometheus': Database,
  'node-exporter': Server,
  'cadvisor': Activity,
  'zfs-exporter': Database,
  'deluge-exporter': Download,
  'plex': Play,
  'grafana': TrendingUp,
  'deluge': Download,
  'filebrowser': Folder,
  'proxmox': Server
}

const serviceIcon = computed(() => {
  return serviceIcons[props.service.id] || Shield
})

const statusBadgeClass = computed(() => ({
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

const statusText = computed(() => {
  switch (props.service.status) {
    case 'online': return 'Online'
    case 'offline': return 'Offline'
    case 'checking': return 'Checking'
    case 'unknown': return 'Unknown'
    default: return 'Unknown'
  }
})

const hasMetrics = computed(() => {
  return props.service.metrics?.uptime ||
         (props.service.metrics?.customMetrics && Object.keys(props.service.metrics.customMetrics).length > 0)
})

const recommendations = computed(() => {
  const recs = []
  
  switch (props.service.status) {
    case 'online':
      recs.push({
        id: 'service-healthy',
        type: 'success',
        icon: CheckCircle,
        text: 'Service is running normally and responding to requests'
      })
      break
      
    case 'offline':
      recs.push({
        id: 'service-down',
        type: 'critical',
        icon: XCircle,
        text: 'Service is not responding. Check service logs and restart if necessary'
      })
      break
      
    case 'checking':
      recs.push({
        id: 'service-checking',
        type: 'warning',
        icon: Activity,
        text: 'Currently checking service status. Please wait for results'
      })
      break
      
    case 'unknown':
      recs.push({
        id: 'service-unknown',
        type: 'warning',
        icon: AlertTriangle,
        text: 'Unable to determine service status. Check network connectivity and service configuration'
      })
      break
  }
  
  // Add performance recommendations
  if (props.service.responseTime && props.service.responseTime > 5000) {
    recs.push({
      id: 'slow-response',
      type: 'warning',
      icon: AlertTriangle,
      text: 'Service response time is slower than expected. Consider investigating performance issues'
    })
  }
  
  return recs
})

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
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
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

const refreshService = () => {
  emit('refresh', props.service.id)
}

const openService = () => {
  if (props.service.url) {
    window.open(props.service.url, '_blank')
  }
}

const testHealthEndpoint = () => {
  if (props.service.healthEndpoint) {
    window.open(props.service.healthEndpoint, '_blank')
  }
}
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.modal-content {
  @apply w-full max-w-lg mx-4 rounded-lg overflow-hidden;
  background: var(--card-bg);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  @apply flex items-start justify-between p-4 border-b border-opacity-20;
}

.header-info {
  @apply flex-1;
}

.modal-title {
  @apply text-lg font-semibold mb-1;
}

.service-description {
  @apply text-sm opacity-80;
}

.close-button {
  @apply p-1 rounded-lg transition-colors ml-4;
  color: var(--text-color);
}

.close-button:hover {
  background: var(--section-bg);
}

.modal-body {
  @apply p-4 space-y-6;
}

.status-section {
  @apply text-center py-4;
}

.status-display {
  @apply flex flex-col items-center space-y-3;
}

.service-large-icon {
  color: var(--primary-color);
}

.status-info {
  @apply text-center;
}

.status-badge {
  @apply inline-block px-3 py-1 rounded-full text-sm font-medium mb-2;
}

.status-online {
  background: var(--monitoring-success);
  background-opacity: 0.2;
  color: var(--monitoring-success);
}

.status-offline {
  background: var(--monitoring-critical);
  background-opacity: 0.2;
  color: var(--monitoring-critical);
}

.status-checking {
  background: var(--monitoring-warning);
  background-opacity: 0.2;
  color: var(--monitoring-warning);
}

.status-unknown {
  background: rgba(128, 128, 128, 0.2);
  color: rgba(128, 128, 128, 1);
}

.last-check {
  @apply text-xs opacity-70;
}

.details-section,
.metrics-section,
.recommendations-section,
.actions-section {
  @apply space-y-3;
}

.section-title {
  @apply text-sm font-medium opacity-80;
}

.detail-grid,
.metrics-grid {
  @apply space-y-2;
}

.detail-item,
.metric-item {
  @apply flex items-center justify-between text-sm;
}

.detail-label,
.metric-label {
  @apply opacity-70;
  color: var(--text-color);
}

.detail-value,
.metric-value {
  @apply font-medium;
  color: var(--text-color);
}

.url-value {
  @apply text-xs break-all;
  color: var(--primary-color);
}

.recommendations-list {
  @apply space-y-2;
}

.recommendation-item {
  @apply flex items-start gap-2 p-3 rounded-lg;
}

.recommendation-item.success {
  background: var(--monitoring-success);
  background-opacity: 0.1;
}

.recommendation-item.warning {
  background: var(--monitoring-warning);
  background-opacity: 0.1;
}

.recommendation-item.critical {
  background: var(--monitoring-critical);
  background-opacity: 0.1;
}

.recommendation-icon {
  @apply mt-0.5;
}

.recommendation-item.success .recommendation-icon {
  color: var(--monitoring-success);
}

.recommendation-item.warning .recommendation-icon {
  color: var(--monitoring-warning);
}

.recommendation-item.critical .recommendation-icon {
  color: var(--monitoring-critical);
}

.recommendation-text {
  @apply text-sm;
  color: var(--text-color);
}

.action-buttons {
  @apply space-y-2;
}

.action-button {
  @apply w-full flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-all duration-200;
}

.action-button.primary {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
}

.action-button.secondary {
  background: var(--section-bg);
  border: 1px solid var(--primary-color);
  border-opacity: 0.3;
  color: var(--primary-color);
}

.action-button:active {
  transform: scale(0.98);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Touch-friendly sizing */
@media (max-width: 480px) {
  .modal-content {
    @apply mx-2;
  }
  
  .action-button {
    @apply py-4;
    min-height: 48px;
  }
}
</style>