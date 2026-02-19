<template>
  <div class="wh-page">
    <WhitehouseHeader
      title="Family Dashboard"
      logo-src="/qca.png"
      :show-banner="false"
    >
      <template #nav>
        <span class="wh-header-link greeting-text">{{ greeting }}</span>
      </template>
    </WhitehouseHeader>

    <main class="family-main">
      <div class="family-container">
        <!-- Welcome -->
        <div class="welcome-section">
          <h2 class="wh-heading wh-heading-2">{{ greeting }}</h2>
          <p class="welcome-date">{{ todayFormatted }}</p>
          <hr class="wh-rule-gold" />
        </div>

        <!-- Feature Cards Grid -->
        <div class="cards-grid">
          <router-link
            v-for="card in featureCards"
            :key="card.route"
            :to="card.route"
            class="feature-card wh-card"
          >
            <span class="card-icon">{{ card.icon }}</span>
            <div class="card-text">
              <span class="card-label">{{ card.label }}</span>
              <span class="card-subtitle">{{ card.subtitle }}</span>
            </div>
          </router-link>
        </div>

        <!-- Oliver's Almanac -->
        <section class="almanac-section">
          <h3 class="wh-section-title">Oliver's Almanac</h3>
          <div class="almanac-card wh-card">
            <div v-if="todayQuote" class="almanac-display">
              <p class="almanac-quote">&ldquo;{{ todayQuote }}&rdquo;</p>
              <span class="almanac-meta">{{ todayDateLabel }}</span>
            </div>
            <div v-else class="almanac-empty">
              <p class="almanac-placeholder">No entry yet today</p>
            </div>
          </div>
        </section>

        <!-- Cathy Comic of the Day -->
        <section class="cathy-section">
          <h3 class="wh-section-title">Cathy Comic of the Day</h3>
          <div class="cathy-card wh-card">
            <!-- Date navigation bar -->
            <div class="cathy-nav">
              <button
                class="cathy-nav-btn"
                :disabled="!cathyPrevDate"
                @click="navigateCathy(cathyPrevDate!)"
                aria-label="Previous date"
              >&larr;</button>
              <button
                class="cathy-nav-date"
                :class="{ 'cathy-nav-date--past': !cathyIsToday }"
                @click="navigateCathy(todayISO)"
                :title="cathyIsToday ? 'Viewing today' : 'Return to today'"
              >{{ cathyViewDateFormatted }}</button>
              <button
                class="cathy-nav-btn"
                :disabled="!cathyNextDate"
                @click="navigateCathy(cathyNextDate!)"
                aria-label="Next date"
              >&rarr;</button>
            </div>

            <div v-if="cathyPosts.length > 0" class="cathy-display">
              <div class="cathy-image-wrap">
                <img
                  :src="cathyPosts[cathyIndex].image_url"
                  :alt="`Cathy comic from ${cathyPosts[cathyIndex].year}`"
                  class="cathy-image"
                  @error="($event.target as HTMLImageElement).style.display = 'none'"
                />
              </div>
              <p class="cathy-caption">
                Cathy &mdash; {{ cathyDateLabel(cathyPosts[cathyIndex].year) }}
              </p>
              <a
                :href="cathyPosts[cathyIndex].bluesky_url"
                target="_blank"
                rel="noopener"
                class="cathy-link"
              >View on Bluesky &rarr;</a>
              <div v-if="cathyPosts.length > 1" class="cathy-dots">
                <button
                  v-for="(post, i) in cathyPosts"
                  :key="i"
                  class="cathy-dot"
                  :class="{ 'cathy-dot--active': i === cathyIndex }"
                  @click="cathyIndex = i"
                  :aria-label="`${post.time} post`"
                >
                  <span class="cathy-dot-label">{{ post.time.replace(':00', '') }}</span>
                </button>
              </div>
            </div>
            <div v-else class="cathy-empty">
              <p class="cathy-placeholder">{{ cathyEmptyMessage }}</p>
            </div>
          </div>
        </section>

        <!-- Light Controls -->
        <section class="lights-section">
          <h3 class="wh-section-title">Lights</h3>
          <div class="lights-grid">
            <!-- Office -->
            <div class="light-card wh-card">
              <div class="light-header">
                <span class="light-name">Office</span>
                <button
                  class="light-toggle"
                  :class="{ 'light-toggle--on': officeOn }"
                  @click="toggleRoom('office')"
                >{{ officeOn ? 'ON' : 'OFF' }}</button>
              </div>
              <div class="light-slider-row">
                <input
                  type="range"
                  min="0"
                  max="100"
                  :value="officeBrightness"
                  @input="setBrightness('office', ($event.target as HTMLInputElement).value)"
                  class="light-slider"
                />
                <span class="light-value">{{ officeBrightness }}%</span>
              </div>
            </div>

            <!-- Basement -->
            <div class="light-card wh-card">
              <div class="light-header">
                <span class="light-name">Basement</span>
                <button
                  class="light-toggle"
                  :class="{ 'light-toggle--on': basementOn }"
                  @click="toggleRoom('basement')"
                >{{ basementOn ? 'ON' : 'OFF' }}</button>
              </div>
              <div class="light-slider-row">
                <input
                  type="range"
                  min="0"
                  max="100"
                  :value="basementBrightness"
                  @input="setBrightness('basement', ($event.target as HTMLInputElement).value)"
                  class="light-slider"
                />
                <span class="light-value">{{ basementBrightness }}%</span>
              </div>
            </div>
          </div>
          <p v-if="lightError" class="light-error">{{ lightError }}</p>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import WhitehouseHeader from '@/components/themes/whitehouse/WhitehouseHeader.vue'
