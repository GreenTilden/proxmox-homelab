<template>
  <div
    class="compact-service-card"
    :style="cardStyle"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
    @click="handleClick"
  >
    <!-- Status indicator bar -->
    <div :style="statusBarStyle" />

    <!-- Main content row -->
    <div :style="contentStyle">
      <!-- Emoji Icon (preferred) -->
      <span v-if="emojiIcon" :style="emojiIconStyle" class="pixel-emoji">{{ emojiIcon }}</span>
      <!-- Lucide fallback -->
      <component v-else :is="serviceIcon" :style="iconStyle" />

      <!-- Info -->
      <div :style="infoStyle">
        <span :style="nameStyle">{{ service.name }}</span>
        <span :style="metricStyle">
          {{ primaryMetric }}
        </span>
      </div>

      <!-- Status dot -->
      <div :style="statusDotStyle" :title="service.status" />
    </div>

    <!-- Always-visible action buttons (bottom-right) -->
    <div :style="actionsContainerStyle">
      <button
        :style="actionButtonStyle"
        @click.stop="handleRefresh"
        title="Refresh"
      >
        <RotateCw :size="12" />
      </button>
      <button
        v-if="service.url"
        :style="actionButtonStyle"
        @click.stop="handleOpen"
        title="Open"
      >
        <ExternalLink :size="12" />
      </button>
    </div>

    <!-- Hover sparkline overlay -->
    <transition name="fade">
      <div v-if="hover && sparklineData.length > 0" :style="hoverOverlayStyle">
        <ApexSparkline
          :data="sparklineData"
          :height="28"
          :color="statusColor"
          :show-tooltip="false"
        />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, inject } from 'vue'
import { Server, Database, Shield, Activity, Download, Folder, TrendingUp, Play, RotateCw, ExternalLink } from 'lucide-vue-next'
import ApexSparkline from '@/components/visualizations/ApexSparkline.vue'
import { getServiceEmoji, pixelEmojiStyles } from '@/constants/emojiIcons'
import type { ServiceStatus } from '@/composables/useServiceMonitoring'

interface Props {
  service: ServiceStatus
  sparklineData?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  sparklineData: () => []
})

const emit = defineEmits<{
  refresh: [serviceId: string]
  open: [url: string]
  click: [service: ServiceStatus]
}>()

const themeContext = inject('fallTheme', null) as any
const theme = computed(() => themeContext?.theme?.value || {})

const hover = ref(false)

const serviceIcons: Record<string, any> = {
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

// Get emoji for this service (returns null if no mapping)
const emojiIcon = computed(() => getServiceEmoji(props.service.id))

const serviceIcon = computed(() => serviceIcons[props.service.id] || Shield)

const statusColor = computed(() => {
  const t = theme.value
  switch (props.service.status) {
    case 'online': return t.status?.success || '#22c55e'
    case 'offline': return t.status?.error || '#ef4444'
    case 'warning': return t.status?.warning || '#eab308'
    case 'checking': return t.status?.warning || '#eab308'
    default: return t.neutral?.ramp3 || '#666666'
  }
})

const primaryMetric = computed(() => {
  if (props.service.responseTime) {
    return `${props.service.responseTime}ms`
  }
  if (props.service.metrics?.uptime) {
    const hours = Math.floor(props.service.metrics.uptime / 3600)
    if (hours > 24) {
      return `${Math.floor(hours / 24)}d`
    }
    return `${hours}h`
  }
  return props.service.status
})

const cardStyle = computed(() => ({
  position: 'relative' as const,
  height: '72px',
  padding: '12px 16px',
  background: theme.value.backgrounds?.card || 'rgba(30, 30, 40, 0.8)',
  borderRadius: '8px',
  border: `1px solid ${theme.value.neutral?.ramp2 || '#333'}40`,
  cursor: 'pointer',
  overflow: 'hidden',
  transition: 'all 0.2s ease',
  transform: hover.value ? 'translateY(-2px)' : 'none',
  boxShadow: hover.value
    ? `0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px ${statusColor.value}40`
    : '0 2px 8px rgba(0,0,0,0.2)'
}))

const statusBarStyle = computed(() => ({
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  height: '3px',
  background: statusColor.value,
  opacity: hover.value ? 1 : 0.6,
  transition: 'opacity 0.2s ease'
}))

const contentStyle = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  height: '100%',
  position: 'relative' as const,
  zIndex: 1
}))

const emojiIconStyle = computed(() => ({
  ...pixelEmojiStyles,
  fontSize: '1.4em',
  width: '24px',
  flexShrink: 0,
  opacity: 0.95,
  transition: 'transform 0.2s ease',
  transform: hover.value ? 'scale(1.1)' : 'scale(1)'
}))

const iconStyle = computed(() => ({
  width: '20px',
  height: '20px',
  color: theme.value.primary?.ramp4 || '#3b82f6',
  flexShrink: 0,
  opacity: 0.9
}))

const infoStyle = computed(() => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '2px',
  minWidth: 0
}))

const nameStyle = computed(() => ({
  fontSize: '13px',
  fontWeight: 600,
  color: theme.value.text?.bright || '#ffffff',
  whiteSpace: 'nowrap' as const,
  overflow: 'hidden',
  textOverflow: 'ellipsis'
}))

const metricStyle = computed(() => ({
  fontSize: '11px',
  color: theme.value.text?.muted || '#888888',
  fontFamily: 'monospace'
}))

const statusDotStyle = computed(() => ({
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  background: statusColor.value,
  flexShrink: 0,
  boxShadow: `0 0 8px ${statusColor.value}60`,
  animation: props.service.status === 'checking' ? 'pulse 1.5s infinite' : 'none'
}))

const actionsContainerStyle = computed(() => ({
  position: 'absolute' as const,
  bottom: '8px',
  right: '12px',
  display: 'flex',
  gap: '4px',
  zIndex: 2
}))

const hoverOverlayStyle = computed(() => ({
  position: 'absolute' as const,
  bottom: '8px',
  left: '12px',
  right: '80px',
  display: 'flex',
  alignItems: 'center'
}))

const actionButtonStyle = computed(() => ({
  width: '24px',
  height: '24px',
  borderRadius: '4px',
  border: 'none',
  background: `${theme.value.primary?.ramp4 || '#3b82f6'}20`,
  color: theme.value.primary?.ramp4 || '#3b82f6',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.15s ease'
}))

const handleClick = () => emit('click', props.service)
const handleRefresh = () => emit('refresh', props.service.id)
const handleOpen = () => {
  if (props.service.url) {
    emit('open', props.service.url)
  }
}
</script>

<style scoped>
.compact-service-card:hover button {
  background: var(--color-primary, #3b82f6);
  color: white;
}

.pixel-emoji {
  filter: contrast(1.05);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
