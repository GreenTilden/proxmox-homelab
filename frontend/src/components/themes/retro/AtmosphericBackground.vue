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
  scaleX: number
  scaleY: number
  initialRotation: number
  symbol: string
  style: Record<string, string>
  class: string
}

const particles = ref<Particle[]>([])
const animationFrame = ref<number>()
const spawnTimer = ref<number>()
const particleSpawnQueue = ref<number>(0)

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

/**
 * Dual-Leaf Particle System Implementation
 *
 * This component creates a realistic autumn leaf fall effect using two distinct leaf shapes:
 * - leaf_1.png: Maple-style leaf with sharper edges (falls at standard speed)
 * - leaf_2.png: Oak-style leaf with rounded edges (falls 10% slower for natural variety)
 *
 * Color System: Uses Jekyll64 palette with refined CSS filters for natural autumn colors
 * Filter Applied: hue-rotate(X°) brightness(0.95) saturate(0.7) + subtle drop-shadow
 *
 * Performance: Random leaf selection, physics variations, and staggered animations
 * for smooth 60fps performance with 20+ particles
 */

import { PARTICLE_HUE_ROTATIONS } from '@/themes/jehkoba64-palette'

// Seasonal particle asset management
const getParticleAssets = (particleType: string): string[] => {
  switch (particleType) {
    case 'leaf':
      return [
        '/assets/seasons/autumn/leaf_1.png',
        '/assets/seasons/autumn/leaf_2.png'
      ]
    case 'spooky':
      // Halloween assets - will be provided by user
      return [
        '/assets/seasons/halloween/spooky_1.png',
        '/assets/seasons/halloween/spooky_2.png'
      ]
    case 'snowflake':
      // Future winter assets
      return [
        '/assets/seasons/winter/snowflake_1.png',
        '/assets/seasons/winter/snowflake_2.png'
      ]
    case 'petal':
      // Future spring assets
      return [
        '/assets/seasons/spring/petal_1.png',
        '/assets/seasons/spring/petal_2.png'
      ]
    default:
      // Fallback to autumn leaves
      return [
        '/assets/seasons/autumn/leaf_1.png',
        '/assets/seasons/autumn/leaf_2.png'
      ]
  }
}

const getPhysicsMultiplier = (assetPath: string): number => {
  if (assetPath.includes('leaf_1')) return 1.0  // Maple leaf (standard speed)
  if (assetPath.includes('leaf_2')) return 0.9  // Oak leaf (slightly slower)
  if (assetPath.includes('spooky')) return 0.7  // Halloween assets (mysterious slow)
  if (assetPath.includes('snowflake')) return 1.2  // Snow (faster)
  if (assetPath.includes('petal')) return 0.6  // Petals (gentle)
  return 1.0  // Default
}

const getRotationVariance = (assetPath: string): number => {
  if (assetPath.includes('leaf_1')) return 360  // Maple leaf (full rotation)
  if (assetPath.includes('leaf_2')) return 270  // Oak leaf (less rotation)
  if (assetPath.includes('spooky')) return 180  // Halloween (limited spooky sway)
  if (assetPath.includes('snowflake')) return 360  // Snow (full spin)
  if (assetPath.includes('petal')) return 180  // Petals (gentle flutter)
  return 360  // Default
}

// Color conversion utilities using official Jehkoba64 palette
const getHueRotation = (color: string): number => {
  // Use centralized Jehkoba64 particle hue rotation mapping
  return PARTICLE_HUE_ROTATIONS[color as keyof typeof PARTICLE_HUE_ROTATIONS] || 0
}

const createParticle = (id: number): Particle => {
  const size = Math.random() * (props.particles.size.max - props.particles.size.min) + props.particles.size.min
  const color = props.particles.colors[Math.floor(Math.random() * props.particles.colors.length)]
  const speed = props.particles.physics.speed + (Math.random() - 0.5) * 0.2

  // Get seasonal particle assets
  const particleAssets = getParticleAssets(props.particles.type)
  const assetPath = particleAssets[Math.floor(Math.random() * particleAssets.length)]

  // Add physics variations based on asset type
  const physicsMultiplier = getPhysicsMultiplier(assetPath)
  const rotationVariance = getRotationVariance(assetPath)

  // Enhanced particle variation based on leaf type
  let scaleX = 1
  let scaleY = 1
  let initialRotation = Math.random() * rotationVariance

  if (assetPath.includes('leaf_1')) {
    // Mirror ALL leaf_1 particles horizontally for obvious effect
    scaleX = -1  // Always mirror leaf_1
    scaleY = 1
    initialRotation = 45 // Fixed 45 degree tilt
  } else if (assetPath.includes('leaf_2')) {
    // Flip ALL leaf_2 particles both ways for obvious effect
    scaleX = -1  // Always horizontal flip
    scaleY = -1  // Always vertical flip
    initialRotation = 135 // Fixed 135 degree tilt
  } else {
    // Default behavior for other particle types
    scaleX = 1
    scaleY = 1
    initialRotation = 0
  }

  const symbol = '' // Empty since we'll use background-image

  return {
    id,
    x: Math.random() * 100,
    y: -10,
    size,
    color,
    speed: speed * physicsMultiplier,
    swayOffset: Math.random() * Math.PI * 2,
    scaleX,
    scaleY,
    initialRotation,
    symbol,
    style: {
      position: 'absolute',
      width: `${size}px`,
      height: `${size}px`,
      backgroundImage: `url(${assetPath})`,
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      color: color,
      filter: `hue-rotate(${getHueRotation(color)}deg) brightness(0.95) saturate(0.7) drop-shadow(0 0 2px ${color}40)`,
      left: `${Math.random() * 100}%`,
      top: '-10px',
      transform: `scaleX(${scaleX}) scaleY(${scaleY}) rotate(${initialRotation}deg)`,
      pointerEvents: 'none',
      userSelect: 'none',
      opacity: `${0.5 + Math.random() * 0.5}`,
      zIndex: '1',
      willChange: 'transform',  // Hint browser to optimize for transforms
      '--random-delay': Math.random() * 2,
      '--fall-delay': Math.random() * 3,
      '--rotation-delay': Math.random() * 4,
      '--flutter-delay': Math.random() * 2
    },
    class: 'particle-js-controlled'
  }
}

