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
        <div :style="headerControlsStyles">
          <router-link to="/" class="nes-btn is-primary">🏠 Home</router-link>
        </div>
      </header>

      <!-- Main Content -->
      <main :style="mainStyles">
        
        <div class="nes-container with-title is-dark" :style="containerStyles">
          <p class="title">File Manager</p>
          <div class="file-manager-content">
             <p style="margin-bottom: 1rem;">Manage your downloads and media library directly from here.</p>

            <div class="gotty-terminal-wrapper">
              <iframe
                :src="gottyUrl"
                frameborder="0"
                width="100%"
                height="600px"
                allowfullscreen
              ></iframe>
            </div>

            <div class="plex-actions">
              <div class="action-buttons">
                <button @click="rescanPlex" class="nes-btn is-primary">Rescan Plex Libraries</button>
                <button @click="refreshCync" class="nes-btn is-warning">Refresh Cync Lights</button>
              </div>
              <div v-if="plexStatus" :class="['nes-container', 'is-rounded', 'is-dark']" style="margin-top: 1rem; padding: 1rem; width: 100%;">
                <p :class="plexStatus.type === 'success' ? 'nes-text is-success' : 'nes-text is-error'" style="margin: 0;">{{ plexStatus.message }}</p>
              </div>
              <div v-if="cyncStatus" :class="['nes-container', 'is-rounded', 'is-dark']" style="margin-top: 1rem; padding: 1rem; width: 100%;">
                <p :class="cyncStatus.type === 'success' ? 'nes-text is-success' : 'nes-text is-error'" style="margin: 0;">{{ cyncStatus.message }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Theme Controls (Simplified) -->
        <div :style="controlsStyles">
           <button class="nes-btn is-warning" @click="toggleScanlines">
             {{ enableScanlines ? '📺 Disable' : '📺 Enable' }} Scanlines
           </button>
           <button class="nes-btn is-success" @click="toggleParticles">
             {{ enableParticles ? '❄️ Disable' : '❄️ Enable' }} Particles
           </button>
        </div>

      </main>
    </div>
  </SeasonalThemeProvider>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import SeasonalThemeProvider from '../components/themes/retro/SeasonalThemeProvider.vue';
import { useTheme } from '../composables/useTheme';

const enableScanlines = ref(true);
const enableParticles = ref(true);

const { currentSeason } = useTheme();

// --- FileManager Logic ---
const proxmoxHostIp = '192.168.0.99'; // For Command Server
const frontendServerIp = '192.168.0.250'; // For Gotty/MC
const gottyPort = '8083';
const commandServerPort = '5001';
const SECRET_TOKEN = '4be03b6172afe584e6547ce38697412f99ffa552bb18b4ea73e522eed4e65eaf';

const gottyUrl = computed(() => `http://${frontendServerIp}:${gottyPort}/`);
const plexApiUrl = computed(() => `http://${frontendServerIp}:${commandServerPort}/api/rescan-plex`);
const cyncApiUrl = computed(() => `http://${frontendServerIp}:${commandServerPort}/api/refresh-cync`);

const plexStatus = ref<{ type: string; message: string } | null>(null);
const cyncStatus = ref<{ type: string; message: string } | null>(null);

const rescanPlex = async () => {
  plexStatus.value = { type: 'info', message: 'Triggering Plex rescan...' };
  try {
    const response = await fetch(plexApiUrl.value, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SECRET_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (response.ok) {
      plexStatus.value = { type: 'success', message: data.message || 'Plex rescan initiated successfully!' };
    } else {
      plexStatus.value = { type: 'error', message: data.error || 'Failed to trigger Plex rescan.' };
    }
  } catch (error) {
    plexStatus.value = { type: 'error', message: 'Network error or server unreachable.' };
  }
};

const refreshCync = async () => {
  cyncStatus.value = { type: 'info', message: 'Refreshing Cync integration...' };
  try {
    const response = await fetch(cyncApiUrl.value, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SECRET_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (response.ok) {
      cyncStatus.value = { type: 'success', message: data.message || 'Cync integration refreshed!' };
    } else {
      cyncStatus.value = { type: 'error', message: data.error || 'Failed to refresh Cync integration.' };
    }
  } catch (error) {
    cyncStatus.value = { type: 'error', message: 'Network error or server unreachable.' };
  }
};

const toggleScanlines = () => { enableScanlines.value = !enableScanlines.value; };
const toggleParticles = () => { enableParticles.value = !enableParticles.value; };

// --- Styles (Copied/Adapted from RetroApp.vue) ---
const appStyles = computed(() => ({
  minHeight: '100vh',
  padding: '0',
  margin: '0',
  position: 'relative' as const
}));

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
  imageRendering: 'pixelated' as const
}));

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
}));

const logoImageStyles = computed(() => ({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  imageRendering: 'auto' as const,
  filter: 'drop-shadow(0 0 4px var(--color-accent-3))',
  flexShrink: '0'
}));

const headerControlsStyles = computed(() => ({
  display: 'flex',
  gap: '1rem'
}));

const mainStyles = computed(() => ({
  padding: 'var(--space-lg)',
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 'var(--space-xl)'
}));

const containerStyles = computed(() => ({
  // NES.css container needs explicit color sometimes to match theme override
}));

const controlsStyles = computed(() => ({
  display: 'flex',
  justifyContent: 'center',
  gap: 'var(--space-md)',
  flexWrap: 'wrap' as const,
  padding: 'var(--space-lg)',
  background: 'var(--bg-card)',
  borderRadius: 'var(--radius-lg)',
  border: `1px solid var(--color-primary-2)40`
}));
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.gotty-terminal-wrapper {
  margin-top: 1.5rem;
  border: 4px solid var(--color-primary-3); /* Matching retro border */
  border-radius: 4px;
  overflow: hidden;
}

iframe {
  display: block;
}

.plex-actions {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* NES.css Overrides (Scoped) */
:deep(.nes-container) {
  background-color: var(--bg-card) !important;
  border-color: var(--color-primary-3) !important;
  border-width: 4px !important;
}
:deep(.nes-btn) {
  font-family: "Press Start 2P", monospace !important;
}
:deep(.nes-text) {
  font-family: "Press Start 2P", monospace !important;
}
</style>