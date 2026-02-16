<template>
  <div class="apex-gauge" :style="containerStyle">
    <apexchart
      v-if="mounted"
      type="radialBar"
      :height="height"
      :options="chartOptions"
      :series="[normalizedValue]"
    />
    <div v-if="label" class="gauge-label" :style="labelStyle">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useChartTheme } from '@/composables/useChartTheme'

const apexchart = VueApexCharts

interface Props {
  value: number
  max?: number
  height?: number
  label?: string
  thresholds?: { warning: number; critical: number }
  showValue?: boolean
  unit?: string
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  height: 120,
  showValue: true,
  unit: '%'
})

const { colors } = useChartTheme()
const mounted = ref(false)

const normalizedValue = computed(() => {
  return Math.min((props.value / props.max) * 100, 100)
})

const displayValue = computed(() => {
  return Math.round(props.value)
})

const fillColor = computed(() => {
  if (props.color) return props.color
  if (!props.thresholds) return colors.value.success

  const percent = normalizedValue.value
  if (percent >= props.thresholds.critical) return colors.value.error
  if (percent >= props.thresholds.warning) return colors.value.warning
  return colors.value.success
})

const chartOptions = computed(() => {
  const val = displayValue.value
  const u = props.unit
  return {
    chart: {
      type: 'radialBar',
      height: props.height,
      sparkline: { enabled: true },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 500
      }
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: '55%',
          background: 'transparent'
        },
        track: {
          background: colors.value.grid,
          strokeWidth: '100%',
          margin: 0
        },
        dataLabels: {
          name: { show: false },
          value: {
            show: props.showValue,
            offsetY: 5,
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'inherit',
            color: colors.value.text,
            formatter: function() {
              return val + u
            }
          }
        }
      }
    },
    fill: {
      type: 'solid',
      colors: [fillColor.value]
    },
    stroke: {
      lineCap: 'round'
    }
  }
})

const containerStyle = computed(() => ({
  position: 'relative' as const,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  minWidth: props.height + 'px'
}))

const labelStyle = computed(() => ({
  fontSize: '10px',
  fontWeight: 500,
  color: colors.value.textMuted,
  marginTop: '-12px',
  textAlign: 'center' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px'
}))

onMounted(() => {
  mounted.value = true
})
</script>

<style scoped>
.apex-gauge {
  transition: all 0.3s ease;
}
.gauge-label {
  white-space: nowrap;
}
</style>
