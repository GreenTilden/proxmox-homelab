<template>
  <SeasonalThemeProvider
    :enable-scanlines="enableScanlines"
    :enable-particles="enableParticles"
    :enable-animations="true"
  >
    <div :style="appStyles">
      <!-- Main Header -->
      <header :style="headerStyles">
        <h1 class="nes-text is-primary" :style="titleStyles">
          <img src="/qca.png" alt="QCA" :style="logoImageStyles" /> LCiBot Dashboard
        </h1>
      </header>

      <!-- Dashboard Content -->
      <main :style="mainStyles">
        <!-- Real Service Cards -->
        <div :style="gridStyles">
          <!-- Calendar Card (only in retro theme) -->
          <div v-if="currentConfig.features.calendarIntegration === 'card'" class="nes-container with-title is-dark" :style="calendarCardStyles">
            <p class="title">📅 Calendar</p>
            <CalendarWidget placement="card" />
          </div>

          <!-- Upcoming Events Card -->
          <UpcomingEventsCard />

          <ServiceCard
            v-for="service in services"
            :key="service.id"
            :service="service"
            :elevation="'medium'"
            :border-style="'gradient'"
            :glow-effect="true"
            @refresh="handleRefreshService"
            @open="openService"
          />
        </div>

        <!-- Theme Controls -->
        <div :style="controlsStyles">
          <button
            class="nes-btn is-warning"
            @click="toggleScanlines"
            :style="controlButtonStyles"
          >
            {{ enableScanlines ? '📺 Disable' : '📺 Enable' }} Scanlines
          </button>
          <button
            class="nes-btn is-success"
            @click="toggleParticles"
            :style="controlButtonStyles"
          >
            {{ enableParticles ? '❄️ Disable' : '❄️ Enable' }} Particles
          </button>
          <button
            class="nes-btn is-primary"
            @click="toggleTheme"
            :style="controlButtonStyles"
          >
            {{ getThemeIcon(currentSeason) }} {{ getThemeName(currentSeason) }}
          </button>
          <router-link to="/toolbox" class="nes-btn is-primary" :style="controlButtonStyles">
            🛠️ Toolbox
          </router-link>
          <router-link to="/file-manager" class="nes-btn is-primary" :style="controlButtonStyles">
            📁 Files
          </router-link>
          <router-link to="/weather" class="nes-btn is-warning" :style="controlButtonStyles">
            🌤️ Weather
          </router-link>
          <router-link to="/docs" class="nes-btn is-success" :style="controlButtonStyles">
            📚 Docs
          </router-link>
          <router-link to="/notes" class="nes-btn" :style="controlButtonStyles" style="background: #a371f7; color: white;">
            📝 Notes
          </router-link>
          <router-link to="/vault" class="nes-btn" :style="controlButtonStyles" style="background: #6a9fb5; color: white;">
            📚 Vault
          </router-link>
          <router-link to="/nanit" class="nes-btn" :style="controlButtonStyles" style="background: #da70d6; color: white;">
            👶 Baby Cam
          </router-link>
          <a href="http://192.168.0.99:3000" target="_blank" class="nes-btn" :style="controlButtonStyles" style="background: #68bc71; color: white;">
            🛡️ AdGuard
          </a>
          <a href="http://192.168.0.99:8087" target="_blank" class="nes-btn" :style="controlButtonStyles" style="background: #ff4444; color: white;">
            📺 yt-dlp
          </a>
          <a href="http://192.168.0.125:6080/vnc.html" target="_blank" class="nes-btn" :style="controlButtonStyles" style="background: #9333ea; color: white;" title="VNC: 192.168.0.125:6080 | User: developer | Pass: devpass123">
            🖥️ Dev Box
          </a>
          <router-link to="/ellabot" class="nes-btn" :style="controlButtonStyles" style="background: #4a9eff; color: white;">
            🤖 EllaBot
          </router-link>
        </div>
      </main>
    </div>
  </SeasonalThemeProvider>

  <!-- EllaBot Chat Widget - Outside SeasonalThemeProvider to avoid overflow clipping -->
  <EllaBotChat />
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
import SeasonalThemeProvider from '../components/themes/retro/SeasonalThemeProvider.vue'
import ServiceCard from '../components/themes/retro/ServiceCard.vue'
import CalendarWidget from '../components/core/CalendarWidget.vue'
import UpcomingEventsCard from '../components/themes/retro/UpcomingEventsCard.vue'
import EllaBotChat from '../components/ellabot/EllaBotChat.vue'
import { useServiceMonitoring } from '../composables/useServiceMonitoring'
import { useTheme } from '../composables/useTheme'
import { getCurrentConfig } from '../config/environments'

const currentConfig = getCurrentConfig()
const currentTime = ref(new Date().toLocaleTimeString())
const enableScanlines = ref(true)
const enableParticles = ref(true)

// Use real service monitoring
const {
  services,
  serviceMetrics,
  isLoading,
  refreshService,
  refreshAllServices,
  startAutoRefresh
} = useServiceMonitoring()

// Use theme system
const {
  currentSeason,
  availableThemes,
  setTheme,
  resetToAutoTheme
} = useTheme()

const currentThemeIndex = ref(0)

