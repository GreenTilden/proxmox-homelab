/**
 * Shared ApexCharts/Chart.js theme utilities
 * Ensures consistent spacing and styling across all chart components
 */

export interface ChartThemeColors {
  text: string
  textMuted: string
  background: string
  grid: string
  primary: string
  success: string
  warning: string
  danger: string
}

/**
 * Get theme colors based on current palette
 */
export const getChartTheme = (isDark: boolean = true): ChartThemeColors => ({
  text: isDark ? '#c9c7cd' : '#1a1a1a',
  textMuted: isDark ? 'rgba(201, 199, 205, 0.6)' : 'rgba(26, 26, 26, 0.6)',
  background: isDark ? '#161617' : '#ffffff',
  grid: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  primary: '#aca1cf',
  success: '#90b99f',
  warning: '#e6b99d',
  danger: '#f5a191',
})

/**
 * Standard donut chart options with proper label spacing
 */
export const getDonutChartOptions = (
  theme: ChartThemeColors,
  options?: {
    donutSize?: string
    showTotal?: boolean
    totalLabel?: string
  }
) => ({
  chart: {
    type: 'doughnut' as const,
    fontFamily: 'inherit',
    background: 'transparent',
  },
  plotOptions: {
    pie: {
      donut: {
        size: options?.donutSize ?? '65%',
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: '14px',
            color: theme.text,
            offsetY: -10,  // Push name UP
          },
          value: {
            show: true,
            fontSize: '24px',
            fontWeight: 600,
            color: theme.text,
            offsetY: 10,   // Push value DOWN
          },
          total: {
            show: options?.showTotal ?? true,
            label: options?.totalLabel ?? 'Total',
            fontSize: '12px',
            color: theme.textMuted,
          },
        },
      },
    },
  },
  legend: {
    position: 'bottom' as const,
    labels: {
      colors: theme.text,
      padding: 15,
      usePointStyle: true,
    },
  },
  grid: {
    borderColor: theme.grid,
  },
  tooltip: {
    theme: 'dark',
  },
})

/**
 * Standard radial bar chart options with proper label spacing
 */
export const getRadialBarOptions = (
  theme: ChartThemeColors,
  options?: {
    hollowSize?: string
    showName?: boolean
    valueFormatter?: (val: number) => string
  }
) => ({
  chart: {
    type: 'radialBar' as const,
    fontFamily: 'inherit',
    background: 'transparent',
  },
  plotOptions: {
    radialBar: {
      hollow: {
        size: options?.hollowSize ?? '60%',
        margin: 10,
      },
      track: {
        background: theme.grid,
        strokeWidth: '100%',
      },
      dataLabels: {
        name: {
          show: options?.showName ?? true,
          fontSize: '12px',
          color: theme.textMuted,
          offsetY: -8,  // Push name UP
        },
        value: {
          show: true,
          fontSize: '20px',
          fontWeight: 700,
          color: theme.text,
          offsetY: 8,   // Push value DOWN
          formatter: options?.valueFormatter ?? ((val: number) => `${val}%`),
        },
      },
    },
  },
})

/**
 * Standard bar chart options with proper data label spacing
 */
export const getBarChartOptions = (
  theme: ChartThemeColors,
  options?: {
    horizontal?: boolean
    showDataLabels?: boolean
    borderRadius?: number
  }
) => ({
  chart: {
    type: 'bar' as const,
    fontFamily: 'inherit',
    background: 'transparent',
    toolbar: { show: false },
  },
  plotOptions: {
    bar: {
      horizontal: options?.horizontal ?? false,
      columnWidth: '60%',
      borderRadius: options?.borderRadius ?? 8,
      dataLabels: {
        position: 'top',
      },
    },
  },
  dataLabels: {
    enabled: options?.showDataLabels ?? true,
    offsetY: -20,  // Position above bar
    style: {
      fontSize: '12px',
      fontWeight: 600,
      colors: [theme.text],
    },
  },
  xaxis: {
    labels: {
      style: {
        colors: theme.text,
        fontSize: '12px',
      },
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: theme.text,
        fontSize: '12px',
      },
    },
  },
  grid: {
    borderColor: theme.grid,
  },
  tooltip: {
    theme: 'dark',
  },
})

/**
 * Standard area/line chart options
 */
export const getAreaChartOptions = (
  theme: ChartThemeColors,
  categories: string[] = []
) => ({
  chart: {
    type: 'area' as const,
    fontFamily: 'inherit',
    background: 'transparent',
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  dataLabels: { enabled: false },
  stroke: {
    curve: 'smooth' as const,
    width: 2,
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.3,
    },
  },
  xaxis: {
    categories,
    labels: {
      style: {
        colors: theme.textMuted,
        fontSize: '12px',
      },
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: theme.textMuted,
        fontSize: '12px',
      },
    },
  },
  grid: {
    borderColor: theme.grid,
  },
  tooltip: {
    theme: 'dark',
  },
})

/**
 * Metric card spacing constants (in rem)
 */
export const METRIC_SPACING = {
  // Card variants
  small: {
    padding: '0.75rem',
    gap: '0.75rem',
    iconSize: '40px',
    labelFontSize: '0.6875rem',
    valueFontSize: '1.25rem',
    labelMargin: '0.125rem',
    valueMargin: '0.125rem',
  },
  default: {
    padding: '1rem',
    gap: '1rem',
    iconSize: '48px',
    labelFontSize: '0.75rem',
    valueFontSize: '1.5rem',
    labelMargin: '0.25rem',
    valueMargin: '0.25rem',
  },
  large: {
    padding: '1.5rem',
    gap: '1.5rem',
    iconSize: '64px',
    labelFontSize: '0.875rem',
    valueFontSize: '2rem',
    labelMargin: '0.5rem',
    valueMargin: '0.5rem',
  },
} as const

/**
 * Chart label offset values for center labels
 */
export const CHART_LABEL_OFFSETS = {
  small: { nameY: -6, valueY: 6 },
  default: { nameY: -10, valueY: 10 },
  large: { nameY: -14, valueY: 14 },
} as const
