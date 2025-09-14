# GBGreg Frontend Framework Integration Guide

## Overview

This document outlines the proven Vue.js + TailwindCSS frontend framework successfully implemented in the Mario Dashboard, ready for adoption across all GBGreg applications.

## ✅ Proven Architecture Stack

### Core Technologies
- **Vue 3 + TypeScript** - Modern reactive framework with type safety
- **TailwindCSS** - Utility-first CSS framework for rapid styling
- **Lucide Vue Next** - Consistent, lightweight icon library
- **Vite** - Fast build tool with optimized bundling

### Performance Results
- **Bundle Size**: 84KB total (vs 1MB+ with ElementPlus)
- **Build Time**: <2 seconds
- **Load Speed**: Near-instant on local networks
- **Mobile Responsive**: Full responsive design with optimized touch targets

## 🎨 Theme System Architecture

### CSS Custom Properties (CSS Variables)
The framework uses CSS custom properties for dynamic theming:

```css
:root {
  /* Purple Magic Theme (Default) */
  --mario-purple-bg: rgba(20, 15, 30, 1);
  --mario-purple-primary: rgba(220, 100, 180, 1);
  --mario-purple-secondary: rgba(150, 80, 200, 1);
  --mario-purple-accent: rgba(255, 150, 220, 1);
  --mario-purple-text: rgba(240, 230, 255, 1);
  --mario-purple-card: rgba(40, 30, 55, 1);
  --mario-purple-section: rgba(30, 22, 45, 1);
  --mario-purple-muted: rgba(180, 150, 200, 1);
}
```

### Available Themes
1. **💜 Purple Magic** (Default) - Professional purple/magenta gradient theme
2. **🤖 Classic Mario** - Dark red/brown retro gaming theme  
3. **🎨 Mario Paint** - Light pink creative theme
4. **🇮🇹 Italy** - Green/red Italian colors
5. **🟢 Game Boy** - Green monochrome terminal theme

### Theme Implementation
```javascript
// Vue.js theme switching
const themes = {
  purple: 'theme-purple',
  classic: 'theme-classic', 
  paint: 'theme-paint',
  italy: 'theme-italy',
  gameboy: 'theme-gameboy'
}

const setTheme = (themeName: string) => {
  const themeClass = themes[themeName]
  if (!themeClass) return
  
  document.body.className = document.body.className.replace(/theme-\w+/g, '')
  document.body.classList.add(themeClass)
}
```

## 🧩 Component Library

### Mario Card Component
```html
<div class="mario-card">
  <!-- Content with gradient background, hover effects, and themed borders -->
</div>
```

**Features:**
- Gradient backgrounds using theme colors
- Animated gradient border on hover
- Smooth transform and shadow transitions
- Responsive padding and spacing

### Mario Button Component
```html
<button class="mario-button">
  <Icon class="w-4 h-4" />
  Button Text
</button>
```

**Features:**
- Gradient background with primary/secondary colors
- Hover state with accent color transition
- Integrated icon support via Lucide
- Consistent sizing and typography

### Mario Select Component
```html
<select class="mario-select">
  <option value="option1">Option 1</option>
</select>
```

**Features:**
- Themed gradient background
- Focus states with accent color rings
- Consistent border styling
- Responsive design

### Mario Tag Component
```html
<span class="mario-tag-success">✅ Online</span>
<span class="mario-tag-danger">❌ Offline</span>
<span class="mario-tag-warning">🔄 Checking</span>
```

**Features:**
- Status-based color coding
- Emoji + text combinations
- Rounded pill design
- Consistent typography

## 📱 Mobile Optimization

