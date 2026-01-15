<template>
  <aside class="wh-sidebar" :class="{ collapsed: isCollapsed }">
    <button
      v-if="collapsible"
      class="wh-sidebar-toggle"
      @click="toggle"
      :aria-expanded="!isCollapsed"
    >
      <span class="wh-toggle-icon">{{ isCollapsed ? '>' : '<' }}</span>
    </button>

    <div class="wh-sidebar-content">
      <slot />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  collapsible?: boolean
  defaultCollapsed?: boolean
}>(), {
  collapsible: false,
  defaultCollapsed: false
})

const isCollapsed = ref(props.defaultCollapsed)

const toggle = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.wh-sidebar {
  width: 280px;
  background: var(--wh-white);
  border-right: 1px solid var(--wh-gray-light);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: width var(--wh-transition-base);
  overflow: hidden;
}

.wh-sidebar.collapsed {
  width: 48px;
}

.wh-sidebar-toggle {
  position: absolute;
  top: var(--wh-space-4);
  right: var(--wh-space-2);
  width: 24px;
  height: 24px;
  background: var(--wh-gray-lightest);
  border: 1px solid var(--wh-gray-light);
  border-radius: var(--wh-radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: background var(--wh-transition-fast);
}

.wh-sidebar-toggle:hover {
  background: var(--wh-gray-light);
}

.wh-toggle-icon {
  font-family: var(--wh-font-sans);
  font-size: var(--wh-text-xs);
  color: var(--wh-gray-dark);
}

.wh-sidebar-content {
  flex: 1;
  padding: var(--wh-space-4);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--wh-space-4);
}

.wh-sidebar.collapsed .wh-sidebar-content {
  opacity: 0;
  pointer-events: none;
}

/* Responsive */
@media (max-width: 1024px) {
  .wh-sidebar {
    width: 240px;
  }
}

@media (max-width: 768px) {
  .wh-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--wh-gray-light);
    max-height: 200px;
  }

  .wh-sidebar-content {
    flex-direction: row;
    flex-wrap: wrap;
    overflow-x: auto;
  }

  .wh-sidebar-toggle {
    display: none;
  }
}
</style>
