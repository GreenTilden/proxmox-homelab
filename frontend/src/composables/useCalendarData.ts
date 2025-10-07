import { ref, computed, watch } from 'vue'
import type { CalendarEvent, TodoList, TodoItem, CalendarData } from '@/types/calendar'

// Simple localStorage-based persistence for now
// In production, this would connect to your backend API
const STORAGE_KEY = 'homelab-calendar-data'

// Sample data for initial testing
const createSampleData = (): CalendarData => ({
  events: [
    {
      id: '1',
      title: 'Weekly Grocery Shopping',
      description: 'Pick up groceries for the week',
      startDate: new Date(2025, 8, 28, 10, 0), // Sept 28, 2025
      allDay: false,
      category: 'household',
      createdAt: new Date()
    },
    {
      id: '2',
      title: 'Date Night',
      description: 'Movie and dinner',
      startDate: new Date(2025, 8, 29, 19, 0), // Sept 29, 2025
      allDay: false,
      category: 'personal',
      createdAt: new Date()
    }
  ],
  todoLists: [
    {
      id: '1',
      name: 'Household Tasks',
      shared: true,
      createdAt: new Date(),
      items: [
        {
          id: '1',
          text: 'Fix kitchen faucet',
          completed: false,
          category: 'maintenance',
          priority: 'high',
          createdAt: new Date()
        },
        {
          id: '2',
          text: 'Clean garage',
          completed: false,
          category: 'cleaning',
          priority: 'medium',
          createdAt: new Date()
        }
      ]
    },
    {
      id: '2',
      name: 'Tech Projects',
      shared: true,
      createdAt: new Date(),
      items: [
        {
          id: '3',
          text: 'Setup backup automation',
          completed: false,
          category: 'tech',
          priority: 'medium',
          createdAt: new Date()
        },
        {
          id: '4',
          text: 'Upgrade Plex server',
          completed: true,
          category: 'tech',
          priority: 'low',
          createdAt: new Date(),
          completedAt: new Date()
        }
      ]
    }
  ],
  lastUpdated: new Date()
})

const loadCalendarData = (): CalendarData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored)
      // Convert date strings back to Date objects
      data.events = data.events.map((event: any) => ({
        ...event,
        startDate: new Date(event.startDate),
        endDate: event.endDate ? new Date(event.endDate) : undefined,
        createdAt: new Date(event.createdAt),
        updatedAt: event.updatedAt ? new Date(event.updatedAt) : undefined
      }))
      data.todoLists = data.todoLists.map((list: any) => ({
        ...list,
        createdAt: new Date(list.createdAt),
        updatedAt: list.updatedAt ? new Date(list.updatedAt) : undefined,
        items: list.items.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
          dueDate: item.dueDate ? new Date(item.dueDate) : undefined
        }))
      }))
      data.lastUpdated = new Date(data.lastUpdated)
      return data
    }
  } catch (error) {
    console.warn('Error loading calendar data from localStorage:', error)
  }

  return createSampleData()
}

const saveCalendarData = (data: CalendarData) => {
  try {
    const dataString = JSON.stringify(data)

    // Check localStorage quota (typical limit is 5-10MB)
    const estimatedSize = new Blob([dataString]).size / 1024 / 1024 // Size in MB

    if (estimatedSize > 5) {
      console.warn('Calendar data exceeds recommended size (>5MB)')
      throw new Error('Storage quota exceeded. Consider archiving old events.')
    }

    localStorage.setItem(STORAGE_KEY, dataString)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('LocalStorage quota exceeded:', error)
      throw new Error('Storage quota exceeded. Please delete some events or todo lists.')
    } else if (error instanceof Error) {
      console.error('Error saving calendar data:', error)
      throw error
    } else {
      console.error('Unknown error saving calendar data:', error)
      throw new Error('Failed to save calendar data. Please check your browser storage settings.')
    }
  }
}

// Reactive calendar data store
const calendarData = ref<CalendarData>(loadCalendarData())

