# Plex Media Workflow Activation Guide

## 🎬 **Mission Overview**
**Objective**: Activate Plex Media Server and complete end-to-end media acquisition workflow
**Current Status**: ⚠️ Plex service configured but inactive (port 32400)
**Target Status**: ✅ Complete Firefox → Deluge → Plex automation pipeline

---

## 🔍 **Current State Analysis**

### **Plex Service Assessment**
| Component | Current State | Target State | Action Required |
|-----------|---------------|--------------|-----------------|
| **Container Status** | ⚠️ Inactive/Stopped | ✅ Running | **START SERVICE** |
| **Port Configuration** | ✅ 32400 configured | ✅ Accessible | Verify routing |
| **Storage Integration** | ✅ ZFS pools mounted | ✅ Media-pool access | Verify permissions |
| **Authentication** | ✅ Google auth configured | ✅ Functional | Test login |
| **LCiBot Integration** | ❌ Missing service card | ✅ Real-time monitoring | **ADD MONITORING** |
| **Workflow Pipeline** | ❌ Manual process | ✅ Automated | **BUILD AUTOMATION** |

### **Media Architecture**
```yaml
# Current ZFS Storage Configuration
Media Pool: /media-pool (8.7TB capacity)
├── movies/     # Movie library
├── tv-shows/   # TV series library
├── music/      # Audio library
└── processing/ # Temporary processing space

Staging Pool: /staging-pool (675GB capacity)
├── downloads/     # Deluge download destination
├── processing/    # Media processing workspace
└── completed/     # Ready for Plex import

Service Pool: /service-pool (232GB SSD)
├── plex-config/   # Plex configuration and metadata
├── plex-cache/    # Transcoding cache
└── plex-logs/     # Service logs
```

---

## 🎯 **Activation Plan**

### **Phase 1: Plex Service Activation** (Writer Thread Task)

#### **1.1 Container Configuration**
```yaml
# Enhanced Plex container deployment
version: '3.8'
services:
  plex:
    image: lscr.io/linuxserver/plex:latest
    container_name: plex-media-server
    environment:
      - PUID=1000
      - PGID=1000
      - VERSION=docker
      - TZ=America/New_York
      - PLEX_CLAIM=${PLEX_CLAIM_TOKEN}  # From secure configuration
    volumes:
      # Configuration and metadata (SSD for performance)
      - /service-pool/plex-config:/config
      - /service-pool/plex-cache:/transcode

      # Media libraries (optimized mounting)
      - /media-pool/movies:/media/movies:ro
      - /media-pool/tv-shows:/media/tv:ro
      - /media-pool/music:/media/music:ro

      # Processing pipeline
      - /staging-pool/completed:/media/processing:rw
      - /staging-pool/downloads:/downloads:ro
    ports:
      - "32400:32400"
      - "3005:3005"    # Plex Home Theater
      - "8324:8324"    # Roku via Plex Companion
      - "32469:32469"  # Plex DLNA Server
      - "1900:1900/udp"    # Plex DLNA Server
      - "32410:32410/udp"  # GDM Network discovery
      - "32412:32412/udp"  # GDM Network discovery
      - "32413:32413/udp"  # GDM Network discovery
      - "32414:32414/udp"  # GDM Network discovery
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.plex.rule=Host(\`192.168.0.99\`)"
      - "traefik.http.services.plex.loadbalancer.server.port=32400"
    networks:
      - homelab
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:32400/web"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  homelab:
    external: true
```

