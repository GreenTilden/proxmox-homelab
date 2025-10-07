import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { getCurrentEnvironment, getCurrentConfig } from './config/environments'

// Check URL parameters for theme override
const urlParams = new URLSearchParams(window.location.search)
const themeParam = urlParams.get('theme')

// Override environment based on URL parameter
if (themeParam && (themeParam === 'naive' || themeParam === 'retro')) {
  // Temporarily override the environment detection
  Object.defineProperty(process.env, 'VITE_THEME', {
    value: themeParam,
    writable: false
  })
}

// Environment-based imports and configuration
const currentEnv = getCurrentEnvironment()
const currentConfig = getCurrentConfig()

async function initializeApp() {
  const app = createApp(App)

  // Configure based on theme environment
  if (currentEnv === 'retro') {
    // Import NES.css for retro gaming theme
    await import('nes.css/css/nes.min.css')
  } else if (currentEnv === 'naive') {
    // Naive UI is configured in NaiveApp.vue via NConfigProvider
    // No global configuration needed here
  }

  // Set document title based on environment
  document.title = currentConfig.title

  app.mount('#app')
}

// Initialize the application
initializeApp().catch(console.error)