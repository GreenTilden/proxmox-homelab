import { ref, computed } from 'vue'

const API_BASE = '/cmd-api'

function authHeaders(extra: Record<string, string> = {}) {
  return { 'Content-Type': 'application/json', ...extra }
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    ...options,
    headers: authHeaders((options.headers as Record<string, string>) || {}),
  })
  if (!res.ok && res.status !== 201) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `API error ${res.status}`)
  }
  return res.json()
}

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

export interface HealthSummary {
  latestWeight: WeightEntry | null
  weightTrend: WeightEntry[]
  rowingThisWeek: { sessions: number; totalMeters: number }
  rowingThisMonth: { sessions: number; totalMeters: number }
  totalWeightEntries: number
  totalRowingSessions: number
}

// --- Composable ---

export function useHealth() {
  const weightEntries = ref<WeightEntry[]>([])
  const rowingSessions = ref<RowingSession[]>([])
  const summary = ref<HealthSummary | null>(null)
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
      await fetchSummary()
    } catch (e: any) {
      error.value = e.message
      throw e
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
      await Promise.all([fetchSummary(), fetchWeight(90), fetchRowing(90)])
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

  return {
    // State
    weightEntries,
    rowingSessions,
    summary,
    isLoading,
    error,

    // Computed
    weightTrend,
    rowingStreakThisWeek,
    rowingOnTrack,
    weeklyRowingGoal,

    // Actions
    init,
    fetchSummary,
    fetchWeight,
    fetchRowing,
    addWeight,
    addRowing,
    deleteWeight,
    deleteRowing,
  }
}
