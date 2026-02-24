<template>
  <SeasonalThemeProvider :enable-scanlines="true" :enable-particles="false" :enable-animations="true">
    <div :style="appStyles">
      <!-- Header -->
      <header :style="headerStyles">
        <router-link to="/" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.5rem;">&#x2190;</span>
        </router-link>
        <div style="flex: 1;">
          <h1 class="nes-text" :style="titleStyles">TODAY</h1>
          <div :style="subtitleStyles">{{ today?.weekday }} &middot; {{ today?.date }}</div>
        </div>
      </header>

      <!-- Main Content -->
      <main :style="mainStyles">
        <!-- Error -->
        <div v-if="error" :style="errorBannerStyles">
          {{ error }}
          <button class="nes-btn is-error" style="margin-left: 1rem; font-size: 0.6rem;" @click="error = null">X</button>
        </div>

        <!-- Loading -->
        <div v-if="isLoading && !today" :style="emptyStyles">
          <p class="nes-text">Loading daily briefing...</p>
        </div>

        <template v-else-if="today">
          <!-- Health Snapshot Bar -->
          <section :style="snapshotBarStyles">
            <div :style="snapshotItemStyles">
              <span :style="snapshotValueStyles">{{ today.health.latestWeight ? today.health.latestWeight.weight : '--' }}</span>
              <span :style="snapshotLabelStyles">{{ today.health.latestWeight ? today.health.latestWeight.unit : 'lbs' }}</span>
            </div>
            <div :style="snapshotDividerStyles"></div>
            <div :style="snapshotItemStyles">
              <span :style="snapshotValueStyles">{{ today.health.rowingThisWeek }}/3</span>
              <span :style="snapshotLabelStyles">Rowing</span>
            </div>
            <div :style="snapshotDividerStyles"></div>
            <div :style="snapshotItemStyles">
              <span :style="snapshotValueStyles">{{ habitProgress.done }}/{{ habitProgress.total }}</span>
              <span :style="snapshotLabelStyles">Habits</span>
            </div>
          </section>

          <!-- Habits Section -->
          <section :style="sectionStyles">
            <h2 :style="sectionTitleStyles">Habits</h2>
            <div :style="habitGridStyles">
              <button
                v-for="habit in today.habits.suggested"
                :key="habit.id"
                class="nes-btn"
                :class="isHabitDone(habit.id) ? 'is-success' : ''"
                :style="habitButtonStyles(isHabitDone(habit.id))"
                @click="toggleHabit(habit.id)"
              >
                <span style="font-size: 1.2rem;">{{ habit.emoji }}</span>
                <span :style="habitNameStyles">{{ habit.name }}</span>
                <span :style="habitDurStyles">{{ habit.durationMinutes }}m</span>
              </button>
            </div>
            <!-- Progress bar -->
            <div :style="progressBarContainerStyles">
              <div :style="progressBarFillStyles(habitProgress.pct)"></div>
            </div>
            <div :style="progressLabelStyles">{{ habitProgress.pct }}% complete</div>
          </section>

          <!-- Timeline Section -->
          <section v-if="timelineItems.length > 0" :style="sectionStyles">
            <h2 :style="sectionTitleStyles">Timeline</h2>
            <div :style="timelineListStyles">
              <div
                v-for="(item, i) in timelineItems"
                :key="i"
                :style="timelineRowStyles"
              >
                <span :style="timelineTimeStyles">{{ item.time || '--:--' }}</span>
                <span :style="pillarTagStyles(item.pillar)">{{ pillarShort(item.pillar) }}</span>
                <span :style="timelineTitleStyles">{{ item.title }}</span>
              </div>
            </div>
          </section>
          <section v-else :style="sectionStyles">
            <h2 :style="sectionTitleStyles">Timeline</h2>
            <p :style="emptyTextStyles">No events scheduled for today.</p>
          </section>

          <!-- Tasks Due Section -->
          <section :style="sectionStyles">
            <h2 :style="sectionTitleStyles">Tasks Due</h2>
            <div v-if="today.tasks.length > 0" :style="taskListStyles">
              <div
                v-for="task in today.tasks"
                :key="task.uid"
                :style="taskRowStyles"
                @click="toggleTask(task.uid)"
              >
                <span :style="taskCheckStyles(task.status === 'COMPLETED')">
                  {{ task.status === 'COMPLETED' ? '[x]' : '[ ]' }}
                </span>
                <span :style="pillarTagStyles(task.pillar)">{{ pillarShort(task.pillar) }}</span>
                <span :style="taskTitleStyles(task.status === 'COMPLETED')">{{ task.summary }}</span>
                <span v-if="task.due" :style="taskDueStyles">{{ task.due.slice(0, 10) }}</span>
              </div>
            </div>
            <p v-else :style="emptyTextStyles">No tasks due today.</p>
          </section>

          <!-- Pillar Quick Links -->
          <section :style="pillarLinksStyles">
            <router-link to="/health" :style="pillarCardStyles('#22c55e')">
              <span style="font-size: 1.5rem;">🌱</span>
              <span :style="pillarCardLabelStyles">Personal</span>
            </router-link>
            <router-link to="/ops" :style="pillarCardStyles('#4a6741')">
              <span style="font-size: 1.5rem;">🎯</span>
              <span :style="pillarCardLabelStyles">Professional</span>
            </router-link>
            <router-link to="/freezer-meals" :style="pillarCardStyles('#e8a838')">
              <span style="font-size: 1.5rem;">🏠</span>
              <span :style="pillarCardLabelStyles">Domestic</span>
            </router-link>
          </section>
        </template>
      </main>
    </div>
  </SeasonalThemeProvider>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import SeasonalThemeProvider from '../components/themes/retro/SeasonalThemeProvider.vue'
