# Jehkoba64 Seasonal Theme System

## Overview
Complete seasonal theming system built on the official **Jehkoba64** 64-color palette from [Lospec](https://lospec.com/palette-list/jehkoba64). Provides automatic month-based theme switching with sophisticated particle effects and color harmonies.

## Architecture

### Core Components
- **`jehkoba64-palette.ts`**: Centralized 64-color palette with seasonal groupings
- **`useTheme.ts`**: Universal theme composable with automatic season detection
- **`SeasonalThemeProvider.vue`**: Theme provider with CSS variable injection
- **`AtmosphericBackground.vue`**: Seasonal particle system with Jehkoba64 color mapping

### Theme Structure
```typescript
interface UniversalTheme {
  name: string
  season: SeasonName
  primary: ColorRamp         // 5-step color progression
  secondary: ColorRamp       // Complementary colors
  accent: ColorRamp          // Highlight colors
  neutral: ColorRamp         // UI grays
  backgrounds: {             // Surface colors
    app, surface, card, elevated
  }
  effects: {                 // Visual effects
    glow, shadow, scanline
  }
  particles: {               // Seasonal particles
    colors, count, physics, size
  }
}
```

## Seasonal Themes

### 🍂 Autumn (September)
**Primary Palette:**
- `#d94c8e` (Hot Pink) - Autumn maple
- `#eb758f` (Coral Pink) - Bright autumn
- `#f2621f` (Orange Red) - Classic autumn
- `#fad937` (Golden Yellow) - Golden leaves
- `#b3b02d` (Yellow Green) - Turning leaves
- `#c40c2e` (Dark Red) - Dried leaves
- `#ad6a45` (Brown) - Oak leaves
- `#faa032` (Pumpkin) - Sunset leaves

**Assets**: `/assets/seasons/autumn/leaf_1.png`, `leaf_2.png`
**Physics**: Gentle falling (speed: 0.8, sway: true, wind: 0.4)

### 🎃 Halloween (October)
**Primary Palette:**
- `#faa032` (Pumpkin) - Jack-o'-lantern
- `#f58122` (Bright Orange) - Halloween orange
- `#773bbf` (Dark Violet) - Witch purple
- `#4e278c` (Deep Purple) - Deep magic
- `#000000` (Black) - Midnight
- `#c40c2e` (Dark Red) - Blood red
- `#807980` (Gray) - Ghostly
- `#472e3e` (Dark Maroon) - Gothic

**Assets**: `/assets/seasons/halloween/spooky_1.png`, `spooky_2.png` (user-provided)
**Physics**: Mysterious floating (speed: 0.6, wind: 0.6, rotation: 180°)

### ❄️ Winter (November-February)
**Primary Palette:**
- `#49c2f2` (Sky Blue) - Ice blue
- `#25acf5` (Bright Blue) - Winter sky
- `#f2f2da` (Cream) - Snow
- `#a69a9c` (Light Gray) - Frost
- `#495169` (Blue Gray) - Winter clouds
- `#195ba6` (Navy) - Deep winter
- `#696570` (Purple Gray) - Winter shadows
- `#a0eba8` (Mint) - Pine

**Assets**: Future snowflake assets
**Physics**: Fast falling snow (speed: 1.2, sway: false)

### 🌸 Spring (March-May)
**Primary Palette:**
- `#7ccf9a` (Light Green) - Fresh growth
- `#94bf30` (Bright Lime) - New leaves
- `#a0eba8` (Mint) - Spring mint
- `#fabbaf` (Light Pink) - Cherry blossom
- `#ffb938` (Yellow) - Daffodil
- `#49c2f2` (Sky Blue) - Spring sky
- `#ae88e3` (Lavender) - Lilac
- `#eb758f` (Coral Pink) - Tulip

**Assets**: Future petal assets
**Physics**: Gentle upward drift (speed: 0.5, direction: upward-drift)

## Implementation Guide

### Adding New Seasonal Assets
1. **Create assets** in appropriate `/assets/seasons/{season}/` directory
2. **Update asset paths** in `AtmosphericBackground.vue` `getParticleAssets()`
3. **Configure physics** in `getPhysicsMultiplier()` and `getRotationVariance()`
4. **Test integration** with theme switching UI

### Color Harmony Rules
- **Primary colors**: Use 8 Jehkoba64 colors that represent the season
- **Backgrounds**: Progress from darkest to lightest for depth
- **Text colors**: Always use cream (`#f2f2da`) for readability
- **Status colors**: Map to seasonal equivalents while maintaining meaning

### Physics Presets
```typescript
AUTUMN: { speed: 0.8, direction: 'downward', sway: true, wind: 0.4 }
HALLOWEEN: { speed: 0.6, direction: 'floating', sway: true, wind: 0.6 }
WINTER: { speed: 1.2, direction: 'downward', sway: false, wind: 0.3 }
SPRING: { speed: 0.5, direction: 'upward-drift', sway: true, wind: 0.5 }
```

## Theme Switching

### Automatic Switching (Default)
- **September**: Autumn theme
- **October**: Halloween theme
- **November-February**: Winter theme
- **March-May**: Spring theme
- **June-August**: Defaults to Autumn

### Manual Override
```typescript
import { useTheme } from '@/composables/useTheme'

const { setTheme, resetToAutoTheme } = useTheme()

// Force Halloween theme
setTheme('HALLOWEEN')

// Return to automatic date-based switching
resetToAutoTheme()
```

### UI Integration
Theme switching button cycles through all available themes and returns to automatic mode when reaching the current month's theme.

## Asset Requirements

### Technical Specifications
- **Format**: PNG with transparent background
- **Size**: 16x16 to 32x32 pixels optimal
- **Style**: Should complement Jehkoba64 color palette
- **Naming**: `{type}_{variant}.png` (e.g., `spooky_1.png`, `spooky_2.png`)

### Halloween Assets (User-Provided)
Expected assets for `/assets/seasons/halloween/`:
- `spooky_1.png` - First Halloween particle (bat, ghost, pumpkin, etc.)
- `spooky_2.png` - Second Halloween particle (different variation)

Assets will automatically:
- Apply Jehkoba64 Halloween colors via CSS hue rotation
- Use spooky physics (slower, mysterious movement)
- Integrate with transparent card system

## Performance Optimization

### Particle System
- **Count**: 20 particles maximum for 60fps performance
- **Asset Loading**: Automatic preloading for smooth transitions
- **Physics**: GPU-accelerated CSS transforms
- **Memory**: Particle recycling when off-screen

### Color Management
- **CSS Variables**: Automatic theme color injection
- **Hue Rotation**: Efficient color transformation
- **Caching**: Theme configurations cached in memory

## Development Notes

### File Structure
```
frontend/src/
├── themes/
│   └── jehkoba64-palette.ts          # Central palette definition
├── composables/
│   └── useTheme.ts                   # Theme management composable
├── components/theme/
│   ├── SeasonalThemeProvider.vue     # Theme provider
│   └── AtmosphericBackground.vue     # Particle system
└── assets/seasons/
    ├── autumn/                       # Fall assets
    ├── halloween/                    # Halloween assets (user-provided)
    ├── winter/                       # Future winter assets
    └── spring/                       # Future spring assets
```

### Migration from Legacy System
The system maintains backward compatibility with existing `fallTheme` provider naming while internally using the new universal theme system.

## Future Enhancements
- **Holiday Overrides**: Special themes for Christmas, New Year, etc.
- **Geographic Seasons**: Southern hemisphere season detection
- **Custom Themes**: User-defined color combinations using Jehkoba64 palette
- **Transition Effects**: Crossfade animations between theme changes
- **Audio Integration**: Optional seasonal sound effects (if requested)