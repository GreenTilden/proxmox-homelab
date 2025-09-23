# Frontend Style Guide - LCiBot Seasonal Dashboard

## 🎯 Current Implementation Status

**Dashboard URL**: http://192.168.0.218:3000/
**Framework**: Vue 3 + TypeScript + NES.css + Seasonal Theming
**Status**: ✅ **ACTIVE DEVELOPMENT** with hot reload working

## 🎨 Core Design Philosophy

### 1. **NES.css 8-bit Aesthetic**
- Authentic retro gaming visual style using NES.css library
- Pixelated fonts (Press Start 2P) for authentic feel
- Chunky borders and classic button styling
- Props-driven components without CSS class pollution

### 2. **Seasonal Theming System**
- **Forest Theme** (active until Thanksgiving): Green color ramps with leaf particles
- **Christmas Theme** (after Thanksgiving): Red/green festive colors with snow particles
- **Jehkoba64 Color Palette**: 64-color retro gaming palette as base
- **Automatic Switching**: Date-based theme transitions

### 3. **Component-Driven Architecture**
- Zero CSS classes in templates - all styling via computed properties
- Props control all visual aspects (colors, borders, effects)
- Self-contained components with seasonal theme awareness

## 🧩 Component Library

### Core NES.css Components

#### **ServiceCard Component**
```vue
<template>
  <div
    class="nes-container is-rounded"
    :class="{ 'is-dark': currentSeason === 'forest' }"
    :style="cardStyles"
  >
    <!-- Content with seasonal theming -->
  </div>
</template>
```

**Props-driven styling:**
- `borderStyle`: 'solid' | 'gradient'
- `compactMode`: boolean
- `service`: Service object with status

**Visual Features:**
- Seasonal background gradients
- Status-aware border colors
- Hover effects with transform
- Pixelated rendering

#### **NES.css Buttons**
```vue
<button class="nes-btn is-primary">Primary Action</button>
<button class="nes-btn is-success">Success Action</button>
<button class="nes-btn is-warning">Warning Action</button>
```

**Button Variants:**
- `is-primary`: Seasonal primary colors (forest green/Christmas red)
- `is-success`: Secondary color ramp
- `is-warning`: Accent colors for controls

**Integration with Theme:**
```css
.nes-btn.is-primary {
  background-color: var(--color-primary-4) !important;
  border-color: var(--color-primary-3) !important;
  color: var(--text-primary) !important;
}
```

#### **Typography**
```vue
<h1 class="nes-text is-primary">Dashboard Title</h1>
```

**Features:**
- Press Start 2P pixelated font
- Seasonal color integration
- Text shadows for depth

## 🌲 Seasonal Theming System

### Theme Structure
```typescript
interface SeasonalTheme {
  name: 'forest' | 'christmas'
  primary: ColorRamp     // 5-step color progression
  secondary: ColorRamp   // Supporting colors
  accent: ColorRamp      // Highlight colors
  neutral: ColorRamp     // Grays and backgrounds
  text: TextColors       // Typography colors
  backgrounds: Backgrounds // Surface colors
  effects: Effects       // Shadows and glows
}
```

### Color Ramps (Jehkoba64 Palette)
```typescript
// Forest Theme
const forestTheme = {
  primary: {
    ramp1: '#116061',  // Dark teal
    ramp2: '#068051',  // Forest green
    ramp3: '#179c43',  // Medium green
    ramp4: '#55b33b',  // Bright green
    ramp5: '#94bf30'   // Lime green
  }
  // ... complete theme definition
}
```

### Theme Integration
```typescript
// Components access theme via injection
const themeContext = inject('seasonalTheme')
const { theme, currentSeason } = themeContext

// CSS variables populated automatically
const cardStyles = computed(() => ({
  background: `linear-gradient(135deg, ${theme.value.backgrounds.card}dd, ${theme.value.backgrounds.surface}dd)`,
  borderColor: statusColors.value.border
}))
```

## 🌈 Color System

### CSS Variables (Auto-populated)
```css
:root {
  /* Primary color progression */
  --color-primary-1: #116061;
  --color-primary-2: #068051;
  --color-primary-3: #179c43;
  --color-primary-4: #55b33b;
  --color-primary-5: #94bf30;

  /* Background system */
  --bg-primary: #0a0f0c;
  --bg-surface: #1a2b1e;
  --bg-card: #2d4a32;

  /* Text colors */
  --text-primary: #e8f5e8;
  --text-bright: #ffffff;
  --text-muted: #94a3b8;
}
```

### Status Color Mapping
```typescript
const statusColors = {
  online: theme.value.secondary.ramp4,    // Bright indicator
  offline: theme.value.neutral.ramp2,     // Muted gray
  checking: theme.value.accent.ramp3,     // Warning yellow
  error: theme.value.accent.ramp1         // Alert color
}
```

## 🎭 Atmospheric Effects

### Particle Systems
```vue
<AtmosphericBackground
  :particle-type="currentSeason === 'forest' ? 'leaves' : 'snowflakes'"
  :particle-count="50"
  :enable-physics="true"
/>
```

**Particle Types:**
- **Leaves** (Forest): Green leaf shapes with gravity
- **Snowflakes** (Christmas): White crystalline shapes with wind

### Scanline Overlay
```vue
<ScanlineOverlay
  :opacity="0.03"
  :line-height="4"
  :enable="enableScanlines"
/>
```

**Features:**
- CRT-style horizontal scanlines
- Subtle flicker animation
- Respects `prefers-reduced-motion`

