# LCiBot Dashboard

A Vue.js-based homelab monitoring dashboard for the Proxmox-based infrastructure. Provides real-time service monitoring, system metrics, and a modern glassmorphic interface optimized for both desktop and mobile use.

## 🚀 Features

- **Real-time Service Monitoring**: Health checks for all homelab services
- **System Metrics Dashboard**: CPU, memory, storage, and network monitoring via Prometheus
- **Mobile-Responsive Design**: Optimized sidebar navigation for phones and tablets
- **Glassmorphic UI**: "Subtle depth" and "clean minimal" card styling
- **Service Quick Access**: Direct links to all homelab services
- **Hot Module Reload**: Fast development with Vite

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Vue 3 (Composition API) + TypeScript
- **Build Tool**: Vite 5.x
- **Styling**: Custom CSS with CSS Variables + Tailwind-inspired utilities
- **Icons**: Lucide Vue Next
- **State Management**: Vue 3 Reactivity (ref/computed)
- **Data Source**: Prometheus metrics via REST API

### Component Structure
```
src/
├── App.vue                           # Main application with sidebar layout
├── components/
│   ├── layout/
│   │   └── SidebarNavigation.vue     # Collapsible sidebar with service links
│   └── monitoring/
│       ├── ServiceHealthCard.vue     # Individual service status cards
│       ├── ServiceHealthDashboard.vue # Service grid layout
│       ├── SystemMetricsWidget.vue   # Real-time system metrics
│       ├── MetricCard.vue           # Individual metric display
│       ├── MiniChart.vue            # Lightweight charts
│       └── Mobile*.vue              # Mobile-optimized components
├── composables/
│   ├── useSystemMetrics.ts          # System metrics data management
│   └── useServiceMonitoring.ts      # Service health monitoring
├── services/
│   └── prometheusApi.ts             # Prometheus client and queries
└── styles/
    └── main.css                     # CSS variables and global styles
```

## 🎨 Design System

### Theme: Jehkoba8 (Lakoba Variant)
- **Primary Color**: `#00FF88` (Bright Green)
- **Secondary Color**: `#8800FF` (Purple)
- **Surface Color**: `#16213E` (Dark Blue-Gray)
- **Text Color**: `#FFFFFF` with opacity variants

### Card Styling Approach
- **Subtle Depth**: Glassmorphic backgrounds with subtle gradients
- **Clean Minimal**: Uncluttered layouts with clear visual hierarchy
- **Hover Effects**: Smooth transforms and color transitions
- **Mobile-First**: Responsive design that works on all screen sizes

### CSS Architecture
```css
/* Design system variables */
:root {
  --lakoba-primary-rgb: 0, 255, 136;
  --lakoba-surface-rgb: 22, 33, 62;
  --lakoba-text: rgba(255, 255, 255, 0.95);
}

/* Card template classes */
.card-subtle-minimal {
  background: linear-gradient(135deg,
    rgba(var(--lakoba-surface-rgb), 0.9),
    rgba(var(--lakoba-primary-rgb), 0.02)
  );
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--lakoba-primary-rgb), 0.1);
}
```

## 🔧 Development

### Setup & Installation
```bash
# Clone the repository
git clone <repository-url>
cd lcibot-dashboard

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Serve production build
python3 simple-server.py
```

### Development Ports
- **Dev Server**: `http://localhost:5173` (Vite default)
- **Custom Dev**: `http://192.168.0.218:8090` (network accessible)
- **Production**: `http://192.168.0.218:8000` (Python simple server)

### Key Development Commands
```bash
# Hot reload development
npm run dev -- --host 0.0.0.0 --port 8090

# Type checking
npm run type-check

# Production build
npm run build

# Preview production build
npm run preview
```

## 📊 Service Monitoring

### Monitored Services
1. **Proxmox VE** (`https://192.168.0.99:8006`) - Virtualization Management
2. **Firefox Container** (`http://192.168.0.99:3001`) - Secure Browsing
3. **Plex Media Server** (`http://192.168.0.99:32400`) - Media Streaming
4. **Grafana Dashboard** (`http://192.168.0.99:3000`) - Metrics Visualization
5. **Deluge Torrent** (`http://192.168.0.111:8112`) - Download Management
6. **File Browser** (`http://192.168.0.99:8080`) - File Management

### Health Check Strategy
- **Optimistic Defaults**: Services assumed online unless timeout occurs
- **CORS Handling**: Uses `no-cors` mode to avoid redirect issues
- **Fast Timeouts**: 3-second timeout for responsive UX
- **Automatic Retry**: Health checks every 30 seconds
- **Error Classification**: Distinguishes timeouts from CORS issues

