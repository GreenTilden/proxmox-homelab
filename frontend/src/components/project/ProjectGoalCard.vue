<template>
  <div :style="cardStyles">
    <div :style="headerStyles">
      <h3 :style="titleStyles">{{ goal.label }}</h3>
      <button v-if="showDelete" class="nes-btn is-error" :style="delStyles" @click="$emit('delete', goal.id)">X</button>
    </div>
    <div :style="amountStyles">
      <span :style="currentStyles">${{ goal.current.toLocaleString() }}</span>
      <span :style="sepStyles"> / </span>
      <span :style="targetStyles">${{ goal.target.toLocaleString() }}</span>
    </div>
    <div :style="barWrapStyles">
      <div :style="barFillStyles"></div>
    </div>
    <div :style="pctStyles">{{ pct }}%</div>
    <slot name="edit" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RevenueGoal } from '@/composables/useProjectHub'
import { THEME_DEFAULTS } from '@/composables/types'

interface Props {
  goal: RevenueGoal
  showDelete?: boolean
  accentColor?: string
  bgColor?: string
  goldColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  ...THEME_DEFAULTS,
  showDelete: true,
})

defineEmits<{ (e: 'delete', id: string): void }>()

const pct = computed(() => {
  if (!props.goal.target) return 0
  return Math.round((props.goal.current / props.goal.target) * 100)
})

const cardStyles = computed(() => ({
  background: `${props.bgColor}cc`, border: `2px solid ${props.accentColor}55`,
  borderRadius: '4px', padding: '0.75rem',
}))
const headerStyles = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }
const titleStyles = { fontSize: '0.8rem', color: '#c4a747', margin: '0', fontWeight: '600' }
const delStyles = { padding: '0.1rem 0.35rem', fontSize: '0.55rem' }
const amountStyles = { display: 'flex', alignItems: 'baseline', gap: '0.15rem', marginBottom: '0.25rem' }
const currentStyles = computed(() => ({
  fontSize: '1.2rem', fontWeight: '700',
  color: props.goal.current >= props.goal.target ? '#22c55e' : 'var(--text-bright)',
}))
const sepStyles = { fontSize: '0.8rem', color: 'var(--text-muted)' }
const targetStyles = { fontSize: '0.8rem', color: 'var(--text-muted)' }
const barWrapStyles = computed(() => ({
  height: '18px', background: props.bgColor, border: `2px solid ${props.accentColor}44`,
  borderRadius: '2px', overflow: 'hidden', marginTop: '0.4rem',
}))
const barFillStyles = computed(() => ({
  height: '100%',
  width: `${Math.min(100, pct.value)}%`,
  background: pct.value >= 100 ? '#22c55e' : `linear-gradient(90deg, ${props.goal.color || props.accentColor}, ${props.goal.color || props.accentColor}cc)`,
  transition: 'width 0.3s ease',
}))
const pctStyles = { fontSize: '0.7rem', color: '#c4a747', textAlign: 'right' as const, marginTop: '0.2rem' }
</script>
