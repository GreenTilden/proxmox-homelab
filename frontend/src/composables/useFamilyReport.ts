import { ref, computed } from 'vue'
import { apiFetch } from '@/services/apiClient'

// --- Types ---

export interface WeatherData {
  state: string
  temperature: number
  humidity: number
  windSpeed: number
  cloudCoverage: number
  dewPoint: number
  uvIndex: number
}

export interface OliverQuote {
  date: string
  quote: string
  submitted_by?: string
}

export interface HabitSnapshot {
  suggested: number
  completed: number
  totalMinutes: number
  completedMinutes: number
}

export interface WeekSnapshot {
  totalPossible: number
  completed: number
  completionRate: number
}

export interface FamilyTask {
  uid: string
  summary: string
  status: string
  priority: number
  due: string | null
  categories: string[]
}

// --- Composable ---

export function useFamilyReport() {
  // State
  const weather = ref<WeatherData | null>(null)
  const oliverQuote = ref<OliverQuote | null>(null)
  const habitsToday = ref<HabitSnapshot | null>(null)
  const habitsThisWeek = ref<WeekSnapshot | null>(null)
  const tasks = ref<FamilyTask[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // --- Fetch functions ---

  async function fetchWeather() {
    try {
      const states = await apiFetch('/ha/states')
      const entity = states.find(
        (s: any) => s.entity_id === 'weather.forecast_home'
      )
      if (entity) {
        weather.value = {
          state: entity.state,
          temperature: entity.attributes.temperature,
          humidity: entity.attributes.humidity,
          windSpeed: entity.attributes.wind_speed,
          cloudCoverage: entity.attributes.cloud_coverage,
          dewPoint: entity.attributes.dew_point,
          uvIndex: entity.attributes.uv_index,
        }
      }
    } catch (e: any) {
      console.warn('Weather fetch failed:', e.message)
    }
  }

  async function fetchOliverQuote() {
    try {
      const today = new Date().toISOString().slice(0, 10)
      const data = await apiFetch(`/oliver-quotes?date=${today}`)
      // API returns array or object depending on whether date filter matched
      if (Array.isArray(data)) {
        oliverQuote.value = data.length > 0 ? data[data.length - 1] : null
      } else if (data?.quote) {
        oliverQuote.value = data
      } else {
        oliverQuote.value = null
      }
    } catch {
      // 404 or error = no quote for today, that's fine
      oliverQuote.value = null
    }
  }

  async function fetchHealthSnapshot() {
    try {
      const data = await apiFetch('/health/summary')
      habitsToday.value = data.habitsToday || null
      habitsThisWeek.value = data.habitsThisWeek || null
    } catch (e: any) {
      console.warn('Health summary fetch failed:', e.message)
    }
  }

  async function fetchTasks() {
    try {
      const data = await apiFetch('/tasks')
      const all = data.tasks || data || []
      // Take first 5 incomplete tasks
      tasks.value = all
        .filter((t: any) => t.status !== 'COMPLETED')
        .slice(0, 5)
    } catch (e: any) {
      console.warn('Tasks fetch failed:', e.message)
    }
  }

  // --- Computed ---

  const weatherDescription = computed(() => {
    if (!weather.value) return null
    const w = weather.value
    const condition = w.state.charAt(0).toUpperCase() + w.state.slice(1).replace(/-/g, ' ')
    return `${condition}, ${Math.round(w.temperature)}\u00B0F`
  })

  const weatherIcon = computed(() => {
    const map: Record<string, string> = {
      'sunny': '\u2600\uFE0F',
      'clear-night': '\uD83C\uDF19',
      'cloudy': '\u2601\uFE0F',
      'partlycloudy': '\u26C5',
      'rainy': '\uD83C\uDF27\uFE0F',
      'pouring': '\uD83C\uDF27\uFE0F',
      'snowy': '\u2744\uFE0F',
      'snowy-rainy': '\uD83C\uDF28\uFE0F',
      'fog': '\uD83C\uDF2B\uFE0F',
      'windy': '\uD83D\uDCA8',
      'windy-variant': '\uD83D\uDCA8',
      'lightning': '\u26A1',
      'lightning-rainy': '\u26A1',
      'hail': '\uD83C\uDF28\uFE0F',
      'exceptional': '\u2753',
    }
    return map[weather.value?.state || ''] || '\u2600\uFE0F'
  })

  const habitSummaryText = computed(() => {
    if (!habitsToday.value) return null
    const h = habitsToday.value
    return `${h.completed}/${h.suggested} habits`
  })

  const weeklyHabitRate = computed(() => {
    if (!habitsThisWeek.value) return null
    return Math.round(habitsThisWeek.value.completionRate * 100)
  })

  const topTasks = computed(() => tasks.value)

  // --- Weather auto-refresh ---

  let weatherInterval: ReturnType<typeof setInterval> | null = null

  function startWeatherRefresh() {
    weatherInterval = setInterval(fetchWeather, 5 * 60 * 1000)
  }

  function stopWeatherRefresh() {
    if (weatherInterval) {
      clearInterval(weatherInterval)
      weatherInterval = null
    }
  }

  // --- Init ---

  async function init() {
    isLoading.value = true
    try {
      await Promise.all([
        fetchWeather(),
        fetchOliverQuote(),
        fetchHealthSnapshot(),
        fetchTasks(),
      ])
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    weather,
    oliverQuote,
    habitsToday,
    habitsThisWeek,
    tasks,
    isLoading,
    error,

    // Computed
    weatherDescription,
    weatherIcon,
    habitSummaryText,
    weeklyHabitRate,
    topTasks,

    // Actions
    init,
    fetchWeather,
    startWeatherRefresh,
    stopWeatherRefresh,
  }
}