#### **1.2 Service Activation Commands**
```bash
#!/bin/bash
# /usr/local/bin/activate-plex-service.sh

echo "🎬 PLEX SERVICE ACTIVATION STARTING"
echo "=================================="

# Pre-activation checks
echo "🔍 Pre-activation system checks..."

# Verify ZFS pool availability
if ! zpool status media-pool >/dev/null 2>&1; then
    echo "❌ ERROR: media-pool not available"
    exit 1
fi

if ! zpool status staging-pool >/dev/null 2>&1; then
    echo "❌ ERROR: staging-pool not available"
    exit 1
fi

if ! zpool status service-pool >/dev/null 2>&1; then
    echo "❌ ERROR: service-pool not available"
    exit 1
fi

echo "✅ All ZFS pools available"

# Create necessary directories
echo "📁 Creating Plex directory structure..."
mkdir -p /service-pool/plex-config
mkdir -p /service-pool/plex-cache
mkdir -p /service-pool/plex-logs
mkdir -p /media-pool/movies
mkdir -p /media-pool/tv-shows
mkdir -p /media-pool/music
mkdir -p /staging-pool/completed

# Set permissions
chown -R 1000:1000 /service-pool/plex-*
chmod -R 755 /service-pool/plex-*
chmod -R 755 /media-pool/movies /media-pool/tv-shows /media-pool/music
chmod -R 755 /staging-pool/completed

echo "✅ Directory structure created"

# Stop existing Plex container if running
if docker ps | grep -q plex-media-server; then
    echo "🔄 Stopping existing Plex container..."
    docker stop plex-media-server
    docker rm plex-media-server
fi

# Deploy Plex container
echo "🚀 Deploying Plex Media Server..."
cd /opt/homelab/docker-compose
docker-compose up -d plex

# Wait for service to be ready
echo "⏳ Waiting for Plex to initialize..."
for i in {1..30}; do
    if curl -f http://192.168.0.99:32400/web >/dev/null 2>&1; then
        echo "✅ Plex Media Server is ready!"
        break
    fi
    echo "   Attempt $i/30: Waiting for Plex..."
    sleep 10
done

# Verify service status
if curl -f http://192.168.0.99:32400/web >/dev/null 2>&1; then
    echo "🎉 PLEX ACTIVATION SUCCESSFUL"
    echo "   URL: http://192.168.0.99:32400"
    echo "   Status: Operational"
else
    echo "❌ PLEX ACTIVATION FAILED"
    echo "   Check logs: docker logs plex-media-server"
    exit 1
fi

# Initialize monitoring
echo "📊 Setting up monitoring integration..."
/usr/local/bin/setup-plex-monitoring.sh

echo "🎬 Plex Service Activation Complete!"
```

### **Phase 2: LCiBot Dashboard Integration** (Writer Thread Task)

#### **2.1 Plex Service Card Component**
```vue
<!-- components/ServiceCards/PlexCard.vue -->
<template>
  <ServiceCard
    :service="plexService"
    :health="plexHealth"
    @action="handlePlexAction"
    class="plex-service-card"
  >
    <template #status-details>
      <div class="plex-detailed-status">
        <div class="server-info">
          <Icon name="server" />
          <span>{{ serverInfo?.name || 'Plex Media Server' }}</span>
        </div>

        <div class="library-stats" v-if="libraryStats">
          <div class="stat-item">
            <Icon name="film" />
            <span>{{ libraryStats.movies }} Movies</span>
          </div>
          <div class="stat-item">
            <Icon name="tv" />
            <span>{{ libraryStats.shows }} TV Shows</span>
          </div>
          <div class="stat-item">
            <Icon name="music" />
            <span>{{ libraryStats.music }} Music</span>
          </div>
        </div>

        <div class="transcoding-status" v-if="transcodingInfo?.active">
          <Icon name="cpu" :class="transcodingInfo.level" />
          <span>{{ transcodingInfo.sessions }} Active Stream{{ transcodingInfo.sessions !== 1 ? 's' : '' }}</span>
        </div>
      </div>
    </template>

    <template #actions>
      <ActionButton
        @click="openPlex"
        icon="external-link"
        label="Open Plex"
        :disabled="!isHealthy"
        variant="primary"
      />
      <ActionButton
        @click="scanLibraries"
        icon="refresh"
        label="Scan Libraries"
        :disabled="!isHealthy"
        :loading="isScanning"
      />
      <ActionButton
        @click="viewLogs"
        icon="file-text"
        label="View Logs"
      />
    </template>

    <template #workflow-status>
      <div class="media-workflow-status">
        <WorkflowStep
          :status="workflowStatus.download"
          label="Downloads"
          icon="download"
        />
        <WorkflowArrow />
        <WorkflowStep
          :status="workflowStatus.processing"
          label="Processing"
          icon="cog"
        />
        <WorkflowArrow />
        <WorkflowStep
          :status="workflowStatus.library"
          label="Library"
          icon="film"
        />
      </div>
    </template>
  </ServiceCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { usePlexMonitoring } from '@/composables/usePlexMonitoring';

const {
  plexHealth,
  serverInfo,
  libraryStats,
  transcodingInfo,
  workflowStatus,
  checkPlexStatus,
  scanLibraries: scanPlexLibraries,
  getWorkflowStatus
} = usePlexMonitoring();

const isScanning = ref(false);

const plexService = {
  name: 'Plex Media Server',
  url: 'http://192.168.0.99:32400',
  category: 'Media & Entertainment',
  description: 'Media streaming with automated workflow'
};

const isHealthy = computed(() =>
  plexHealth.value?.status === 'healthy'
);

const openPlex = () => {
  window.open('http://192.168.0.99:32400/web', '_blank');
};

const scanLibraries = async () => {
  isScanning.value = true;
  try {
    await scanPlexLibraries();
  } finally {
    isScanning.value = false;
  }
};

const viewLogs = () => {
  // Open logs viewer or modal
  window.open('/logs/plex', '_blank');
};

// Real-time monitoring
let monitoringInterval: number;

onMounted(() => {
  checkPlexStatus();
  getWorkflowStatus();

  // Update every 30 seconds
  monitoringInterval = setInterval(() => {
    checkPlexStatus();
    getWorkflowStatus();
  }, 30000);
});

onUnmounted(() => {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
  }
});
</script>

<style scoped>
.plex-detailed-status {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.library-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.media-workflow-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--surface-variant);
  border-radius: 0.5rem;
}

.transcoding-status {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 600;
}

.transcoding-status .icon.high {
  color: var(--warning);
}

.transcoding-status .icon.medium {
  color: var(--info);
}

.transcoding-status .icon.low {
  color: var(--success);
}
</style>
```

