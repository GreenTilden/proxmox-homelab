<template>
  <div :style="containerStyles">
    <!-- Phase bar -->
    <div :style="barContainer">
      <div
        v-for="(phase, idx) in phases"
        :key="phase.id"
        :style="phaseSegmentStyles(phase.id, idx)"
        @click="$emit('select-phase', phase.id)"
      >
        <span :style="phaseLabel(phase.id)">{{ phase.label }}</span>
      </div>
    </div>

    <!-- "You are here" indicator -->
    <div :style="markerRow">
      <div :style="markerSpacer"></div>
      <span :style="markerStyles">{{ activePhaseLabel }} Phase</span>
    </div>

    <!-- Milestone list -->
    <div v-if="milestones.length > 0" :style="milestoneSection">
      <h4 :style="sectionTitle">Milestones</h4>
      <div v-for="m in sortedMilestones" :key="m.id" :style="milestoneRow(m)">
        <span :style="milestoneDate">{{ m.targetDate || 'TBD' }}</span>
        <span :style="milestoneDot(m.status)"></span>
        <div style="flex: 1; min-width: 0;">
          <span :style="milestoneLabel">{{ m.label }}</span>
          <span v-if="m.description" :style="milestoneDesc"> — {{ m.description }}</span>
        </div>
        <span :style="phaseTag(m.phase)">{{ m.phase }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PHASES } from '@/composables/useFinancials'
import type { Milestone } from '@/composables/useFinancials'

interface Props {
  activePhase: string
  milestones?: Milestone[]
  accentColor?: string
  goldColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  milestones: () => [],
  accentColor: '#4a6741',
  goldColor: '#c4a747',
})

defineEmits<{ (e: 'select-phase', phase: string): void }>()

const phases = PHASES

const activeIndex = computed(() =>
  phases.findIndex(p => p.id === props.activePhase)
)

const activePhaseLabel = computed(() =>
  phases.find(p => p.id === props.activePhase)?.label || props.activePhase
)

const sortedMilestones = computed(() =>
  [...props.milestones].sort((a, b) => {
    const phaseOrder = phases.findIndex(p => p.id === a.phase) - phases.findIndex(p => p.id === b.phase)
    if (phaseOrder !== 0) return phaseOrder
    return (a.targetDate || '').localeCompare(b.targetDate || '')
  })
)

// --- Styles ---

const containerStyles = { marginBottom: '1rem' }

const barContainer = {
  display: 'flex',
  borderRadius: '4px',
  overflow: 'hidden',
  border: '2px solid rgba(74, 103, 65, 0.4)',
  height: '32px',
}

function phaseSegmentStyles(phaseId: string, idx: number) {
  const isCurrent = phaseId === props.activePhase
  const isPast = idx < activeIndex.value
  const bg = isCurrent
    ? props.accentColor
    : isPast
      ? 'rgba(34, 197, 94, 0.3)'
      : 'rgba(26, 42, 58, 0.8)'
  return {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: bg,
    cursor: 'pointer',
    borderRight: idx < phases.length - 1 ? '1px solid rgba(74, 103, 65, 0.3)' : 'none',
    transition: 'background 0.2s',
    position: 'relative' as const,
  }
}

function phaseLabel(phaseId: string) {
  const isCurrent = phaseId === props.activePhase
  return {
    fontSize: '0.5rem',
    fontWeight: isCurrent ? '700' : '400',
    color: isCurrent ? '#fff' : 'var(--text-muted)',
    letterSpacing: '0.3px',
    textTransform: 'uppercase' as const,
  }
}

const markerRow = {
  display: 'flex',
  alignItems: 'center',
  marginTop: '0.3rem',
  gap: '0.3rem',
}

const markerSpacer = computed(() => {
  const pct = ((activeIndex.value + 0.5) / phases.length) * 100
  return { width: `${pct}%` }
})

const markerStyles = {
  fontSize: '0.55rem',
  color: '#c4a747',
  fontWeight: '600',
  whiteSpace: 'nowrap' as const,
  transform: 'translateX(-50%)',
}

const milestoneSection = { marginTop: '0.75rem' }
const sectionTitle = {
  fontSize: '0.7rem',
  color: '#c4a747',
  margin: '0 0 0.4rem 0',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

function milestoneRow(m: Milestone) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.3rem 0',
    borderBottom: '1px solid rgba(74, 103, 65, 0.15)',
    opacity: m.status === 'completed' ? '0.6' : '1',
  }
}

const milestoneDate = {
  fontSize: '0.55rem',
  color: 'var(--text-muted)',
  minWidth: '4.5rem',
  fontFamily: 'monospace',
}

function milestoneDot(status: string) {
  const color = status === 'completed' ? '#22c55e' : status === 'active' ? '#f59e0b' : 'var(--text-muted)'
  return {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: color,
    flexShrink: '0',
  }
}

const milestoneLabel = { fontSize: '0.7rem', color: 'var(--text-bright)' }
const milestoneDesc = { fontSize: '0.6rem', color: 'var(--text-muted)' }

function phaseTag(phase: string) {
  return {
    fontSize: '0.45rem',
    padding: '0.1rem 0.3rem',
    borderRadius: '2px',
    background: 'rgba(74, 103, 65, 0.2)',
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    whiteSpace: 'nowrap' as const,
  }
}
</script>
