<template>
  <nav class="wh-channel-tabs">
    <div class="wh-channel-tabs-inner">
      <router-link
        v-for="tab in tabs"
        :key="tab.route"
        :to="tab.route"
        class="wh-channel-tab"
        :class="{ active: isActive(tab.route) }"
      >
        <span v-if="tab.icon" class="wh-tab-icon">{{ tab.icon }}</span>
        <span class="wh-tab-label">{{ tab.label }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

interface Tab {
  label: string
  route: string
  icon?: string
}

const props = withDefaults(defineProps<{
  tabs?: Tab[]
}>(), {
  tabs: () => [
    { label: 'Weather', route: '/weather', icon: '' },
    { label: 'Baby Cam', route: '/nanit', icon: '' }
  ]
})

const route = useRoute()

const isActive = (tabRoute: string) => {
  return route.path === tabRoute
}
</script>

<style scoped>
.wh-channel-tabs {
  background: var(--wh-navy);
  border-bottom: 1px solid var(--wh-navy-dark);
}

.wh-channel-tabs-inner {
  display: flex;
  justify-content: center;
  gap: var(--wh-space-1);
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--wh-space-4);
}

.wh-channel-tab {
  display: flex;
  align-items: center;
  gap: var(--wh-space-2);
  padding: var(--wh-space-3) var(--wh-space-5);
  font-family: var(--wh-font-sans);
  font-size: var(--wh-text-sm);
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-bottom: 3px solid transparent;
  transition: all var(--wh-transition-fast);
  position: relative;
}

.wh-channel-tab:hover {
  color: var(--wh-white);
  background: rgba(255, 255, 255, 0.05);
}

.wh-channel-tab.active {
  color: var(--wh-white);
  border-bottom-color: var(--wh-gold);
}

.wh-tab-icon {
  font-size: 1rem;
}

.wh-tab-label {
  letter-spacing: 0.02em;
}

/* Responsive */
@media (max-width: 768px) {
  .wh-channel-tab {
    padding: var(--wh-space-2) var(--wh-space-4);
    font-size: var(--wh-text-xs);
  }

  .wh-tab-icon {
    font-size: 0.875rem;
  }
}
</style>