import '@/styles/whitehouse-theme.css'

// --- Greeting ---
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
})

const todayFormatted = computed(() =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
)

// --- Feature Cards ---
const featureCards = [
  { icon: '\uD83C\uDF7C', label: 'Baby Cam', subtitle: 'Live nursery feeds', route: '/nanit' },
  { icon: '\uD83C\uDF7D\uFE0F', label: 'Meal Plan', subtitle: 'Weekly meal wizard', route: '/meal-plan' },
  { icon: '\uD83D\uDCC5', label: 'Calendar', subtitle: 'Events & schedule', route: '/calendar' },
  { icon: '\u26C5', label: 'Weather', subtitle: 'Local forecast', route: '/weather' },
  { icon: '\uD83E\uDDCA', label: 'Freezer Meals', subtitle: 'Recipe browser', route: '/freezer-meals' },
]

// --- Oliver's Almanac ---
const API_BASE = window.location.protocol + '//' + window.location.host
const API_TOKEN = '4be03b6172afe584e6547ce38697412f99ffa552bb18b4ea73e522eed4e65eaf'
const apiHeaders: Record<string, string> = {
  'Authorization': `Bearer ${API_TOKEN}`,
  'Content-Type': 'application/json'
}

const todayQuote = ref<string | null>(null)

const todayDateLabel = computed(() =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
)

async function fetchTodayQuote() {
  const today = new Date().toISOString().split('T')[0]
  try {
    const res = await fetch(`${API_BASE}/cmd-api/oliver-quotes?date=${today}`, { headers: apiHeaders })
    if (res.ok) {
      const data = await res.json()
      todayQuote.value = data.quote || null
    }
  } catch (e) {
    console.warn('Failed to fetch Oliver almanac:', e)
  }
}

// --- Cathy Comics ---
const cathyPosts = ref<Array<{year: number, time: string, bluesky_url: string, image_url: string}>>([])
const cathyIndex = ref(0)
const cathyViewDate = ref(new Date().toISOString().split('T')[0])
const cathyPrevDate = ref<string | null>(null)
const cathyNextDate = ref<string | null>(null)

const todayISO = computed(() => new Date().toISOString().split('T')[0])

const cathyIsToday = computed(() => cathyViewDate.value === todayISO.value)

const cathyViewDateFormatted = computed(() => {
  const [y, m, d] = cathyViewDate.value.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
})

