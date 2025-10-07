<template>
  <main class="app-main" :class="{ 'sidebar-expanded': !sidebarCollapsed }">
    <!-- Content Container -->
    <div class="main-content">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-title-group">
          <h1 class="page-title">{{ getPageTitle() }}</h1>
          <p class="page-description">{{ getPageDescription() }}</p>
        </div>

        <!-- Page Actions -->
        <div class="page-actions">
          <slot name="actions"></slot>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="content-grid">
        <slot></slot>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  activeTab: string
  sidebarCollapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sidebarCollapsed: false
})

const getPageTitle = () => {
  switch (props.activeTab) {
    case 'services': return 'Services Overview'
    case 'monitoring': return 'System Monitoring'
    default: return 'Dashboard'
  }
}

const getPageDescription = () => {
  switch (props.activeTab) {
    case 'services': return 'Monitor and manage all homelab services'
    case 'monitoring': return 'Real-time system metrics and performance data'
    default: return 'Welcome to your homelab dashboard'
  }
}
</script>

<style scoped>
.app-main {
  margin-left: 280px;
  min-height: 100vh;
  transition: margin-left var(--transition-normal);
  background: linear-gradient(135deg,
    var(--lakoba-background),
    rgba(var(--lakoba-surface-rgb, 22, 33, 62), 0.8)
  );
}

.app-main:not(.sidebar-expanded) {
  margin-left: 72px;
}

.main-content {
  padding: var(--space-8);
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  @apply flex items-start justify-between;
  margin-bottom: var(--space-8);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid rgba(var(--lakoba-primary-rgb, 0, 255, 136), 0.1);
}

.page-title-group {
  @apply flex-1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--lakoba-text);
  margin-bottom: var(--space-2);
  background: linear-gradient(135deg, var(--lakoba-primary), var(--lakoba-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-description {
  font-size: 1rem;
  color: var(--lakoba-text-muted);
  font-weight: 400;
}

.page-actions {
  @apply flex items-center;
  gap: var(--space-3);
}

.content-grid {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

/* Enhanced grid layouts for different content types */
.content-grid.services-grid {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.content-grid.monitoring-grid {
  grid-template-columns: 1fr;
  gap: var(--space-8);
}

.content-grid.dashboard-grid {
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6);
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .app-main {
    margin-left: 0;
  }

  .main-content {
    padding: var(--space-6);
  }

  .page-header {
    @apply flex-col items-start;
    gap: var(--space-4);
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: var(--space-4);
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-description {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: var(--space-3);
  }

  .content-grid {
    gap: var(--space-4);
  }
}
</style>