// Dynamic styles based on season
const appStyles = computed(() => ({
  minHeight: '100vh',
  padding: '0',
  margin: '0',
  position: 'relative' as const
}))

const headerStyles = computed(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 'var(--space-lg)',
  background: 'var(--bg-surface)',
  borderBottom: `4px solid var(--color-primary-3)`,
  borderImage: `repeating-linear-gradient(90deg, var(--color-primary-3) 0px, var(--color-primary-3) 8px, var(--color-primary-4) 8px, var(--color-primary-4) 16px) 4`,
  backdropFilter: 'blur(10px)',
  position: 'sticky' as const,
  top: '0',
  zIndex: '50',
  imageRendering: 'pixelated'
}))

const titleStyles = computed(() => ({
  fontSize: '1.75rem',
  fontWeight: '700',
  color: 'var(--text-bright)',
  margin: '0',
  textShadow: `2px 2px 4px var(--effect-shadow)`,
  filter: 'drop-shadow(0 0 8px var(--color-accent-3))',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-sm)'
}))

const logoImageStyles = computed(() => ({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  imageRendering: 'auto',
  filter: 'drop-shadow(0 0 4px var(--color-accent-3))',
  flexShrink: '0'
}))

const mainStyles = computed(() => ({
  padding: 'var(--space-lg)',
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 'var(--space-xl)'
}))

const gridStyles = computed(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: 'var(--space-xl)',
  width: '100%'
}))

const controlsStyles = computed(() => ({
  display: 'flex',
  justifyContent: 'center',
  gap: 'var(--space-md)',
  flexWrap: 'wrap' as const,
  padding: 'var(--space-lg)',
  background: 'var(--bg-card)',
  borderRadius: 'var(--radius-lg)',
  border: `1px solid var(--color-primary-2)40`
}))

const controlButtonStyles = computed(() => ({
  // Let NES.css handle all the styling
  margin: 'var(--space-xs)'
}))

const calendarCardStyles = computed(() => ({
  background: 'rgba(135, 93, 88, 0.1)',
  backdropFilter: 'blur(1px)',
  border: `4px solid var(--color-primary-3)`,
  padding: 'var(--space-lg)',
  minHeight: '200px'
}))

// Methods
const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString()
}

const handleRefreshService = async (serviceId: string) => {
  console.log(`Refreshing service: ${serviceId}`)
  await refreshService(serviceId)
  updateTime()
}

const openService = (url: string) => {
  // Special handling for qBittorrent to avoid unauthorized page
  if (url.includes('192.168.0.111:8112')) {
    // Since direct navigation in new tab works with existing session,
    // let's try the simplest approach - direct URL in new tab
    window.open('http://192.168.0.111:8112/', '_blank', 'noopener')
  } else {
    window.open(url, '_blank')
  }
}

const toggleScanlines = () => {
  enableScanlines.value = !enableScanlines.value
}

const toggleParticles = () => {
  enableParticles.value = !enableParticles.value
}

const toggleTheme = () => {
  currentThemeIndex.value = (currentThemeIndex.value + 1) % availableThemes.value.length
  const newTheme = availableThemes.value[currentThemeIndex.value]
  if (newTheme.key === currentSeason.value) {
    resetToAutoTheme()
  } else {
    setTheme(newTheme.key)
  }
}

const getThemeIcon = (season: string) => {
  switch (season) {
    case 'AUTUMN': return '🍂'
    case 'HALLOWEEN': return '🎃'
    case 'WINTER': return '❄️'
    case 'SPRING': return '🌸'
    default: return '🍂'
  }
}

const getThemeName = (season: string) => {
  switch (season) {
    case 'AUTUMN': return 'Autumn'
    case 'HALLOWEEN': return 'Halloween'
    case 'WINTER': return 'Winter'
    case 'SPRING': return 'Spring'
    default: return 'Autumn'
  }
}

onMounted(() => {
  // Update time every second
  setInterval(updateTime, 1000)

  // Start real service monitoring
  startAutoRefresh()
})
</script>

<style>
/* Import Press Start 2P font for retro theme */
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

/* Global styles - minimal since everything is props-driven */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow-x: hidden;
}

/* NES.css Refinements for Retro Theme */
:deep(.nes-container) {
  background-color: var(--bg-card) !important;
  border-color: var(--color-primary-3) !important;
  border-width: 2px !important;
  border-radius: 4px !important;
  padding: 1rem !important;
}

:deep(.nes-btn) {
  font-family: "Press Start 2P", monospace !important;
  font-size: 8px !important;
  line-height: 1.5 !important;
  border-width: 2px !important;
  border-radius: 3px !important;
  padding: 0.5rem 1rem !important;
  transition: all 0.2s ease !important;
}

:deep(.nes-btn:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

:deep(.nes-btn.is-small) {
  padding: 0.3rem 0.6rem !important;
  font-size: 7px !important;
}

:deep(.nes-text) {
  font-family: "Press Start 2P", monospace !important;
  color: var(--text-bright) !important;
}

:deep(.nes-input),
:deep(.nes-textarea),
:deep(.nes-select) {
  border-width: 2px !important;
  border-radius: 3px !important;
  padding: 0.5rem !important;
  transition: border-color 0.2s ease !important;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .grid-responsive {
    grid-template-columns: 1fr;
  }
}
</style>