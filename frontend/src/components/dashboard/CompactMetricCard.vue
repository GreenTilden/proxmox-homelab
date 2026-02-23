<template>
  <div class="compact-metric" :style="{ minWidth: compact ? '80px' : '120px' }">
    <span class="label" style="font-size: 0.7em; opacity: 0.7;">{{ label }}</span>
    <span class="value" style="font-size: 1.1em; font-weight: bold;">
      {{ typeof value === 'number' ? value.toFixed(1) : value }}{{ unit ?? '%' }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: number
  thresholds?: { warning: number; critical: number }
  mode?: 'gauge' | 'bar'
  compact?: boolean
  max?: number
  unit?: string
}>()
</script>
