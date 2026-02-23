<template>
  <div class="project-task-list">
    <!-- Add task form -->
    <div v-if="showAddForm" :style="addFormStyles">
      <input
        v-model="newSummary"
        :placeholder="addPlaceholder"
        class="nes-input"
        :style="inputStyles"
        @keyup.enter="handleAdd"
      />
      <select v-if="showPriority" v-model="newPriority" class="nes-select" :style="selectStyles">
        <option :value="0">—</option>
        <option :value="1">P1</option>
        <option :value="3">P3</option>
        <option :value="5">P5</option>
        <option :value="9">P9</option>
      </select>
      <button class="nes-btn is-success" :style="btnStyles" @click="handleAdd" :disabled="!newSummary.trim()">Add</button>
    </div>

    <!-- Empty state -->
    <div v-if="tasks.length === 0" :style="emptyStyles">
      <slot name="empty"><p>No tasks found.</p></slot>
    </div>

    <!-- Task items -->
    <div v-else :style="listStyles">
      <div
        v-for="task in tasks"
        :key="task.id"
        :style="itemStyles(task.status === 'completed')"
        class="project-task-item"
      >
        <div :style="checkAreaStyles" @click="$emit('toggle', task.id)">
          <div :style="checkboxStyles(task.status === 'completed')">
            <span v-if="task.status === 'completed'">✓</span>
          </div>
        </div>
        <div :style="contentStyles">
          <div :style="topRowStyles">
            <span v-if="task.priority >= 1 && task.priority <= 3" :style="priorityStyles(task.priority)">P{{ task.priority }}</span>
            <span :style="nameStyles(task.status === 'completed')">{{ task.summary }}</span>
          </div>
          <div v-if="task.description" :style="descStyles">{{ task.description }}</div>
          <div :style="metaStyles">
            <span v-if="task.due" :style="dueStyles">{{ formatDate(task.due) }}</span>
            <span v-for="cat in task.categories" :key="cat" :style="catStyles">{{ cat }}</span>
          </div>
        </div>
        <button v-if="showDelete" class="nes-btn is-error" :style="delStyles" @click="$emit('delete', task.id)">X</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ProjectTask } from '@/composables/useProjectHub'

interface Props {
  tasks: ProjectTask[]
  showAddForm?: boolean
  showDelete?: boolean
  showPriority?: boolean
  addPlaceholder?: string
  accentColor?: string
  bgColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  showAddForm: true,
  showDelete: true,
  showPriority: true,
  addPlaceholder: 'New task...',
  accentColor: '#4a6741',
  bgColor: '#1a2a3a',
})

const emit = defineEmits<{
  (e: 'add', summary: string, priority: number): void
  (e: 'toggle', uid: string): void
  (e: 'delete', uid: string): void
}>()

const newSummary = ref('')
const newPriority = ref(0)

function handleAdd() {
  if (!newSummary.value.trim()) return
  emit('add', newSummary.value.trim(), newPriority.value)
  newSummary.value = ''
  newPriority.value = 0
}

function formatDate(d: string | undefined): string {
  if (!d) return ''
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
  catch { return d }
}

const addFormStyles = { display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' as const }
const inputStyles = { flex: '1', minWidth: '150px', fontSize: '0.75rem', padding: '0.4rem', background: props.bgColor, color: 'var(--text-bright)', border: `2px solid ${props.accentColor}66` }
const selectStyles = { width: '60px', fontSize: '0.65rem', padding: '0.35rem', background: props.bgColor, color: 'var(--text-bright)', border: `2px solid ${props.accentColor}66` }
const btnStyles = { fontSize: '0.65rem', padding: '0.35rem 0.7rem' }
const emptyStyles = { textAlign: 'center' as const, padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }
const listStyles = { display: 'flex', flexDirection: 'column' as const, gap: '2px' }

const itemStyles = (done: boolean) => ({
  display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.6rem',
  background: done ? `${props.bgColor}88` : `${props.bgColor}cc`,
  border: `1px solid ${done ? props.accentColor + '22' : props.accentColor + '44'}`,
  borderRadius: '2px', opacity: done ? '0.6' : '1',
})
const checkAreaStyles = { flexShrink: '0', cursor: 'pointer', padding: '0.1rem' }
const checkboxStyles = (checked: boolean) => ({
  width: '22px', height: '22px',
  border: `3px solid ${checked ? '#22c55e' : props.accentColor}`,
  borderRadius: '2px', background: checked ? '#22c55e' : 'transparent',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'white', fontWeight: '700', fontSize: '12px',
})
const contentStyles = { flex: '1', display: 'flex', flexDirection: 'column' as const, gap: '0.15rem' }
const topRowStyles = { display: 'flex', alignItems: 'center', gap: '0.4rem' }
const priorityStyles = (p: number) => ({
  fontSize: '0.55rem', padding: '0.1rem 0.3rem', borderRadius: '2px', fontWeight: '700',
  background: p <= 1 ? '#ef4444' : p <= 3 ? '#f59e0b' : '#6b7280', color: '#fff',
})
const nameStyles = (done: boolean) => ({
  fontSize: '0.8rem', color: done ? 'var(--text-muted)' : 'var(--text-bright)',
  textDecoration: done ? 'line-through' : 'none', fontWeight: '500',
})
const descStyles = { fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: '1.4' }
const metaStyles = { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' as const, marginTop: '0.1rem' }
const dueStyles = { fontSize: '0.6rem', color: 'var(--text-muted)' }
const catStyles = { fontSize: '0.55rem', padding: '0.05rem 0.3rem', background: `${props.accentColor}33`, color: '#c4a747', borderRadius: '2px' }
const delStyles = { padding: '0.1rem 0.35rem', fontSize: '0.55rem', flexShrink: '0' }
</script>

<style scoped>
.project-task-item:hover { border-color: rgba(74, 103, 65, 0.35) !important; }
</style>
