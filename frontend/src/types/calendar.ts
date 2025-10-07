export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate?: Date
  allDay: boolean
  category: 'personal' | 'shared' | 'household'
  createdAt: Date
  updatedAt?: Date
}

export interface TodoItem {
  id: string
  text: string
  completed: boolean
  category: string
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  createdAt: Date
  completedAt?: Date
}

export interface TodoList {
  id: string
  name: string
  items: TodoItem[]
  shared: boolean
  createdAt: Date
  updatedAt?: Date
}

export interface CalendarData {
  events: CalendarEvent[]
  todoLists: TodoList[]
  lastUpdated: Date
}

export type EventCategory = CalendarEvent['category']
export type TodoPriority = TodoItem['priority']