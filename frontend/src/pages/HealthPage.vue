<template>
  <SeasonalThemeProvider :enable-scanlines="true" :enable-particles="false" :enable-animations="true">
    <div :style="appStyles">
      <!-- Header -->
      <header :style="headerStyles">
        <router-link to="/" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.5rem;">🏋️</span>
        </router-link>
        <div style="flex: 1;">
          <h1 class="nes-text" :style="titleStyles">Health Tracker</h1>
          <div :style="subtitleStyles">{{ currentDate }}</div>
        </div>
      </header>

      <!-- Tab Navigation -->
      <div :style="tabBarStyles">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="nes-btn"
          :class="activeTab === tab.id ? 'is-primary' : ''"
          :style="tabButtonStyles"
          @click="activeTab = tab.id"
        >
          <span class="tab-emoji">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
        </button>
      </div>

      <!-- Main Content -->
      <main :style="mainStyles">
        <!-- Error Banner -->
        <div v-if="health.error.value" :style="errorStyles">
          {{ health.error.value }}
          <button class="nes-btn is-error" style="margin-left: 1rem; font-size: 0.6rem;" @click="health.error.value = null">X</button>
        </div>

        <!-- Loading -->
        <div v-if="health.isLoading.value && !health.summary.value" :style="emptyStyles">
          <p class="nes-text">Loading health data...</p>
        </div>

        <!-- DASHBOARD TAB -->
        <section v-else-if="activeTab === 'dashboard'">
          <!-- Summary Cards -->
          <div :style="summaryGridStyles">
            <!-- Weight Card -->
            <div :style="cardStyles">
              <h3 :style="cardTitleStyles">Weight</h3>
              <div v-if="health.summary.value?.latestWeight" :style="bigNumberStyles">
                {{ health.summary.value.latestWeight.weight }}
                <span :style="unitStyles">{{ health.summary.value.latestWeight.unit }}</span>
              </div>
              <div v-else :style="emptyInlineStyles">No entries yet</div>
              <div v-if="health.summary.value?.latestWeight" :style="metaStyles">
                {{ health.summary.value.latestWeight.date }}
              </div>
            </div>

            <!-- Rowing This Week -->
            <div :style="cardStyles">
              <h3 :style="cardTitleStyles">Rowing This Week</h3>
              <div :style="bigNumberStyles">
                {{ health.rowingStreakThisWeek.value }}
                <span :style="unitStyles">/ {{ health.weeklyRowingGoal }} sessions</span>
              </div>
              <div :style="progressBarStyles">
                <div :style="progressFillStyles(Math.round((health.rowingStreakThisWeek.value / health.weeklyRowingGoal) * 100))"></div>
              </div>
              <div v-if="health.summary.value?.rowingThisWeek" :style="metaStyles">
                {{ (health.summary.value.rowingThisWeek.totalMeters / 1000).toFixed(1) }}km total
              </div>
            </div>

            <!-- Rowing This Month -->
            <div :style="cardStyles">
              <h3 :style="cardTitleStyles">Rowing This Month</h3>
              <div v-if="health.summary.value?.rowingThisMonth" :style="bigNumberStyles">
                {{ health.summary.value.rowingThisMonth.sessions }}
                <span :style="unitStyles">sessions</span>
              </div>
              <div v-if="health.summary.value?.rowingThisMonth" :style="metaStyles">
                {{ (health.summary.value.rowingThisMonth.totalMeters / 1000).toFixed(1) }}km total
              </div>
            </div>

            <!-- Self Care Card -->
            <div :style="cardStyles">
              <h3 :style="cardTitleStyles">Self Care</h3>
              <div :style="bigNumberStyles">
                {{ health.todaysCompleted.value.length }}
                <span :style="unitStyles">/ {{ health.todaysSuggested.value.length }} today</span>
              </div>
              <div :style="progressBarStyles">
                <div :style="selfCareProgressFill"></div>
              </div>
              <div :style="metaStyles">
                ~{{ health.todayMinutesCompleted.value }} of {{ health.todayMinutesBudget.value }} min
              </div>
            </div>
          </div>

          <!-- Weight Trend -->
          <div :style="cardStyles" v-if="health.weightTrend.value.length > 1">
            <h3 :style="cardTitleStyles">Weight Trend (Last 30)</h3>
            <div :style="trendContainerStyles">
              <div
                v-for="(entry, idx) in health.weightTrend.value"
                :key="entry.id || idx"
                :style="trendBarStyles(entry.weight, idx)"
                :title="`${entry.date}: ${entry.weight} ${entry.unit}`"
              >
                <div :style="trendBarFill(entry.weight)"></div>
              </div>
            </div>
            <div :style="trendLabelsStyles">
              <span :style="metaStyles">{{ health.weightTrend.value[0]?.date }}</span>
              <span :style="metaStyles">{{ health.weightTrend.value[health.weightTrend.value.length - 1]?.date }}</span>
            </div>
          </div>
        </section>

        <!-- WEIGHT TAB -->
        <section v-else-if="activeTab === 'weight'">
          <!-- Add Weight Form -->
          <div :style="cardStyles">
            <h3 :style="cardTitleStyles">Log Weight</h3>
            <div :style="formRowStyles">
              <input
                v-model.number="newWeight"
                type="number"
                step="0.1"
                placeholder="Weight"
                class="nes-input"
                :style="smallInputStyles"
                @keyup.enter="handleAddWeight"
              />
              <select v-model="newWeightUnit" class="nes-select" :style="selectStyles">
                <option value="lbs">lbs</option>
                <option value="kg">kg</option>
              </select>
              <input
                v-model.number="newBodyFat"
                type="number"
                step="0.1"
                placeholder="Body fat %"
                class="nes-input"
                :style="smallInputStyles"
              />
              <input
                v-model="newWeightDate"
                type="date"
                class="nes-input"
                :style="smallInputStyles"
              />
              <input
                v-model="newWeightNotes"
                placeholder="Notes"
                class="nes-input"
                :style="inputStyles"
              />
              <button
                class="nes-btn is-success"
                :style="actionBtnStyles"
                @click="handleAddWeight"
                :disabled="!newWeight"
              >Log</button>
            </div>
          </div>

          <!-- Weight History -->
          <div :style="cardStyles" v-if="health.weightEntries.value.length > 0">
            <h3 :style="cardTitleStyles">History</h3>
            <div v-for="entry in health.weightEntries.value" :key="entry.id" :style="entryRowStyles">
              <span :style="entryDateStyles">{{ entry.date }}</span>
              <span :style="entryValueStyles">{{ entry.weight }} {{ entry.unit }}</span>
              <span v-if="entry.bodyFat" :style="entryMetaStyles">{{ entry.bodyFat }}% BF</span>
              <span v-if="entry.notes" :style="entryNotesStyles">{{ entry.notes }}</span>
              <button class="nes-btn is-error" :style="delBtnStyles" @click="health.deleteWeight(entry.id)">X</button>
            </div>
          </div>
          <div v-else :style="emptyStyles">
            <p class="nes-text">No weight entries. Log your first one above.</p>
          </div>
        </section>

        <!-- ROWING TAB -->
        <section v-else-if="activeTab === 'rowing'">
          <!-- Add Rowing Form -->
          <div :style="cardStyles">
            <h3 :style="cardTitleStyles">Log Rowing Session</h3>
            <div :style="formRowStyles">
              <input
                v-model.number="newMeters"
                type="number"
                placeholder="Meters"
                class="nes-input"
                :style="smallInputStyles"
                @keyup.enter="handleAddRowing"
              />
              <input
                v-model.number="newMinutes"
                type="number"
                step="0.1"
                placeholder="Minutes"
                class="nes-input"
                :style="smallInputStyles"
              />
              <input
                v-model="newSplitPace"
                placeholder="Split (e.g. 2:05)"
                class="nes-input"
                :style="smallInputStyles"
              />
              <input
                v-model.number="newStrokeRate"
                type="number"
                placeholder="SPM"
                class="nes-input"
                :style="tinyInputStyles"
              />
              <input
                v-model.number="newCalories"
                type="number"
                placeholder="Cal"
                class="nes-input"
                :style="tinyInputStyles"
              />
              <input
                v-model="newRowingDate"
                type="date"
                class="nes-input"
                :style="smallInputStyles"
              />
              <button
                class="nes-btn is-success"
                :style="actionBtnStyles"
                @click="handleAddRowing"
                :disabled="!newMeters && !newMinutes"
              >Log</button>
            </div>
          </div>

          <!-- Rowing History -->
          <div :style="cardStyles" v-if="health.rowingSessions.value.length > 0">
            <h3 :style="cardTitleStyles">Sessions</h3>
            <div v-for="session in health.rowingSessions.value" :key="session.id" :style="entryRowStyles">
              <span :style="entryDateStyles">{{ session.date }}</span>
              <span v-if="session.meters" :style="entryValueStyles">{{ session.meters.toLocaleString() }}m</span>
              <span v-if="session.minutes" :style="entryMetaStyles">{{ session.minutes }}min</span>
              <span v-if="session.splitPace" :style="entryMetaStyles">{{ session.splitPace }}/500m</span>
              <span v-if="session.strokeRate" :style="entryMetaStyles">{{ session.strokeRate }}spm</span>
              <span v-if="session.calories" :style="entryMetaStyles">{{ session.calories }}cal</span>
              <button class="nes-btn is-error" :style="delBtnStyles" @click="health.deleteRowing(session.id)">X</button>
            </div>
          </div>
          <div v-else :style="emptyStyles">
            <p class="nes-text">No rowing sessions. Log your first one above.</p>
          </div>
        </section>

        <!-- SELF CARE TAB -->
        <section v-else-if="activeTab === 'selfcare'">
          <!-- Today's Progress -->
          <div :style="cardStyles">
            <h3 :style="cardTitleStyles">Today's Self Care</h3>
            <div :style="{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }">
              <span :style="{ fontSize: '0.75rem', color: 'var(--text-bright)' }">
                {{ health.todaysCompleted.value.length }}/{{ health.todaysSuggested.value.length }} habits
              </span>
              <span :style="{ fontSize: '0.65rem', color: 'var(--text-muted)' }">
                ~{{ health.todayMinutesCompleted.value }} of {{ health.todayMinutesBudget.value }} min
              </span>
            </div>
            <div :style="progressBarStyles">
              <div :style="selfCareProgressFill"></div>
            </div>
          </div>

          <!-- Suggested Habits -->
          <div :style="cardStyles" v-if="health.todaysSuggested.value.length > 0">
            <h3 :style="cardTitleStyles">Here's what you could do today</h3>
            <div
              v-for="habit in health.todaysSuggested.value"
              :key="habit.id"
              :style="habitRowStyles(health.isHabitCompletedToday(habit.id))"
            >
              <span :style="{ fontSize: '1rem', width: '1.5rem', textAlign: 'center' as const }">{{ habit.emoji }}</span>
              <span :style="habitNameStyles(health.isHabitCompletedToday(habit.id))">{{ habit.name }}</span>
              <span :style="categoryChipStyles(habit.category)">{{ habit.category }}</span>
              <span :style="{ fontSize: '0.6rem', color: 'var(--text-muted)', marginLeft: 'auto' }">~{{ habit.durationMinutes }}min</span>
              <span
                v-if="health.getHabitLogEntry(habit.id)?.source === 'auto'"
                :style="{ fontSize: '0.55rem', color: ACCENT, fontStyle: 'italic' }"
              >(auto)</span>
              <button
                class="nes-btn"
                :class="health.isHabitCompletedToday(habit.id) ? 'is-success' : ''"
                :style="checkBtnStyles"
                @click="health.toggleHabit(habit.id)"
              >{{ health.isHabitCompletedToday(habit.id) ? '\u2714' : '\u25CB' }}</button>
            </div>
          </div>
          <div v-else :style="emptyStyles">
            <p class="nes-text">No habits scheduled for today. Add some below!</p>
          </div>

          <!-- Manage Habits -->
          <div :style="cardStyles">
            <div
              :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }"
              @click="showManageHabits = !showManageHabits"
            >
              <h3 :style="{ ...cardTitleStyles, margin: '0' }">Manage Habits</h3>
              <span :style="{ fontSize: '0.7rem', color: 'var(--text-muted)' }">{{ showManageHabits ? '\u25B2' : '\u25BC' }}</span>
            </div>

            <div v-if="showManageHabits" :style="{ marginTop: '0.75rem' }">
              <!-- Existing Habits -->
              <div
                v-for="habit in health.habits.value"
                :key="habit.id"
                :style="entryRowStyles"
              >
                <span>{{ habit.emoji }}</span>
                <span :style="{ flex: '1', fontSize: '0.7rem', color: 'var(--text-bright)' }">{{ habit.name }}</span>
                <span :style="categoryChipStyles(habit.category)">{{ habit.category }}</span>
                <span :style="{ fontSize: '0.55rem', color: 'var(--text-muted)' }">{{ habit.durationMinutes }}min</span>
                <span :style="{ fontSize: '0.5rem', color: 'var(--text-muted)' }">{{ formatDays(habit.defaultDays) }}</span>
                <button
                  v-if="editingHabitId !== habit.id"
                  class="nes-btn is-warning"
                  :style="delBtnStyles"
                  @click="startEditHabit(habit)"
                >E</button>
                <button class="nes-btn is-error" :style="delBtnStyles" @click="health.deleteHabit(habit.id)">X</button>
              </div>

              <!-- Edit Habit Inline -->
              <div v-if="editingHabitId" :style="{ ...formCardStyles, marginTop: '0.5rem' }">
                <h4 :style="{ fontSize: '0.65rem', color: GOLD, margin: '0 0 0.5rem 0' }">Edit Habit</h4>
                <div :style="formRowStyles">
                  <input v-model="editName" placeholder="Name" class="nes-input" :style="smallInputStyles" />
                  <select v-model="editCategory" class="nes-select" :style="selectStyles">
                    <option value="movement">movement</option>
                    <option value="relaxation">relaxation</option>
                    <option value="mindfulness">mindfulness</option>
                    <option value="hygiene">hygiene</option>
                  </select>
                  <input v-model="editEmoji" placeholder="Emoji" class="nes-input" :style="tinyInputStyles" />
                  <input v-model.number="editDuration" type="number" placeholder="Min" class="nes-input" :style="tinyInputStyles" />
                </div>
                <div :style="{ ...formRowStyles, marginTop: '0.4rem' }">
                  <span :style="{ fontSize: '0.6rem', color: 'var(--text-muted)' }">Days:</span>
                  <button
                    v-for="d in dayOptions"
                    :key="d.value"
                    class="nes-btn"
                    :class="editDays.includes(d.value) ? 'is-primary' : ''"
                    :style="dayBtnStyles"
                    @click="toggleDay(editDays, d.value)"
                  >{{ d.label }}</button>
                </div>
                <div :style="{ display: 'flex', gap: '0.3rem', marginTop: '0.4rem' }">
                  <button class="nes-btn is-success" :style="actionBtnStyles" @click="handleUpdateHabit">Save</button>
                  <button class="nes-btn" :style="actionBtnStyles" @click="editingHabitId = null">Cancel</button>
                </div>
              </div>

              <!-- Add New Habit -->
              <div :style="{ ...formCardStyles, marginTop: '0.75rem' }">
                <h4 :style="{ fontSize: '0.65rem', color: GOLD, margin: '0 0 0.5rem 0' }">Add Habit</h4>
                <div :style="formRowStyles">
                  <input v-model="newHabitName" placeholder="Name" class="nes-input" :style="smallInputStyles" />
                  <select v-model="newHabitCategory" class="nes-select" :style="selectStyles">
                    <option value="movement">movement</option>
                    <option value="relaxation">relaxation</option>
                    <option value="mindfulness">mindfulness</option>
                    <option value="hygiene">hygiene</option>
                  </select>
                  <input v-model="newHabitEmoji" placeholder="Emoji" class="nes-input" :style="tinyInputStyles" />
                  <input v-model.number="newHabitDuration" type="number" placeholder="Min" class="nes-input" :style="tinyInputStyles" />
                </div>
                <div :style="{ ...formRowStyles, marginTop: '0.4rem' }">
                  <span :style="{ fontSize: '0.6rem', color: 'var(--text-muted)' }">Days:</span>
                  <button
                    v-for="d in dayOptions"
                    :key="d.value"
                    class="nes-btn"
                    :class="newHabitDays.includes(d.value) ? 'is-primary' : ''"
                    :style="dayBtnStyles"
                    @click="toggleDay(newHabitDays, d.value)"
                  >{{ d.label }}</button>
                </div>
                <button
                  class="nes-btn is-success"
                  :style="{ ...actionBtnStyles, marginTop: '0.4rem' }"
                  :disabled="!newHabitName.trim()"
                  @click="handleCreateHabit"
                >Add</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </SeasonalThemeProvider>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import SeasonalThemeProvider from '../components/themes/retro/SeasonalThemeProvider.vue'
