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
        <div :style="headerActionsStyles">
          <span :style="timeStyles">{{ currentTime }}</span>
        </div>
      </header>

      <!-- Dashboard Content -->
      <main :style="mainStyles">
        <!-- System Metrics Bar -->
        <section :style="metricsBarStyles">
          <CompactMetricCard
            label="CPU"
            :value="systemMetrics.cpu"
            :thresholds="{ warning: 70, critical: 90 }"
            mode="gauge"
            :compact="true"
          />
          <CompactMetricCard
            label="Memory"
            :value="systemMetrics.memory"
            :thresholds="{ warning: 75, critical: 90 }"
            mode="gauge"
            :compact="true"
          />
          <CompactMetricCard
            v-if="!isMobile"
            label="Disk"
            :value="systemMetrics.disk"
            :thresholds="{ warning: 80, critical: 95 }"
            mode="gauge"
            :compact="true"
          />
          <CompactMetricCard
            v-if="!isMobile"
            label="Load"
            :value="systemMetrics.load"
            :max="8"
            unit=""
            mode="bar"
            :thresholds="{ warning: 4, critical: 6 }"
            :compact="true"
          />
        </section>

        <!-- Services Section Header -->
        <div :style="sectionHeaderStyles">
          <h2 class="nes-text" :style="sectionTitleStyles">Services</h2>
          <span :style="sectionSubtitleStyles">{{ onlineCount }}/{{ services.length }} online</span>
        </div>

        <!-- Compact Service Cards Grid -->
        <div :style="servicesGridStyles">
          <CompactServiceCard
            v-for="service in services"
            :key="service.id"
            :service="service"
            :sparkline-data="getServiceSparkline(service.id)"
            @refresh="handleRefreshService"
            @open="openService"
            @click="handleServiceClick"
          />
        </div>

        <!-- Calendar, Events & Lights Row -->
        <div :style="calendarEventsRowStyles">
          <!-- Calendar Card -->
          <div v-if="currentConfig.features.calendarIntegration === 'card'" class="nes-container with-title is-dark" :style="calendarCardStyles">
            <p class="title">📅 Calendar</p>
            <CalendarWidget placement="card" />
          </div>

          <!-- Upcoming Events Card -->
          <UpcomingEventsCard :style="eventsCardStyles" />

          <!-- Light Controls -->
          <LightControls />

          <!-- Oliver's Almanac -->
          <div class="nes-container with-title is-dark" :style="oliverCardStyles">
            <p class="title">📒 Oliver's Almanac</p>
            <OliverQuoteWidget theme="retro" />
          </div>
        </div>

        <!-- Navigation Links with Emoji -->
        <div :style="controlsStyles">
          <button
            class="nes-btn is-warning"
            @click="toggleScanlines"
            :style="controlButtonStyles"
          >
            {{ enableScanlines ? 'Disable' : 'Enable' }} Scanlines
          </button>
          <button
            class="nes-btn is-success"
            @click="toggleParticles"
            :style="controlButtonStyles"
          >
            {{ enableParticles ? 'Disable' : 'Enable' }} Particles
          </button>
          <button
            class="nes-btn is-primary"
            @click="toggleTheme"
            :style="controlButtonStyles"
          >
            {{ getThemeIcon(currentSeason) }} {{ getThemeName(currentSeason) }}
          </button>
          <router-link to="/file-manager" class="nes-btn is-primary" :style="controlButtonStyles">
            <span class="nav-emoji">📁</span> File Manager
          </router-link>
          <router-link to="/weather" class="nes-btn is-warning" :style="controlButtonStyles">
            <span class="nav-emoji">🌤️</span> Weather
          </router-link>
          <router-link to="/docs" class="nes-btn is-success" :style="controlButtonStyles">
            <span class="nav-emoji">📚</span> Docs
          </router-link>
          <router-link to="/vault" class="nes-btn" :style="controlButtonStyles" style="background: #6a9fb5; color: white;">
            <span class="nav-emoji">🔐</span> Vault
          </router-link>
          <router-link to="/nanit" class="nes-btn" :style="controlButtonStyles" style="background: #da70d6; color: white;">
            <span class="nav-emoji">👶</span> Baby Cam
          </router-link>
          <a href="http://192.168.0.99:8083" target="_blank" class="nes-btn" :style="controlButtonStyles" style="background: #68bc71; color: white;">
            <span class="nav-emoji">🛡️</span> AdGuard
          </a>
          <a href="http://192.168.0.99:8087" target="_blank" class="nes-btn" :style="controlButtonStyles" style="background: #ff4444; color: white;">
            <span class="nav-emoji">📹</span> yt-dlp
          </a>
          <a href="http://192.168.0.131:8080" target="_blank" class="nes-btn" :style="controlButtonStyles" style="background: #f78c6c; color: white;">
            <span class="nav-emoji">📰</span> FreshRSS
          </a>
          <router-link to="/freezer-meals" class="nes-btn" :style="controlButtonStyles" style="background: #e8a838; color: white;">
            <span class="nav-emoji">🧊</span> Freezer Meals
          </router-link>
