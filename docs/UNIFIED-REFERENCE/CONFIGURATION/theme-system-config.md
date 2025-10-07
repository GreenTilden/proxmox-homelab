# Theme System Configuration

## Overview
Configuration guide for the Jehkoba64 seasonal theme system, covering automatic switching, manual overrides, and customization options.

## Configuration Structure

### Core Configuration Files
```typescript
// Central palette definition
/src/themes/jehkoba64-palette.ts

// Theme management composable
/src/composables/useTheme.ts

// Theme provider component
/src/components/theme/SeasonalThemeProvider.vue

// Asset management
/src/components/theme/AtmosphericBackground.vue
```

### Theme Configuration Interface
```typescript
interface UniversalTheme {
  name: string              // Display name
  season: SeasonName        // AUTUMN | HALLOWEEN | WINTER | SPRING
  primary: ColorRamp        // 5-step primary colors
  secondary: ColorRamp      // 5-step secondary colors
  accent: ColorRamp         // 5-step accent colors
  neutral: ColorRamp        // 5-step neutral grays
  backgrounds: {
    app: string             // Darkest background
    surface: string         // Surface layer
    card: string            // Card backgrounds
    elevated: string        // Elevated elements
  }
  text: {
    primary: string         // Main text color
    secondary: string       // Secondary text
    muted: string           // Muted text
    bright: string          // Bright highlights
  }
  status: {
    success: string         // Success indicators
    warning: string         // Warning indicators
    error: string           // Error indicators
    info: string            // Information indicators
  }
  effects: {
    glow: string            // Glow effects
    shadow: string          // Drop shadows
    scanline: string        // Scanline overlay
  }
  particles: {
    colors: string[]        // Particle color palette
    count: number           // Particle count
    physics: PhysicsConfig  // Movement configuration
    size: SizeConfig        // Size range
  }
}
```

## Automatic Theme Switching

### Default Schedule
```typescript
function getSeasonByMonth(month: number): SeasonName {
  switch (month) {
    case 9:  // September
      return 'AUTUMN'
    case 10: // October
      return 'HALLOWEEN'
    case 11: // November
    case 0:  // December (0-based indexing)
    case 1:  // January
    case 2:  // February
      return 'WINTER'
    case 3:  // March
    case 4:  // April
    case 5:  // May
      return 'SPRING'
    default: // June, July, August
      return 'AUTUMN'  // Default fallback
  }
}
```

### Custom Schedule Configuration
To modify the automatic switching schedule, edit `jehkoba64-palette.ts`:

```typescript
// Example: Make Halloween active for entire fall
function getSeasonByMonth(month: number): SeasonName {
  switch (month) {
    case 9:   // September
    case 10:  // October
    case 11:  // November
      return 'HALLOWEEN'  // Extended Halloween season
    // ... rest of cases
  }
}
```

## Manual Theme Override

### Using the Theme Composable
```typescript
import { useTheme } from '@/composables/useTheme'

const {
  currentSeason,        // Current active season
  setTheme,            // Manual theme override
  resetToAutoTheme,    // Return to automatic
  availableThemes      // List of all themes
} = useTheme()

// Force Halloween theme
setTheme('HALLOWEEN')

// Return to automatic date-based switching
resetToAutoTheme()

// Get preview of any theme without switching
const previewTheme = previewTheme('WINTER')
```

### Dashboard Integration
The dashboard includes a theme switching button that cycles through all available themes:

```vue
<button @click="toggleTheme">
  {{ getThemeIcon(currentSeason) }} {{ getThemeName(currentSeason) }}
</button>
```

Button behavior:
- **First Click**: Switches to next theme in sequence
- **Subsequent Clicks**: Continue cycling through themes
- **Return to Current**: When cycling back to current month's theme, returns to automatic mode

## Particle System Configuration

### Physics Presets
```typescript
const PHYSICS_PRESETS = {
  AUTUMN: {
    speed: 0.8,           // Natural falling speed
    direction: 'downward',
    sway: true,           // Wind effect
    wind: 0.4,           // Wind strength
    size: { min: 24, max: 56 }
  },
  HALLOWEEN: {
    speed: 0.6,           // Slower, mysterious
    direction: 'floating',
    sway: true,           // Supernatural sway
    wind: 0.6,           // More chaotic
    size: { min: 20, max: 48 }
  },
  WINTER: {
    speed: 1.2,           // Fast falling snow
    direction: 'downward',
    sway: false,          // Straight down
    wind: 0.3,           // Light wind
    size: { min: 16, max: 32 }
  },
  SPRING: {
    speed: 0.5,           // Gentle floating
    direction: 'upward-drift',
    sway: true,           // Playful movement
    wind: 0.5,           // Moderate wind
    size: { min: 18, max: 40 }
  }
}
```

### Particle Count Configuration
Default particle count is 20 for optimal 60fps performance. To adjust:

```typescript
// In createThemeFromSeason() function
particles: {
  count: 30,  // Increase for more particles (may impact performance)
  // ... other config
}
```

