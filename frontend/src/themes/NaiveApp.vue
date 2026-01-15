<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
    <!-- Dark Veil Background with Era Colors -->
    <!-- <DarkVeil /> -->

    <!-- Atmospheric Background with Era Particles -->
    <AtmosphericBackground
      v-if="currentConfig.features.atmosphericBackground"
      :particles="particleConfig"
      :background-gradient="backgroundGradient"
    />

    <n-layout style="min-height: 100vh; position: relative; z-index: 1;" class="naive-theme-root">
      <!-- Header -->
      <n-layout-header bordered style="height: 64px; padding: 0 24px;">
        <div class="header-content">
          <div class="header-title">
            <n-avatar
              :size="32"
              src="/qca.png"
              fallback-src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23666' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z'/%3E%3C/svg%3E"
            />
            <h1 class="title-text">{{ currentConfig.title }}</h1>
          </div>

          <!-- Calendar Widget for header integration -->
          <div v-if="currentConfig.features.calendarIntegration === 'header'" class="header-calendar">
            <CalendarWidget placement="header" :show-title="false" compact />
          </div>

          <!-- Taylor Swift Era Display -->
          <div class="era-display">
            <n-tag
              :bordered="false"
              :color="{ color: theme.primary.ramp2, textColor: theme.text.primary }"
              class="era-tag"
            >
              {{ currentEraInfo.name }} • {{ currentEraInfo.releaseYear }}
            </n-tag>
            <n-text depth="2" class="era-tagline" :style="{ color: theme.text.secondary }">
              {{ currentEraInfo.tagline }}
            </n-text>
          </div>

          <!-- Calendar Navigation Button -->
          <n-button
            quaternary
            circle
            @click="$router.push('/calendar')"
          >
            <template #icon>
              <span style="font-size: 20px;">📅</span>
            </template>
          </n-button>
          <n-button
            quaternary
            circle
            @click="$router.push('/toolbox')"
          >
            <template #icon>
              <span style="font-size: 20px;">🛠️</span>
            </template>
          </n-button>
          <n-button
            quaternary
            circle
            @click="$router.push('/file-manager')"
          >
            <template #icon>
              <span style="font-size: 20px;">📁</span>
            </template>
          </n-button>
          <n-button
            quaternary
            circle
            @click="$router.push('/ellabot')"
          >
            <template #icon>
              <span style="font-size: 20px;">🤖</span>
            </template>
          </n-button>
        </div>
      </n-layout-header>

      <!-- Main Content -->
      <n-layout-content style="padding: 24px; overflow: visible;">
        <div class="dashboard-container">
          <!-- Service Cards Grid -->
          <n-grid cols="1 s:1 m:2 l:3 xl:4" responsive="screen" :x-gap="24" :y-gap="24" style="padding-top: 12px;">
            <n-grid-item v-for="service in services" :key="service.id">
              <ServiceCard
                :service="service"
                :elevation="'medium'"
                @refresh="handleRefreshService"
                @open="openService"
              />
            </n-grid-item>
          </n-grid>

          <!-- System Metrics Summary -->
          <n-card title="System Overview" class="metrics-card" style="margin-top: 24px;">
            <n-grid cols="2 s:2 m:4" responsive="screen" :x-gap="16" :y-gap="16">
              <n-grid-item>
                <n-statistic label="Total Services" :value="serviceMetrics.totalServices" />
              </n-grid-item>
              <n-grid-item>
                <n-statistic label="Online" :value="serviceMetrics.onlineServices" />
              </n-grid-item>
              <n-grid-item>
                <n-statistic label="Health" :value="`${serviceMetrics.healthyPercentage.toFixed(0)}%`" />
              </n-grid-item>
              <n-grid-item>
                <n-statistic label="Last Check" :value="lastUpdateFormatted" />
              </n-grid-item>
            </n-grid>
          </n-card>
        </div>
      </n-layout-content>

      <!-- Footer -->
      <n-layout-footer bordered style="height: 48px; padding: 0 24px;">
        <div class="footer-content">
          <n-space>
            <n-text depth="3" style="font-size: 12px;">
              Last updated: {{ currentTime }}
            </n-text>
            <n-divider vertical />
            <n-button
              quaternary
              size="tiny"
              @click="refreshAllServices"
              :loading="isRefreshing"
            >
              Refresh All
            </n-button>
          </n-space>
        </div>
      </n-layout-footer>
    </n-layout>
  </n-config-provider>

  <!-- EllaBot Chat Widget - Outside config provider for proper fixed positioning -->
  <EllaBotChat />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  NConfigProvider,
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NLayoutFooter,
  NGrid,
  NGridItem,
  NCard,
  NButton,
  NText,
  NSpace,
  NDivider,
  NStatistic,
  NAvatar,
  NTag,
  darkTheme
} from 'naive-ui'
import ServiceCard from '../components/themes/retro/ServiceCard.vue'
import CalendarWidget from '../components/core/CalendarWidget.vue'
import AtmosphericBackground from '../components/themes/retro/AtmosphericBackground.vue'
import EllaBotChat from '../components/ellabot/EllaBotChat.vue'
// import DarkVeil from '../components/themes/naive/DarkVeil.vue'
import { useServiceMonitoring } from '../composables/useServiceMonitoring'
import { useTheme } from '../composables/useTheme'
import { getCurrentConfig } from '../config/environments'
import { TAYLOR_SWIFT_PALETTES, getCurrentEra } from '../themes/taylor-swift-palette'

