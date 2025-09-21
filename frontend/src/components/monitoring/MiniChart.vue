<template>
  <div class="mini-chart" :style="{ height: height + 'px' }">
    <div class="chart-header" v-if="showHeader">
      <span class="chart-title">{{ title || 'System Metrics' }}</span>
      <span class="chart-timespan">Last {{ timeSpan }}</span>
    </div>
    
    <canvas 
      ref="chartCanvas"
      :width="canvasWidth"
      :height="canvasHeight"
      class="chart-canvas"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    ></canvas>
    
    <div v-if="loading" class="chart-overlay">
      <div class="animate-pulse" style="color: var(--text-muted);">Loading chart data...</div>
    </div>
    
    <div v-if="error" class="chart-overlay">
      <div style="color: rgba(255, 100, 100, 1);" class="text-sm">{{ error }}</div>
    </div>
    
    <div v-if="!data || data.length === 0" class="chart-overlay">
      <div style="color: var(--text-muted);" class="text-sm">No data available</div>
    </div>
    
    <!-- Tooltip -->
    <div 
      v-if="tooltip.visible" 
      class="chart-tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <div class="tooltip-time">{{ tooltip.time }}</div>
      <div class="tooltip-value">{{ tooltip.value }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'

interface ChartDataPoint {
  timestamp: number
  value: number
}

interface Props {
  data: ChartDataPoint[]
  type?: 'line' | 'area' | 'bar'
  height?: number
  color?: string
  title?: string
  showHeader?: boolean
  timeSpan?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'area',
  height: 120,
  showHeader: false,
  timeSpan: 'hour'
})

const chartCanvas = ref<HTMLCanvasElement>()
const canvasWidth = ref(400)
const canvasHeight = ref(props.height)
const loading = ref(false)
const error = ref('')

const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  time: '',
  value: ''
})

let resizeObserver: ResizeObserver | null = null
let animationFrameId: number | null = null

const actualHeight = computed(() => props.showHeader ? props.height - 30 : props.height)

const formatValue = (value: number): string => {
  if (value > 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value > 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toFixed(1)
}

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString()
}

