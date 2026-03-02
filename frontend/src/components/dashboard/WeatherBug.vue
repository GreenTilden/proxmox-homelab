<template>
  <div class="weather-bug" v-if="weather" :class="{ 'weather-bug--expanded': expanded }" @click="expanded = !expanded">
    <div class="weather-bug-main">
      <span class="weather-bug-icon">{{ icon }}</span>
      <span class="weather-bug-temp">{{ Math.round(weather.temperature) }}&deg;</span>
    </div>
    <div class="weather-bug-desc">{{ description }}</div>
    <div class="weather-bug-details" v-if="expanded">
      <span>{{ weather.humidity }}% humidity</span>
      <span>{{ Math.round(weather.windSpeed) }} mph wind</span>
      <span v-if="weather.uvIndex > 0">UV {{ weather.uvIndex }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { WeatherData } from '@/composables/useFamilyReport'

defineProps<{
  weather: WeatherData | null
  icon: string
  description: string | null
}>()

const expanded = ref(false)
</script>

<style scoped>
.weather-bug {
  position: fixed;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 50;
  background: #1a1a2e;
  color: #e8e8e8;
  padding: 0.4rem 0.65rem;
  border-radius: 4px;
  font-family: 'Libre Franklin', 'Open Sans', Arial, sans-serif;
  font-size: 0.65rem;
  line-height: 1.4;
  min-width: 80px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  opacity: 0.88;
  transition: opacity 150ms, min-width 150ms;
  cursor: pointer;
  user-select: none;
}

.weather-bug:hover {
  opacity: 1;
}

.weather-bug--expanded {
  min-width: 120px;
  opacity: 1;
}

.weather-bug-main {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
}

.weather-bug-icon {
  font-size: 1rem;
  line-height: 1;
}

.weather-bug-temp {
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
}

.weather-bug-desc {
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #aaa;
  margin-top: 0.1rem;
  white-space: nowrap;
}

.weather-bug-details {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  margin-top: 0.35rem;
  padding-top: 0.3rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #888;
  font-size: 0.55rem;
}

/* Mobile: bottom-left, compact */
@media (max-width: 600px) {
  .weather-bug {
    top: auto;
    bottom: 0.5rem;
    left: 0.5rem;
    padding: 0.3rem 0.5rem;
  }

  .weather-bug-desc {
    display: none;
  }

  .weather-bug-temp {
    font-size: 1.1rem;
  }

  .weather-bug-icon {
    font-size: 0.85rem;
  }
}
</style>
