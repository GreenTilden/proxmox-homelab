# Dashboard CSS Architecture Standards (Retro Theme)

**Version**: 1.0
**Last Updated**: December 26, 2025
**Framework**: Vue 3 + Vite + NES.css + Custom CSS

## 🎯 Architecture Overview

This document defines the CSS architecture standards for the LCiBot Dashboard, specifically tailored for the 'retro' theme using NES.css. The goal is to maintain an authentic 8-bit aesthetic, ensure consistency, and provide a clear structure for styling components.

## 🎨 Core Design Philosophy

### NES.css 8-bit Aesthetic
- Authentic retro gaming visual style using NES.css library.
- Pixelated fonts (Press Start 2P) for an authentic feel.
- Chunky borders and classic button styling.

### Component-Driven Styling
- Props-driven styling where possible, minimizing direct CSS class usage in templates.
- Self-contained components.

## 🌈 Color System

### CSS Variables (Auto-populated from Seasonal Theme)
The primary color system is managed through the Seasonal Theming System. CSS variables are dynamically populated, ensuring all components adhere to the current seasonal palette.

```css
:root {
  /* Primary color progression (example for retro) */
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

  /* Status Indicators (dynamically mapped from theme) */
  --status-success: var(--color-primary-4);
  --status-warning: var(--color-accent-3);
  --status-critical: var(--color-accent-1);
}
```

### NES.css Overrides & Color Mapping
Custom CSS is used to override NES.css defaults and integrate them with the dynamic seasonal color palette.

```css
/* Example: Override NES.css primary button color */
.nes-btn.is-primary {
  background-color: var(--color-primary-4) !important;
  border-color: var(--color-primary-3) !important;
  color: var(--text-primary) !important;
}

/* Example: NES.css container with dynamic background */
.nes-container.is-rounded {
  background: linear-gradient(135deg, var(--bg-card)dd, var(--bg-surface)dd);
}
```

## 🧩 Component-Specific Styling

### Standard Components (NES.css based)
*   **Cards (`.nes-container`)**: Used for service cards, metrics, and data displays.
*   **Buttons (`.nes-btn`)**: For all interactive elements. Variants (`is-primary`, `is-success`, `is-warning`) are mapped to seasonal colors.
*   **Typography (`.nes-text`)**: Applied to headers, labels, and content for the pixelated font style.

### Custom Component Styling
For components not directly covered by NES.css, or for specific overrides, component-scoped CSS (or utility classes) is used.

<h2>Layout System</h2>

<h3>Grid System</h3>
The dashboard uses a responsive CSS Grid system (via Tailwind CSS utility classes within Vue components) for layout.

<pre><code class="language-css">/* Example: Responsive grid adjustments */
.metrics-grid {
  display: grid;
  gap: 1.5rem; /* Equivalent to var(--space-6) */
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 1rem; /* Equivalent to var(--space-4) */
  }
}
</code></pre>

<h3>Spacing</h3>
A consistent spacing scale is defined using CSS variables (`--space-xs` to `--space-xl`) and applied throughout the components.

<h2><a href="#animation-transition-system" id="animation-transition-system">Animation & Transition System</a></h2>

Animations and transitions are managed using CSS transitions and `@keyframes` for smooth UI feedback, ensuring a retro yet responsive feel.

<h2><a href="#file-organization" id="file-organization">File Organization</a></h2>

<h3>CSS Architecture Structure</h3>
Global styles and overrides are located in `src/style.css` which imports the main `nes.min.css` and then custom variables/overrides.

<pre><code class="language-text">src/
├── style.css           # Entry point for global styles and imports
├── styles/             # Modular custom styles (if needed beyond NES.css)
│   ├── _variables.css  # Custom CSS variables not managed by theme system
│   └── _base.css       # Basic resets or global typography
├── components/         # Component-scoped styles within .vue files
│   └── Component.vue
</code></pre>

<h3>Import Order</h3>
<pre><code class="language-css">/* src/main.ts */
import './style.css'; // This imports nes.min.css and global custom CSS

/* src/style.css */
@import 'nes.css/css/nes.min.css';
@import './styles/_variables.css'; /* Custom variables */
@import './styles/_base.css';     /* Global base styles */
/* Component-specific styles are typically scoped within .vue files */
</code></pre>

<h2><a href="#performance-considerations" id="performance-considerations">Performance Considerations</a></h2>

<h3>CSS Optimization</h3>
<ul>
<li><strong>NES.css</strong>: Utilizes the minified version (<code class="language-text">nes.min.css</code>).</li>
<li><strong>CSS Purging</strong>: Implemented for removing unused utility classes in the build process.</li>
<li><strong>Compression</strong>: Ensure gzip is enabled for CSS files on the server.</li>
</ul>

<h3>Runtime Performance</h3>
<ul>
<li><strong>Hardware Acceleration</strong>: Use <code class="language-text">transform</code> and <code class="language-text">opacity</code> for animations</li>
<li><strong>Reduce Repaints</strong>: Minimize layout-triggering properties</li>
<li><strong>Efficient Selectors</strong>: Avoid deep nesting and complex selectors</li>
<li><strong>CSS Containment</strong>: Use <code class="language-text">contain</code> property where appropriate</li>
</ul>
