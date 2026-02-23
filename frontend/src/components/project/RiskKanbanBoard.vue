<template>
  <div :style="boardStyles">
    <!-- Column headers + cards -->
    <div v-for="col in columns" :key="col.id" :style="columnStyles">
      <div :style="columnHeader(col.id)">
        <span :style="columnIcon">{{ col.icon }}</span>
        <span :style="columnTitle">{{ col.label }}</span>
        <span :style="countBadge">{{ getColumnRisks(col.id).length }}</span>
      </div>

      <div :style="cardList">
        <div
          v-for="risk in getColumnRisks(col.id)"
          :key="risk.id"
          :style="cardStyles(risk)"
        >
          <div :style="cardHeader">
            <span :style="impactBadge(risk.impact)">{{ risk.impact.toUpperCase() }}</span>
            <button
              v-if="col.id !== 'mitigated'"
              class="nes-btn"
              :style="moveBtn"
              @click="handleMove(risk, col.id)"
              :title="col.id === 'known-known' ? 'Already resolved' : 'Mark mitigated'"
            >{{ col.id === 'known-unknown' ? '\u2192' : '\u2713' }}</button>
          </div>
          <h5 :style="cardTitle">{{ risk.title }}</h5>
          <p :style="cardDesc">{{ risk.description }}</p>
          <div v-if="risk.mitigation" :style="mitigationRow">
            <span :style="mitigationLabel">Resolution:</span>
            <span :style="mitigationText">{{ risk.mitigation }}</span>
          </div>
          <div v-if="risk.linkedGateId" :style="linkRow">
            <span :style="linkLabel">Gate:</span>
            <span :style="linkText">{{ risk.linkedGateId }}</span>
          </div>
        </div>

        <div v-if="getColumnRisks(col.id).length === 0" :style="emptyCol">
          No items
        </div>
      </div>
    </div>

    <!-- Add risk form -->
    <div v-if="showAddForm" :style="addFormStyles">
      <input
        v-model="newTitle"
        placeholder="New risk/fact..."
        class="nes-input"
        :style="addInput"
        @keyup.enter="handleAdd"
      />
      <select v-model="newColumn" class="nes-select" :style="addSelect">
        <option value="known-known">Known</option>
        <option value="known-unknown">Unknown</option>
      </select>
      <select v-model="newImpact" class="nes-select" :style="addSelect">
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <button class="nes-btn is-success" :style="addBtn" @click="handleAdd" :disabled="!newTitle.trim()">+</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { RiskItem } from '@/composables/useFinancials'

interface Props {
  risks: RiskItem[]
  showAddForm?: boolean
  accentColor?: string
  bgColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  showAddForm: true,
  accentColor: '#4a6741',
  bgColor: '#1a2a3a',
})

const emit = defineEmits<{
  (e: 'move', id: string, column: RiskItem['column']): void
  (e: 'add', risk: Partial<RiskItem>): void
  (e: 'delete', id: string): void
}>()

const columns = [
  { id: 'known-known' as const, label: 'Known Knowns', icon: '\u2705' },
  { id: 'known-unknown' as const, label: 'Known Unknowns', icon: '\u2753' },
  { id: 'mitigated' as const, label: 'Mitigated', icon: '\uD83D\uDEE1\uFE0F' },
]

const newTitle = ref('')
const newColumn = ref<RiskItem['column']>('known-unknown')
const newImpact = ref<RiskItem['impact']>('medium')

function getColumnRisks(colId: string) {
  return props.risks.filter(r => r.column === colId)
}

function handleMove(risk: RiskItem, currentCol: string) {
  if (currentCol === 'known-unknown') {
    emit('move', risk.id, 'mitigated')
  } else if (currentCol === 'known-known') {
    emit('move', risk.id, 'mitigated')
  }
}

function handleAdd() {
  if (!newTitle.value.trim()) return
  emit('add', {
    title: newTitle.value.trim(),
    column: newColumn.value,
    impact: newImpact.value,
    description: '',
  })
  newTitle.value = ''
}

// --- Styles ---

