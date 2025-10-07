/**
 * Jehkoba64 Official Color Palette
 * Source: https://lospec.com/palette-list/jehkoba64
 *
 * Complete 64-color palette organized by semantic categories
 * for seasonal theming and UI design consistency
 */

// Raw Jehkoba64 Palette (64 colors)
export const JEHKOBA64_RAW = {
  // Blacks & Darks
  BLACK: '#000000',
  DARK_NAVY: '#050e1a',
  DEEP_BLUE: '#0d2140',

  // Reds & Magentas
  LIGHT_PINK: '#fabbaf',
  CORAL_PINK: '#eb758f',
  HOT_PINK: '#d94c8e',
  DEEP_MAGENTA: '#b32d7d',
  SALMON: '#fa9891',
  BRIGHT_RED: '#ff7070',
  CRIMSON: '#f53141',
  DARK_RED: '#c40c2e',
  PURPLE_RED: '#852264',

  // Oranges & Yellows
  PUMPKIN: '#faa032',
  BRIGHT_ORANGE: '#f58122',
  ORANGE_RED: '#f2621f',
  BURNT_ORANGE: '#db4b16',
  RUST: '#9e4c4c',
  GOLDEN_YELLOW: '#fad937',
  YELLOW: '#ffb938',
  AMBER: '#e69b22',
  DARK_AMBER: '#cc8029',
  BROWN: '#ad6a45',

  // Greens
  LIME_YELLOW: '#ccc73d',
  YELLOW_GREEN: '#b3b02d',
  OLIVE: '#989c27',
  DARK_OLIVE: '#8c8024',
  BROWN_GREEN: '#7a5e37',
  BRIGHT_LIME: '#94bf30',
  GREEN: '#55b33b',
  FOREST_GREEN: '#179c43',
  DARK_GREEN: '#068051',
  TEAL: '#116061',

  // Light Greens & Mint
  MINT: '#a0eba8',
  LIGHT_GREEN: '#7ccf9a',
  SEA_GREEN: '#5cb888',
  JADE: '#3da17e',
  DARK_TEAL: '#20806c',

  // Blues
  SKY_BLUE: '#49c2f2',
  BRIGHT_BLUE: '#25acf5',
  BLUE: '#1793e6',
  OCEAN_BLUE: '#1c75bd',
  NAVY: '#195ba6',

  // Purples
  LAVENDER: '#ae88e3',
  BRIGHT_PURPLE: '#7e7ef2',
  PURPLE: '#586ac4',
  DARK_PURPLE: '#3553a6',
  MIDNIGHT_PURPLE: '#243966',

  // Magentas & Pinks
  PINK_PURPLE: '#e29bfa',
  MAGENTA: '#ca7ef2',
  VIOLET: '#a35dd9',
  DARK_VIOLET: '#773bbf',
  DEEP_PURPLE: '#4e278c',

  // Browns & Tans
  TAN: '#b58c7f',
  BROWN_TAN: '#9e7767',
  DARK_BROWN: '#875d58',
  MAROON: '#6e4250',
  DARK_MAROON: '#472e3e',

  // Grays & Neutrals
  LIGHT_GRAY: '#a69a9c',
  GRAY: '#807980',
  PURPLE_GRAY: '#696570',
  BLUE_GRAY: '#495169',
  BEIGE_GRAY: '#d9a798',
  WARM_GRAY: '#c4bbb3',
  CREAM: '#f2f2da'
} as const

