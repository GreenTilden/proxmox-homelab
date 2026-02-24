import { ref, computed } from 'vue'
import { apiFetch } from '@/services/apiClient'
import type { Pillar } from '@/config/pillars'

// --- Types ---

export interface TodayEvent {
  id: string
  title: string
  startDate: string | null
  endDate: string | null
  allDay: boolean
  category: string
  pillar: Pillar
}

export interface TodayTask {
  uid: string
  summary: string
  status: string
  priority: number
  due: string | null
  categories: string[]
  pillar: Pillar
}

export interface TodayHabit {
  id: string
  name: string
  emoji: string
  durationMinutes: number
  category: string
}

export interface TodayHabits {
  suggested: TodayHabit[]
  completed: string[]
  log: Array<{ id: string; habitId: string; date: string; source: string }>
}

export interface FamilyScoreEntry {
  id: string
  date: string
  score: number
  label: string
  notes: string
}

export interface TodayHealth {
  latestWeight: { weight: number; unit: string; date: string } | null
  rowingThisWeek: number
  familyScore: FamilyScoreEntry | null
  familyStreak: number
}

export interface TodayData {
  date: string
  weekday: string
  events: TodayEvent[]
  tasks: TodayTask[]
  habits: TodayHabits
  health: TodayHealth
}

// --- Composable ---

export function useToday() {
  const data = ref<TodayData | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchToday() {
    isLoading.value = true
    error.value = null
    try {
      data.value = await apiFetch('/today')
    } catch (e: any) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  async function toggleHabit(habitId: string) {
    if (!data.value) return
    const today = new Date().toISOString().slice(0, 10)
    const existing = data.value.habits.log.find(e => e.habitId === habitId)

    try {
      if (existing) {
        await apiFetch(`/health/habit-log/${existing.id}`, { method: 'DELETE' })
      } else {
        await apiFetch('/health/habit-log', {
          method: 'POST',
          body: JSON.stringify({ habitId, date: today }),
        })
      }
      await fetchToday()
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function toggleTask(uid: string) {
    if (!data.value) return
    const task = data.value.tasks.find(t => t.uid === uid)
    if (!task) return

    const newStatus = task.status === 'COMPLETED' ? 'NEEDS-ACTION' : 'COMPLETED'
    try {
      await apiFetch(`/tasks/${uid}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      })
      await fetchToday()
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function submitFamilyScore(score: number, notes?: string) {
    try {
      const today = new Date().toISOString().slice(0, 10)
      await apiFetch('/health/family-score', {
        method: 'POST',
        body: JSON.stringify({ score, date: today, notes: notes || '' }),
      })
      await fetchToday()
    } catch (e: any) {
      error.value = e.message
    }
  }

  // --- Computed ---

  const timelineItems = computed(() => {
    if (!data.value) return []
    const items: Array<{ type: 'event' | 'task'; time: string; title: string; pillar: Pillar; allDay?: boolean; raw: TodayEvent | TodayTask }> = []

    for (const ev of data.value.events) {
      const time = ev.allDay ? 'All Day' : (ev.startDate?.slice(11, 16) || '')
      items.push({ type: 'event', time, title: ev.title, pillar: ev.pillar, allDay: ev.allDay, raw: ev })
    }

    for (const task of data.value.tasks) {
      const time = task.due?.slice(11, 16) || ''
      items.push({ type: 'task', time, title: task.summary, pillar: task.pillar, raw: task })
    }

    // All-day at top, then sort by time
    items.sort((a, b) => {
      if (a.allDay && !b.allDay) return -1
      if (!a.allDay && b.allDay) return 1
      return (a.time || '99:99').localeCompare(b.time || '99:99')
    })

    return items
  })

  const habitProgress = computed(() => {
    if (!data.value) return { done: 0, total: 0, pct: 0 }
    const total = data.value.habits.suggested.length
    const done = data.value.habits.completed.length
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
  })

  const pillarSummary = computed(() => {
    if (!data.value) return { personal: 0, professional: 0, domestic: 0 }
    const counts = { personal: 0, professional: 0, domestic: 0 }
    for (const ev of data.value.events) {
      if (ev.pillar in counts) counts[ev.pillar]++
    }
    for (const task of data.value.tasks) {
      if (task.pillar in counts) counts[task.pillar]++
    }
    return counts
  })

  function isHabitDone(habitId: string): boolean {
    return data.value?.habits.completed.includes(habitId) ?? false
  }

  return {
    data,
    isLoading,
    error,
    fetchToday,
    toggleHabit,
    toggleTask,
    submitFamilyScore,
    timelineItems,
    habitProgress,
    pillarSummary,
    isHabitDone,
  }
}
