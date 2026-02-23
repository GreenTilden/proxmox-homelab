<template>
  <div class="nes-container with-title is-dark" :style="containerStyles">
    <p class="title">💡 Lights</p>

    <!-- Office Room -->
    <div :style="roomStyles">
      <div :style="roomHeaderStyles">
        <span class="nes-text" :style="roomNameStyles">Office</span>
        <div :style="roomControlsStyles">
          <span :style="brightnessLabelStyles">{{ officeBrightness }}%</span>
          <button
            class="nes-btn is-small"
            :class="officeOn ? 'is-warning' : ''"
            @click="toggleRoom('office')"
            :style="toggleBtnStyles"
          >{{ officeOn ? 'ON' : 'OFF' }}</button>
        </div>
      </div>
      <div :style="sliderRowStyles">
        <input
          type="range"
          min="0"
          max="100"
          :value="officeBrightness"
          @input="setBrightness('office', ($event.target as HTMLInputElement).value)"
          :style="sliderStyles"
        />
      </div>
      <div :style="toggleRowStyles">
        <label :style="toggleLabelStyles">
          <input
            type="checkbox"
            class="nes-checkbox is-dark"
            :checked="weatherAmbient"
            @change="toggleBoolean('input_boolean.weather_ambient_lighting')"
          />
          <span>Weather Ambient</span>
        </label>
      </div>
    </div>

    <!-- Basement Room -->
    <div :style="roomStyles">
      <div :style="roomHeaderStyles">
        <span class="nes-text" :style="roomNameStyles">Basement</span>
        <div :style="roomControlsStyles">
          <span :style="brightnessLabelStyles">{{ basementBrightness }}%</span>
          <button
            class="nes-btn is-small"
            :class="basementOn ? 'is-warning' : ''"
            @click="toggleRoom('basement')"
            :style="toggleBtnStyles"
          >{{ basementOn ? 'ON' : 'OFF' }}</button>
        </div>
      </div>
      <div :style="sliderRowStyles">
        <input
          type="range"
          min="0"
          max="100"
          :value="basementBrightness"
          @input="setBrightness('basement', ($event.target as HTMLInputElement).value)"
          :style="sliderStyles"
        />
      </div>
      <div :style="toggleRowStyles">
        <label :style="toggleLabelStyles">
          <input
            type="checkbox"
            class="nes-checkbox is-dark"
            :checked="underwaterMode"
            @change="toggleBoolean('input_boolean.underwater_mode')"
          />
          <span>Underwater Mode</span>
        </label>
        <label :style="toggleLabelStyles">
          <input
            type="checkbox"
            class="nes-checkbox is-dark"
            :checked="weatherAmbient"
            @change="toggleBoolean('input_boolean.weather_ambient_lighting')"
          />
          <span>Weather Ambient</span>
        </label>
      </div>
    </div>

    <div v-if="error" :style="errorStyles">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const API_BASE = '/cmd-api/ha'

const officeBrightness = ref(0)
const basementBrightness = ref(0)
const officeOn = ref(false)
const basementOn = ref(false)
const underwaterMode = ref(false)
const weatherAmbient = ref(false)
const error = ref('')

const headers: Record<string, string> = {
  'Content-Type': 'application/json'
}

async function fetchStates() {
  try {
    const res = await fetch(`${API_BASE}/states`, { headers })
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
        case 'input_boolean.underwater_mode':
          underwaterMode.value = s.state === 'on'
          break
        case 'input_boolean.weather_ambient_lighting':
          weatherAmbient.value = s.state === 'on'
          break
        case 'light.above_desk':
          officeOn.value = s.state === 'on'
          break
        case 'light.basement_light_1':
          basementOn.value = s.state === 'on'
          break
      }
    }
    error.value = ''
  } catch (e: any) {
    error.value = 'HA connection failed'
  }
}

async function callService(domain: string, service: string, data: Record<string, any>) {
  try {
    await fetch(`${API_BASE}/services/${domain}/${service}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    })
    setTimeout(fetchStates, 500)
  } catch {
    error.value = 'Failed to call HA service'
  }
}

function setBrightness(room: string, value: string) {
  const entity = room === 'office'
    ? 'input_number.office_brightness'
    : 'input_number.basement_brightness'
  const num = Number(value)
  if (room === 'office') officeBrightness.value = num
  else basementBrightness.value = num
  callService('input_number', 'set_value', { entity_id: entity, value: num })
}

function toggleRoom(room: string) {
  if (room === 'office') {
    const service = officeOn.value ? 'turn_off' : 'turn_on'
    officeOn.value = !officeOn.value
    callService('light', service, { entity_id: 'light.above_desk' })
  } else {
    const service = basementOn.value ? 'turn_off' : 'turn_on'
    basementOn.value = !basementOn.value
    // Toggle all basement lights
    const entities = Array.from({ length: 8 }, (_, i) => `light.basement_light_${i + 1}`)
    for (const entity of entities) {
      callService('light', service, { entity_id: entity })
    }
  }
}

function toggleBoolean(entityId: string) {
  const isOn = entityId.includes('underwater') ? underwaterMode.value : weatherAmbient.value
  const service = isOn ? 'turn_off' : 'turn_on'
  if (entityId.includes('underwater')) underwaterMode.value = !underwaterMode.value
  else weatherAmbient.value = !weatherAmbient.value
  callService('input_boolean', service, { entity_id: entityId })
}

let pollInterval: number

onMounted(() => {
  fetchStates()
  pollInterval = setInterval(fetchStates, 5000)
})

onUnmounted(() => {
  clearInterval(pollInterval)
})

// Styles
const containerStyles = computed(() => ({
  background: 'var(--bg-card)',
  border: '4px solid var(--color-primary-3)',
  padding: 'var(--space-lg)',
}))

const roomStyles = computed(() => ({
  marginBottom: 'var(--space-md)',
  padding: 'var(--space-sm) var(--space-md)',
  background: 'rgba(255,255,255,0.03)',
  borderRadius: '4px',
  border: '2px solid var(--color-primary-2)',
}))

const roomHeaderStyles = computed(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 'var(--space-sm)',
}))

const roomNameStyles = computed(() => ({
  fontSize: '0.7rem',
}))

const roomControlsStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-sm)',
}))

const brightnessLabelStyles = computed(() => ({
  fontFamily: 'monospace',
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  minWidth: '36px',
  textAlign: 'right' as const,
}))

const toggleBtnStyles = computed(() => ({
  minWidth: '40px',
}))

const sliderRowStyles = computed(() => ({
  padding: '0 var(--space-xs)',
  marginBottom: 'var(--space-sm)',
}))

const sliderStyles = computed(() => ({
  width: '100%',
  accentColor: 'var(--color-accent-3)',
  cursor: 'pointer',
}))

const toggleRowStyles = computed(() => ({
  display: 'flex',
  gap: 'var(--space-md)',
  flexWrap: 'wrap' as const,
  fontSize: '0.65rem',
}))

const toggleLabelStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  fontFamily: '"Press Start 2P", monospace',
  fontSize: '0.55rem',
}))

const errorStyles = computed(() => ({
  color: '#ff4444',
  fontSize: '0.6rem',
  fontFamily: '"Press Start 2P", monospace',
  marginTop: 'var(--space-sm)',
  textAlign: 'center' as const,
}))
</script>
