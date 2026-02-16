import { computed, inject } from 'vue'

export interface ChartThemeColors {
  primary: string
  secondary: string
  success: string
  warning: string
  error: string
  info: string
  background: string
  cardBackground: string
  text: string
  textMuted: string
  grid: string
  border: string
}

export function useChartTheme() {
  // Try to get theme from injected context
  const themeContext = inject('fallTheme', null) as any

  const colors = computed<ChartThemeColors>(() => {
    if (themeContext?.theme?.value) {
      const t = themeContext.theme.value
      return {
        primary: t.primary?.ramp4 || '#3b82f6',
        secondary: t.secondary?.ramp4 || '#8b5cf6',
        success: t.status?.success || '#22c55e',
        warning: t.status?.warning || '#eab308',
        error: t.status?.error || '#ef4444',
        info: t.accent?.ramp3 || '#06b6d4',
        background: t.backgrounds?.primary || '#0f0f1a',
        cardBackground: t.backgrounds?.card || '#1a1a2e',
        text: t.text?.bright || '#ffffff',
        textMuted: t.text?.muted || '#a0a0a0',
        grid: t.neutral?.ramp2 + '30' || '#33333330',
        border: t.neutral?.ramp3 || '#444444'
      }
    }
    // Default dark theme fallback
    return {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      success: '#22c55e',
      warning: '#eab308',
      error: '#ef4444',
      info: '#06b6d4',
      background: '#0f0f1a',
      cardBackground: '#1a1a2e',
      text: '#ffffff',
      textMuted: '#a0a0a0',
      grid: '#33333330',
      border: '#444444'
    }
  })

  const apexOptions = computed(() => ({
    chart: {
      background: 'transparent',
      fontFamily: 'inherit',
      toolbar: { show: false },
      sparkline: { enabled: false }
    },
    theme: {
      mode: 'dark' as const
    },
    colors: [colors.value.primary, colors.value.secondary, colors.value.success, colors.value.warning],
    grid: {
      borderColor: colors.value.grid,
      strokeDashArray: 4
    },
    xaxis: {
      labels: {
        style: { colors: colors.value.textMuted, fontSize: '10px' }
      },
      axisBorder: { color: colors.value.grid },
      axisTicks: { color: colors.value.grid }
    },
    yaxis: {
      labels: {
        style: { colors: colors.value.textMuted, fontSize: '10px' }
      }
    },
    tooltip: {
      theme: 'dark',
      style: { fontSize: '11px' }
    },
    legend: {
      labels: { colors: colors.value.text }
    }
  }))

  const getGaugeOptions = (value: number, max: number = 100, thresholds?: { warning: number; critical: number }) => {
    const percent = Math.min((value / max) * 100, 100)
    let fillColor = colors.value.success

    if (thresholds) {
      if (percent >= thresholds.critical) {
        fillColor = colors.value.error
      } else if (percent >= thresholds.warning) {
        fillColor = colors.value.warning
      }
    }

    return {
      chart: {
        type: 'radialBar' as const,
        height: 120,
        sparkline: { enabled: true }
      },
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          hollow: {
            size: '60%',
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
              offsetY: 5,
              fontSize: '14px',
              fontWeight: 600,
              color: colors.value.text,
              formatter: () => Math.round(value) + '%'
            }
          }
        }
      },
      fill: { colors: [fillColor] },
      stroke: { lineCap: 'round' as const }
    }
  }

  const getSparklineOptions = (color?: string) => ({
    chart: {
      type: 'area' as const,
      height: 40,
      sparkline: { enabled: true },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 300
      }
    },
    stroke: {
      curve: 'smooth' as const,
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 100]
      }
    },
    colors: [color || colors.value.primary],
    tooltip: {
      enabled: true,
      theme: 'dark',
      x: { show: false },
      y: {
        formatter: (val: number) => val.toFixed(1)
      }
    }
  })

  return {
    colors,
    apexOptions,
    getGaugeOptions,
    getSparklineOptions
  }
}