#### **2.2 Plex Monitoring Composable**
```typescript
// composables/usePlexMonitoring.ts
import { ref, reactive } from 'vue';
import { usePrometheusApi } from './usePrometheusApi';

interface PlexHealth {
  status: 'healthy' | 'unhealthy' | 'error';
  responseTime?: number;
  error?: string;
  lastCheck: Date;
  version?: string;
}

interface LibraryStats {
  movies: number;
  shows: number;
  episodes: number;
  music: number;
  lastScan: Date;
}

interface TranscodingInfo {
  active: boolean;
  sessions: number;
  level: 'low' | 'medium' | 'high';
  totalBandwidth: number;
}

interface WorkflowStatus {
  download: 'idle' | 'active' | 'error';
  processing: 'idle' | 'active' | 'error';
  library: 'idle' | 'updating' | 'error';
}

export function usePlexMonitoring() {
  const plexHealth = ref<PlexHealth | null>(null);
  const serverInfo = ref<any>(null);
  const libraryStats = ref<LibraryStats | null>(null);
  const transcodingInfo = ref<TranscodingInfo | null>(null);
  const workflowStatus = ref<WorkflowStatus>({
    download: 'idle',
    processing: 'idle',
    library: 'idle'
  });

  const { queryPrometheus } = usePrometheusApi();

  const checkPlexStatus = async () => {
    try {
      const startTime = performance.now();

      // Health check
      const response = await fetch('http://192.168.0.99:32400/status/sessions', {
        timeout: 5000
      });

      const responseTime = performance.now() - startTime;

      if (response.ok) {
        const data = await response.json();

        plexHealth.value = {
          status: 'healthy',
          responseTime,
          lastCheck: new Date(),
          version: data?.MediaContainer?.version
        };

        // Update transcoding info
        updateTranscodingInfo(data);
      } else {
        plexHealth.value = {
          status: 'unhealthy',
          responseTime,
          lastCheck: new Date()
        };
      }

      // Get library stats from Prometheus
      await updateLibraryStats();

    } catch (error) {
      plexHealth.value = {
        status: 'error',
        error: error.message,
        lastCheck: new Date()
      };
    }
  };

  const updateTranscodingInfo = (sessionData: any) => {
    const sessions = sessionData?.MediaContainer?.Metadata || [];
    const activeTranscoding = sessions.filter((s: any) =>
      s.TranscodeSession?.throttled !== undefined
    );

    transcodingInfo.value = {
      active: activeTranscoding.length > 0,
      sessions: activeTranscoding.length,
      level: getTranscodingLevel(activeTranscoding),
      totalBandwidth: sessions.reduce((total: number, s: any) =>
        total + (parseInt(s.Session?.bandwidth) || 0), 0
      )
    };
  };

  const getTranscodingLevel = (sessions: any[]): 'low' | 'medium' | 'high' => {
    const totalSessions = sessions.length;
    if (totalSessions === 0) return 'low';
    if (totalSessions <= 2) return 'low';
    if (totalSessions <= 4) return 'medium';
    return 'high';
  };

  const updateLibraryStats = async () => {
    try {
      // Get library stats from Plex API
      const response = await fetch('http://192.168.0.99:32400/library/sections');
      if (response.ok) {
        const data = await response.json();
        const sections = data?.MediaContainer?.Directory || [];

        let movies = 0, shows = 0, episodes = 0, music = 0;

        for (const section of sections) {
          const countResponse = await fetch(
            `http://192.168.0.99:32400/library/sections/${section.key}/all?type=${section.type}`
          );
          if (countResponse.ok) {
            const countData = await countResponse.json();
            const count = countData?.MediaContainer?.size || 0;

            switch (section.type) {
              case 'movie':
                movies += count;
                break;
              case 'show':
                shows += count;
                break;
              case 'episode':
                episodes += count;
                break;
              case 'artist':
                music += count;
                break;
            }
          }
        }

        libraryStats.value = {
          movies,
          shows,
          episodes,
          music,
          lastScan: new Date()
        };
      }
    } catch (error) {
      console.error('Failed to update library stats:', error);
    }
  };

  const scanLibraries = async () => {
    try {
      const response = await fetch('http://192.168.0.99:32400/library/sections/all/refresh', {
        method: 'GET'
      });

      if (response.ok) {
        workflowStatus.value.library = 'updating';

        // Poll for completion
        setTimeout(() => {
          updateLibraryStats();
          workflowStatus.value.library = 'idle';
        }, 5000);
      }
    } catch (error) {
      console.error('Failed to scan libraries:', error);
      workflowStatus.value.library = 'error';
    }
  };

  const getWorkflowStatus = async () => {
    try {
      // Check Deluge download status
      const delugeResponse = await fetch('http://192.168.0.111:8112/api');
      workflowStatus.value.download = delugeResponse.ok ? 'active' : 'idle';

      // Check processing directory
      const processingFiles = await fetch('/api/staging-pool/processing/status');
      if (processingFiles.ok) {
        const data = await processingFiles.json();
        workflowStatus.value.processing = data.files > 0 ? 'active' : 'idle';
      }

    } catch (error) {
      console.error('Failed to get workflow status:', error);
    }
  };

  return {
    plexHealth,
    serverInfo,
    libraryStats,
    transcodingInfo,
    workflowStatus,
    checkPlexStatus,
    scanLibraries,
    getWorkflowStatus
  };
}
```

### **Phase 3: Workflow Automation** (Writer + Debug Thread Task)

#### **3.1 Media Processing Pipeline**
```bash
#!/bin/bash
# /usr/local/bin/media-processing-pipeline.sh

