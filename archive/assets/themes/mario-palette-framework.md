# Mario 16-Bit Multi-Dashboard Theming Framework

## 🎮 Overview
Comprehensive theming system for homelab dashboards using authentic Mario color palettes from Lospec, designed to work across Homer, Heimdall, Homarr, and other dashboard solutions while preserving existing service configurations.

## 🎨 Core Mario Palettes (From Lospec Research)

### **Primary Palettes**

#### 1. **Jehkoba16** (16 colors - Main Theme)
**Use Case**: Primary dashboard theme, emulates classic NES restrictions
**Colors**: #000000, #1D2B53, #7E2553, #008751, #AB5236, #5F574F, #C2C3C7, #FFF1E8, #FF004D, #FFA300, #FFEC27, #00E436, #29ADFF, #83769C, #FF77A8, #FFCCAA
**Application**: Main UI backgrounds, cards, primary interface elements

#### 2. **Mario Paint** (15 colors - Creative Theme) 
**Use Case**: Alternative theme, SNES-era creative tools aesthetic
**Colors**: Classic Mario Paint studio palette
**Application**: Content creation services, media management interfaces

#### 3. **Italy-4** (4 colors - Minimal Theme)
**Use Case**: Clean, minimal variant for mobile or low-contrast needs
**Application**: Simplified mobile layouts, accessibility mode

#### 4. **SMM2 Superball Game Boy** (4 colors - Monochrome Theme)
**Use Case**: Game Boy aesthetic for retro purists
**Application**: High-contrast accessibility, retro gaming services

## 🏗 Multi-Dashboard Architecture

### **Universal CSS Custom Properties System**
```css
:root {
  /* Mario Jehkoba16 Base */
  --mario-bg-primary: #1D2B53;    /* Deep blue backgrounds */
  --mario-bg-secondary: #000000;   /* Pure black for contrast */
  --mario-accent-fire: #FF004D;    /* Fire Mario red */
  --mario-accent-star: #FFEC27;    /* Star power yellow */
  --mario-accent-1up: #00E436;     /* 1-UP green */
  --mario-accent-ice: #29ADFF;     /* Ice Mario blue */
  --mario-text-primary: #FFF1E8;   /* Cream white text */
  --mario-text-secondary: #C2C3C7; /* Light gray text */
  --mario-surface: #7E2553;        /* Purple surface elements */
  --mario-border: #83769C;         /* Muted purple borders */
  
  /* Functional Mappings */
  --dashboard-bg: var(--mario-bg-primary);
  --card-bg: rgba(125, 37, 83, 0.15);
  --text-primary: var(--mario-text-primary);
  --accent-primary: var(--mario-accent-fire);
  --accent-success: var(--mario-accent-1up);
  --accent-warning: var(--mario-accent-star);
  --accent-info: var(--mario-accent-ice);
}
```

### **Dashboard-Specific Implementations**

#### **Homer Integration**
- Extends existing 16-bit theme
- Maintains current service wiring
- Adds Mario palette CSS variables
- Preserves icon integration system

#### **Heimdall Support**
- Custom CSS injection via config
- Service tile color coding by category
- Background theming with Mario aesthetics
- Icon compatibility layer

#### **Homarr Integration**  
- Theme JSON configuration
- Widget color customization
- Dashboard layout theming
- Service status indicators

## 🎯 Service Wiring Preservation Strategy

### **Current Service Configuration Mapping**
```yaml
# Existing services maintain their URLs and functionality
# Only visual theming changes, no service disruption

homelab_services:
  monitoring:
    - grafana: http://192.168.0.99:3000 # Keeps existing 16-bit theme
    - prometheus: http://192.168.0.99:9090
  
  media:
    - plex: http://192.168.0.99:32400 # Maintains current config
    - deluge: http://192.168.0.111:8112
    - firefox: http://192.168.0.99:3001
    
  infrastructure:
    - proxmox: https://192.168.0.99:8006 # No service changes
    - filebrowser: http://192.168.0.99:8080
    - wireguard: udp://192.168.0.99:51820
```

### **Theme-Only Changes**
- **Visual elements**: Colors, fonts, effects
- **Icon systems**: Enhanced with Mario palette coordination
- **Animations**: 16-bit inspired transitions
- **Layouts**: Responsive Mario-themed designs
- **NO service URL changes**
- **NO authentication changes**
- **NO functionality disruption**

## 🔄 Palette Switching System Architecture

