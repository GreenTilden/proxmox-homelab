/**
 * Theme-based Component Factory
 *
 * Dynamically loads theme-specific components based on the current environment.
 * This enables completely different UI experiences while sharing core functionality.
 */

import { getCurrentEnvironment, type ThemeEnvironment } from '@/config/environments'
import type { Component } from 'vue'

// Component type definitions for proper typing
interface ThemeComponents {
  ServiceCard: Component
  ThemeProvider: Component | null
  ScanlineOverlay: Component | null
  AtmosphericBackground: Component | null
}

// Lazy loading component maps for each theme
const componentMaps: Record<ThemeEnvironment, () => Promise<ThemeComponents>> = {
  retro: async () => ({
    ServiceCard: (await import('./themes/retro/ServiceCard.vue')).default,
    ThemeProvider: (await import('./themes/retro/SeasonalThemeProvider.vue')).default,
    ScanlineOverlay: (await import('./themes/retro/ScanlineOverlay.vue')).default,
    AtmosphericBackground: (await import('./themes/retro/AtmosphericBackground.vue')).default,
  }),
  naive: async () => ({
    ServiceCard: (await import('./themes/naive/ServiceCard.vue')).default,
    ThemeProvider: null, // Naive theme doesn't need a theme provider
    ScanlineOverlay: null, // No scanlines in naive theme
    AtmosphericBackground: null, // No atmospheric effects in naive theme
  })
}

// Cache for loaded components
const componentCache = new Map<ThemeEnvironment, ThemeComponents>()

/**
 * Load theme-specific components
 */
export async function loadThemeComponents(theme?: ThemeEnvironment): Promise<ThemeComponents> {
  const currentTheme = theme || getCurrentEnvironment()

  // Return cached components if available
  if (componentCache.has(currentTheme)) {
    return componentCache.get(currentTheme)!
  }

  // Load and cache components
  const components = await componentMaps[currentTheme]()
  componentCache.set(currentTheme, components)

  return components
}

/**
 * Get a specific themed component
 */
export async function getThemedComponent<K extends keyof ThemeComponents>(
  componentName: K,
  theme?: ThemeEnvironment
): Promise<ThemeComponents[K]> {
  const components = await loadThemeComponents(theme)
  return components[componentName]
}

/**
 * Preload theme components for better performance
 */
export async function preloadThemeComponents(theme: ThemeEnvironment): Promise<void> {
  if (!componentCache.has(theme)) {
    await loadThemeComponents(theme)
  }
}

/**
 * Get all available theme names
 */
export function getAvailableThemes(): ThemeEnvironment[] {
  return Object.keys(componentMaps) as ThemeEnvironment[]
}