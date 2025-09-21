# Component Styling Templates

This document defines standardized CSS class combinations for consistent component styling across the LCiBot dashboard.

## Card Components

### Service Health Card Template
```css
/* Base Structure */
.service-card {
  @apply card-base card-glassmorphism card-hover-lift;
  padding: var(--space-6);
}

/* Status-specific variants */
.service-card.service-online { border-color: rgba(var(--status-success-rgb), 0.3); }
.service-card.service-offline { border-color: rgba(var(--status-error-rgb), 0.3); }
.service-card.service-checking { border-color: rgba(var(--status-warning-rgb), 0.3); }
.service-card.service-unknown { border-color: rgba(var(--status-neutral-rgb), 0.3); }
```

### Metric Card Template
```css
.metric-card {
  @apply card-base card-glassmorphism;
  padding: var(--space-4);
  border-radius: var(--radius-lg);
}
```

## Button Templates

### Primary Action Button
```css
.action-button {
  @apply btn-base btn-primary;
}
```

### Icon Button
```css
.icon-button {
  @apply btn-base;
  padding: var(--space-2);
  width: auto;
  aspect-ratio: 1;
}
```

## Status Indicator Templates

### Service Status
```css
.status-indicator {
  @apply status-indicator-base;
}

/* Variants */
.status-indicator.online { @apply status-online; }
.status-indicator.offline { @apply status-offline; }
.status-indicator.checking { @apply status-checking; }
.status-indicator.unknown { @apply status-unknown; }
```

## Icon Container Templates

### Service Icon
```css
.service-icon {
  @apply icon-container;
  margin-top: var(--space-1);
}
```

## Typography Templates

### Service Name
```css
.service-name {
  @apply text-sm font-medium;
  color: var(--lakoba-text);
}
```

### Service Description
```css
.service-description {
  @apply text-xs;
  color: var(--lakoba-text-muted);
  margin-top: var(--space-1);
}
```

### Metric Label/Value
```css
.metric-label {
  @apply text-xs;
  color: var(--lakoba-text-muted);
}

.metric-value {
  @apply text-xs font-medium;
  color: var(--lakoba-primary);
}
```

## Layout Templates

### Service Header
```css
.service-header {
  @apply flex items-start justify-between;
  margin-bottom: var(--space-3);
}
```

### Service Actions
```css
.service-actions {
  @apply flex items-center justify-between;
  gap: var(--space-2);
}
```

### Metric Row
```css
.metric-row {
  @apply flex items-center justify-between text-xs;
}
```

## Responsive Templates

### Mobile Card Adjustments
```css
@media (max-width: 768px) {
  .service-card {
    padding: var(--space-4);
  }

  .service-actions {
    @apply flex-col;
    gap: var(--space-3);
  }

  .action-button {
    @apply w-full justify-center;
  }
}
```

## Animation Templates

### Hover Effects
```css
.hover-lift:hover {
  transform: translateY(-4px) scale(1.02);
}

.hover-glow:hover {
  box-shadow: var(--shadow-xl);
}

.hover-rotate:hover {
  transform: scale(1.1) rotate(5deg);
}
```

### Loading States
```css
.loading-pulse {
  animation: pulse-glow 2s infinite;
}

.loading-spin {
  animation: rotate 2s linear infinite;
}
```

## Usage Examples

### Complete Service Card Implementation
```vue
<template>
  <div class="service-card" :class="statusClass">
    <div class="service-header">
      <div class="service-info">
        <component :is="icon" class="service-icon" />
        <div>
          <h4 class="service-name">{{ service.name }}</h4>
          <p class="service-description">{{ service.description }}</p>
        </div>
      </div>
      <div class="status-indicator" :class="statusIndicatorClass">
        {{ statusIcon }}
      </div>
    </div>

    <div class="service-actions">
      <button class="action-button">
        <RefreshCw class="w-3 h-3" />
        Refresh
      </button>
    </div>
  </div>
</template>
```

This template system ensures:
- **Consistency**: All components use the same design patterns
- **Maintainability**: Changes to design system propagate automatically
- **Flexibility**: Components can mix and match template classes
- **Performance**: CSS custom properties enable efficient updates