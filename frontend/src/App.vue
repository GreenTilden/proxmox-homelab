<template>
  <SeasonalThemeProvider
    :enable-scanlines="enableScanlines"
    :enable-particles="enableParticles"
    :enable-animations="true"
  >
    <div :style="appStyles">
      <!-- Main Header -->
      <header :style="headerStyles">
        <h1 class="nes-text is-primary" :style="titleStyles">🍂 LCiBot Dashboard</h1>
      </header>

      <!-- Dashboard Content -->
      <main :style="mainStyles">
        <!-- Real Service Cards -->
        <div :style="gridStyles">
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
        </div>
      </main>
    </div>
  </SeasonalThemeProvider>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
import SeasonalThemeProvider from './components/theme/SeasonalThemeProvider.vue'
import ServiceCard from './components/theme/ServiceCard.vue'
import { useServiceMonitoring } from './composables/useServiceMonitoring'

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
  filter: 'drop-shadow(0 0 8px var(--color-accent-3))'
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
  gap: 'var(--space-lg)',
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

const forceSeasonToggle = () => {
  forcedSeason.value = forcedSeason.value === 'forest' ? 'christmas' : 'forest'
}

onMounted(() => {
  // Update time every second
  setInterval(updateTime, 1000)

  // Start real service monitoring
  startAutoRefresh()
})
</script>

<style>
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

/* Mobile responsiveness */
@media (max-width: 768px) {
  .grid-responsive {
    grid-template-columns: 1fr;
  }
}
</style>