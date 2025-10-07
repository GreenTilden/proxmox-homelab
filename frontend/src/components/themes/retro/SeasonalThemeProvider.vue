<template>
  <div class="seasonal-theme-provider" :style="themeStyles">
    <!-- Atmospheric Background Effects -->
    <AtmosphericBackground
      :particles="particleConfig"
      :background-gradient="backgroundGradient"
    />

    <!-- Optional Scanline Effect (SNES CSS inspired) -->
    <ScanlineOverlay
      v-if="enableScanlines"
      :opacity="0.08"
      :color="scanlineColor"
    />

    <!-- Main App Content -->
    <div class="theme-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue'
import { useTheme } from '@/composables/useTheme'
import AtmosphericBackground from './AtmosphericBackground.vue'
import ScanlineOverlay from './ScanlineOverlay.vue'

interface Props {
  enableScanlines?: boolean
  enableParticles?: boolean
  enableAnimations?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  enableScanlines: true,
  enableParticles: true,
  enableAnimations: true
})

const {
  theme,
  currentSeason,
  cssVariables,
  createGradient
} = useTheme()

// Provide theme to all child components (keeping fallTheme name for backward compatibility)
provide('fallTheme', {
  theme,
  currentSeason,
  cssVariables
})

const themeStyles = computed(() => ({
  ...cssVariables.value,
  minHeight: '100vh',
  background: backgroundGradient.value,
  color: 'var(--text-primary)',
  fontFamily: "'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif",
  transition: 'all var(--transition-slow)'
}))

const backgroundGradient = computed(() => {
  // Very simple two-color gradient
  const colors = [
    theme.value.backgrounds.app,     // Deep base
    theme.value.backgrounds.surface  // Just to surface level
  ]
  return createGradient('135deg', colors, 1.0)
})

const particleConfig = computed(() => ({
  count: theme.value.particles.count,
  type: getParticleTypeForSeason(currentSeason.value),
  colors: theme.value.particles.colors,
  physics: theme.value.particles.physics,
  size: theme.value.particles.size
}))

// Determine particle type based on current season
const getParticleTypeForSeason = (season: string) => {
  switch (season) {
    case 'AUTUMN':
      return 'leaf'
    case 'HALLOWEEN':
      return 'spooky'  // Will support user-provided Halloween assets
    case 'WINTER':
      return 'snowflake'
    case 'SPRING':
      return 'petal'
    default:
      return 'leaf'
  }
}

const scanlineColor = computed(() => {
  return theme.value.effects.scanline
})
</script>

<style scoped>
.seasonal-theme-provider {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
}

.theme-content {
  position: relative;
  z-index: 10;
  width: 100%;
  min-height: inherit;
}

/* Clean transitions */
* {
  transition: background-color var(--transition-slow),
              border-color var(--transition-slow),
              color var(--transition-normal);
}

/* Let NES.css handle typography - minimal overrides */
h1, h2, h3, h4, h5, h6 {
  color: var(--text-bright);
}

p, span, div {
  color: var(--text-primary);
}

/* Selection styling */
::selection {
  background: var(--color-accent-3);
  color: var(--color-neutral-1);
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-surface);
  border-radius: var(--radius-sm);
}

::-webkit-scrollbar-thumb {
  background: var(--color-primary-3);
  border-radius: var(--radius-sm);
  transition: background var(--transition-normal);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary-4);
}
</style>