// Seasonal Color Groups
export const SEASONAL_PALETTES = {
  // September - Autumn/Fall (Natural Mountain Colors)
  AUTUMN: {
    name: 'Autumn',
    primary: [
      JEHKOBA64_RAW.RUST,          // #9e4c4c (deep rust maple)
      JEHKOBA64_RAW.DARK_RED,      // #c40c2e (crimson red leaf)
      JEHKOBA64_RAW.CRIMSON,       // #f53141 (bright red maple)
      JEHKOBA64_RAW.BRIGHT_ORANGE, // #f58122 (bright orange leaf)
      JEHKOBA64_RAW.PUMPKIN,       // #faa032 (pumpkin orange)
      JEHKOBA64_RAW.GOLDEN_YELLOW, // #fad937 (bright golden yellow)
      JEHKOBA64_RAW.YELLOW,        // #ffb938 (bright yellow leaf)
      JEHKOBA64_RAW.AMBER,         // #e69b22 (golden leaf)
      JEHKOBA64_RAW.DARK_AMBER,    // #cc8029 (muted amber)
      JEHKOBA64_RAW.BROWN          // #ad6a45 (oak brown - keeping one)
    ],
    backgrounds: {
      app: JEHKOBA64_RAW.BLACK,           // #000000
      surface: JEHKOBA64_RAW.DARK_NAVY,   // #050e1a
      card: JEHKOBA64_RAW.DARK_GREEN,     // #068051
      elevated: JEHKOBA64_RAW.FOREST_GREEN // #179c43
    },
    effects: {
      glow: JEHKOBA64_RAW.GREEN,          // #55b33b
      shadow: 'rgba(0, 0, 0, 0.6)',
      scanline: JEHKOBA64_RAW.CREAM       // #f2f2da
    }
  },

  // October - Halloween/Spooky
  HALLOWEEN: {
    name: 'Halloween',
    primary: [
      JEHKOBA64_RAW.PUMPKIN,       // #faa032 (pumpkin)
      JEHKOBA64_RAW.BRIGHT_ORANGE, // #f58122 (jack-o-lantern)
      JEHKOBA64_RAW.DARK_VIOLET,   // #773bbf (witch purple)
      JEHKOBA64_RAW.DEEP_PURPLE,   // #4e278c (deep magic)
      JEHKOBA64_RAW.BLACK,         // #000000 (midnight)
      JEHKOBA64_RAW.DARK_RED,      // #c40c2e (blood red)
      JEHKOBA64_RAW.GRAY,          // #807980 (ghostly)
      JEHKOBA64_RAW.DARK_MAROON    // #472e3e (gothic)
    ],
    backgrounds: {
      app: JEHKOBA64_RAW.BLACK,           // #000000 (midnight)
      surface: JEHKOBA64_RAW.DEEP_PURPLE, // #4e278c (deep magic)
      card: JEHKOBA64_RAW.DARK_VIOLET,    // #773bbf (witch purple)
      elevated: JEHKOBA64_RAW.MIDNIGHT_PURPLE // #243966 (elevated spooky)
    },
    effects: {
      glow: JEHKOBA64_RAW.PUMPKIN,        // #faa032 (pumpkin glow)
      shadow: 'rgba(0, 0, 0, 0.8)',      // Deeper shadows
      scanline: JEHKOBA64_RAW.LAVENDER    // #ae88e3 (spooky scanlines)
    }
  },

  // Future seasons (structure ready)
  WINTER: {
    name: 'Winter',
    primary: [
      JEHKOBA64_RAW.SKY_BLUE,     // #49c2f2 (ice blue)
      JEHKOBA64_RAW.BRIGHT_BLUE,  // #25acf5 (winter sky)
      JEHKOBA64_RAW.CREAM,        // #f2f2da (snow)
      JEHKOBA64_RAW.LIGHT_GRAY,   // #a69a9c (frost)
      JEHKOBA64_RAW.BLUE_GRAY,    // #495169 (winter clouds)
      JEHKOBA64_RAW.NAVY,         // #195ba6 (deep winter)
      JEHKOBA64_RAW.PURPLE_GRAY,  // #696570 (winter shadows)
      JEHKOBA64_RAW.MINT          // #a0eba8 (pine)
    ],
    backgrounds: {
      app: JEHKOBA64_RAW.DARK_NAVY,       // #050e1a
      surface: JEHKOBA64_RAW.DEEP_BLUE,   // #0d2140
      card: JEHKOBA64_RAW.BLUE_GRAY,      // #495169
      elevated: JEHKOBA64_RAW.NAVY        // #195ba6
    },
    effects: {
      glow: JEHKOBA64_RAW.SKY_BLUE,       // #49c2f2
      shadow: 'rgba(13, 33, 64, 0.6)',
      scanline: JEHKOBA64_RAW.MINT        // #a0eba8
    }
  },

  SPRING: {
    name: 'Spring',
    primary: [
      JEHKOBA64_RAW.LIGHT_GREEN,   // #7ccf9a (fresh growth)
      JEHKOBA64_RAW.BRIGHT_LIME,   // #94bf30 (new leaves)
      JEHKOBA64_RAW.MINT,          // #a0eba8 (spring mint)
      JEHKOBA64_RAW.LIGHT_PINK,    // #fabbaf (cherry blossom)
      JEHKOBA64_RAW.YELLOW,        // #ffb938 (daffodil)
      JEHKOBA64_RAW.SKY_BLUE,      // #49c2f2 (spring sky)
      JEHKOBA64_RAW.LAVENDER,      // #ae88e3 (lilac)
      JEHKOBA64_RAW.CORAL_PINK     // #eb758f (tulip)
    ],
    backgrounds: {
      app: JEHKOBA64_RAW.DARK_NAVY,       // #050e1a
      surface: JEHKOBA64_RAW.TEAL,        // #116061
      card: JEHKOBA64_RAW.FOREST_GREEN,   // #179c43
      elevated: JEHKOBA64_RAW.GREEN       // #55b33b
    },
    effects: {
      glow: JEHKOBA64_RAW.BRIGHT_LIME,    // #94bf30
      shadow: 'rgba(17, 96, 97, 0.5)',
      scanline: JEHKOBA64_RAW.MINT        // #a0eba8
    }
  }
} as const

