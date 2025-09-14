<template>
  <div class="mobile-alert-card" :class="alertTypeClass">
    <div class="alert-content">
      <div class="alert-icon">
        <component :is="alertIcon" class="w-5 h-5" />
      </div>
      
      <div class="alert-info">
        <h4 class="alert-title">{{ alert.title }}</h4>
        <p class="alert-description">{{ alert.description }}</p>
        
        <div class="alert-meta">
          <span class="alert-timestamp">{{ formatTimestamp(alert.timestamp) }}</span>
          <span class="alert-action" v-if="alert.action">{{ alert.action }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, XCircle, AlertCircle, Info } from 'lucide-vue-next'

interface AlertData {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  description: string
  timestamp: Date
  action?: string
}

interface Props {
  alert: AlertData
}

const props = defineProps<Props>()

const alertIcons = {
  'critical': XCircle,
  'warning': AlertTriangle,
  'info': Info
}

const alertIcon = computed(() => {
  return alertIcons[props.alert.type] || AlertCircle
})

const alertTypeClass = computed(() => ({
  'alert-critical': props.alert.type === 'critical',
  'alert-warning': props.alert.type === 'warning',
  'alert-info': props.alert.type === 'info'
}))

const formatTimestamp = (date: Date): string => {
  const now = Date.now()
  const diff = now - date.getTime()
  
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}
</script>

<style scoped>
.mobile-alert-card {
  @apply p-4 rounded-lg border-l-4 transition-all duration-300;
  background: linear-gradient(135deg, var(--card-bg), var(--section-bg));
}

.alert-content {
  @apply flex items-start gap-3;
}

.alert-icon {
  @apply mt-1;
}

.alert-info {
  @apply flex-1;
}

.alert-title {
  @apply text-sm font-medium mb-1;
  color: var(--text-color);
}

.alert-description {
  @apply text-xs opacity-80 mb-2;
  color: var(--text-color);
}

.alert-meta {
  @apply flex items-center justify-between text-xs opacity-60;
  color: var(--text-color);
}

.alert-timestamp {
  @apply font-medium;
}

.alert-action {
  @apply italic;
}

/* Alert type styling */
.alert-critical {
  border-left-color: var(--monitoring-critical);
  background: var(--monitoring-critical);
  background-opacity: 0.05;
}

.alert-critical .alert-icon {
  color: var(--monitoring-critical);
}

.alert-warning {
  border-left-color: var(--monitoring-warning);
  background: var(--monitoring-warning);
  background-opacity: 0.05;
}

.alert-warning .alert-icon {
  color: var(--monitoring-warning);
}

.alert-info {
  border-left-color: var(--monitoring-info);
  background: var(--monitoring-info);
  background-opacity: 0.05;
}

.alert-info .alert-icon {
  color: var(--monitoring-info);
}

/* Touch-friendly sizing */
@media (max-width: 480px) {
  .mobile-alert-card {
    @apply p-3;
  }
}
</style>