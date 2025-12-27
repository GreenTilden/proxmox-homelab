# Vite Development Server Configuration

## Quick Start (Working Solution)

```bash
# Start dev server with external network access
npm run dev
# Access from external network
# http://192.168.0.218:5000/
```

## Configuration Details

### Current vite.config.ts
```typescript
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
```

### Critical Settings
- **Hardcoded Port 5000**: The development server now runs exclusively on port 5000.
- **CORS Enabled**: Required for external access.
- **Proxy Configuration**:
    - `/api/prometheus`: Targets `http://192.168.0.99:9090` (Prometheus).
    - `/api/zfs`: Targets `http://192.168.0.99:9101` (ZFS Exporter).
- **File Watching**: Configured for better performance in network environments, with problematic directories ignored.

### Verification Steps
1. **Check Network Binding**: `netstat -tlnp | grep :5000`
2. **Test External Access**: `curl -I http://192.168.0.218:5000`
3. **Verify Hot Reload**: Make changes and verify browser updates.

## Related Files
- `/frontend/vite.config.ts` - Main configuration
- `/frontend/package.json` - Development scripts

## Status
✅ **Working**: External network access confirmed at http://192.168.0.218:5000/
✅ **Hot Reload**: Live development workflow operational
✅ **Documented**: Current configuration accurately reflected.