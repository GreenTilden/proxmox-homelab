import { ref, computed } from 'vue'
import { apiFetch } from '@/services/apiClient'

// --- Types ---

export interface ProjectTask {
  id: string
  summary: string
  description?: string
  status: 'needs-action' | 'in-process' | 'completed'
  priority: number // 1 (high) - 9 (low), 0 = unset
  due?: string
  percentComplete: number
  categories: string[]
}

export interface CalendarEvent {
  id: string
  title: string
  startDate: string
  endDate?: string
  allDay: boolean
  category?: string
  description?: string
}

export interface RevenueGoal {
  id: string
  label: string
  target: number
  current: number
  unit: string
  color?: string
}

export interface ProjectHubConfig {
  taskCalendar?: string
  eventCalendar?: string
  goalsStorageKey?: string
  defaultGoals?: RevenueGoal[]
}

// --- Composable ---

export function useProjectHub(config: ProjectHubConfig = {}) {
  const taskCalendar = config.taskCalendar || 'tasks'
  const eventCalendar = config.eventCalendar || 'personal'
  const goalsStorageKey = config.goalsStorageKey || 'project-hub-goals'

  const tasks = ref<ProjectTask[]>([])
  const events = ref<CalendarEvent[]>([])
  const goals = ref<RevenueGoal[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // --- Tasks ---

  async function fetchTasks(status: string = 'incomplete') {
    isLoading.value = true
    error.value = null
    try {
      const params = new URLSearchParams({ status, calendar: taskCalendar })
      const data = await apiFetch(`/tasks?${params}`)
      tasks.value = (data.tasks || []).map((t: any) => ({
        id: t.uid,
        summary: t.summary,
        description: t.description || '',
        status: (t.status || 'NEEDS-ACTION').toLowerCase().replace('_', '-') as ProjectTask['status'],
        priority: t.priority || 0,
        due: t.due || undefined,
        percentComplete: t.percent_complete || 0,
        categories: Array.isArray(t.categories) ? t.categories : [],
      }))
    } catch (e: any) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  async function createTask(task: {
    summary: string
    description?: string
    due?: string
    priority?: number
    categories?: string
  }) {
    error.value = null
    try {
      const body: any = { ...task }
      if (taskCalendar !== 'tasks') body.calendar = taskCalendar
      const result = await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      await fetchTasks()
      return result
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  async function updateTask(uid: string, updates: Partial<{
    summary: string
    description: string
    status: string
    priority: number
    due: string
    percent_complete: number
    categories: string
  }>) {
    error.value = null
    try {
      const body: any = { ...updates }
      if (taskCalendar !== 'tasks') body.calendar = taskCalendar
      const result = await apiFetch(`/tasks/${uid}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
      await fetchTasks()
      return result
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  async function toggleTaskComplete(uid: string) {
    const task = tasks.value.find((t) => t.id === uid)
    if (!task) return
    const newStatus = task.status === 'completed' ? 'NEEDS-ACTION' : 'COMPLETED'
    return updateTask(uid, { status: newStatus })
  }

  async function deleteTask(uid: string) {
    error.value = null
    try {
      const params = taskCalendar !== 'tasks' ? `?calendar=${taskCalendar}` : ''
      await apiFetch(`/tasks/${uid}${params}`, { method: 'DELETE' })
      tasks.value = tasks.value.filter((t) => t.id !== uid)
    } catch (e: any) {
      error.value = e.message
    }
  }

  // --- Calendar Events ---

  async function fetchProjectEvents(days: number = 60) {
    error.value = null
    try {
      const data = await apiFetch(`/calendar-events?days=${days}`)
      events.value = (data.events || []).map((e: any) => ({
        id: e.id,
        title: e.title,
        startDate: e.startDate,
        endDate: e.endDate,
        allDay: e.allDay,
        category: e.category,
        description: e.description,
      }))
    } catch (e: any) {
      error.value = e.message
    }
  }

  // --- Goals (localStorage) ---

  function loadGoals() {
    try {
      const stored = localStorage.getItem(goalsStorageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          goals.value = parsed
          return
        }
      }
    } catch {
      // fall through to seed
    }
    // Seed defaults on first load if no goals exist
    if (config.defaultGoals && config.defaultGoals.length > 0) {
      goals.value = config.defaultGoals.map((g, i) => ({
        ...g,
        id: g.id || `seed-${i}`,
      }))
      saveGoals()
    } else {
      goals.value = []
    }
  }

  function saveGoals() {
    localStorage.setItem(goalsStorageKey, JSON.stringify(goals.value))
  }

  function addGoal(goal: RevenueGoal) {
    goals.value.push(goal)
    saveGoals()
  }

  function updateGoal(id: string, updates: Partial<RevenueGoal>) {
    const idx = goals.value.findIndex((g) => g.id === id)
    if (idx >= 0) {
      goals.value[idx] = { ...goals.value[idx], ...updates }
      saveGoals()
    }
  }

  function removeGoal(id: string) {
    goals.value = goals.value.filter((g) => g.id !== id)
    saveGoals()
  }

  // --- Computed ---

  const incompleteTasks = computed(() =>
    tasks.value.filter((t) => t.status !== 'completed')
  )

  const completedTasks = computed(() =>
    tasks.value.filter((t) => t.status === 'completed')
  )

  const highPriorityTasks = computed(() =>
    tasks.value.filter((t) => t.priority >= 1 && t.priority <= 3 && t.status !== 'completed')
  )

  const upcomingEvents = computed(() => {
    const now = new Date().toISOString()
    return events.value.filter((e) => e.startDate >= now).slice(0, 10)
  })

  const taskProgress = computed(() => {
    const total = tasks.value.length
    if (total === 0) return 0
    const done = completedTasks.value.length
    return Math.round((done / total) * 100)
  })

  async function init() {
    isLoading.value = true
    try {
      await Promise.all([fetchTasks(), fetchProjectEvents()])
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    tasks,
    events,
    goals,
    isLoading,
    error,

    // Computed
    incompleteTasks,
    completedTasks,
    highPriorityTasks,
    upcomingEvents,
    taskProgress,

    // Init
    init,

    // Task actions
    fetchTasks,
    createTask,
    updateTask,
    toggleTaskComplete,
    deleteTask,

    // Event actions
    fetchProjectEvents,

    // Goal actions
    loadGoals,
    addGoal,
    updateGoal,
    removeGoal,
  }
}
