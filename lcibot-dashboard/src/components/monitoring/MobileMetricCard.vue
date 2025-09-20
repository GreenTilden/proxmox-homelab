<template>
  <div class="mobile-metric-card" :class="statusClass" @click="$emit('tap', metric)">
    <div class="metric-header">
      <component :is="iconComponent" class="metric-icon w-5 h-5" />
      <div class="metric-info">
        <h4 class="metric-title">{{ metric.title }}</h4>
        <div class="metric-value">{{ metric.value }}</div>
      </div>
    </div>
    
    <div class="metric-footer" v-if="metric.subtitle">
      <span class="metric-subtitle">{{ metric.subtitle }}</span>
    </div>
    
    <div class="metric-status-bar">
      <div class="status-fill" :style="statusBarStyle"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Cpu, MemoryStick, HardDrive, Activity, Zap } from 'lucide-vue-next'

interface MetricData {
  id: string
  title: string
  value: string
  rawValue: number
  icon: string
  status: 'normal' | 'warning' | 'critical'
  subtitle?: string
}

interface Props {
  metric: MetricData
}

const props = defineProps<Props>()

defineEmits<{
  tap: [metric: MetricData]
}>()

const iconComponents = {
  'Cpu': Cpu,
  'MemoryStick': MemoryStick,
  'HardDrive': HardDrive,
  'Activity': Activity,
  'Zap': Zap
}

const iconComponent = computed(() => {
  return iconComponents[props.metric.icon] || Zap
})

const statusClass = computed(() => ({
  'metric-normal': props.metric.status === 'normal',
  'metric-warning': props.metric.status === 'warning',
  'metric-critical': props.metric.status === 'critical'
}))

const statusBarStyle = computed(() => {
  const percentage = Math.min(props.metric.rawValue, 100)
  
  let color = 'var(--monitoring-success)'
  if (props.metric.status === 'warning') color = 'var(--monitoring-warning)'
  if (props.metric.status === 'critical') color = 'var(--monitoring-critical)'
  
  return {
    width: `${percentage}%`,
    backgroundColor: color,
    transition: 'all 0.3s ease'
  }
})
</script>

<style scoped>
.mobile-metric-card {
  @apply p-4 rounded-lg border transition-all duration-300 cursor-pointer;
  background: linear-gradient(135deg, var(--card-bg), var(--section-bg));
  border-color: var(--primary-color);
  border-width: 1px;
  border-opacity: 0.3;
  min-height: 100px;
  position: relative;
  overflow: hidden;
}

.mobile-metric-card:active {
  transform: scale(0.98);
  border-opacity: 0.6;
}

.metric-header {
  @apply flex items-start gap-3 mb-3;
}

.metric-icon {
  @apply mt-1;
  color: var(--primary-color);
}

.metric-info {
  @apply flex-1;
}

.metric-title {
  @apply text-sm font-medium opacity-80 mb-1;
  color: var(--text-color);
}

.metric-value {
  @apply text-xl font-bold;
  color: var(--text-color);
}

.metric-footer {
  @apply mb-2;
}

.metric-subtitle {
  @apply text-xs opacity-60;
  color: var(--text-color);
}

.metric-status-bar {
  @apply h-1 bg-gray-700 rounded-full overflow-hidden;
  background: rgba(255, 255, 255, 0.1);
}

.status-fill {
  @apply h-full rounded-full;
}

/* Status-specific styling */
.metric-normal {
  border-color: var(--monitoring-success);
  border-opacity: 0.3;
}

.metric-normal:active {
  border-color: var(--monitoring-success);
  border-opacity: 0.6;
  box-shadow: 0 4px 12px var(--monitoring-success);
  box-shadow-opacity: 0.2;
}

.metric-warning {
  border-color: var(--monitoring-warning);
  border-opacity: 0.5;
}

.metric-warning:active {
  border-color: var(--monitoring-warning);
  border-opacity: 0.8;
  box-shadow: 0 4px 12px var(--monitoring-warning);
  box-shadow-opacity: 0.3;
}

.metric-critical {
  border-color: var(--monitoring-critical);
  border-opacity: 0.5;
}

.metric-critical:active {
  border-color: var(--monitoring-critical);
  border-opacity: 0.8;
  box-shadow: 0 4px 12px var(--monitoring-critical);
  box-shadow-opacity: 0.3;
}

.metric-critical .metric-value {
  color: var(--monitoring-critical);
}

.metric-warning .metric-value {
  color: var(--monitoring-warning);
}

/* Touch feedback */
@media (hover: none) and (pointer: coarse) {
  .mobile-metric-card:hover {
    transform: none;
  }
  
  .mobile-metric-card:active {
    background: var(--section-bg);
  }
}

/* Single column layout for very small screens */
@media (max-width: 360px) {
  .mobile-metric-card {
    @apply p-3;
    min-height: 80px;
  }
  
  .metric-value {
    @apply text-lg;
  }
}
</style>