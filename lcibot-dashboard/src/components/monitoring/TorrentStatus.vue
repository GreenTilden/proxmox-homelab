<template>
  <div class="torrent-status mario-card">
    <div class="widget-header">
      <h3 class="text-lg font-semibold flex items-center gap-2" style="color: var(--text-color);">
        <Download class="w-5 h-5" />
        qBittorrent Status
      </h3>
      <div class="flex items-center space-x-2">
        <div v-if="error" class="text-red-500 text-xs">
          ⚠️ Connection Error
        </div>
        <div v-else-if="torrentMetrics" class="text-xs opacity-70" style="color: var(--text-color);">
          {{ torrentMetrics.activeTorrents }} active
        </div>
        <span class="text-xs opacity-70" style="color: var(--text-color);">
          {{ lastUpdated }}
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && !torrentMetrics" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2" style="border-color: var(--primary-color);"></div>
      <span class="ml-2 text-sm opacity-70" style="color: var(--text-color);">Loading torrents...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4 mt-4 rounded-lg bg-red-100 dark:bg-red-900/30">
      <p class="text-sm text-red-700 dark:text-red-300">
        ⚠️ {{ error }}
      </p>
      <p class="text-xs mt-1 opacity-70 text-red-600 dark:text-red-400">
        Check qBittorrent service at 192.168.0.111:8112
      </p>
    </div>

    <!-- Torrent Overview -->
    <div v-else-if="torrentMetrics" class="mt-4">
      <!-- Global Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div class="stat-card p-3 rounded-lg" style="background: var(--section-bg);">
          <div class="text-lg font-bold" style="color: var(--success-color);">
            {{ qbittorrentService.formatSpeed(torrentMetrics.globalStats.dl_info_speed) }}
          </div>
          <div class="text-xs opacity-70" style="color: var(--text-color);">Download Speed</div>
        </div>
        <div class="stat-card p-3 rounded-lg" style="background: var(--section-bg);">
          <div class="text-lg font-bold" style="color: var(--secondary-color);">
            {{ qbittorrentService.formatSpeed(torrentMetrics.globalStats.up_info_speed) }}
          </div>
          <div class="text-xs opacity-70" style="color: var(--text-color);">Upload Speed</div>
        </div>
        <div class="stat-card p-3 rounded-lg" style="background: var(--section-bg);">
          <div class="text-lg font-bold" style="color: var(--primary-color);">
            {{ torrentMetrics.activeTorrents }}
          </div>
          <div class="text-xs opacity-70" style="color: var(--text-color);">Active</div>
        </div>
        <div class="stat-card p-3 rounded-lg" style="background: var(--section-bg);">
          <div class="text-lg font-bold" style="color: var(--primary-color);">
            {{ torrentMetrics.completedTorrents }}
          </div>
          <div class="text-xs opacity-70" style="color: var(--text-color);">Completed</div>
        </div>
      </div>

      <!-- Active Downloads -->
      <div v-if="activeTorrents.length > 0" class="active-downloads mb-4">
        <h4 class="text-sm font-medium mb-3 opacity-80" style="color: var(--text-color);">
          📥 Active Downloads
        </h4>
        <div class="space-y-2">
          <div
            v-for="torrent in activeTorrents.slice(0, maxDisplayTorrents)"
            :key="torrent.hash"
            class="torrent-item p-3 rounded-lg border transition-all hover:scale-[1.02]"
            style="background: var(--section-bg); border-color: rgba(var(--primary-color-rgb), 0.2);"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1 min-w-0">
                <h5 class="text-sm font-medium truncate" style="color: var(--text-color);" :title="torrent.name">
                  {{ torrent.name }}
                </h5>
                <div class="flex items-center gap-3 mt-1 text-xs opacity-70" style="color: var(--text-color);">
                  <span>{{ qbittorrentService.formatBytes(torrent.size) }}</span>
                  <span class="text-xs px-2 py-0.5 rounded"
                        :style="{
                          backgroundColor: qbittorrentService.getTorrentStateColor(torrent.state),
                          color: 'white'
                        }">
                    {{ qbittorrentService.getTorrentStateDisplay(torrent.state) }}
                  </span>
                </div>
              </div>
              <div class="text-right flex-shrink-0 ml-3">
                <div class="text-sm font-bold" style="color: var(--primary-color);">
                  {{ Math.round(torrent.progress * 100) }}%
                </div>
                <div class="text-xs opacity-70" style="color: var(--text-color);">
                  {{ qbittorrentService.formatSpeed(torrent.dlspeed) }}
                </div>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="progress-bar w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div
                class="progress-fill h-2 rounded-full transition-all duration-500"
                :style="{
                  width: `${Math.min(torrent.progress * 100, 100)}%`,
                  backgroundColor: getProgressColor(torrent.progress * 100)
                }"
              ></div>
            </div>

            <!-- Additional Details -->
            <div class="flex justify-between items-center mt-2 text-xs opacity-60" style="color: var(--text-color);">
              <span>S: {{ torrent.num_seeds }} | P: {{ torrent.num_leechs }}</span>
              <span v-if="torrent.eta > 0">ETA: {{ formatETA(torrent.eta) }}</span>
            </div>
          </div>
        </div>

        <!-- Show More Button -->
        <div v-if="activeTorrents.length > maxDisplayTorrents" class="text-center mt-3">
          <button
            @click="maxDisplayTorrents = activeTorrents.length"
            class="mario-button-small text-xs"
          >
            Show {{ activeTorrents.length - maxDisplayTorrents }} more
          </button>
        </div>
      </div>

      <!-- Completed Downloads Alert -->
      <div v-if="recentlyCompleted.length > 0" class="completed-alert mb-4">
        <div class="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg p-3">
          <h4 class="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
            ✅ Recently Completed
          </h4>
          <div class="space-y-1">
            <div
              v-for="torrent in recentlyCompleted.slice(0, 3)"
              :key="torrent.hash"
              class="text-sm text-green-700 dark:text-green-400 truncate"
              :title="torrent.name"
            >
              {{ torrent.name }}
            </div>
          </div>
        </div>
      </div>

      <!-- No Active Downloads -->
      <div v-if="activeTorrents.length === 0" class="text-center py-6">
        <Download class="w-12 h-12 mx-auto mb-2 opacity-50" style="color: var(--text-color);" />
        <p class="text-sm opacity-70" style="color: var(--text-color);">No active downloads</p>
        <p class="text-xs opacity-50 mt-1" style="color: var(--text-color);">
          {{ torrentMetrics.torrents.length }} total torrents
        </p>
      </div>
    </div>

    <!-- Refresh Button -->
    <div class="widget-actions mt-4 flex items-center justify-between">
      <button
        @click="refreshData"
        :disabled="isLoading"
        class="mario-button-small flex items-center gap-1"
      >
        <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': isLoading }" />
        Refresh
      </button>
      <div class="text-xs opacity-50" style="color: var(--text-color);">
        Auto-refresh: {{ autoRefreshInterval }}s
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Download, RefreshCw } from 'lucide-vue-next'
import { qbittorrentService, type TorrentMetrics, type QBittorrentTorrent } from '../../services/qbittorrentApi'

