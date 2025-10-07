<template>
  <div
    class="calendar-widget"
    :class="`calendar-widget--${placement}`"
    :style="cardStyles"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <!-- Top Border Glow Effect -->
    <div :style="glowBarStyles" />

    <div class="calendar-header">
      <h3 v-if="showTitle" :class="isRetro ? 'nes-text calendar-title' : 'calendar-title'" :style="titleStyles">{{ formattedDate }}</h3>
    </div>
    <div class="calendar-content" :style="contentStyles">
      <div :class="isRetro ? 'current-time nes-text' : 'current-time'" :style="timeStyles">
        {{ currentTime }}
      </div>
      <div :class="isRetro ? 'current-date nes-text' : 'current-date'" :style="dateStyles">
        {{ currentDateLong }}
      </div>
      <div v-if="placement === 'card'" class="calendar-actions" :style="actionsStyles">
        <router-link
          v-if="isRetro"
          to="/calendar"
          class="nes-btn is-primary calendar-link"
          :style="linkStyles"
        >
          📅 Manage Calendar & Tasks
        </router-link>
        <router-link
          v-else
          to="/calendar"
          class="calendar-link-clean"
          :style="linkStyles"
        >
          📅 Manage Calendar & Tasks
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, onUnmounted } from 'vue'
import { SEASONAL_PALETTES, getCurrentSeason, PARTICLE_HUE_ROTATIONS } from '@/themes/jehkoba64-palette'
import { useTheme } from '@/composables/useTheme'
import { isRetroTheme } from '@/config/environments'

interface Props {
  placement: 'card' | 'header' | 'sidebar'
  showTitle?: boolean
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showTitle: true,
  compact: false
})

// Get theme from provider (fallback to useTheme for non-retro themes)
const themeContext = inject('fallTheme', null) as any
const fallbackTheme = useTheme()
const theme = themeContext?.theme || fallbackTheme.theme

// Check if current theme is retro
const isRetro = computed(() => isRetroTheme())

const currentTime = ref('')
const currentDate = ref(new Date())
const hover = ref(false)

let timeInterval: NodeJS.Timeout | null = null

const formattedDate = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
})

const currentDateLong = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
})

// Get seasonal colors for retro theming
const getSeasonalColors = computed(() => {
  // Use autumn colors similar to service cards
  const autumnColors = [
    theme.value.primary.ramp1,    // Deep rust maple (#9e4c4c)
    theme.value.primary.ramp2,    // Crimson red leaf (#c40c2e)
    theme.value.primary.ramp3,    // Bright red maple (#f2395e)
    theme.value.primary.ramp4,    // Oak brown (#ad6a45)
    theme.value.primary.ramp5,    // Golden amber (#e69b22)
  ]

  // Use a consistent color based on current month
  const colorIndex = new Date().getMonth() % autumnColors.length
  const borderColor = autumnColors[colorIndex]

  return {
    border: borderColor,
    text: theme.value.text.bright,
    glow: borderColor + '40',
    accent: theme.value.primary.ramp4
  }
})

// Card Styles with pixelated retro effects - matching ServiceCard.vue exactly
const cardStyles = computed(() => ({
  background: `rgba(135, 93, 88, 0.1)`, // Same as service cards
  border: `4px solid ${getSeasonalColors.value.border}`,
  borderRadius: '0px', // Pixelated - no rounded corners
  padding: props.compact ? 'var(--space-md)' : 'var(--space-lg)',
  position: 'relative' as const,
  overflow: 'hidden' as const,
  cursor: 'default',
  transition: 'all var(--transition-normal)',
  backdropFilter: 'blur(1px)', // Same as service cards
  imageRendering: 'pixelated',
  // Exact same box-shadow pattern as ServiceCard.vue
  boxShadow: hover.value
    ? `
      0 8px 32px ${theme.value.effects.shadow},
      0 0 20px ${getSeasonalColors.value.glow},
      inset 3px 3px 0px ${theme.value.text.primary}40,
      inset -3px -3px 0px ${theme.value.effects.shadow},
      4px 4px 0px ${getSeasonalColors.value.border}80
    `
    : `
      0 4px 12px ${theme.value.effects.shadow},
      inset 2px 2px 0px ${theme.value.text.primary}20,
      inset -2px -2px 0px ${theme.value.effects.shadow},
      2px 2px 0px ${getSeasonalColors.value.border}60
    `,
  transform: hover.value ? 'translateY(-2px)' : 'translateY(0)',
  borderColor: hover.value ? getSeasonalColors.value.border : getSeasonalColors.value.border + '60'
}))

