<template>
  <canvas
    ref="canvas"
    class="arcade-1942-bg"
    :style="{ opacity: props.opacity }"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  scrollSpeed?: number
  enableIslands?: boolean
  enableClouds?: boolean
  enablePlane?: boolean
  opacity?: number
}

const props = withDefaults(defineProps<Props>(), {
  scrollSpeed: 0.5,
  enableIslands: true,
  enableClouds: true,
  enablePlane: true,
  opacity: 0.4,
})

const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let animFrame = 0
let scrollOffset = 0
let isMobile = false

// Color palette — 1942 NES-style
const OCEAN_DEEP = '#0a1628'
const OCEAN_MID = '#0f2847'
const OCEAN_LIGHT = '#163d66'
const OCEAN_FOAM = '#1e5a8a'
const ISLAND_GREEN_DARK = '#2d5a1e'
const ISLAND_GREEN = '#3d7a2e'
const ISLAND_GREEN_LIGHT = '#5a9a4a'
const ISLAND_SAND = '#c4a44a'
const ISLAND_SAND_LIGHT = '#dac06a'
const CLOUD_WHITE = '#c8d8e8'
const CLOUD_LIGHT = '#e0e8f0'
const PLANE_BODY = '#6a7a8a'
const PLANE_WING = '#8a9aaa'
const PLANE_COCKPIT = '#2a3a4a'
const PLANE_HIGHLIGHT = '#b0c0d0'

// Seed-based pseudo-random for deterministic terrain
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Pre-generate island positions (deterministic)
const rand = seededRandom(1942)
const islands: { x: number; y: number; w: number; h: number; type: number }[] = []
for (let i = 0; i < 8; i++) {
  islands.push({
    x: rand() * 0.8 + 0.1,
    y: rand() * 2000 + 200,
    w: rand() * 80 + 40,
    h: rand() * 60 + 30,
    type: Math.floor(rand() * 3),
  })
}

// Pre-generate cloud positions
const clouds: { x: number; y: number; w: number; h: number }[] = []
for (let i = 0; i < 6; i++) {
  clouds.push({
    x: rand() * 0.9 + 0.05,
    y: rand() * 1500 + 100,
    w: rand() * 100 + 50,
    h: rand() * 30 + 15,
  })
}

// Plane animation state
let planeY = 0
let planeBob = 0

function drawPixelRect(x: number, y: number, w: number, h: number, color: string) {
  if (!ctx) return
  ctx.fillStyle = color
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h))
}

function drawOcean(width: number, height: number, offset: number) {
  if (!ctx) return
  // Fill deep ocean
  ctx.fillStyle = OCEAN_DEEP
  ctx.fillRect(0, 0, width, height)

  // Wave pattern — horizontal bars that scroll
  const waveHeight = 6
  const waveSpacing = 24
  const numWaves = Math.ceil(height / waveSpacing) + 2

  for (let i = 0; i < numWaves; i++) {
    const baseY = (i * waveSpacing + (offset * 0.8) % waveSpacing) % (height + waveSpacing) - waveSpacing
    const color = i % 3 === 0 ? OCEAN_FOAM : i % 3 === 1 ? OCEAN_LIGHT : OCEAN_MID

    // Slight horizontal variation per wave
    const xShift = Math.sin((i + offset * 0.002) * 1.3) * 20
    drawPixelRect(xShift, baseY, width + 40, waveHeight, color)

    // Sub-pixel wave detail
    if (i % 2 === 0) {
      const detailX = Math.sin((i * 2.7 + offset * 0.003)) * width * 0.3 + width * 0.3
      drawPixelRect(detailX, baseY + waveHeight, 30, 2, OCEAN_FOAM)
    }
  }
}

function drawIsland(cx: number, cy: number, w: number, h: number, type: number) {
  if (!ctx) return
  // Sand border
  ctx.beginPath()
  ctx.ellipse(cx, cy, w * 0.6 + 4, h * 0.5 + 4, 0, 0, Math.PI * 2)
  ctx.fillStyle = ISLAND_SAND_LIGHT
  ctx.fill()

  // Sand base
  ctx.beginPath()
  ctx.ellipse(cx, cy, w * 0.55 + 2, h * 0.45 + 2, 0, 0, Math.PI * 2)
  ctx.fillStyle = ISLAND_SAND
  ctx.fill()

  // Green mass
  ctx.beginPath()
  ctx.ellipse(cx, cy - 2, w * 0.45, h * 0.35, 0, 0, Math.PI * 2)
  ctx.fillStyle = ISLAND_GREEN
  ctx.fill()

  // Highlight
  ctx.beginPath()
  ctx.ellipse(cx - w * 0.1, cy - 4, w * 0.25, h * 0.2, 0, 0, Math.PI * 2)
  ctx.fillStyle = ISLAND_GREEN_LIGHT
  ctx.fill()

  // Dark detail
  if (type >= 1) {
    ctx.beginPath()
    ctx.ellipse(cx + w * 0.15, cy + 2, w * 0.15, h * 0.12, 0, 0, Math.PI * 2)
    ctx.fillStyle = ISLAND_GREEN_DARK
    ctx.fill()
  }

  // Extra small island nearby for type 2
  if (type === 2) {
    ctx.beginPath()
    ctx.ellipse(cx + w * 0.7, cy + h * 0.3, w * 0.15, h * 0.12, 0, 0, Math.PI * 2)
    ctx.fillStyle = ISLAND_SAND
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(cx + w * 0.7, cy + h * 0.3 - 1, w * 0.1, h * 0.08, 0, 0, Math.PI * 2)
    ctx.fillStyle = ISLAND_GREEN
    ctx.fill()
  }
}