import { useToday } from '@/composables/useToday'
import { PILLAR_CONFIG, type Pillar } from '@/config/pillars'

const { data: today, isLoading, error, fetchToday, toggleHabit, toggleTask, timelineItems, habitProgress, isHabitDone } = useToday()

const isMobile = ref(false)
const checkMobile = () => { isMobile.value = window.innerWidth < 768 }

function pillarShort(p: Pillar) {
  return PILLAR_CONFIG[p]?.short || 'PER'
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  fetchToday()
})

// --- Styles ---

const appStyles = {
  minHeight: '100vh',
  padding: '0',
  margin: '0',
}

const headerStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: 'var(--space-lg)',
  background: 'var(--bg-surface)',
  borderBottom: '4px solid var(--color-primary-3)',
  position: 'sticky' as const,
  top: '0',
  zIndex: '50',
}

const titleStyles = {
  fontSize: '1.5rem',
  fontWeight: '700',
  color: 'var(--text-bright)',
  margin: '0',
}

const subtitleStyles = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  fontFamily: 'monospace',
  marginTop: '2px',
}

const mainStyles = {
  padding: 'var(--space-lg)',
  maxWidth: '800px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 'var(--space-lg)',
}

const errorBannerStyles = {
  background: 'rgba(255,0,0,0.15)',
  border: '2px solid #ff4444',
  borderRadius: '4px',
  padding: '0.75rem 1rem',
  color: '#ff6666',
  fontFamily: '"Press Start 2P", monospace',
  fontSize: '0.6rem',
  display: 'flex',
  alignItems: 'center',
}

const emptyStyles = {
  textAlign: 'center' as const,
  padding: '3rem',
  color: 'var(--text-muted)',
}

const emptyTextStyles = {
  color: 'var(--text-muted)',
  fontSize: '0.7rem',
  fontFamily: '"Press Start 2P", monospace',
  padding: '0.5rem 0',
}

// --- Snapshot Bar ---

const snapshotBarStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1rem',
  padding: '0.75rem 1rem',
  background: 'var(--bg-card)',
  borderRadius: '6px',
  border: '2px solid var(--color-primary-2)',
}

const snapshotItemStyles = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  gap: '2px',
}

const snapshotValueStyles = {
  fontSize: '1.1rem',
  fontWeight: '700',
  color: 'var(--text-bright)',
  fontFamily: 'monospace',
}

const snapshotLabelStyles = {
  fontSize: '0.55rem',
  color: 'var(--text-muted)',
  fontFamily: '"Press Start 2P", monospace',
  textTransform: 'uppercase' as const,
}