<router-link to="/ellabot" class="nes-btn" :style="controlButtonStyles" style="background: #4a9eff; color: white;">
            <span class="nav-emoji">🤖</span> EllaBot
          </router-link>
          <router-link to="/health" class="nes-btn" :style="controlButtonStyles" style="background: #22c55e; color: white;">
            <span class="nav-emoji">🏋️</span> Health
          </router-link>
          <router-link to="/ops" class="nes-btn" :style="controlButtonStyles" style="background: #4a6741; color: white;">
            <span class="nav-emoji">🎯</span> Ops Center
          </router-link>
        </div>
      </main>

      <!-- Service Detail Modal -->
      <ServiceDetailModal
        :visible="!!selectedService"
        :service="selectedService"
        :metrics-history="selectedServiceHistory"
        @close="selectedService = null"
        @refresh="handleRefreshService"
        @open="openService"
      />
    </div>
  </SeasonalThemeProvider>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import SeasonalThemeProvider from '../components/themes/retro/SeasonalThemeProvider.vue'
import CalendarWidget from '../components/core/CalendarWidget.vue'
import UpcomingEventsCard from '../components/themes/retro/UpcomingEventsCard.vue'
import CompactServiceCard from '../components/dashboard/CompactServiceCard.vue'
import CompactMetricCard from '../components/dashboard/CompactMetricCard.vue'
import ServiceDetailModal from '../components/monitoring/ServiceDetailModal.vue'
import LightControls from '../components/dashboard/LightControls.vue'
import OliverQuoteWidget from '../components/dashboard/OliverQuoteWidget.vue'
import { useServiceMonitoring, type ServiceStatus } from '../composables/useServiceMonitoring'
import { useTheme } from '../composables/useTheme'
import { getCurrentConfig } from '../config/environments'

const currentConfig = getCurrentConfig()
const currentTime = ref(new Date().toLocaleTimeString())
const enableScanlines = ref(true)
const enableParticles = ref(true)
const isMobile = ref(false)
const selectedService = ref<ServiceStatus | null>(null)
const selectedServiceHistory = ref<number[]>([])

// Mock sparkline data (in production, this would come from historical metrics)
const sparklineData = ref<Map<string, number[]>>(new Map())

// System metrics (mock data - would come from node-exporter in production)
const systemMetrics = ref({
  cpu: 45,
  memory: 62,
  disk: 38,
  load: 2.4
})

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

const onlineCount = computed(() =>
  services.value.filter(s => s.status === 'online').length
)

const getServiceSparkline = (serviceId: string) => {
  // Generate mock sparkline data
  if (!sparklineData.value.has(serviceId)) {
    const data = Array.from({ length: 20 }, () => Math.random() * 100 + 50)
    sparklineData.value.set(serviceId, data)
  }
  return sparklineData.value.get(serviceId) || []
}

const handleServiceClick = (service: ServiceStatus) => {
  selectedService.value = service
  selectedServiceHistory.value = getServiceSparkline(service.id)
}

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
  borderBottom: '4px solid var(--color-primary-3)',
  borderImage: 'repeating-linear-gradient(90deg, var(--color-primary-3) 0px, var(--color-primary-3) 8px, var(--color-primary-4) 8px, var(--color-primary-4) 16px) 4',
  backdropFilter: 'blur(10px)',
  position: 'sticky' as const,
  top: '0',
  zIndex: '50',
  imageRendering: 'pixelated'
}))

