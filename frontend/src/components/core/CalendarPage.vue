<template>
  <div class="calendar-page" :style="pageStyles">
    <!-- Header with Navigation -->
    <header class="calendar-header" :style="headerStyles">
      <div class="header-content">
        <router-link to="/" class="nes-btn back-button" :style="backButtonStyles">
          ← Back to Dashboard
        </router-link>
        <h1 class="nes-text is-primary" :style="titleStyles">
          📅 Calendar & Tasks
        </h1>
        <div class="header-actions">
          <button
            class="nes-btn is-success"
            :style="buttonStyles"
            @click="showEventDialog = true"
          >
            + Event
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Grid -->
    <div class="calendar-content" :style="contentStyles">
      <!-- Calendar View -->
      <section class="calendar-section nes-container with-title is-dark" :style="sectionStyles">
        <p class="title">Monthly Calendar</p>
        <div class="month-navigation" :style="navStyles">
          <button class="nes-btn" :style="navButtonStyles" @click="previousMonth">◀</button>
          <h2 class="nes-text" :style="monthTitleStyles">{{ currentMonthDisplay }}</h2>
          <button class="nes-btn" :style="navButtonStyles" @click="nextMonth">▶</button>
        </div>

        <div class="calendar-grid" :style="gridStyles">
          <!-- Day headers -->
          <div v-for="day in dayHeaders" :key="day" class="day-header" :style="dayHeaderStyles">
            {{ day }}
          </div>

          <!-- Calendar days -->
          <div
            v-for="day in calendarDays"
            :key="`${day.date.toISOString()}`"
            class="calendar-day"
            :class="{
              'is-today': isToday(day.date),
              'is-other-month': !day.isCurrentMonth,
              'has-events': day.events.length > 0
            }"
            :style="getDayStyles(day)"
            @click="selectDay(day)"
          >
            <div class="day-number">{{ day.date.getDate() }}</div>
            <div v-if="day.events.length > 0" class="event-indicator" :style="indicatorStyles">
              {{ day.events.length }}
            </div>
          </div>
        </div>

        <!-- Selected Day Events -->
        <div v-if="selectedDay" class="day-events" :style="dayEventsStyles">
          <h3 class="nes-text" :style="dayEventsTitleStyles">
            Events for {{ formatDate(selectedDay.date) }}
          </h3>
          <div v-if="selectedDay.events.length === 0" class="no-events" :style="noEventsStyles">
            No events scheduled
          </div>
          <div v-else class="events-list">
            <div
              v-for="event in selectedDay.events"
              :key="event.id"
              class="event-item nes-container is-dark"
              :style="eventItemStyles"
            >
              <div class="event-content">
                <div class="event-title">{{ event.title }}</div>
                <div class="event-time" :style="eventTimeStyles">
                  {{ formatEventTime(event) }}
                </div>
                <div v-if="event.description" class="event-description" :style="eventDescStyles">
                  {{ event.description }}
                </div>
              </div>
              <div class="event-actions">
                <button class="nes-btn is-error is-small" @click="deleteEventClick(event.id)">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Todo Lists -->
      <section class="todos-section nes-container with-title is-dark" :style="sectionStyles">
        <p class="title">Task Lists</p>
        <div class="todos-header" :style="todosHeaderStyles">
          <input
            v-model="newListName"
            type="text"
            class="nes-input"
            placeholder="New list name..."
            :style="inputStyles"
            @keyup.enter="createTodoList"
          />
          <button class="nes-btn is-primary" :style="buttonStyles" @click="createTodoList">
            + List
          </button>
        </div>

        <div v-for="list in todoLists" :key="list.id" class="todo-list" :style="todoListStyles">
          <div class="list-header" :style="listHeaderStyles">
            <h3 class="nes-text">{{ list.name }}</h3>
            <button class="nes-btn is-error is-small" @click="deleteListClick(list.id)">
              Delete List
            </button>
          </div>

          <div class="todo-items">
            <div
              v-for="item in list.items"
              :key="item.id"
              class="todo-item"
              :style="getTodoItemStyles(item)"
            >
              <label class="todo-checkbox">
                <input
                  type="checkbox"
                  class="nes-checkbox"
                  :checked="item.completed"
                  @change="toggleTodo(list.id, item.id)"
                />
                <span :class="{ 'completed': item.completed }">{{ item.text }}</span>
              </label>
              <div class="todo-meta" :style="todoMetaStyles">
                <span class="priority-badge" :style="getPriorityBadgeStyles(item.priority)">
                  {{ item.priority }}
                </span>
                <button class="nes-btn is-error is-small" @click="deleteTodo(list.id, item.id)">
                  ×
                </button>
              </div>
            </div>
          </div>

          <div class="add-todo" :style="addTodoStyles">
            <input
              v-model="newTodoText[list.id]"
              type="text"
              class="nes-input"
              placeholder="New task..."
              :style="inputStyles"
              @keyup.enter="addTodo(list.id)"
            />
            <select v-model="newTodoPriority[list.id]" class="nes-select" :style="selectStyles">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button class="nes-btn is-success is-small" @click="addTodo(list.id)">
              + Add
            </button>
          </div>
        </div>
      </section>
    </div>

    <!-- Event Creation Dialog -->
    <div v-if="showEventDialog" class="dialog-overlay" :style="overlayStyles" @click="showEventDialog = false">
      <div class="dialog nes-container is-dark with-title" :style="dialogStyles" @click.stop>
        <p class="title">Create New Event</p>
        <div class="dialog-content" :style="dialogContentStyles">
          <div class="form-group">
            <label class="nes-text">Title:</label>
            <input v-model="newEvent.title" type="text" class="nes-input" :style="inputStyles" />
          </div>
          <div class="form-group">
            <label class="nes-text">Description:</label>
            <textarea v-model="newEvent.description" class="nes-textarea" :style="inputStyles" />
          </div>
          <div class="form-group">
            <label class="nes-text">Start Date:</label>
            <input v-model="newEvent.startDate" type="datetime-local" class="nes-input" :style="inputStyles" />
          </div>
          <div class="form-group">
            <label class="nes-text">Category:</label>
            <select v-model="newEvent.category" class="nes-select" :style="selectStyles">
              <option value="personal">Personal</option>
              <option value="shared">Shared</option>
              <option value="household">Household</option>
            </select>
          </div>
          <div class="form-group">
            <label>
              <input v-model="newEvent.allDay" type="checkbox" class="nes-checkbox" />
              <span class="nes-text">All Day Event</span>
            </label>
          </div>
          <div class="dialog-actions" :style="dialogActionsStyles">
            <button class="nes-btn is-success" :style="buttonStyles" @click="createEvent">
              Create Event
            </button>
            <button class="nes-btn" :style="buttonStyles" @click="showEventDialog = false">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCalendarData } from '@/composables/useCalendarData'