const snapshotDividerStyles = {
  width: '1px',
  height: '2rem',
  background: 'var(--color-primary-2)',
}

// --- Sections ---

const sectionStyles = {
  background: 'var(--bg-card)',
  borderRadius: '6px',
  border: '2px solid var(--color-primary-2)',
  padding: '1rem',
}

const sectionTitleStyles = {
  fontSize: '0.7rem',
  fontFamily: '"Press Start 2P", monospace',
  color: 'var(--text-bright)',
  margin: '0 0 0.75rem 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
}

// --- Habits ---

const habitGridStyles = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
  gap: '0.5rem',
  marginBottom: '0.75rem',
}

function habitButtonStyles(done: boolean) {
  return {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '4px',
    padding: '0.5rem',
    opacity: done ? '0.7' : '1',
    textDecoration: done ? 'line-through' : 'none',
    minHeight: '60px',
    justifyContent: 'center',
  }
}

const habitNameStyles = {
  fontSize: '0.55rem',
  fontFamily: '"Press Start 2P", monospace',
}

const habitDurStyles = {
  fontSize: '0.5rem',
  color: 'var(--text-muted)',
  fontFamily: 'monospace',
}

const progressBarContainerStyles = {
  width: '100%',
  height: '8px',
  background: 'rgba(255,255,255,0.1)',
  borderRadius: '4px',
  overflow: 'hidden',
}

function progressBarFillStyles(pct: number) {
  return {
    width: `${pct}%`,
    height: '100%',
    background: '#22c55e',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  }
}

const progressLabelStyles = {
  fontSize: '0.5rem',
  fontFamily: '"Press Start 2P", monospace',
  color: 'var(--text-muted)',
  textAlign: 'center' as const,
  marginTop: '4px',
}

// --- Timeline ---

const timelineListStyles = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '0.5rem',
}

const timelineRowStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.4rem 0',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
}

const timelineTimeStyles = {
  fontFamily: 'monospace',
  fontSize: '0.8rem',
  color: 'var(--text-muted)',
  minWidth: '50px',
  textAlign: 'right' as const,
}

function pillarTagStyles(pillar: Pillar) {
  const config = PILLAR_CONFIG[pillar] || PILLAR_CONFIG.personal
  return {
    fontSize: '0.5rem',
    fontFamily: '"Press Start 2P", monospace',
    padding: '2px 6px',
    borderRadius: '3px',
    background: config.color + '30',
    color: config.color,
    border: `1px solid ${config.color}60`,
    whiteSpace: 'nowrap' as const,
  }
}

const timelineTitleStyles = {
  fontSize: '0.7rem',
  fontFamily: '"Press Start 2P", monospace',
  color: 'var(--text-bright)',
  flex: '1',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap' as const,
}

// --- Tasks ---

const taskListStyles = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '0.4rem',
}

const taskRowStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.4rem 0',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
  cursor: 'pointer',
}

function taskCheckStyles(done: boolean) {
  return {
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    color: done ? '#22c55e' : 'var(--text-muted)',
    minWidth: '28px',
  }
}

function taskTitleStyles(done: boolean) {
  return {
    fontSize: '0.65rem',
    fontFamily: '"Press Start 2P", monospace',
    color: done ? 'var(--text-muted)' : 'var(--text-bright)',
    textDecoration: done ? 'line-through' : 'none',
    flex: '1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  }
}

const taskDueStyles = {
  fontSize: '0.5rem',
  fontFamily: 'monospace',
  color: 'var(--text-muted)',
}

// --- Pillar Quick Links ---

const pillarLinksStyles = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '0.75rem',
}

function pillarCardStyles(color: string) {
  return {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '1rem',
    background: `${color}15`,
    border: `2px solid ${color}40`,
    borderRadius: '6px',
    textDecoration: 'none',
    transition: 'transform 0.2s ease, border-color 0.2s ease',
  }
}

const pillarCardLabelStyles = {
  fontSize: '0.55rem',
  fontFamily: '"Press Start 2P", monospace',
  color: 'var(--text-bright)',
}
</script>
