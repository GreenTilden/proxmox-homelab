import { ref, computed } from 'vue'
import { apiFetch } from '@/services/apiClient'

// --- Types ---

export interface WeightEntry {
  id: string
  weight: number
  unit: string
  date: string
  time: string
  bodyFat?: number | null
  notes: string
}

export interface RowingSession {
  id: string
  date: string
  meters: number | null
  minutes: number | null
  splitPace: string
  strokeRate: number | null
  calories: number | null
  notes: string
}

export interface HabitDefinition {
  id: string
  name: string
  category: 'movement' | 'relaxation' | 'mindfulness' | 'hygiene'
  emoji: string
  durationMinutes: number
  defaultDays: number[]
  linkedTracker: string | null
  active: boolean
  createdAt: string
}

export interface HabitLogEntry {
  id: string
  habitId: string
  date: string
  completedAt: string
  durationMinutes: number | null
  notes: string
  source: 'manual' | 'auto'
}

export interface HealthSummary {
  latestWeight: WeightEntry | null
  weightTrend: WeightEntry[]
  rowingThisWeek: { sessions: number; totalMeters: number }
  rowingThisMonth: { sessions: number; totalMeters: number }
  totalWeightEntries: number
  totalRowingSessions: number
  habitsToday?: {
    suggested: number
    completed: number
    totalMinutes: number
    completedMinutes: number
  }
  habitsThisWeek?: {
    totalPossible: number
    completed: number
    completionRate: number
  }
}

// --- Composable ---

