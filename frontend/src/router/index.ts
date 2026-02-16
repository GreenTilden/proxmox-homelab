import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentEnvironment } from '@/config/environments'

// Dynamic imports for theme-based components
const RetroApp = () => import('@/themes/RetroApp.vue')
const NaiveApp = () => import('@/themes/NaiveApp.vue')
const ElementApp = () => import('@/themes/ElementApp.vue')
const CalendarPage = () => import('@/components/core/CalendarPage.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => {
        const currentEnv = getCurrentEnvironment()
        if (currentEnv === 'naive') return NaiveApp()
        if (currentEnv === 'element') return ElementApp()
        return RetroApp()
      }
    },
    {
      path: '/retro',
      name: 'RetroTheme',
      component: RetroApp
    },
    {
      path: '/naive',
      name: 'NaiveTheme',
      component: NaiveApp
    },
    {
      path: '/element',
      name: 'ElementTheme',
      component: ElementApp
    },
    {
      path: '/calendar',
      name: 'Calendar',
      component: CalendarPage
    },
    {
      path: '/container-monitor',
      name: 'ContainerMonitor',
      component: () => import('@/pages/ContainerMonitor.vue')
    },
    {
      path: '/toolbox',
      name: 'Toolbox',
      component: () => import('@/pages/Toolbox.vue')
    },
    {
      path: '/file-manager',
      name: 'FileManager',
      component: () => import('@/pages/FileManager.vue')
    },
    {
      path: '/weather',
      name: 'Weather',
      component: () => import('@/pages/WeatherPage.vue')
    },
    {
      path: '/docs',
      name: 'Docs',
      component: () => import('@/pages/DocsPage.vue')
    },
    {
      path: '/nanit',
      name: 'Nanit',
      component: () => import('@/pages/NanitPage.vue')
    },
    {
      path: '/vault',
      name: 'Vault',
      component: () => import('@/pages/VaultPage.vue')
    },
    {
      path: '/freezer-meals',
      name: 'FreezerMeals',
      component: () => import('@/pages/FreezerMeals.vue')
    },
    {
      path: '/ellabot',
      name: 'Ellabot',
      component: () => import('@/pages/EllabotPage.vue')
    }
  ]
})

export default router
