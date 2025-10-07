/**
 * Universal Theme System with Jehkoba64 Palette
 *
 * Provides automatic seasonal theming based on current month
 * with complete Jehkoba64 color palette integration
 */
import { computed, ref } from 'vue'
import {
  SEASONAL_PALETTES,
  getCurrentSeason,
  getSeasonByMonth,
  type SeasonName,
  type Jehkoba64Color
} from '@/themes/jehkoba64-palette'
import {
  TAYLOR_SWIFT_PALETTES,
  getCurrentEra,
  getEraByMonth,
  type TaylorSwiftEra
} from '@/themes/taylor-swift-palette'
import { getCurrentConfig } from '@/config/environments'

export interface ColorRamp {
  ramp1: string
  ramp2: string
  ramp3: string
  ramp4: string
  ramp5: string
}

export interface UniversalTheme {
  name: string
  season: SeasonName
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
  particles: {
    colors: string[]
    count: number
    physics: {
      speed: number
      direction: string
      sway: boolean
      wind: number
    }
    size: {
      min: number
      max: number
    }
  }
}

// Force override for testing/manual switching (optional)
const forcedSeason = ref<SeasonName | null>(null)
const forcedEra = ref<TaylorSwiftEra | null>(null)

function createThemeFromSeason(seasonName: SeasonName): UniversalTheme {
  const seasonPalette = SEASONAL_PALETTES[seasonName]
  const colors = seasonPalette.primary

  return {
    name: seasonPalette.name,
    season: seasonName,
    primary: {
      ramp1: colors[7] || colors[0], // Deepest shade
      ramp2: colors[6] || colors[1], // Dark
      ramp3: colors[5] || colors[2], // Medium
      ramp4: colors[4] || colors[3], // Light
      ramp5: colors[3] || colors[4]  // Lightest
    },
    secondary: {
      ramp1: colors[3] || colors[0], // Warm tones
      ramp2: colors[4] || colors[1],
      ramp3: colors[2] || colors[2],
      ramp4: colors[1] || colors[3],
      ramp5: colors[0] || colors[4]
    },
    accent: {
      ramp1: colors[5] || colors[0], // Accent colors
      ramp2: colors[6] || colors[1],
      ramp3: colors[7] || colors[2],
      ramp4: colors[0] || colors[3],
      ramp5: colors[1] || colors[4]
    },
    neutral: {
      ramp1: '#495169',  // Consistent neutral grays from Jehkoba64
      ramp2: '#696570',
      ramp3: '#807980',
      ramp4: '#a69a9c',
      ramp5: '#c4bbb3'
    },
    backgrounds: seasonPalette.backgrounds,
    text: {
      primary: '#f2f2da',   // Jehkoba64 cream
      secondary: '#c4bbb3', // Jehkoba64 warm gray
      muted: '#a69a9c',     // Jehkoba64 light gray
      bright: '#f2f2da'     // Jehkoba64 cream (bright)
    },
    status: {
      success: colors[2] || '#55b33b', // Use theme color or fallback
      warning: colors[1] || '#faa032',
      error: colors[0] || '#d94c8e',
      info: '#49c2f2' // Consistent Jehkoba64 sky blue
    },
    effects: seasonPalette.effects,
    particles: {
      colors: seasonPalette.primary,
      count: 20,
      physics: getPhysicsForSeason(seasonName),
      size: getSizeForSeason(seasonName)
    }
  }
}

function getPhysicsForSeason(season: SeasonName) {
  switch (season) {
    case 'AUTUMN':
      return {
        speed: 0.8,
        direction: 'downward',
        sway: true,
        wind: 0.4
      }
    case 'HALLOWEEN':
      return {
        speed: 0.6,      // Slower, more mysterious
        direction: 'floating',
        sway: true,
        wind: 0.6        // More chaotic movement
      }
    case 'WINTER':
      return {
        speed: 1.2,      // Faster falling snow
        direction: 'downward',
        sway: false,     // Straighter fall
        wind: 0.3
      }
    case 'SPRING':
      return {
        speed: 0.5,      // Gentle floating
        direction: 'upward-drift',
        sway: true,
        wind: 0.5        // Playful movement
      }
    default:
      return {
        speed: 0.8,
        direction: 'downward',
        sway: true,
        wind: 0.4
      }
  }
}

