<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header" style="background: var(--section-bg); border-color: var(--primary-color);">
        <h3 class="modal-title" style="color: var(--text-color);">{{ metric.title }} Details</h3>
        <button @click="$emit('close')" class="close-button">
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <div class="modal-body">
        <!-- Current Value -->
        <div class="metric-display">
          <component :is="iconComponent" class="metric-large-icon w-12 h-12" />
          <div class="metric-large-value">{{ metric.value }}</div>
          <div class="metric-status-badge" :class="statusBadgeClass">
            {{ statusText }}
          </div>
        </div>
        
        <!-- Additional Details -->
        <div class="detail-section">
          <h4 class="section-title" style="color: var(--text-color);">System Information</h4>
          <div class="detail-grid">
            <div class="detail-item" v-if="metric.subtitle">
              <span class="detail-label">Current Usage:</span>
              <span class="detail-value">{{ metric.subtitle }}</span>
            </div>
            
            <div class="detail-item">
              <span class="detail-label">Status:</span>
              <span class="detail-value" :class="statusTextClass">{{ statusText }}</span>
            </div>
            
            <div class="detail-item">
              <span class="detail-label">Raw Value:</span>
              <span class="detail-value">{{ metric.rawValue.toFixed(2) }}%</span>
            </div>
          </div>
        </div>
        
        <!-- Recommendations -->
        <div class="recommendations-section" v-if="recommendations.length > 0">
          <h4 class="section-title" style="color: var(--text-color);">Recommendations</h4>
          <div class="recommendations-list">
            <div 
              v-for="recommendation in recommendations" 
              :key="recommendation.id"
              class="recommendation-item"
            >
              <component :is="recommendation.icon" class="w-4 h-4 recommendation-icon" />
              <span class="recommendation-text">{{ recommendation.text }}</span>
            </div>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="actions-section">
          <h4 class="section-title" style="color: var(--text-color);">Quick Actions</h4>
          <div class="action-buttons">
            <button class="action-button" @click="refreshMetric">
              <RefreshCw class="w-4 h-4 mr-2" />
              Refresh
            </button>
            
            <button class="action-button" v-if="metric.id === 'cpu'" @click="viewProcesses">
              <Activity class="w-4 h-4 mr-2" />
              View Processes
            </button>
            
            <button class="action-button" v-if="metric.id === 'storage'" @click="viewStorage">
              <HardDrive class="w-4 h-4 mr-2" />
              Storage Details
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { X, Cpu, MemoryStick, HardDrive, Activity, RefreshCw, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-vue-next'

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
  close: []
}>()

const iconComponents = {
  'Cpu': Cpu,
  'MemoryStick': MemoryStick,
  'HardDrive': HardDrive,
  'Activity': Activity
}

const iconComponent = computed(() => {
  return iconComponents[props.metric.icon] || Activity
})

const statusBadgeClass = computed(() => ({
  'status-normal': props.metric.status === 'normal',
  'status-warning': props.metric.status === 'warning',
  'status-critical': props.metric.status === 'critical'
}))

const statusTextClass = computed(() => ({
  'text-success': props.metric.status === 'normal',
  'text-warning': props.metric.status === 'warning',
  'text-critical': props.metric.status === 'critical'
}))

const statusText = computed(() => {
  switch (props.metric.status) {
    case 'normal': return 'Normal'
    case 'warning': return 'Warning'
    case 'critical': return 'Critical'
    default: return 'Unknown'
  }
})

const recommendations = computed(() => {
  const recs = []
  
  if (props.metric.id === 'cpu' && props.metric.status === 'critical') {
    recs.push({
      id: 'cpu-high',
      icon: Activity,
      text: 'Check for high CPU processes and consider optimizing workloads'
    })
  }
  
  if (props.metric.id === 'memory' && props.metric.status === 'warning') {
    recs.push({
      id: 'memory-warning',
      icon: MemoryStick,
      text: 'Consider closing unused applications or adding more RAM'
    })
  }
  
  if (props.metric.id === 'storage' && props.metric.status === 'critical') {
    recs.push({
      id: 'storage-critical',
      icon: HardDrive,
      text: 'Free up disk space or expand storage capacity immediately'
    })
  }
  
  if (props.metric.status === 'normal') {
    recs.push({
      id: 'system-healthy',
      icon: CheckCircle,
      text: 'System is operating within normal parameters'
    })
  }
  
  return recs
})

const refreshMetric = () => {
  // Emit refresh event or call API to refresh this specific metric
  console.log('Refreshing metric:', props.metric.id)
}

const viewProcesses = () => {
  // Navigate to process viewer or open system monitor
  console.log('Viewing processes')
}

const viewStorage = () => {
  // Navigate to storage details view
  console.log('Viewing storage details')
}
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.modal-content {
  @apply w-full max-w-md mx-4 rounded-lg overflow-hidden;
  background: var(--card-bg);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  @apply flex items-center justify-between p-4 border-b border-opacity-20;
}

.modal-title {
  @apply text-lg font-semibold;
}

.close-button {
  @apply p-1 rounded-lg transition-colors;
  color: var(--text-color);
}

.close-button:hover {
  background: var(--section-bg);
}

.modal-body {
  @apply p-4 space-y-6;
}

.metric-display {
  @apply text-center py-6;
}

.metric-large-icon {
  @apply mx-auto mb-4;
  color: var(--primary-color);
}

.metric-large-value {
  @apply text-3xl font-bold mb-2;
  color: var(--text-color);
}

.metric-status-badge {
  @apply inline-block px-3 py-1 rounded-full text-sm font-medium;
}

.status-normal {
  background: var(--monitoring-success);
  background-opacity: 0.2;
  color: var(--monitoring-success);
}

.status-warning {
  background: var(--monitoring-warning);
  background-opacity: 0.2;
  color: var(--monitoring-warning);
}

.status-critical {
  background: var(--monitoring-critical);
  background-opacity: 0.2;
  color: var(--monitoring-critical);
}

.detail-section,
.recommendations-section,
.actions-section {
  @apply space-y-3;
}

.section-title {
  @apply text-sm font-medium opacity-80;
}

.detail-grid {
  @apply space-y-2;
}

.detail-item {
  @apply flex items-center justify-between text-sm;
}

.detail-label {
  @apply opacity-70;
  color: var(--text-color);
}

.detail-value {
  @apply font-medium;
  color: var(--text-color);
}

.text-success {
  color: var(--monitoring-success);
}

.text-warning {
  color: var(--monitoring-warning);
}

.text-critical {
  color: var(--monitoring-critical);
}

.recommendations-list {
  @apply space-y-2;
}

.recommendation-item {
  @apply flex items-start gap-2 p-2 rounded-lg;
  background: var(--section-bg);
}

.recommendation-icon {
  @apply mt-0.5;
  color: var(--primary-color);
}

.recommendation-text {
  @apply text-sm;
  color: var(--text-color);
}

.action-buttons {
  @apply grid grid-cols-1 gap-2;
}

.action-button {
  @apply flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-all duration-200;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
}

.action-button:active {
  transform: scale(0.98);
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