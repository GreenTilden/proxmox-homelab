# Seasonal Asset Guidelines

## Overview
Comprehensive guidelines for creating and integrating seasonal particle assets with the Jehkoba64 theme system.

## Asset Specifications

### Technical Requirements
- **Format**: PNG with transparent background
- **Size**: 16x16 to 32x32 pixels (optimal for particle system)
- **Color Mode**: RGB (will be recolored via CSS filters)
- **Compression**: Optimize for web delivery (keep under 1KB per asset)
- **Transparency**: Clean alpha channel with no semi-transparent edges

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
├── autumn/
│   ├── leaf_1.png          ✅ (16x16, 357 bytes)
│   ├── leaf_2.png          ✅ (18x16, 411 bytes)
│   ├── leaf_gs.png         📝 (grayscale reference)
│   └── leaf-color-test.html 📝 (development tool)
├── halloween/
│   ├── spooky_1.png        🎯 (user-provided)
│   ├── spooky_2.png        🎯 (user-provided)
│   └── README.md           📝 (asset requirements)
├── winter/
│   ├── snowflake_1.png     🔮 (future)
│   └── snowflake_2.png     🔮 (future)
└── spring/
    ├── petal_1.png         🔮 (future)
    └── petal_2.png         🔮 (future)
```

## Season-Specific Guidelines

### 🍂 Autumn Assets (Current)
**Existing Assets**: `leaf_1.png`, `leaf_2.png`
- **Style**: Natural leaf silhouettes with detailed edges
- **Variety**: Maple (sharp edges) vs Oak (rounded edges)
- **Size**: 16-18px optimal for falling leaf effect
- **Colors**: Original assets work perfectly with Jehkoba64 autumn palette

### 🎃 Halloween Assets (Ready for User)
**Required Assets**: `spooky_1.png`, `spooky_2.png`

**Suggested Asset Types**:
1. **Bats**: Wing spread, distinct silhouette
2. **Ghosts**: Flowing ethereal shape
3. **Pumpkins**: Small jack-o'-lantern faces
4. **Witch Hats**: Pointed magical hats
5. **Spider Webs**: Delicate web fragments
6. **Candy**: Halloween treat shapes
7. **Stars/Moons**: Magical celestial shapes

**Physics Profile**:
- **Movement**: Mysterious floating, slower than leaves
- **Rotation**: Limited spooky sway (180° max)
- **Size**: 20-48px for dramatic Halloween presence

### ❄️ Winter Assets (Future)
**Planned Assets**: `snowflake_1.png`, `snowflake_2.png`

**Design Considerations**:
- **Style**: Crystalline, symmetric patterns
- **Variety**: Different snowflake geometries
- **Size**: 16-32px for delicate snow effect
- **Physics**: Fast falling, minimal sway for realistic snow

### 🌸 Spring Assets (Future)
**Planned Assets**: `petal_1.png`, `petal_2.png`

**Design Considerations**:
- **Style**: Delicate flower petals
- **Variety**: Cherry blossom, tulip, or generic petals
- **Size**: 18-40px for gentle floating effect
- **Physics**: Upward drift, light and playful movement

## Color Integration System

### Jehkoba64 Color Mapping
Assets are automatically recolored using CSS filters to match seasonal Jehkoba64 palettes:

```css
/* Autumn color example */
filter: hue-rotate(340deg) brightness(0.95) saturate(0.7) drop-shadow(0 0 2px #d94c8e40);

/* Halloween color example */
filter: hue-rotate(270deg) brightness(0.95) saturate(0.7) drop-shadow(0 0 2px #773bbf40);
```

### Asset Color Guidelines
- **Base Color**: Use neutral/warm colors as starting point
- **Avoid**: Extreme saturation or brightness (will be adjusted by filters)
- **Details**: High contrast details preserve well through filter system
- **Testing**: Use `/autumn/leaf-color-test.html` as reference for color transformation

## Physics Configuration

### Movement Patterns by Season
```typescript
AUTUMN: {
  speed: 0.8,           // Natural falling leaves
  direction: 'downward',
  sway: true,           // Wind effect
  rotation: 270-360°    // Natural tumbling
}

HALLOWEEN: {
  speed: 0.6,           // Mysterious floating
  direction: 'floating',
  sway: true,           // Supernatural sway
  rotation: 180°        // Limited spooky movement
}

WINTER: {
  speed: 1.2,           // Fast falling snow
  direction: 'downward',
  sway: false,          // Straight falling
  rotation: 360°        // Full spinning
}

SPRING: {
  speed: 0.5,           // Gentle floating
  direction: 'upward-drift',
  sway: true,           // Playful movement
  rotation: 180°        // Gentle flutter
}
```

### Asset-Specific Physics Multipliers
System automatically adjusts physics based on asset naming:
- `_1` suffix: Standard physics
- `_2` suffix: 10% slower (variety)
- `spooky_`: 30% slower (mysterious)
- `snowflake_`: 20% faster (realistic snow)
- `petal_`: 40% slower (delicate floating)

## Integration Workflow

### Adding New Assets
1. **Create Assets** following technical specifications
2. **Place Files** in appropriate `/assets/seasons/{season}/` directory
3. **Update Asset Lists** in `AtmosphericBackground.vue` if needed
4. **Test Integration**:
   ```bash
   npm run dev
   # Use theme switch button to preview
   ```
5. **Build & Deploy**:
   ```bash
   npm run build
   ```

### Development Testing
1. **Local Testing**: Use development server hot reload
2. **Theme Switching**: Manual override via dashboard button
3. **Color Verification**: Check Jehkoba64 color application
4. **Physics Testing**: Verify movement patterns and speeds
5. **Performance**: Monitor 60fps with particle system

## Quality Assurance

### Asset Validation Checklist
- [ ] **File Size**: Under 1KB per asset
- [ ] **Transparency**: Clean alpha channel
- [ ] **Dimensions**: 16-32px range
- [ ] **Format**: PNG format
- [ ] **Naming**: Follows convention
- [ ] **Location**: Correct seasonal directory

### Integration Testing
- [ ] **Color Transform**: Jehkoba64 colors apply correctly
- [ ] **Physics**: Movement matches seasonal expectations
- [ ] **Performance**: Maintains 60fps with 20 particles
- [ ] **Transparency**: Visible through card backgrounds
- [ ] **Mobile**: Responsive on touch devices

## Performance Guidelines

### Optimization Techniques
- **Asset Preloading**: System preloads seasonal assets
- **Memory Management**: Particle recycling system
- **GPU Acceleration**: CSS transforms for smooth animation
- **Efficient Filters**: Optimized hue rotation and effects

### File Size Targets
- **Leaf Assets**: ~400 bytes (current performance baseline)
- **Halloween Assets**: Target under 1KB each
- **Winter Assets**: ~500 bytes (simple geometric shapes)
- **Spring Assets**: ~600 bytes (delicate details)

## Troubleshooting

### Common Issues
1. **Assets Not Loading**: Check file paths and naming convention
2. **Colors Wrong**: Verify Jehkoba64 color mapping in `PARTICLE_HUE_ROTATIONS`
3. **Physics Issues**: Check multiplier settings in `getPhysicsMultiplier()`
4. **Performance**: Reduce particle count or optimize asset sizes

### Debug Tools
- **Color Test**: Use `/autumn/leaf-color-test.html` reference
- **Browser DevTools**: Inspect CSS filter values
- **Theme Switching**: Manual override for testing
- **Console Logging**: Check particle creation and physics values

This comprehensive guide ensures consistent, high-quality seasonal assets that integrate seamlessly with the Jehkoba64 theme system!