export function useHealth() {
  const weightEntries = ref<WeightEntry[]>([])
  const rowingSessions = ref<RowingSession[]>([])
  const summary = ref<HealthSummary | null>(null)
  const habits = ref<HabitDefinition[]>([])
  const todayLog = ref<HabitLogEntry[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // --- Fetch ---

  async function fetchSummary() {
    error.value = null
    try {
      summary.value = await apiFetch('/health/summary')
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function fetchWeight(days?: number) {
    isLoading.value = true
    error.value = null
    try {
      const params = days ? `?days=${days}` : ''
      const data = await apiFetch(`/health/weight${params}`)
      weightEntries.value = data.entries || []
    } catch (e: any) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  async function fetchRowing(days?: number) {
    isLoading.value = true
    error.value = null
    try {
      const params = days ? `?days=${days}` : ''
      const data = await apiFetch(`/health/rowing${params}`)
      rowingSessions.value = data.entries || []
    } catch (e: any) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  async function fetchHabits() {
    error.value = null
    try {
      const data = await apiFetch('/health/habits')
      habits.value = data.habits || []
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function fetchTodayLog() {
    error.value = null
    try {
      const today = new Date().toISOString().slice(0, 10)
      const data = await apiFetch(`/health/habit-log?date=${today}`)
      todayLog.value = data.entries || []
    } catch (e: any) {
      error.value = e.message
    }
  }

  // --- Add ---

  async function addWeight(entry: {
    weight: number
    date?: string
    unit?: string
    bodyFat?: number
    notes?: string
  }) {
    error.value = null
    try {
      await apiFetch('/health/weight', {
        method: 'POST',
        body: JSON.stringify(entry),
      })
      await fetchWeight(90)
      await fetchSummary()
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  async function addRowing(session: {
    meters?: number
    minutes?: number
    date?: string
    splitPace?: string
    strokeRate?: number
    calories?: number
    notes?: string
  }) {
    error.value = null
    try {
      await apiFetch('/health/rowing', {
        method: 'POST',
        body: JSON.stringify(session),
      })
      await fetchRowing(90)
      await Promise.all([fetchSummary(), fetchTodayLog()])
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  // --- Habit CRUD ---

  async function createHabit(habit: {
    name: string
    category?: string
    emoji?: string
    durationMinutes?: number
    defaultDays?: number[]
  }) {
    error.value = null
    try {
      await apiFetch('/health/habits', {
        method: 'POST',
        body: JSON.stringify(habit),
      })
      await fetchHabits()
      await fetchSummary()
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  async function updateHabit(id: string, updates: Partial<HabitDefinition>) {
    error.value = null
    try {
      await apiFetch(`/health/habits/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
      await fetchHabits()
      await fetchSummary()
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  async function deleteHabit(id: string) {
    error.value = null
    try {
      await apiFetch(`/health/habits/${id}`, { method: 'DELETE' })
      habits.value = habits.value.filter((h) => h.id !== id)
      await fetchSummary()
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function toggleHabit(habitId: string) {
    error.value = null
    const today = new Date().toISOString().slice(0, 10)
    const existing = todayLog.value.find((e) => e.habitId === habitId)

    try {
      if (existing) {
        await apiFetch(`/health/habit-log/${existing.id}`, { method: 'DELETE' })
      } else {
        await apiFetch('/health/habit-log', {
          method: 'POST',
          body: JSON.stringify({ habitId, date: today }),
        })
      }
      await fetchTodayLog()
      await fetchSummary()
    } catch (e: any) {
      error.value = e.message
    }
  }

  // --- Delete ---

  async function deleteWeight(id: string) {
    error.value = null
    try {
      await apiFetch(`/health/weight/${id}`, { method: 'DELETE' })
      weightEntries.value = weightEntries.value.filter((e) => e.id !== id)
      await fetchSummary()
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function deleteRowing(id: string) {
    error.value = null
    try {
      await apiFetch(`/health/rowing/${id}`, { method: 'DELETE' })
      rowingSessions.value = rowingSessions.value.filter((e) => e.id !== id)
      await fetchSummary()
    } catch (e: any) {
      error.value = e.message
    }
  }

  // --- Init ---

  async function init() {
    isLoading.value = true
    try {
      await Promise.all([fetchSummary(), fetchWeight(90), fetchRowing(90), fetchHabits(), fetchTodayLog()])
    } finally {
      isLoading.value = false
    }
  }

  // --- Computed ---

  const weightTrend = computed(() => {
    // Last 30 entries, oldest first (for charting)
    return [...weightEntries.value].reverse().slice(-30)
  })

  const weeklyRowingGoal = 3
  const rowingStreakThisWeek = computed(() => summary.value?.rowingThisWeek.sessions || 0)
  const rowingOnTrack = computed(() => rowingStreakThisWeek.value >= weeklyRowingGoal)

  // ISO weekday: 1=Mon .. 7=Sun
  const todayWeekday = computed(() => {
    const d = new Date().getDay()
    return d === 0 ? 7 : d
  })

  const todaysSuggested = computed(() =>
    habits.value.filter((h) => h.defaultDays.includes(todayWeekday.value))
  )

  const todaysCompleted = computed(() => {
    const completedIds = new Set(todayLog.value.map((e) => e.habitId))
    return todaysSuggested.value.filter((h) => completedIds.has(h.id))
  })

  const todayProgress = computed(() => {
    const total = todaysSuggested.value.length
    return total > 0 ? Math.round((todaysCompleted.value.length / total) * 100) : 0
  })

  const todayMinutesBudget = computed(() =>
    todaysSuggested.value.reduce((sum, h) => sum + h.durationMinutes, 0)
  )

  const todayMinutesCompleted = computed(() =>
    todaysCompleted.value.reduce((sum, h) => sum + h.durationMinutes, 0)
  )

  function isHabitCompletedToday(habitId: string): boolean {
    return todayLog.value.some((e) => e.habitId === habitId)
  }

  function getHabitLogEntry(habitId: string): HabitLogEntry | undefined {
    return todayLog.value.find((e) => e.habitId === habitId)
  }

  return {
    // State
    weightEntries,
    rowingSessions,
    summary,
    habits,
    todayLog,
    isLoading,
    error,

    // Computed
    weightTrend,
    rowingStreakThisWeek,
    rowingOnTrack,
    weeklyRowingGoal,
    todaysSuggested,
    todaysCompleted,
    todayProgress,
    todayMinutesBudget,
    todayMinutesCompleted,

    // Actions
    init,
    fetchSummary,
    fetchWeight,
    fetchRowing,
    fetchHabits,
    fetchTodayLog,
    addWeight,
    addRowing,
    deleteWeight,
    deleteRowing,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    isHabitCompletedToday,
    getHabitLogEntry,
  }
}
