<template>
  <div
    class="upcoming-events-container"
    :style="cardStyles"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <!-- Top Border Glow Effect -->
    <div :style="glowBarStyles" />

    <!-- Header Section -->
    <div :style="headerStyles">
      <div :style="serviceInfoStyles">
        <Calendar
          :style="iconStyles"
        />
        <div>
          <h4 class="nes-text" :style="titleStyles">Upcoming Events</h4>
          <p class="nes-text" :style="descriptionStyles">Next {{ upcomingEvents.length }} events</p>
        </div>
      </div>

      <!-- Calendar Management Link -->
      <router-link to="/calendar" :style="linkStyles">
        ⚙️
      </router-link>
    </div>

    <!-- Events List -->
    <div v-if="upcomingEvents.length > 0" :style="eventsStyles">
      <div
        v-for="event in upcomingEvents"
        :key="event.id"
        :style="eventRowStyles"
      >
        <div :style="eventInfoStyles">
          <span class="nes-text" :style="eventTitleStyles">{{ event.title }}</span>
          <div :style="eventDetailsStyles">
            <span class="nes-text" :style="eventDateStyles">
              {{ formatEventDate(event.startDate) }}
            </span>
            <span
              class="nes-text"
              :style="getCategoryTagStyles(event.category)"
            >
              {{ event.category }}
            </span>
          </div>
        </div>

        <div :style="timeRemainingStyles">
          <span class="nes-text" :style="timeTextStyles">
            {{ getTimeRemaining(event.startDate) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else :style="emptyStateStyles">
      <span class="nes-text" :style="emptyTextStyles">
        No upcoming events
      </span>
      <router-link to="/calendar" :style="addEventLinkStyles" class="nes-text">
        Add your first event
      </router-link>
    </div>

    <!-- Todo Summary -->
    <div v-if="incompleteTodos.length > 0" :style="todoSummaryStyles">
      <div :style="todoHeaderStyles">
        <CheckSquare :style="todoIconStyles" />
        <span class="nes-text" :style="todoCountStyles">
          {{ completedTodosCount }}/{{ totalTodosCount }} tasks completed
        </span>
      </div>

      <div :style="progressBarContainerStyles">
        <div
          :style="getProgressBarStyles()"
          class="progress-bar"
        />
      </div>
    </div>

    <!-- Management Link -->
    <div :style="urlDisplayStyles">
      <router-link to="/calendar" class="nes-text" :style="urlTextStyles">
        📅 Manage Calendar & Tasks
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { Calendar, CheckSquare } from 'lucide-vue-next'
import { useCalendarData } from '@/composables/useCalendarData'

// Get theme from provider
const themeContext = inject('fallTheme') as any
const { theme } = themeContext

// Get calendar data
const {
  upcomingEvents,
  incompleteTodos,
  allTodos
} = useCalendarData()

const hover = ref(false)

// Computed values
const completedTodosCount = computed(() =>
  allTodos.value.filter(todo => todo.completed).length
)

const totalTodosCount = computed(() => allTodos.value.length)

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

  // Use a consistent color based on "events" hash
  const colorIndex = 2 // Use bright red maple for events card
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
  padding: 'var(--space-lg)',
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

// Header Styles
const headerStyles = computed(() => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: 'var(--space-md)'
}))

const serviceInfoStyles = computed(() => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 'var(--space-sm)',
  flex: '1'
}))

const iconStyles = computed(() => ({
  width: '16px',
  height: '16px',
  color: theme.value.primary.ramp4,
  marginTop: '2px',
  filter: `drop-shadow(0 0 4px ${theme.value.primary.ramp4}40)`
}))

const titleStyles = computed(() => ({
  fontSize: '0.875rem',
  fontWeight: '600',
  color: theme.value.text.bright,
  margin: '0',
  lineHeight: '1.25',
  textShadow: '1px 1px 0px rgba(0,0,0,0.5)'
}))

const descriptionStyles = computed(() => ({
  fontSize: '0.75rem',
  color: theme.value.text.muted,
  margin: '4px 0 0 0',
  lineHeight: '1.25',
  opacity: '0.8',
  textShadow: '1px 1px 0px rgba(0,0,0,0.5)'
}))

const linkStyles = computed(() => ({
  fontSize: '1.2rem',
  color: getSeasonalColors.value.accent,
  textDecoration: 'none',
  padding: '4px',
  borderRadius: '0px',
  transition: 'all var(--transition-normal)',
  filter: hover.value ? 'brightness(1.2)' : 'brightness(1)',
  textShadow: '1px 1px 0px rgba(0,0,0,0.5)'
}))

// Events Styles
const eventsStyles = computed(() => ({
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 'var(--space-sm)',
  marginBottom: 'var(--space-md)'
}))

const eventRowStyles = computed(() => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  padding: 'var(--space-xs)',
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  border: `1px solid ${getSeasonalColors.value.border}40`,
  borderRadius: '0px'
}))

const eventInfoStyles = computed(() => ({
  flex: '1',
  marginRight: 'var(--space-sm)'
}))