STAGING_DOWNLOADS="/staging-pool/downloads"
STAGING_PROCESSING="/staging-pool/processing"
STAGING_COMPLETED="/staging-pool/completed"
MEDIA_MOVIES="/media-pool/movies"
MEDIA_TV="/media-pool/tv-shows"
LOG_FILE="/var/log/media-workflow.log"

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S'): $1" >> "$LOG_FILE"
    echo "$1"
}

process_media_file() {
    local FILE="$1"
    local FILENAME=$(basename "$FILE")
    local EXTENSION="${FILENAME##*.}"

    log_message "Processing: $FILENAME"

    # Skip non-media files
    if [[ ! "$EXTENSION" =~ ^(mkv|mp4|avi|mov|wmv|flv|webm)$ ]]; then
        log_message "Skipping non-media file: $FILENAME"
        return 0
    fi

    # Determine media type and destination
    local DESTINATION=""
    if [[ "$FILENAME" =~ [Ss][0-9][0-9][Ee][0-9][0-9] ]] || [[ "$FILENAME" =~ [0-9][0-9]x[0-9][0-9] ]]; then
        # TV Show pattern detected
        DESTINATION="$MEDIA_TV"
        log_message "Detected TV show: $FILENAME"
    else
        # Assume movie
        DESTINATION="$MEDIA_MOVIES"
        log_message "Detected movie: $FILENAME"
    fi

    # Create processing workspace
    local WORK_DIR="$STAGING_PROCESSING/$(date +%s)_$$"
    mkdir -p "$WORK_DIR"

    # Copy file to processing area
    log_message "Copying to processing area..."
    if cp "$FILE" "$WORK_DIR/"; then
        log_message "Copy successful"
    else
        log_message "ERROR: Copy failed for $FILENAME"
        return 1
    fi

    # Quality check and validation
    log_message "Performing quality check..."
    if ffprobe "$WORK_DIR/$FILENAME" >/dev/null 2>&1; then
        log_message "Media file validation passed"
    else
        log_message "ERROR: Media file validation failed for $FILENAME"
        rm -rf "$WORK_DIR"
        return 1
    fi

    # Organize by type and naming convention
    organize_media_file "$WORK_DIR/$FILENAME" "$DESTINATION"

    # Cleanup processing directory
    rm -rf "$WORK_DIR"
    log_message "Processing completed for: $FILENAME"
}

