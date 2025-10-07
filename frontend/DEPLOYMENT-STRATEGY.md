# LCiBot Dashboard Dual-Theme Deployment Strategy

## Overview
The dashboard supports two themes for different users:
- **Retro Theme** (EllBot): Gaming/retro aesthetic with seasonal themes
- **Naive UI Theme** (Alissa): Clean, professional, iOS-inspired interface

## Current Development Setup

### Working URLs (Development)
- **Retro Theme**: http://192.168.0.218:3000/
- **Naive Theme**: http://192.168.0.218:3000/naive.html

### Development Commands
```bash
# Start retro theme development server
npm run dev:retro    # Port 3000

# Start naive theme development server
npm run dev:naive    # Port 3001 (network issues, use path-based instead)

# Build for production
npm run build:retro  # → dist/
npm run build:naive  # → dist-naive/
```

## Production Deployment Strategy

### Phase 1: Path-based Routing (Current)
**Implementation**: Single domain, different paths
- `http://192.168.0.99/` → Retro theme (default)
- `http://192.168.0.99/naive.html` → Naive theme

**Pros**: Simple to set up, single port, works immediately
**Cons**: Less clean URLs, manual HTML file management

### Phase 2: Subdomain Routing (Long-term Goal)
**Implementation**: Separate subdomains for each user
- `ellabot.lcibot.local` → Retro theme (EllBot's dashboard)
- `alissa.lcibot.local` → Naive theme (Alissa's dashboard)

**Benefits**:
- Clean separation of concerns
- Each user gets their own dedicated URL
- Easy to bookmark and remember
- Future-proof for additional features per user

## Production Deployment Steps

### Build Process
```bash
# Build both themes
npm run build:retro     # Creates dist/ with retro theme
npm run build:naive     # Creates dist-naive/ with naive theme

# Copy to web server directories
sudo cp -r dist/* /var/www/dashboard-retro/
sudo cp -r dist-naive/* /var/www/dashboard-naive/
```

### Nginx Configuration
```bash
# Copy nginx configuration
sudo cp nginx-dual-theme.conf /etc/nginx/sites-available/lcibot-dashboard
sudo ln -s /etc/nginx/sites-available/lcibot-dashboard /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### DNS Setup (for subdomains)
Add to `/etc/hosts` on client machines or configure local DNS:
```
192.168.0.99  ellabot.lcibot.local
192.168.0.99  alissa.lcibot.local
192.168.0.99  lcibot.local
```

## Theme Architecture

### Shared Components
- Service monitoring logic (`useServiceMonitoring`)
- API integrations (Prometheus, Grafana, etc.)
- Core data structures and types

### Theme-Specific Components
```
src/components/themes/
├── retro/           # Gaming aesthetic components
│   ├── ServiceCard.vue
│   └── ...
├── naive/           # Clean professional components
│   ├── ServiceCard.vue
│   └── ...
└── core/            # Shared components
    ├── CalendarWidget.vue
    └── ...
```

### Environment Configuration
- **Retro**: Seasonal themes, particles, scanlines, calendar card
- **Naive**: Professional layout, header calendar, system metrics

## Maintenance Notes

### Adding New Services
1. Update service list in `useServiceMonitoring.ts`
2. Both themes automatically inherit new services
3. Theme-specific styling handled in respective ServiceCard components

### Theme Updates
1. **Retro updates**: Modify components in `src/components/themes/retro/`
2. **Naive updates**: Modify components in `src/components/themes/naive/`
3. **Shared updates**: Modify core components and composables

### Deployment Pipeline
```bash
# Development workflow
npm run dev:retro              # Test retro theme
curl http://192.168.0.218:3000/naive.html  # Test naive theme

# Production deployment
npm run build:retro && npm run build:naive
# Copy to production directories
# Restart/reload web server
```

## Future Enhancements

### User-Specific Features
- **EllBot Dashboard**: Gaming metrics, system performance, advanced monitoring
- **Alissa Dashboard**: Calendar integration, simplified view, mobile-optimized

### Authentication (Optional)
- Could add user authentication to automatically route to correct theme
- Session-based theme selection
- User preferences storage

## Technical Notes

### Fixed Issues
- **Component Reactivity**: Used `markRaw()` for dynamic component imports
- **Naive UI Spacing**: Changed string size props to numeric values
- **Network Connectivity**: Used working port 3000 with path-based routing

### Architecture Benefits
- **Single Codebase**: Both themes share core functionality
- **Independent Evolution**: Each theme can evolve separately
- **Maintainable**: Clear separation between shared and theme-specific code
- **Scalable**: Easy to add additional themes or users