# 16-Bit Homelab Icon Research Guide

## Overview
Curated list of 50 target icons across 5 categories for the Proxmox homelab Homer dashboard, optimized for Iconscout's multicolor 16-bit gaming aesthetic.

## Icon Discovery Strategy

### Iconscout Search Terms by Category

#### 🎮 Gaming Category (10 icons)
**Search Terms**: `gaming multicolor`, `arcade pixel`, `retro gaming`, `console gaming`

**Target Icons**:
1. **Arcade Cabinet** - Primary dashboard icon, retro gaming aesthetic
2. **Game Controller** - Media server controls (Plex)
3. **Joystick** - Interactive services
4. **Pixel Heart** - Monitoring/health status
5. **8-bit Trophy** - Achievement/success indicators
6. **Retro TV** - Media display services
7. **Game Cartridge** - Data/content storage
8. **Power Button (Gaming)** - System controls
9. **Coin (Arcade)** - Currency/credits theme
10. **High Score** - Performance metrics

**Iconscout Categories to Browse**:
- Entertainment > Gaming
- Technology > Gaming
- Pixel Art collections
- 16-bit themed packs

#### 🎬 Media Category (10 icons) 
**Search Terms**: `media multicolor`, `streaming colorful`, `video gaming`, `entertainment pixel`

**Target Icons**:
1. **Streaming Play Button** - Plex Media Server
2. **Film Reel (Colorful)** - Movie content
3. **Music Note (Neon)** - Audio services  
4. **Download Arrow** - Deluge Torrent
5. **Video Camera (Retro)** - Content creation
6. **Headphones (Gaming)** - Audio output
7. **TV Screen (Colorful)** - Display services
8. **Microphone (Neon)** - Recording/streaming
9. **Record Player** - Music library
10. **Clapper Board** - Video management

**Iconscout Categories to Browse**:
- Entertainment > Media
- Technology > Streaming  
- Multimedia collections
- Neon/colorful icon packs

#### 🔬 Science Category (10 icons)
**Search Terms**: `science multicolor`, `lab equipment pixel`, `research gaming`, `data analysis retro`

**Target Icons**:
1. **Microscope (Colorful)** - Data analysis tools
2. **Test Tube (Neon)** - Experimental services
3. **Atom (Gaming Style)** - Core system components
4. **Beaker (Multicolor)** - Processing/mixing
5. **DNA Helix** - Data structures
6. **Circuit Board** - Hardware monitoring
7. **Molecule (Pixel)** - Compound services  
8. **Lab Flask** - Development environment
9. **Graph/Chart (Neon)** - Analytics (Grafana alternative)
10. **Rocket (Retro)** - Deployment/launch

**Iconscout Categories to Browse**:
- Education > Science
- Technology > Research
- Medical/Laboratory
- Futuristic/sci-fi collections

#### 💻 Development Category (10 icons)
**Search Terms**: `coding multicolor`, `development pixel`, `programmer gaming`, `terminal retro`

**Target Icons**:
1. **Terminal (Neon)** - Command line interfaces
2. **Code Brackets (Colorful)** - Programming tools
3. **Git Branch (Gaming)** - Version control
4. **Database (Pixel)** - Data storage
5. **API (Retro)** - Service interfaces  
6. **Bug (Neon)** - Debugging tools
7. **Gear/Settings (Gaming)** - Configuration
8. **Monitor/IDE (Colorful)** - Development environment
9. **Keyboard (Mechanical)** - Input/coding
10. **Server Rack (Pixel)** - Backend services

**Iconscout Categories to Browse**:
- Technology > Development
- Business > Programming
- Computer/Software
- Tech/startup icon packs

#### 🔧 Infrastructure Category (10 icons)
**Search Terms**: `server gaming`, `network pixel`, `infrastructure multicolor`, `monitoring retro`

**Target Icons**:
1. **Server (Gaming Style)** - Proxmox management
2. **Network Globe** - Internet connectivity 
3. **Shield (Neon)** - Security/VPN (WireGuard)
4. **Dashboard (Colorful)** - Monitoring (Grafana)
5. **Storage (Pixel)** - FileBrowser/storage
6. **Cloud (Retro)** - Remote services
7. **Router (Gaming)** - Network equipment
8. **Lock (Multicolor)** - Security services
9. **Backup (Neon)** - Data protection
10. **Metrics/Graph** - Performance monitoring

**Iconscout Categories to Browse**:
- Technology > Server
- Business > Infrastructure  
- Security collections
- Network/cloud icon packs

## Download Workflow

### Phase 1: Account Setup
1. Log into Iconscout with your premium license
2. Install the bookmarklet from `/scripts/iconscout-downloader.js`
3. Test on a sample icon page

### Phase 2: Systematic Collection
1. Start with **Gaming** category (most unique aesthetic)
2. Use search terms: `gaming multicolor` → `arcade pixel` → `retro gaming`
3. Click bookmarklet on each target icon
4. Verify category assignment and custom naming
5. Download SVG format when available

### Phase 3: Quality Control
1. Review downloaded icons for consistency
2. Ensure multicolor/vibrant aesthetic
3. Test scalability (64x64 to 256x256)
4. Verify 16-bit gaming theme alignment

### Phase 4: Organization
1. Move icons to appropriate `/service-pool/homer-assets/icons/{category}/`
2. Rename using convention: `{category}-{service-name}-{style}.svg`
3. Create thumbnail previews for quick reference
4. Update manifest with actual downloaded files

## Alternative Sources (Backup Plan)

If Iconscout selection is limited:

### Complementary Sources
1. **Dashboard Icons Project**: https://github.com/walkxcode/dashboard-icons
2. **Homer Icons Collection**: https://github.com/NX211/homer-icons  
3. **SuperTinyIcons**: Professional service icons
4. **16-bit Icon Packs**: Itch.io gaming asset stores

### Custom Creation
1. Use existing icons as base templates
2. Apply 16-bit color palette from Grafana theme
3. Ensure consistent sizing and style
4. Create variants for different services

## Integration Checklist

- [ ] All 50 icons collected and organized
- [ ] SVG format verified for scalability  
- [ ] Color palette matches 16-bit gaming theme
- [ ] Icons tested at multiple sizes (64px, 128px, 256px)
- [ ] Naming convention applied consistently
- [ ] Backup copies stored in project repository
- [ ] Homer dashboard ready for configuration
- [ ] Mobile responsiveness tested
- [ ] Integration with existing Grafana theme verified

## Success Metrics

1. **Visual Consistency**: All icons match 16-bit gaming aesthetic
2. **Service Coverage**: Each homelab service has appropriate icon
3. **Scalability**: Icons remain clear at all dashboard sizes
4. **Loading Performance**: SVG format ensures fast loading
5. **User Experience**: Dashboard navigation improved with visual cues
6. **Theme Integration**: Icons complement existing Grafana styling