### Status Types
- 🟢 **Online**: Service responding normally
- 🔄 **Checking**: Health check in progress
- 🔴 **Offline**: Service timeout or genuine failure
- ❓ **Unknown**: No health endpoint configured

## 📱 Mobile Experience

### Responsive Features
- **Collapsible Sidebar**: Slides out on mobile, persistent on desktop
- **Touch-Optimized**: Larger tap targets and gesture-friendly navigation
- **Mobile Header**: Compact header with status indicator on phones
- **Adaptive Grid**: Service cards reflow for optimal mobile viewing
- **Fast Navigation**: Single-tap access to all services

### Responsive Breakpoints
```css
/* Mobile First */
@media (max-width: 768px) {
  .sidebar-mobile { /* Mobile sidebar behavior */ }
  .metrics-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  .metrics-grid { grid-template-columns: 1fr; }
}
```

## 🔍 System Metrics Integration

### Prometheus Queries
- **CPU Usage**: `100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)`
- **Memory Usage**: `(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100`
- **Disk Usage**: `100 - ((node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100)`
- **Load Average**: `node_load1`, `node_load5`, `node_load15`
- **Network**: `rate(node_network_receive_bytes_total[5m])`, `rate(node_network_transmit_bytes_total[5m])`

### Metric Display Features
- **Real-time Updates**: 30-second refresh interval
- **Historical Charts**: 1-hour data retention with 5-minute intervals
- **Status Thresholds**: Color-coded indicators (normal/warning/critical)
- **Formatted Values**: Human-readable units (GB, MB/s, percentages)

## 🚧 Issues & Solutions

### Fixed Issues
1. **White Page on Refresh** ✅
   - **Problem**: Missing imports causing undefined variables
   - **Solution**: Added proper imports for Lucide icons and defined missing reactive variables

2. **FileBrowser Redirects** ✅
   - **Problem**: Health checks causing navigation to FileBrowser
   - **Solution**: Improved CORS handling and optimistic health check strategy

3. **Critical System Status** ✅
   - **Problem**: Disabled health monitoring showing all services offline
   - **Solution**: Re-enabled monitoring with better error handling

### Known Limitations
- **CORS Restrictions**: Some external health checks may fail due to browser security
- **Prometheus Dependency**: System metrics require Prometheus endpoint availability
- **Network Timing**: Health checks depend on local network response times

## 🔮 Future Enhancements

### Planned Features
- **Alert Notifications**: Browser notifications for service outages
- **Custom Dashboards**: User-configurable metric layouts
- **Service History**: Historical uptime tracking
- **Mobile App**: Progressive Web App (PWA) capabilities
- **Dark/Light Themes**: Additional theme options beyond Jehkoba8

### Integration Opportunities
- **Home Assistant**: Smart home device monitoring
- **Docker Stats**: Container resource usage
- **ZFS Metrics**: Storage pool health and performance
- **GPU Monitoring**: NVIDIA GPU utilization when drivers available

## 📋 Deployment Checklist

### Production Deployment
- [ ] Run `npm run build` to create optimized bundle
- [ ] Verify all service URLs are accessible from production environment
- [ ] Test health monitoring on production network
- [ ] Validate mobile responsiveness on actual devices
- [ ] Confirm Prometheus metrics endpoint availability
- [ ] Set up reverse proxy (optional) for custom domain

### Quality Assurance
- [ ] Test all sidebar navigation links
- [ ] Verify service health status accuracy
- [ ] Validate system metrics display
- [ ] Test mobile sidebar collapse/expand
- [ ] Confirm chart rendering and data updates
- [ ] Validate responsive design across screen sizes

## 🤝 Contributing

### Development Workflow
1. Create feature branch from `main`
2. Implement changes with TypeScript
3. Test on both desktop and mobile
4. Build production bundle to verify
5. Update documentation as needed
6. Submit pull request with description

### Code Standards
- **TypeScript**: Strict type checking enabled
- **Vue 3**: Composition API preferred over Options API
- **CSS**: Custom properties over hard-coded values
- **Components**: Single-file components with `<script setup>`
- **Imports**: Explicit imports, no global dependencies

---

**Dashboard Access**: http://192.168.0.218:8000
**Development**: http://192.168.0.218:8090
**Repository**: `/home/darney/projects/proxmox-homelab/lcibot-dashboard/`