organize_media_file() {
    local SOURCE_FILE="$1"
    local DEST_BASE="$2"
    local FILENAME=$(basename "$SOURCE_FILE")

    if [[ "$DEST_BASE" == "$MEDIA_TV" ]]; then
        # TV Show organization
        local SHOW_NAME=$(extract_show_name "$FILENAME")
        local SEASON=$(extract_season "$FILENAME")
        local DEST_DIR="$DEST_BASE/$SHOW_NAME/Season $SEASON"

        mkdir -p "$DEST_DIR"
        mv "$SOURCE_FILE" "$DEST_DIR/"
        log_message "TV show organized: $DEST_DIR/$FILENAME"

    else
        # Movie organization
        local YEAR=$(extract_year "$FILENAME")
        local MOVIE_NAME=$(extract_movie_name "$FILENAME")
        local DEST_DIR="$DEST_BASE/$MOVIE_NAME ($YEAR)"

        mkdir -p "$DEST_DIR"
        mv "$SOURCE_FILE" "$DEST_DIR/"
        log_message "Movie organized: $DEST_DIR/$FILENAME"
    fi

    # Trigger Plex library scan
    trigger_plex_scan
}

extract_show_name() {
    local FILENAME="$1"
    # Extract show name before season/episode pattern
    echo "$FILENAME" | sed -E 's/[._-]*[Ss][0-9][0-9][Ee][0-9][0-9].*$//' | tr '_.' ' '
}

extract_season() {
    local FILENAME="$1"
    echo "$FILENAME" | grep -oE '[Ss]([0-9][0-9])' | grep -oE '[0-9][0-9]' | sed 's/^0*//'
}

extract_year() {
    local FILENAME="$1"
    echo "$FILENAME" | grep -oE '\(?(19|20)[0-9][0-9]\)?' | tr -d '()'
}

extract_movie_name() {
    local FILENAME="$1"
    # Extract movie name before year
    echo "$FILENAME" | sed -E 's/[._-]*\(?(19|20)[0-9][0-9]\)?.*$//' | tr '_.' ' '
}

trigger_plex_scan() {
    log_message "Triggering Plex library scan..."
    curl -X GET "http://192.168.0.99:32400/library/sections/all/refresh" >/dev/null 2>&1
    log_message "Plex scan triggered"
}

# Main processing loop
main() {
    log_message "Media processing pipeline started"

    # Monitor downloads directory for completed files
    inotifywait -m "$STAGING_DOWNLOADS" -e moved_to -e create --format '%w%f' | while read FILE; do
        if [[ -f "$FILE" && ! "$FILE" == *.part && ! "$FILE" == *.tmp ]]; then
            # Wait for file to be completely written
            sleep 30

            if [[ -f "$FILE" ]]; then
                process_media_file "$FILE"

                # Move original download to completed
                mkdir -p "$STAGING_COMPLETED/$(date +%Y-%m-%d)"
                mv "$FILE" "$STAGING_COMPLETED/$(date +%Y-%m-%d)/"
            fi
        fi
    done
}

