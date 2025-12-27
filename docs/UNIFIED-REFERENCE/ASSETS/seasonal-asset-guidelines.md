# Seasonal Asset Guidelines for Retro Theme

## Overview
This document provides comprehensive guidelines for creating, integrating, and managing seasonal particle assets specifically for the 'retro' theme of the LCiBot dashboard. The system is built upon the **Jehkoba64** 64-color palette and offers automatic month-based theme switching with sophisticated particle effects.

## Architecture & Core Components
*   **Jehkoba64 Palette**: Centralized 64-color palette with seasonal groupings (defined in `jehkoba64-palette.ts`).
*   **Theme Composable**: `useTheme.ts` provides universal theme management and automatic season detection.
*   **Theme Provider**: `SeasonalThemeProvider.vue` handles CSS variable injection for dynamic theming.
*   **Particle System**: `AtmosphericBackground.vue` integrates seasonal particle effects with Jehkoba64 color mapping.

## Asset Specifications

### Technical Requirements
*   **Format**: PNG with transparent background.
*   **Size**: 16x16 to 48x48 pixels (optimal for particle system).
*   **Color Mode**: RGB (will be recolored via CSS filters).
*   **Compression**: Optimize for web delivery (keep under 1KB per asset).
*   **Transparency**: Clean alpha channel with no semi-transparent edges.

### File Naming Convention
```
{season}/{type}_{variant}.png

Examples:
- autumn/leaf_1.png, autumn/leaf_2.png
- halloween/spooky_1.png, halloween/spooky_2.png
- winter/snowflake_1.png, winter/snowflake_2.png
- spring/petal_1.png, spring/petal_2.png
```

## Directory Structure
```
frontend/assets/seasons/
├── autumn/                 # Fall assets
├── halloween/              # Halloween assets
├── winter/                 # Future winter assets
└── spring/                 # Future spring assets
```

## Season-Specific Guidelines

### 🍂 Autumn Assets (September)
*   **Primary Palette**: Reflects autumn colors (e.g., maple, oak leaves, golden yellows, deep reds).
*   **Assets**: `leaf_1.png`, `leaf_2.png`.
*   **Physics**: Gentle falling (speed: 0.8), with sway and light wind.

### 🎃 Halloween Assets (October)
*   **Primary Palette**: Focus on pumpkin orange, dark violet, deep purple, and black.
*   **Assets**: `spooky_1.png`, `spooky_2.png` (user-provided). Suggested types include bats, ghosts, pumpkins, spider webs, witch hats.
*   **Physics**: Mysterious floating (speed: 0.6), with supernatural sway and limited rotation.
*   **Visual Effects**: Enhanced transparency for spooky atmosphere, glow effects, and pixelated borders.

### ❄️ Winter Assets (November-February)
*   **Primary Palette**: Ice blues, bright blues, creams, and grays.
*   **Assets**: Future snowflake assets.
*   **Physics**: Fast falling snow (speed: 1.2), minimal sway.

### 🌸 Spring Assets (March-May)
*   **Primary Palette**: Light greens, bright limes, mint, light pinks, yellows.
*   **Assets**: Future petal assets.
*   **Physics**: Gentle upward drift (speed: 0.5), playful movement.

## Color Integration System (Jehkoba64 Palette)

Assets are automatically recolored using CSS filters to match seasonal Jehkoba64 palettes.

### Asset Color Guidelines
*   **Base Color**: Use neutral/warm colors as starting point.
*   **Avoid**: Extreme saturation or brightness (will be adjusted by filters).
*   **Details**: High contrast details preserve well through the filter system.
*   **Testing**: Use reference tools for color transformation.

## Physics Configuration

### Movement Patterns by Season
*   **AUTUMN**: Gentle falling, wind effect, natural tumbling.
*   **HALLOWEEN**: Mysterious floating, supernatural sway, limited spooky sway rotation.
*   **WINTER**: Fast falling snow, no sway.
*   **SPRING**: Gentle upward drift, playful movement.

### Asset-Specific Physics Multipliers
Physics adjust automatically based on asset naming conventions (e.g., `_1`, `_2`, `spooky_`, `snowflake_`).

## Integration Workflow

### Adding New Assets
1.  **Create Assets**: Follow technical specifications.
2.  **Place Files**: In appropriate `/frontend/assets/seasons/{season}/` directory.
3.  **Update Asset Lists**: In `AtmosphericBackground.vue` `getParticleAssets()` if needed.
4.  **Test Integration**: Use `npm run dev` and theme switch button to preview.

## Quality Assurance

### Asset Validation Checklist
*   **File Size**: Under 1KB per asset.
*   **Transparency**: Clean alpha channel.
*   **Dimensions**: 16-48px range.
*   **Format**: PNG format.
*   **Naming**: Follows `{season}/{type}_{variant}.png` convention.
*   **Location**: Correct seasonal directory.

### Integration Testing
*   **Color Transform**: Jehkoba64 colors apply correctly.
*   **Physics**: Movement matches seasonal expectations.
*   **Performance**: Maintains 60fps with particle system.
*   **Transparency**: Visible through card backgrounds.
*   **Mobile**: Responsive on touch devices.

## Performance Guidelines

### Optimization Techniques
*   **Asset Preloading**: System preloads seasonal assets.
*   **Memory Management**: Particle recycling system.
*   **GPU Acceleration**: CSS transforms for smooth animation.
*   **Efficient Filters**: Optimized hue rotation and effects.