# Retro Theme Particle Asset Guidelines

## Overview
This document provides comprehensive guidelines for creating, integrating, and managing particle assets specifically for the 'retro' theme of the LCiBot dashboard. The system is built upon a curated color palette and offers dynamic particle effects that align with the retro aesthetic.

## Architecture & Core Components
*   **Retro Palette**: Centralized color palette (e.g., from `retro-palette.ts` or defined in CSS variables).
*   **Theme Composable**: `useTheme.ts` provides universal theme management.
*   **Particle System**: `AtmosphericBackground.vue` integrates particle effects with retro color mapping.

## Asset Specifications

### Technical Requirements
*   **Format**: PNG with transparent background.
*   **Size**: 16x16 to 48x48 pixels (optimal for particle system).
*   **Color Mode**: RGB (will be recolored via CSS filters or custom logic).
*   **Compression**: Optimize for web delivery (keep under 1KB per asset).
*   **Transparency**: Clean alpha channel with no semi-transparent edges.

### File Naming Convention
```
retro/{type}_{variant}.png

Examples:
- retro/pixel_star_1.png, retro/pixel_star_2.png
- retro/8bit_cloud_1.png, retro/8bit_cloud_2.png
```

## Directory Structure
```
frontend/assets/retro/        # Retro-themed assets
```

## Retro Theme Asset Guidelines

### 🌟 Retro Particle Assets
*   **Primary Palette**: Reflects the overall retro theme colors (e.g., desaturated blues, greens, browns, and muted neons).
*   **Assets**: Examples include pixelated stars, 8-bit clouds, geometric shapes, or simplified icons.
*   **Physics**: Consistent movement patterns (e.g., slow upward drift, gentle falling, or static background elements) designed to complement the retro aesthetic.

## Color Integration System (Retro Palette)

Assets can be recolored using CSS filters or custom logic to match the retro palette.

### Asset Color Guidelines
*   **Base Color**: Use neutral colors as a starting point.
*   **Avoid**: Overly complex color schemes within the asset itself.
*   **Details**: High contrast details preserve well through color transformation.
*   **Testing**: Use reference tools for color transformation and theme compatibility.

## Physics Configuration

### Movement Patterns
*   **Default**: Gentle falling or slow upward drift with minimal sway to maintain a calm retro backdrop.
*   **Variations**: Can be configured for specific asset types (e.g., faster movement for "glitch" effects, static for background elements).

### Asset-Specific Physics Multipliers
Physics can be adjusted based on asset naming conventions (e.g., `_fast`, `_static`) or component props.

## Integration Workflow

### Adding New Assets
1.  **Create Assets**: Follow technical specifications.
2.  **Place Files**: In the `frontend/assets/retro/` directory.
3.  **Update Asset Lists**: In `AtmosphericBackground.vue` `getParticleAssets()` if needed.
4.  **Test Integration**: Use `npm run dev` to preview.

## Quality Assurance

### Asset Validation Checklist
*   **File Size**: Under 1KB per asset.
*   **Transparency**: Clean alpha channel.
*   **Dimensions**: 16-48px range.
*   **Format**: PNG format.
*   **Naming**: Follows `retro/{type}_{variant}.png` convention.
*   **Location**: Correct `retro` directory.

### Integration Testing
*   **Color Transform**: Retro palette colors apply correctly.
*   **Physics**: Movement matches retro aesthetic expectations.
*   **Performance**: Maintains 60fps with particle system.
*   **Transparency**: Visible through card backgrounds.
*   **Mobile**: Responsive on touch devices.

## Performance Guidelines

### Optimization Techniques
*   **Asset Preloading**: System preloads assets.
*   **Memory Management**: Particle recycling system.
*   **GPU Acceleration**: CSS transforms for smooth animation.
*   **Efficient Filters**: Optimized color effects.
