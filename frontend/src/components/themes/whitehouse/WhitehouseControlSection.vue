<template>
  <div class="wh-control-section">
    <h3 class="wh-control-title">{{ title }}</h3>
    <div class="wh-control-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<style scoped>
.wh-control-section {
  padding-bottom: var(--wh-space-4);
  border-bottom: 1px solid var(--wh-gray-light);
}

.wh-control-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.wh-control-title {
  font-family: var(--wh-font-sans);
  font-size: var(--wh-text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--wh-gray);
  margin: 0 0 var(--wh-space-3) 0;
}

.wh-control-content {
  display: flex;
  flex-direction: column;
  gap: var(--wh-space-2);
}

/* Status item styling */
.wh-control-content :deep(.wh-status-item) {
  display: flex;
  align-items: center;
  gap: var(--wh-space-2);
  padding: var(--wh-space-2);
  background: var(--wh-gray-lightest);
  border-radius: var(--wh-radius-sm);
  font-size: var(--wh-text-sm);
  color: var(--wh-gray-dark);
}

/* Link styling */
.wh-control-content :deep(.wh-control-link) {
  display: block;
  padding: var(--wh-space-2) var(--wh-space-3);
  color: var(--wh-navy);
  text-decoration: none;
  font-size: var(--wh-text-sm);
  border-radius: var(--wh-radius-sm);
  transition: background var(--wh-transition-fast);
}

.wh-control-content :deep(.wh-control-link:hover) {
  background: var(--wh-gray-lightest);
}

/* Button grid styling */
.wh-control-content :deep(.wh-button-grid) {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--wh-space-2);
}

.wh-control-content :deep(.wh-grid-btn) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--wh-space-1);
  padding: var(--wh-space-3);
  background: var(--wh-gray-lightest);
  border: 1px solid var(--wh-gray-light);
  border-radius: var(--wh-radius-sm);
  text-decoration: none;
  transition: all var(--wh-transition-fast);
  cursor: pointer;
}

.wh-control-content :deep(.wh-grid-btn:hover) {
  background: var(--wh-white);
  border-color: var(--wh-navy);
  box-shadow: var(--wh-shadow-sm);
}

.wh-control-content :deep(.wh-grid-btn-icon) {
  font-size: 1.25rem;
}

.wh-control-content :deep(.wh-grid-btn-label) {
  font-family: var(--wh-font-sans);
  font-size: var(--wh-text-xs);
  color: var(--wh-gray-dark);
}

/* Responsive */
@media (max-width: 768px) {
  .wh-control-section {
    min-width: 180px;
    flex: 1;
    border-bottom: none;
    border-right: 1px solid var(--wh-gray-light);
    padding-right: var(--wh-space-4);
    padding-bottom: 0;
  }

  .wh-control-section:last-child {
    border-right: none;
    padding-right: 0;
  }
}
</style>