function getSizeForSeason(season: SeasonName) {
  switch (season) {
    case 'HALLOWEEN':
      return { min: 20, max: 48 }  // Slightly smaller for spooky effect
    case 'WINTER':
      return { min: 16, max: 32 }  // Smaller snowflakes
    case 'SPRING':
      return { min: 18, max: 40 }  // Delicate petals
    default:
      return { min: 24, max: 56 }  // Current leaf size
  }
}

function createThemeFromEra(eraName: TaylorSwiftEra): UniversalTheme {
  const eraPalette = TAYLOR_SWIFT_PALETTES[eraName]
  const colors = eraPalette.primary

  return {
    name: eraPalette.name,
    season: eraName as any, // Type compatibility
    primary: {
      ramp1: colors[7] || colors[0],
      ramp2: colors[6] || colors[1],
      ramp3: colors[5] || colors[2],
      ramp4: colors[4] || colors[3],
      ramp5: colors[3] || colors[4]
    },
    secondary: {
      ramp1: colors[3] || colors[0],
      ramp2: colors[4] || colors[1],
      ramp3: colors[2] || colors[2],
      ramp4: colors[1] || colors[3],
      ramp5: colors[0] || colors[4]
    },
    accent: {
      ramp1: colors[5] || colors[0],
      ramp2: colors[6] || colors[1],
      ramp3: colors[7] || colors[2],
      ramp4: colors[0] || colors[3],
      ramp5: colors[1] || colors[4]
    },
    neutral: {
      ramp1: '#495169',
      ramp2: '#696570',
      ramp3: '#807980',
      ramp4: '#a69a9c',
      ramp5: '#c4bbb3'
    },
    backgrounds: eraPalette.backgrounds,
    text: {
      primary: '#f2f2da',
      secondary: '#c4bbb3',
      muted: '#a69a9c',
      bright: '#f2f2da'
    },
    status: {
      success: colors[2] || '#55b33b',
      warning: colors[1] || '#faa032',
      error: colors[0] || '#d94c8e',
      info: '#49c2f2'
    },
    effects: eraPalette.effects,
    particles: {
      colors: eraPalette.primary,
      count: eraPalette.particles.count,
      physics: eraPalette.particles.physics as any,
      size: eraPalette.particles.size
    }
  }
}

export function useTheme() {
  const currentConfig = getCurrentConfig()
  const paletteMode = currentConfig.paletteMode

  const currentSeason = computed(() => {
    return forcedSeason.value || getCurrentSeason()
  })

  const currentEra = computed(() => {
    return forcedEra.value || getCurrentEra()
  })

  const theme = computed((): UniversalTheme => {
    if (paletteMode === 'taylor-swift') {
      return createThemeFromEra(currentEra.value)
    }
    return createThemeFromSeason(currentSeason.value)
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

    // Theme-specific
    '--season-name': theme.value.name,
    '--particle-count': theme.value.particles.count.toString(),

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

  // Theme control functions
  const setTheme = (season: SeasonName) => {
    forcedSeason.value = season
  }

  const resetToAutoTheme = () => {
    forcedSeason.value = null
  }

  const previewTheme = (season: SeasonName) => {
    return createThemeFromSeason(season)
  }

  // Get all available themes for UI selection
  const availableThemes = computed(() => {
    return Object.keys(SEASONAL_PALETTES).map(season => ({
      key: season as SeasonName,
      name: SEASONAL_PALETTES[season as SeasonName].name,
      preview: createThemeFromSeason(season as SeasonName)
    }))
  })

  return {
    theme,
    currentSeason,
    cssVariables,
    getColorFromRamp,
    createGradient,
    setTheme,
    resetToAutoTheme,
    previewTheme,
    availableThemes
  }
}