const titleStyles = computed(() => ({
  fontSize: isMobile.value ? '1rem' : '1.75rem',
  fontWeight: '700',
  color: 'var(--text-bright)',
  margin: '0',
  textShadow: '2px 2px 4px var(--effect-shadow)',
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

const headerActionsStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-md)'
}))

const timeStyles = computed(() => ({
  fontFamily: 'monospace',
  fontSize: '0.9rem',
  color: 'var(--text-muted)'
}))

const mainStyles = computed(() => ({
  padding: isMobile.value ? 'var(--space-md)' : 'var(--space-lg)',
  maxWidth: '1400px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 'var(--space-lg)'
}))

const metricsBarStyles = computed(() => ({
  display: 'grid',
  gridTemplateColumns: isMobile.value ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
  gap: 'var(--space-md)'
}))

const sectionHeaderStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
}))

const sectionTitleStyles = computed(() => ({
  fontSize: '1rem',
  fontWeight: '600',
  color: 'var(--text-bright)',
  margin: '0'
}))

const sectionSubtitleStyles = computed(() => ({
  fontSize: '0.75rem',
  color: 'var(--text-muted)'
}))

const servicesGridStyles = computed(() => ({
  display: 'grid',
  gridTemplateColumns: isMobile.value ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: 'var(--space-md)'
}))

// Calendar & Events combined row styles
const calendarEventsRowStyles = computed(() => ({
  display: 'grid',
  gridTemplateColumns: isMobile.value ? '1fr' : '1fr 2fr 1fr 1fr',
  gap: 'var(--space-lg)',
  alignItems: 'stretch'
}))

const calendarCardStyles = computed(() => ({
  background: 'rgba(135, 93, 88, 0.1)',
  backdropFilter: 'blur(1px)',
  border: '4px solid var(--color-primary-3)',
  padding: 'var(--space-lg)',
  minHeight: '200px',
  height: '100%'
}))

const eventsCardStyles = computed(() => ({
  height: '100%'
}))

const oliverCardStyles = computed(() => ({
  background: 'rgba(135, 93, 88, 0.1)',
  backdropFilter: 'blur(1px)',
  border: '4px solid var(--color-primary-3)',
  padding: 'var(--space-lg)',
  height: '100%'
}))

const controlsStyles = computed(() => ({
  display: 'flex',
  justifyContent: 'center',
  gap: 'var(--space-md)',
  flexWrap: 'wrap' as const,
  padding: 'var(--space-lg)',
  background: 'var(--bg-card)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-primary-2)40'
}))

const controlButtonStyles = computed(() => ({
  margin: 'var(--space-xs)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px'
}))

// Methods
const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString()
}

const handleRefreshService = async (serviceId: string) => {
  console.log('Refreshing service:', serviceId)
  await refreshService(serviceId)
  updateTime()
}

const openService = (url: string) => {
  if (url.includes('192.168.0.111:8112')) {
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

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

// Simulate system metrics updates
const updateSystemMetrics = () => {
  systemMetrics.value = {
    cpu: Math.min(100, Math.max(10, systemMetrics.value.cpu + (Math.random() - 0.5) * 10)),
    memory: Math.min(100, Math.max(20, systemMetrics.value.memory + (Math.random() - 0.5) * 5)),
    disk: Math.min(100, Math.max(10, systemMetrics.value.disk + (Math.random() - 0.5) * 2)),
    load: Math.min(8, Math.max(0.5, systemMetrics.value.load + (Math.random() - 0.5) * 0.5))
  }
}

let timeInterval: number
let metricsInterval: number

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  timeInterval = setInterval(updateTime, 1000)
  metricsInterval = setInterval(updateSystemMetrics, 5000)
  startAutoRefresh()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  clearInterval(timeInterval)
  clearInterval(metricsInterval)
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow-x: hidden;
}

/* Navigation emoji styling */
.nav-emoji {
  font-size: 1.1em;
  line-height: 1;
  filter: contrast(1.05);
}

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

:deep(.nes-btn:hover .nav-emoji) {
  transform: scale(1.2);
  display: inline-block;
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

@media (max-width: 768px) {
  .grid-responsive {
    grid-template-columns: 1fr;
  }
}
</style>
