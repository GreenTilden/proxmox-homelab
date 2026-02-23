<template>
  <div class="sparkline">
    <svg :width="width" :height="height" viewBox="0 0 100 30">
      <polyline
        :points="svgPoints"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  data?: number[]
  width?: number
  height?: number
  color?: string
}>(), {
  data: () => [],
  width: 100,
  height: 30,
  color: '#79d86d'
})

const svgPoints = computed(() => {
  if (!props.data.length) return ''
  const max = Math.max(...props.data, 1)
  return props.data
    .map((v, i) => `${(i / (props.data.length - 1)) * 100},${30 - (v / max) * 28}`)
    .join(' ')
})
</script>
