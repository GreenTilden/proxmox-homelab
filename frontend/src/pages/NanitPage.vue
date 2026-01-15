<template>
  <div class="wh-page">
    <WhitehouseHeader
      title="Baby Monitor"
      logo-src="/qca.png"
      :show-banner="true"
      banner-title="Little Castle in Between"
      banner-subtitle="Indianapolis"
    >
      <template #nav>
        <button @click="refreshStream" class="wh-header-link">
          Refresh
        </button>
      </template>
    </WhitehouseHeader>

    <WhitehouseChannelTabs />

    <div class="wh-page-content">
      <WhitehouseSidebar>
        <WhitehouseControlSection title="Stream Status">
          <div class="wh-status-item">
            <span
              class="wh-status-dot"
              :class="isConnected ? 'wh-status-dot--success' : 'wh-status-dot--error'"
            ></span>
            <span>{{ isConnected ? 'Connected' : 'Disconnected' }}</span>
          </div>
          <div class="wh-status-item">
            <span class="wh-status-dot"></span>
            <span>Token: {{ tokenStatus }}</span>
          </div>
        </WhitehouseControlSection>

        <WhitehouseControlSection title="Controls">
          <div class="wh-button-grid">
            <button @click="toggleFullscreen" class="wh-grid-btn">
              <span class="wh-grid-btn-icon">⛶</span>
              <span class="wh-grid-btn-label">Fullscreen</span>
            </button>
            <button @click="toggleMute" class="wh-grid-btn">
              <span class="wh-grid-btn-icon">{{ isMuted ? '🔇' : '🔊' }}</span>
              <span class="wh-grid-btn-label">{{ isMuted ? 'Unmute' : 'Mute' }}</span>
            </button>
          </div>
        </WhitehouseControlSection>

        <WhitehouseControlSection title="Token Refresh">
          <p class="wh-help-text">
            Run in browser console on my.nanit.com to get new token
          </p>
          <a href="http://192.168.0.99:8085/" target="_blank" class="wh-control-link">
            Proxy Status
          </a>
        </WhitehouseControlSection>

        <WhitehouseControlSection title="Resources">
          <a href="https://my.nanit.com" target="_blank" class="wh-control-link">
            Nanit Web
          </a>
          <router-link to="/" class="wh-control-link">
            Dashboard
          </router-link>
        </WhitehouseControlSection>
      </WhitehouseSidebar>

      <main class="wh-main">
        <WhitehousePanel aspect-ratio="16/9" max-width="900px">
          <div class="video-container" ref="videoWrapper">
            <video
              ref="videoPlayer"
              class="wh-video"
              autoplay
              muted
              playsinline
              @playing="onPlaying"
              @error="onError"
            ></video>
            <div v-if="!isConnected" class="video-overlay">
              <div class="loading-spinner"></div>
              <p>Connecting to stream...</p>
            </div>
          </div>
          <template #footer>
            <span class="wh-brand">Nanit Baby Monitor</span>
            <span class="wh-status">
              <span
                class="wh-status-dot"
                :class="isConnected ? 'wh-status-dot--success' : 'wh-status-dot--error'"
              ></span>
              {{ isConnected ? 'Live' : 'Offline' }}
            </span>
          </template>
        </WhitehousePanel>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import Hls from 'hls.js'
import WhitehouseHeader from '@/components/themes/whitehouse/WhitehouseHeader.vue'
import WhitehouseChannelTabs from '@/components/themes/whitehouse/WhitehouseChannelTabs.vue'
import WhitehousePanel from '@/components/themes/whitehouse/WhitehousePanel.vue'
import WhitehouseSidebar from '@/components/themes/whitehouse/WhitehouseSidebar.vue'
import WhitehouseControlSection from '@/components/themes/whitehouse/WhitehouseControlSection.vue'
import '@/styles/whitehouse-theme.css'

const videoPlayer = ref<HTMLVideoElement | null>(null)
const videoWrapper = ref<HTMLElement | null>(null)
const isConnected = ref(false)
const isMuted = ref(true)
const tokenExpiry = ref<Date | null>(null)
let hls: Hls | null = null

const streamUrl = computed(() => {
  const host = window.location.hostname
  return `http://${host === 'localhost' ? '192.168.0.99' : '192.168.0.99'}:8085/stream.m3u8`
})

const tokenStatus = computed(() => {
  if (!tokenExpiry.value) return 'Unknown'
  const now = new Date()
  const hours = Math.round((tokenExpiry.value.getTime() - now.getTime()) / (1000 * 60 * 60))
  if (hours < 0) return 'Expired!'
  return `${hours}h remaining`
})

const initPlayer = () => {
  if (!videoPlayer.value) return

  if (Hls.isSupported()) {
    hls = new Hls({
      debug: false,
      enableWorker: true,
      lowLatencyMode: true,
      manifestLoadingMaxRetry: 6,
      manifestLoadingRetryDelay: 2000,
      levelLoadingMaxRetry: 6,
      levelLoadingRetryDelay: 2000,
      fragLoadingMaxRetry: 6,
      fragLoadingRetryDelay: 1000,
    })

    hls.loadSource(streamUrl.value)
    hls.attachMedia(videoPlayer.value)

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      videoPlayer.value?.play().catch(console.error)
    })

    hls.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        console.warn('HLS fatal error, recovering:', data.details)
        isConnected.value = false

        // Use HLS.js built-in recovery for network and media errors
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls?.startLoad()
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls?.recoverMediaError()
        } else {
          // Full reinit for other fatal errors
          setTimeout(() => {
            hls?.destroy()
            initPlayer()
          }, 5000)
        }
      }
    })
  } else if (videoPlayer.value.canPlayType('application/vnd.apple.mpegurl')) {
    videoPlayer.value.src = streamUrl.value
  }
}

const refreshStream = () => {
  isConnected.value = false
  hls?.destroy()
  initPlayer()
}

const onPlaying = () => {
  isConnected.value = true
}

const onError = () => {
  isConnected.value = false
}

const toggleMute = () => {
  if (videoPlayer.value) {
    isMuted.value = !isMuted.value
    videoPlayer.value.muted = isMuted.value
  }
}

const toggleFullscreen = () => {
  if (videoWrapper.value) {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      videoWrapper.value.requestFullscreen()
    }
  }
}

onMounted(() => {
  tokenExpiry.value = new Date(Date.now() + 24 * 60 * 60 * 1000)
  initPlayer()
})

onUnmounted(() => {
  hls?.destroy()
})
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

.video-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.wh-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 38, 77, 0.9);
  color: var(--wh-white);
}

.video-overlay p {
  font-family: var(--wh-font-serif);
  font-size: var(--wh-text-lg);
  margin-top: var(--wh-space-4);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: var(--wh-gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.wh-help-text {
  font-size: var(--wh-text-xs);
  color: var(--wh-gray);
  margin: 0 0 var(--wh-space-2) 0;
  line-height: 1.4;
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
