/**
 * Environment-based Theme Configuration System
 *
 * Supports multiple theme environments:
 * - 'retro': Original 16-bit gaming theme with seasonal variations
 * - 'naive': Clean, professional Naive UI dark theme
 * - 'element': Professional Element Plus theme with autumn colors
 */

export type ThemeEnvironment = 'retro' | 'naive' | 'element'
export type PaletteMode = 'jehkoba64' | 'taylor-swift'

export interface EnvironmentConfig {
  theme: ThemeEnvironment
  paletteMode: PaletteMode
  port: number
  title: string
  description: string
  features: {
    seasonalThemes: boolean
    particles: boolean
    scanlines: boolean
    atmosphericBackground: boolean
    calendarIntegration: 'card' | 'header' | 'sidebar'
  }
  componentLibrary: 'nes-css' | 'naive-ui' | 'element-plus'
}

// Environment configurations
export const ENVIRONMENTS: Record<ThemeEnvironment, EnvironmentConfig> = {
  retro: {
    theme: 'retro',
    paletteMode: 'jehkoba64',
    port: 5000,
    title: 'LCiBot Dashboard',
    description: '16-bit gaming themed homelab dashboard',
    features: {
      seasonalThemes: true,
      particles: true,
      scanlines: true,
      atmosphericBackground: true,
      calendarIntegration: 'card'
    },
    componentLibrary: 'nes-css'
  },
  naive: {
    theme: 'naive',
    paletteMode: 'taylor-swift',
    port: 5001,
    title: 'Homelab Dashboard (Naive UI)',
    description: 'Clean, professional homelab management interface with Taylor Swift era theming',
    features: {
      seasonalThemes: true,
      particles: true,
      scanlines: false,
      atmosphericBackground: true,
      calendarIntegration: 'header'
    },
    componentLibrary: 'naive-ui'
  },
  element: {
    theme: 'element',
    paletteMode: 'jehkoba64',
    port: 5002,
    title: 'Homelab Dashboard (Autumn)',
    description: 'Professional Element Plus theme with autumn aesthetic',
    features: {
      seasonalThemes: true,
      particles: true,
      scanlines: true,
      atmosphericBackground: true,
      calendarIntegration: 'card'
    },
    componentLibrary: 'element-plus'
  }
}

// Get current environment from process.env or default to retro
export function getCurrentEnvironment(): ThemeEnvironment {
  const envTheme = process.env.VITE_THEME as ThemeEnvironment
  return envTheme && envTheme in ENVIRONMENTS ? envTheme : 'retro'
}

// Get current environment config
export function getCurrentConfig(): EnvironmentConfig {
  return ENVIRONMENTS[getCurrentEnvironment()]
}

// Environment detection utilities
export function isRetroTheme(): boolean {
  return getCurrentEnvironment() === 'retro'
}

export function isNaiveTheme(): boolean {
  return getCurrentEnvironment() === 'naive'
}

export function isElementTheme(): boolean {
  return getCurrentEnvironment() === 'element'
}

// Feature checking utilities
export function hasFeature(feature: keyof EnvironmentConfig['features']): boolean {
  return getCurrentConfig().features[feature] as boolean
}

export function getCalendarPlacement(): 'card' | 'header' | 'sidebar' {
  return getCurrentConfig().features.calendarIntegration
}

export function getComponentLibrary(): 'nes-css' | 'naive-ui' | 'element-plus' {
  return getCurrentConfig().componentLibrary
}