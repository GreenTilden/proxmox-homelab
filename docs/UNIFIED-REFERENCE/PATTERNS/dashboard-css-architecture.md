# Dashboard CSS Architecture Standards

**Version**: 1.0
**Last Updated**: September 20, 2025
**Framework**: Vue 3 + Vite + Custom CSS + Tailwind Utilities

## 🎯 Architecture Overview

This document defines the CSS architecture standards for the LCiBot Dashboard, ensuring consistency, maintainability, and professional appearance across all components.

## 🎨 Design Token System

### Core Color Palette (Jehkoba8 Theme)
```css
:root {
  /* Primary Brand Colors */
  --lakoba-primary-rgb: 0, 255, 136;     /* #00FF88 - Bright Green */
  --lakoba-secondary-rgb: 136, 0, 255;   /* #8800FF - Purple */
  --lakoba-surface-rgb: 22, 33, 62;      /* #16213E - Dark Blue-Gray */

  /* Semantic Colors */
  --lakoba-text: rgba(255, 255, 255, 0.95);
  --lakoba-text-muted: rgba(255, 255, 255, 0.8);
  --lakoba-text-subtle: rgba(255, 255, 255, 0.6);

  /* Status Indicators */
  --status-success: rgba(34, 197, 94, 1);    /* #22C55E */
  --status-warning: rgba(245, 158, 11, 1);   /* #F59E0B */
  --status-critical: rgba(239, 68, 68, 1);   /* #EF4444 */
  --status-info: rgba(59, 130, 246, 1);      /* #3B82F6 */
  --status-neutral: rgba(156, 163, 175, 1);  /* #9CA3AF */

  /* Background System */
  --bg-primary: rgba(var(--lakoba-surface-rgb), 1);
  --bg-secondary: rgba(var(--lakoba-surface-rgb), 0.8);
  --bg-tertiary: rgba(var(--lakoba-surface-rgb), 0.6);
}
```

### Typography Scale
```css
:root {
  /* Font Families */
  --font-primary: 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;

  /* Font Sizes (rem-based for scalability) */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
}
```

### Spacing System
```css
:root {
  /* Spacing Scale (rem-based) */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */

  /* Border Radius */
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.375rem;  /* 6px */
  --radius-lg: 0.5rem;    /* 8px */
  --radius-xl: 0.75rem;   /* 12px */
  --radius-2xl: 1rem;     /* 16px */

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 350ms ease;
}
```

## 🧩 Component Architecture

### Base Card System
```css
/* Glassmorphic Card Base - Used by all dashboard components */
.card-subtle-minimal {
  background: linear-gradient(135deg,
    rgba(var(--lakoba-surface-rgb), 0.9),
    rgba(var(--lakoba-primary-rgb), 0.02)
  );
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--lakoba-primary-rgb), 0.1);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.card-subtle-minimal::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg,
    rgba(var(--lakoba-primary-rgb), 0.1),
    transparent,
    rgba(var(--lakoba-secondary-rgb), 0.05)
  );
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.card-subtle-minimal:hover::before {
  opacity: 1;
}

.card-subtle-minimal:hover {
  transform: translateY(-2px);
  border-color: rgba(var(--lakoba-primary-rgb), 0.3);
  box-shadow:
    0 4px 12px rgba(var(--lakoba-primary-rgb), 0.1),
    0 0 20px rgba(var(--lakoba-primary-rgb), 0.05);
}
```

### Monitoring-Specific Components
```css
/* Metric Card System */
.metric-card-modern {
  /* Extends card-subtle-minimal */
  min-width: 200px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.metric-header-clean {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.metric-icon-clean {
  width: var(--space-5);
  height: var(--space-5);
  color: rgba(var(--lakoba-primary-rgb), 1);
}

.metric-title-clean {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--lakoba-text-muted);
  margin: 0;
}

.metric-value-primary {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--lakoba-text);
  margin: var(--space-2) 0;
}

.metric-subtitle-clean {
  font-size: var(--text-xs);
  color: var(--lakoba-text-subtle);
  margin: 0;
}

/* Status Indicators */
.status-badge-clean {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  border: 1px solid;
  transition: all var(--transition-fast);
}

.status-badge-clean.online {
  background: rgba(var(--status-success), 0.1);
  border-color: rgba(var(--status-success), 0.3);
  color: var(--status-success);
}

.status-badge-clean.offline {
  background: rgba(var(--status-critical), 0.1);
  border-color: rgba(var(--status-critical), 0.3);
  color: var(--status-critical);
}

.status-badge-clean.checking {
  background: rgba(var(--status-warning), 0.1);
  border-color: rgba(var(--status-warning), 0.3);
  color: var(--status-warning);
}

.status-badge-clean.unknown {
  background: rgba(var(--status-neutral), 0.1);
  border-color: rgba(var(--status-neutral), 0.3);
  color: var(--status-neutral);
}
```

