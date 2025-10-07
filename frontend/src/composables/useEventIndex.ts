import { ref, computed, watch, onUnmounted } from 'vue'
import type { CalendarEvent } from '@/types/calendar'

interface EventIndexOptions {
  enablePrefetch?: boolean
  indexGranularity?: 'day' | 'week' | 'month'
  maxIndexSize?: number
}

export function useEventIndex(
  events: Ref<CalendarEvent[]>,
  options: EventIndexOptions = {}
) {
  const {
    enablePrefetch = true,
    indexGranularity = 'day',
    maxIndexSize = 1000
  } = options

  // Performance tracking
  const indexingTime = ref(0)
  const lastIndexSize = ref(0)

  // Multi-level indexing for different time granularities
  const dayIndex = new Map<string, CalendarEvent[]>()
  const weekIndex = new Map<string, CalendarEvent[]>()
  const monthIndex = new Map<string, CalendarEvent[]>()

  // Category and priority indexing for fast filtering
  const categoryIndex = new Map<string, CalendarEvent[]>()
  const upcomingEventsCache = ref<CalendarEvent[]>([])

  // Optimized date key generators
  const getDayKey = (date: Date): string => date.toDateString()
  const getWeekKey = (date: Date): string => {
    const year = date.getFullYear()
    const week = getWeekNumber(date)
    return `${year}-W${week}`
  }
  const getMonthKey = (date: Date): string => {
    return `${date.getFullYear()}-${date.getMonth()}`
  }

  // ISO week number calculation
  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }

  // Main indexing function with optimizations
  const rebuildIndex = () => {
    const startTime = performance.now()

    // Clear all indexes
    dayIndex.clear()
    weekIndex.clear()
    monthIndex.clear()
    categoryIndex.clear()

    // Sort events by date for better cache locality
    const sortedEvents = [...events.value].sort((a, b) =>
      a.startDate.getTime() - b.startDate.getTime()
    )

    // Build multi-level index in single pass
    sortedEvents.forEach(event => {
      // Day-level indexing
      const dayKey = getDayKey(event.startDate)
      if (!dayIndex.has(dayKey)) dayIndex.set(dayKey, [])
      dayIndex.get(dayKey)!.push(event)

      // Week-level indexing
      const weekKey = getWeekKey(event.startDate)
      if (!weekIndex.has(weekKey)) weekIndex.set(weekKey, [])
      weekIndex.get(weekKey)!.push(event)

      // Month-level indexing
      const monthKey = getMonthKey(event.startDate)
      if (!monthIndex.has(monthKey)) monthIndex.set(monthKey, [])
      monthIndex.get(monthKey)!.push(event)

      // Category indexing
      if (!categoryIndex.has(event.category)) {
        categoryIndex.set(event.category, [])
      }
      categoryIndex.get(event.category)!.push(event)
    })

    // Update upcoming events cache
    updateUpcomingEventsCache()

    indexingTime.value = performance.now() - startTime
    lastIndexSize.value = events.value.length

    console.debug(`Event index rebuilt: ${lastIndexSize.value} events in ${indexingTime.value.toFixed(2)}ms`)
  }

  // Optimized upcoming events calculation
  const updateUpcomingEventsCache = () => {
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    upcomingEventsCache.value = events.value
      .filter(event => event.startDate >= now && event.startDate <= nextWeek)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, 10) // Limit for performance
  }

  // Reactive index that rebuilds when events change
  watch(events, rebuildIndex, { immediate: true })

  // Fast lookup functions
  const getEventsForDay = (date: Date): CalendarEvent[] => {
    return dayIndex.get(getDayKey(date)) || []
  }

  const getEventsForWeek = (date: Date): CalendarEvent[] => {
    return weekIndex.get(getWeekKey(date)) || []
  }

  const getEventsForMonth = (date: Date): CalendarEvent[] => {
    return monthIndex.get(getMonthKey(date)) || []
  }

  const getEventsByCategory = (category: string): CalendarEvent[] => {
    return categoryIndex.get(category) || []
  }

  // Optimized date range queries
  const getEventsInRange = (startDate: Date, endDate: Date): CalendarEvent[] => {
    const result: CalendarEvent[] = []
    const currentDate = new Date(startDate)

    // Use day-level index for precise range queries
    while (currentDate <= endDate) {
      const dayEvents = getEventsForDay(currentDate)
      result.push(...dayEvents)
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Remove duplicates and sort
    const uniqueEvents = Array.from(
      new Map(result.map(event => [event.id, event])).values()
    )

    return uniqueEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
  }

  // Smart prefetching for better performance
  const prefetchAdjacentPeriods = (date: Date) => {
    if (!enablePrefetch) return

    requestIdleCallback(() => {
      // Prefetch adjacent months
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1)
      const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1)

      getEventsForMonth(nextMonth)
      getEventsForMonth(prevMonth)
    })
  }

  // Computed properties for common queries
  const upcomingEvents = computed(() => upcomingEventsCache.value)

  const eventStatistics = computed(() => ({
    totalEvents: events.value.length,
    categoryCounts: Object.fromEntries(
      Array.from(categoryIndex.entries()).map(([category, events]) => [
        category,
        events.length
      ])
    ),
    indexSizes: {
      days: dayIndex.size,
      weeks: weekIndex.size,
      months: monthIndex.size
    },
    lastIndexingTime: indexingTime.value
  }))

  // Search functionality with indexing
  const searchEvents = (query: string): CalendarEvent[] => {
    const lowerQuery = query.toLowerCase()
    const results: CalendarEvent[] = []

    // Use category index first for faster searching
    for (const [category, categoryEvents] of categoryIndex) {
      if (category.toLowerCase().includes(lowerQuery)) {
        results.push(...categoryEvents)
        continue
      }

      // Search within category events
      const matchingEvents = categoryEvents.filter(event =>
        event.title.toLowerCase().includes(lowerQuery) ||
        event.description?.toLowerCase().includes(lowerQuery)
      )
      results.push(...matchingEvents)
    }

    // Remove duplicates
    return Array.from(new Map(results.map(event => [event.id, event])).values())
  }

  // Memory management
  const clearIndex = () => {
    dayIndex.clear()
    weekIndex.clear()
    monthIndex.clear()
    categoryIndex.clear()
    upcomingEventsCache.value = []
  }

  // Performance monitoring
  const getPerformanceMetrics = () => ({
    indexingTime: indexingTime.value,
    lastIndexSize: lastIndexSize.value,
    cacheHitRatio: calculateCacheHitRatio(),
    memoryUsage: {
      dayIndex: dayIndex.size,
      weekIndex: weekIndex.size,
      monthIndex: monthIndex.size,
      categoryIndex: categoryIndex.size
    }
  })

  // Simple cache hit ratio calculation
  let cacheHits = 0
  let cacheMisses = 0

  const calculateCacheHitRatio = (): number => {
    const total = cacheHits + cacheMisses
    return total > 0 ? cacheHits / total : 0
  }

  // Cleanup on unmount
  onUnmounted(clearIndex)

  return {
    // Core lookup functions
    getEventsForDay,
    getEventsForWeek,
    getEventsForMonth,
    getEventsByCategory,
    getEventsInRange,

    // Computed data
    upcomingEvents,
    eventStatistics,

    // Search and filtering
    searchEvents,

    // Performance and caching
    prefetchAdjacentPeriods,
    getPerformanceMetrics,
    clearIndex,

    // Manual control
    rebuildIndex
  }
}

// Utility for requestIdleCallback with fallback
function requestIdleCallback(callback: () => void, timeout = 5000) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout })
  } else {
    setTimeout(callback, 1)
  }
}