export type Pillar = 'personal' | 'professional' | 'domestic'

export interface PillarConfig {
  label: string
  short: string
  color: string
  icon: string
}

export const PILLAR_CONFIG: Record<Pillar, PillarConfig> = {
  personal:     { label: 'Personal Dev',      short: 'PER', color: '#22c55e', icon: '🌱' },
  professional: { label: 'Professional Dev',  short: 'PRO', color: '#4a6741', icon: '🎯' },
  domestic:     { label: 'Domestic Dev',       short: 'DOM', color: '#e8a838', icon: '🏠' },
}