// Auto-save when data changes with error handling
watch(calendarData, (newData) => {
  try {
    newData.lastUpdated = new Date()
    saveCalendarData(newData)
  } catch (error) {
    // Emit error to parent components
    console.error('Failed to auto-save calendar data:', error)
    // In a real app, you'd use a global error handler or event bus
  }
}, { deep: true })

export function useCalendarData() {
  // Computed properties
  const events = computed(() => calendarData.value.events)
  const todoLists = computed(() => calendarData.value.todoLists)
  const allTodos = computed(() =>
    todoLists.value.flatMap(list => list.items.map(item => ({ ...item, listName: list.name })))
  )

  const upcomingEvents = computed(() => {
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return events.value
      .filter(event => event.startDate >= now && event.startDate <= nextWeek)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, 5)
  })

  const incompleteTodos = computed(() =>
    allTodos.value
      .filter(todo => !todo.completed)
      .sort((a, b) => {
        // Sort by priority (high, medium, low) then by creation date
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        if (priorityDiff !== 0) return priorityDiff
        return a.createdAt.getTime() - b.createdAt.getTime()
      })
  )

  // Event management
  const addEvent = (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString(),
      createdAt: new Date()
    }
    calendarData.value.events.push(newEvent)
    return newEvent
  }

  const updateEvent = (eventId: string, updates: Partial<CalendarEvent>) => {
    const index = calendarData.value.events.findIndex(e => e.id === eventId)
    if (index !== -1) {
      calendarData.value.events[index] = {
        ...calendarData.value.events[index],
        ...updates,
        updatedAt: new Date()
      }
      return calendarData.value.events[index]
    }
    return null
  }

  const deleteEvent = (eventId: string) => {
    const index = calendarData.value.events.findIndex(e => e.id === eventId)
    if (index !== -1) {
      calendarData.value.events.splice(index, 1)
      return true
    }
    return false
  }

  // Todo list management
  const addTodoList = (name: string, shared: boolean = true) => {
    const newList: TodoList = {
      id: Date.now().toString(),
      name,
      shared,
      items: [],
      createdAt: new Date()
    }
    calendarData.value.todoLists.push(newList)
    return newList
  }

  const addTodoItem = (listId: string, item: Omit<TodoItem, 'id' | 'createdAt'>) => {
    const list = calendarData.value.todoLists.find(l => l.id === listId)
    if (list) {
      const newItem: TodoItem = {
        ...item,
        id: Date.now().toString(),
        createdAt: new Date()
      }
      list.items.push(newItem)
      list.updatedAt = new Date()
      return newItem
    }
    return null
  }

  const toggleTodoItem = (listId: string, itemId: string) => {
    const list = calendarData.value.todoLists.find(l => l.id === listId)
    if (list) {
      const item = list.items.find(i => i.id === itemId)
      if (item) {
        item.completed = !item.completed
        item.completedAt = item.completed ? new Date() : undefined
        list.updatedAt = new Date()
        return item
      }
    }
    return null
  }

  const deleteTodoItem = (listId: string, itemId: string) => {
    const list = calendarData.value.todoLists.find(l => l.id === listId)
    if (list) {
      const index = list.items.findIndex(i => i.id === itemId)
      if (index !== -1) {
        list.items.splice(index, 1)
        list.updatedAt = new Date()
        return true
      }
    }
    return false
  }

  const deleteTodoList = (listId: string) => {
    const index = calendarData.value.todoLists.findIndex(l => l.id === listId)
    if (index !== -1) {
      calendarData.value.todoLists.splice(index, 1)
      return true
    }
    return false
  }

  return {
    // Data
    events,
    todoLists,
    allTodos,
    upcomingEvents,
    incompleteTodos,

    // Event methods
    addEvent,
    updateEvent,
    deleteEvent,

    // Todo methods
    addTodoList,
    addTodoItem,
    toggleTodoItem,
    deleteTodoItem,
    deleteTodoList
  }
}