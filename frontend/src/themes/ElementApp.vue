<template>
  <el-config-provider :theme="elementTheme">
    <!-- Atmospheric Background with Autumn Colors -->
    <AtmosphericBackground
      :particles="particleConfig"
      :background-gradient="backgroundGradient"
      :enable-particles="true"
    />

    <!-- Optional Scanline Effect -->
    <ScanlineOverlay
      v-if="enableScanlines"
      :opacity="0.05"
      :color="scanlineColor"
    />

    <div class="element-app" :style="appStyles">
      <!-- Header -->
      <el-header class="app-header">
        <div class="header-content">
          <div class="header-title">
            <el-avatar
              :size="40"
              src="/qca.png"
            />
            <h1 class="title-text">{{ currentConfig.title }}</h1>
          </div>

          <div class="header-actions">
            <el-text class="current-time">{{ currentTime }}</el-text>
            <router-link to="/file-manager">
              <el-button type="primary" circle>
                <span style="font-size: 20px;">📁</span>
              </el-button>
            </router-link>
            <router-link to="/ellabot">
              <el-button type="primary" circle>
                <span style="font-size: 20px;">🤖</span>
              </el-button>
            </router-link>
          </div>
        </div>
      </el-header>

      <!-- Main Content -->
      <el-main class="app-main">
        <div class="dashboard-container">
          <!-- Service Cards Grid -->
          <el-row :gutter="24">
            <el-col
              v-for="service in services"
              :key="service.id"
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
              class="service-col"
            >
              <ServiceCard
                :service="service"
                @refresh="handleRefreshService"
                @open="openService"
              />
            </el-col>
          </el-row>

          <!-- System Overview Card -->
          <el-card class="metrics-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>System Overview</span>
              </div>
            </template>

            <el-row :gutter="16">
              <el-col :xs="12" :sm="6">
                <el-statistic title="Total Services" :value="serviceMetrics.totalServices" />
              </el-col>
              <el-col :xs="12" :sm="6">
                <el-statistic title="Online" :value="serviceMetrics.onlineServices">
                  <template #suffix>
                    <el-icon style="vertical-align: -0.125em">
                      <CircleCheck />
                    </el-icon>
                  </template>
                </el-statistic>
              </el-col>
              <el-col :xs="12" :sm="6">
                <el-statistic
                  title="Health"
                  :value="serviceMetrics.healthyPercentage"
                  :precision="0"
                  suffix="%"
                />
              </el-col>
              <el-col :xs="12" :sm="6">
                <div class="last-update">
                  <div class="stat-title">Last Check</div>
                  <div class="stat-value">{{ lastUpdateFormatted }}</div>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </div>
      </el-main>

      <!-- Footer -->
      <el-footer class="app-footer">
        <div class="footer-content">
          <el-text size="small" type="info">
            Last updated: {{ currentTime }}
          </el-text>

          <el-button
            type="primary"
            size="small"
            :loading="isRefreshing"
            @click="refreshAllServices"
          >
            Refresh All
          </el-button>
        </div>
      </el-footer>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  ElConfigProvider,
  ElHeader,
  ElMain,
  ElFooter,
  ElRow,
  ElCol,
  ElCard,
  ElButton,
  ElText,
  ElAvatar,
  ElStatistic,
  ElIcon
} from 'element-plus'
import { CircleCheck } from '@element-plus/icons-vue'
import AtmosphericBackground from '../components/themes/retro/AtmosphericBackground.vue'
import ScanlineOverlay from '../components/themes/retro/ScanlineOverlay.vue'
import ServiceCard from '../components/themes/retro/ServiceCard.vue'
import { useServiceMonitoring } from '../composables/useServiceMonitoring'
import { useTheme } from '../composables/useTheme'
import { getCurrentConfig } from '../config/environments'

const currentConfig = getCurrentConfig()
const currentTime = ref(new Date().toLocaleTimeString())
const enableScanlines = ref(true)

// Get theme data for autumn colors
const { theme, createGradient } = useTheme()

// Use real service monitoring
const {
  services,
  serviceMetrics,
  refreshService,
  refreshAllServices,
  startAutoRefresh,
  isRefreshing
} = useServiceMonitoring()

