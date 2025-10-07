import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ command, mode }) => {
  // Determine port based on environment theme
  const theme = process.env.VITE_THEME || 'retro'
  const portMap: Record<string, number> = {
    'retro': 5000,
    'naive': 5001,
    'element': 5002
  }
  const port = portMap[theme] || 5000

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    define: {
      'process.env.VITE_THEME': JSON.stringify(theme)
    },
    cacheDir: `node_modules/.vite-${theme}`,
    build: {
      outDir: `dist-${theme}`,
      emptyOutDir: true
    },
    server: {
      host: '0.0.0.0',
      port: port,
      strictPort: true,
      hmr: {
        port: port
      },
      cors: {
        origin: true,
        credentials: true
      },
      proxy: {
        // Proxy API requests to Proxmox services
        '/api/prometheus': {
          target: 'http://192.168.0.99:9090',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/prometheus/, '/api/v1')
        },
        '/api/grafana': {
          target: 'http://192.168.0.99:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/grafana/, '/api')
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
          '**/firefox/**'
        ]
      }
    }
  }
})