import { useTheme } from '@/composables/useTheme'
import { isRetroTheme } from '@/config/environments'
import type { CalendarEvent, TodoItem } from '@/types/calendar'

const { theme, cssVariables } = useTheme()
const isRetro = computed(() => isRetroTheme())

// Helper to generate class names based on theme
const nesClass = (baseClass: string) => isRetro.value ? `nes-${baseClass}` : baseClass
const {
  events,
  todoLists,
  addEvent,
  deleteEvent,
  addTodoList,
  addTodoItem,
  toggleTodoItem,
  deleteTodoItem,
  deleteTodoList
} = useCalendarData()

// Calendar state
const currentMonth = ref(new Date())
const selectedDay = ref<{ date: Date; events: CalendarEvent[]; isCurrentMonth: boolean } | null>(null)

// Dialog state
const showEventDialog = ref(false)
const newEvent = ref({
  title: '',
  description: '',
  startDate: '',
  category: 'personal' as const,
  allDay: false
})

// Todo state
const newListName = ref('')
const newTodoText = ref<Record<string, string>>({})
const newTodoPriority = ref<Record<string, 'low' | 'medium' | 'high'>>({})

// Calendar computed
const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const currentMonthDisplay = computed(() => {
  return currentMonth.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const days = []
  const current = new Date(startDate)

  for (let i = 0; i < 42; i++) {
    const dayEvents = events.value.filter(event => {
      const eventDate = new Date(event.startDate)
      return eventDate.toDateString() === current.toDateString()
    })

    days.push({
      date: new Date(current),
      events: dayEvents,
      isCurrentMonth: current.getMonth() === month
    })

    current.setDate(current.getDate() + 1)
  }

  return days
})

// Methods
const isToday = (date: Date): boolean => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const selectDay = (day: typeof calendarDays.value[0]) => {
  selectedDay.value = day
}

const previousMonth = () => {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1)
}

const nextMonth = () => {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1)
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

