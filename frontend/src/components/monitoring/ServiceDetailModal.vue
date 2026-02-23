<template>
  <div v-if="visible" class="service-detail-modal" @click.self="$emit('close')">
    <div class="modal-content">
      <h3>{{ service?.name }}</h3>
      <p>{{ service?.description }}</p>
      <p>Status: {{ service?.status }}</p>
      <button @click="$emit('close')">Close</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ServiceStatus } from '../../composables/useServiceMonitoring'

defineProps<{
  visible: boolean
  service: ServiceStatus | null
}>()

defineEmits(['close'])
</script>
