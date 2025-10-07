import { ref, onMounted, onUnmounted } from 'vue'

interface TouchPoint {
  x: number
  y: number
  timestamp: number
}

interface GestureEvent {
  type: 'tap' | 'longpress' | 'swipe' | 'pinch' | 'drag'
  startPoint: TouchPoint
  endPoint?: TouchPoint
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number
  velocity?: number
  duration: number
  scale?: number
  preventDefault?: boolean
}

interface TouchGestureOptions {
  // Tap detection
  tapTimeout?: number
  tapThreshold?: number

  // Long press detection
  longPressTimeout?: number
  longPressThreshold?: number

  // Swipe detection
  swipeThreshold?: number
  swipeVelocityThreshold?: number

  // Pinch detection
  pinchThreshold?: number

  // General
  preventDefault?: boolean
  enableHapticFeedback?: boolean
}

export function useTouchGestures(
  target: Ref<HTMLElement | null>,
  options: TouchGestureOptions = {}
) {
  const {
    tapTimeout = 200,
    tapThreshold = 10,
    longPressTimeout = 500,
    longPressThreshold = 10,
    swipeThreshold = 30,
    swipeVelocityThreshold = 0.3,
    pinchThreshold = 10,
    preventDefault = true,
    enableHapticFeedback = true
  } = options

  // Touch state
  const isTouch = ref(false)
  const touchStart = ref<TouchPoint | null>(null)
  const touchCurrent = ref<TouchPoint | null>(null)
  const touchStartTime = ref(0)
  const activeTouches = ref<TouchPoint[]>([])
  const initialPinchDistance = ref(0)

  // Gesture callbacks
  const callbacks = new Map<string, ((event: GestureEvent) => void)[]>()

  // Timer references
  let longPressTimer: number | null = null
  let tapTimer: number | null = null

  // Performance optimization: Use passive listeners where possible
  const passiveSupported = ref(false)

  // Test for passive listener support
  onMounted(() => {
    try {
      const opts = Object.defineProperty({}, 'passive', {
        get() {
          passiveSupported.value = true
          return false
        }
      })
      window.addEventListener('test', null as any, opts)
      window.removeEventListener('test', null as any)
    } catch (e) {
      passiveSupported.value = false
    }
  })

  // Haptic feedback utility
  const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHapticFeedback) return

    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      }
      navigator.vibrate(patterns[type])
    }

    // iOS haptic feedback
    if ('ontouchstart' in window && (window as any).Haptics) {
      try {
        ;(window as any).Haptics.notification({ type })
      } catch (e) {
        // Silently fail if haptics not available
      }
    }
  }

  // Utility functions
  const getTouchPoint = (touch: Touch): TouchPoint => ({
    x: touch.clientX,
    y: touch.clientY,
    timestamp: Date.now()
  })

  const calculateDistance = (point1: TouchPoint, point2: TouchPoint): number => {
    const dx = point2.x - point1.x
    const dy = point2.y - point1.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  const calculateVelocity = (point1: TouchPoint, point2: TouchPoint): number => {
    const distance = calculateDistance(point1, point2)
    const time = (point2.timestamp - point1.timestamp) / 1000 // Convert to seconds
    return time > 0 ? distance / time : 0
  }

  const getSwipeDirection = (start: TouchPoint, end: TouchPoint): 'up' | 'down' | 'left' | 'right' => {
    const dx = end.x - start.x
    const dy = end.y - start.y

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left'
    } else {
      return dy > 0 ? 'down' : 'up'
    }
  }

  const getPinchDistance = (touches: TouchPoint[]): number => {
    if (touches.length < 2) return 0
    return calculateDistance(touches[0], touches[1])
  }

  // Event emission
  const emit = (gestureType: string, event: GestureEvent) => {
    const handlers = callbacks.get(gestureType) || []
    handlers.forEach(handler => handler(event))
  }

  // Touch event handlers
  const handleTouchStart = (e: TouchEvent) => {
    if (preventDefault) {
      e.preventDefault()
    }

    isTouch.value = true
    touchStartTime.value = Date.now()

    // Store all touch points
    activeTouches.value = Array.from(e.touches).map(getTouchPoint)
    touchStart.value = activeTouches.value[0]
    touchCurrent.value = touchStart.value

    // Handle multi-touch (pinch)
    if (activeTouches.value.length === 2) {
      initialPinchDistance.value = getPinchDistance(activeTouches.value)
    }

    // Clear any existing timers
    if (longPressTimer) {
      clearTimeout(longPressTimer)
    }
    if (tapTimer) {
      clearTimeout(tapTimer)
    }

    // Start long press detection
    longPressTimer = window.setTimeout(() => {
      if (touchStart.value && touchCurrent.value) {
        const distance = calculateDistance(touchStart.value, touchCurrent.value)

        if (distance < longPressThreshold) {
          triggerHapticFeedback('medium')

          emit('longpress', {
            type: 'longpress',
            startPoint: touchStart.value,
            endPoint: touchCurrent.value,
            duration: Date.now() - touchStartTime.value
          })
        }
      }
    }, longPressTimeout)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isTouch.value || !touchStart.value) return

    if (preventDefault) {
      e.preventDefault()
    }

    // Update current touch points
    activeTouches.value = Array.from(e.touches).map(getTouchPoint)
    touchCurrent.value = activeTouches.value[0]

    // Handle pinch gesture
    if (activeTouches.value.length === 2 && initialPinchDistance.value > 0) {
      const currentPinchDistance = getPinchDistance(activeTouches.value)
      const scale = currentPinchDistance / initialPinchDistance.value

      emit('pinch', {
        type: 'pinch',
        startPoint: touchStart.value,
        endPoint: touchCurrent.value,
        duration: Date.now() - touchStartTime.value,
        scale
      })
    }

    // Cancel long press if moved too far
    if (longPressTimer && touchStart.value && touchCurrent.value) {
      const distance = calculateDistance(touchStart.value, touchCurrent.value)
      if (distance > longPressThreshold) {
        clearTimeout(longPressTimer)
        longPressTimer = null

        // Start drag detection
        emit('drag', {
          type: 'drag',
          startPoint: touchStart.value,
          endPoint: touchCurrent.value,
          duration: Date.now() - touchStartTime.value,
          distance
        })
      }
    }
  }

  const handleTouchEnd = (e: TouchEvent) => {
    if (!isTouch.value || !touchStart.value) return

    if (preventDefault) {
      e.preventDefault()
    }

    const endTime = Date.now()
    const duration = endTime - touchStartTime.value

    // Clear timers
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }

    if (touchCurrent.value) {
      const distance = calculateDistance(touchStart.value, touchCurrent.value)
      const velocity = calculateVelocity(touchStart.value, touchCurrent.value)

      // Swipe detection
      if (distance > swipeThreshold && velocity > swipeVelocityThreshold) {
        const direction = getSwipeDirection(touchStart.value, touchCurrent.value)

        triggerHapticFeedback('light')

        emit('swipe', {
          type: 'swipe',
          startPoint: touchStart.value,
          endPoint: touchCurrent.value,
          direction,
          distance,
          velocity,
          duration
        })
      }
      // Tap detection
      else if (distance < tapThreshold && duration < tapTimeout) {
        triggerHapticFeedback('light')

        emit('tap', {
          type: 'tap',
          startPoint: touchStart.value,
          endPoint: touchCurrent.value,
          duration
        })
      }
    }

    // Reset state
    isTouch.value = false
    touchStart.value = null
    touchCurrent.value = null
    activeTouches.value = []
    initialPinchDistance.value = 0
  }

  const handleTouchCancel = (e: TouchEvent) => {
    // Clean up on touch cancel
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
    if (tapTimer) {
      clearTimeout(tapTimer)
      tapTimer = null
    }

    isTouch.value = false
    touchStart.value = null
    touchCurrent.value = null
    activeTouches.value = []
    initialPinchDistance.value = 0
  }

  // Public API for registering gesture handlers
  const on = (gestureType: string, handler: (event: GestureEvent) => void) => {
    if (!callbacks.has(gestureType)) {
      callbacks.set(gestureType, [])
    }
    callbacks.get(gestureType)!.push(handler)

    // Return unsubscribe function
    return () => {
      const handlers = callbacks.get(gestureType)
      if (handlers) {
        const index = handlers.indexOf(handler)
        if (index > -1) {
          handlers.splice(index, 1)
        }
      }
    }
  }

  // Convenience methods for common gestures
  const onTap = (handler: (event: GestureEvent) => void) => on('tap', handler)
  const onLongPress = (handler: (event: GestureEvent) => void) => on('longpress', handler)
  const onSwipe = (handler: (event: GestureEvent) => void) => on('swipe', handler)
  const onPinch = (handler: (event: GestureEvent) => void) => on('pinch', handler)
  const onDrag = (handler: (event: GestureEvent) => void) => on('drag', handler)

  // Setup and cleanup
  const setupListeners = () => {
    if (!target.value) return

    const element = target.value
    const listenerOptions = passiveSupported.value ? { passive: false } : false

    element.addEventListener('touchstart', handleTouchStart, listenerOptions)
    element.addEventListener('touchmove', handleTouchMove, listenerOptions)
    element.addEventListener('touchend', handleTouchEnd, listenerOptions)
    element.addEventListener('touchcancel', handleTouchCancel, listenerOptions)

    // Prevent context menu on long press for better UX
    element.addEventListener('contextmenu', (e) => {
      if (isTouch.value) {
        e.preventDefault()
      }
    })
  }

  const removeListeners = () => {
    if (!target.value) return

    const element = target.value

    element.removeEventListener('touchstart', handleTouchStart)
    element.removeEventListener('touchmove', handleTouchMove)
    element.removeEventListener('touchend', handleTouchEnd)
    element.removeEventListener('touchcancel', handleTouchCancel)
    element.removeEventListener('contextmenu', () => {})
  }

  // Watch target changes
  watch(target, (newTarget, oldTarget) => {
    if (oldTarget) {
      removeListeners()
    }
    if (newTarget) {
      setupListeners()
    }
  }, { immediate: true })

  // Cleanup on unmount
  onUnmounted(() => {
    removeListeners()
    if (longPressTimer) clearTimeout(longPressTimer)
    if (tapTimer) clearTimeout(tapTimer)
  })

  // Debug information
  const getDebugInfo = () => ({
    isTouch: isTouch.value,
    activeTouches: activeTouches.value.length,
    hasTarget: !!target.value,
    passiveSupported: passiveSupported.value,
    registeredGestures: Array.from(callbacks.keys())
  })

  return {
    // Gesture registration
    on,
    onTap,
    onLongPress,
    onSwipe,
    onPinch,
    onDrag,

    // State
    isTouch,
    activeTouches: readonly(activeTouches),

    // Debug
    getDebugInfo,

    // Manual control
    setupListeners,
    removeListeners
  }
}