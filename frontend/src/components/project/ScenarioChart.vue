<template>
  <div :style="containerStyles">
    <!-- Chart mode toggle -->
    <div :style="toggleRow">
      <button
        v-for="mode in modes"
        :key="mode.id"
        class="nes-btn"
        :class="chartMode === mode.id ? 'is-primary' : ''"
        :style="toggleBtn"
        @click="chartMode = mode.id"
      >{{ mode.label }}</button>
    </div>

    <!-- Chart canvas -->
    <div :style="chartWrap">
      <canvas ref="chartCanvas"></canvas>
    </div>

    <!-- Summary cards per scenario -->
    <div :style="summaryGrid">
      <div v-for="p in projectionsArray" :key="p.scenarioId" :style="summaryCard(p)">
        <div :style="summaryHeader">
          <span :style="scenarioDot(p)"></span>
          <span :style="summaryName">{{ p.scenario }}</span>
        </div>
        <div :style="summaryStats">
          <div>
            <span :style="statLabel">Annual Gross</span>
            <span :style="statValue">${{ formatK(p.annualizedGross) }}</span>
          </div>
          <div>
            <span :style="statLabel">Net Cash Flow</span>
            <span :style="statValueColor(p.totalNetCashFlow)">${{ formatK(p.totalNetCashFlow) }}</span>
          </div>
          <div>
            <span :style="statLabel">Break Even</span>
            <span :style="statValue">{{ p.breakEvenMonth || 'N/A' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import type { ScenarioProjection, Scenario } from '@/composables/useFinancials'
import { THEME_DEFAULTS } from '@/composables/types'

Chart.register(...registerables)

interface Props {
  projections: Map<string, ScenarioProjection>
  scenarios: Scenario[]
  accentColor?: string
  bgColor?: string
  goldColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  ...THEME_DEFAULTS,
})

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const chartMode = ref<'cumulative' | 'monthly' | 'gross'>('cumulative')

const modes = [
  { id: 'cumulative' as const, label: 'Runway' },
  { id: 'monthly' as const, label: 'Monthly' },
  { id: 'gross' as const, label: 'Gross Rev' },
]

const projectionsArray = computed(() => {
  const arr: ScenarioProjection[] = []
  props.projections.forEach((p) => arr.push(p))
  return arr
})

function getScenarioColor(scenarioId: string): string {
  const s = props.scenarios.find(sc => sc.id === scenarioId)
  return s?.color || props.accentColor
}

function buildChartData() {
  const arr = projectionsArray.value
  if (arr.length === 0) return { labels: [] as string[], datasets: [] as any[] }

  const labels = arr[0].months.map(m => m.month)

  const datasets = arr.map(p => {
    const color = getScenarioColor(p.scenarioId)
    let data: number[]
    switch (chartMode.value) {
      case 'cumulative':
        data = p.months.map(m => m.cumulative)
        break
      case 'monthly':
        data = p.months.map(m => m.netCashFlow)
        break
      case 'gross':
        data = p.months.map(m => m.grossRevenue)
        break
    }
    return {
      label: p.scenario,
      data,
      borderColor: color,
      backgroundColor: color + '22',
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0.3,
      fill: chartMode.value === 'cumulative',
    }
  })

  // Add zero line for cumulative
  if (chartMode.value === 'cumulative' || chartMode.value === 'monthly') {
    datasets.push({
      label: 'Break Even',
      data: labels.map(() => 0),
      borderColor: '#ef444466',
      borderWidth: 1,
      borderDash: [5, 5],
      pointRadius: 0,
      fill: false,
    })
  }

  return { labels, datasets }
}

function renderChart() {
  if (!chartCanvas.value) return
  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  const { labels, datasets } = buildChartData()
  if (labels.length === 0) return

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#c4a747',
            font: { size: 10, family: '"Press Start 2P", monospace' },
            padding: 12,
            filter: (item) => item.text !== 'Break Even',
          },
        },
        tooltip: {
          backgroundColor: props.bgColor + 'ee',
          titleColor: '#c4a747',
          bodyColor: '#e5e7eb',
          borderColor: props.accentColor + '66',
          borderWidth: 1,
          titleFont: { size: 9, family: '"Press Start 2P", monospace' },
          bodyFont: { size: 8, family: '"Press Start 2P", monospace' },
          callbacks: {
            label: (ctx) => {
              if (ctx.dataset.label === 'Break Even') return ''
              const val = ctx.parsed.y
              const prefix = val >= 0 ? '$' : '-$'
              return `${ctx.dataset.label}: ${prefix}${Math.abs(val).toLocaleString()}`
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: '#6b7280',
            font: { size: 7, family: '"Press Start 2P", monospace' },
            maxRotation: 45,
          },
          grid: { color: 'rgba(74, 103, 65, 0.1)' },
        },
        y: {
          ticks: {
            color: '#6b7280',
            font: { size: 7, family: '"Press Start 2P", monospace' },
            callback: (val) => {
              const n = Number(val)
              if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(0)}k`
              return `$${n}`
            },
          },
          grid: { color: 'rgba(74, 103, 65, 0.1)' },
        },
      },
    },
  })
}

function formatK(n: number): string {
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toFixed(0)
}

watch([() => props.projections, chartMode], () => {
  nextTick(renderChart)
}, { deep: true })

onMounted(() => {
  nextTick(renderChart)
})

// --- Styles ---

const containerStyles = { marginBottom: '0.75rem' }
const toggleRow = { display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }
const toggleBtn = { fontSize: '0.5rem', padding: '0.2rem 0.5rem' }
const chartWrap = { height: '280px', marginBottom: '0.75rem' }

const summaryGrid = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${Math.min(projectionsArray.value.length, 3)}, 1fr)`,
  gap: '0.4rem',
}))

function summaryCard(p: ScenarioProjection) {
  return {
    background: `${props.bgColor}cc`,
    border: `1px solid ${getScenarioColor(p.scenarioId)}55`,
    borderRadius: '3px',
    padding: '0.4rem',
  }
}

const summaryHeader = { display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }

function scenarioDot(p: ScenarioProjection) {
  return {
    width: '8px', height: '8px', borderRadius: '50%',
    background: getScenarioColor(p.scenarioId),
    flexShrink: '0',
  }
}

const summaryName = { fontSize: '0.55rem', fontWeight: '600', color: '#c4a747' }
const summaryStats = { display: 'flex', flexDirection: 'column' as const, gap: '0.15rem' }
const statLabel = { fontSize: '0.45rem', color: 'var(--text-muted)', marginRight: '0.3rem' }
const statValue = { fontSize: '0.6rem', color: 'var(--text-bright)', fontWeight: '600' }
function statValueColor(val: number) {
  return {
    fontSize: '0.6rem',
    fontWeight: '600',
    color: val >= 0 ? '#22c55e' : '#ef4444',
  }
}
</script>