## 🔧 Development Standards

### Props-Driven Styling
```vue
<!-- ❌ Avoid CSS classes -->
<div class="card success-border large-padding">

<!-- ✅ Use props for everything -->
<ServiceCard
  :border-style="'gradient'"
  :compact-mode="false"
  :service="serviceData"
/>
```

### Component Self-Containment
```vue
<script setup lang="ts">
// All styling computed from props + theme
const cardStyles = computed(() => ({
  background: props.background || defaultBackground.value,
  borderColor: props.borderColor || themeBorder.value,
  padding: props.compactMode ? 'var(--space-md)' : 'var(--space-lg)'
}))
</script>
```

### Type Safety
```typescript
interface ServiceCardProps {
  service: Service
  borderStyle?: 'solid' | 'gradient' | 'none'
  compactMode?: boolean
  showActions?: boolean
}

const props = withDefaults(defineProps<ServiceCardProps>(), {
  borderStyle: 'solid',
  compactMode: false,
  showActions: true
})
```

## 🎮 NES.css Integration Patterns

### Font Loading
```css
/* Required Google Fonts import */
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
```

### Component Mapping
| Purpose | NES.css Class | Our Usage |
|---------|---------------|-----------|
| Cards | `.nes-container` | ServiceCard wrapper |
| Buttons | `.nes-btn.is-{variant}` | Action buttons |
| Text | `.nes-text` | Headers and labels |
| Input | `.nes-input` | Form controls |

### Color Override Pattern
```css
/* Override NES.css defaults with seasonal colors */
.nes-btn.is-primary {
  background-color: var(--color-primary-4) !important;
  border-color: var(--color-primary-3) !important;
  color: var(--text-primary) !important;
}
```

## 📱 Responsive Design

### Breakpoint Strategy
```typescript
// Mobile-first responsive design
const gridClasses = computed(() => ({
  base: 'grid gap-6',
  mobile: 'grid-cols-1',
  tablet: 'md:grid-cols-2',
  desktop: 'lg:grid-cols-3',
  large: 'xl:grid-cols-4'
}))
```

### Touch Optimization
```css
/* Touch targets minimum 44px */
.nes-btn {
  min-height: 44px;
  min-width: 44px;
}

/* Active states for touch */
@media (max-width: 768px) {
  .nes-btn:active {
    transform: scale(0.95);
  }
}
```

## 🔄 Animation Standards

### Transition Philosophy
- **Fast interactions**: 150ms for button presses
- **Normal state changes**: 300ms for hover effects
- **Slow layout changes**: 500ms for major transitions

### Particle Animation
```typescript
// 60fps particle system
const animateParticles = () => {
  particles.forEach(particle => {
    particle.y += particle.speed
    particle.x += particle.drift

    // Seasonal behavior
    if (currentSeason.value === 'forest') {
      particle.rotation += particle.rotationSpeed
    }
  })

  requestAnimationFrame(animateParticles)
}
```

## 🚀 Performance Guidelines

### Bundle Optimization
- **NES.css**: Only `nes.min.css` (includes fonts)
- **Tree Shaking**: Import only needed Lucide icons
- **Code Splitting**: Components lazy-loaded where appropriate

### Runtime Performance
```typescript
// Computed properties for reactive styling
const cardStyles = computed(() => ({
  // Efficient style computation
  background: `linear-gradient(${angle.value}deg, ${color1.value}, ${color2.value})`
}))

// Avoid inline functions in templates
const handleClick = (event: Event) => {
  // Event handler logic
}
```

## 📐 Layout Standards

### Grid System
```vue
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  <ServiceCard v-for="service in services" :key="service.id" :service="service" />
</div>
```

### Spacing Scale
```css
:root {
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
}
```

## 🔧 Development Tools

### Vite Configuration
```typescript
// Hot reload with external network access
server: {
  host: '0.0.0.0',
  port: 3000,
  hmr: {
    port: 3000,
    host: '192.168.0.218'
  }
}
```

### TypeScript Integration
```typescript
// Strict type checking for props
interface ComponentProps {
  required: string
  optional?: number
}

// Theme type safety
const theme = inject<SeasonalThemeContext>('seasonalTheme')
```

## 📋 Component Checklist

When creating new components:

### ✅ Required Elements
- [ ] Props-driven styling (no CSS classes)
- [ ] Seasonal theme integration
- [ ] TypeScript interfaces
- [ ] Responsive design
- [ ] NES.css class usage where appropriate
- [ ] Accessibility considerations

### ✅ Optional Enhancements
- [ ] Atmospheric effects integration
- [ ] Custom animations
- [ ] Touch optimizations
- [ ] Loading states
- [ ] Error boundaries

## 🎯 Current Implementation Status

✅ **Completed:**
- NES.css integration with Press Start 2P font
- Seasonal theming system (Forest/Christmas)
- Props-driven ServiceCard component
- Hot reload development environment
- Atmospheric particle effects
- Scanline CRT overlay

🔄 **In Progress:**
- Comprehensive style guide documentation
- Component library expansion
- Mobile optimization testing

📋 **Next Steps:**
- Additional NES.css component integration
- Theme persistence across sessions
- Performance optimization
- Accessibility improvements

---

**Style Guide Status**: ✅ **ACTIVE DEVELOPMENT**
**Last Updated**: 2025-09-22
**Framework Version**: Vue 3.4.0 + NES.css 2.2.1 + Seasonal Theming