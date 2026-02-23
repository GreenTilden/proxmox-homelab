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
            
            <!-- Tab Navigation -->
            <div class="tab-navigation">
              <button 
                @click="activeTab = 'downloads'" 
                :class="['nes-btn', activeTab === 'downloads' ? 'is-primary' : '']"
              >
                📥 Downloads / Media
              </button>
              <button 
                @click="activeTab = 'roms'" 
                :class="['nes-btn', activeTab === 'roms' ? 'is-warning' : '']"
              >
                🎮 Batocera ROMs
              </button>
            </div>

            <p style="margin: 1rem 0 0.5rem 0; font-size: 0.8rem; color: var(--text-dim);">
              {{ activeTab === 'downloads' ? 'Left: Staging Downloads | Right: Media Pool' : 'Left: Staging Downloads | Right: Batocera ROMs' }}
            </p>

            <div class="gotty-terminal-wrapper">
              <iframe
                v-if="activeTab === 'downloads'"
                :src="gottyDownloadsUrl"
                frameborder="0"
                width="100%"
                height="600px"
                allowfullscreen
              ></iframe>
              <iframe
                v-else
                :src="gottyRomsUrl"
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
                <button @click="triggerUpload" class="nes-btn is-success">🎬 Movie Upload</button>
                <input ref="fileInput" type="file" style="display: none" @change="handleFileUpload" />
              </div>
              <div v-if="plexStatus" :class="['nes-container', 'is-rounded', 'is-dark']" style="margin-top: 1rem; padding: 1rem; width: 100%;">
                <p :class="plexStatus.type === 'success' ? 'nes-text is-success' : 'nes-text is-error'" style="margin: 0;">{{ plexStatus.message }}</p>
              </div>
              <div v-if="cyncStatus" :class="['nes-container', 'is-rounded', 'is-dark']" style="margin-top: 1rem; padding: 1rem; width: 100%;">
                <p :class="cyncStatus.type === 'success' ? 'nes-text is-success' : 'nes-text is-error'" style="margin: 0;">{{ cyncStatus.message }}</p>
              </div>
              <div v-if="uploadStatus" :class="['nes-container', 'is-rounded', 'is-dark']" style="margin-top: 1rem; padding: 1rem; width: 100%;">
                <p :class="uploadStatus.type === 'success' ? 'nes-text is-success' : uploadStatus.type === 'info' ? 'nes-text is-primary' : 'nes-text is-error'" style="margin: 0;">{{ uploadStatus.message }}</p>
                <progress v-if="uploadProgress >= 0" class="nes-progress is-success" :value="uploadProgress" max="100" style="margin-top: 0.5rem;"></progress>
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
const activeTab = ref<'downloads' | 'roms'>('downloads');

const { currentSeason } = useTheme();

// --- FileManager Logic ---
const frontendServerIp = '192.168.0.250';
const gottyDownloadsPort = '8083';
const gottyRomsPort = '8084';

const gottyDownloadsUrl = computed(() => `http://${frontendServerIp}:${gottyDownloadsPort}/`);
const gottyRomsUrl = computed(() => `http://${frontendServerIp}:${gottyRomsPort}/`);
const plexApiUrl = '/cmd-api/rescan-plex';
const cyncApiUrl = '/cmd-api/refresh-cync';

const plexStatus = ref<{ type: string; message: string } | null>(null);
const cyncStatus = ref<{ type: string; message: string } | null>(null);
const uploadStatus = ref<{ type: string; message: string } | null>(null);
const uploadProgress = ref(-1);
const fileInput = ref<HTMLInputElement | null>(null);

const uploadApiUrl = '/cmd-api/upload-media';

const rescanPlex = async () => {
  plexStatus.value = { type: 'info', message: 'Triggering Plex rescan...' };
  try {
    const response = await fetch(plexApiUrl, {
      method: 'POST',
      headers: {
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
    const response = await fetch(cyncApiUrl, {
      method: 'POST',
      headers: {
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

const triggerUpload = () => {
  fileInput.value?.click();
};

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  uploadStatus.value = { type: 'info', message: `Uploading ${file.name}...` };
  uploadProgress.value = 0;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadApiUrl);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        uploadProgress.value = Math.round((e.loaded / e.total) * 100);
      }
    };

    xhr.onload = () => {
      const data = JSON.parse(xhr.responseText);
      if (xhr.status === 200) {
        uploadStatus.value = { type: 'success', message: data.message };
      } else {
        uploadStatus.value = { type: 'error', message: data.error || 'Upload failed.' };
      }
      uploadProgress.value = -1;
    };

    xhr.onerror = () => {
      uploadStatus.value = { type: 'error', message: 'Network error or server unreachable.' };
      uploadProgress.value = -1;
    };

    xhr.send(formData);
  } catch (error) {
    uploadStatus.value = { type: 'error', message: 'Upload failed.' };
    uploadProgress.value = -1;
  }

  // Reset file input so same file can be re-selected
  input.value = '';
};

const toggleScanlines = () => { enableScanlines.value = !enableScanlines.value; };
const toggleParticles = () => { enableParticles.value = !enableParticles.value; };

// --- Styles ---
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

const containerStyles = computed(() => ({}));

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

.tab-navigation {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.gotty-terminal-wrapper {
  margin-top: 0.5rem;
  border: 4px solid var(--color-primary-3);
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
