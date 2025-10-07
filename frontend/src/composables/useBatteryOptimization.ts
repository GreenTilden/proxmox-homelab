import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface BatteryInfo {
  level: number
  charging: boolean
  chargingTime: number | null
  dischargingTime: number | null
}

interface PowerSavingSettings {
  reduceAnimations: boolean
  throttleUpdates: boolean
  limitBackgroundTasks: boolean
  reducePolling: boolean
  disableNonEssentialFeatures: boolean
}

interface BatteryOptimizationOptions {
  lowBatteryThreshold?: number
  criticalBatteryThreshold?: number
  enableAutomaticOptimization?: boolean
  aggressiveMode?: boolean
}

export function useBatteryOptimization(options: BatteryOptimizationOptions = {}) {
  const {
    lowBatteryThreshold = 0.3, // 30%
    criticalBatteryThreshold = 0.15, // 15%
    enableAutomaticOptimization = true,
    aggressiveMode = false
  } = options

  // Battery state
  const batteryInfo = ref<BatteryInfo>({
    level: 1,
    charging: false,
    chargingTime: null,
    dischargingTime: null
  })

  const isSupported = ref(false)
  const lastUpdateTime = ref(Date.now())

  // Power saving state
  const powerSavingMode = ref(false)
  const criticalPowerMode = ref(false)
  const manualPowerSaving = ref(false)

  // Performance tracking
  const frameRate = ref(60)
  const targetFrameRate = ref(60)
  const lastFrameTime = ref(0)
  const frameCount = ref(0)

  // Computed battery status
  const batteryLevel = computed(() => batteryInfo.value.level)
  const isCharging = computed(() => batteryInfo.value.charging)
  const isLowBattery = computed(() => batteryLevel.value < lowBatteryThreshold)
  const isCriticalBattery = computed(() => batteryLevel.value < criticalBatteryThreshold)

  // Power saving settings
  const currentSettings = computed((): PowerSavingSettings => {
    const base: PowerSavingSettings = {
      reduceAnimations: false,
      throttleUpdates: false,
      limitBackgroundTasks: false,
      reducePolling: false,
      disableNonEssentialFeatures: false
    }

    if (manualPowerSaving.value || (enableAutomaticOptimization && powerSavingMode.value)) {
      return {
        reduceAnimations: true,
        throttleUpdates: true,
        limitBackgroundTasks: true,
        reducePolling: true,
        disableNonEssentialFeatures: false
      }
    }

    if (criticalPowerMode.value) {
      return {
        reduceAnimations: true,
        throttleUpdates: true,
        limitBackgroundTasks: true,
        reducePolling: true,
        disableNonEssentialFeatures: true
      }
    }

    return base
  })

  // Optimized animation duration based on power state
  const animationDuration = computed(() => {
    if (currentSettings.value.reduceAnimations) {
      return criticalPowerMode.value ? 0 : 150 // Reduced or disabled
    }
    return 300 // Normal
  })

  // Optimized update intervals
  const updateInterval = computed(() => {
    if (currentSettings.value.throttleUpdates) {
      return criticalPowerMode.value ? 10000 : 5000 // 10s or 5s
    }
    return 1000 // Normal 1s
  })

  // Polling interval for background tasks
  const pollingInterval = computed(() => {
    if (currentSettings.value.reducePolling) {
      return criticalPowerMode.value ? 30000 : 15000 // 30s or 15s
    }
    return 5000 // Normal 5s
  })

  // Frame rate limiting for animations
  const optimizedFrameRate = computed(() => {
    if (currentSettings.value.reduceAnimations) {
      return criticalPowerMode.value ? 30 : 45 // Reduced FPS
    }
    return 60 // Normal 60 FPS
  })

  // Battery API integration
  const updateBatteryInfo = (battery: any) => {
    batteryInfo.value = {
      level: battery.level || 1,
      charging: battery.charging || false,
      chargingTime: battery.chargingTime || null,
      dischargingTime: battery.dischargingTime || null
    }
    lastUpdateTime.value = Date.now()
  }

  const initializeBatteryAPI = async () => {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery()
        isSupported.value = true

        // Initial update
        updateBatteryInfo(battery)

        // Listen for battery events
        battery.addEventListener('chargingchange', () => updateBatteryInfo(battery))
        battery.addEventListener('levelchange', () => updateBatteryInfo(battery))
        battery.addEventListener('chargingtimechange', () => updateBatteryInfo(battery))
        battery.addEventListener('dischargingtimechange', () => updateBatteryInfo(battery))

        console.debug('Battery API initialized successfully')
      } else {
        console.debug('Battery API not supported')
      }
    } catch (error) {
      console.debug('Battery API initialization failed:', error)
      isSupported.value = false
    }
  }

  // Frame rate monitoring
  const monitorFrameRate = () => {
    const now = performance.now()
    if (lastFrameTime.value > 0) {
      const delta = now - lastFrameTime.value
      const currentFPS = 1000 / delta

      // Rolling average for smooth frame rate calculation
      frameRate.value = frameRate.value * 0.9 + currentFPS * 0.1
      frameCount.value++

      // Adjust target frame rate based on performance
      if (frameCount.value % 60 === 0) { // Every ~1 second at 60fps
        if (frameRate.value < targetFrameRate.value * 0.8) {
          // Performance is poor, reduce target
          targetFrameRate.value = Math.max(30, targetFrameRate.value - 5)
        } else if (frameRate.value > targetFrameRate.value * 0.95) {
          // Performance is good, can increase target
          targetFrameRate.value = Math.min(60, targetFrameRate.value + 5)
        }
      }
    }
    lastFrameTime.value = now

    if (document.visibilityState === 'visible') {
      requestAnimationFrame(monitorFrameRate)
    }
  }

  // Visibility change optimization
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      // App is hidden, enable aggressive power saving
      powerSavingMode.value = true
    } else {
      // App is visible, restore normal mode if not manually set
      if (!manualPowerSaving.value && !isLowBattery.value) {
        powerSavingMode.value = false
      }
      // Resume frame rate monitoring
      requestAnimationFrame(monitorFrameRate)
    }
  }

  // Watch for battery level changes
  watch(batteryLevel, (newLevel) => {
    if (enableAutomaticOptimization) {
      if (newLevel < criticalBatteryThreshold) {
        criticalPowerMode.value = true
        powerSavingMode.value = true
      } else if (newLevel < lowBatteryThreshold) {
        criticalPowerMode.value = false
        powerSavingMode.value = true
      } else if (!manualPowerSaving.value) {
        criticalPowerMode.value = false
        powerSavingMode.value = false
      }
    }
  })

  // Watch for charging state changes
  watch(isCharging, (charging) => {
    if (charging && !manualPowerSaving.value) {
      // Device is charging, can disable power saving
      powerSavingMode.value = false
      criticalPowerMode.value = false
    }
  })

  // Network-aware optimizations
  const networkOptimization = computed(() => {
    const connection = (navigator as any).connection
    if (!connection) return {}

    const effectiveType = connection.effectiveType
    const slowConnection = effectiveType === 'slow-2g' || effectiveType === '2g'

    return {
      enableCompression: slowConnection || currentSettings.value.limitBackgroundTasks,
      batchRequests: slowConnection || currentSettings.value.throttleUpdates,
      reduceImageQuality: slowConnection || criticalPowerMode.value,
      limitConcurrentRequests: slowConnection || currentSettings.value.limitBackgroundTasks
    }
  })

  // Request Animation Frame with power optimization
  const optimizedRequestAnimationFrame = (callback: FrameRequestCallback): number => {
    const targetInterval = 1000 / optimizedFrameRate.value
    let lastTime = 0

    const wrappedCallback = (currentTime: number) => {
      if (currentTime - lastTime >= targetInterval) {
        lastTime = currentTime
        callback(currentTime)
      } else {
        // Skip this frame to maintain target FPS
        requestAnimationFrame(wrappedCallback)
      }
    }

    return requestAnimationFrame(wrappedCallback)
  }

  // Throttled function creator based on power state
  const createThrottledFunction = <T extends (...args: any[]) => any>(
    func: T,
    normalDelay: number
  ): T => {
    let timeoutId: number | null = null
    let lastExecTime = 0

    return ((...args: any[]) => {
      const now = Date.now()
      const delay = currentSettings.value.throttleUpdates
        ? normalDelay * (criticalPowerMode.value ? 4 : 2)
        : normalDelay

      if (now - lastExecTime >= delay) {
        lastExecTime = now
        return func(...args)
      } else {
        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = window.setTimeout(() => {
          lastExecTime = Date.now()
          func(...args)
        }, delay - (now - lastExecTime))
      }
    }) as T
  }

  // Public API
  const enablePowerSaving = () => {
    manualPowerSaving.value = true
    powerSavingMode.value = true
  }

  const disablePowerSaving = () => {
    manualPowerSaving.value = false
    if (!isLowBattery.value) {
      powerSavingMode.value = false
      criticalPowerMode.value = false
    }
  }

  const getOptimizationSuggestions = () => {
    const suggestions = []

    if (isLowBattery.value && !isCharging.value) {
      suggestions.push('Battery level is low. Consider enabling power saving mode.')
    }

    if (frameRate.value < 45) {
      suggestions.push('Frame rate is low. Consider reducing visual effects.')
    }

    if (document.visibilityState === 'hidden') {
      suggestions.push('App is in background. Reducing update frequency.')
    }

    return suggestions
  }

  // Performance metrics
  const getPerformanceMetrics = () => ({
    batteryLevel: batteryLevel.value,
    isCharging: isCharging.value,
    powerSavingMode: powerSavingMode.value,
    criticalPowerMode: criticalPowerMode.value,
    frameRate: frameRate.value,
    targetFrameRate: optimizedFrameRate.value,
    animationDuration: animationDuration.value,
    updateInterval: updateInterval.value,
    networkOptimization: networkOptimization.value
  })

  // Initialize
  onMounted(() => {
    initializeBatteryAPI()

    // Start frame rate monitoring
    requestAnimationFrame(monitorFrameRate)

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Initial power mode setup
    if (aggressiveMode) {
      enablePowerSaving()
    }
  })

  // Cleanup
  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return {
    // Battery info
    batteryInfo: readonly(batteryInfo),
    batteryLevel,
    isCharging,
    isLowBattery,
    isCriticalBattery,
    isSupported,

    // Power saving state
    powerSavingMode: readonly(powerSavingMode),
    criticalPowerMode: readonly(criticalPowerMode),
    currentSettings,

    // Optimized values
    animationDuration,
    updateInterval,
    pollingInterval,
    optimizedFrameRate,
    networkOptimization,

    // Control
    enablePowerSaving,
    disablePowerSaving,

    // Utilities
    optimizedRequestAnimationFrame,
    createThrottledFunction,
    getOptimizationSuggestions,
    getPerformanceMetrics
  }
}