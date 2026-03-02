<template>
  <span class="circle-mark" :class="{ 'circle-mark--active': active }">
    <svg v-if="active" class="circle-mark-svg" viewBox="0 0 200 100" preserveAspectRatio="none">
      <ellipse
        cx="100" cy="50" rx="94" ry="44"
        fill="none"
        :stroke="color"
        :stroke-width="thickness"
        :stroke-opacity="opacity"
        :transform="`rotate(${rotation}, 100, 50)`"
        filter="url(#hand-drawn)"
      />
    </svg>
    <span class="circle-mark-content">
      <slot />
    </span>
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  active?: boolean
  color?: string
  thickness?: number
  rotation?: number
  opacity?: number
}>(), {
  active: true,
  color: '#F9A825',
  thickness: 2.5,
  rotation: -2,
  opacity: 0.6,
})
</script>

<style scoped>
.circle-mark {
  position: relative;
  display: inline-block;
}

.circle-mark-svg {
  position: absolute;
  inset: -12px -16px;
  width: calc(100% + 32px);
  height: calc(100% + 24px);
  pointer-events: none;
  z-index: 2;
}

.circle-mark-content {
  position: relative;
  z-index: 1;
}
</style>
