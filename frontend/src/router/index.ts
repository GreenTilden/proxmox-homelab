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
    }
  ]
})

export default router