const drawChart = () => {
  if (!chartCanvas.value || !props.data || props.data.length === 0) return
  
  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return
  
  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // Get theme colors
  const primaryColor = props.color || getComputedStyle(document.documentElement)
    .getPropertyValue('--primary-color').trim()
  const bgColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--section-bg').trim()
  
  // Chart dimensions
  const padding = 20
  const headerOffset = props.showHeader ? 30 : 0
  const chartWidth = canvasWidth.value - (padding * 2)
  const chartHeight = actualHeight.value - (padding * 2)
  const chartTop = padding + headerOffset
  
  // Data processing
  const sortedData = [...props.data].sort((a, b) => a.timestamp - b.timestamp)
  const values = sortedData.map(d => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const valueRange = maxValue - minValue || 1
  
  // Draw background
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // Draw grid lines
  ctx.strokeStyle = primaryColor + '20'
  ctx.lineWidth = 1
  
  // Horizontal grid lines
  for (let i = 0; i <= 4; i++) {
    const y = chartTop + (i / 4) * chartHeight
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(canvasWidth.value - padding, y)
    ctx.stroke()
  }
  
  // Vertical grid lines
  for (let i = 0; i <= 6; i++) {
    const x = padding + (i / 6) * chartWidth
    ctx.beginPath()
    ctx.moveTo(x, chartTop)
    ctx.lineTo(x, chartTop + chartHeight)
    ctx.stroke()
  }
  
  if (sortedData.length === 0) return
  
  // Draw chart based on type
  ctx.strokeStyle = primaryColor
  ctx.lineWidth = 2
  
  if (props.type === 'area') {
    // Create gradient for area fill
    const gradient = ctx.createLinearGradient(0, chartTop, 0, chartTop + chartHeight)
    gradient.addColorStop(0, primaryColor + '40')
    gradient.addColorStop(1, primaryColor + '10')
    ctx.fillStyle = gradient
  }
  
  ctx.beginPath()
  
  sortedData.forEach((point, index) => {
    const x = padding + (index / (sortedData.length - 1)) * chartWidth
    const y = chartTop + ((maxValue - point.value) / valueRange) * chartHeight
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()
  
  if (props.type === 'area') {
    // Complete area path for fill
    const lastIndex = sortedData.length - 1
    const lastX = padding + chartWidth
    const bottomY = chartTop + chartHeight
    
    ctx.lineTo(lastX, bottomY)
    ctx.lineTo(padding, bottomY)
    ctx.closePath()
    ctx.fill()
  }
  
  // Draw data points
  ctx.fillStyle = primaryColor
  sortedData.forEach((point, index) => {
    const x = padding + (index / (sortedData.length - 1)) * chartWidth
    const y = chartTop + ((maxValue - point.value) / valueRange) * chartHeight
    
    ctx.beginPath()
    ctx.arc(x, y, 2, 0, 2 * Math.PI)
    ctx.fill()
  })
  
  // Draw value labels
  ctx.fillStyle = primaryColor + '80'
  ctx.font = '10px system-ui'
  ctx.textAlign = 'right'
  
  // Max value label
  ctx.fillText(formatValue(maxValue), canvasWidth.value - padding - 5, chartTop + 12)
  
  // Min value label
  ctx.fillText(formatValue(minValue), canvasWidth.value - padding - 5, chartTop + chartHeight - 5)
}

const handleResize = () => {
  if (!chartCanvas.value) return
  
  const rect = chartCanvas.value.parentElement?.getBoundingClientRect()
  if (rect) {
    canvasWidth.value = rect.width
    canvasHeight.value = actualHeight.value
    
    nextTick(() => {
      drawChart()
    })
  }
}

const handleMouseMove = (event: MouseEvent) => {
  if (!chartCanvas.value || !props.data || props.data.length === 0) return
  
  const rect = chartCanvas.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  const padding = 20
  const headerOffset = props.showHeader ? 30 : 0
  const chartWidth = canvasWidth.value - (padding * 2)
  const chartTop = padding + headerOffset
  
  if (x >= padding && x <= canvasWidth.value - padding && y >= chartTop) {
    const dataIndex = Math.round(((x - padding) / chartWidth) * (props.data.length - 1))
    const dataPoint = props.data[dataIndex]
    
    if (dataPoint) {
      tooltip.value = {
        visible: true,
        x: x + 10,
        y: y - 40,
        time: formatTime(dataPoint.timestamp),
        value: formatValue(dataPoint.value)
      }
    }
  }
}

const handleMouseLeave = () => {
  tooltip.value.visible = false
}

onMounted(() => {
  if (chartCanvas.value) {
    resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(chartCanvas.value.parentElement!)
    
    handleResize()
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})

// Redraw when data changes
watch([() => props.data, () => props.color], () => {
  nextTick(() => {
    drawChart()
  })
}, { deep: true })
</script>

<style scoped>
.mini-chart {
  @apply relative w-full overflow-hidden rounded-lg;
  background: var(--card-bg);
  border: 1px solid var(--primary-color);
  border-opacity: 0.2;
}

.chart-header {
  @apply flex items-center justify-between px-3 py-2 border-b border-opacity-20;
  border-color: var(--primary-color);
  background: var(--section-bg);
}

.chart-title {
  @apply text-sm font-medium;
  color: var(--text-color);
}

.chart-timespan {
  @apply text-xs opacity-60;
  color: var(--text-color);
}

.chart-canvas {
  @apply w-full h-full cursor-crosshair;
}

.chart-overlay {
  @apply absolute inset-0 flex items-center justify-center;
  background: var(--card-bg);
  opacity: 0.9;
}

.chart-tooltip {
  @apply absolute z-10 px-2 py-1 rounded shadow-lg text-xs pointer-events-none;
  background: var(--section-bg);
  border: 1px solid var(--primary-color);
  color: var(--text-color);
}

.tooltip-time {
  @apply font-medium;
  color: var(--primary-color);
}

.tooltip-value {
  @apply text-xs opacity-80;
  color: var(--text-color);
}

@media (max-width: 768px) {
  .chart-canvas {
    @apply cursor-default;
  }
}
</style>