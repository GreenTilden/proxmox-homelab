# ⚡ Writer Thread - Vue.js Mario Dashboard Implementation (Cycle 2)

## Thread Identity & Authority
**Directory**: `~/projects/proxmox-homelab-writer/`  
**Symbol**: ⚡  
**Model**: Opus (Implementation & System Modification)  
**Cycle**: **2** - Vue.js Dashboard Development  
**Date**: 2025-09-12  
**Sequential Position**: Thread 3 of 5 (Main → Reader → **Writer** → Debug → Documentation)

## Mission Objective
Implement Vue.js Mario-themed dashboard to replace static Homer dashboard (http://192.168.0.99:8090) using greentilden.github.io template as foundation with Reader Thread technical analysis.

## Cycle 2 Context
**Current Homer Dashboard**: http://192.168.0.99:8090 - Static 16-bit gaming themed interface
**Reader Analysis Complete**: Vue 3 + Element Plus architecture documented, theme system analyzed
**Implementation Target**: Dynamic dashboard with 4 Mario theme palettes and 15+ real-time service status cards
**Deployment Target**: Replace Homer at http://192.168.0.99:8090 with containerized Vue.js application

## Implementation Directives

### 1. Project Setup & Foundation - Complete Technical Specifications

#### **Vue 3 Architecture from Reader Analysis**
- **Vue Version**: 3.5.13 (latest stable with Composition API)
- **Build System**: Vite 6.3.5 with manual chunking optimization
- **UI Framework**: Element Plus 2.9.10 (fully themed integration)
- **Router**: Vue Router 4.5.1 with nested route support
- **Additional Dependencies**:
  - `vue3-particles`: 2.9.3 (background effects)
  - `vue-draggable-next`: 2.2.1 (service card reordering)
  - `vue3-observe-visibility`: 1.0.3 (lazy loading)

#### **Vite Configuration Template**
```javascript
export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    VueDevTools(),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          title: 'Mario Homelab Dashboard',
          favicon: '/mario-favicon.png'
        }
      }
    })
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  server: {
    host: '0.0.0.0',
    port: 5176,
    historyApiFallback: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router'],
          'element-plus': ['element-plus'],
          'homelab-services': [
            './src/components/ServiceCard.vue',
            './src/composables/useServiceStatus.js'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
})
```

#### **Project Structure Template**
```
homelab-mario-dashboard/
├── src/
│   ├── components/
│   │   ├── ServiceCard.vue          # Individual service status cards
│   │   ├── ServiceGrid.vue          # Responsive service layout
│   │   ├── ThemeSelector.vue        # Mario theme switching UI
│   │   └── StatusIndicator.vue      # Service health indicators
│   ├── composables/
│   │   ├── useTheme.js             # Theme system (extended with Mario)
│   │   ├── useServiceStatus.js     # Service monitoring logic
│   │   └── useHomelabServices.js   # Service definitions and configs
│   ├── views/
│   │   ├── Dashboard.vue           # Main dashboard layout
│   │   └── ServiceDetail.vue       # Individual service management
│   ├── assets/
│   │   ├── mario-icons/            # Mario-themed service icons
│   │   └── backgrounds/            # Theme background patterns
│   └── router/index.js             # Route configuration
├── Dockerfile                      # Multi-stage container build
└── docker-compose.yml             # Service orchestration
```

#### **Package.json Configuration**
```json
{
  "name": "homelab-mario-dashboard",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "vite build",
    "build:docker": "vite build --mode production",
    "preview": "vite preview",
    "type-check": "vue-tsc --noEmit"
  },
  "dependencies": {
    "vue": "^3.5.13",
    "vue-router": "^4.5.1",
    "element-plus": "^2.9.10",
    "@element-plus/icons-vue": "^2.3.1",
    "axios": "^1.6.0"
  }
}
```

### 2. Mario Theme System Implementation - Complete CSS Variable Specifications

**Integration Path**: Add to `/src/composables/useTheme.js` themes object following existing pattern (forest, ocean, monochrome, purdue, pacers).

#### **Technical Foundation from Reader Analysis**
- **Theme Engine**: CSS custom property system via `useTheme.js` composable
- **Element Plus Integration**: Complete CSS variable override system in `style.css`
- **Theme Switching**: `document.documentElement.style.setProperty()` real-time updates
- **Mobile Optimization**: Touch-friendly theme selector with animation system

#### **4 Complete Mario Theme Definitions**

##### **🎮 Jehkoba16 (Classic 16-bit)**
```javascript
jehkoba16: {
  '--bg-color': 'rgba(27, 17, 15, 1)',              // Dark retro brown
  '--section-bg': 'rgba(45, 35, 30, 1)',            // Mario pipe brown
  '--card-bg': 'rgba(65, 50, 40, 1)',               // Brick texture brown
  '--primary-color': 'rgba(255, 0, 0, 1)',          // Classic Mario red
  '--primary-dark': 'rgba(204, 0, 0, 1)',           // Dark Mario red
  '--secondary-color': 'rgba(0, 102, 204, 1)',      // Mario overalls blue
  '--text-color': 'rgba(255, 255, 255, 1)',         // Pixel white
  '--text-light': 'rgba(255, 255, 255, 1)',
  '--text-faded': 'rgba(220, 220, 220, 1)',
  '--text-muted': 'rgba(180, 180, 180, 0.7)',
  '--border-color': 'rgba(102, 51, 0, 1)',          // Pipe border
  '--border-light': 'rgba(102, 51, 0, 0.5)',
  '--success-color': 'rgba(0, 255, 0, 1)',          // 1-UP green
  '--error-color': 'rgba(255, 0, 0, 1)',            // Game over red
  '--warning-color': 'rgba(255, 255, 0, 1)',        // Coin yellow
  '--shadow-sm': '0 2px 4px rgba(0, 0, 0, 0.8)',   // Pixel shadows
  '--shadow-md': '0 4px 8px rgba(0, 0, 0, 0.8)',
  '--shadow-lg': '0 8px 16px rgba(0, 0, 0, 0.8)'
}
```

##### **🎨 Mario Paint (Creative Suite)**
```javascript
mario_paint: {
  '--bg-color': 'rgba(255, 240, 245, 1)',           // Canvas pink
  '--section-bg': 'rgba(255, 228, 225, 1)',         // Soft pink
  '--card-bg': 'rgba(255, 255, 255, 1)',            // Paint canvas
  '--primary-color': 'rgba(255, 107, 157, 1)',      // Paint brush pink
  '--primary-dark': 'rgba(196, 69, 105, 1)',        // Deep pink
  '--secondary-color': 'rgba(102, 204, 255, 1)',    // Sky blue
  '--text-color': 'rgba(51, 51, 51, 1)',            // Paint text
  '--text-light': 'rgba(51, 51, 51, 1)',
  '--text-faded': 'rgba(102, 102, 102, 1)',
  '--text-muted': 'rgba(153, 153, 153, 0.7)',
  '--border-color': 'rgba(255, 182, 193, 1)',       // Light pink border
  '--border-light': 'rgba(255, 182, 193, 0.5)',
  '--success-color': 'rgba(144, 238, 144, 1)',      // Paint green
  '--error-color': 'rgba(255, 99, 71, 1)',          // Paint red
  '--warning-color': 'rgba(255, 215, 0, 1)',        // Paint yellow
  '--shadow-sm': '0 2px 4px rgba(0, 0, 0, 0.1)',   // Soft shadows
  '--shadow-md': '0 4px 8px rgba(0, 0, 0, 0.15)',
  '--shadow-lg': '0 8px 16px rgba(0, 0, 0, 0.2)'
}
```

##### **🇮🇹 Italy-4 (Flag Inspired)**
```javascript
italy_4: {
  '--bg-color': 'rgba(25, 50, 25, 1)',              // Deep Italian green
  '--section-bg': 'rgba(40, 70, 40, 1)',            // Forest green
  '--card-bg': 'rgba(55, 85, 55, 1)',               // Olive green
  '--primary-color': 'rgba(0, 146, 70, 1)',         // Italian flag green
  '--primary-dark': 'rgba(0, 100, 50, 1)',          // Dark green
  '--secondary-color': 'rgba(206, 43, 55, 1)',      // Italian flag red
  '--text-color': 'rgba(255, 255, 255, 1)',         // Italian white
  '--text-light': 'rgba(255, 255, 255, 1)',
  '--text-faded': 'rgba(230, 230, 230, 1)',
  '--text-muted': 'rgba(200, 200, 200, 0.7)',
  '--border-color': 'rgba(146, 70, 0, 1)',          // Tuscan brown
  '--border-light': 'rgba(146, 70, 0, 0.5)',
  '--success-color': 'rgba(0, 146, 70, 1)',         // Flag green
  '--error-color': 'rgba(206, 43, 55, 1)',          // Flag red
  '--warning-color': 'rgba(255, 215, 0, 1)',        // Pasta gold
  '--shadow-sm': '0 2px 4px rgba(0, 0, 0, 0.3)',
  '--shadow-md': '0 4px 8px rgba(0, 0, 0, 0.4)',
  '--shadow-lg': '0 8px 16px rgba(0, 0, 0, 0.5)'
}
```

##### **🟢 Game Boy (Classic LCD)**
```javascript
game_boy: {
  '--bg-color': 'rgba(15, 56, 15, 1)',              // Deep LCD green
  '--section-bg': 'rgba(48, 98, 48, 1)',            // Game Boy body
  '--card-bg': 'rgba(139, 172, 15, 1)',             // LCD screen
  '--primary-color': 'rgba(155, 188, 15, 1)',       // Game Boy green
  '--primary-dark': 'rgba(107, 129, 11, 1)',        // Dark LCD green
  '--secondary-color': 'rgba(48, 98, 48, 1)',       // Deep green
  '--text-color': 'rgba(15, 56, 15, 1)',            // LCD dark text
  '--text-light': 'rgba(15, 56, 15, 1)',
  '--text-faded': 'rgba(48, 98, 48, 1)',
  '--text-muted': 'rgba(48, 98, 48, 0.7)',
  '--border-color': 'rgba(48, 98, 48, 1)',          // Game Boy border
  '--border-light': 'rgba(48, 98, 48, 0.5)',
  '--success-color': 'rgba(155, 188, 15, 1)',       // Bright LCD
  '--error-color': 'rgba(107, 129, 11, 1)',         // Dark LCD
  '--warning-color': 'rgba(139, 172, 15, 1)',       // Mid LCD
  '--shadow-sm': '0 2px 4px rgba(15, 56, 15, 0.5)',// LCD shadows
  '--shadow-md': '0 4px 8px rgba(15, 56, 15, 0.6)',
  '--shadow-lg': '0 8px 16px rgba(15, 56, 15, 0.7)'
}
```

#### **Theme Display Names**
```javascript
getThemeDisplayName = (themeName) => {
  const displayNames = {
    forest: '🌲 Forest',
    ocean: '🌊 Ocean', 
    monochrome: '⚫ Monochrome',
    purdue: '🚂 Purdue',
    pacers: '🏀🌽 Pacers',
    jehkoba16: '🎮 Classic Mario',
    mario_paint: '🎨 Mario Paint',
    italy_4: '🇮🇹 Italy',
    game_boy: '🟢 Game Boy'
  }
  return displayNames[themeName] || themeName
}
```

### 3. Service Status Card Architecture
Implement real-time service monitoring for 15+ homelab services:

#### **Core Services (High Priority)**
- **Plex Media Server**: http://192.168.0.99:32400
  - Status: Online/Offline detection
  - Metrics: Active streams, library size
  - Integration: API status checking
- **Grafana Dashboard**: http://192.168.0.99:3000
  - Status: Dashboard availability
  - Metrics: Active dashboards, alert status
- **FileBrowser**: http://192.168.0.99:8080
  - Status: Service availability
  - Metrics: Storage usage, recent activity

#### **Media Acquisition Services**
- **Deluge Torrent Client**: http://192.168.0.111:8112
  - Status: Download queue status
  - Metrics: Active torrents, download speeds
- **Firefox Container**: http://192.168.0.99:3001
  - Status: Container running status
  - Metrics: Resource usage

#### **Monitoring & Infrastructure**
- **Prometheus**: http://192.168.0.99:9090
  - Status: Metrics collection status
  - Integration: Query health endpoints
- **Node Exporter**: Port 9100
- **ZFS Exporter**: Port 9101
- **Additional services**: WireGuard, System Monitor, etc.

### 4. Mobile-Responsive Interface Implementation - Complete Touch Architecture

#### **Touch Optimization from Reader Analysis**
Based on `/src/styles/mobile-workflow.css` analysis:

##### **Touch Gesture System**
```css
/* Touch-friendly base classes */
.touch-device * {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}

.service-card {
  touch-action: manipulation;
  cursor: pointer;
  transition: all 0.2s ease;
}

.service-card:active {
  transform: scale(0.98);
  opacity: 0.9;
}
```

##### **Responsive Breakpoints (Mobile-First)**
```css
/* Mobile: Default styles */
.service-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: 1rem;
}

/* Tablet: 768px+ */
@media (min-width: 768px) {
  .service-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .service-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
  }
}
```

##### **Mario Theme Switcher Mobile UI**
```vue
<template>
  <div class="mario-theme-fab" @click="toggleThemeMenu">
    <div class="mario-icon">🎮</div>
  </div>
  <div v-if="showThemeMenu" class="theme-selector-mobile">
    <div 
      v-for="theme in marioThemes" 
      :key="theme.name"
      class="theme-option"
      @click="selectTheme(theme.name)"
      :class="{ active: currentTheme === theme.name }"
    >
      <div class="theme-icon">{{ theme.emoji }}</div>
      <div class="theme-name">{{ theme.display }}</div>
    </div>
  </div>
</template>
```

#### **Service Card Touch Interactions**
##### **Swipe Gestures for Service Management**
- **Swipe Right**: Quick access to service dashboard
- **Swipe Left**: Service settings and configuration
- **Long Press**: Service details and status history
- **Double Tap**: Service restart/management actions

##### **Touch-Optimized Status Indicators**
```vue
<div class="status-indicator-touch" :class="status">
  <div class="status-pulse" v-if="status === 'online'"></div>
  <div class="status-dot"></div>
  <div class="status-label">{{ statusText }}</div>
</div>
```

#### **Performance Optimizations for Mobile**
##### **Lazy Loading Strategy**
```javascript
import { defineAsyncComponent } from 'vue'

const ServiceCard = defineAsyncComponent({
  loader: () => import('@/components/ServiceCard.vue'),
  loadingComponent: ServiceCardSkeleton,
  delay: 100,
  timeout: 3000
})
```

##### **Virtual Scrolling for Large Service Lists**
```vue
<virtual-list
  :data-sources="homelabServices"
  :data-component="ServiceCard"
  :estimate-size="120"
  :buffer="5"
/>
```

##### **Momentum Scrolling and Snap Points**
```css
.service-grid-mobile {
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: y proximity;
  overscroll-behavior-y: contain;
}

.service-card {
  scroll-snap-align: start;
  scroll-margin: 1rem;
}
```

### 5. Real-Time Data Integration - Complete Service Card Architecture

#### **Service Card Component Specification**
```vue
<template>
  <el-card class="service-card" :class="[statusClass, `theme-${currentTheme}`]">
    <div class="service-header">
      <div class="service-icon" :class="`icon-${service.type}`">
        <component :is="service.iconComponent" />
      </div>
      <div class="service-info">
        <h3 class="service-title">{{ service.name }}</h3>
        <p class="service-description">{{ service.description }}</p>
      </div>
      <div class="service-status">
        <status-indicator 
          :status="service.status" 
          :last-check="service.lastCheck"
        />
      </div>
    </div>
    <div class="service-metrics" v-if="service.metrics">
      <div v-for="metric in service.metrics" :key="metric.name" class="metric">
        <span class="metric-label">{{ metric.label }}</span>
        <span class="metric-value">{{ formatMetric(metric.value, metric.type) }}</span>
      </div>
    </div>
    <div class="service-actions">
      <el-button 
        type="primary" 
        size="small" 
        @click="openService"
        class="mario-button"
      >
        Access
      </el-button>
      <el-button 
        type="info" 
        size="small" 
        @click="showDetails"
        class="mario-button"
      >
        Details
      </el-button>
    </div>
  </el-card>
</template>
```

#### **Service Status API Integration Patterns**

##### **HTTP Health Check Implementation**
```javascript
// useServiceStatus.js composable
import { ref, computed } from 'vue'
import axios from 'axios'

export function useServiceStatus(service) {
  const status = ref('unknown')
  const lastCheck = ref(null)
  const metrics = ref({})
  const error = ref(null)
  
  const statusClass = computed(() => ({
    'status-online': status.value === 'online',
    'status-warning': status.value === 'warning', 
    'status-error': status.value === 'error',
    'status-unknown': status.value === 'unknown'
  }))
  
  const checkServiceHealth = async () => {
    try {
      const response = await axios.get(service.healthEndpoint, {
        timeout: 5000,
        validateStatus: (status) => status < 500
      })
      
      if (response.status === 200) {
        status.value = 'online'
        metrics.value = response.data.metrics || {}
      } else {
        status.value = 'warning'
      }
    } catch (err) {
      status.value = 'error'
      error.value = err.message
    } finally {
      lastCheck.value = new Date()
    }
  }
  
  return {
    status,
    lastCheck,
    metrics,
    error,
    statusClass,
    checkServiceHealth
  }
}
```

##### **Homelab Service Definitions**
```javascript
// useHomelabServices.js
export const homelabServices = [
  {
    id: 'plex',
    name: 'Plex Media Server',
    description: 'Media streaming and management',
    type: 'media',
    url: 'http://192.168.0.99:32400',
    healthEndpoint: 'http://192.168.0.99:32400/web/index.html',
    iconComponent: 'PlayCircle',
    metrics: [
      { name: 'streams', label: 'Active Streams', type: 'count' },
      { name: 'library_size', label: 'Library Size', type: 'storage' }
    ]
  },
  {
    id: 'grafana',
    name: 'Grafana Dashboard',
    description: 'Metrics visualization and monitoring',
    type: 'monitoring',
    url: 'http://192.168.0.99:3000',
    healthEndpoint: 'http://192.168.0.99:3000/api/health',
    iconComponent: 'TrendCharts',
    metrics: [
      { name: 'dashboards', label: 'Dashboards', type: 'count' },
      { name: 'alerts', label: 'Active Alerts', type: 'status' }
    ]
  },
  {
    id: 'deluge',
    name: 'Deluge Torrent Client',
    description: 'Download management and torrenting',
    type: 'download',
    url: 'http://192.168.0.111:8112',
    healthEndpoint: 'http://192.168.0.111:8112/json',
    iconComponent: 'Download',
    metrics: [
      { name: 'active_torrents', label: 'Active', type: 'count' },
      { name: 'download_speed', label: 'Speed', type: 'bandwidth' }
    ]
  },
  // ... Additional 12+ services
]
```

#### **Real-Time Status Updates**

##### **Polling Strategy with Exponential Backoff**
```javascript
// Service monitoring with intelligent polling
export function useServiceMonitoring(services) {
  const intervals = ref(new Map())
  
  const startMonitoring = (service) => {
    let pollInterval = 30000 // 30 seconds default
    let failures = 0
    
    const poll = async () => {
      try {
        await checkServiceHealth(service)
        failures = 0
        pollInterval = 30000 // Reset to normal interval
      } catch (error) {
        failures++
        pollInterval = Math.min(pollInterval * 1.5, 300000) // Max 5 minutes
      }
      
      // Schedule next poll
      const timeoutId = setTimeout(poll, pollInterval)
      intervals.value.set(service.id, timeoutId)
    }
    
    poll() // Initial check
  }
  
  return { startMonitoring }
}
```

##### **WebSocket Integration for Real-Time Services**
```javascript
// WebSocket connection for services that support it
export function useWebSocketStatus(service) {
  const socket = ref(null)
  
  const connectWebSocket = () => {
    if (service.websocketEndpoint) {
      socket.value = new WebSocket(service.websocketEndpoint)
      
      socket.value.onmessage = (event) => {
        const data = JSON.parse(event.data)
        updateServiceStatus(service.id, data)
      }
      
      socket.value.onclose = () => {
        // Reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000)
      }
    }
  }
  
  return { connectWebSocket }
}
```

#### **Error Handling and Graceful Degradation**
```javascript
const errorStates = {
  network: 'Connection failed - check network',
  timeout: 'Service response timeout',
  unauthorized: 'Authentication required',
  unavailable: 'Service temporarily unavailable',
  unknown: 'Unknown error occurred'
}

const getErrorMessage = (error) => {
  if (error.code === 'NETWORK_ERROR') return errorStates.network
  if (error.code === 'TIMEOUT') return errorStates.timeout
  if (error.response?.status === 401) return errorStates.unauthorized
  if (error.response?.status >= 500) return errorStates.unavailable
  return errorStates.unknown
}
```

## Technical Implementation Requirements

### Container Deployment Strategy
- **Docker Configuration**: Multi-stage Dockerfile for optimized production builds
- **Port Mapping**: Deploy at http://192.168.0.99:8090 (replacing Homer)
- **Volume Management**: Configuration persistence and theme customization storage
- **Resource Allocation**: Efficient resource usage for homelab environment
- **Health Checks**: Container health monitoring and automatic restart capabilities

### Development Workflow
- **Local Development**: Hot-reload development environment setup
- **Build Optimization**: Production build with asset compression and caching
- **Testing Strategy**: Component testing for service cards and theme switching
- **Deployment Pipeline**: Automated build and container deployment process

### Integration with Existing Infrastructure
- **ZFS Storage Integration**: Proper mount points and storage access patterns
- **Grafana Theme Consistency**: Coordinate with existing 16-bit gaming theme
- **Service Discovery**: Automatic detection of available homelab services
- **Configuration Management**: User customization and theme persistence

## Required Deliverables

### 1. Complete Vue.js Dashboard Application
- **Functional Mario Theme Switcher**: 4 working theme palettes with smooth transitions
- **Service Status Cards**: Real-time monitoring for 15+ homelab services
- **Mobile-Responsive Interface**: Touch-optimized responsive design
- **Production-Ready Build**: Optimized bundle for container deployment

### 2. Container Deployment Package
- **Dockerfile**: Multi-stage build configuration for production deployment
- **Docker Compose**: Service orchestration with proper networking and volumes
- **Configuration Files**: Environment-specific settings and theme customization
- **Deployment Scripts**: Automated deployment and update procedures

### 3. Service Integration Framework
- **API Client Library**: Reusable service integration patterns
- **Status Monitoring Components**: Standardized service health checking
- **Real-Time Updates**: WebSocket and polling implementations
- **Error Handling**: Comprehensive error states and recovery mechanisms

### 4. Mobile Optimization Implementation
- **Responsive Breakpoints**: Mobile-first CSS implementation
- **Touch Interactions**: Gesture support and mobile navigation
- **Performance Optimization**: Fast loading and smooth animations
- **Cross-Device Testing**: Verified functionality across device types

### 5. Next Thread Handoff Package
**Debug Thread Optimization Guide** containing:
- **Performance Baseline**: Current metrics and optimization targets
- **Mobile Compatibility Issues**: Known issues requiring debugging attention
- **Service Integration Problems**: API connection issues and error states
- **Theme System Optimization**: CSS performance and animation smoothness
- **Container Performance**: Resource usage and optimization opportunities

## Success Metrics
- ✅ **Functional Replacement**: Homer dashboard successfully replaced at http://192.168.0.99:8090
- ✅ **Mario Theme System**: All 4 palettes working with smooth theme transitions
- ✅ **Service Monitoring**: Real-time status cards for all 15+ homelab services
- ✅ **Mobile Optimization**: Touch-friendly interface working across all device types
- ✅ **Performance Excellence**: Fast loading and responsive user interactions
- ✅ **Container Deployment**: Production-ready containerized application

## Implementation Framework
**Systematic Development Approach**:
1. **Foundation Setup**: Project structure and dependency configuration
2. **Theme System**: Mario palette implementation and testing
3. **Service Cards**: Individual service monitoring components
4. **Integration**: Real-time data connections and API implementations
5. **Mobile Optimization**: Responsive design and touch interface implementation
6. **Container Deployment**: Production build and deployment configuration
7. **Testing & Validation**: Cross-device testing and performance verification

## 🔄 Current 5-Thread Execution Status - Cycle 2
- **🎯 Main (Opus)**: ✅ COMPLETE - Orchestration and architecture framework established
- **🔍 Reader (Sonnet)**: ✅ COMPLETE - Technical analysis and Mario theme specifications provided
- **⚡ Writer (Opus)**: **ACTIVE** - Vue.js Mario dashboard implementation in progress
- **🔧 Debug (Opus)**: PENDING - Performance optimization and mobile compatibility refinement  
- **📚 Documentation (Sonnet)**: PENDING - Pattern capture and cross-project knowledge synthesis

## Sequential Workflow Position
**Previous**: Reader Thread (Technical Analysis Complete)  
**Current**: Writer Thread Implementation  
**Next**: Debug Thread (Performance & Mobile Optimization)  
**Handoff Target**: Working Vue.js Mario dashboard ready for optimization

## Cycle 2 Success Definition
Deploy functional Vue.js Mario dashboard replacing Homer with:
- ✅ **Dynamic Interface**: Interactive service management replacing static links
- ✅ **Mario Theme System**: Working 4-palette theme switcher
- ✅ **Real-Time Monitoring**: Live status updates for all homelab services
- ✅ **Mobile Excellence**: Touch-optimized responsive interface
- ✅ **Production Deployment**: Container-ready application at http://192.168.0.99:8090

---

**Expected Completion**: Production-ready Vue.js Mario dashboard deployed and operational, ready for Debug Thread optimization.