import { computed, ref } from 'vue'

export interface ColorRamp {
  ramp1: string
  ramp2: string
  ramp3: string
  ramp4: string
  ramp5: string
}

export interface FallTheme {
  name: 'fall'
  primary: ColorRamp
  secondary: ColorRamp
  accent: ColorRamp
  neutral: ColorRamp
  backgrounds: {
    app: string
    surface: string
    card: string
    elevated: string
  }
  text: {
    primary: string
    secondary: string
    muted: string
    bright: string
  }
  status: {
    success: string
    warning: string
    error: string
    info: string
  }
  effects: {
    glow: string
    shadow: string
    scanline: string
  }
}

// Jehkoba64 Comforting Fall Theme
const fallTheme: FallTheme = {
  name: 'fall',
  primary: {
    ramp1: '#116061',  // Deep teal (comforting)
    ramp2: '#068051',  // Forest green
    ramp3: '#179c43',  // Medium green
    ramp4: '#55b33b',  // Soft bright green
    ramp5: '#94bf30'   // Gentle lime
  },
  secondary: {
    ramp1: '#7a5e37',  // Warm brown
    ramp2: '#9e7767',  // Soft terracotta
    ramp3: '#ad6a45',  // Muted rust
    ramp4: '#b58c7f',  // Warm tan
    ramp5: '#c4bbb3'   // Soft beige
  },
  accent: {
    ramp1: '#cc8029',  // Muted amber
    ramp2: '#e69b22',  // Soft gold
    ramp3: '#ffb938',  // Gentle yellow
    ramp4: '#fad937',  // Warm yellow
    ramp5: '#f2f2da'   // Cream
  },
  neutral: {
    ramp1: '#495169',  // Soft blue-gray
    ramp2: '#696570',  // Gentle purple-gray
    ramp3: '#807980',  // Neutral gray
    ramp4: '#a69a9c',  // Warm gray
    ramp5: '#c4bbb3'   // Light warm gray
  },
  backgrounds: {
    app: '#0a0f0c',      // Very dark green-black (comforting)
    surface: '#1a2b1e',  // Deep forest
    card: '#2d4a32',     // Muted green
    elevated: '#3a5940'  // Soft elevated green
  },
  text: {
    primary: '#e8f5e8',  // Soft mint cream
    secondary: '#c4bbb3', // Warm gray
    muted: '#a69a9c',    // Muted gray
    bright: '#f2f2da'    // Warm cream
  },
  status: {
    success: '#55b33b',  // Soft green
    warning: '#e69b22',  // Gentle amber
    error: '#ad6a45',    // Muted rust (less harsh than red)
    info: '#49c2f2'      // Soft sky blue
  },
  effects: {
    glow: '#55b33b',     // Soft green glow
    shadow: 'rgba(10, 15, 12, 0.6)',
    scanline: '#e8f5e8' // Soft mint cream for scanlines
  }
}

export function useFallTheme() {
  const theme = computed((): FallTheme => {
    return fallTheme
  })

  const cssVariables = computed(() => ({
    // Color ramps
    '--color-primary-1': theme.value.primary.ramp1,
    '--color-primary-2': theme.value.primary.ramp2,
    '--color-primary-3': theme.value.primary.ramp3,
    '--color-primary-4': theme.value.primary.ramp4,
    '--color-primary-5': theme.value.primary.ramp5,

    '--color-secondary-1': theme.value.secondary.ramp1,
    '--color-secondary-2': theme.value.secondary.ramp2,
    '--color-secondary-3': theme.value.secondary.ramp3,
    '--color-secondary-4': theme.value.secondary.ramp4,
    '--color-secondary-5': theme.value.secondary.ramp5,

    '--color-accent-1': theme.value.accent.ramp1,
    '--color-accent-2': theme.value.accent.ramp2,
    '--color-accent-3': theme.value.accent.ramp3,
    '--color-accent-4': theme.value.accent.ramp4,
    '--color-accent-5': theme.value.accent.ramp5,

    '--color-neutral-1': theme.value.neutral.ramp1,
    '--color-neutral-2': theme.value.neutral.ramp2,
    '--color-neutral-3': theme.value.neutral.ramp3,
    '--color-neutral-4': theme.value.neutral.ramp4,
    '--color-neutral-5': theme.value.neutral.ramp5,

    // Backgrounds
    '--bg-app': theme.value.backgrounds.app,
    '--bg-surface': theme.value.backgrounds.surface,
    '--bg-card': theme.value.backgrounds.card,
    '--bg-elevated': theme.value.backgrounds.elevated,

    // Text
    '--text-primary': theme.value.text.primary,
    '--text-secondary': theme.value.text.secondary,
    '--text-muted': theme.value.text.muted,
    '--text-bright': theme.value.text.bright,

    // Status
    '--status-success': theme.value.status.success,
    '--status-warning': theme.value.status.warning,
    '--status-error': theme.value.status.error,
    '--status-info': theme.value.status.info,

    // Effects
    '--effect-glow': theme.value.effects.glow,
    '--effect-shadow': theme.value.effects.shadow,
    '--effect-scanline': theme.value.effects.scanline,

    // Transitions
    '--transition-fast': '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    '--transition-normal': '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    '--transition-slow': '500ms cubic-bezier(0.4, 0, 0.2, 1)',

    // Spacing
    '--space-xs': '0.25rem',
    '--space-sm': '0.5rem',
    '--space-md': '1rem',
    '--space-lg': '1.5rem',
    '--space-xl': '2rem',

    // Border radius
    '--radius-sm': '4px',
    '--radius-md': '8px',
    '--radius-lg': '12px',
    '--radius-xl': '16px'
  }))

  const getColorFromRamp = (ramp: ColorRamp, level: 1 | 2 | 3 | 4 | 5): string => {
    return ramp[`ramp${level}`]
  }

  const createGradient = (
    direction: string,
    colors: string[],
    opacity = 1
  ): string => {
    const colorStops = colors.map((color, index) => {
      const position = index === 0 ? '0%' : index === colors.length - 1 ? '100%' : `${(index / (colors.length - 1)) * 100}%`
      return `${color}${opacity < 1 ? Math.round(opacity * 255).toString(16).padStart(2, '0') : ''} ${position}`
    }).join(', ')

    return `linear-gradient(${direction}, ${colorStops})`
  }

  return {
    theme,
    cssVariables,
    getColorFromRamp,
    createGradient
  }
}