const boardStyles = computed(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '0.5rem',
}))

const columnStyles = {
  display: 'flex',
  flexDirection: 'column' as const,
  minWidth: '0',
}

function columnHeader(colId: string) {
  const colors: Record<string, string> = {
    'known-known': '#22c55e',
    'known-unknown': '#f59e0b',
    'mitigated': '#3a7bd5',
  }
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.35rem 0.5rem',
    background: (colors[colId] || '#4a6741') + '22',
    borderBottom: `2px solid ${colors[colId] || '#4a6741'}66`,
    borderRadius: '4px 4px 0 0',
    marginBottom: '0.3rem',
  }
}

const columnIcon = { fontSize: '0.7rem' }
const columnTitle = { fontSize: '0.55rem', fontWeight: '600', color: 'var(--text-bright)', flex: '1' }
const countBadge = {
  fontSize: '0.5rem',
  padding: '0.1rem 0.3rem',
  borderRadius: '8px',
  background: 'rgba(74, 103, 65, 0.3)',
  color: 'var(--text-muted)',
}

const cardList = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '0.3rem',
  flex: '1',
}

function cardStyles(risk: RiskItem) {
  return {
    background: `${props.bgColor}cc`,
    border: `1px solid ${props.accentColor}44`,
    borderRadius: '3px',
    padding: '0.4rem',
    backdropFilter: 'blur(4px)',
  }
}

const cardHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.2rem',
}

function impactBadge(impact: string) {
  const colors: Record<string, string> = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#6b7280',
  }
  return {
    fontSize: '0.45rem',
    padding: '0.1rem 0.25rem',
    borderRadius: '2px',
    fontWeight: '700',
    background: (colors[impact] || '#6b7280') + '33',
    color: colors[impact] || '#6b7280',
  }
}

const moveBtn = {
  padding: '0.1rem 0.25rem',
  fontSize: '0.5rem',
  lineHeight: '1',
}

const cardTitle = {
  fontSize: '0.65rem',
  color: '#c4a747',
  margin: '0 0 0.15rem 0',
  fontWeight: '600',
}

const cardDesc = {
  fontSize: '0.55rem',
  color: 'var(--text-muted)',
  margin: '0',
  lineHeight: '1.3',
}

const mitigationRow = { marginTop: '0.25rem', display: 'flex', gap: '0.2rem', alignItems: 'baseline' }
const mitigationLabel = { fontSize: '0.5rem', color: '#22c55e', fontWeight: '600' }
const mitigationText = { fontSize: '0.5rem', color: '#22c55e' }
const linkRow = { marginTop: '0.2rem', display: 'flex', gap: '0.2rem', alignItems: 'baseline' }
const linkLabel = { fontSize: '0.45rem', color: 'var(--text-muted)' }
const linkText = { fontSize: '0.45rem', color: '#3a7bd5' }
const emptyCol = {
  textAlign: 'center' as const,
  padding: '1rem 0.5rem',
  color: 'var(--text-muted)',
  fontSize: '0.6rem',
  opacity: '0.6',
}

const addFormStyles = computed(() => ({
  gridColumn: '1 / -1',
  display: 'flex',
  gap: '0.3rem',
  marginTop: '0.5rem',
  flexWrap: 'wrap' as const,
  alignItems: 'center',
}))

const addInput = computed(() => ({
  flex: '1',
  minWidth: '150px',
  fontSize: '0.65rem',
  padding: '0.3rem',
  background: props.bgColor,
  color: 'var(--text-bright)',
  border: `2px solid ${props.accentColor}66`,
}))

const addSelect = computed(() => ({
  fontSize: '0.55rem',
  padding: '0.25rem',
  background: props.bgColor,
  color: 'var(--text-bright)',
  border: `1px solid ${props.accentColor}66`,
  width: 'auto',
}))

const addBtn = { padding: '0.25rem 0.5rem', fontSize: '0.6rem' }
</script>

<style scoped>
@media (max-width: 640px) {
  div[style*="grid-template-columns"] {
    grid-template-columns: 1fr !important;
  }
}
</style>