function cathyDateLabel(year: number) {
  const [y, m, d] = cathyViewDate.value.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) + ', ' + year
}

const cathyEmptyMessage = computed(() => {
  if (!cathyIsToday.value) return 'No comics on this date'
  const hour = new Date().getHours()
  if (hour < 9) return 'First comic coming at 9:00 AM'
  if (hour < 12) return 'Next comic coming at 12:00 PM'
  if (hour < 15) return 'Next comic coming at 3:00 PM'
  return 'No comics posted yet today'
})

async function fetchCathyPosts(date?: string) {
  const targetDate = date || todayISO.value
  cathyViewDate.value = targetDate
  try {
    const res = await fetch(`${API_BASE}/cmd-api/cathy-today?date=${targetDate}`, { headers: apiHeaders })
    if (res.ok) {
      const data = await res.json()
      cathyPosts.value = data.posts || []
      cathyPrevDate.value = data.prev_date || null
      cathyNextDate.value = data.next_date || null
      if (cathyPosts.value.length > 0) {
        cathyIndex.value = cathyPosts.value.length - 1
      } else {
        cathyIndex.value = 0
      }
    }
  } catch (e) {
    console.warn('Failed to fetch Cathy posts:', e)
  }
}

function navigateCathy(date: string) {
  fetchCathyPosts(date)
}


// --- Light Controls ---
const HA_API = `${API_BASE}/cmd-api/ha`

const officeBrightness = ref(0)
const basementBrightness = ref(0)
const officeOn = ref(false)
const basementOn = ref(false)
const lightError = ref('')

async function fetchLightStates() {
  try {
    const res = await fetch(`${HA_API}/states`, { headers: apiHeaders })
    if (!res.ok) throw new Error(`API ${res.status}`)
    const states: Array<{ entity_id: string; state: string }> = await res.json()

    for (const s of states) {
      switch (s.entity_id) {
        case 'input_number.office_brightness':
          officeBrightness.value = Math.round(Number(s.state))
          break
        case 'input_number.basement_brightness':
          basementBrightness.value = Math.round(Number(s.state))
          break
        case 'light.above_desk':
          officeOn.value = s.state === 'on'
          break
        case 'light.basement_light_1':
          basementOn.value = s.state === 'on'
          break
      }
    }
    lightError.value = ''
  } catch {
    lightError.value = 'Could not reach lights'
  }
}

async function callHAService(domain: string, service: string, data: Record<string, any>) {
  try {
    await fetch(`${HA_API}/services/${domain}/${service}`, {
      method: 'POST',
      headers: apiHeaders,
      body: JSON.stringify(data)
    })
    setTimeout(fetchLightStates, 500)
  } catch {
    lightError.value = 'Failed to control lights'
  }
}

function setBrightness(room: string, value: string) {
  const entity = room === 'office'
    ? 'input_number.office_brightness'
    : 'input_number.basement_brightness'
  const num = Number(value)
  if (room === 'office') officeBrightness.value = num
  else basementBrightness.value = num
  callHAService('input_number', 'set_value', { entity_id: entity, value: num })
}

function toggleRoom(room: string) {
  if (room === 'office') {
    const service = officeOn.value ? 'turn_off' : 'turn_on'
    officeOn.value = !officeOn.value
    callHAService('light', service, { entity_id: 'light.above_desk' })
  } else {
    const service = basementOn.value ? 'turn_off' : 'turn_on'
    basementOn.value = !basementOn.value
    const entities = Array.from({ length: 8 }, (_, i) => `light.basement_light_${i + 1}`)
    for (const entity of entities) {
      callHAService('light', service, { entity_id: entity })
    }
  }
}

let pollInterval: number

onMounted(() => {
  fetchTodayQuote()
  fetchCathyPosts()
  fetchLightStates()
  pollInterval = setInterval(fetchLightStates, 10000)
})

onUnmounted(() => {
  clearInterval(pollInterval)
})
</script>

<style scoped>
.family-main {
  padding: var(--wh-space-5) var(--wh-space-4);
  background: var(--wh-cream);
  min-height: calc(100vh - 80px);
}