# Run the pipeline
main
```

#### **3.2 Systemd Service Configuration**
```ini
# /etc/systemd/system/media-processing-pipeline.service
[Unit]
Description=Media Processing Pipeline
After=docker.service deluge.service
Requires=docker.service
Wants=deluge.service

[Service]
Type=simple
ExecStart=/usr/local/bin/media-processing-pipeline.sh
Restart=always
RestartSec=10
User=root
Group=root
Environment=PATH=/usr/local/bin:/usr/bin:/bin

[Install]
WantedBy=multi-user.target
```

#### **3.3 Monitoring Integration**
```python
#!/usr/bin/env python3
# /usr/local/bin/plex-metrics-exporter.py

import time
import requests
import xml.etree.ElementTree as ET
from prometheus_client import Gauge, Counter, start_http_server
import docker
from pathlib import Path

# Prometheus metrics
plex_status = Gauge('plex_server_status', 'Plex server health status')
plex_response_time = Gauge('plex_response_time_seconds', 'Plex server response time')
plex_active_sessions = Gauge('plex_active_sessions', 'Number of active Plex sessions')
plex_transcode_sessions = Gauge('plex_transcode_sessions', 'Number of active transcoding sessions')
plex_library_movies = Gauge('plex_library_movies_total', 'Total movies in Plex library')
plex_library_shows = Gauge('plex_library_shows_total', 'Total TV shows in Plex library')
plex_library_episodes = Gauge('plex_library_episodes_total', 'Total TV episodes in Plex library')
plex_processing_queue = Gauge('plex_processing_queue_size', 'Number of files in processing queue')
plex_media_added = Counter('plex_media_added_total', 'Total media files added to Plex', ['type'])

client = docker.from_env()

def check_plex_health():
    try:
        # Server status check
        start_time = time.time()
        response = requests.get('http://192.168.0.99:32400/status/sessions', timeout=5)
        response_time = time.time() - start_time

        plex_response_time.set(response_time)

        if response.status_code == 200:
            plex_status.set(1)

            # Parse session data
            root = ET.fromstring(response.content)
            sessions = root.findall('.//Video') + root.findall('.//Track')

            active_sessions = len(sessions)
            transcode_sessions = len([s for s in sessions if s.find('TranscodeSession') is not None])

            plex_active_sessions.set(active_sessions)
            plex_transcode_sessions.set(transcode_sessions)

        else:
            plex_status.set(0)

    except Exception as e:
        print(f"Plex health check failed: {e}")
        plex_status.set(0)

def check_library_stats():
    try:
        # Get library sections
        response = requests.get('http://192.168.0.99:32400/library/sections')
        if response.status_code == 200:
            root = ET.fromstring(response.content)
            sections = root.findall('.//Directory')

            movies = 0
            shows = 0
            episodes = 0

            for section in sections:
                section_key = section.get('key')
                section_type = section.get('type')

                # Get count for this section
                count_response = requests.get(
                    f'http://192.168.0.99:32400/library/sections/{section_key}/all'
                )
                if count_response.status_code == 200:
                    count_root = ET.fromstring(count_response.content)
                    size = int(count_root.get('size', 0))

                    if section_type == 'movie':
                        movies += size
                    elif section_type == 'show':
                        shows += size
                    elif section_type == 'episode':
                        episodes += size

            plex_library_movies.set(movies)
            plex_library_shows.set(shows)
            plex_library_episodes.set(episodes)

    except Exception as e:
        print(f"Library stats check failed: {e}")

def check_processing_queue():
    try:
        processing_path = Path('/staging-pool/processing')
        if processing_path.exists():
            files = list(processing_path.rglob('*'))
            media_files = [f for f in files if f.suffix.lower() in ['.mkv', '.mp4', '.avi', '.mov']]
            plex_processing_queue.set(len(media_files))
        else:
            plex_processing_queue.set(0)
    except Exception as e:
        print(f"Processing queue check failed: {e}")

if __name__ == '__main__':
    start_http_server(9104)  # Plex metrics on port 9104
    print("Plex metrics exporter started on port 9104")

    while True:
        check_plex_health()
        check_library_stats()
        check_processing_queue()
        time.sleep(30)  # Check every 30 seconds
