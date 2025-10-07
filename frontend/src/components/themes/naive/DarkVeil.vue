<template>
  <div class="dark-veil">
    <div
      class="veil-layer veil-layer-1"
      :style="veilStyle1"
    ></div>
    <div
      class="veil-layer veil-layer-2"
      :style="veilStyle2"
    ></div>
    <div
      class="veil-layer veil-layer-3"
      :style="veilStyle3"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { theme } = useTheme()

// Create layered gradients using era colors with higher opacity
const veilStyle1 = computed(() => ({
  background: `radial-gradient(
    ellipse at 20% 50%,
    ${theme.value.primary.ramp3} 0%,
    ${theme.value.primary.ramp2}99 15%,
    transparent 45%
  )`
}))

const veilStyle2 = computed(() => ({
  background: `radial-gradient(
    ellipse at 80% 20%,
    ${theme.value.primary.ramp4}CC 0%,
    ${theme.value.primary.ramp3}80 20%,
    transparent 55%
  )`
}))

const veilStyle3 = computed(() => ({
  background: `radial-gradient(
    ellipse at 50% 80%,
    ${theme.value.accent.ramp3}99 0%,
    ${theme.value.accent.ramp2}66 25%,
    transparent 60%
  )`
}))
</script>

<style scoped>
.dark-veil {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.veil-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 1;
  mix-blend-mode: normal;
  will-change: transform;
}

.veil-layer-1 {
  animation: veilFloat1 20s ease-in-out infinite;
}

.veil-layer-2 {
  animation: veilFloat2 25s ease-in-out infinite reverse;
}

.veil-layer-3 {
  animation: veilFloat3 30s ease-in-out infinite;
}

@keyframes veilFloat1 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(5%, 3%) scale(1.1);
  }
}

@keyframes veilFloat2 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-4%, 5%) scale(1.15);
  }
}

@keyframes veilFloat3 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(3%, -4%) scale(1.08);
  }
}
</style>
