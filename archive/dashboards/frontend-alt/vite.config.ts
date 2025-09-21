import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    watch: {
      // Ignore problematic directories
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/.cache/**',
        '**/cache2/**',
        '**/.mozilla/**',
        '**/firefox/**'
      ]
    }
  }
})