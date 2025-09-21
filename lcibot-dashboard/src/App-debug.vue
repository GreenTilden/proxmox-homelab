<template>
  <div id="app" class="min-h-screen bg-gray-900 text-white p-8">
    <h1>Debug Test - Vue App Loading</h1>
    <p>If you see this, Vue is working.</p>

    <div v-if="testSidebar">
      <h2>Testing Sidebar Import</h2>
      <SidebarNavigation
        @item-selected="handleNavItemSelected"
        @refresh-all="handleRefreshAll"
        @open-settings="handleOpenSettings"
      />
    </div>

    <button @click="testSidebar = !testSidebar" class="mt-4 px-4 py-2 bg-blue-600 rounded">
      {{ testSidebar ? 'Hide' : 'Show' }} Sidebar
    </button>

    <div class="mt-4">
      <h3>Error Log:</h3>
      <pre v-if="errorLog">{{ errorLog }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const testSidebar = ref(false)
const errorLog = ref('')

// Try to import the sidebar component
let SidebarNavigation: any = null
try {
  SidebarNavigation = (await import('./components/layout/SidebarNavigation.vue')).default
} catch (error) {
  errorLog.value = `Failed to import SidebarNavigation: ${error}`
  console.error('Import error:', error)
}

// Error handling
onErrorCaptured((error) => {
  errorLog.value = `Vue error: ${error.message}`
  console.error('Vue error:', error)
  return false
})

// Handler functions
const handleNavItemSelected = (item: any) => {
  console.log('Nav item selected:', item)
}

const handleRefreshAll = () => {
  console.log('Refresh all called')
}

const handleOpenSettings = () => {
  console.log('Open settings called')
}
</script>