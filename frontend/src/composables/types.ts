export interface ThemeProps {
  accentColor?: string
  bgColor?: string
  goldColor?: string
}

export const THEME_DEFAULTS: Required<ThemeProps> = {
  accentColor: '#4a6741',
  bgColor: '#1a2a3a',
  goldColor: '#c4a747',
}