// Element Plus theme configuration with autumn colors
const elementTheme = computed(() => ({
  // Autumn color palette from Jehkoba64
  primary: '#f58122',    // BRIGHT_ORANGE
  success: '#fad937',    // GOLDEN_YELLOW
  warning: '#faa032',    // PUMPKIN
  danger: '#c40c2e',     // DARK_RED
  error: '#c40c2e',      // DARK_RED
  info: '#e69b22',       // AMBER
}))

// App styles with autumn theme
const appStyles = computed(() => ({
  '--el-color-primary': '#f58122',
  '--el-color-primary-light-3': '#f79549',
  '--el-color-primary-light-5': '#f9a970',
  '--el-color-primary-light-7': '#fbbd97',
  '--el-color-primary-light-9': '#fdd1be',
  '--el-color-primary-dark-2': '#c4671b',

  '--el-color-success': '#fad937',
  '--el-color-warning': '#faa032',
  '--el-color-danger': '#c40c2e',
  '--el-color-error': '#c40c2e',
  '--el-color-info': '#e69b22',

  '--el-bg-color': theme.value.backgrounds.app,
  '--el-bg-color-page': theme.value.backgrounds.surface,
  '--el-bg-color-overlay': theme.value.backgrounds.card,

  '--el-text-color-primary': theme.value.text.primary,
  '--el-text-color-regular': theme.value.text.secondary,
  '--el-text-color-secondary': theme.value.text.muted,
  '--el-text-color-placeholder': theme.value.text.muted,

  '--el-border-color': theme.value.primary.ramp3,
  '--el-border-color-light': theme.value.primary.ramp2,
  '--el-border-color-lighter': theme.value.primary.ramp1,

  minHeight: '100vh',
  color: theme.value.text.primary,
  position: 'relative'
}))

// Background gradient
const backgroundGradient = computed(() => {
  const colors = [
    theme.value.backgrounds.app,
    theme.value.backgrounds.surface
  ]
  return createGradient('135deg', colors, 1.0)
})

// Particle configuration for falling leaves
const particleConfig = computed(() => ({
  count: theme.value.particles.count,
  type: 'leaf',
  colors: theme.value.particles.colors,
  physics: theme.value.particles.physics,
  size: theme.value.particles.size
}))

const scanlineColor = computed(() => theme.value.effects.scanline)

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
}

const handleRefreshService = async (serviceId: string) => {
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

onMounted(() => {
  // Update time every second
  setInterval(updateTime, 1000)

  // Start real service monitoring
  startAutoRefresh()
})
</script>

<style scoped>
.element-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  z-index: 10;
}

.app-header {
  background: rgba(6, 128, 81, 0.3);
  backdrop-filter: blur(12px);
  border-bottom: 2px solid var(--el-color-primary);
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-text {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--el-text-color-primary);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.current-time {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--el-color-primary);
}

.app-main {
  flex: 1;
  padding: 24px;
  background: transparent;
}

.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.service-col {
  margin-bottom: 24px;
}

.metrics-card {
  margin-top: 24px;
  background: rgba(6, 128, 81, 0.2);
  backdrop-filter: blur(8px);
  border: 1px solid var(--el-color-primary);
}

.card-header {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.last-update {
  text-align: center;
}

.stat-title {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.app-footer {
  background: rgba(6, 128, 81, 0.3);
  backdrop-filter: blur(12px);
  border-top: 2px solid var(--el-color-primary);
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

/* Global Element Plus overrides */
:deep(.el-card) {
  background: rgba(6, 128, 81, 0.2);
  backdrop-filter: blur(8px);
  border: 1px solid var(--el-color-primary);
  transition: all 0.3s ease;
}

:deep(.el-card:hover) {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(245, 129, 34, 0.3);
  border-color: var(--el-color-primary-light-3);
}

:deep(.el-statistic) {
  text-align: center;
}

:deep(.el-statistic__head) {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

:deep(.el-statistic__content) {
  color: var(--el-text-color-primary);
  font-weight: 600;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .app-header {
    padding: 0 16px;
    height: 56px;
  }

  .title-text {
    font-size: 1.2rem;
  }

  .header-actions {
    gap: 8px;
  }

  .current-time {
    display: none;
  }

  .app-main {
    padding: 16px;
  }

  .app-footer {
    padding: 0 16px;
    height: 56px;
  }

  .footer-content {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .title-text {
    font-size: 1rem;
  }

  .service-col {
    margin-bottom: 16px;
  }
}
</style>
