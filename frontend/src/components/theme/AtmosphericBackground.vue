<template>
  <div class="atmospheric-background">
    <!-- Gradient Background -->
    <div
      class="background-gradient"
      :style="gradientStyles"
    />

    <!-- Floating Particles -->
    <div class="particle-container" v-if="enableParticles">
      <div
        v-for="particle in particles"
        :key="particle.id"
        class="particle"
        :style="particle.style"
        :class="particle.class"
      >
        {{ particle.symbol }}
      </div>
    </div>

    <!-- Organic Pattern Overlay -->
    <div
      class="pattern-overlay"
      :style="patternStyles"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

interface ParticleConfig {
  count: number
  type: 'leaf' | 'snowflake'
  colors: string[]
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

interface Props {
  particles: ParticleConfig
  backgroundGradient: string
  enableParticles?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  enableParticles: true
})

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  speed: number
  swayOffset: number
  symbol: string
  style: Record<string, string>
  class: string
}

const particles = ref<Particle[]>([])
const animationFrame = ref<number>()

const gradientStyles = computed(() => ({
  background: props.backgroundGradient,
  opacity: '0.8'
}))

const patternStyles = computed(() => {
  const patternType = 'organic-shapes' // Always use fall/forest organic shapes
  const opacity = 0.05

  if (patternType === 'organic-shapes') {
    // SVG pattern for organic forest shapes
    return {
      background: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23179c43' fill-opacity='${opacity}'%3E%3Cpath d='M20 20c0-5 5-10 10-10s10 5 10 10-5 10-10 10-10-5-10-10zM0 20c0-5 5-10 10-10s10 5 10 10-5 10-10 10S0 25 0 20z'/%3E%3C/g%3E%3C/svg%3E")`,
      backgroundSize: '40px 40px'
    }
  } else {
    // CSS pattern for crystalline winter shapes
    return {
      background: `
        radial-gradient(circle at 20% 20%, rgba(73, 194, 242, ${opacity}) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255, 112, 112, ${opacity}) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(250, 217, 55, ${opacity}) 0%, transparent 50%)
      `,
      backgroundSize: '60px 60px'
    }
  }
})

const createParticle = (id: number): Particle => {
  const size = Math.random() * (props.particles.size.max - props.particles.size.min) + props.particles.size.min
  const color = props.particles.colors[Math.floor(Math.random() * props.particles.colors.length)]
  const speed = props.particles.physics.speed + (Math.random() - 0.5) * 0.2

  const symbols = {
    leaf: ['🍂', '🍃', '🌿'],
    snowflake: ['❄️', '❅', '⋆', '✦']
  }

  const symbol = symbols[props.particles.type][Math.floor(Math.random() * symbols[props.particles.type].length)]

  return {
    id,
    x: Math.random() * 100,
    y: -10,
    size,
    color,
    speed,
    swayOffset: Math.random() * Math.PI * 2,
    symbol,
    style: {
      position: 'absolute',
      left: `${Math.random() * 100}%`,
      top: '-10px',
      fontSize: `${size}px`,
      color,
      pointerEvents: 'none',
      userSelect: 'none',
      opacity: `${0.3 + Math.random() * 0.5}`,
      filter: `drop-shadow(0 0 2px ${color}40)`,
      transform: `rotate(${Math.random() * 360}deg)`,
      zIndex: '1'
    },
    class: 'particle-floating'
  }
}

const initParticles = () => {
  particles.value = Array.from({ length: props.particles.count }, (_, i) => createParticle(i))
}

const animateParticles = () => {
  particles.value.forEach(particle => {
    // Move down
    particle.y += particle.speed

    // Add sway effect
    if (props.particles.physics.sway) {
      particle.swayOffset += 0.02
      const swayAmount = Math.sin(particle.swayOffset) * props.particles.physics.wind * 10
      particle.x += swayAmount * 0.1
    }

    // Reset particle when it goes off screen
    if (particle.y > window.innerHeight + 50) {
      particle.y = -10
      particle.x = Math.random() * 100
      particle.swayOffset = Math.random() * Math.PI * 2
    }

    // Keep particles within horizontal bounds
    if (particle.x < -10) particle.x = 110
    if (particle.x > 110) particle.x = -10

    // Update styles
    particle.style.left = `${particle.x}%`
    particle.style.top = `${particle.y}px`
  })

  animationFrame.value = requestAnimationFrame(animateParticles)
}

onMounted(() => {
  if (props.enableParticles) {
    initParticles()
    animateParticles()
  }
})

onUnmounted(() => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
  }
})
</script>

<style scoped>
.atmospheric-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.background-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.particle-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.particle {
  position: absolute;
  animation: particle-float 20s linear infinite;
}

.particle-floating {
  animation: gentle-rotation 10s ease-in-out infinite;
}

.pattern-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  animation: pattern-drift 30s linear infinite;
}

@keyframes particle-float {
  0% {
    transform: translateY(-10px) rotate(0deg);
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
  }
}

@keyframes gentle-rotation {
  0%, 100% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(5deg) scale(1.1);
  }
}

@keyframes pattern-drift {
  0% {
    transform: translateX(0) translateY(0);
  }
  50% {
    transform: translateX(-10px) translateY(-5px);
  }
  100% {
    transform: translateX(0) translateY(0);
  }
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .particle {
    animation: none;
  }

  .particle-floating {
    animation: none;
  }

  .pattern-overlay {
    animation: none;
  }
}
</style>