```

---

## 📱 **Mobile Workflow Management**

### **Mobile-Optimized Plex Management**
```vue
<!-- components/Mobile/PlexMobileManager.vue -->
<template>
  <div class="plex-mobile-manager">
    <Card title="Plex Media Server" icon="film">
      <div class="server-status" :class="serverStatusClass">
        <Icon :name="serverStatusIcon" />
        <span>{{ serverStatusText }}</span>
        <div class="response-time" v-if="responseTime">
          {{ responseTime }}ms
        </div>
      </div>

      <div class="quick-stats" v-if="libraryStats">
        <div class="stat-grid">
          <div class="stat-item">
            <Icon name="film" />
            <div class="stat-content">
              <span class="stat-number">{{ libraryStats.movies }}</span>
              <span class="stat-label">Movies</span>
            </div>
          </div>
          <div class="stat-item">
            <Icon name="tv" />
            <div class="stat-content">
              <span class="stat-number">{{ libraryStats.shows }}</span>
              <span class="stat-label">Shows</span>
            </div>
          </div>
          <div class="stat-item">
            <Icon name="music" />
            <div class="stat-content">
              <span class="stat-number">{{ libraryStats.music }}</span>
              <span class="stat-label">Music</span>
            </div>
          </div>
          <div class="stat-item">
            <Icon name="users" />
            <div class="stat-content">
              <span class="stat-number">{{ activeSessions }}</span>
              <span class="stat-label">Streaming</span>
            </div>
          </div>
        </div>
      </div>

      <div class="workflow-progress" v-if="workflowActivity">
        <h4>Media Workflow</h4>
        <div class="workflow-steps">
          <WorkflowStep
            :status="workflowStatus.download"
            label="Downloads"
            :count="workflowCounts.downloads"
          />
          <WorkflowStep
            :status="workflowStatus.processing"
            label="Processing"
            :count="workflowCounts.processing"
          />
          <WorkflowStep
            :status="workflowStatus.library"
            label="Library"
            :count="workflowCounts.completed"
          />
        </div>
      </div>

      <div class="action-buttons">
        <Button @click="openPlex" size="large" variant="primary">
          <Icon name="play" />
          Open Plex
        </Button>
        <Button @click="scanLibraries" :loading="isScanning" size="large">
          <Icon name="refresh" />
          Scan Libraries
        </Button>
        <Button @click="viewQueue" size="large">
          <Icon name="list" />
          View Queue
        </Button>
      </div>

      <div class="recent-activity" v-if="recentActivity.length">
        <h4>Recent Activity</h4>
        <div class="activity-list">
          <div
            v-for="activity in recentActivity.slice(0, 5)"
            :key="activity.id"
            class="activity-item"
          >
            <Icon :name="activity.icon" />
            <div class="activity-content">
              <span class="activity-title">{{ activity.title }}</span>
              <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePlexMobileWorkflow } from '@/composables/usePlexMobileWorkflow';

const {
  serverStatus,
  libraryStats,
  activeSessions,
  workflowStatus,
  workflowCounts,
  recentActivity,
  isScanning,
  scanLibraries,
  refreshStats
} = usePlexMobileWorkflow();

const serverStatusClass = computed(() => ({
  'status-healthy': serverStatus.value?.status === 'healthy',
  'status-warning': serverStatus.value?.status === 'warning',
  'status-error': serverStatus.value?.status === 'error'
}));

const serverStatusIcon = computed(() => {
  switch (serverStatus.value?.status) {
    case 'healthy': return 'check-circle';
    case 'warning': return 'alert-triangle';
    case 'error': return 'x-circle';
    default: return 'circle';
  }
});

const serverStatusText = computed(() => {
  switch (serverStatus.value?.status) {
    case 'healthy': return 'Online';
    case 'warning': return 'Issues';
    case 'error': return 'Offline';
    default: return 'Unknown';
  }
});

const responseTime = computed(() => serverStatus.value?.responseTime);

const workflowActivity = computed(() =>
  workflowCounts.value.downloads > 0 ||
  workflowCounts.value.processing > 0 ||
  workflowCounts.value.completed > 0
);

const openPlex = () => {
  window.open('http://192.168.0.99:32400/web', '_blank');
};

const viewQueue = () => {
  // Navigate to processing queue view
  // This could be a modal or separate page
};

const formatTime = (timestamp: Date) => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
};

