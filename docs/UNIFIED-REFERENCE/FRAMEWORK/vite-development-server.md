# Vite Development Server Configuration

## Quick Start (Working Solution)

```bash
# Start dev server with external network access
npm run dev -- --host 0.0.0.0 --port 3000

# Access from external network
# http://192.168.0.218:3000/
```

## Configuration Details

### Working vite.config.ts
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

### Critical Settings
- **Separate HMR Port**: Prevents websocket conflicts
- **CORS Enabled**: Required for external access
- **Command-line Override**: Ensures proper network binding
- **Port 3000**: Avoids common conflicts with other services

### Verification Steps
1. **Check Network Binding**: `netstat -tlnp | grep :3000`
2. **Test External Access**: `curl -I http://192.168.0.218:3000`
3. **Verify Hot Reload**: Make changes and verify browser updates

## Integration with 5-Thread Model

This configuration supports the multi-threaded development workflow by ensuring:
- **Main Thread**: Can coordinate development across worktrees
- **Writer Thread**: Hot reload works for live Vue.js development
- **Reader Thread**: Can access running dashboard for verification
- **External Access**: SSH sessions maintain proper development environment

## Related Files
- `/frontend/vite.config.ts` - Main configuration
- `/frontend/package.json` - Development scripts
- `/docs/vite-network-configuration.md` - Detailed troubleshooting guide

## Status
✅ **Working**: External network access confirmed at http://192.168.0.218:3000/
✅ **Hot Reload**: Live development workflow operational
✅ **Documented**: Troubleshooting patterns captured for reuse