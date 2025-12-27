# Frontend Style Guide - LCiBot Retro Dashboard

This document outlines the core design philosophy, component library, and development standards for the LCiBot Vue.js dashboard, which is now standardized on the 'retro' theme.

## 🎨 Core Design Philosophy

### 1. **NES.css 8-bit Aesthetic**
- Authentic retro gaming visual style using NES.css library.
- Pixelated fonts (Press Start 2P) for an authentic feel.
- Chunky borders and classic button styling.
- Props-driven components without CSS class pollution.

### 2. **Seasonal Theming System**
- **Jehkoba64 Color Palette**: A 64-color retro gaming palette forms the base.
- **Automatic Switching**: Themes can transition based on date (details for seasonal asset management are in `ASSETS/seasonal-asset-guidelines.md`).

### 3. **Component-Driven Architecture**
- Zero CSS classes in templates - all styling via computed properties.
- Props control all visual aspects (colors, borders, effects).
- Self-contained components with seasonal theme awareness.

## 🧩 Component Library (NES.css Integration)

### Core NES.css Components
*   **ServiceCard Component**: A container for displaying service information. Styling is props-driven for border style, compact mode, and service status.
*   **NES.css Buttons**: Standard button variants (`is-primary`, `is-success`, `is-warning`) with seasonal color integration.
*   **Typography**: Uses Press Start 2P pixelated font with seasonal color integration and text shadows.

### Integration Patterns
*   **Font Loading**: `Press Start 2P` font loaded from Google Fonts.
*   **Color Override Pattern**: NES.css defaults are overridden with seasonal colors using CSS variables.

## 🌈 Color System & Atmospheric Effects

### CSS Variables
- Primary, secondary, accent, and neutral color ramps based on the Jehkoba64 palette.
- Background system (`bg-primary`, `bg-surface`, `bg-card`) and text colors (`text-primary`, `text-bright`, `text-muted`) are defined.

### Status Color Mapping
- Visual indicators for `online`, `offline`, `checking`, and `error` states are mapped to theme colors.

### Atmospheric Effects
*   **Particle Systems**: Uses `AtmosphericBackground` component for effects like leaves (Forest) or snowflakes (Christmas).
*   **Scanline Overlay**: `ScanlineOverlay` component provides CRT-style horizontal scanlines with subtle flicker and respects `prefers-reduced-motion`.

## 🔧 Development Standards

### General Principles
*   **Props-Driven Styling**: Prioritize using component props for styling over direct CSS classes to maintain consistency and theme integration.
*   **Component Self-Containment**: Components manage their own styling and logic, computed from props and injected theme context.
*   **Type Safety**: Utilizes TypeScript interfaces for strict type checking of props and theme context.

<h2>Mobile-First Interface Standards</h2>

<h3>Cross-Device UX Architecture</h3>
<ul>
<li><strong>Desktop</strong>: Full-featured interfaces (e.g., qBittorrent web UI).</li>
<li><strong>Mobile</strong>: Responsive web interfaces for key services.</li>
<li><strong>Tablet</strong>: Hybrid interfaces with touch-optimized controls.</li>
<li><strong>API Integration</strong>: Consistent backend for all interface types.</li>
</ul>

<h2><a href="#responsive-design" id="responsive-design">Responsive Design</a></h2>

<h3>Breakpoint Strategy</h3>
<pre><code class="language-typescript">// Mobile-first responsive design
const gridClasses = computed(() => ({
  base: 'grid gap-6',
  mobile: 'grid-cols-1',
  tablet: 'md:grid-cols-2',
  desktop: 'lg:grid-cols-3',
  large: 'xl:grid-cols-4'
}))
</code></pre>

<h3>Touch Optimization</h3>
<pre><code class="language-css">/* Touch targets minimum 44px */
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
</code></pre>

<h2><a href="#animation-standards" id="animation-standards">Animation Standards</a></h2>

<h3>Transition Philosophy</h3>
<ul>
<li><strong>Fast interactions</strong>: 150ms for button presses</li>
<li><strong>Normal state changes</strong>: 300ms for hover effects</li>
<li><strong>Slow layout changes</strong>: 500ms for major transitions</li>
</ul>

<h3>Particle Animation</h3>
<pre><code class="language-typescript">// 60fps particle system
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
</code></pre>

<h2><a href="#performance-guidelines" id="performance-guidelines">Performance Guidelines</a></h2>

<h3>Optimization Strategies</h3>
<ul>
<li><strong>NES.css</strong>: Only <code class="language-text">nes.min.css</code> (includes fonts)</li>
<li><strong>Tree Shaking</strong>: Import only needed Lucide icons</li>
<li><strong>Code Splitting</strong>: Components lazy-loaded where appropriate</li>
</ul>

<h3>Runtime Performance</h3>
<pre><code class="language-typescript">// Computed properties for reactive styling
const cardStyles = computed(() => ({
  // Efficient style computation
  background: `linear-gradient(${angle.value}deg, ${color1.value}, ${color2.value})`
}))

// Avoid inline functions in templates
const handleClick = (event: Event) => {
  // Event handler logic
}
</code></pre>

<h2><a href="#layout-standards" id="layout-standards">Layout Standards</a></h2>

<h3>Grid System</h3>
<pre><code class="language-vue">&lt;div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"&gt;
  &lt;ServiceCard v-for="service in services" :key="service.id" :service="service" /&gt;
&lt;/div&gt;
</code></pre>

<h3>Spacing Scale</h3>
<pre><code class="language-css">:root {
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
}
</code></pre>

<h2><a href="#development-tools" id="development-tools">Development Tools</a></h2>

<h3>Vite Configuration</h3>
<pre><code class="language-typescript">// Hot reload with external network access
server: {
  host: '0.0.0.0',
  port: 3000,
  hmr: {
    port: 3000,
    host: '192.168.0.218'
  }
}
</code></pre>

<h3>TypeScript Integration</h3>
<pre><code class="language-typescript">// Strict type checking for props
interface ComponentProps {
  required: string
  optional?: number
}

// Theme type safety
const theme = inject&lt;SeasonalThemeContext&gt;('seasonalTheme')
</code></pre>

<h2><a href="#component-checklist" id="component-checklist">Component Checklist</a></h2>

<h3>✅ Required Elements</h3>
<ul>
<li>[ ] Props-driven styling (no CSS classes)</li>
<li>[ ] Seasonal theme integration</li>
<li>[ ] TypeScript interfaces</li>
<li>[ ] Responsive design</li>
<li>[ ] NES.css class usage where appropriate</li>
<li>[ ] Accessibility considerations</li>
</ul>

<h3>✅ Optional Enhancements</h3>
<ul>
<li>[ ] Atmospheric effects integration</li>
<li>[ ] Custom animations</li>
<li>[ ] Touch optimizations</li>
<li>[ ] Loading states</li>
<li>[ ] Error boundaries</li>
</ul>