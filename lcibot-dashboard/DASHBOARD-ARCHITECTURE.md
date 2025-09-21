# LCiBot Dashboard Architecture Documentation

## 🎨 Jehkoba8 Refined Dark Theme Implementation Complete

### Dashboard Service Locations & Ports

#### Primary Dashboard Locations
- **Development/Updated**: http://192.168.0.127:8092/ - ✅ **ACTIVE** - Current refined Jehkoba8 theme
- **Legacy**: http://192.168.0.99:8091/ - ❌ **OUTDATED** - Original bright theme (SimpleHTTP server)

#### Project Structure
```
/home/darney/projects/proxmox-homelab-writer/lcibot-dashboard/
├── src/
│   ├── style.css                    # ✅ MAIN THEME FILE - Refined Jehkoba8 colors
│   ├── App.vue                      # Vue.js main application
│   └── components/                  # Dashboard components
├── dist/                            # Built files (served by Vite preview)
│   ├── index.html                   # Entry point
│   └── assets/                      # Compiled CSS/JS
├── package.json                     # Build scripts and dependencies
└── vite.config.ts                   # Vite configuration
```

### Theme Architecture

#### Current Implementation: Jehkoba8 Refined Dark
**Location**: `/home/darney/projects/proxmox-homelab-writer/lcibot-dashboard/src/style.css`

**Refined Color Palette** (enhanced contrast for readability):
- `--j8-1: #2d1f26` - Much deeper warm gray (main backgrounds)
- `--j8-2: #7a3e3b` - Muted warm brown-red (secondary surfaces)
- `--j8-3: #a6634a` - Deeper warm tan (card backgrounds)
- `--j8-4: #e8c070` - Brighter warm yellow (better contrast for highlights)
- `--j8-5: #475166` - Deeper muted blue-gray (muted elements)
- `--j8-6: #5a8c92` - Slightly brighter soft teal (better visibility)
- `--j8-7: #7bc96b` - Brighter warm green (better contrast for selected states)
- `--j8-8: #f0f8c4` - Brighter cream (enhanced text readability)

#### Key Improvements Made
1. **Reduced Brightness**: 20-30% darker backgrounds for comfortable extended use
2. **Enhanced Text Contrast**: Brightened cream text (`#f0f8c4`) for better readability
3. **Improved Selected States**: Brighter green (`#7bc96b`) for tabs and active elements
4. **Better Highlight Colors**: Brighter yellow (`#e8c070`) for warnings and focus states
5. **Professional Appearance**: Maintained warm aesthetic while ensuring accessibility
6. **Interactive Elements**: Clear contrast for tabs, navigation, and form elements

### Development Workflow

#### Making Theme Changes
1. **Edit Source**: Modify `/home/darney/projects/proxmox-homelab-writer/lcibot-dashboard/src/style.css`
2. **Build**: Run `npm run build` to compile changes
3. **Restart Server**: Kill existing process and run `npx vite preview --host 0.0.0.0 --port 8092`
4. **Access**: View changes at `http://192.168.0.127:8092/`

#### Build Commands
```bash
# Change to dashboard directory
cd /home/darney/projects/proxmox-homelab-writer/lcibot-dashboard

# Build for production
npm run build

# Start preview server (accessible externally)
npx vite preview --host 0.0.0.0 --port 8092

# Development server (if making live changes)
npm run dev
```

### Server Configuration Details

#### Current Running Process
```bash
# Background process serving refined theme
npx vite preview --host 0.0.0.0 --port 8092
# Status: ✅ ACTIVE
# PID: (check with ps aux | grep vite)
# Network: Accessible on multiple interfaces:
#   - http://localhost:8092/
#   - http://192.168.0.127:8092/ ✅ EXTERNAL ACCESS
#   - http://172.18.0.1:8092/
```

#### Legacy Server (Port 8091)
```bash
# Old server details
Server: SimpleHTTP/0.6 Python/3.11.13
Status: ❌ SERVING OUTDATED THEME
Purpose: Historical/backup access
```

### Network Architecture

#### Dashboard Access Matrix
| Port | Status | Theme | Server Type | External Access | Purpose |
|------|--------|-------|-------------|-----------------|---------|
| 8091 | ❌ Legacy | Bright Jehkoba8 | Python SimpleHTTP | ✅ Yes | Backup/Legacy |
| 8092 | ✅ Current | Refined Dark Jehkoba8 | Vite Preview | ✅ Yes | Main Dashboard |
| 4173 | ⏸️ Default | Current Build | Vite Preview | ❌ Local Only | Development |

### Theme System Integration

#### CSS Variable Architecture
The theme uses CSS custom properties that cascade through all Vue components:

```css
/* Main theme variables applied globally */
:root {
  --j8-1: #2d1f26;  /* Backgrounds */
  --j8-7: #6bb85e;  /* Success/Primary */
  --j8-4: #d4a85c;  /* Warnings/Highlights */
  /* ... additional variables */
}

/* Component integration */
.mario-card {
  background: linear-gradient(135deg,
    rgba(122, 62, 59, 0.15) 0%,    /* Subtle brown overlay */
    rgba(166, 99, 74, 0.12) 100%   /* Deeper tan overlay */
  );
}
```

#### Cross-Component Consistency
All dashboard components inherit from the central theme:
- Service cards use consistent color mapping
- Status indicators use semantic color assignments
- Hover effects maintain theme cohesion
- Mobile responsiveness preserved

### Monitoring & Maintenance

#### Health Check Commands
```bash
# Check if dashboard is accessible
curl -I http://192.168.0.127:8092/

# View current CSS theme (should show refined colors)
curl -s http://192.168.0.127:8092/assets/index-*.css | head -20

# Check running Vite processes
ps aux | grep vite

# Restart dashboard service
pkill -f "vite preview" && npx vite preview --host 0.0.0.0 --port 8092 &
```

#### Common Issues & Solutions

1. **Port Not Accessible Externally**
   - Solution: Use `--host 0.0.0.0` flag with Vite
   - Check firewall settings if needed

2. **Changes Not Reflecting**
   - Solution: Run `npm run build` then restart preview server
   - Clear browser cache if necessary

3. **Wrong Theme Colors**
   - Check you're accessing port 8092 (updated) not 8091 (legacy)
   - Verify CSS variables in browser dev tools

### Future Enhancements

#### Planned Improvements
- [ ] Automated deployment script
- [ ] SSL certificate for HTTPS access
- [ ] Reverse proxy configuration for port 8091 → 8092
- [ ] Dark/light theme toggle
- [ ] Custom color picker for palette adjustments

#### Integration Notes
- Dashboard integrates with existing Proxmox homelab monitoring
- Compatible with existing service health endpoints
- Mobile-responsive design maintained across all theme variants
- Professional appearance suitable for production use

---

## Quick Reference Card

**🎯 Main Dashboard**: http://192.168.0.127:8092/
**📁 Theme File**: `src/style.css`
**🔨 Build**: `npm run build`
**🚀 Server**: `npx vite preview --host 0.0.0.0 --port 8092`
**🎨 Theme**: Jehkoba8 Refined Dark (Professional, Comfortable)

---
*Documentation updated: 2025-09-14*
*Status: Refined Jehkoba8 theme fully implemented and accessible*