# Proxmox Homelab Frontend - Design Foundation

**Created**: September 21, 2025
**Palette**: Jehkoba64 (64-color retro gaming palette)
**Framework**: Vue.js 3 with TypeScript
**Architecture**: Professional sidebar-based dashboard

## 🎨 **Jehkoba64 Retro Palette Foundation**

### **Palette Source**
- **Name**: Jehkoba64
- **Colors**: 64 total colors
- **Style**: SNES-inspired retro gaming aesthetic
- **Philosophy**: "A vibrant selection intended to cover all the needs of a retro game or art project"

### **Core Color Mapping for Dashboard**

#### **Background & Structure**
```css
--dark-base: #050e1a      /* Deep space background */
--dark-surface: #0d2140   /* Panel backgrounds */
--dark-accent: #4e278c    /* Deep purple structural elements */
```

#### **Primary Interactive Colors**
```css
--primary-blue: #49c2f2   /* Bright blue for primary actions */
--primary-purple: #4e278c /* Deep purple for headers */
--accent-pink: #fabbaf    /* Bright pink for highlights */
--accent-orange: #faa032  /* Warm orange for warnings/updates */
```

#### **Text & Content**
```css
--text-primary: #fabbaf   /* Light pink for primary text */
--text-secondary: #49c2f2 /* Blue for secondary text */
--text-muted: #6b93d6     /* Muted blue for secondary info */
```

#### **Status & State Colors**
```css
--success: #4fc049       /* Bright green for success states */
--warning: #faa032       /* Orange for warnings */
--error: #ff6b93         /* Pink-red for errors */
--info: #49c2f2          /* Blue for information */
```

## 🏗️ **Architecture Principles**

### **Sidebar Navigation Design**
- **Collapsible sidebar** with retro-styled navigation
- **Icon-based navigation** with smooth color transitions
- **Contextual highlighting** using Jehkoba64 accent colors
- **Mobile-responsive** with slide-out behavior

### **Component Hierarchy**
```
App.vue (Root container)
├── AppSidebar.vue (Navigation)
├── AppHeader.vue (Top bar - optional/minimal)
└── AppMain.vue (Content area)
    ├── DashboardView.vue (Main overview)
    ├── ServicesView.vue (Service management)
    ├── MonitoringView.vue (System metrics)
    └── SettingsView.vue (Configuration)
```

### **Color Usage Strategy**

#### **Visual Hierarchy**
1. **Primary Actions**: Bright blue (#49c2f2)
2. **Secondary Actions**: Warm orange (#faa032)
3. **Navigation Active**: Deep purple (#4e278c)
4. **Status Indicators**: Success green, warning orange, error pink

#### **Retro Gaming Elements**
- **Pixel-perfect borders** with contrasting colors
- **Subtle gradients** using palette color ramps
- **Glow effects** for interactive elements
- **Chunky buttons** with retro styling
- **Scanline effects** for authenticity (optional/subtle)

## 📱 **Responsive Design**

### **Desktop (1024px+)**
- Full sidebar navigation
- Multi-column layouts
- Rich visual effects

### **Tablet (768px-1023px)**
- Collapsible sidebar
- Optimized touch targets
- Simplified gradients

### **Mobile (767px and below)**
- Hidden sidebar with menu button
- Single-column layouts
- Essential colors only

## 🎯 **Target Experience**

### **Professional Retro Aesthetic**
- Clean, functional design with retro gaming nostalgia
- **Homelab management** focus with gaming-inspired UI
- **High contrast** for readability
- **Smooth animations** using palette transitions

### **Service Integration**
- **Real-time status** indicators using Jehkoba64 colors
- **Health monitoring** with color-coded states
- **Interactive service cards** with hover effects
- **Mobile-optimized** touch interfaces

## 🚀 **Implementation Notes**

### **CSS Custom Properties**
All colors defined as CSS custom properties for easy theming and consistency across components.

### **Component Library**
Build reusable components following Jehkoba64 color patterns:
- `RetroCard.vue` - Service status cards
- `RetroButton.vue` - Styled action buttons
- `RetroNavItem.vue` - Sidebar navigation items
- `RetroStatusBadge.vue` - Status indicators

### **Performance Considerations**
- Minimize CSS-in-JS for faster rendering
- Use CSS custom properties for dynamic theming
- Optimize color transitions for smooth animations

---

**Next Steps**: Implement base Vue.js components using this design foundation