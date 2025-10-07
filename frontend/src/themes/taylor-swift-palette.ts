/**
 * Taylor Swift Era-Based Color Palette
 *
 * Monthly seasonal theming based on Taylor Swift album aesthetics
 * Each month corresponds to a different album era with unique visual identity
 */

export type TaylorSwiftEra =
  | 'MIDNIGHTS'      // January
  | 'LOVER'          // February
  | 'SPEAK_NOW'      // March
  | 'FEARLESS'       // April
  | 'NINETEEN_EIGHTYNINE' // May (1989)
  | 'FOLKLORE'       // June
  | 'EVERMORE'       // July
  | 'REPUTATION'     // August
  | 'RED'            // September
  | 'TTPD'           // October (The Tortured Poets Department)
  | 'FOLKLORE_COZY'  // November (folklore winter variant)
  | 'EVERMORE_WINTER' // December (evermore winter variant)

export interface EraParticleConfig {
  type: 'stars' | 'hearts' | 'sparkles' | 'leaves' | 'snowflakes' | 'lightning' | 'feathers' | 'typewriter' | 'polaroids' | 'seagulls'
  count: number
  physics: {
    speed: number
    direction: 'upward' | 'downward' | 'floating' | 'chaotic' | 'swirl'
    sway: boolean
    wind: number
  }
  size: {
    min: number
    max: number
  }
}

export interface TaylorSwiftPalette {
  name: string
  era: TaylorSwiftEra
  releaseYear: number
  tagline: string  // Short era description or custom text (add your lyrics here!)
  primary: string[]
  backgrounds: {
    app: string
    surface: string
    card: string
    elevated: string
  }
  effects: {
    glow: string
    shadow: string
    scanline: string
  }
  particles: EraParticleConfig
}

