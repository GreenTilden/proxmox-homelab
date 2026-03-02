<template>
  <span class="highlight-mark" :class="{ 'highlight-mark--active': active }" :style="highlightStyle">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  active?: boolean
  color?: string
  rotation?: number
}>(), {
  active: true,
  color: '#FFF176',
  rotation: 0,
})

const highlightStyle = computed(() => ({
  '--hl-color': props.color,
  '--hl-rotation': `${props.rotation}deg`,
}))
</script>

<style scoped>
.highlight-mark {
  position: relative;
  display: inline;
}

.highlight-mark--active::before {
  content: '';
  position: absolute;
  inset: -2px -4px;
  background: var(--hl-color);
  opacity: 0.45;
  z-index: 0;
  pointer-events: none;
  transform: rotate(var(--hl-rotation));
  filter: url(#hand-drawn);
  border-radius: 2px;
}

.highlight-mark :deep(*) {
  position: relative;
  z-index: 1;
}
</style>
