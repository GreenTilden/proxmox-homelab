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
                  {{ event.allDay ? 'All Day' : formatTime(event.startDate) }}
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

      <!-- Tasks (Nextcloud VTODOs) -->
      <section class="todos-section nes-container with-title is-dark" :style="sectionStyles">
        <p class="title">Tasks</p>
        <div class="todos-header" :style="todosHeaderStyles">
          <input
            v-model="newTaskSummary"
            type="text"
            class="nes-input"
            placeholder="New task..."
            :style="inputStyles"
            @keyup.enter="handleAddTask"
          />
          <select v-model="newTaskPriority" class="nes-select" :style="selectStyles">
            <option :value="0">No priority</option>
            <option :value="1">High</option>
            <option :value="5">Medium</option>
            <option :value="9">Low</option>
          </select>
          <button class="nes-btn is-primary" :style="buttonStyles" @click="handleAddTask">
            + Add
          </button>
        </div>

        <!-- Status filter -->
        <div :style="filterBarStyles">
          <button
            class="nes-btn"
            :class="taskFilter === 'incomplete' ? 'is-warning' : ''"
            :style="filterBtnStyles"
            @click="taskFilter = 'incomplete'; fetchTasks(taskFilter)"
          >Active</button>
          <button
            class="nes-btn"
            :class="taskFilter === 'completed' ? 'is-success' : ''"
            :style="filterBtnStyles"
            @click="taskFilter = 'completed'; fetchTasks(taskFilter)"
          >Done</button>
          <button
            class="nes-btn"
            :class="taskFilter === 'all' ? 'is-primary' : ''"
            :style="filterBtnStyles"
            @click="taskFilter = 'all'; fetchTasks(taskFilter)"
          >All</button>
        </div>

        <div v-if="isLoading" :style="noEventsStyles">Loading tasks...</div>

        <div v-else-if="tasks.length === 0" :style="noEventsStyles">
          No tasks yet. Add one above.
        </div>

        <div v-else class="todo-items">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="todo-item"
            :style="getTaskItemStyles(task)"
          >
            <label class="todo-checkbox">
              <input
                type="checkbox"
                class="nes-checkbox"
                :checked="task.status === 'completed'"
                @change="toggleTaskComplete(task.id)"
              />
              <span :class="{ 'completed': task.status === 'completed' }">{{ task.summary }}</span>
            </label>
            <div class="todo-meta" :style="todoMetaStyles">
              <span v-if="task.priority >= 1 && task.priority <= 3" class="priority-badge" :style="getPriorityBadgeStyles('high')">
                P{{ task.priority }}
              </span>
              <span v-else-if="task.priority >= 4 && task.priority <= 6" class="priority-badge" :style="getPriorityBadgeStyles('medium')">
                P{{ task.priority }}
              </span>
              <span v-if="task.due" :style="dueDateStyles">{{ formatShortDate(task.due) }}</span>
              <span v-if="task.categories.length > 0" :style="categoryStyles">{{ task.categories.join(', ') }}</span>
              <button class="nes-btn is-error is-small" @click="handleDeleteTask(task.id)">
                ×
              </button>
            </div>
          </div>
        </div>

        <!-- Task progress -->
        <div v-if="tasks.length > 0" :style="progressSectionStyles">
          <div :style="progressBarContainerStyles">
            <div :style="getProgressBarFill()" />
          </div>
          <span :style="progressTextStyles">{{ completedTasks.length }}/{{ tasks.length }} completed</span>
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
import { useProjectHub } from '@/composables/useProjectHub'
import { useTheme } from '@/composables/useTheme'

const { theme } = useTheme()

const {
  tasks, events, isLoading,
  incompleteTasks, completedTasks,
  fetchTasks, createTask, toggleTaskComplete, deleteTask,
  fetchProjectEvents,
} = useProjectHub({
  taskCalendar: 'tasks',
  eventCalendar: 'personal',
})

// Calendar state
const currentMonth = ref(new Date())
const selectedDay = ref<{ date: Date; events: typeof events.value; isCurrentMonth: boolean } | null>(null)
const taskFilter = ref('incomplete')

// Dialog state
const showEventDialog = ref(false)
const newEvent = ref({ title: '', description: '', startDate: '', allDay: false })

// Task form state
const newTaskSummary = ref('')
const newTaskPriority = ref(0)

onMounted(async () => {
  await Promise.all([fetchTasks(), fetchProjectEvents(90)])
})

// Calendar computed
const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const currentMonthDisplay = computed(() => {
  return currentMonth.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const days = []
  const current = new Date(startDate)

  for (let i = 0; i < 42; i++) {
    const dateStr = current.toISOString().slice(0, 10)
    const dayEvents = events.value.filter(event => {
      const eventDate = event.startDate.slice(0, 10)
      return eventDate === dateStr
    })

    days.push({
      date: new Date(current),
      events: dayEvents,
      isCurrentMonth: current.getMonth() === month,
    })
    current.setDate(current.getDate() + 1)
  }
  return days
})