### Performance Tuning
```typescript
// Reduce particles for lower-end devices
const getOptimalParticleCount = () => {
  const isLowEnd = navigator.hardwareConcurrency < 4
  return isLowEnd ? 10 : 20
}
```

## Color Customization

### Modifying Seasonal Palettes
To adjust colors for any season, edit `SEASONAL_PALETTES` in `jehkoba64-palette.ts`:

```typescript
HALLOWEEN: {
  name: 'Halloween',
  primary: [
    '#faa032',  // Pumpkin - modify this hex value
    '#f58122',  // Bright Orange
    // ... add or modify colors as needed
  ],
  backgrounds: {
    app: '#000000',      // Modify background colors
    surface: '#4e278c',
    card: '#773bbf',
    elevated: '#243966'
  }
}
```

### Adding Custom Seasonal Variations
```typescript
// Add new seasonal variant
OCTOBER_ALT: {
  name: 'Dark October',
  primary: [
    '#4e278c',  // Start with deeper purples
    '#773bbf',
    '#000000',
    // ... custom color sequence
  ]
}
```

## Asset Configuration

### Asset Path Management
```typescript
const getParticleAssets = (particleType: string): string[] => {
  switch (particleType) {
    case 'leaf':
      return [
        '/assets/seasons/autumn/leaf_1.png',
        '/assets/seasons/autumn/leaf_2.png'
      ]
    case 'spooky':
      return [
        '/assets/seasons/halloween/spooky_1.png',
        '/assets/seasons/halloween/spooky_2.png',
        // Add more Halloween assets here
      ]
    // Add new asset types
    case 'custom':
      return ['/assets/seasons/custom/particle_1.png']
  }
}
```

### Physics Per Asset Type
```typescript
const getPhysicsMultiplier = (assetPath: string): number => {
  if (assetPath.includes('leaf_1')) return 1.0
  if (assetPath.includes('leaf_2')) return 0.9
  if (assetPath.includes('spooky_1')) return 0.7
  if (assetPath.includes('spooky_2')) return 0.6  // Even slower variant
  // Add custom multipliers
  if (assetPath.includes('custom_')) return 1.5
  return 1.0
}
```

## CSS Variable System

### Available CSS Variables
The theme system automatically generates CSS variables for all components:

```css
/* Color Ramps (1-5 from dark to light) */
--color-primary-1 through --color-primary-5
--color-secondary-1 through --color-secondary-5
--color-accent-1 through --color-accent-5
--color-neutral-1 through --color-neutral-5

/* Backgrounds */
--bg-app, --bg-surface, --bg-card, --bg-elevated

/* Text Colors */
--text-primary, --text-secondary, --text-muted, --text-bright

/* Status Colors */
--status-success, --status-warning, --status-error, --status-info

/* Effects */
--effect-glow, --effect-shadow, --effect-scanline

/* Spacing & Timing */
--space-xs, --space-sm, --space-md, --space-lg, --space-xl
--transition-fast, --transition-normal, --transition-slow
--radius-sm, --radius-md, --radius-lg, --radius-xl
```

### Using Variables in Components
```css
.custom-component {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--color-primary-3);
  box-shadow: 0 2px 8px var(--effect-shadow);
  transition: all var(--transition-normal);
}
```

## Card Transparency Configuration

### Current Transparency Settings
```typescript
// In ServiceCard.vue
background: `rgba(45, 74, 50, 0.1)`,  // 10% opacity for autumn
```

### Season-Specific Transparency
```typescript
const getCardTransparency = (season: SeasonName) => {
  switch (season) {
    case 'HALLOWEEN':
      return 'rgba(119, 59, 191, 0.1)'  // Dark violet
    case 'WINTER':
      return 'rgba(73, 81, 105, 0.15)'  // Blue gray
    case 'SPRING':
      return 'rgba(23, 156, 67, 0.12)'  // Forest green
    default:
      return 'rgba(45, 74, 50, 0.1)'    // Autumn default
  }
}
```

## Development Configuration

### Local Development Settings
```bash
# Force specific theme for development
export FORCE_THEME=HALLOWEEN

# Disable automatic theme switching
export DISABLE_AUTO_THEME=true

# Enable debug logging
export THEME_DEBUG=true
```

### Build Configuration
```typescript
// In vite.config.ts
export default defineConfig({
  define: {
    __THEME_DEBUG__: process.env.NODE_ENV === 'development',
    __FORCE_THEME__: JSON.stringify(process.env.FORCE_THEME || null)
  }
})
```

## Troubleshooting Configuration

### Common Configuration Issues
1. **Theme Not Switching**: Check date/month detection logic
2. **Colors Wrong**: Verify Jehkoba64 palette references
3. **Particles Missing**: Check asset paths and file existence
4. **Performance Issues**: Reduce particle count or optimize assets

### Debug Configuration
```typescript
// Enable detailed logging
const DEBUG_THEME = true

if (DEBUG_THEME) {
  console.log('Current season:', currentSeason.value)
  console.log('Theme colors:', theme.value.primary)
  console.log('Particle config:', theme.value.particles)
}
```

This configuration guide provides complete control over the seasonal theme system while maintaining the integrity of the Jehkoba64 color harmony!