### **JavaScript Theme Switcher**
```javascript
class MarioThemeSwitcher {
  themes: {
    'jehkoba16': {...}, // Primary theme
    'mario-paint': {...}, // Creative theme  
    'italy-4': {...}, // Minimal theme
    'superball-gb': {...} // Game Boy theme
  }
  
  switchTheme(themeName) {
    // Update CSS custom properties
    // Persist selection in localStorage
    // Trigger re-render animations
    // Coordinate across dashboard instances
  }
}
```

### **Theme Persistence**
- **localStorage**: User preference saved
- **Cross-dashboard sync**: Shared theme state
- **URL parameters**: Theme switching via links
- **API integration**: Server-side theme storage (optional)

## 📱 Frontend Extensions & Compatibility

### **Vue.js Integration Ready**
Your experience with Vue theme switchers can be leveraged:
- **Reactive theme variables**
- **Component-based theming**  
- **Smooth transitions**
- **State management integration**

### **Framework Compatibility Matrix**
| Dashboard | CSS Variables | Theme Switching | Icon Support | Mobile Responsive |
|-----------|--------------|----------------|--------------|-------------------|
| Homer     | ✅ Full      | ✅ JavaScript  | ✅ Enhanced  | ✅ Optimized      |
| Heimdall  | ✅ Partial   | ✅ CSS Classes | ✅ Standard  | ✅ Native         |
| Homarr    | ✅ Full      | ✅ Built-in    | ✅ Advanced  | ✅ Excellent      |
| Grafana   | ✅ Existing  | 🔧 Custom     | ➖ N/A       | ✅ Current        |

## 🎨 Palette Distribution Strategy

### **Service Category Color Mapping**
```css
/* Gaming Services - Fire Mario Theme */
.service-gaming {
  --primary: var(--mario-accent-fire);
  --background: rgba(255, 0, 77, 0.1);
}

/* Media Services - Star Power Theme */  
.service-media {
  --primary: var(--mario-accent-star);
  --background: rgba(255, 236, 39, 0.1);
}

/* Infrastructure - 1UP Green Theme */
.service-infrastructure {
  --primary: var(--mario-accent-1up);
  --background: rgba(0, 228, 54, 0.1);
}

/* Development - Ice Mario Theme */
.service-development {
  --primary: var(--mario-accent-ice);
  --background: rgba(41, 173, 255, 0.1);
}

/* Science - Purple Surface Theme */
.service-science {
  --primary: var(--mario-surface);
  --background: rgba(125, 37, 83, 0.1);
}
```

### **UI Element Distribution**
- **Headers**: Jehkoba16 deep blue with cream text
- **Cards**: Semi-transparent Mario surface purple
- **Buttons**: Category-specific accent colors
- **Borders**: Muted purple with glow effects
- **Icons**: Enhanced with palette-matching filters
- **Backgrounds**: Subtle Mario-inspired patterns

## 🚀 Implementation Priority

### **Phase 1: Core Framework**
1. **CSS Custom Properties**: Universal Mario palette system
2. **Homer Enhancement**: Extend current 16-bit theme  
3. **Service Preservation**: Maintain all current functionality
4. **Icon Coordination**: Mario palette-aware icon processing

### **Phase 2: Multi-Dashboard**
1. **Heimdall Theme**: Custom CSS implementation
2. **Homarr Integration**: Theme configuration system
3. **Theme Switcher**: JavaScript-based palette switching
4. **Cross-Platform Sync**: Shared theme state

### **Phase 3: Advanced Features**
1. **Vue.js Components**: Enhanced theme switching UI
2. **Animation System**: 16-bit inspired transitions
3. **Mobile Optimization**: Touch-friendly Mario theming
4. **Accessibility**: High-contrast Mario palette variants

## 🎯 Success Metrics

### **Visual Consistency**
- Cohesive Mario aesthetic across all dashboards
- Proper palette distribution by service category  
- Smooth theme switching without functionality loss
- Enhanced user experience with authentic retro feel

### **Technical Excellence**
- Zero service disruption during theme implementation
- Cross-browser compatibility for all dashboard solutions
- Responsive design maintaining usability across devices
- Performance optimization with CSS custom properties

### **User Experience**
- Intuitive theme switching similar to your Vue.js experience
- Professional appearance enhancing homelab pride
- Authentic Nintendo aesthetic without sacrificing functionality  
- Seamless integration preserving all current service workflows

This framework provides the foundation for a cohesive, professional Mario-themed homelab that maintains all current functionality while adding an authentic 16-bit Nintendo aesthetic across multiple dashboard solutions! 🎮✨