.family-container {
  max-width: 720px;
  margin: 0 auto;
}

/* Welcome */
.welcome-section {
  text-align: center;
  margin-bottom: var(--wh-space-5);
}

.welcome-date {
  font-family: var(--wh-font-sans);
  font-size: var(--wh-text-sm);
  color: var(--wh-gray);
  margin: var(--wh-space-1) 0 0 0;
}

.greeting-text {
  border: none !important;
  font-family: var(--wh-font-display) !important;
  font-style: italic;
  opacity: 0.8;
  cursor: default;
}

/* Feature Cards */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--wh-space-4);
  margin-bottom: var(--wh-space-6);
}

.feature-card {
  display: flex;
  align-items: center;
  gap: var(--wh-space-4);
  padding: var(--wh-space-5);
  text-decoration: none;
  color: var(--wh-black);
  cursor: pointer;
  transition: all var(--wh-transition-smooth);
  min-height: 96px;
}

.feature-card:hover {
  box-shadow: var(--wh-shadow-lift);
  transform: translateY(-2px);
}

.feature-card:active {
  transform: translateY(0);
}

.card-icon {
  font-size: 2.25rem;
  flex-shrink: 0;
  line-height: 1;
}

.card-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-label {
  font-family: var(--wh-font-display);
  font-size: var(--wh-text-lg);
  font-weight: 600;
  color: var(--wh-navy-dark);
}

.card-subtitle {
  font-family: var(--wh-font-sans);
  font-size: var(--wh-text-sm);
  color: var(--wh-gray);
}

/* Almanac */
.almanac-section {
  margin-bottom: var(--wh-space-6);
}

.almanac-card {
  padding: var(--wh-space-4) var(--wh-space-5);
}

.almanac-display {
  text-align: center;
}

.almanac-quote {
  font-family: var(--wh-font-display);
  font-size: var(--wh-text-xl);
  font-style: italic;
  color: var(--wh-navy-dark);
  margin: 0 0 var(--wh-space-2) 0;
  line-height: 1.5;
}

.almanac-meta {
  font-family: var(--wh-font-sans);
  font-size: var(--wh-text-xs);
  color: var(--wh-gray);
}

.almanac-empty {
  text-align: center;
}

.almanac-placeholder {
  font-family: var(--wh-font-sans);
  font-size: var(--wh-text-sm);
  color: var(--wh-gray);
  font-style: italic;
  margin: 0;
}

/* Lights */
.lights-section {
  margin-bottom: var(--wh-space-6);
}

.lights-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--wh-space-4);
}

.light-card {
  padding: var(--wh-space-4);
}

.light-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--wh-space-3);
}

.light-name {
  font-family: var(--wh-font-display);
  font-size: var(--wh-text-base);
  font-weight: 600;
  color: var(--wh-navy-dark);
}

.light-toggle {
  padding: var(--wh-space-1) var(--wh-space-3);
  font-family: var(--wh-font-sans);
  font-size: var(--wh-text-xs);
  font-weight: 700;
  border: 2px solid var(--wh-gray-light);
  border-radius: var(--wh-radius-sm);
  background: var(--wh-white);
  color: var(--wh-gray);
  cursor: pointer;
  transition: all var(--wh-transition-fast);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  min-width: 52px;
}

.light-toggle--on {
  background: var(--wh-gold);
  border-color: var(--wh-gold-dark);
  color: var(--wh-white);
}

.light-slider-row {
  display: flex;
  align-items: center;
  gap: var(--wh-space-3);
}

.light-slider {
  flex: 1;
  accent-color: var(--wh-gold);
  cursor: pointer;
  height: 28px;
}

.light-value {
  font-family: var(--wh-font-sans);
  font-size: var(--wh-text-sm);
  color: var(--wh-gray-dark);
  min-width: 36px;
  text-align: right;
}

.light-error {
  font-family: var(--wh-font-sans);
  font-size: var(--wh-text-xs);
  color: var(--wh-error);
  text-align: center;
  margin: var(--wh-space-3) 0 0 0;
}

