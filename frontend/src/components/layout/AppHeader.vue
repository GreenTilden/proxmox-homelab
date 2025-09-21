<template>
  <header class="app-header">
    <!-- Mobile Menu Toggle -->
    <button
      @click="$emit('toggle-sidebar')"
      class="mobile-menu-toggle lg:hidden"
    >
      <Menu class="w-5 h-5" />
    </button>

    <!-- Breadcrumbs -->
    <nav class="breadcrumb-nav">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <Home class="w-4 h-4" />
          <span>Dashboard</span>
        </li>
        <li class="breadcrumb-separator">
          <ChevronRight class="w-3 h-3" />
        </li>
        <li class="breadcrumb-item active">
          <component :is="getCurrentTabIcon()" class="w-4 h-4" />
          <span>{{ getCurrentTabLabel() }}</span>
        </li>
      </ol>
    </nav>

    <!-- Header Actions -->
    <div class="header-actions">
      <!-- System Status -->
      <div class="status-indicator-group">
        <div class="status-item">
          <div class="status-dot" :class="getSystemStatusClass()"></div>
          <span class="status-text">{{ getSystemStatusText() }}</span>
        </div>
      </div>

      <!-- Last Update Time -->
      <div class="last-update">
        <Clock class="w-4 h-4" />
        <span class="update-time">{{ lastUpdateTime }}</span>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <button
          @click="$emit('refresh-all')"
          class="action-button"
          :disabled="isRefreshing"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isRefreshing }" />
        </button>
        <button @click="toggleFullscreen" class="action-button">
          <Maximize2 class="w-4 h-4" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import {
  Menu,
  Home,
  ChevronRight,
  Clock,
  RefreshCw,
  Maximize2,
  Monitor,
  Activity,
  Server
} from 'lucide-vue-next'

interface Props {
  activeTab: string
  lastHealthCheck: Date
  systemStatus: 'healthy' | 'warning' | 'critical'
}

const props = defineProps<Props>()

const isRefreshing = ref(false)
const lastUpdateTime = ref('')

// Update time formatting
const updateTime = () => {
  lastUpdateTime.value = props.lastHealthCheck.toLocaleTimeString()
}

const getCurrentTabIcon = () => {
  switch (props.activeTab) {
    case 'services': return Monitor
    case 'monitoring': return Activity
    default: return Server
  }
}

const getCurrentTabLabel = () => {
  switch (props.activeTab) {
    case 'services': return 'Services Overview'
    case 'monitoring': return 'System Monitoring'
    default: return 'Dashboard'
  }
}

const getSystemStatusClass = () => {
  switch (props.systemStatus) {
    case 'healthy': return 'status-healthy'
    case 'warning': return 'status-warning'
    case 'critical': return 'status-critical'
    default: return 'status-unknown'
  }
}

const getSystemStatusText = () => {
  switch (props.systemStatus) {
    case 'healthy': return 'All Systems Operational'
    case 'warning': return 'Some Services Degraded'
    case 'critical': return 'Critical Issues Detected'
    default: return 'Status Unknown'
  }
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

// Auto-refresh time display
let timeInterval: number

onMounted(() => {
  updateTime()
  timeInterval = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

defineEmits<{
  'toggle-sidebar': []
  'refresh-all': []
}>()
</script>

<style scoped>
.app-header {
  @apply card-base;
  height: 72px;
  padding: 0 var(--space-6);
  @apply flex items-center justify-between;
  background: linear-gradient(135deg,
    rgba(var(--lakoba-surface-rgb, 22, 33, 62), 0.95),
    rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.02)
  );
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.15);
  box-shadow: var(--shadow-lg);
  position: sticky;
  top: 0;
  z-index: 999;
}

.mobile-menu-toggle {
  @apply icon-container;
  padding: var(--space-2);
  margin-right: var(--space-4);
}

.breadcrumb-nav {
  @apply flex-1;
}

.breadcrumb {
  @apply flex items-center;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.breadcrumb-item {
  @apply flex items-center;
  gap: var(--space-2);
  color: var(--lakoba-text-muted);
  font-size: 0.875rem;
  font-weight: 500;
}

.breadcrumb-item.active {
  color: var(--lakoba-text);
  font-weight: 600;
}

.breadcrumb-separator {
  color: var(--lakoba-text-muted);
  opacity: 0.5;
}

.header-actions {
  @apply flex items-center;
  gap: var(--space-6);
}

.status-indicator-group {
  @apply flex items-center;
  gap: var(--space-4);
}

.status-item {
  @apply flex items-center;
  gap: var(--space-2);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  position: relative;
}

.status-dot::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  opacity: 0.3;
  animation: pulse-ring 2s infinite;
}

.status-healthy {
  background: var(--status-success);
}

.status-healthy::after {
  background: var(--status-success);
}

.status-warning {
  background: var(--status-warning);
}

.status-warning::after {
  background: var(--status-warning);
}

.status-critical {
  background: var(--status-error);
}

.status-critical::after {
  background: var(--status-error);
}

.status-text {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--lakoba-text);
}

.last-update {
  @apply flex items-center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.1);
  border: 1px solid rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.2);
  border-radius: var(--radius-lg);
  color: var(--lakoba-text-muted);
  font-size: 0.75rem;
}

.update-time {
  font-weight: 600;
  color: var(--lakoba-primary);
}

.quick-actions {
  @apply flex items-center;
  gap: var(--space-2);
}

.action-button {
  @apply icon-container;
  padding: var(--space-2);
  background: rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.1);
  border: 1px solid rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.2);
}

.action-button:hover {
  background: rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.2);
  transform: scale(1.05);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .app-header {
    padding: 0 var(--space-4);
  }

  .header-actions {
    gap: var(--space-3);
  }

  .status-text {
    @apply hidden;
  }

  .last-update {
    @apply hidden;
  }
}

@media (max-width: 480px) {
  .breadcrumb-item span {
    @apply hidden;
  }
}
</style>