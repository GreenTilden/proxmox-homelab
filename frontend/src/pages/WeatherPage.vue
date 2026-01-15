<template>
  <div class="wh-page">
    <WhitehouseHeader
      title="Weather"
      logo-src="/qca.png"
      :show-banner="true"
      banner-title="Little Castle in Between"
      banner-subtitle="Indianapolis"
    >
      <template #nav>
        <a :href="haUrl" target="_blank" class="wh-header-link">
          Home Assistant
        </a>
      </template>
    </WhitehouseHeader>

    <WhitehouseChannelTabs />

    <div class="wh-page-content">
      <WhitehouseSidebar>
        <WhitehouseControlSection title="Automations">
          <div class="wh-status-item">
            <span class="wh-status-dot wh-status-dot--success"></span>
            <span>Ambient Lighting</span>
          </div>
          <div class="wh-status-item">
            <span class="wh-status-dot wh-status-dot--success"></span>
            <span>Rain Flicker</span>
          </div>
        </WhitehouseControlSection>

        <WhitehouseControlSection title="Quick Lights">
          <div class="wh-button-grid">
            <a :href="`${haUrl}/lovelace/kiosk`" target="_blank" class="wh-grid-btn">
              <span class="wh-grid-btn-icon">💡</span>
              <span class="wh-grid-btn-label">Desk</span>
            </a>
            <a :href="`${haUrl}/lovelace/kiosk`" target="_blank" class="wh-grid-btn">
              <span class="wh-grid-btn-icon">🪔</span>
              <span class="wh-grid-btn-label">Lamp</span>
            </a>
            <a :href="`${haUrl}/lovelace/kiosk`" target="_blank" class="wh-grid-btn">
              <span class="wh-grid-btn-icon">🎈</span>
              <span class="wh-grid-btn-label">Balloon</span>
            </a>
            <a :href="`${haUrl}/lovelace/kiosk`" target="_blank" class="wh-grid-btn">
              <span class="wh-grid-btn-icon">🏠</span>
              <span class="wh-grid-btn-label">Basement</span>
            </a>
          </div>
        </WhitehouseControlSection>

        <WhitehouseControlSection title="Cast">
          <a :href="`${haUrl}/lovelace/kiosk`" target="_blank" class="wh-control-link">
            📺 Cast to Display
          </a>
        </WhitehouseControlSection>

        <WhitehouseControlSection title="Resources">
          <a :href="`${haUrl}/lovelace/kiosk`" target="_blank" class="wh-control-link">
            Kiosk Dashboard
          </a>
          <a href="http://192.168.0.250:8082/" target="_blank" class="wh-control-link">
            WeatherStar Direct
          </a>
        </WhitehouseControlSection>
      </WhitehouseSidebar>

      <main class="wh-main">
        <WhitehousePanel aspect-ratio="4/3" max-width="900px">
          <iframe
            ref="weatherFrame"
            :src="weatherUrl"
            class="wh-iframe"
            allowfullscreen
          />
          <template #footer>
            <span class="wh-brand">WeatherStar 4000+</span>
            <span class="wh-status">
              <span class="wh-status-dot wh-status-dot--success"></span>
              Live
            </span>
          </template>
        </WhitehousePanel>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import WhitehouseHeader from '@/components/themes/whitehouse/WhitehouseHeader.vue'
import WhitehouseChannelTabs from '@/components/themes/whitehouse/WhitehouseChannelTabs.vue'
import WhitehousePanel from '@/components/themes/whitehouse/WhitehousePanel.vue'
import WhitehouseSidebar from '@/components/themes/whitehouse/WhitehouseSidebar.vue'
import WhitehouseControlSection from '@/components/themes/whitehouse/WhitehouseControlSection.vue'
import '@/styles/whitehouse-theme.css'

const weatherUrl = computed(() => {
  const host = window.location.hostname
  return `http://${host}:8082/?kiosk=true`
})

const haUrl = computed(() => {
  return 'http://192.168.0.99:8123'
})

const weatherFrame = ref<HTMLIFrameElement | null>(null)
</script>

<style scoped>
.wh-page-content {
  display: flex;
  flex: 1;
  min-height: calc(100vh - 120px);
}

.wh-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--wh-space-6);
  background: var(--wh-gray-lightest);
}

.wh-iframe {
  background: #000;
}

/* Responsive */
@media (max-width: 768px) {
  .wh-page-content {
    flex-direction: column;
  }

  .wh-main {
    padding: var(--wh-space-4);
  }
}
</style>