/* Responsive */
@media (max-width: 600px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }

  .lights-grid {
    grid-template-columns: 1fr;
  }

  .feature-card {
    min-height: 72px;
    padding: var(--wh-space-4);
  }
}

/* Cathy Comics */
.cathy-section {
  margin-bottom: var(--wh-space-6);
}

.cathy-card {
  padding: var(--wh-space-4) var(--wh-space-5);
}

/* Cathy date navigation */
.cathy-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--wh-space-3);
  margin-bottom: var(--wh-space-4);
  padding-bottom: var(--wh-space-3);
  border-bottom: 1px solid var(--wh-gray-light);
}

.cathy-nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 2px solid var(--wh-gold);
  border-radius: var(--wh-radius-sm);
  background: var(--wh-white);
  color: var(--wh-gold-dark);
  font-size: var(--wh-text-lg);
  cursor: pointer;
  transition: all var(--wh-transition-fast);
  line-height: 1;
}

.cathy-nav-btn:hover:not(:disabled) {
  background: var(--wh-gold);
  color: var(--wh-white);
}

.cathy-nav-btn:disabled {
  border-color: var(--wh-gray-light);
  color: var(--wh-gray-light);
  cursor: default;
}

.cathy-nav-date {
  font-family: var(--wh-font-display);
  font-size: var(--wh-text-base);
  font-weight: 600;
  color: var(--wh-navy-dark);
  background: none;
  border: none;
  cursor: default;
  padding: var(--wh-space-1) var(--wh-space-3);
  min-width: 140px;
  text-align: center;
}

.cathy-nav-date--past {
  cursor: pointer;
  color: var(--wh-gold-dark);
  text-decoration: underline;
  text-decoration-style: dotted;
  text-underline-offset: 3px;
}

.cathy-nav-date--past:hover {
  color: var(--wh-navy-dark);
}

.cathy-display {
  text-align: center;
}

.cathy-image-wrap {
  margin-bottom: var(--wh-space-3);
  background: var(--wh-white);
  border-radius: var(--wh-radius-sm);
  overflow: hidden;
}

.cathy-image {
  width: 100%;
  max-width: 600px;
  height: auto;
  display: block;
  margin: 0 auto;
}

.cathy-caption {
  font-family: var(--wh-font-display);
  font-size: var(--wh-text-base);
  color: var(--wh-navy-dark);
  margin: 0 0 var(--wh-space-2) 0;
  font-weight: 600;
}

.cathy-link {
  font-family: var(--wh-font-sans);
  font-size: var(--wh-text-sm);
  color: var(--wh-gold-dark);
  text-decoration: none;
  transition: color var(--wh-transition-fast);
}

.cathy-link:hover {
  color: var(--wh-navy-dark);
  text-decoration: underline;
}

.cathy-dots {
  display: flex;
  justify-content: center;
  gap: var(--wh-space-3);
  margin-top: var(--wh-space-3);
}

.cathy-dot {
  display: flex;
  align-items: center;
  gap: var(--wh-space-1);
  padding: var(--wh-space-1) var(--wh-space-2);
  border: 2px solid var(--wh-gray-light);
  border-radius: 999px;
  background: var(--wh-white);
  cursor: pointer;
  transition: all var(--wh-transition-fast);
  font-size: 0;
}

.cathy-dot::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--wh-gray-light);
  transition: background var(--wh-transition-fast);
}

.cathy-dot--active {
  border-color: var(--wh-gold);
  background: var(--wh-cream);
}

.cathy-dot--active::before {
  background: var(--wh-gold);
}

.cathy-dot-label {
  font-family: var(--wh-font-sans);
  font-size: var(--wh-text-xs);
  color: var(--wh-gray);
}

.cathy-dot--active .cathy-dot-label {
  color: var(--wh-navy-dark);
  font-weight: 600;
}

.cathy-empty {
  text-align: center;
}

.cathy-placeholder {
  font-family: var(--wh-font-sans);
  font-size: var(--wh-text-sm);
  color: var(--wh-gray);
  font-style: italic;
  margin: 0;
}
</style>