const initParticles = () => {
  // Clear any existing particles and timers
  particles.value = []
  if (spawnTimer.value) {
    clearInterval(spawnTimer.value)
  }

  // Start staggered particle spawning
  particleSpawnQueue.value = props.particles.count
  spawnParticlesGradually()
}

const spawnParticlesGradually = () => {
  // Spawn particles at intervals for smooth performance
  const spawnInterval = 200 // milliseconds between spawns

  spawnTimer.value = setInterval(() => {
    if (particleSpawnQueue.value > 0 && particles.value.length < props.particles.count) {
      // Create new particle with random initial Y position for natural distribution
      const newParticle = createParticle(particles.value.length)

      // Spread particles vertically for natural appearance
      const distributionHeight = window.innerHeight * 0.6 // Use 60% of screen height
      newParticle.y = -Math.random() * distributionHeight - 50
      newParticle.style.top = `${newParticle.y}px`

      particles.value.push(newParticle)
      particleSpawnQueue.value--
    } else {
      // All particles spawned, clear timer
      if (spawnTimer.value) {
        clearInterval(spawnTimer.value)
        spawnTimer.value = undefined
      }
    }
  }, spawnInterval)
}

const animateParticles = () => {
  particles.value.forEach(particle => {
    // Move down
    particle.y += particle.speed

    // Add sway effect (optimized with cached values)
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
      // Reset initial rotation for variety
      particle.initialRotation = Math.random() * 360
    }

    // Keep particles within horizontal bounds
    if (particle.x < -10) particle.x = 110
    if (particle.x > 110) particle.x = -10

    // Update styles with GPU-optimized approach
    particle.style.left = `${particle.x}%`
    particle.style.top = `${particle.y}px`

    // Add multi-layered natural tumbling effect
    const gentleRotation = Math.sin(particle.swayOffset * 0.3) * 8    // Slow gentle rotation
    const flutterRotation = Math.sin(particle.swayOffset * 1.2) * 3   // Fast flutter
    const scaleVariation = 1 + Math.sin(particle.swayOffset * 0.8) * 0.05  // Subtle size pulse

    const totalRotation = particle.initialRotation + gentleRotation + flutterRotation

    // Apply transforms with natural tumbling: scale, size variation, rotation
    particle.style.transform = `scaleX(${particle.scaleX * scaleVariation}) scaleY(${particle.scaleY * scaleVariation}) rotate(${totalRotation}deg)`
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
  if (spawnTimer.value) {
    clearInterval(spawnTimer.value)
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
  z-index: 5;
}

.particle {
  position: absolute;
  animation:
    particle-float 15s linear infinite,
    leaf-flutter 3s ease-in-out infinite;
  animation-delay: 0s, calc(var(--random-delay, 0) * 1s);
}

.particle-floating {
  animation:
    particle-float 15s linear infinite,
    gentle-rotation 6s ease-in-out infinite,
    leaf-flutter 4s ease-in-out infinite;
  animation-delay:
    calc(var(--fall-delay, 0) * 1s),
    calc(var(--rotation-delay, 0) * 1s),
    calc(var(--flutter-delay, 0) * 1s);
}

.particle-js-controlled {
  /* No CSS animations - fully controlled by JavaScript */
  position: absolute;
  animation: none !important;
  transform-origin: center center;
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
    transform: translateY(calc(100vh + 50px)) rotate(360deg);
  }
}

@keyframes gentle-rotation {
  0%, 100% {
    transform: rotate(-15deg) scale(1);
  }
  25% {
    transform: rotate(10deg) scale(1.05);
  }
  50% {
    transform: rotate(-5deg) scale(1.1);
  }
  75% {
    transform: rotate(15deg) scale(1.05);
  }
}

@keyframes leaf-flutter {
  0%, 100% {
    transform: rotate(0deg) translateX(0px);
  }
  25% {
    transform: rotate(-8deg) translateX(-5px);
  }
  50% {
    transform: rotate(3deg) translateX(8px);
  }
  75% {
    transform: rotate(-3deg) translateX(-3px);
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