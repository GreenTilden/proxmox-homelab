<template>
  <div class="wh-panel" :style="panelStyle">
    <div v-if="title" class="wh-panel-header">
      <h2 class="wh-panel-title">{{ title }}</h2>
    </div>

    <div class="wh-panel-content" :style="contentStyle">
      <slot />
    </div>

    <div v-if="$slots.footer" class="wh-panel-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  aspectRatio?: string
  maxWidth?: string
}>(), {
  aspectRatio: '16/9',
  maxWidth: '100%'
})

const panelStyle = computed(() => ({
  maxWidth: props.maxWidth
}))

const contentStyle = computed(() => ({
  aspectRatio: props.aspectRatio
}))
</script>

<style scoped>
.wh-panel {
  background: var(--wh-white);
  border: 2px solid var(--wh-navy);
  border-radius: var(--wh-radius-md);
  box-shadow: var(--wh-shadow-lg);
  overflow: hidden;
  width: 100%;
}

.wh-panel-header {
  background: linear-gradient(180deg, var(--wh-gray-lightest) 0%, var(--wh-white) 100%);
  border-bottom: 1px solid var(--wh-gray-light);
  padding: var(--wh-space-3) var(--wh-space-4);
}

.wh-panel-title {
  font-family: var(--wh-font-serif);
  font-size: var(--wh-text-lg);
  font-weight: normal;
  color: var(--wh-navy-dark);
  margin: 0;
}

.wh-panel-content {
  position: relative;
  width: 100%;
  background: var(--wh-black);
  overflow: hidden;
}

.wh-panel-content :deep(iframe),
.wh-panel-content :deep(video) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.wh-panel-footer {
  background: linear-gradient(180deg, var(--wh-white) 0%, var(--wh-gray-lightest) 100%);
  border-top: 1px solid var(--wh-gray-light);
  padding: var(--wh-space-2) var(--wh-space-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.wh-panel-footer :deep(.wh-brand) {
  font-family: var(--wh-font-serif);
  font-size: var(--wh-text-sm);
  color: var(--wh-gray-dark);
  font-style: italic;
}

.wh-panel-footer :deep(.wh-status) {
  display: flex;
  align-items: center;
  gap: var(--wh-space-2);
  font-family: var(--wh-font-sans);
  font-size: var(--wh-text-xs);
  color: var(--wh-gray);
}
</style>