### Interactive Elements
```css
/* Button System */
.card-button-clean {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: 1px solid rgba(var(--lakoba-primary-rgb), 0.2);
  border-radius: var(--radius-md);
  background: rgba(var(--lakoba-primary-rgb), 0.05);
  color: var(--lakoba-text);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.card-button-clean::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.card-button-clean:hover::before {
  opacity: 1;
}

.card-button-clean:hover {
  border-color: rgba(var(--lakoba-primary-rgb), 0.4);
  background: rgba(var(--lakoba-primary-rgb), 0.1);
  transform: translateY(-1px);
}

.card-button-clean:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}
```

## 📐 Layout System

### Container Architecture
```css
/* Main Container System */
.dashboard-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--space-4);
  width: 100%;
}

.dashboard-section {
  margin-bottom: var(--space-8);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-6);
}

.dashboard-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--lakoba-text);
  margin: 0 0 var(--space-2) 0;
}

.dashboard-subtitle {
  font-size: var(--text-lg);
  color: var(--lakoba-text-muted);
  margin: 0;
  opacity: 0.8;
}
```

### Grid System
```css
/* Modern CSS Grid with Responsive Behavior */
.metrics-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  width: 100%;
}

.services-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  width: 100%;
}

/* Responsive Grid Adjustments */
@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: var(--space-3);
  }

  .services-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .dashboard-container {
    padding: var(--space-3);
  }

  .dashboard-header {
    flex-direction: column;
    gap: var(--space-3);
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-container {
    padding: var(--space-2);
  }
}
```

## 🎭 Animation & Transition System

### Value Change Animations
```css
/* Smooth value transitions for metrics */
.metric-value-animated {
  transition: all var(--transition-normal);
}

.metric-value-animated.updating {
  color: rgba(var(--lakoba-primary-rgb), 1);
  transform: scale(1.05);
}

/* Loading states */
.loading-shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.1) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Status change animations */
.status-transition {
  transition: all var(--transition-slow);
}

.status-critical {
  animation: pulse-critical 2s infinite;
}

@keyframes pulse-critical {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

### Hover Effects
```css
/* Consistent hover behavior across components */
.interactive-element {
  transition: all var(--transition-fast);
  cursor: pointer;
}

.interactive-element:hover {
  transform: translateY(-1px);
}

.interactive-element:active {
  transform: translateY(0);
  transition-duration: 50ms;
}

/* Card hover effects */
.card-hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

## 🔧 Component Implementation Guidelines

### DO's ✅
1. **Use CSS Custom Properties**: Always use design tokens instead of hardcoded values
2. **Relative Units**: Use rem/em for scalability, avoid px except for borders (1px)
3. **Consistent Spacing**: Use the spacing scale (--space-*) for all margins/padding
4. **Semantic Class Names**: Use descriptive, component-specific class names
5. **Progressive Enhancement**: Design mobile-first, enhance for larger screens

### DON'Ts ❌
1. **Avoid Inline Styles**: Never use `style="..."` attributes
2. **No Magic Numbers**: Don't use arbitrary values (0.847rem, 23px, etc.)
3. **Avoid !important**: Use specificity and cascade correctly
4. **No Global Styles**: Scope styles to components
5. **Don't Mix Units**: Stick to rem/em system throughout

### Component Migration Checklist
- [ ] Remove all inline styles (`style="..."`)
- [ ] Replace pixel-based measurements with rem/em
- [ ] Apply consistent spacing using --space-* variables
- [ ] Use design system colors via CSS custom properties
- [ ] Implement proper hover states and transitions
- [ ] Add responsive behavior using established breakpoints
- [ ] Test across all device sizes and zoom levels

## 📋 File Organization

### CSS Architecture Structure
```
src/
├── styles/
│   ├── tokens/
│   │   ├── colors.css      # Color system
│   │   ├── typography.css  # Font system
│   │   ├── spacing.css     # Spacing & layout
│   │   └── animations.css  # Transitions & animations
│   ├── components/
│   │   ├── cards.css       # Card system
│   │   ├── buttons.css     # Interactive elements
│   │   ├── forms.css       # Form components
│   │   └── status.css      # Status indicators
│   ├── layouts/
│   │   ├── dashboard.css   # Dashboard layouts
│   │   ├── grid.css        # Grid systems
│   │   └── responsive.css  # Media queries
│   └── main.css           # Entry point
```

### Import Order
```css
/* main.css - Proper cascade order */
@import './tokens/colors.css';
@import './tokens/typography.css';
@import './tokens/spacing.css';
@import './tokens/animations.css';
@import './layouts/dashboard.css';
@import './layouts/grid.css';
@import './layouts/responsive.css';
@import './components/cards.css';
@import './components/buttons.css';
@import './components/forms.css';
@import './components/status.css';
```

## 📊 Performance Considerations

### CSS Optimization
- **Critical CSS**: Inline above-the-fold styles
- **CSS Purging**: Remove unused Tailwind classes in production
- **Bundle Splitting**: Separate component-specific styles
- **Compression**: Enable gzip for CSS files

### Runtime Performance
- **Hardware Acceleration**: Use `transform` and `opacity` for animations
- **Reduce Repaints**: Minimize layout-triggering properties
- **Efficient Selectors**: Avoid deep nesting and complex selectors
- **CSS Containment**: Use `contain` property where appropriate

---

**Version Control**: Track changes to this architecture in git
**Review Cycle**: Monthly architecture review and updates
**Compliance**: All new components must follow these standards