// Reactive data
const torrentMetrics = ref<TorrentMetrics | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const maxDisplayTorrents = ref(5)

// Settings
const autoRefreshInterval = 30 // seconds
let refreshTimer: NodeJS.Timeout | null = null

// Computed properties
const lastUpdated = computed(() => {
  if (!torrentMetrics.value?.lastUpdated) return 'Never'
  return torrentMetrics.value.lastUpdated.toLocaleTimeString()
})

const activeTorrents = computed(() => {
  if (!torrentMetrics.value?.torrents) return []
  return torrentMetrics.value.torrents.filter(t =>
    t.state === 'downloading' ||
    t.state === 'stalledDL' ||
    t.state === 'queuedDL' ||
    t.state === 'checkingDL'
  ).sort((a, b) => b.progress - a.progress)
})

const recentlyCompleted = computed(() => {
  if (!torrentMetrics.value?.torrents) return []
  const now = Date.now() / 1000
  const recentThreshold = 24 * 60 * 60 // 24 hours

  return torrentMetrics.value.torrents.filter(t =>
    (t.state === 'completedDL' || t.progress === 1) &&
    t.completion_on > 0 &&
    (now - t.completion_on) < recentThreshold
  ).sort((a, b) => b.completion_on - a.completion_on)
})

// Methods
const refreshData = async () => {
  if (isLoading.value) return

  isLoading.value = true
  error.value = null

  try {
    torrentMetrics.value = await qbittorrentService.getTorrentMetrics()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch torrent data'
    console.error('qBittorrent error:', err)
  } finally {
    isLoading.value = false
  }
}

const getProgressColor = (percentage: number) => {
  if (percentage >= 95) return '#10b981' // green
  if (percentage >= 50) return '#3b82f6' // blue
  if (percentage >= 25) return '#f59e0b' // amber
  return '#ef4444' // red
}

const formatETA = (seconds: number): string => {
  if (seconds <= 0 || seconds === 8640000) return '∞'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

const startAutoRefresh = () => {
  refreshTimer = setInterval(refreshData, autoRefreshInterval * 1000)
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// Lifecycle
onMounted(async () => {
  await refreshData()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.stat-card {
  transition: all 0.2s ease;
  border: 1px solid rgba(var(--primary-color-rgb), 0.1);
}

.stat-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.torrent-item {
  transition: all 0.2s ease;
}

.torrent-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.progress-bar {
  background: rgba(0, 0, 0, 0.1);
}

.progress-fill {
  transition: width 0.5s ease, background-color 0.3s ease;
}

.completed-alert {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .torrent-item {
    padding: 0.75rem;
  }

  .torrent-item h5 {
    font-size: 0.875rem;
  }

  .stat-card {
    padding: 0.75rem;
  }
}
</style>