// Taylor Swift Era Palettes
export const TAYLOR_SWIFT_PALETTES: Record<TaylorSwiftEra, TaylorSwiftPalette> = {
  // January - Midnights: Midnight blue, lavender, purple, starry
  MIDNIGHTS: {
    name: 'Midnights',
    era: 'MIDNIGHTS',
    releaseYear: 2022,
    tagline: 'Meet me at midnight',  // 👈 Customize this with your favorite lyric!
    primary: [
      '#191970', // Midnight blue
      '#4B0082', // Indigo
      '#663399', // Rebecca purple
      '#9370DB', // Medium purple
      '#B19CD9', // Lavender
      '#E6E6FA', // Lavender mist
      '#4682B4', // Steel blue
      '#1E90FF'  // Dodger blue
    ],
    backgrounds: {
      app: '#0A0A1F',      // Deep midnight
      surface: '#191970',   // Midnight blue
      card: '#2E1A47',      // Deep purple
      elevated: '#4B0082'   // Indigo
    },
    effects: {
      glow: '#B19CD9',     // Lavender glow
      shadow: 'rgba(10, 10, 31, 0.8)',
      scanline: '#E6E6FA'  // Lavender mist
    },
    particles: {
      type: 'stars',
      count: 30,
      physics: {
        speed: 0.3,
        direction: 'floating',
        sway: true,
        wind: 0.2
      },
      size: { min: 8, max: 20 }
    }
  },

  // February - Lover: Pink, pastel rainbow, dreamy
  LOVER: {
    name: 'Lover',
    era: 'LOVER',
    releaseYear: 2019,
    tagline: 'Pastel dreams and butterflies',  // 👈 Customize this!
    primary: [
      '#FFB6C1', // Light pink
      '#FF69B4', // Hot pink
      '#FF1493', // Deep pink
      '#FFC0CB', // Pink
      '#E0BBE4', // Pastel purple
      '#957DAD', // Dusty purple
      '#87CEEB', // Sky blue
      '#FFE4E1'  // Misty rose
    ],
    backgrounds: {
      app: '#FFF5F7',      // Very light pink
      surface: '#FFE4E1',   // Misty rose
      card: '#FFB6C1',      // Light pink
      elevated: '#FF69B4'   // Hot pink
    },
    effects: {
      glow: '#FF1493',     // Deep pink glow
      shadow: 'rgba(255, 182, 193, 0.4)',
      scanline: '#FFC0CB'  // Pink
    },
    particles: {
      type: 'hearts',
      count: 25,
      physics: {
        speed: 0.4,
        direction: 'upward',
        sway: true,
        wind: 0.3
      },
      size: { min: 16, max: 32 }
    }
  },

  // March - Speak Now: Purple, enchanted forest, fairy tale
  SPEAK_NOW: {
    name: 'Speak Now',
    era: 'SPEAK_NOW',
    releaseYear: 2023,
    tagline: 'Enchanted purple dreams',  // 👈 Customize this!
    primary: [
      '#663399', // Rebecca purple
      '#8B008B', // Dark magenta
      '#9932CC', // Dark orchid
      '#BA55D3', // Medium orchid
      '#DDA0DD', // Plum
      '#EE82EE', // Violet
      '#DA70D6', // Orchid
      '#FF00FF'  // Magenta
    ],
    backgrounds: {
      app: '#2E1A47',      // Deep purple night
      surface: '#663399',   // Rebecca purple
      card: '#8B008B',      // Dark magenta
      elevated: '#BA55D3'   // Medium orchid
    },
    effects: {
      glow: '#EE82EE',     // Violet glow
      shadow: 'rgba(46, 26, 71, 0.7)',
      scanline: '#DDA0DD'  // Plum
    },
    particles: {
      type: 'sparkles',
      count: 35,
      physics: {
        speed: 0.5,
        direction: 'floating',
        sway: true,
        wind: 0.4
      },
      size: { min: 12, max: 28 }
    }
  },

  // April - Fearless (TV): Gold, yellow, romantic
  FEARLESS: {
    name: 'Fearless',
    era: 'FEARLESS',
    releaseYear: 2021,
    tagline: 'Golden and fearless',  // 👈 Customize this!
    primary: [
      '#FFD700', // Gold
      '#FFA500', // Orange
      '#FFDB58', // Mustard
      '#FFEF00', // Yellow
      '#F4C430', // Saffron
      '#DAA520', // Goldenrod
      '#B8860B', // Dark goldenrod
      '#F0E68C'  // Khaki
    ],
    backgrounds: {
      app: '#2C2416',      // Dark warm brown
      surface: '#4A3C1E',   // Warm brown
      card: '#DAA520',      // Goldenrod
      elevated: '#FFD700'   // Gold
    },
    effects: {
      glow: '#FFEF00',     // Yellow glow
      shadow: 'rgba(44, 36, 22, 0.6)',
      scanline: '#F0E68C'  // Khaki
    },
    particles: {
      type: 'sparkles',
      count: 30,
      physics: {
        speed: 0.6,
        direction: 'swirl',
        sway: true,
        wind: 0.5
      },
      size: { min: 10, max: 24 }
    }
  },

  // May - 1989 (TV): Pastel blues, soft pinks, polaroid aesthetic
  NINETEEN_EIGHTYNINE: {
    name: '1989',
    era: 'NINETEEN_EIGHTYNINE',
    releaseYear: 2023,
    tagline: 'Sky blue polaroid memories',  // 👈 Customize this!
    primary: [
      '#87CEEB', // Sky blue
      '#B0E0E6', // Powder blue
      '#ADD8E6', // Light blue
      '#E0F6FF', // Baby blue
      '#FFB6C1', // Light pink
      '#FFC0CB', // Pink
      '#E6F3FF', // Alice blue
      '#F0F8FF'  // Alice blue light
    ],
    backgrounds: {
      app: '#E6F3FF',      // Very light blue
      surface: '#B0E0E6',   // Powder blue
      card: '#87CEEB',      // Sky blue
      elevated: '#ADD8E6'   // Light blue
    },
    effects: {
      glow: '#00BFFF',     // Deep sky blue
      shadow: 'rgba(135, 206, 235, 0.3)',
      scanline: '#F0F8FF'  // Alice blue light
    },
    particles: {
      type: 'seagulls',
      count: 15,
      physics: {
        speed: 0.8,
        direction: 'floating',
        sway: true,
        wind: 0.6
      },
      size: { min: 20, max: 40 }
    }
  },

  // June - folklore: Grey, forest green, cottagecore
  FOLKLORE: {
    name: 'folklore',
    era: 'FOLKLORE',
    releaseYear: 2020,
    tagline: 'Misty forest daydreams',  // 👈 Customize this!
    primary: [
      '#708090', // Slate gray
      '#778899', // Light slate gray
      '#2F4F4F', // Dark slate gray
      '#696969', // Dim gray
      '#556B2F', // Dark olive green
      '#6B8E23', // Olive drab
      '#8FBC8F', // Dark sea green
      '#BDB76B'  // Dark khaki
    ],
    backgrounds: {
      app: '#1C1C1C',      // Almost black
      surface: '#2F4F4F',   // Dark slate gray
      card: '#556B2F',      // Dark olive green
      elevated: '#708090'   // Slate gray
    },
    effects: {
      glow: '#8FBC8F',     // Dark sea green
      shadow: 'rgba(28, 28, 28, 0.8)',
      scanline: '#BDB76B'  // Dark khaki
    },
    particles: {
      type: 'leaves',
      count: 20,
      physics: {
        speed: 0.5,
        direction: 'downward',
        sway: true,
        wind: 0.4
      },
      size: { min: 18, max: 35 }
    }
  },

  // July - evermore: Orange/brown, autumn forest
  EVERMORE: {
    name: 'evermore',
    era: 'EVERMORE',
    releaseYear: 2020,
    tagline: 'Autumn forest whispers',  // 👈 Customize this!
    primary: [
      '#D2691E', // Chocolate
      '#8B4513', // Saddle brown
      '#A0522D', // Sienna
      '#CD853F', // Peru
      '#DEB887', // Burlywood
      '#F4A460', // Sandy brown
      '#BC8F8F', // Rosy brown
      '#DAA520'  // Goldenrod
    ],
    backgrounds: {
      app: '#2C1810',      // Very dark brown
      surface: '#3D2817',   // Dark brown
      card: '#8B4513',      // Saddle brown
      elevated: '#A0522D'   // Sienna
    },
    effects: {
      glow: '#F4A460',     // Sandy brown
      shadow: 'rgba(44, 24, 16, 0.7)',
      scanline: '#DEB887'  // Burlywood
    },
    particles: {
      type: 'leaves',
      count: 25,
      physics: {
        speed: 0.7,
        direction: 'downward',
        sway: true,
        wind: 0.5
      },
      size: { min: 20, max: 38 }
    }
  },

  // August - Reputation: Black, snake green, dark/edgy
  REPUTATION: {
    name: 'reputation',
    era: 'REPUTATION',
    releaseYear: 2017,
    tagline: 'Dark edges and lime lightning',  // 👈 Customize this!
    primary: [
      '#000000', // Black
      '#0F0F0F', // Very dark gray
      '#1C1C1C', // Dark gray
      '#2F4F2F', // Dark green
      '#006400', // Dark green
      '#228B22', // Forest green
      '#32CD32', // Lime green
      '#7FFF00'  // Chartreuse
    ],
    backgrounds: {
      app: '#000000',      // Pure black
      surface: '#0F0F0F',   // Very dark gray
      card: '#1C1C1C',      // Dark gray
      elevated: '#2F4F2F'   // Dark green
    },
    effects: {
      glow: '#32CD32',     // Lime green (snake)
      shadow: 'rgba(0, 0, 0, 0.95)',
      scanline: '#7FFF00'  // Chartreuse
    },
    particles: {
      type: 'lightning',
      count: 12,
      physics: {
        speed: 1.2,
        direction: 'chaotic',
        sway: false,
        wind: 0.8
      },
      size: { min: 30, max: 60 }
    }
  },

  // September - Red (TV): Deep red, burgundy, autumn
  RED: {
    name: 'Red',
    era: 'RED',
    releaseYear: 2021,
    tagline: 'Burning red autumn',  // 👈 Customize this!
    primary: [
      '#8B0000', // Dark red
      '#B22222', // Firebrick
      '#DC143C', // Crimson
      '#FF0000', // Red
      '#8B4513', // Saddle brown
      '#A0522D', // Sienna
      '#CD5C5C', // Indian red
      '#F08080'  // Light coral
    ],
    backgrounds: {
      app: '#1A0000',      // Very dark red
      surface: '#3D0000',   // Dark red
      card: '#8B0000',      // Dark red
      elevated: '#B22222'   // Firebrick
    },
    effects: {
      glow: '#FF0000',     // Red glow
      shadow: 'rgba(26, 0, 0, 0.8)',
      scanline: '#F08080'  // Light coral
    },
    particles: {
      type: 'leaves',
      count: 28,
      physics: {
        speed: 0.9,
        direction: 'downward',
        sway: true,
        wind: 0.6
      },
      size: { min: 22, max: 42 }
    }
  },

  // October - TTPD: Black/white, typewriter aesthetic
  TTPD: {
    name: 'The Tortured Poets Department',
    era: 'TTPD',
    releaseYear: 2024,
    tagline: 'Ink and typewriter dreams',  // 👈 Customize this!
    primary: [
      '#000000', // Black
      '#2F2F2F', // Dark gray
      '#4F4F4F', // Gray
      '#696969', // Dim gray
      '#808080', // Gray
      '#A9A9A9', // Dark gray
      '#D3D3D3', // Light gray
      '#FFFFFF'  // White
    ],
    backgrounds: {
      app: '#0A0A0A',      // Near black
      surface: '#1A1A1A',   // Very dark gray
      card: '#2F2F2F',      // Dark gray
      elevated: '#4F4F4F'   // Gray
    },
    effects: {
      glow: '#FFFFFF',     // White glow
      shadow: 'rgba(10, 10, 10, 0.9)',
      scanline: '#D3D3D3'  // Light gray
    },
    particles: {
      type: 'typewriter',
      count: 20,
      physics: {
        speed: 0.4,
        direction: 'floating',
        sway: false,
        wind: 0.1
      },
      size: { min: 14, max: 28 }
    }
  },

  // November - folklore (Cozy Winter Variant)
  FOLKLORE_COZY: {
    name: 'folklore (cozy)',
    era: 'FOLKLORE_COZY',
    releaseYear: 2020,
    tagline: 'Warm cabin retreat',  // 👈 Customize this!
    primary: [
      '#8B7355', // Burlywood
      '#A0826D', // Tan
      '#B8956A', // Dark tan
      '#C9A66B', // Sandy brown
      '#6B8E23', // Olive drab
      '#556B2F', // Dark olive
      '#8FBC8F', // Dark sea green
      '#D2B48C'  // Tan
    ],
    backgrounds: {
      app: '#2C2416',      // Dark warm brown
      surface: '#3D3525',   // Warm brown
      card: '#4D4535',      // Medium brown
      elevated: '#6B5D47'   // Light brown
    },
    effects: {
      glow: '#D2B48C',     // Tan glow
      shadow: 'rgba(44, 36, 22, 0.7)',
      scanline: '#C9A66B'  // Sandy brown
    },
    particles: {
      type: 'feathers',
      count: 18,
      physics: {
        speed: 0.6,
        direction: 'floating',
        sway: true,
        wind: 0.3
      },
      size: { min: 16, max: 32 }
    }
  },

  // December - evermore (Winter Cabin Variant)
  EVERMORE_WINTER: {
    name: 'evermore (winter)',
    era: 'EVERMORE_WINTER',
    releaseYear: 2020,
    tagline: 'Snowy cabin warmth',  // 👈 Customize this!
    primary: [
      '#8B4513', // Saddle brown
      '#A0522D', // Sienna
      '#CD853F', // Peru
      '#D2691E', // Chocolate
      '#FFFAF0', // Floral white
      '#F5F5DC', // Beige
      '#FFE4C4', // Bisque
      '#FAEBD7'  // Antique white
    ],
    backgrounds: {
      app: '#1C0F08',      // Very dark brown
      surface: '#2D1A0F',   // Dark brown
      card: '#3E2515',      // Medium dark brown
      elevated: '#5C3A21'   // Brown
    },
    effects: {
      glow: '#FFE4C4',     // Bisque glow
      shadow: 'rgba(28, 15, 8, 0.8)',
      scanline: '#FAEBD7'  // Antique white
    },
    particles: {
      type: 'snowflakes',
      count: 35,
      physics: {
        speed: 0.8,
        direction: 'downward',
        sway: true,
        wind: 0.5
      },
      size: { min: 12, max: 28 }
    }
  }
}

