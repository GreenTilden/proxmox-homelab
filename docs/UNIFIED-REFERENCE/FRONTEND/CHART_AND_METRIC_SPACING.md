# Chart and Metric Element Spacing Best Practices

This guide covers consistent spacing for ApexCharts (donut, radialBar, bar) and metric card components across all frontend projects.

## ApexCharts Spacing

### Donut Chart Center Labels

The center labels in donut charts need explicit `offsetY` values to prevent overlap between the value and name/label text.

```typescript
// CORRECT: Properly spaced donut chart labels
plotOptions: {
  pie: {
    donut: {
      size: '65%',
      labels: {
        show: true,
        name: {
          show: true,
          fontSize: '14px',
          color: 'var(--text-color)',
          offsetY: -10,  // Push name UP
        },
        value: {
          show: true,
          fontSize: '24px',
          fontWeight: 600,
          color: 'var(--text-color)',
          offsetY: 10,   // Push value DOWN
        },
        total: {
          show: true,
          label: 'Total',
          fontSize: '12px',
          color: 'var(--text-muted)',
          // Total appears below value, inherits offsetY from value
        },
      },
    },
  },
},
```

### RadialBar Chart Labels

RadialBar charts have different spacing needs - the label and value appear in the hollow center.

```typescript
// CORRECT: Properly spaced radialBar labels
plotOptions: {
  radialBar: {
    hollow: {
      size: '60%',  // Adjust for content size
      margin: 10,   // Gap between bar and content
    },
    track: {
      background: 'var(--track-color)',
      strokeWidth: '100%',
    },
    dataLabels: {
      name: {
        show: true,
        fontSize: '12px',
        color: 'var(--text-muted)',
        offsetY: -8,  // Push name UP from center
      },
      value: {
        show: true,
        fontSize: '20px',
        fontWeight: 700,
        color: 'var(--text-color)',
        offsetY: 8,   // Push value DOWN from center
        formatter: (val) => `${val}%`,
      },
    },
  },
},
```

### Bar Chart Data Labels

For bar charts with data labels above/inside bars:

```typescript
// CORRECT: Properly positioned bar data labels
plotOptions: {
  bar: {
    horizontal: false,
    columnWidth: '60%',
    borderRadius: 8,
    dataLabels: {
      position: 'top',  // or 'center' for inside
    },
  },
},
dataLabels: {
  enabled: true,
  formatter: (val) => val.toString(),
  offsetY: -20,  // Push label above bar (for position: 'top')
  style: {
    fontSize: '12px',
    fontWeight: 600,
    colors: ['var(--text-color)'],
  },
},
```

## Metric Card Spacing

### Standard Metric Card Structure

```vue
<template>
  <div class="metric-card">
    <div class="metric-icon">
      <IconComponent />
    </div>
    <div class="metric-content">
      <div class="metric-label">Label Text</div>
      <div class="metric-value">{{ value }}</div>
      <div class="metric-subtitle">{{ subtitle }}</div>
    </div>
  </div>
</template>
```

### Consistent Spacing Values

```css
.metric-card {
  display: flex;
  align-items: center;
  gap: 1rem;              /* 16px - space between icon and content */
  padding: 1rem;          /* 16px - internal padding */
}

.metric-icon {
  width: 48px;            /* Fixed size */
  height: 48px;
  flex-shrink: 0;         /* Prevent squishing */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.metric-content {
  flex: 1;
  min-width: 0;           /* Allow text truncation */
}

.metric-label {
  font-size: 0.75rem;     /* 12px */
  color: var(--text-muted);
  margin-bottom: 0.25rem; /* 4px gap to value */
  line-height: 1.2;
}

.metric-value {
  font-size: 1.5rem;      /* 24px */
  font-weight: 700;
  color: var(--text-color);
  line-height: 1;         /* Tight line-height for numbers */
  margin-bottom: 0.25rem; /* 4px gap to subtitle */
}

.metric-subtitle {
  font-size: 0.75rem;     /* 12px */
  color: var(--text-muted);
  line-height: 1.2;
}
```

### Large Metric Cards (Dashboard Headers)