function drawCloud(cx: number, cy: number, w: number, h: number) {
  if (!ctx) return
  ctx.globalAlpha = 0.3

  // Main cloud body — overlapping ellipses
  ctx.fillStyle = CLOUD_WHITE
  ctx.beginPath()
  ctx.ellipse(cx, cy, w * 0.4, h * 0.4, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cx - w * 0.2, cy + 2, w * 0.3, h * 0.35, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cx + w * 0.25, cy + 1, w * 0.35, h * 0.38, 0, 0, Math.PI * 2)
  ctx.fill()

  // Highlight
  ctx.fillStyle = CLOUD_LIGHT
  ctx.beginPath()
  ctx.ellipse(cx - w * 0.05, cy - h * 0.1, w * 0.2, h * 0.2, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.globalAlpha = 1
}

function drawPlane(cx: number, cy: number, scale: number) {
  if (!ctx) return
  const s = scale

  // Shadow
  ctx.globalAlpha = 0.15
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.ellipse(cx + 3, cy + 3, 12 * s, 4 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // Wings (horizontal bar)
  drawPixelRect(cx - 22 * s, cy - 2 * s, 44 * s, 5 * s, PLANE_WING)
  drawPixelRect(cx - 20 * s, cy - 1 * s, 40 * s, 3 * s, PLANE_BODY)

  // Fuselage (vertical bar)
  drawPixelRect(cx - 3 * s, cy - 14 * s, 6 * s, 28 * s, PLANE_BODY)
  drawPixelRect(cx - 2 * s, cy - 16 * s, 4 * s, 32 * s, PLANE_WING)

  // Nose
  drawPixelRect(cx - 2 * s, cy - 18 * s, 4 * s, 4 * s, PLANE_HIGHLIGHT)
  drawPixelRect(cx - 1 * s, cy - 20 * s, 2 * s, 3 * s, PLANE_BODY)

  // Cockpit
  drawPixelRect(cx - 2 * s, cy - 6 * s, 4 * s, 5 * s, PLANE_COCKPIT)
  drawPixelRect(cx - 1 * s, cy - 5 * s, 2 * s, 3 * s, '#4a6a8a')

  // Tail fins
  drawPixelRect(cx - 8 * s, cy + 12 * s, 16 * s, 3 * s, PLANE_WING)
  drawPixelRect(cx - 6 * s, cy + 13 * s, 12 * s, 2 * s, PLANE_BODY)

  // Engine nacelles on wings
  drawPixelRect(cx - 14 * s, cy - 4 * s, 4 * s, 8 * s, PLANE_BODY)
  drawPixelRect(cx + 10 * s, cy - 4 * s, 4 * s, 8 * s, PLANE_BODY)

  // Propeller blur (nacelles)
  ctx.globalAlpha = 0.4
  drawPixelRect(cx - 14 * s, cy - 7 * s, 4 * s, 3 * s, PLANE_HIGHLIGHT)
  drawPixelRect(cx + 10 * s, cy - 7 * s, 4 * s, 3 * s, PLANE_HIGHLIGHT)
  ctx.globalAlpha = 1
}

function render() {
  if (!canvas.value || !ctx) return
  const w = canvas.value.width
  const h = canvas.value.height

  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, w, h)

  scrollOffset += props.scrollSpeed

  // Layer 1: Ocean (full speed scroll)
  drawOcean(w, h, scrollOffset)

  // Layer 2: Islands (0.6x parallax) — skip on mobile
  if (props.enableIslands && !isMobile) {
    const islandOffset = scrollOffset * 0.6
    const repeatHeight = 2000
    for (const island of islands) {
      const ix = island.x * w
      const iy = ((island.y + islandOffset) % repeatHeight) - 100
      if (iy > -100 && iy < h + 100) {
        drawIsland(ix, iy, island.w, island.h, island.type)
      }
    }
  }

  // Layer 3: Clouds (0.3x parallax) — skip on mobile
  if (props.enableClouds && !isMobile) {
    const cloudOffset = scrollOffset * 0.3
    const repeatHeight = 1500
    for (const cloud of clouds) {
      const cx = cloud.x * w
      const cy = ((cloud.y + cloudOffset) % repeatHeight) - 50
      if (cy > -50 && cy < h + 50) {
        drawCloud(cx, cy, cloud.w, cloud.h)
      }
    }
  }

  // Layer 4: Player plane — skip on mobile
  if (props.enablePlane && !isMobile) {
    planeBob += 0.02
    planeY = Math.sin(planeBob) * 8
    const px = w * 0.5 + Math.sin(planeBob * 0.7) * 15
    const py = h * 0.72 + planeY
    drawPlane(px, py, 1.5)
  }

  animFrame = requestAnimationFrame(render)
}

function handleResize() {
  if (!canvas.value) return
  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight
  isMobile = window.matchMedia('(max-width: 768px)').matches
}

onMounted(() => {
  if (!canvas.value) return
  ctx = canvas.value.getContext('2d')
  handleResize()
  window.addEventListener('resize', handleResize)
  render()
})

onUnmounted(() => {
  if (animFrame) cancelAnimationFrame(animFrame)
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.arcade-1942-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
</style>