onMounted(() => {
  refreshStats();

  // Refresh every 30 seconds
  setInterval(refreshStats, 30000);
});
</script>

<style scoped>
.plex-mobile-manager {
  width: 100%;
}

.server-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.server-status.status-healthy {
  background: var(--success-surface);
  color: var(--success);
}

.server-status.status-warning {
  background: var(--warning-surface);
  color: var(--warning);
}

.server-status.status-error {
  background: var(--error-surface);
  color: var(--error);
}

.response-time {
  margin-left: auto;
  font-size: 0.875rem;
  opacity: 0.8;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--surface-variant);
  border-radius: 0.5rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.workflow-steps {
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin: 1.5rem 0;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--surface-variant);
  border-radius: 0.375rem;
}

.activity-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.activity-title {
  font-weight: 500;
}

.activity-time {
  font-size: 0.875rem;
  color: var(--text-secondary);
}
</style>
```

---

## ✅ **Success Criteria & Testing**

### **Phase 1 Success: Service Activation**
- ✅ Plex container running and responding on port 32400
- ✅ Web interface accessible at http://192.168.0.99:32400/web
- ✅ Google authentication functional
- ✅ ZFS storage pools properly mounted
- ✅ Basic library scanning operational

### **Phase 2 Success: Dashboard Integration**
- ✅ Plex service card visible in LCiBot dashboard
- ✅ Real-time health monitoring and metrics
- ✅ Library statistics and transcoding status
- ✅ Mobile-optimized interface working
- ✅ Workflow status indicators functional

### **Phase 3 Success: Complete Workflow**
- ✅ End-to-end automation: Firefox → Deluge → Processing → Plex
- ✅ Automatic media organization and library updates
- ✅ Mobile workflow monitoring and control
- ✅ Error handling and recovery procedures
- ✅ Performance monitoring and optimization

### **Testing Checklist**
```bash
# Service activation test
curl -f http://192.168.0.99:32400/web

# Library access test
curl -f "http://192.168.0.99:32400/library/sections"

# Workflow automation test
echo "Test file" > /staging-pool/downloads/test.mp4
# Verify automatic processing

# Mobile interface test
# Access LCiBot dashboard from mobile device
# Verify Plex service card functionality

# Performance test
# Monitor resource usage during operation
# Verify response times within acceptable ranges
```

---

## 🔧 **Troubleshooting Guide**

### **Common Issues & Solutions**

#### **Issue 1: Plex Won't Start**
**Symptoms**: Container fails to start or exits immediately
**Diagnosis**:
```bash
docker logs plex-media-server
docker inspect plex-media-server
df -h /service-pool
```

**Solutions**:
```bash
# Check storage space
df -h /service-pool /media-pool /staging-pool

# Verify permissions
chown -R 1000:1000 /service-pool/plex-config
chmod -R 755 /service-pool/plex-config

# Restart with clean config
docker stop plex-media-server
docker rm plex-media-server
mv /service-pool/plex-config /service-pool/plex-config.backup
docker-compose up -d plex
```

#### **Issue 2: Libraries Not Scanning**
**Symptoms**: New media not appearing in Plex library
**Diagnosis**:
```bash
# Check media file permissions
ls -la /media-pool/movies /media-pool/tv-shows

# Check processing pipeline
systemctl status media-processing-pipeline.service
tail -f /var/log/media-workflow.log

# Manual scan trigger
curl "http://192.168.0.99:32400/library/sections/all/refresh"
```

#### **Issue 3: Workflow Automation Stopped**
**Symptoms**: Files downloading but not being processed
**Diagnosis**:
```bash
# Check all workflow services
systemctl status media-processing-pipeline.service
systemctl status firefox-workflow-monitor.service

# Check directory contents
ls -la /staging-pool/downloads
ls -la /staging-pool/processing

# Check log files
tail -f /var/log/media-workflow.log
tail -f /var/log/firefox-workflow.log
```

---

**Plex Media Workflow Activation Guide Status**: ✅ **COMPREHENSIVE IMPLEMENTATION READY**
**Integration Quality**: Production-ready with complete LCiBot dashboard integration
**Automation Framework**: End-to-end workflow from content discovery to library availability
**Mobile Experience**: Professional mobile interface with real-time monitoring
**Support Level**: Enterprise-grade troubleshooting and performance optimization