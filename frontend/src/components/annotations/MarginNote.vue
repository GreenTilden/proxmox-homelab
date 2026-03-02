<template>
  <span class="margin-note" :class="`margin-note--${position}`" :style="noteStyle">
    {{ text }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  text: string
  position?: 'left' | 'right'
  color?: string
  rotate?: number
}>(), {
  position: 'right',
  color: '#555',
  rotate: -1.5,
})

const noteStyle = computed(() => ({
  '--note-color': props.color,
  '--note-rotate': `${props.rotate}deg`,
}))
</script>

<style scoped>
.margin-note {
  font-family: 'Caveat', cursive;
  font-size: 0.95rem;
  color: var(--note-color);
  transform: rotate(var(--note-rotate));
  display: inline-block;
  pointer-events: none;
  line-height: 1.3;
  white-space: nowrap;
}

.margin-note--right {
  position: absolute;
  right: -1rem;
  top: 0;
}

.margin-note--left {
  position: absolute;
  left: -1rem;
  top: 0;
}

@media (max-width: 1100px) {
  .margin-note--right,
  .margin-note--left {
    position: relative;
    right: auto;
    left: auto;
    display: block;
    margin-bottom: 0.25rem;
  }
}
</style>