// Month to Era mapping
export function getCurrentEra(): TaylorSwiftEra {
  const month = new Date().getMonth() // 0-11
  const eraMap: Record<number, TaylorSwiftEra> = {
    0: 'MIDNIGHTS',           // January
    1: 'LOVER',               // February
    2: 'SPEAK_NOW',           // March
    3: 'FEARLESS',            // April
    4: 'NINETEEN_EIGHTYNINE', // May
    5: 'FOLKLORE',            // June
    6: 'EVERMORE',            // July
    7: 'REPUTATION',          // August
    8: 'RED',                 // September
    9: 'TTPD',                // October
    10: 'FOLKLORE_COZY',      // November
    11: 'EVERMORE_WINTER'     // December
  }
  return eraMap[month]
}

export function getEraByMonth(month: number): TaylorSwiftEra {
  const eraMap: Record<number, TaylorSwiftEra> = {
    0: 'MIDNIGHTS',
    1: 'LOVER',
    2: 'SPEAK_NOW',
    3: 'FEARLESS',
    4: 'NINETEEN_EIGHTYNINE',
    5: 'FOLKLORE',
    6: 'EVERMORE',
    7: 'REPUTATION',
    8: 'RED',
    9: 'TTPD',
    10: 'FOLKLORE_COZY',
    11: 'EVERMORE_WINTER'
  }
  return eraMap[month % 12]
}