const currentConfig = getCurrentConfig()
const currentTime = ref(new Date().toLocaleTimeString())
const currentDate = ref(new Date().toLocaleDateString())

// Use real service monitoring
const {
  services,
  serviceMetrics,
  isLoading,
  refreshService,
  refreshAllServices,
  startAutoRefresh,
  isRefreshing
} = useServiceMonitoring()

// Get Taylor Swift theme
const { theme, currentSeason, createGradient } = useTheme()

// Get current era palette info (👈 CUSTOMIZE TAGLINES in taylor-swift-palette.ts!)
const currentEraInfo = computed(() => {
  return TAYLOR_SWIFT_PALETTES[getCurrentEra()]
})

// Naive UI theme overrides with Taylor Swift era colors
const themeOverrides = computed(() => ({
  common: {
    primaryColor: theme.value.primary.ramp4,
    primaryColorHover: theme.value.primary.ramp5,
    primaryColorPressed: theme.value.primary.ramp3,
    infoColor: theme.value.status.info,
    infoColorHover: theme.value.primary.ramp5,
    infoColorPressed: theme.value.primary.ramp3,
    successColor: theme.value.status.success,
    warningColor: theme.value.status.warning,
    errorColor: theme.value.status.error,
    borderColor: theme.value.primary.ramp2,
    cardColor: theme.value.backgrounds.card,
    modalColor: theme.value.backgrounds.elevated,
    bodyColor: theme.value.backgrounds.app
  },
  Card: {
    borderRadius: '8px',
    paddingMedium: '16px 20px',
    color: theme.value.backgrounds.card,
    colorModal: theme.value.backgrounds.elevated,
    borderColor: theme.value.primary.ramp2
  }
}))

// Background gradient for atmospheric effect
const backgroundGradient = computed(() => {
  const colors = [
    theme.value.backgrounds.app,
    theme.value.backgrounds.surface
  ]
  return createGradient('135deg', colors, 1.0)
})

// Particle configuration based on current era
const particleConfig = computed(() => ({
  count: theme.value.particles.count,
  type: getParticleTypeForEra(currentSeason.value),
  colors: theme.value.particles.colors,
  physics: theme.value.particles.physics,
  size: theme.value.particles.size
}))