const glowBarStyles = computed(() => ({
  position: 'absolute' as const,
  top: '0',
  left: '0',
  right: '0',
  height: '2px',
  background: `linear-gradient(90deg, transparent, ${getSeasonalColors.value.border}, transparent)`,
  opacity: hover.value ? '1' : '0',
  transition: 'opacity var(--transition-normal)',
}))

const titleStyles = computed(() => ({
  fontSize: props.placement === 'header' ? '0.9rem' : '1.1rem',
  fontWeight: '600',
  color: theme.value.text.bright,
  margin: props.placement === 'header' ? '0' : '0 0 0.75rem 0',
  lineHeight: '1.25',
  textShadow: '1px 1px 0px rgba(0,0,0,0.5)'
}))

const contentStyles = computed(() => ({
  display: 'flex',
  flexDirection: props.placement === 'header' ? 'row' as const : 'column' as const,
  gap: props.placement === 'header' ? '1rem' : '0.5rem',
  alignItems: props.placement === 'header' ? 'center' : 'flex-start'
}))

const timeStyles = computed(() => ({
  fontSize: props.placement === 'header' ? '1.1rem' : '1.5rem',
  fontWeight: '700',
  color: getSeasonalColors.value.accent,
  fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
  letterSpacing: '0.05em',
  textShadow: '1px 1px 0px rgba(0,0,0,0.5)',
  filter: `drop-shadow(0 0 4px ${getSeasonalColors.value.accent}40)`
}))

const dateStyles = computed(() => ({
  fontSize: props.placement === 'header' ? '0.8rem' : '0.9rem',
  color: theme.value.text.muted,
  opacity: '0.8',
  fontWeight: '500',
  textShadow: '1px 1px 0px rgba(0,0,0,0.5)'
}))

const actionsStyles = computed(() => ({
  marginTop: '1rem',
  display: 'flex',
  justifyContent: 'center'
}))

const linkStyles = computed(() => ({
  fontSize: '0.8rem',
  padding: '0.5rem 1rem',
  textDecoration: 'none',
  transition: 'all var(--transition-normal)'
}))

const updateDateTime = () => {
  const now = new Date()
  currentDate.value = now
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

onMounted(() => {
  updateDateTime()
  timeInterval = setInterval(updateDateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
/* 8-bit pixelated rendering for retro aesthetic */
* {
  image-rendering: optimizeSpeed;
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: -o-crisp-edges;
  image-rendering: pixelated;
  -ms-interpolation-mode: nearest-neighbor;
}

/* Base calendar widget styling is handled via :style bindings */
.calendar-widget {
  /* All styling applied via computed styles for theme consistency */
}

/* Placement-specific overrides handled in computed styles */
.calendar-widget--card {
  min-height: 120px;
}

.calendar-widget--header {
  /* Header-specific styling handled in computed styles */
}

/* Clean button styling for non-retro themes */
.calendar-link-clean {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.calendar-link-clean:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Clean text styling for non-retro themes */
.current-time,
.current-date,
.calendar-title {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.calendar-widget--sidebar {
  /* Sidebar-specific styling handled in computed styles */
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .calendar-widget--header {
    /* Mobile styles handled via placement prop logic in computed styles */
  }
}

/* Retro animations for hover effects */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes glow {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.2);
  }
}
</style>