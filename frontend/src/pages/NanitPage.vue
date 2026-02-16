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
        <WhitehouseControlSection title="Baby Sister Countdown">
          <div class="countdown-header">
            <span class="countdown-days">{{ daysRemaining }}</span>
            <span class="countdown-label">days to go!</span>
          </div>
          <div class="balloon-grid">
            <div
              v-for="i in totalCountdownDays"
              :key="i"
              class="balloon-slot"
              :class="{ 'is-popped': i <= poppedCount }"
            >
              <div v-if="i <= poppedCount" class="balloon-pop">*</div>
              <div v-else class="balloon" :style="{ '--balloon-color': balloonColor(i) }">
                <div class="balloon-body"></div>
                <div class="balloon-knot"></div>
                <div class="balloon-string"></div>
              </div>
            </div>
          </div>
          <p class="countdown-due">Due {{ dueDateFormatted }}</p>
        </WhitehouseControlSection>

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

// Baby sister countdown - due March 19, 2026
const dueDate = new Date('2026-03-19')
const startDate = new Date('2026-01-26')
const totalCountdownDays = Math.ceil((dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

const daysRemaining = computed(() => {
  const now = new Date()
  const diff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
})

const poppedCount = computed(() => totalCountdownDays - daysRemaining.value)

const dueDateFormatted = computed(() =>
  dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
)

const balloonColors = [
  '#FF69B4', '#DDA0DD', '#DA70D6', '#FF85A2', '#BA55D3',
  '#EE82EE', '#FFB6C1', '#DB7093', '#E6A8D7', '#C77DFF',
]

const balloonColor = (index: number) => balloonColors[index % balloonColors.length]

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

/* Balloon Countdown */
.countdown-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
  justify-content: center;
}

.countdown-days {
  font-size: 2.4rem;
  font-weight: 700;
  font-family: var(--wh-font-serif);
  color: #DA70D6;
  line-height: 1;
}

.countdown-label {
  font-size: 0.95rem;
  color: var(--wh-gray);
  font-family: var(--wh-font-serif);
}

.balloon-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  padding: 4px 0;
}

.balloon-slot {
  width: 22px;
  height: 38px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.balloon {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: default;
  transition: transform 0.2s ease;
}

.balloon:hover {
  animation: wobble 0.5s ease-in-out;
}

.balloon-body {
  width: 18px;
  height: 22px;
  background: var(--balloon-color);
  border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
  position: relative;
  box-shadow: inset -3px -2px 4px rgba(255, 255, 255, 0.35),
              inset 2px 1px 2px rgba(0, 0, 0, 0.08);
}

.balloon-knot {
  width: 4px;
  height: 4px;
  background: var(--balloon-color);
  clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
  filter: brightness(0.85);
}

.balloon-string {
  width: 1px;
  height: 10px;
  background: #ccc;
}

.balloon-pop {
  color: #e0c0e0;
  font-size: 10px;
  opacity: 0.4;
  margin-top: 6px;
}

.is-popped {
  opacity: 0.6;
}

.countdown-due {
  font-size: 0.75rem;
  color: var(--wh-gray);
  text-align: center;
  margin: 8px 0 0 0;
  font-style: italic;
}

@keyframes wobble {
  0% { transform: rotate(0deg); }
  15% { transform: rotate(8deg); }
  30% { transform: rotate(-8deg); }
  45% { transform: rotate(5deg); }
  60% { transform: rotate(-5deg); }
  75% { transform: rotate(2deg); }
  100% { transform: rotate(0deg); }
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
