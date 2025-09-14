<template>
  <div class="metric-card" :class="statusClass">
    <div class="metric-header">
      <component :is="iconComponent" class="metric-icon w-4 h-4" />
      <span class="metric-title">{{ title }}</span>
    </div>
    
    <div class="metric-value">
      {{ value }}
    </div>
    
    <div class="metric-subtitle" v-if="subtitle">
      {{ subtitle }}
    </div>
    
    <div class="metric-details" v-if="cores">
      <span class="text-xs opacity-60">{{ cores }} cores available</span>
    </div>
    
    <div class="metric-status-bar">
      <div class="status-fill" :style="statusBarStyle"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Cpu, MemoryStick, HardDrive, Activity, Zap, Network, Database } from 'lucide-vue-next'

interface Props {
  title: string
  value: string
  rawValue: number
  status: 'normal' | 'warning' | 'critical'
  icon: string
  subtitle?: string
  cores?: number
  maxValue?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxValue: 100
})

const iconComponents = {
  'Cpu': Cpu,
  'MemoryStick': MemoryStick,
  'HardDrive': HardDrive,
  'Activity': Activity,
  'Zap': Zap,
  'Network': Network,
  'Database': Database
}

const iconComponent = computed(() => {
  return iconComponents[props.icon] || Zap
})

const statusClass = computed(() => ({
  'metric-normal': props.status === 'normal',
  'metric-warning': props.status === 'warning',
  'metric-critical': props.status === 'critical'
}))

const statusBarStyle = computed(() => {
  const percentage = Math.min((props.rawValue / props.maxValue) * 100, 100)
  
  let color = '#00ff00' // green for normal
  if (props.status === 'warning') color = '#ffa500' // orange for warning
  if (props.status === 'critical') color = '#ff0000' // red for critical
  
  return {
    width: `${percentage}%`,
    backgroundColor: color,
    transition: 'all 0.3s ease'
  }
})
</script>

<style scoped>
.metric-card {
  @apply p-3 rounded-lg border transition-all duration-300;
  background: linear-gradient(135deg, var(--card-bg), var(--section-bg));
  border-color: var(--primary-color);
  border-width: 1px;
  border-opacity: 0.3;
  position: relative;
  overflow: hidden;
}

.metric-card:hover {
  border-opacity: 0.6;
  transform: translateY(-1px);
}

.metric-header {
  @apply flex items-center gap-2 mb-2;
}

.metric-icon {
  color: var(--primary-color);
}

.metric-title {
  @apply text-xs font-medium opacity-80;
  color: var(--text-color);
}

.metric-value {
  @apply text-lg font-bold mb-1;
  color: var(--text-color);
}

.metric-subtitle {
  @apply text-xs opacity-60 mb-2;
  color: var(--text-color);
}

.metric-details {
  @apply mb-2;
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
  border-color: rgba(0, 255, 0, 0.3);
}

.metric-normal:hover {
  border-color: rgba(0, 255, 0, 0.6);
  box-shadow: 0 4px 12px rgba(0, 255, 0, 0.2);
}

.metric-warning {
  border-color: rgba(255, 165, 0, 0.5);
}

.metric-warning:hover {
  border-color: rgba(255, 165, 0, 0.8);
  box-shadow: 0 4px 12px rgba(255, 165, 0, 0.3);
}

.metric-critical {
  border-color: rgba(255, 0, 0, 0.5);
}

.metric-critical:hover {
  border-color: rgba(255, 0, 0, 0.8);
  box-shadow: 0 4px 12px rgba(255, 0, 0, 0.3);
}

.metric-critical .metric-value {
  color: rgba(255, 100, 100, 1);
}

.metric-warning .metric-value {
  color: rgba(255, 200, 100, 1);
}

@media (max-width: 768px) {
  .metric-card {
    @apply p-2;
  }
  
  .metric-value {
    @apply text-base;
  }
}
</style>