const formatEventTime = (event: CalendarEvent): string => {
  if (event.allDay) return 'All Day'
  return event.startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

const createEvent = () => {
  if (!newEvent.value.title || !newEvent.value.startDate) return

  addEvent({
    title: newEvent.value.title,
    description: newEvent.value.description,
    startDate: new Date(newEvent.value.startDate),
    allDay: newEvent.value.allDay,
    category: newEvent.value.category
  })

  showEventDialog.value = false
  newEvent.value = {
    title: '',
    description: '',
    startDate: '',
    category: 'personal',
    allDay: false
  }
}

const deleteEventClick = (eventId: string) => {
  if (confirm('Delete this event?')) {
    deleteEvent(eventId)
  }
}

const createTodoList = () => {
  if (!newListName.value) return
  addTodoList(newListName.value, true)
  newListName.value = ''
}

const addTodo = (listId: string) => {
  if (!newTodoText.value[listId]) return

  addTodoItem(listId, {
    text: newTodoText.value[listId],
    completed: false,
    category: 'general',
    priority: newTodoPriority.value[listId] || 'medium'
  })

  newTodoText.value[listId] = ''
}

const toggleTodo = (listId: string, itemId: string) => {
  toggleTodoItem(listId, itemId)
}

const deleteTodo = (listId: string, itemId: string) => {
  if (confirm('Delete this task?')) {
    deleteTodoItem(listId, itemId)
  }
}

const deleteListClick = (listId: string) => {
  if (confirm('Delete this entire list?')) {
    deleteTodoList(listId)
  }
}

// Styles
const pageStyles = computed(() => ({
  minHeight: '100vh',
  padding: '2rem',
  background: theme.value.backgrounds.app,
  color: theme.value.text.primary
}))

const headerStyles = computed(() => ({
  marginBottom: '2rem',
  padding: '1.5rem',
  background: theme.value.backgrounds.card,
  borderRadius: '8px',
  border: `4px solid ${theme.value.primary.ramp3}`
}))

const titleStyles = computed(() => ({
  fontSize: '2rem',
  color: theme.value.primary.ramp5,
  textShadow: `0 0 10px ${theme.value.effects.glow}`
}))

const backButtonStyles = computed(() => ({
  background: theme.value.secondary.ramp3,
  color: theme.value.text.primary,
  border: `4px solid ${theme.value.secondary.ramp4}`
}))

const buttonStyles = computed(() => ({
  borderColor: theme.value.primary.ramp4,
  color: theme.value.text.primary
}))

const contentStyles = computed(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
  gap: '2rem',
  '@media (max-width: 768px)': {
    gridTemplateColumns: '1fr'
  }
}))

const sectionStyles = computed(() => ({
  background: theme.value.backgrounds.card,
  border: `4px solid ${theme.value.primary.ramp3}`,
  padding: '1.5rem'
}))

const navStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '1rem'
}))

const navButtonStyles = computed(() => ({
  background: theme.value.accent.ramp3,
  borderColor: theme.value.accent.ramp4
}))

const monthTitleStyles = computed(() => ({
  color: theme.value.primary.ramp5,
  fontSize: '1.5rem'
}))

const gridStyles = computed(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '4px',
  marginTop: '1rem'
}))

const dayHeaderStyles = computed(() => ({
  textAlign: 'center',
  padding: '0.5rem',
  fontWeight: 'bold',
  color: theme.value.accent.ramp5,
  background: theme.value.backgrounds.surface
}))

const getDayStyles = (day: typeof calendarDays.value[0]) => {
  const baseStyles = {
    padding: '0.75rem',
    textAlign: 'center',
    cursor: 'pointer',
    background: day.isCurrentMonth ? theme.value.backgrounds.surface : theme.value.backgrounds.app,
    border: `2px solid ${theme.value.neutral.ramp3}`,
    minHeight: '60px',
    position: 'relative',
    transition: 'all 0.2s'
  }

  if (isToday(day.date)) {
    return {
      ...baseStyles,
      border: `3px solid ${theme.value.status.info}`,
      background: theme.value.primary.ramp1,
      fontWeight: 'bold'
    }
  }

  if (day.events.length > 0) {
    return {
      ...baseStyles,
      background: theme.value.accent.ramp1
    }
  }

  return baseStyles
}

const indicatorStyles = computed(() => ({
  position: 'absolute',
  top: '4px',
  right: '4px',
  background: theme.value.status.success,
  color: theme.value.text.primary,
  borderRadius: '50%',
  width: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.75rem',
  fontWeight: 'bold'
}))

const dayEventsStyles = computed(() => ({
  marginTop: '2rem',
  padding: '1rem',
  background: theme.value.backgrounds.surface,
  borderRadius: '4px'
}))

const dayEventsTitleStyles = computed(() => ({
  color: theme.value.primary.ramp5,
  marginBottom: '1rem'
}))

const noEventsStyles = computed(() => ({
  color: theme.value.text.muted,
  fontStyle: 'italic',
  textAlign: 'center',
  padding: '2rem'
}))