// Utility functions
export function getSeasonByMonth(month: number): keyof typeof SEASONAL_PALETTES {
  switch (month) {
    case 9:  // September
      return 'AUTUMN'
    case 10: // October
      return 'HALLOWEEN'
    case 11: // November
    case 0:  // December (0-based)
    case 1:  // January
    case 2:  // February
      return 'WINTER'
    case 3:  // March
    case 4:  // April
    case 5:  // May
      return 'SPRING'
    default: // June, July, August - default to autumn
      return 'AUTUMN'
  }
}

export function getCurrentSeason(): keyof typeof SEASONAL_PALETTES {
  return getSeasonByMonth(new Date().getMonth())
}

// Particle-specific color mappings for hue rotation
export const PARTICLE_HUE_ROTATIONS = {
  // Natural Autumn Colors (muted mountain palette)
  [JEHKOBA64_RAW.RUST]: 10,           // #9e4c4c -> deep rust maple
  [JEHKOBA64_RAW.BROWN]: 15,          // #ad6a45 -> oak brown
  [JEHKOBA64_RAW.DARK_AMBER]: 25,     // #cc8029 -> muted amber
  [JEHKOBA64_RAW.BROWN_GREEN]: 45,    // #7a5e37 -> olive brown
  [JEHKOBA64_RAW.DARK_OLIVE]: 50,     // #8c8024 -> mountain olive
  [JEHKOBA64_RAW.DARK_BROWN]: 5,      // #875d58 -> burnt sienna
  [JEHKOBA64_RAW.TAN]: 20,            // #b58c7f -> weathered tan
  [JEHKOBA64_RAW.AMBER]: 35,          // #e69b22 -> subtle gold

  // Legacy bright colors (for backwards compatibility)
  [JEHKOBA64_RAW.HOT_PINK]: 340,      // #d94c8e -> autumn maple
  [JEHKOBA64_RAW.CORAL_PINK]: 350,    // #eb758f -> bright autumn
  [JEHKOBA64_RAW.ORANGE_RED]: 25,     // #f2621f -> classic autumn
  [JEHKOBA64_RAW.GOLDEN_YELLOW]: 45,  // #fad937 -> golden leaves
  [JEHKOBA64_RAW.YELLOW_GREEN]: 55,   // #b3b02d -> turning leaves
  [JEHKOBA64_RAW.DARK_RED]: 330,      // #c40c2e -> dried leaves
  [JEHKOBA64_RAW.PUMPKIN]: 35,        // #faa032 -> sunset leaves

  // Halloween additions
  [JEHKOBA64_RAW.DARK_VIOLET]: 270,   // #773bbf -> witch purple
  [JEHKOBA64_RAW.DEEP_PURPLE]: 280,   // #4e278c -> deep magic
  [JEHKOBA64_RAW.BLACK]: 0,           // #000000 -> midnight
  [JEHKOBA64_RAW.GRAY]: 180,          // #807980 -> ghostly
  [JEHKOBA64_RAW.BRIGHT_ORANGE]: 30   // #f58122 -> jack-o-lantern
} as const

export type SeasonName = keyof typeof SEASONAL_PALETTES
export type Jehkoba64Color = typeof JEHKOBA64_RAW[keyof typeof JEHKOBA64_RAW]