import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface AccessibilityOptions {
  enableKeyboardNavigation?: boolean
  enableScreenReaderSupport?: boolean
  enableHighContrast?: boolean
  enableFocusManagement?: boolean
  enableLiveRegions?: boolean
}

interface KeyboardNavigation {
  currentFocusIndex: number
  focusableElements: HTMLElement[]
  focusHistory: HTMLElement[]
}

interface ScreenReaderAnnouncement {
  message: string
  priority: 'polite' | 'assertive'
  timestamp: number
}

export function useAccessibility(options: AccessibilityOptions = {}) {
  const {
    enableKeyboardNavigation = true,
    enableScreenReaderSupport = true,
    enableHighContrast = true,
    enableFocusManagement = true,
    enableLiveRegions = true
  } = options

  // Accessibility state
  const isScreenReaderActive = ref(false)
  const isHighContrastMode = ref(false)
  const isKeyboardNavigationActive = ref(false)
  const announcements = ref<ScreenReaderAnnouncement[]>([])

  // Keyboard navigation state
  const keyboardNav = ref<KeyboardNavigation>({
    currentFocusIndex: -1,
    focusableElements: [],
    focusHistory: []
  })

  // Live region references
  const liveRegionPolite = ref<HTMLElement | null>(null)
  const liveRegionAssertive = ref<HTMLElement | null>(null)

  // Focus management
  const focusStack = ref<HTMLElement[]>([])
  const lastActiveElement = ref<HTMLElement | null>(null)

  // Detect screen reader usage
  const detectScreenReader = () => {
    // Check for common screen reader indicators
    const indicators = [
      'speechSynthesis' in window,
      'screen' in window && 'orientation' in window.screen,
      navigator.userAgent.includes('NVDA') ||
      navigator.userAgent.includes('JAWS') ||
      navigator.userAgent.includes('VoiceOver')
    ]

    // Check for reduced motion preference (often used by accessibility users)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Check for high contrast preference
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches

    isScreenReaderActive.value = indicators.some(Boolean) || prefersReducedMotion
    isHighContrastMode.value = prefersHighContrast
  }

  // Create live regions for screen reader announcements
  const createLiveRegions = () => {
    if (!enableLiveRegions) return

    // Polite live region for non-urgent announcements
    liveRegionPolite.value = document.createElement('div')
    liveRegionPolite.value.setAttribute('aria-live', 'polite')
    liveRegionPolite.value.setAttribute('aria-atomic', 'true')
    liveRegionPolite.value.setAttribute('aria-relevant', 'text')
    liveRegionPolite.value.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `
    document.body.appendChild(liveRegionPolite.value)

    // Assertive live region for urgent announcements
    liveRegionAssertive.value = document.createElement('div')
    liveRegionAssertive.value.setAttribute('aria-live', 'assertive')
    liveRegionAssertive.value.setAttribute('aria-atomic', 'true')
    liveRegionAssertive.value.setAttribute('aria-relevant', 'text')
    liveRegionAssertive.value.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `
    document.body.appendChild(liveRegionAssertive.value)
  }

  // Announce message to screen readers
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!enableScreenReaderSupport) return

    const announcement: ScreenReaderAnnouncement = {
      message,
      priority,
      timestamp: Date.now()
    }

    announcements.value.push(announcement)

    // Use appropriate live region
    const liveRegion = priority === 'assertive'
      ? liveRegionAssertive.value
      : liveRegionPolite.value

    if (liveRegion) {
      // Clear previous content and add new announcement
      liveRegion.textContent = ''
      setTimeout(() => {
        liveRegion.textContent = message
      }, 100) // Small delay to ensure screen readers pick up the change
    }

    // Clean up old announcements
    if (announcements.value.length > 10) {
      announcements.value = announcements.value.slice(-10)
    }
  }

  // Get focusable elements in container
  const getFocusableElements = (container: HTMLElement = document.body): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')

    return Array.from(container.querySelectorAll(focusableSelectors))
      .filter(el => {
        const element = el as HTMLElement
        return element.offsetWidth > 0 &&
               element.offsetHeight > 0 &&
               !element.hidden &&
               window.getComputedStyle(element).visibility !== 'hidden'
      }) as HTMLElement[]
  }

  // Update focusable elements
  const updateFocusableElements = (container?: HTMLElement) => {
    keyboardNav.value.focusableElements = getFocusableElements(container)
  }

  // Keyboard navigation handlers
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!enableKeyboardNavigation) return

    const { key, shiftKey, ctrlKey, altKey } = event

    // Update keyboard navigation state
    if (['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      isKeyboardNavigationActive.value = true
    }

    switch (key) {
      case 'Tab':
        handleTabNavigation(event, shiftKey)
        break
      case 'Escape':
        handleEscapeKey(event)
        break
      case 'Enter':
      case ' ':
        handleActivation(event)
        break
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        handleArrowNavigation(event, key)
        break
      case 'Home':
      case 'End':
        handleHomeEndNavigation(event, key)
        break
    }
  }

  // Tab navigation
  const handleTabNavigation = (event: KeyboardEvent, reverse: boolean) => {
    const focusableElements = keyboardNav.value.focusableElements
    if (focusableElements.length === 0) return

    const activeElement = document.activeElement as HTMLElement
    const currentIndex = focusableElements.indexOf(activeElement)

    let nextIndex
    if (reverse) {
      nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1
    } else {
      nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1
    }

    focusableElements[nextIndex]?.focus()
    keyboardNav.value.currentFocusIndex = nextIndex
  }

  // Escape key handler
  const handleEscapeKey = (event: KeyboardEvent) => {
    // Close modals, dropdowns, etc.
    const activeElement = document.activeElement as HTMLElement

    // If in a modal, return focus to trigger element
    if (activeElement?.closest('[role="dialog"]')) {
      returnFocus()
      event.preventDefault()
    }

    // Announce escape action
    announce('Escaped from current context', 'polite')
  }

  // Enter/Space activation
  const handleActivation = (event: KeyboardEvent) => {
    const activeElement = document.activeElement as HTMLElement

    if (activeElement?.getAttribute('role') === 'button' &&
        !['BUTTON', 'INPUT'].includes(activeElement.tagName)) {
      activeElement.click()
      event.preventDefault()
    }
  }

  // Arrow key navigation for grids/lists
  const handleArrowNavigation = (event: KeyboardEvent, key: string) => {
    const activeElement = document.activeElement as HTMLElement
    const role = activeElement?.getAttribute('role')

    if (['grid', 'listbox', 'menu', 'tree'].includes(role || '')) {
      // Grid/list specific navigation
      const container = activeElement.closest(`[role="${role}"]`)
      if (container) {
        navigateInContainer(container as HTMLElement, key)
        event.preventDefault()
      }
    }
  }

  // Navigate within a container (grid, list, etc.)
  const navigateInContainer = (container: HTMLElement, direction: string) => {
    const items = getFocusableElements(container)
    const activeElement = document.activeElement as HTMLElement
    const currentIndex = items.indexOf(activeElement)

    if (currentIndex === -1) return

    let nextIndex = currentIndex
    const containerRole = container.getAttribute('role')

    if (containerRole === 'grid') {
      // Grid navigation logic
      const columns = parseInt(container.getAttribute('aria-colcount') || '1')

      switch (direction) {
        case 'ArrowRight':
          nextIndex = Math.min(currentIndex + 1, items.length - 1)
          break
        case 'ArrowLeft':
          nextIndex = Math.max(currentIndex - 1, 0)
          break
        case 'ArrowDown':
          nextIndex = Math.min(currentIndex + columns, items.length - 1)
          break
        case 'ArrowUp':
          nextIndex = Math.max(currentIndex - columns, 0)
          break
      }
    } else {
      // Linear navigation for lists, menus
      switch (direction) {
        case 'ArrowDown':
        case 'ArrowRight':
          nextIndex = Math.min(currentIndex + 1, items.length - 1)
          break
        case 'ArrowUp':
        case 'ArrowLeft':
          nextIndex = Math.max(currentIndex - 1, 0)
          break
      }
    }

    if (nextIndex !== currentIndex) {
      items[nextIndex]?.focus()
    }
  }

  // Home/End navigation
  const handleHomeEndNavigation = (event: KeyboardEvent, key: string) => {
    const focusableElements = keyboardNav.value.focusableElements
    if (focusableElements.length === 0) return

    const targetIndex = key === 'Home' ? 0 : focusableElements.length - 1
    focusableElements[targetIndex]?.focus()
    keyboardNav.value.currentFocusIndex = targetIndex
    event.preventDefault()
  }

  // Focus management
  const saveFocus = () => {
    const activeElement = document.activeElement as HTMLElement
    if (activeElement && activeElement !== document.body) {
      lastActiveElement.value = activeElement
      focusStack.value.push(activeElement)
    }
  }

  const returnFocus = () => {
    const lastElement = focusStack.value.pop() || lastActiveElement.value
    if (lastElement && document.contains(lastElement)) {
      lastElement.focus()
      announce(`Focus returned to ${getElementDescription(lastElement)}`, 'polite')
    }
  }

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = getFocusableElements(container)

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleFocusTrap = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            event.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            event.preventDefault()
          }
        }
      }
    }

    container.addEventListener('keydown', handleFocusTrap)
    firstElement.focus()

    return () => {
      container.removeEventListener('keydown', handleFocusTrap)
    }
  }

  // Get accessible description of element
  const getElementDescription = (element: HTMLElement): string => {
    const label = element.getAttribute('aria-label') ||
                  element.getAttribute('aria-labelledby') ||
                  element.getAttribute('title') ||
                  element.textContent ||
                  element.tagName.toLowerCase()

    const role = element.getAttribute('role') || element.tagName.toLowerCase()

    return `${label} ${role}`.trim()
  }

  // Date formatting for screen readers
  const formatDateForScreenReader = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Event formatting for screen readers
  const formatEventForScreenReader = (event: any): string => {
    const date = formatDateForScreenReader(event.startDate)
    const time = event.allDay
      ? 'All day'
      : event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    return `${event.title}, ${event.category} event, ${date}, ${time}`
  }

  // High contrast mode toggle
  const toggleHighContrast = () => {
    isHighContrastMode.value = !isHighContrastMode.value
    document.documentElement.classList.toggle('high-contrast', isHighContrastMode.value)
    announce(`High contrast mode ${isHighContrastMode.value ? 'enabled' : 'disabled'}`, 'polite')
  }

  // ARIA attributes helpers
  const setAriaAttributes = (element: HTMLElement, attributes: Record<string, string>) => {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key.startsWith('aria-') ? key : `aria-${key}`, value)
    })
  }

  const removeAriaAttributes = (element: HTMLElement, attributes: string[]) => {
    attributes.forEach(attr => {
      element.removeAttribute(attr.startsWith('aria-') ? attr : `aria-${attr}`)
    })
  }

  // Validation for accessibility
  const validateAccessibility = (container: HTMLElement = document.body) => {
    const issues: string[] = []

    // Check for missing alt text
    const images = container.querySelectorAll('img:not([alt])')
    if (images.length > 0) {
      issues.push(`${images.length} images missing alt text`)
    }

    // Check for missing form labels
    const inputs = container.querySelectorAll('input:not([aria-label]):not([aria-labelledby])')
    const unlabeledInputs = Array.from(inputs).filter(input => {
      const id = input.getAttribute('id')
      return !id || !container.querySelector(`label[for="${id}"]`)
    })
    if (unlabeledInputs.length > 0) {
      issues.push(`${unlabeledInputs.length} form inputs missing labels`)
    }

    // Check for low contrast (simplified check)
    const elements = container.querySelectorAll('*')
    // This would require a more sophisticated color contrast analyzer
    // For now, just a placeholder

    return issues
  }

  // Mouse usage detection
  const handleMouseUsage = () => {
    isKeyboardNavigationActive.value = false
  }

  // Initialize accessibility features
  onMounted(() => {
    detectScreenReader()
    createLiveRegions()

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseUsage)

    // Update focusable elements
    updateFocusableElements()

    // Watch for DOM changes
    const observer = new MutationObserver(() => {
      updateFocusableElements()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'hidden', 'tabindex']
    })

    // Add high contrast class if needed
    if (isHighContrastMode.value) {
      document.documentElement.classList.add('high-contrast')
    }

    // Announce page load
    setTimeout(() => {
      announce('Calendar page loaded', 'polite')
    }, 1000)
  })

  // Cleanup
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('mousedown', handleMouseUsage)

    // Remove live regions
    if (liveRegionPolite.value) {
      document.body.removeChild(liveRegionPolite.value)
    }
    if (liveRegionAssertive.value) {
      document.body.removeChild(liveRegionAssertive.value)
    }
  })

  return {
    // State
    isScreenReaderActive: readonly(isScreenReaderActive),
    isHighContrastMode: readonly(isHighContrastMode),
    isKeyboardNavigationActive: readonly(isKeyboardNavigationActive),
    announcements: readonly(announcements),

    // Screen reader
    announce,
    formatDateForScreenReader,
    formatEventForScreenReader,

    // Keyboard navigation
    updateFocusableElements,
    getFocusableElements,

    // Focus management
    saveFocus,
    returnFocus,
    trapFocus,

    // High contrast
    toggleHighContrast,

    // ARIA helpers
    setAriaAttributes,
    removeAriaAttributes,
    getElementDescription,

    // Validation
    validateAccessibility,

    // Utilities
    detectScreenReader
  }
}