// Methods
const isToday = (date: Date) => date.toDateString() === new Date().toDateString()

const selectDay = (day: typeof calendarDays.value[0]) => {
  selectedDay.value = day
}

const previousMonth = () => {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1)
}

const nextMonth = () => {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1)
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

const formatTime = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  } catch {
    return dateStr
  }
}

const formatShortDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

async function createEvent() {
  if (!newEvent.value.title || !newEvent.value.startDate) return
  try {
    const API_BASE = '/cmd-api'
    const body: any = {
      title: newEvent.value.title,
      description: newEvent.value.description || undefined,
      allDay: newEvent.value.allDay,
    }
    if (newEvent.value.allDay) {
      body.startDate = newEvent.value.startDate.slice(0, 10)
    } else {
      body.startDate = new Date(newEvent.value.startDate).toISOString()
    }
    await fetch(`${API_BASE}/calendar-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    await fetchProjectEvents(90)
    showEventDialog.value = false
    newEvent.value = { title: '', description: '', startDate: '', allDay: false }
  } catch (e) {
    console.error('Failed to create event:', e)
  }
}

async function deleteEventClick(eventId: string) {
  if (!confirm('Delete this event?')) return
  try {
    const API_BASE = '/cmd-api'
    await fetch(`${API_BASE}/calendar-events/${eventId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } })
    await fetchProjectEvents(90)
    if (selectedDay.value) {
      selectedDay.value = {
        ...selectedDay.value,
        events: selectedDay.value.events.filter(e => e.id !== eventId),
      }
    }
  } catch (e) {
    console.error('Failed to delete event:', e)
  }
}

async function handleAddTask() {
  if (!newTaskSummary.value.trim()) return
  await createTask({
    summary: newTaskSummary.value.trim(),
    priority: newTaskPriority.value || undefined,
  })
  newTaskSummary.value = ''
  newTaskPriority.value = 0
}

async function handleDeleteTask(uid: string) {
  if (!confirm('Delete this task?')) return
  await deleteTask(uid)
}