import { useHealth, type HabitDefinition } from '../composables/useHealth'

// Favicon
const originalFavicon = document.querySelector('link[rel="icon"]')?.getAttribute('href') || ''
function setFavicon(emoji: string) {
  const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement
  if (link) link.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${emoji}</text></svg>`
}
setFavicon('\uD83C\uDFCB\uFE0F')
onUnmounted(() => {
  const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement
  if (link) link.href = originalFavicon
})

const health = useHealth()

const activeTab = ref('dashboard')
const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: '\uD83D\uDCCA' },
  { id: 'weight', label: 'Weight', icon: '\u2696\uFE0F' },
  { id: 'rowing', label: 'Rowing', icon: '\uD83D\uDEA3' },
  { id: 'selfcare', label: 'Self Care', icon: '\uD83E\uDDD8' },
]

// Weight form
const newWeight = ref<number | null>(null)
const newWeightUnit = ref('lbs')
const newBodyFat = ref<number | null>(null)
const newWeightDate = ref('')
const newWeightNotes = ref('')

// Rowing form
const newMeters = ref<number | null>(null)
const newMinutes = ref<number | null>(null)
const newSplitPace = ref('')
const newStrokeRate = ref<number | null>(null)
const newCalories = ref<number | null>(null)
const newRowingDate = ref('')

// Self care form
const showManageHabits = ref(false)
const newHabitName = ref('')
const newHabitCategory = ref('movement')
const newHabitEmoji = ref('\u2B50')
const newHabitDuration = ref<number>(15)
const newHabitDays = reactive<number[]>([1, 2, 3, 4, 5, 6, 7])

// Edit habit form
const editingHabitId = ref<string | null>(null)
const editName = ref('')
const editCategory = ref('movement')
const editEmoji = ref('')
const editDuration = ref<number>(15)
const editDays = reactive<number[]>([])

const dayOptions = [
  { value: 1, label: 'M' },
  { value: 2, label: 'T' },
  { value: 3, label: 'W' },
  { value: 4, label: 'Th' },
  { value: 5, label: 'F' },
  { value: 6, label: 'Sa' },
  { value: 7, label: 'Su' },
]

const currentDate = computed(() =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)

onMounted(() => health.init())

async function handleAddWeight() {
  if (!newWeight.value) return
  await health.addWeight({
    weight: newWeight.value,
    unit: newWeightUnit.value,
    date: newWeightDate.value || undefined,
    bodyFat: newBodyFat.value || undefined,
    notes: newWeightNotes.value || undefined,
  })
  newWeight.value = null
  newBodyFat.value = null
  newWeightDate.value = ''
  newWeightNotes.value = ''
}

async function handleAddRowing() {
  if (!newMeters.value && !newMinutes.value) return
  await health.addRowing({
    meters: newMeters.value || undefined,
    minutes: newMinutes.value || undefined,
    date: newRowingDate.value || undefined,
    splitPace: newSplitPace.value || undefined,
    strokeRate: newStrokeRate.value || undefined,
    calories: newCalories.value || undefined,
  })
  newMeters.value = null
  newMinutes.value = null
  newSplitPace.value = ''
  newStrokeRate.value = null
  newCalories.value = null
  newRowingDate.value = ''
}

async function handleCreateHabit() {
  if (!newHabitName.value.trim()) return
  await health.createHabit({
    name: newHabitName.value.trim(),
    category: newHabitCategory.value,
    emoji: newHabitEmoji.value,
    durationMinutes: newHabitDuration.value,
    defaultDays: [...newHabitDays],
  })
  newHabitName.value = ''
  newHabitCategory.value = 'movement'
  newHabitEmoji.value = '\u2B50'
  newHabitDuration.value = 15
  newHabitDays.splice(0, newHabitDays.length, 1, 2, 3, 4, 5, 6, 7)
}

function startEditHabit(habit: HabitDefinition) {
  editingHabitId.value = habit.id
  editName.value = habit.name
  editCategory.value = habit.category
  editEmoji.value = habit.emoji
  editDuration.value = habit.durationMinutes
  editDays.splice(0, editDays.length, ...habit.defaultDays)
}

async function handleUpdateHabit() {
  if (!editingHabitId.value) return
  await health.updateHabit(editingHabitId.value, {
    name: editName.value,
    category: editCategory.value as any,
    emoji: editEmoji.value,
    durationMinutes: editDuration.value,
    defaultDays: [...editDays],
  })
  editingHabitId.value = null
}

function toggleDay(days: number[], day: number) {
  const idx = days.indexOf(day)
  if (idx >= 0) {
    days.splice(idx, 1)
  } else {
    days.push(day)
    days.sort()
  }
}

function formatDays(days: number[]): string {
  const labels = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su']
  if (days.length === 7) return 'Daily'
  return days.map((d) => labels[d - 1]).join('')
}

// --- Weight trend helpers ---
const trendMin = computed(() => {
  const weights = health.weightTrend.value.map((e) => e.weight)
  return weights.length ? Math.min(...weights) - 2 : 0
})
const trendMax = computed(() => {
  const weights = health.weightTrend.value.map((e) => e.weight)
  return weights.length ? Math.max(...weights) + 2 : 100
})

// --- Styles ---
const ACCENT = '#2d7d46'
const GOLD = '#c4a747'
const BG = '#1a2a2a'

const CATEGORY_COLORS: Record<string, string> = {
  movement: '#22c55e',
  relaxation: '#3b82f6',
  mindfulness: '#a855f7',
  hygiene: '#14b8a6',
}

const appStyles = computed(() => ({ minHeight: '100vh', padding: '0', margin: '0', position: 'relative' as const, zIndex: '2' }))

const headerStyles = computed(() => ({
  display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
  padding: 'var(--space-md) var(--space-lg)',
  background: `linear-gradient(135deg, ${BG}, ${BG}dd)`,
  borderBottom: `4px solid ${ACCENT}`,
  position: 'sticky' as const, top: '0', zIndex: '50', backdropFilter: 'blur(8px)',
}))
const titleStyles = computed(() => ({ fontSize: '1.1rem', fontWeight: '700', color: GOLD, margin: '0', letterSpacing: '1px' }))
const subtitleStyles = computed(() => ({ fontSize: '0.6rem', color: `${GOLD}99`, marginTop: '0.15rem' }))

const tabBarStyles = computed(() => ({
  display: 'flex', gap: '0.25rem', padding: '0.5rem var(--space-lg)',
  background: `${BG}ee`, borderBottom: `2px solid ${ACCENT}66`,
  overflowX: 'auto' as const, backdropFilter: 'blur(8px)',
}))
const tabButtonStyles = computed(() => ({ fontSize: '0.6rem', padding: '0.35rem 0.7rem', whiteSpace: 'nowrap' as const, display: 'flex', alignItems: 'center', gap: '0.3rem' }))

const mainStyles = computed(() => ({ padding: 'var(--space-lg)', maxWidth: '900px', margin: '0 auto' }))

const errorStyles = computed(() => ({
  background: 'rgba(239, 68, 68, 0.15)', border: '2px solid rgba(239, 68, 68, 0.5)',
  borderRadius: '4px', padding: '0.5rem 0.75rem', marginBottom: '1rem', color: '#ff6b6b',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem',
}))
const emptyStyles = computed(() => ({ textAlign: 'center' as const, padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }))
const emptyInlineStyles = { fontSize: '0.75rem', color: 'var(--text-muted)' }

const cardStyles = computed(() => ({
  background: `${BG}cc`, border: `2px solid ${ACCENT}55`,
  borderRadius: '4px', padding: '0.75rem', marginBottom: '0.75rem', backdropFilter: 'blur(4px)',
}))
const cardTitleStyles = computed(() => ({
  fontSize: '0.75rem', color: GOLD, margin: '0 0 0.5rem 0',
  fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' as const,
}))
const formCardStyles = computed(() => ({
  background: `${BG}88`, border: `1px solid ${ACCENT}33`,
  borderRadius: '4px', padding: '0.6rem',
}))

const summaryGridStyles = computed(() => ({
  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem',
}))

const bigNumberStyles = { fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-bright)', lineHeight: '1.2' }
const unitStyles = { fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '400' }
const metaStyles = { fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.25rem' }

const progressBarStyles = computed(() => ({
  height: '12px', background: BG, border: `2px solid ${ACCENT}44`,
  borderRadius: '2px', overflow: 'hidden', marginTop: '0.4rem',
}))
const progressFillStyles = (pct: number) => ({
  height: '100%', width: `${Math.min(100, Math.max(0, pct))}%`,
  background: pct >= 100 ? '#22c55e' : `linear-gradient(90deg, ${ACCENT}, ${ACCENT}cc)`,
  transition: 'width 0.3s ease',
})

const selfCareProgressFill = computed(() => progressFillStyles(health.todayProgress.value))

// Trend chart (simple bar chart)
const trendContainerStyles = computed(() => ({
  display: 'flex', alignItems: 'flex-end', gap: '2px', height: '80px', padding: '0.25rem 0',
}))
function trendBarStyles(_weight: number, _idx: number) {
  return { flex: '1', display: 'flex', flexDirection: 'column' as const, justifyContent: 'flex-end', height: '100%' }
}
function trendBarFill(weight: number) {
  const range = trendMax.value - trendMin.value
  const pct = range > 0 ? ((weight - trendMin.value) / range) * 100 : 50
  return {
    height: `${pct}%`, background: ACCENT, borderRadius: '1px 1px 0 0',
    minHeight: '2px', transition: 'height 0.3s ease',
  }
}
const trendLabelsStyles = computed(() => ({
  display: 'flex', justifyContent: 'space-between', marginTop: '0.15rem',
}))

// Form styles
const formRowStyles = computed(() => ({ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' as const, alignItems: 'center' }))
const inputStyles = computed(() => ({
  flex: '1', minWidth: '120px', fontSize: '0.75rem', padding: '0.4rem',
  background: BG, color: 'var(--text-bright)', border: `2px solid ${ACCENT}66`,
}))
const smallInputStyles = computed(() => ({
  width: '100px', fontSize: '0.75rem', padding: '0.4rem',
  background: BG, color: 'var(--text-bright)', border: `2px solid ${ACCENT}66`,
}))
const tinyInputStyles = computed(() => ({
  width: '70px', fontSize: '0.65rem', padding: '0.25rem',
  background: BG, color: 'var(--text-bright)', border: `1px solid ${ACCENT}66`,
}))
const selectStyles = computed(() => ({
  fontSize: '0.65rem', padding: '0.35rem', width: 'auto',
  background: BG, color: 'var(--text-bright)', border: `2px solid ${ACCENT}66`,
}))
const actionBtnStyles = computed(() => ({ fontSize: '0.65rem', padding: '0.35rem 0.7rem', whiteSpace: 'nowrap' as const }))

// Entry list styles
const entryRowStyles = computed(() => ({
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  padding: '0.35rem 0', borderBottom: `1px solid ${ACCENT}22`, fontSize: '0.7rem',
}))
const entryDateStyles = { color: 'var(--text-muted)', minWidth: '5rem', fontFamily: 'monospace', fontSize: '0.6rem' }
const entryValueStyles = { fontWeight: '700', color: 'var(--text-bright)', fontSize: '0.8rem' }
const entryMetaStyles = { color: 'var(--text-muted)', fontSize: '0.6rem' }
const entryNotesStyles = { flex: '1', color: 'var(--text-muted)', fontSize: '0.6rem', fontStyle: 'italic' }
const delBtnStyles = { padding: '0.1rem 0.35rem', fontSize: '0.55rem', flexShrink: '0' }

// Self care styles
function habitRowStyles(completed: boolean) {
  return {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.5rem 0.25rem', borderBottom: `1px solid ${ACCENT}22`,
    opacity: completed ? '0.7' : '1',
    transition: 'opacity 0.2s ease',
  }
}

function habitNameStyles(completed: boolean) {
  return {
    fontSize: '0.75rem', color: 'var(--text-bright)',
    textDecoration: completed ? 'line-through' : 'none',
  }
}

function categoryChipStyles(category: string) {
  const color = CATEGORY_COLORS[category] || 'var(--text-muted)'
  return {
    fontSize: '0.5rem', color, border: `1px solid ${color}66`,
    borderRadius: '2px', padding: '0.1rem 0.3rem',
    textTransform: 'uppercase' as const, letterSpacing: '0.5px',
  }
}

const checkBtnStyles = { padding: '0.15rem 0.4rem', fontSize: '0.7rem', flexShrink: '0', minWidth: '2rem' }
const dayBtnStyles = { padding: '0.15rem 0.3rem', fontSize: '0.5rem', minWidth: '1.5rem' }
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.tab-emoji { font-size: 0.8rem; }

@media (max-width: 640px) {
  .tab-label { display: none; }
  .tab-emoji { font-size: 1.1rem; }
}

:deep(.nes-btn) { font-family: "Press Start 2P", monospace !important; }
:deep(.nes-input), :deep(.nes-select) { font-family: "Press Start 2P", monospace !important; }
</style>