const eventItemStyles = computed(() => ({
  background: theme.value.backgrounds.elevated,
  border: `2px solid ${theme.value.primary.ramp3}`,
  padding: '1rem',
  marginBottom: '0.5rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}))

const eventTimeStyles = computed(() => ({
  color: theme.value.accent.ramp5,
  fontSize: '0.9rem',
  marginTop: '0.25rem'
}))

const eventDescStyles = computed(() => ({
  color: theme.value.text.secondary,
  fontSize: '0.9rem',
  marginTop: '0.5rem'
}))

const todosHeaderStyles = computed(() => ({
  display: 'flex',
  gap: '0.5rem',
  marginBottom: '1rem'
}))

const inputStyles = computed(() => ({
  background: theme.value.backgrounds.surface,
  color: theme.value.text.primary,
  borderColor: theme.value.primary.ramp3
}))

const selectStyles = computed(() => ({
  background: theme.value.backgrounds.surface,
  color: theme.value.text.primary,
  borderColor: theme.value.primary.ramp3
}))

const todoListStyles = computed(() => ({
  background: theme.value.backgrounds.surface,
  border: `2px solid ${theme.value.primary.ramp3}`,
  borderRadius: '4px',
  padding: '1rem',
  marginBottom: '1rem'
}))

const listHeaderStyles = computed(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1rem',
  paddingBottom: '0.5rem',
  borderBottom: `2px solid ${theme.value.primary.ramp3}`
}))

const getTodoItemStyles = (item: TodoItem) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.75rem',
  background: theme.value.backgrounds.elevated,
  border: `2px solid ${theme.value.neutral.ramp3}`,
  borderRadius: '4px',
  marginBottom: '0.5rem',
  opacity: item.completed ? 0.6 : 1
})

const todoMetaStyles = computed(() => ({
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center'
}))

const getPriorityBadgeStyles = (priority: string) => {
  const colors = {
    high: theme.value.status.error,
    medium: theme.value.status.warning,
    low: theme.value.status.success
  }

  return {
    background: colors[priority as keyof typeof colors],
    color: theme.value.text.primary,
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  }
}

const addTodoStyles = computed(() => ({
  display: 'flex',
  gap: '0.5rem',
  marginTop: '1rem'
}))

const overlayStyles = computed(() => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
}))

const dialogStyles = computed(() => ({
  background: theme.value.backgrounds.card,
  border: `4px solid ${theme.value.primary.ramp4}`,
  maxWidth: '600px',
  width: '90%',
  maxHeight: '80vh',
  overflow: 'auto'
}))

const dialogContentStyles = computed(() => ({
  padding: '1rem'
}))

const dialogActionsStyles = computed(() => ({
  display: 'flex',
  gap: '1rem',
  justifyContent: 'flex-end',
  marginTop: '1.5rem'
}))
</script>

<style scoped>
.calendar-page {
  font-family: 'Press Start 2P', 'Courier New', monospace;
}

/* Override NES.css for cleaner Naive theme */
:deep(.nes-btn),
.calendar-page .nes-btn {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  padding: 0.5rem 1rem !important;
  border-radius: 6px !important;
  transition: all 0.2s !important;
}

:deep(.nes-text),
.calendar-page .nes-text {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

:deep(.nes-container),
.calendar-page .nes-container {
  border-radius: 8px !important;
  border-width: 1px !important;
}

:deep(.nes-input),
:deep(.nes-textarea),
:deep(.nes-select),
.calendar-page .nes-input,
.calendar-page .nes-textarea,
.calendar-page .nes-select {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  border-radius: 6px !important;
  border-width: 1px !important;
}

/* Fallback button styling when nes.css not loaded */
.calendar-page button:not(.nes-btn) {
  padding: 0.5rem 1rem;
  border: 2px solid currentColor;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.calendar-page button:not(.nes-btn):hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

/* Fallback input styling */
.calendar-page input:not(.nes-input):not(.nes-checkbox),
.calendar-page textarea:not(.nes-textarea),
.calendar-page select:not(.nes-select) {
  padding: 0.5rem;
  border: 2px solid currentColor;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  font-family: inherit;
  width: 100%;
}

/* Back button specific styling */
.back-button {
  text-decoration: none;
  display: inline-block;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.calendar-grid {
  margin-top: 1rem;
}

.calendar-day {
  cursor: pointer;
  user-select: none;
}

.day-number {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.todo-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.todo-checkbox .completed {
  text-decoration: line-through;
  opacity: 0.6;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.nes-textarea,
.calendar-page textarea {
  width: 100%;
  min-height: 100px;
  font-family: inherit;
  resize: vertical;
}

/* Event and todo item hover effects */
.event-item,
.todo-item {
  transition: transform 0.2s, box-shadow 0.2s;
}

.event-item:hover,
.todo-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .calendar-page {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .calendar-grid {
    font-size: 0.8rem;
  }

  .day-number {
    font-size: 0.8rem;
  }
}
</style>
