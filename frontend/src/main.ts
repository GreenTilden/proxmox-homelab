import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { getCurrentEnvironment, getCurrentConfig } from './config/environments'

// Environment-based imports and configuration
const currentEnv = getCurrentEnvironment()
const currentConfig = getCurrentConfig()

async function initializeApp() {
  const app = createApp(App)

  // Add router
  app.use(router)

  // Import NES.css for retro gaming theme
  await import('nes.css/css/nes.min.css')

  // Set document title based on environment
  document.title = currentConfig.title

  app.mount('#app')
}

// Initialize the application
initializeApp().catch(console.error)