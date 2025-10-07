# Halloween Assets Directory

This directory contains Halloween-themed particle assets for October seasonal theming.

## Expected Assets
- `spooky_1.png` - First Halloween particle type (e.g., bat, ghost, pumpkin)
- `spooky_2.png` - Second Halloween particle type (e.g., different variation)

## Asset Requirements
- **Size**: 16x16 to 32x32 pixels (similar to current leaf assets)
- **Format**: PNG with transparent background
- **Style**: Should work well with Jehkoba64 Halloween color palette:
  - Pumpkin Orange: #faa032
  - Dark Purple: #773bbf
  - Deep Purple: #4e278c
  - Black: #000000
  - Dark Red: #c40c2e

## Physics Behavior
Halloween assets are configured with:
- **Speed Multiplier**: 0.7 (slower, more mysterious movement)
- **Rotation Variance**: 180° (limited spooky sway)
- **Theme Colors**: Automatically tinted using Jehkoba64 Halloween palette

## Integration
Assets will automatically be used when:
1. Current month is October (automatic switching)
2. Manual theme override to Halloween theme
3. Particles will blend with Halloween Jehkoba64 colors and transparent cards