<template>
  <div :style="wrapStyles">
    <div v-if="events.length === 0" :style="emptyStyles">
      <slot name="empty"><p>No events to display.</p></slot>
    </div>
    <div v-else :style="timelineStyles">
      <div v-for="event in events" :key="event.id" :style="itemStyles">
        <div :style="dotStyles"></div>
        <div :style="contentStyles">
          <div :style="dateStyles">{{ formatDate(event.startDate) }}</div>
          <div :style="titleStyles">{{ event.title }}</div>
          <div v-if="event.description" :style="descStyles">{{ event.description }}</div>
          <span v-if="event.category" :style="catStyles">{{ event.category }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CalendarEvent } from '@/composables/useProjectHub'
import { THEME_DEFAULTS } from '@/composables/types'

interface Props {
  events: CalendarEvent[]
  accentColor?: string
  bgColor?: string
  goldColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  ...THEME_DEFAULTS,
})

function formatDate(d: string): string {
  if (!d) return ''
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
  catch { return d }
}

const wrapStyles = {}
const emptyStyles = { textAlign: 'center' as const, padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }
const timelineStyles = { display: 'flex', flexDirection: 'column' as const, borderLeft: `3px solid ${props.accentColor}55`, marginLeft: '0.5rem', paddingLeft: '1rem' }
const itemStyles = { position: 'relative' as const, padding: '0.5rem 0', borderBottom: `1px solid ${props.accentColor}22` }
const dotStyles = { position: 'absolute' as const, left: '-1.35rem', top: '0.65rem', width: '10px', height: '10px', borderRadius: '50%', background: props.accentColor, border: `2px solid ${props.goldColor}` }
const contentStyles = { display: 'flex', flexDirection: 'column' as const, gap: '0.1rem' }
const dateStyles = { fontSize: '0.6rem', color: props.goldColor, fontWeight: '600' }
const titleStyles = { fontSize: '0.8rem', color: 'var(--text-bright)' }
const descStyles = { fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: '1.4' }
const catStyles = { fontSize: '0.55rem', padding: '0.05rem 0.3rem', background: `${props.accentColor}33`, color: props.goldColor, borderRadius: '2px', display: 'inline-block', marginTop: '0.15rem' }
</script>