```css
.metric-card-large {
  gap: 1.5rem;            /* 24px */
  padding: 1.5rem;        /* 24px */
}

.metric-card-large .metric-icon {
  width: 64px;
  height: 64px;
  font-size: 2rem;
}

.metric-card-large .metric-label {
  font-size: 0.875rem;    /* 14px */
  margin-bottom: 0.5rem;  /* 8px */
}

.metric-card-large .metric-value {
  font-size: 2rem;        /* 32px */
  margin-bottom: 0.5rem;  /* 8px */
}
```

## Common Spacing Mistakes

### 1. Missing offsetY on chart labels
```typescript
// BAD: Labels will overlap
dataLabels: {
  name: { show: true, fontSize: '14px' },
  value: { show: true, fontSize: '24px' },
}

// GOOD: Labels properly spaced
dataLabels: {
  name: { show: true, fontSize: '14px', offsetY: -10 },
  value: { show: true, fontSize: '24px', offsetY: 10 },
}
```

### 2. Inconsistent line-height on metric values
```css
/* BAD: Extra space below numbers */
.metric-value {
  font-size: 24px;
  /* line-height defaults to ~1.5 */
}

/* GOOD: Tight spacing for numbers */
.metric-value {
  font-size: 24px;
  line-height: 1;
}
```

### 3. Fixed pixel margins instead of relative units
```css
/* BAD: Doesn't scale with font-size changes */
.metric-label { margin-bottom: 4px; }

/* GOOD: Scales proportionally */
.metric-label { margin-bottom: 0.25rem; }
```

## Shared ApexCharts Theme Utility

Create a shared utility for consistent chart theming:

```typescript
// utils/chartTheme.ts
export const getChartTheme = (isDark: boolean) => ({
  colors: {
    text: isDark ? '#c9c7cd' : '#1a1a1a',
    textMuted: isDark ? 'rgba(201, 199, 205, 0.6)' : 'rgba(26, 26, 26, 0.6)',
    background: isDark ? '#161617' : '#ffffff',
    grid: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  },
});

export const getDonutChartOptions = (theme: ReturnType<typeof getChartTheme>) => ({
  chart: {
    type: 'donut' as const,
    fontFamily: 'inherit',
    background: 'transparent',
  },
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: '14px',
            color: theme.colors.text,
            offsetY: -10,
          },
          value: {
            show: true,
            fontSize: '24px',
            fontWeight: 600,
            color: theme.colors.text,
            offsetY: 10,
          },
        },
      },
    },
  },
  legend: {
    position: 'bottom' as const,
    labels: { colors: theme.colors.text },
  },
  grid: {
    borderColor: theme.colors.grid,
  },
  tooltip: {
    theme: 'dark',
  },
});

export const getRadialBarOptions = (theme: ReturnType<typeof getChartTheme>) => ({
  chart: {
    type: 'radialBar' as const,
    fontFamily: 'inherit',
    background: 'transparent',
  },
  plotOptions: {
    radialBar: {
      hollow: {
        size: '60%',
        margin: 10,
      },
      track: {
        background: theme.colors.grid,
        strokeWidth: '100%',
      },
      dataLabels: {
        name: {
          show: true,
          fontSize: '12px',
          color: theme.colors.textMuted,
          offsetY: -8,
        },
        value: {
          show: true,
          fontSize: '20px',
          fontWeight: 700,
          color: theme.colors.text,
          offsetY: 8,
        },
      },
    },
  },
});
```

## Quick Reference: Spacing Values

| Element | Property | Small | Default | Large |
|---------|----------|-------|---------|-------|
| Card padding | padding | 0.75rem | 1rem | 1.5rem |
| Icon-content gap | gap | 0.75rem | 1rem | 1.5rem |
| Label margin-bottom | margin | 0.125rem | 0.25rem | 0.5rem |
| Value margin-bottom | margin | 0.125rem | 0.25rem | 0.5rem |
| Chart label offsetY (name) | offsetY | -6 | -10 | -14 |
| Chart label offsetY (value) | offsetY | 6 | 10 | 14 |

## Applying to Existing Projects

### proxmox-homelab Frontend
- Update `MetricCard.vue` to use consistent spacing
- Add `offsetY` to ZFSPoolChart donut options

### gbgreg Frontend
- Update `UserMetricsDashboard.vue` donut options
- Update `ProjectIntelligenceAudit.vue` chart configs
- Standardize `.stat-card` and `.metric-card` spacing