const eventTitleStyles = computed(() => ({
  fontSize: '0.8rem',
  fontWeight: '500',
  color: theme.value.text.bright,
  display: 'block',
  marginBottom: '2px',
  textShadow: '1px 1px 0px rgba(0,0,0,0.5)'
}))

const eventDetailsStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-xs)',
  flexWrap: 'wrap' as const
}))

const eventDateStyles = computed(() => ({
  fontSize: '0.7rem',
  color: theme.value.text.muted,
  opacity: '0.8',
  textShadow: '1px 1px 0px rgba(0,0,0,0.5)'
}))

const getCategoryTagStyles = (category: string) => computed(() => ({
  fontSize: '0.6rem',
  fontWeight: '500',
  padding: '1px 4px',
  borderRadius: '0px',
  backgroundColor: getCategoryColor(category),
  color: theme.value.text.bright,
  textShadow: '1px 1px 0px rgba(0,0,0,0.5)',
  border: `1px solid ${getCategoryColor(category)}80`
}))

const timeRemainingStyles = computed(() => ({
  textAlign: 'right' as const,
  minWidth: '60px'
}))

const timeTextStyles = computed(() => ({
  fontSize: '0.7rem',
  fontWeight: '600',
  color: getSeasonalColors.value.accent,
  textShadow: '1px 1px 0px rgba(0,0,0,0.5)'
}))

// Empty state styles
const emptyStateStyles = computed(() => ({
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  gap: 'var(--space-sm)',
  padding: 'var(--space-lg) 0',
  textAlign: 'center' as const
}))

const emptyTextStyles = computed(() => ({
  fontSize: '0.8rem',
  color: theme.value.text.muted,
  opacity: '0.8',
  textShadow: '1px 1px 0px rgba(0,0,0,0.5)'
}))

const addEventLinkStyles = computed(() => ({
  fontSize: '0.75rem',
  color: getSeasonalColors.value.accent,
  textDecoration: 'underline',
  textShadow: '1px 1px 0px rgba(0,0,0,0.5)'
}))

// Todo summary styles
const todoSummaryStyles = computed(() => ({
  borderTop: `1px solid ${getSeasonalColors.value.border}40`,
  paddingTop: 'var(--space-sm)',
  marginBottom: 'var(--space-md)'
}))

const todoHeaderStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-xs)',
  marginBottom: 'var(--space-xs)'
}))

const todoIconStyles = computed(() => ({
  width: '12px',
  height: '12px',
  color: getSeasonalColors.value.accent,
  filter: `drop-shadow(0 0 2px ${getSeasonalColors.value.accent}40)`
}))

const todoCountStyles = computed(() => ({
  fontSize: '0.75rem',
  color: theme.value.text.muted,
  opacity: '0.9',
  textShadow: '1px 1px 0px rgba(0,0,0,0.5)'
}))

const progressBarContainerStyles = computed(() => ({
  width: '100%',
  height: '4px',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  border: `1px solid ${getSeasonalColors.value.border}40`,
  borderRadius: '0px',
  overflow: 'hidden' as const
}))

const getProgressBarStyles = () => {
  const progress = totalTodosCount.value > 0
    ? (completedTodosCount.value / totalTodosCount.value) * 100
    : 0

  return {
    width: `${progress}%`,
    height: '100%',
    backgroundColor: getSeasonalColors.value.accent,
    transition: 'width var(--transition-normal)',
    filter: `drop-shadow(0 0 4px ${getSeasonalColors.value.accent}60)`
  }
}

// URL Display Styles
const urlDisplayStyles = computed(() => ({
  display: 'flex',
  justifyContent: 'center',
  paddingTop: 'var(--space-sm)',
  borderTop: `1px solid ${getSeasonalColors.value.border}40`
}))

const urlTextStyles = computed(() => ({
  fontSize: '0.75rem',
  color: getSeasonalColors.value.accent,
  textDecoration: 'none',
  fontWeight: '500',
  textShadow: '1px 1px 0px rgba(0,0,0,0.5)',
  transition: 'all var(--transition-normal)'
}))

// Helper functions
const formatEventDate = (date: Date): string => {
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()

  if (isToday) return 'Today'
  if (isTomorrow) return 'Tomorrow'

  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric'
  })
}

const getTimeRemaining = (date: Date): string => {
  const now = new Date()
  const diff = date.getTime() - now.getTime()

  if (diff < 0) return 'Past'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) return `${days}d`
  if (hours > 0) return `${hours}h`

  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${minutes}m`
}

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'personal': return theme.value.primary.ramp2
    case 'household': return theme.value.primary.ramp4
    case 'shared': return theme.value.primary.ramp3
    default: return theme.value.neutral.ramp3
  }
}
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

/* Progress bar animation */
.progress-bar {
  animation: progressGlow 2s ease-in-out infinite alternate;
}

@keyframes progressGlow {
  0% {
    filter: drop-shadow(0 0 4px var(--accent-color)) brightness(1);
  }
  100% {
    filter: drop-shadow(0 0 8px var(--accent-color)) brightness(1.1);
  }
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .event-row {
    flex-direction: column;
    gap: var(--space-xs);
  }

  .time-remaining {
    text-align: left;
    min-width: auto;
  }
}
</style>