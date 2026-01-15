<template>
  <div class="wh-banner" :class="seasonClass">
    <!-- Seasonal Particles -->
    <div class="wh-particles" v-if="enableParticles">
      <div
        v-for="i in particleCount"
        :key="i"
        class="particle"
        :style="getParticleStyle(i)"
      />
    </div>

    <!-- House Illustration -->
    <div class="wh-banner-house">
      <img
        v-if="houseImageSrc"
        :src="houseImageSrc"
        :alt="title"
        class="house-image"
      />
      <div v-else class="house-placeholder">
        <!-- Placeholder silhouette until custom image is added -->
        <svg viewBox="0 0 200 120" class="house-silhouette">
          <!-- Simple Tudor house outline -->
          <path
            d="M20,100 L20,60 L50,30 L80,60 L80,45 L100,25 L120,45 L120,60 L150,30 L180,60 L180,100 Z"
            fill="currentColor"
          />
          <!-- Door arch -->
          <path
            d="M90,100 L90,70 Q100,60 110,70 L110,100 Z"
            fill="var(--wh-navy)"
          />
          <!-- Windows -->
          <rect x="35" y="65" width="20" height="25" fill="var(--wh-navy)" />
          <rect x="145" y="65" width="20" height="25" fill="var(--wh-navy)" />
        </svg>
      </div>
    </div>

    <!-- Title Banner -->
    <div class="wh-banner-text">
      <span class="wh-banner-title">{{ title }}</span>
      <span class="wh-banner-subtitle">{{ subtitle }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  subtitle?: string
  houseImageSrc?: string
  season?: 'winter' | 'spring' | 'summer' | 'fall'
  enableParticles?: boolean
}>(), {
  title: 'Little Castle in Between',
  subtitle: 'Indianapolis',
  houseImageSrc: '',
  season: 'winter',
  enableParticles: true
})

const seasonClass = computed(() => `season-${props.season}`)

const particleCount = computed(() => {
  switch (props.season) {
    case 'winter': return 50
    case 'fall': return 30
    case 'spring': return 25
    default: return 15
  }
})

const getParticleStyle = (index: number) => {
  const delay = Math.random() * 10
  const duration = 8 + Math.random() * 8
  const left = Math.random() * 100
  const size = 4 + Math.random() * 8

  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    width: `${size}px`,
    height: `${size}px`,
    opacity: 0.6 + Math.random() * 0.4
  }
}
</script>

<style scoped>
.wh-banner {
  position: relative;
  background: linear-gradient(180deg, var(--wh-navy-dark) 0%, var(--wh-navy) 100%);
  padding: var(--wh-space-6) var(--wh-space-4);
  text-align: center;
  overflow: hidden;
  border-bottom: 3px solid var(--wh-gold);
}

/* Particles container */
.wh-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  top: -20px;
  border-radius: 50%;
  animation: fall linear infinite;
}

/* Winter - Snowflakes */
.season-winter .particle {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.5);
}

/* Fall - Leaves */
.season-fall .particle {
  background: linear-gradient(135deg, #d4740f, #8b4513);
  border-radius: 0 50% 50% 50%;
  transform: rotate(45deg);
}

/* Spring - Petals */
.season-spring .particle {
  background: linear-gradient(135deg, #ffb7c5, #ff69b4);
  border-radius: 50% 0 50% 0;
}

/* Summer - Dust motes */
.season-summer .particle {
  background: rgba(255, 223, 128, 0.6);
  box-shadow: 0 0 6px rgba(255, 200, 100, 0.4);
}

@keyframes fall {
  0% {
    transform: translateY(-20px) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(calc(100vh + 20px)) rotate(360deg);
    opacity: 0;
  }
}

/* Add horizontal sway for more natural movement */
.season-winter .particle {
  animation: fall-sway linear infinite;
}

@keyframes fall-sway {
  0% {
    transform: translateY(-20px) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  25% {
    transform: translateY(25vh) translateX(15px) rotate(90deg);
  }
  50% {
    transform: translateY(50vh) translateX(-10px) rotate(180deg);
  }
  75% {
    transform: translateY(75vh) translateX(20px) rotate(270deg);
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(calc(100vh + 20px)) translateX(0) rotate(360deg);
    opacity: 0;
  }
}

/* House illustration */
.wh-banner-house {
  position: relative;
  z-index: 1;
  max-width: 300px;
  margin: 0 auto var(--wh-space-4);
}

.house-image {
  width: 100%;
  height: auto;
  max-height: 150px;
  object-fit: contain;
  filter: brightness(1.1);
}

.house-placeholder {
  width: 100%;
}

.house-silhouette {
  width: 100%;
  height: 100px;
  color: rgba(255, 255, 255, 0.95);
}

/* Text banner */
.wh-banner-text {
  position: relative;
  z-index: 1;
}

.wh-banner-title {
  display: block;
  font-family: var(--wh-font-serif);
  font-size: var(--wh-text-xl);
  font-weight: normal;
  color: var(--wh-white);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: var(--wh-space-1);
}

.wh-banner-subtitle {
  display: block;
  font-family: var(--wh-font-sans);
  font-size: var(--wh-text-sm);
  font-weight: 600;
  color: var(--wh-gold);
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

/* Responsive */
@media (max-width: 768px) {
  .wh-banner {
    padding: var(--wh-space-4) var(--wh-space-3);
  }

  .wh-banner-title {
    font-size: var(--wh-text-lg);
    letter-spacing: 0.1em;
  }

  .house-silhouette {
    height: 70px;
  }
}
</style>
