import { ref, computed, watch, onUnmounted } from 'vue'
import type { CalendarEvent } from '@/types/calendar'

interface CalendarCell {
  date: Date
  dateNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  events: CalendarEvent[]
  key: string
}

interface VirtualCalendarOptions {
  bufferMonths?: number
  enableCache?: boolean
  maxCacheSize?: number
}

export function useVirtualCalendar(
  currentDate: Ref<Date>,
  events: Ref<CalendarEvent[]>,
  options: VirtualCalendarOptions = {}
) {
  const {
    bufferMonths = 1,
    enableCache = true,
    maxCacheSize = 6
  } = options

  // Performance monitoring
  const renderStartTime = ref(0)
  const lastRenderDuration = ref(0)

  // Cache for optimized rendering
  const cellCache = enableCache ? new Map<string, CalendarCell[]>() : null
  const eventIndexCache = new Map<string, CalendarEvent[]>()

  // Virtual rendering boundaries
  const visibleRange = computed(() => {
    const current = new Date(currentDate.value)
    const start = new Date(current.getFullYear(), current.getMonth() - bufferMonths, 1)
    const end = new Date(current.getFullYear(), current.getMonth() + bufferMonths + 1, 0)
    return { start, end }
  })

  // Optimized event indexing for O(1) lookup
  const eventsByDate = computed(() => {
    const startTime = performance.now()

    // Clear cache when events change
    eventIndexCache.clear()

    const index = new Map<string, CalendarEvent[]>()

    // Only index events within visible range for better performance
    const { start, end } = visibleRange.value

    events.value.forEach(event => {
      const eventDate = event.startDate

      // Skip events outside visible range
      if (eventDate < start || eventDate > end) {
        return
      }

      const dateKey = eventDate.toDateString()

      if (!index.has(dateKey)) {
        index.set(dateKey, [])
      }
      index.get(dateKey)!.push(event)
    })

    // Cache the result
    index.forEach((events, dateKey) => {
      eventIndexCache.set(dateKey, events)
    })

    const duration = performance.now() - startTime
    console.debug(`Event indexing completed in ${duration.toFixed(2)}ms`)

    return index
  })

  // Optimized calendar data generation with virtualization
  const virtualCalendarData = computed(() => {
    renderStartTime.value = performance.now()

    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()
    const cacheKey = `${year}-${month}`

    // Check cache first
    if (cellCache?.has(cacheKey)) {
      const cached = cellCache.get(cacheKey)!
      lastRenderDuration.value = performance.now() - renderStartTime.value
      return cached
    }

    // Generate calendar grid
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const weeks: CalendarCell[][] = []
    const currentWeekDate = new Date(startDate)

    // Generate 6 weeks (42 days) efficiently
    for (let week = 0; week < 6; week++) {
      const weekCells: CalendarCell[] = []

      for (let day = 0; day < 7; day++) {
        const cellDate = new Date(currentWeekDate)
        const dateKey = cellDate.toDateString()

        // Fast event lookup using indexed cache
        const dayEvents = eventsByDate.value.get(dateKey) || []

        const cell: CalendarCell = {
          date: cellDate,
          dateNumber: cellDate.getDate(),
          isCurrentMonth: cellDate.getMonth() === month,
          isToday: isToday(cellDate),
          events: dayEvents,
          key: `${cellDate.getTime()}-${day}-${week}` // Unique key for Vue optimization
        }

        weekCells.push(cell)
        currentWeekDate.setDate(currentWeekDate.getDate() + 1)
      }

      weeks.push(weekCells)
    }

    // Cache the result with size limit
    if (cellCache) {
      if (cellCache.size >= maxCacheSize) {
        // Remove oldest entries (simple LRU)
        const firstKey = cellCache.keys().next().value
        cellCache.delete(firstKey)
      }
      cellCache.set(cacheKey, weeks)
    }

    lastRenderDuration.value = performance.now() - renderStartTime.value
    console.debug(`Calendar render completed in ${lastRenderDuration.value.toFixed(2)}ms`)

    return weeks
  })

  // Performance metrics
  const performanceMetrics = computed(() => ({
    lastRenderDuration: lastRenderDuration.value,
    cacheSize: cellCache?.size || 0,
    eventIndexSize: eventIndexCache.size,
    averageEventsPerDay: events.value.length / 30 // Rough estimate
  }))

  // Fast today check with caching
  const todayString = new Date().toDateString()
  const isToday = (date: Date): boolean => {
    return date.toDateString() === todayString
  }

  // Optimized date navigation with preloading
  const navigateToDate = (newDate: Date, preload = true) => {
    currentDate.value = newDate

    // Preload adjacent months for smoother navigation
    if (preload) {
      requestIdleCallback(() => {
        const nextMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 1)
        const prevMonth = new Date(newDate.getFullYear(), newDate.getMonth() - 1, 1)

        // Trigger cache population for adjacent months
        const oldDate = currentDate.value
        currentDate.value = nextMonth
        virtualCalendarData.value // Access to populate cache
        currentDate.value = prevMonth
        virtualCalendarData.value // Access to populate cache
        currentDate.value = oldDate
      })
    }
  }

  // Efficient event filtering for specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateKey = date.toDateString()
    return eventsByDate.value.get(dateKey) || []
  }

  // Batch event updates for better performance
  const updateEvents = (newEvents: CalendarEvent[]) => {
    events.value = newEvents
    // Cache will be automatically cleared by the computed property
  }

  // Memory cleanup
  const cleanup = () => {
    cellCache?.clear()
    eventIndexCache.clear()
  }

  // Cleanup on unmount
  onUnmounted(cleanup)

  // Watch for memory pressure and cleanup if needed
  if ('memory' in performance) {
    watch(() => (performance as any).memory?.usedJSHeapSize, (newSize, oldSize) => {
      if (newSize > oldSize * 1.5 && cellCache && cellCache.size > 3) {
        // Clear half the cache if memory usage spikes
        const keys = Array.from(cellCache.keys())
        const halfPoint = Math.floor(keys.length / 2)
        keys.slice(0, halfPoint).forEach(key => cellCache.delete(key))
        console.debug('Cache cleaned due to memory pressure')
      }
    })
  }

  return {
    // Core data
    virtualCalendarData,
    eventsByDate,
    visibleRange,

    // Performance metrics
    performanceMetrics,
    lastRenderDuration,

    // Methods
    navigateToDate,
    getEventsForDate,
    updateEvents,
    cleanup,

    // Cache control
    clearCache: () => {
      cellCache?.clear()
      eventIndexCache.clear()
    }
  }
}

// Utility function for requestIdleCallback with fallback
function requestIdleCallback(callback: () => void, timeout = 5000) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout })
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(callback, 1)
  }
}