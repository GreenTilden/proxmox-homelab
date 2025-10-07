<template>
  <div
    class="scanline-overlay"
    :style="scanlineStyles"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  opacity?: number
  color?: string
  lineHeight?: number
  enable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  opacity: 0.08,
  color: '#ffffff',
  lineHeight: 8,
  enable: true
})

const scanlineStyles = computed(() => {
  if (!props.enable) {
    return { display: 'none' }
  }

  return {
    background: `repeating-linear-gradient(
      0deg,
      transparent,
      transparent ${props.lineHeight - 1}px,
      ${props.color} ${props.lineHeight - 1}px,
      ${props.color} ${props.lineHeight}px
    )`,
    opacity: props.opacity.toString(),
    mixBlendMode: 'overlay' as const,
    animation: 'scanline-flicker 3s ease-in-out infinite alternate'
  }
})
</script>

<style scoped>
.scanline-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}

@keyframes scanline-flicker {
  0%, 100% {
    opacity: var(--opacity, 0.08);
  }
  25% {
    opacity: calc(var(--opacity, 0.08) * 1.3);
  }
  50% {
    opacity: calc(var(--opacity, 0.08) * 0.6);
  }
  75% {
    opacity: calc(var(--opacity, 0.08) * 1.1);
  }
}

/* Disable for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .scanline-overlay {
    animation: none;
  }
}
</style>