// Map era to particle type
const getParticleTypeForEra = (era: string) => {
  // For now, return 'leaves' - will be enhanced with more types
  return 'leaves'
}

// Computed values
const lastUpdateFormatted = computed(() => {
  if (!serviceMetrics.value.lastUpdateTime) return 'Never'
  const diff = Date.now() - serviceMetrics.value.lastUpdateTime.getTime()
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  return `${Math.floor(diff / 3600000)}h ago`
})

// Methods
const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString()
  currentDate.value = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

const handleRefreshService = async (serviceId: string) => {
  console.log(`Refreshing service: ${serviceId}`)
  await refreshService(serviceId)
  updateTime()
}

const openService = (url: string) => {
  // Special handling for qBittorrent to avoid unauthorized page
  if (url.includes('192.168.0.111:8112')) {
    window.open('http://192.168.0.111:8112/', '_blank', 'noopener')
  } else {
    window.open(url, '_blank')
  }
}

onMounted(() => {
  // Update time every second
  setInterval(updateTime, 1000)

  // Start real service monitoring
  startAutoRefresh()
})
</script>

<style scoped>
.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-text {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color-1);
}

.header-calendar {
  display: flex;
  align-items: center;
}

/* Era Display with Animations */
.era-display {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  margin-left: auto;
  margin-right: 12px;
  animation: fadeInSlide 0.6s ease-out;
}

.era-tag {
  animation: pulseGlow 3s ease-in-out infinite;
  transition: transform 0.3s ease;
}

.era-tag:hover {
  transform: scale(1.05);
}

.era-tagline {
  font-size: 0.75rem;
  font-style: italic;
  opacity: 0.8;
  animation: fadeIn 1s ease-out 0.3s both;
}

/* Card Fade-in Animation with Stagger */
:global(.n-grid-item) {
  animation: fadeInUp 0.5s ease-out backwards;
}

:global(.n-grid-item:nth-child(1)) { animation-delay: 0.1s; }
:global(.n-grid-item:nth-child(2)) { animation-delay: 0.2s; }
:global(.n-grid-item:nth-child(3)) { animation-delay: 0.3s; }
:global(.n-grid-item:nth-child(4)) { animation-delay: 0.4s; }
:global(.n-grid-item:nth-child(5)) { animation-delay: 0.5s; }
:global(.n-grid-item:nth-child(6)) { animation-delay: 0.6s; }
:global(.n-grid-item:nth-child(7)) { animation-delay: 0.7s; }
:global(.n-grid-item:nth-child(8)) { animation-delay: 0.8s; }

/* Keyframe Animations */
@keyframes pulseGlow {
  0%, 100% {
    filter: drop-shadow(0 0 4px var(--n-color));
    opacity: 1;
  }
  50% {
    filter: drop-shadow(0 0 12px var(--n-color));
    opacity: 0.9;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.8;
  }
}

@keyframes fadeInSlide {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.metrics-card {
  background: rgba(255, 255, 255, 0.02);
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

/* Dark theme enhancements */
:global(.n-layout) {
  background-color: #101014;
}

:global(.n-layout-header) {
  background-color: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(8px);
}

:global(.n-layout-footer) {
  background-color: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(8px);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .header-title {
    gap: 8px;
  }

  .title-text {
    font-size: 1.1rem;
  }

  .header-calendar {
    display: none;
  }

  :global(.n-layout-content) {
    padding: 16px !important;
  }
}

@media (max-width: 480px) {
  .title-text {
    font-size: 1rem;
  }

  .dashboard-container {
    padding: 0;
  }
}

/* Prevent NES.css font leakage in Naive theme */
:global(.naive-theme-root *),
:global(.naive-theme-root),
:global(.naive-theme-root) * {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif !important;
}

/* Override any NES classes that might leak */
:global(.naive-theme-root .nes-text),
:global(.naive-theme-root .nes-btn),
:global(.naive-theme-root .nes-container) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif !important;
  font-size: inherit !important;
}
</style>