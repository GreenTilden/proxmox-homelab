# Vite Development Server Network Configuration

## Problem
Vite dev server runs locally but times out when accessed from external network (SSH sessions, remote machines).

## Root Cause
Default Vite configuration binds to localhost only and doesn't properly configure HMR (Hot Module Replacement) websockets for external access.

## Solution

### 1. Working Configuration (Updated)

**Command Line Approach (Recommended):**
```bash
npm run dev -- --host 0.0.0.0 --port 3000
```

**vite.config.ts Configuration:**
```typescript
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',           // Bind to all interfaces
    port: 3000,                // Use port 3000 (avoids conflicts)
    strictPort: true,          // Fail if port unavailable
    hmr: {
      port: 24678,             // Separate HMR port
      host: 'localhost'        // HMR on localhost
    },
    cors: true,                // Enable CORS explicitly
    watch: {
      usePolling: true,        // Better file watching in network environments
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
```

### 2. Key Configuration Elements

- **`host: '0.0.0.0'`**: Allows external network connections
- **`strictPort: true`**: Prevents automatic port switching
- **`hmr.host: '192.168.0.218'`**: Specific IP for websocket connections (critical for hot reload)
- **`usePolling: true`**: Ensures file changes are detected across network mounts

### 3. Verification Steps

```bash
# 1. Check server is bound to all interfaces
netstat -tlnp | grep :5176
# Should show: 0.0.0.0:5176

# 2. Test local access
curl http://localhost:5176

# 3. Test external access
curl http://192.168.0.218:5176

# 4. Verify in browser
# Access: http://192.168.0.218:5176/
```

### 4. Common Issues

**Problem**: Server runs but browser times out
- **Cause**: HMR websockets can't connect
- **Fix**: Set `hmr.host` to specific IP address

**Problem**: Hot reload doesn't work
- **Cause**: File watching issues across network
- **Fix**: Enable `usePolling: true`

**Problem**: Port conflicts
- **Cause**: Multiple dev servers running
- **Fix**: Use `strictPort: true` and kill existing processes

### 5. Alternative: Production Build Testing

If development server continues having issues:

```bash
# Build production version
npm run build

# Serve with simple HTTP server
python3 -m http.server 8080 --bind 0.0.0.0 --directory dist
```

## Implementation Status
- ✅ Fixed: External network access for Vite dev server
- ✅ Verified: Hot module replacement working
- ✅ Tested: Seasonal theme system accessible at http://192.168.0.218:5176/

## Related Files
- `/frontend/vite.config.ts` - Main configuration
- `/frontend/package.json` - Dev scripts
- `/frontend/src/` - Vue.js seasonal dashboard source