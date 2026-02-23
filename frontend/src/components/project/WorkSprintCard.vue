<template>
  <div :style="cardStyles">
    <h3 :style="cardTitleStyles">Work Sprint</h3>

    <div v-if="groupedTasks.length === 0" :style="emptyStyles">
      No sprint items. Add tasks with categories: lilly, regeneron, gbgreg
    </div>

    <div v-for="group in groupedTasks" :key="group.category">
      <!-- Category header -->
      <div :style="categoryHeaderStyles">
        <span :style="categoryDot(group.category)"></span>
        <span :style="categoryLabel">{{ categoryNames[group.category] || group.category }}</span>
        <span :style="countBadge">{{ group.tasks.length }}</span>
      </div>

      <!-- Tasks -->
      <div v-for="task in group.tasks" :key="task.id" :style="taskRowStyles">
        <input
          type="checkbox"
          :checked="task.status === 'completed'"
          :style="checkboxStyles"
          @change="$emit('toggle', task.id)"
        />
        <span :style="priorityDot(task.priority)"></span>
        <span :style="taskNameStyles(task)">{{ task.summary }}</span>
        <span v-if="task.due" :style="dueDateStyles(task.due)">{{ formatDue(task.due) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectTask } from '@/composables/useProjectHub'
import { THEME_DEFAULTS } from '@/composables/types'

interface Props {
  tasks: ProjectTask[]
  accentColor?: string
  bgColor?: string
  goldColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  ...THEME_DEFAULTS,
})

defineEmits<{
  (e: 'toggle', uid: string): void
}>()

const WORK_CATEGORIES = ['lilly', 'regeneron', 'gbgreg', 'biosero']

const categoryNames: Record<string, string> = {
  lilly: 'Lilly',
  regeneron: 'Regeneron 560',
  gbgreg: 'GBGreg Onboarding',
  biosero: 'Biosero',
}

const categoryColors: Record<string, string> = {
  lilly: '#3a7bd5',
  regeneron: '#e8a838',
  gbgreg: '#22c55e',
  biosero: '#a855f7',
}

const groupedTasks = computed(() => {
  // Filter to work-category tasks only
  const workTasks = props.tasks.filter(t =>
    t.categories.some(c => WORK_CATEGORIES.includes(c))
  )

  // Group by first matching work category
  const groups: Record<string, ProjectTask[]> = {}
  for (const task of workTasks) {
    const cat = task.categories.find(c => WORK_CATEGORIES.includes(c)) || 'other'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(task)
  }

  // Sort tasks within each group: incomplete first, then by priority (lower = higher), then due date
  for (const cat of Object.keys(groups)) {
    groups[cat].sort((a, b) => {
      // Completed tasks last
      if (a.status === 'completed' && b.status !== 'completed') return 1
      if (a.status !== 'completed' && b.status === 'completed') return -1
      // By priority (lower number = higher priority; 0 = unset, treat as low)
      const ap = a.priority || 99
      const bp = b.priority || 99
      if (ap !== bp) return ap - bp
      // By due date
      return (a.due || '9999') < (b.due || '9999') ? -1 : 1
    })
  }

  // Return in category order
  return WORK_CATEGORIES
    .filter(cat => groups[cat])
    .map(cat => ({ category: cat, tasks: groups[cat] }))
})

function formatDue(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return 'overdue'
    if (diff === 0) return 'today'
    if (diff === 1) return 'tomorrow'
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

function isOverdue(dateStr: string): boolean {
  try {
    return new Date(dateStr) < new Date()
  } catch {
    return false
  }
}

// --- Styles ---
const cardStyles = computed(() => ({
  background: `${props.bgColor}cc`,
  border: `2px solid ${props.accentColor}55`,
  borderRadius: '4px',
  padding: '0.75rem',
  marginBottom: '0.75rem',
  backdropFilter: 'blur(4px)',
}))

const cardTitleStyles = computed(() => ({
  fontSize: '0.75rem',
  color: '#c4a747',
  margin: '0 0 0.5rem 0',
  fontWeight: '600',
  letterSpacing: '0.5px',
  textTransform: 'uppercase' as const,
}))

const emptyStyles = {
  fontSize: '0.65rem',
  color: 'var(--text-muted)',
  padding: '0.5rem 0',
}

const categoryHeaderStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.3rem',
  padding: '0.3rem 0',
  marginTop: '0.25rem',
  borderBottom: `1px solid ${props.accentColor}33`,
}

function categoryDot(cat: string) {
  return {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: categoryColors[cat] || props.accentColor,
    flexShrink: '0',
  }
}

const categoryLabel = {
  fontSize: '0.65rem',
  fontWeight: '600',
  color: 'var(--text-bright)',
  flex: '1',
}

const countBadge = {
  fontSize: '0.5rem',
  padding: '0.1rem 0.3rem',
  borderRadius: '8px',
  background: `${props.accentColor}33`,
  color: 'var(--text-muted)',
}

const taskRowStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.3rem 0 0.3rem 0.5rem',
  borderBottom: `1px solid ${props.accentColor}15`,
}

const checkboxStyles = {
  cursor: 'pointer',
  flexShrink: '0',
  width: '14px',
  height: '14px',
  accentColor: props.accentColor,
}

function priorityDot(priority: number) {
  const color = priority >= 1 && priority <= 1 ? '#ef4444'
    : priority >= 2 && priority <= 3 ? '#f59e0b'
    : '#6b7280'
  return {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: priority ? color : 'transparent',
    flexShrink: '0',
  }
}

function taskNameStyles(task: ProjectTask) {
  return {
    flex: '1',
    fontSize: '0.7rem',
    color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text-bright)',
    textDecoration: task.status === 'completed' ? 'line-through' : 'none',
    opacity: task.status === 'completed' ? '0.6' : '1',
  }
}

function dueDateStyles(dateStr: string) {
  const overdue = isOverdue(dateStr)
  return {
    fontSize: '0.55rem',
    color: overdue ? '#ef4444' : 'var(--text-muted)',
    fontWeight: overdue ? '600' : '400',
    whiteSpace: 'nowrap' as const,
  }
}
</script>