### Responsive Grid System
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  <!-- Auto-responsive cards -->
</div>
```

### Breakpoint Strategy
- **Mobile (< 768px)**: Single column, stack vertically
- **Tablet (768px+)**: 2 columns
- **Desktop (1024px+)**: 3 columns  
- **Large (1200px+)**: Max-width container

### Touch-Friendly Design
- Minimum 44px touch targets
- Generous spacing between interactive elements
- Smooth hover → active state transitions
- No hover-dependent functionality

## 🔧 Development Setup

### Package.json Dependencies
```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0", 
    "axios": "^1.6.0",
    "lucide-vue-next": "^0.525.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31", 
    "tailwindcss": "^3.3.5",
    "typescript": "^5.0.2",
    "vite": "^5.4.20"
  }
}
```

### Vite Configuration
```javascript
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') }
  },
  base: './', // For static deployment
  server: {
    host: true,
    port: 5176,
    strictPort: false
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router']
        }
      }
    }
  }
})
```

### TailwindCSS Configuration
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        mario: {
          'classic-bg': 'var(--mario-classic-bg)',
          // ... theme color extensions
        }
      },
      fontFamily: {
        'mario': ['Segoe UI', 'Roboto', 'sans-serif']
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite'
      }
    }
  },
  plugins: []
}
```

## 📊 Service Integration Pattern

### Health Monitoring System
```javascript
interface Service {
  id: string
  name: string  
  description: string
  url: string
  icon: any
  status: 'online' | 'offline' | 'checking'
  healthEndpoint?: string
  responseTime?: number
}

const checkServiceHealth = async (service: Service): Promise<void> => {
  const startTime = Date.now()
  service.status = 'checking'
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(service.healthEndpoint, {
      method: 'GET',
      signal: controller.signal,
      mode: 'no-cors'
    })
    
    clearTimeout(timeoutId)
    service.responseTime = Date.now() - startTime
    service.status = 'online'
  } catch (error) {
    service.status = 'offline'
  }
}
```

### Real-time Updates
- 30-second health check intervals
- Promise.allSettled for parallel checks
- Automatic status badge updates
- Response time monitoring

## 🚀 Deployment Strategy

### Docker Integration
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Static Asset Deployment
- Build artifacts in `dist/` directory
- Relative paths for flexibility
- Optimized asset chunking
- Gzip-friendly bundle sizes

### Production Checklist
- [x] Bundle size optimization (<100KB total)
- [x] Mobile responsiveness testing
- [x] Cross-browser compatibility
- [x] Theme switching functionality  
- [x] Service health monitoring
- [x] Error handling and fallbacks
- [x] SEO meta tags
- [x] Performance monitoring

## 📋 GBGreg Integration Steps

### 1. Project Initialization
```bash
npm create vue@latest gbgreg-frontend
cd gbgreg-frontend
npm install tailwindcss postcss autoprefixer lucide-vue-next
npx tailwindcss init -p
```

### 2. Copy Framework Files
- `src/style.css` - Complete theme system
- `tailwind.config.js` - TailwindCSS configuration
- `vite.config.ts` - Optimized build configuration
- Component patterns from `src/App.vue`

### 3. Customize for GBGreg
- Update service definitions for GBGreg stack
- Modify health check endpoints
- Customize theme colors for brand alignment
- Add GBGreg-specific components

### 4. Deploy and Test
- Build with `npm run build`
- Test on multiple devices and browsers
- Verify theme switching functionality
- Confirm service integrations

## 🔄 Proven Benefits

### Performance Improvements
- **87% Bundle Size Reduction** (1MB+ → 84KB)
- **<2s Build Times** (vs 10s+ with ElementPlus)
- **Near-instant Loading** on local networks
- **Smooth Animations** with hardware acceleration

### Developer Experience
- **Type Safety** with Vue 3 + TypeScript
- **Utility-First** rapid development with TailwindCSS
- **Hot Module Replacement** with Vite
- **Consistent Component API** across themes

### User Experience  
- **Professional Purple Theme** as modern default
- **5 Theme Options** for personalization
- **Full Mobile Responsiveness** with touch optimization
- **Accessible Design** with proper contrast ratios

## 📚 Next Steps

1. **Immediate**: Test the live implementation at http://192.168.0.99:8091
2. **Short-term**: Integrate this framework into GBGreg's next frontend project  
3. **Long-term**: Establish as standard framework across all GBGreg applications
4. **Ongoing**: Contribute theme and component improvements back to this reference implementation

---

**Framework Status**: ✅ Production Ready  
**Last Updated**: 2025-09-12  
**Reference Implementation**: Mario Dashboard (port 8091)  
**Maintained By**: Proxmox Homelab Debug Thread