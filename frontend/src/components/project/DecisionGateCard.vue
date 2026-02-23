<template>
  <div :style="cardStyles">
    <div :style="headerRow">
      <span :style="statusIcon">{{ statusEmoji }}</span>
      <div style="flex: 1; min-width: 0;">
        <h4 :style="labelStyles">{{ gate.label }}</h4>
        <p v-if="gate.description" :style="descStyles">{{ gate.description }}</p>
      </div>
      <span :style="statusBadge">{{ statusLabel }}</span>
    </div>

    <!-- Dependencies -->
    <div v-if="gate.dependencies.length > 0" :style="depsRow">
      <span :style="depsLabel">Requires:</span>
      <span
        v-for="dep in gate.dependencies"
        :key="dep"
        :style="depChipStyles(dep)"
      >{{ getGateLabel(dep) }}</span>
    </div>

    <!-- Evidence -->
    <div v-if="gate.evidence" :style="evidenceRow">
      <span :style="evidenceLabel">Evidence:</span>
      <span :style="evidenceText">{{ gate.evidence }}</span>
    </div>

    <!-- Actions -->
    <div :style="actionsRow">
      <select
        :value="gate.status"
        :style="selectStyles"
        class="nes-select"
        @change="$emit('update', gate.id, { status: ($event.target as HTMLSelectElement).value })"
      >
        <option value="not-started">Not Started</option>
        <option value="in-progress">In Progress</option>
        <option value="blocked">Blocked</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DecisionGate } from '@/composables/useFinancials'

interface Props {
  gate: DecisionGate
  allGates?: DecisionGate[]
  accentColor?: string
  bgColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  allGates: () => [],
  accentColor: '#4a6741',
  bgColor: '#1a2a3a',
})

defineEmits<{ (e: 'update', id: string, updates: Partial<DecisionGate>): void }>()

const statusEmoji = computed(() => {
  switch (props.gate.status) {
    case 'completed': return '\u2705'
    case 'in-progress': return '\u23F3'
    case 'blocked': return '\u26D4'
    default: return '\u2B1C'
  }
})

const statusLabel = computed(() => {
  if (props.gate.status === 'not-started' && !props.gate.depsReady && props.gate.dependencies.length > 0) {
    return 'LOCKED'
  }
  return props.gate.status.replace('-', ' ').toUpperCase()
})

function getGateLabel(id: string): string {
  const found = props.allGates.find(g => g.id === id)
  return found?.label || id
}

function depChipStyles(depId: string) {
  const dep = props.allGates.find(g => g.id === depId)
  const done = dep?.status === 'completed'
  return {
    fontSize: '0.55rem',
    padding: '0.1rem 0.35rem',
    borderRadius: '2px',
    background: done ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
    color: done ? '#22c55e' : '#ef4444',
    border: `1px solid ${done ? '#22c55e44' : '#ef444444'}`,
  }
}

// --- Styles ---

const borderColor = computed(() => {
  switch (props.gate.status) {
    case 'completed': return '#22c55e'
    case 'in-progress': return '#f59e0b'
    case 'blocked': return '#ef4444'
    default: return `${props.accentColor}55`
  }
})

const cardStyles = computed(() => ({
  background: `${props.bgColor}cc`,
  border: `2px solid ${borderColor.value}`,
  borderRadius: '4px',
  padding: '0.6rem',
  marginBottom: '0.5rem',
  backdropFilter: 'blur(4px)',
}))

const headerRow = { display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }
const statusIcon = { fontSize: '1rem', lineHeight: '1' }
const labelStyles = { fontSize: '0.75rem', color: '#c4a747', margin: '0', fontWeight: '600' }
const descStyles = { fontSize: '0.6rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }

const statusBadge = computed(() => ({
  fontSize: '0.5rem',
  padding: '0.15rem 0.35rem',
  borderRadius: '2px',
  fontWeight: '700',
  whiteSpace: 'nowrap' as const,
  background: borderColor.value + '33',
  color: borderColor.value,
  border: `1px solid ${borderColor.value}66`,
}))

const depsRow = { display: 'flex', gap: '0.3rem', alignItems: 'center', flexWrap: 'wrap' as const, marginTop: '0.4rem' }
const depsLabel = { fontSize: '0.55rem', color: 'var(--text-muted)' }
const evidenceRow = { marginTop: '0.3rem', display: 'flex', gap: '0.3rem', alignItems: 'baseline' }
const evidenceLabel = { fontSize: '0.55rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' as const }
const evidenceText = { fontSize: '0.6rem', color: '#22c55e' }
const actionsRow = { marginTop: '0.4rem', display: 'flex', gap: '0.3rem' }

const selectStyles = computed(() => ({
  fontSize: '0.55rem',
  padding: '0.2rem 0.3rem',
  background: props.bgColor,
  color: 'var(--text-bright)',
  border: `1px solid ${props.accentColor}66`,
  borderRadius: '2px',
}))
</script>
