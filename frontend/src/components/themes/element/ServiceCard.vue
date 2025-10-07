<template>
  <el-card
    :body-style="{ padding: '20px' }"
    shadow="hover"
    class="service-card"
    :class="cardClasses"
  >
    <!-- Header -->
    <template #header>
      <div class="card-header">
        <div class="service-info">
          <component
            :is="serviceIcon"
            class="service-icon"
            :size="24"
          />
          <div class="service-text">
            <h4 class="service-title">{{ service.name }}</h4>
            <p class="service-description">{{ service.description }}</p>
          </div>
        </div>

        <!-- Status Badge -->
        <el-badge
          :value="statusBadgeText"
          :type="statusType"
          class="status-badge"
        />
      </div>
    </template>

    <!-- Metrics Section -->
    <div v-if="service.metrics || service.responseTime" class="metrics-section">
      <el-space direction="vertical" :size="12" style="width: 100%">
        <div v-if="service.metrics?.uptime" class="metric-row">
          <el-text type="info" size="small">Uptime</el-text>
          <el-text strong>{{ formatUptime(service.metrics.uptime) }}</el-text>
        </div>

        <div v-if="service.responseTime" class="metric-row">
          <el-text type="info" size="small">Response Time</el-text>
          <el-text strong>{{ service.responseTime }}ms</el-text>
        </div>

        <!-- Service-specific metrics -->
        <template v-if="service.id === 'qbittorrent-exporter' && service.metrics?.customMetrics">
          <div v-if="service.metrics.customMetrics.activeDownloads !== undefined" class="metric-row">
            <el-text type="info" size="small">Active Downloads</el-text>
            <el-text strong>{{ service.metrics.customMetrics.activeDownloads }}</el-text>
          </div>
          <div v-if="service.metrics.customMetrics.downloadSpeed" class="metric-row">
            <el-text type="info" size="small">Download Speed</el-text>
            <el-text strong>{{ formatBytes(service.metrics.customMetrics.downloadSpeed) }}/s</el-text>
          </div>
        </template>
      </el-space>
    </div>

    <!-- Service URL -->
    <div v-if="service.url" class="url-section">
      <el-divider />
      <el-link
        :href="service.url"
        type="primary"
        :underline="false"
        @click.prevent="handleOpenService"
        class="service-url"
      >
        {{ service.url }}
      </el-link>
    </div>

    <!-- Last Checked -->
    <div v-if="service.lastChecked" class="last-checked">
      <el-text size="small" type="info">
        Last checked {{ formatTimestamp(service.lastChecked) }}
      </el-text>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  ElCard,
  ElBadge,
  ElSpace,
  ElText,
  ElDivider,
  ElLink
} from 'element-plus'
import { Server, Database, Shield, Activity, Download, Folder, TrendingUp, Play } from 'lucide-vue-next'
import type { ServiceStatus } from '@/composables/useServiceMonitoring'

interface Props {
  service: ServiceStatus
}

const props = defineProps<Props>()

const emit = defineEmits<{
  open: [url: string]
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
  return serviceIcons[props.service.id as keyof typeof serviceIcons] || Shield
})

// Status type mapping for Element Plus badge
const statusType = computed(() => {
  switch (props.service.status) {
    case 'online':
      return 'success'
    case 'offline':
      return 'danger'
    case 'checking':
      return 'info'
    case 'warning':
      return 'warning'
    case 'unknown':
    default:
      return 'info'
  }
})

const statusBadgeText = computed(() => {
  switch (props.service.status) {
    case 'online':
      return 'Online'
    case 'offline':
      return 'Offline'
    case 'checking':
      return 'Checking'
    case 'warning':
      return 'Warning'
    case 'error':
      return 'Error'
    case 'unknown':
    default:
      return 'Unknown'
  }
})

// Dynamic card classes based on status
const cardClasses = computed(() => {
  const classes: string[] = []

  if (props.service.status === 'online') classes.push('status-online')
  if (props.service.status === 'offline') classes.push('status-offline')
  if (props.service.status === 'warning') classes.push('status-warning')

  return classes
})

// Methods
const handleOpenService = () => {
  if (props.service.url) {
    emit('open', props.service.url)
  }
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
  height: 100%;
  transition: all 0.3s ease;
  background: rgba(6, 128, 81, 0.2);
  backdrop-filter: blur(8px);
}

.service-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(245, 129, 34, 0.3);
}

.service-card.status-online {
  border-left: 4px solid var(--el-color-success);
}

.service-card.status-offline {
  border-left: 4px solid var(--el-color-danger);
}

.service-card.status-warning {
  border-left: 4px solid var(--el-color-warning);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.service-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.service-icon {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--el-color-primary);
}

.service-text {
  flex: 1;
  min-width: 0;
}

.service-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 4px 0;
  line-height: 1.3;
  color: var(--el-text-color-primary);
}

.service-description {
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
  color: var(--el-text-color-secondary);
}

.status-badge {
  flex-shrink: 0;
}

.metrics-section {
  margin-top: 16px;
}

.metric-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
}

.url-section {
  margin-top: 16px;
}

.service-url {
  font-size: 0.85rem;
  word-break: break-all;
  display: block;
}

.last-checked {
  margin-top: 12px;
  text-align: center;
  opacity: 0.8;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .card-header {
    gap: 8px;
  }

  .service-info {
    gap: 8px;
  }

  .service-title {
    font-size: 1rem;
  }

  .service-description {
    font-size: 0.85rem;
  }
}
</style>
