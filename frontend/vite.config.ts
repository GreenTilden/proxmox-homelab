import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    define: {
      'process.env.VITE_THEME': JSON.stringify('retro')
    },
    cacheDir: `node_modules/.vite`,
    build: {
      outDir: `dist`,
      emptyOutDir: true
    },
    server: {
      host: '0.0.0.0',
      port: 5000,
      strictPort: true,
      hmr: {
        port: 5000
      },
      cors: {
        origin: true,
        credentials: true
      },
      proxy: {
        '/api/glances': {
          target: 'http://192.168.0.99:8082',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/glances/, '')
        },
        // Proxy API requests to Proxmox services
        '/api/prometheus': {
          target: 'http://192.168.0.99:9090',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/prometheus/, '/api/v1')
        },
        '/api/zfs': {
          target: 'http://192.168.0.99:9101',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/zfs/, '')
        }
      },
      watch: {
        usePolling: true,
        // Ignore problematic directories
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.cache/**',
          '**/cache2/**',
          '**/.mozilla/**',
        ]
      }
    }
  }
})