// Styles
const pageStyles = computed(() => ({
  minHeight: '100vh', padding: '2rem',
  background: theme.value.backgrounds.app, color: theme.value.text.primary,
}))
const headerStyles = computed(() => ({
  marginBottom: '2rem', padding: '1.5rem',
  background: theme.value.backgrounds.card, borderRadius: '8px',
  border: `4px solid ${theme.value.primary.ramp3}`,
}))
const titleStyles = computed(() => ({
  fontSize: '2rem', color: theme.value.primary.ramp5,
  textShadow: `0 0 10px ${theme.value.effects.glow}`,
}))
const backButtonStyles = computed(() => ({
  background: theme.value.secondary.ramp3, color: theme.value.text.primary,
  border: `4px solid ${theme.value.secondary.ramp4}`,
}))
const buttonStyles = computed(() => ({
  borderColor: theme.value.primary.ramp4, color: theme.value.text.primary,
}))
const contentStyles = computed(() => ({
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem',
}))
const sectionStyles = computed(() => ({
  background: theme.value.backgrounds.card, border: `4px solid ${theme.value.primary.ramp3}`, padding: '1.5rem',
}))
const navStyles = computed(() => ({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }))
const navButtonStyles = computed(() => ({ background: theme.value.accent.ramp3, borderColor: theme.value.accent.ramp4 }))
const monthTitleStyles = computed(() => ({ color: theme.value.primary.ramp5, fontSize: '1.5rem' }))
const gridStyles = computed(() => ({ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginTop: '1rem' }))
const dayHeaderStyles = computed(() => ({
  textAlign: 'center', padding: '0.5rem', fontWeight: 'bold',
  color: theme.value.accent.ramp5, background: theme.value.backgrounds.surface,
}))
const getDayStyles = (day: typeof calendarDays.value[0]) => {
  const base = {
    padding: '0.75rem', textAlign: 'center' as const, cursor: 'pointer',
    background: day.isCurrentMonth ? theme.value.backgrounds.surface : theme.value.backgrounds.app,
    border: `2px solid ${theme.value.neutral.ramp3}`, minHeight: '60px',
    position: 'relative' as const, transition: 'all 0.2s',
  }
  if (isToday(day.date)) return { ...base, border: `3px solid ${theme.value.status.info}`, background: theme.value.primary.ramp1, fontWeight: 'bold' }
  if (day.events.length > 0) return { ...base, background: theme.value.accent.ramp1 }
  return base
}
const indicatorStyles = computed(() => ({
  position: 'absolute' as const, top: '4px', right: '4px',
  background: theme.value.status.success, color: theme.value.text.primary,
  borderRadius: '50%', width: '20px', height: '20px', display: 'flex',
  alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold',
}))
const dayEventsStyles = computed(() => ({
  marginTop: '2rem', padding: '1rem', background: theme.value.backgrounds.surface, borderRadius: '4px',
}))
const dayEventsTitleStyles = computed(() => ({ color: theme.value.primary.ramp5, marginBottom: '1rem' }))
const noEventsStyles = computed(() => ({ color: theme.value.text.muted, fontStyle: 'italic', textAlign: 'center' as const, padding: '2rem' }))
const eventItemStyles = computed(() => ({
  background: theme.value.backgrounds.elevated, border: `2px solid ${theme.value.primary.ramp3}`,
  padding: '1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
}))
const eventTimeStyles = computed(() => ({ color: theme.value.accent.ramp5, fontSize: '0.9rem', marginTop: '0.25rem' }))
const eventDescStyles = computed(() => ({ color: theme.value.text.secondary, fontSize: '0.9rem', marginTop: '0.5rem' }))
const todosHeaderStyles = computed(() => ({ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }))
const inputStyles = computed(() => ({ background: theme.value.backgrounds.surface, color: theme.value.text.primary, borderColor: theme.value.primary.ramp3 }))
const selectStyles = computed(() => ({ background: theme.value.backgrounds.surface, color: theme.value.text.primary, borderColor: theme.value.primary.ramp3 }))
const filterBarStyles = computed(() => ({ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem' }))
const filterBtnStyles = computed(() => ({ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }))
const getTaskItemStyles = (task: typeof tasks.value[0]) => ({
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '0.75rem', background: theme.value.backgrounds.elevated,
  border: `2px solid ${theme.value.neutral.ramp3}`, borderRadius: '4px',
  marginBottom: '0.5rem', opacity: task.status === 'completed' ? 0.6 : 1,
})
const todoMetaStyles = computed(() => ({ display: 'flex', gap: '0.5rem', alignItems: 'center' }))
const dueDateStyles = computed(() => ({ fontSize: '0.7rem', color: theme.value.text.muted }))
const categoryStyles = computed(() => ({ fontSize: '0.65rem', color: theme.value.accent.ramp5, padding: '0.1rem 0.3rem', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }))
const getPriorityBadgeStyles = (priority: string) => {
  const colors: Record<string, string> = { high: theme.value.status.error, medium: theme.value.status.warning, low: theme.value.status.success }
  return { background: colors[priority], color: theme.value.text.primary, padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' as const }
}
const progressSectionStyles = computed(() => ({ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: `1px solid ${theme.value.primary.ramp3}40` }))
const progressBarContainerStyles = computed(() => ({ flex: '1', height: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '3px', overflow: 'hidden' }))
const getProgressBarFill = () => {
  const pct = tasks.value.length > 0 ? (completedTasks.value.length / tasks.value.length) * 100 : 0
  return { width: `${pct}%`, height: '100%', background: theme.value.status.success, transition: 'width 0.3s ease' }
}
const progressTextStyles = computed(() => ({ fontSize: '0.75rem', color: theme.value.text.muted, whiteSpace: 'nowrap' as const }))
const overlayStyles = computed(() => ({
  position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
}))
const dialogStyles = computed(() => ({
  background: theme.value.backgrounds.card, border: `4px solid ${theme.value.primary.ramp4}`,
  maxWidth: '600px', width: '90%', maxHeight: '80vh', overflow: 'auto',
}))
const dialogContentStyles = computed(() => ({ padding: '1rem' }))
const dialogActionsStyles = computed(() => ({ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }))
</script>

<style scoped>
.calendar-page { font-family: 'Press Start 2P', 'Courier New', monospace; }
.header-content { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.header-actions { display: flex; gap: 0.5rem; }
.calendar-day { cursor: pointer; user-select: none; }
.day-number { font-size: 1rem; margin-bottom: 0.25rem; }
.todo-checkbox { display: flex; align-items: center; gap: 0.5rem; }
.todo-checkbox .completed { text-decoration: line-through; opacity: 0.6; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; }
.back-button { text-decoration: none; display: inline-block; }
.event-item, .todo-item { transition: transform 0.2s, box-shadow 0.2s; }
.event-item:hover, .todo-item:hover { transform: translateX(4px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); }
.nes-textarea, .calendar-page textarea { width: 100%; min-height: 100px; font-family: inherit; resize: vertical; }
@media (max-width: 768px) {
  .calendar-page { padding: 1rem; }
  .header-content { flex-direction: column; align-items: stretch; }
  .calendar-grid { font-size: 0.8rem; }
}
</style>
