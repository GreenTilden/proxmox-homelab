# Biosero Dark Theme Specification

**Status**: ✅ **READY FOR IMPLEMENTATION**
**Updated**: 2025-08-31 - Cycle 13 Simplified Brand Implementation
**Authority**: Technical specification for Biosero brand dark theme compliance
**Location**: `/home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/ARCHITECTURE/`
**Design Philosophy**: Clean, professional, chatbot-simplistic with optimal dark theme UX

---

## 🎨 **Design Philosophy**

### **Core Principles**
- **Dark Theme Optimized**: All elements designed for dark environments with reduced eye strain
- **Professional Scientific Aesthetic**: Clean, modern interface suitable for laboratory automation
- **High Contrast Accessibility**: Ensure readability and usability for all users
- **Simplified Interaction**: No complex animations, focus on functional clarity
- **Consistent Branding**: Cohesive visual identity across all interface elements

### **Target User Experience**
- **Laboratory Professionals**: Scientists and technicians using automation systems
- **Extended Sessions**: Interface optimized for long working periods
- **Focus on Functionality**: Visual elements support task completion without distraction
- **Cross-Device Consistency**: Uniform experience across desktop, tablet, and mobile

---

## 🎯 **Color System Specification**

### **Primary Brand Colors**
```css
:root {
  /* Primary Brand Colors */
  --biosero-cyan: #2ED1E4;      /* Primary actions, links, active states */
  --biosero-purple: #C364F4;    /* Accents, highlights, gradient elements */
  --biosero-blue: #86A2EC;      /* Secondary elements, information display */
  --biosero-green: #47CF3F;     /* Success states, positive feedback */
  --biosero-orange: #FF8C42;    /* Warnings, pending states */
  --biosero-red: #FF6B6B;       /* Errors, critical alerts */
}
```

### **Dark Theme Color Palette**
```css
:root {
  /* Background Colors */
  --bg-primary: #1a1a1a;        /* Main application background */
  --bg-secondary: #2d2d2d;      /* Card backgrounds, elevated surfaces */
  --bg-tertiary: #404040;       /* Hover states, active backgrounds */
  
  /* Text Colors */
  --text-primary: #f5f5f5;      /* Primary text, headings */
  --text-secondary: #e5e5e5;    /* Secondary text, body content */
  --text-muted: #a3a3a3;        /* Muted text, labels, placeholders */
  --text-disabled: #595959;     /* Disabled text, inactive elements */
  
  /* Border Colors */
  --border-primary: #595959;    /* Standard borders, dividers */
  --border-secondary: #404040;  /* Subtle borders, card outlines */
  --border-accent: #2ED1E4;     /* Focus states, active borders */
  
  /* Surface Colors */
  --surface-elevated: rgba(45, 45, 45, 0.8);  /* Modal, dropdown backgrounds */
  --surface-glass: rgba(45, 45, 45, 0.6);     /* Glass morphism effect */
  --surface-hover: rgba(46, 209, 228, 0.1);   /* Hover states */
}
```

### **Gradient Definitions**
```css
:root {
  /* Primary Gradients */
  --gradient-primary: linear-gradient(135deg, #C364F4 0%, #86A2EC 50%, #C364F4 100%);
  --gradient-secondary: linear-gradient(90deg, #2ED1E4 0%, #86A2EC 100%);
  
  /* Subtle Background Gradients */
  --gradient-background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  --gradient-surface: linear-gradient(135deg, rgba(195, 100, 244, 0.1) 0%, rgba(134, 162, 236, 0.05) 100%);
  
  /* Status Gradients */
  --gradient-success: linear-gradient(90deg, #47CF3F 0%, #2ED1E4 100%);
  --gradient-warning: linear-gradient(90deg, #FF8C42 0%, #C364F4 100%);
  --gradient-error: linear-gradient(90deg, #FF6B6B 0%, #C364F4 100%);
}
```

---

## 📝 **Typography Specification**

### **Font Family System**
```css
:root {
  --font-primary: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-monospace: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}

body {
  font-family: var(--font-primary);
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-secondary);
  background: var(--gradient-primary);
}
```

### **Typography Scale**
```css
/* Heading Styles */
.h1, h1 {
  font-size: 2.25rem;      /* 36px */
  font-weight: 600;
  line-height: 1.2;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.h2, h2 {
  font-size: 1.875rem;     /* 30px */
  font-weight: 600;
  line-height: 1.3;
  color: var(--biosero-cyan);
  margin-bottom: 1.25rem;
}

.h3, h3 {
  font-size: 1.5rem;       /* 24px */
  font-weight: 500;
  line-height: 1.4;
  color: var(--biosero-blue);
  margin-bottom: 1rem;
}

.h4, h4 {
  font-size: 1.25rem;      /* 20px */
  font-weight: 500;
  line-height: 1.4;
  color: var(--text-primary);
  margin-bottom: 0.875rem;
}

/* Body Text */
.text-lg {
  font-size: 1.125rem;     /* 18px */
  line-height: 1.6;
}

.text-base {
  font-size: 1rem;         /* 16px */
  line-height: 1.6;
}

.text-sm {
  font-size: 0.875rem;     /* 14px */
  line-height: 1.5;
}

.text-xs {
  font-size: 0.75rem;      /* 12px */
  line-height: 1.4;
}
```

### **Text Color Utilities**
```css
.text-primary { color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); }
.text-muted { color: var(--text-muted); }
.text-disabled { color: var(--text-disabled); }

/* Brand Text Colors */
.text-cyan { color: var(--biosero-cyan); }
.text-purple { color: var(--biosero-purple); }
.text-blue { color: var(--biosero-blue); }
.text-green { color: var(--biosero-green); }
.text-orange { color: var(--biosero-orange); }
.text-red { color: var(--biosero-red); }
```

---

## 🧩 **Component Specifications**

### **Button Component Specification**
```css
.biosero-button {
  /* Base Styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-family: var(--font-primary);
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  text-decoration: none;
  
  /* Focus States */
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(46, 209, 228, 0.3);
  }
  
  /* Disabled State */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

/* Button Variants */
.biosero-button--primary {
  background: var(--biosero-cyan);
  color: #ffffff;
  
  &:hover:not(:disabled) {
    background: #26B8C8;
    transform: translateY(-1px);
  }
}

.biosero-button--secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  
  &:hover:not(:disabled) {
    background: var(--bg-tertiary);
    border-color: var(--border-accent);
  }
}

.biosero-button--ghost {
  background: transparent;
  color: var(--biosero-cyan);
  
  &:hover:not(:disabled) {
    background: var(--surface-hover);
  }
}
```

### **Card Component Specification**
```css
.biosero-card {
  /* Base Styles */
  background: var(--surface-glass);
  border: 1px solid var(--border-secondary);
  border-radius: 0.75rem;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  
  /* Default Padding */
  padding: 1.5rem;
  
  /* Hover Effect */
  &:hover {
    border-color: var(--border-primary);
  }
}

/* Card Variants */
.biosero-card--elevated {
  background: var(--bg-secondary);
  border-color: var(--border-primary);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  
  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }
}

.biosero-card--subtle {
  background: var(--surface-elevated);
  border-color: transparent;
}
```

### **Form Element Specifications**
```css
.biosero-input {
  /* Base Styles */
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border-primary);
  border-radius: 0.375rem;
  color: var(--text-primary);
  font-family: var(--font-primary);
  font-size: 0.875rem;
  line-height: 1.25rem;
  transition: all 0.2s ease;
  
  /* Placeholder */
  &::placeholder {
    color: var(--text-muted);
  }
  
  /* Focus State */
  &:focus {
    outline: none;
    border-color: var(--border-accent);
    box-shadow: 0 0 0 3px rgba(46, 209, 228, 0.1);
  }
  
  /* Hover State */
  &:hover:not(:focus) {
    border-color: var(--text-muted);
  }
  
  /* Disabled State */
  &:disabled {
    background: var(--bg-primary);
    color: var(--text-disabled);
    cursor: not-allowed;
  }
}

.biosero-select {
  @extend .biosero-input;
  padding-right: 2.5rem;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
}

.biosero-textarea {
  @extend .biosero-input;
  resize: vertical;
  min-height: 4rem;
}
```

---

## 🎭 **Interface Layout Specifications**

### **Navigation Specification**
```css
.biosero-navigation {
  background: var(--gradient-primary);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  padding: 1rem 0;
}

.biosero-nav-link {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--biosero-cyan);
    background: rgba(46, 209, 228, 0.1);
  }
  
  &.active {
    color: var(--biosero-cyan);
    background: rgba(46, 209, 228, 0.15);
    font-weight: 500;
  }
}
```

### **Tabbed Interface Specification**
```css
.biosero-tabs {
  border-bottom: 1px solid var(--border-secondary);
  margin-bottom: 2rem;
}

.biosero-tab-list {
  display: flex;
  gap: 0.25rem;
}

.biosero-tab-button {
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: var(--text-muted);
  border: none;
  border-bottom: 2px solid transparent;
  border-radius: 0.5rem 0.5rem 0 0;
  font-family: var(--font-primary);
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--text-primary);
    background: var(--surface-hover);
  }
  
  &.active {
    color: var(--biosero-cyan);
    border-bottom-color: var(--biosero-cyan);
    background: var(--surface-hover);
  }
  
  &:focus {
    outline: none;
    box-shadow: inset 0 0 0 2px var(--border-accent);
  }
}

.biosero-tab-content {
  padding: 1.5rem 0;
}
```

---

## 🎨 **Visual Effects and Enhancements**

### **Glass Morphism Effects**
```css
.glass-effect {
  background: rgba(45, 45, 45, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-elevated {
  background: rgba(45, 45, 45, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### **Subtle Animation Utilities**
```css
.transition-standard {
  transition: all 0.2s ease;
}

.transition-slow {
  transition: all 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
}

.hover-scale:hover {
  transform: scale(1.02);
}

/* Simple Loading Animation */
.loading-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.loading-spinner {
  border: 2px solid transparent;
  border-top: 2px solid var(--biosero-cyan);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

---

## ♿ **Accessibility Specifications**

### **Color Contrast Requirements**
- **Normal Text**: Minimum 4.5:1 contrast ratio against background
- **Large Text**: Minimum 3:1 contrast ratio for text 18pt+ or 14pt+ bold
- **Interactive Elements**: Minimum 3:1 contrast ratio for borders and focus indicators

### **Focus Management**
```css
/* Global Focus Styles */
*:focus {
  outline: none;
}

/* Custom Focus Indicators */
.focus-ring:focus {
  box-shadow: 0 0 0 3px rgba(46, 209, 228, 0.3);
  border-color: var(--border-accent);
}

/* Skip Links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 8px;
  border-radius: 4px;
  text-decoration: none;
  z-index: 1000;
  
  &:focus {
    top: 6px;
  }
}
```

### **Screen Reader Support**
```css
/* Visually Hidden Utility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus Visible for Keyboard Users */
.focus-visible:focus:not(:focus-visible) {
  box-shadow: none;
}
```

---

## 📱 **Responsive Design Specifications**

### **Breakpoint System**
```css
:root {
  /* Responsive Breakpoints */
  --screen-sm: 640px;
  --screen-md: 768px;
  --screen-lg: 1024px;
  --screen-xl: 1280px;
  --screen-2xl: 1536px;
}

/* Mobile First Media Queries */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### **Mobile Optimizations**
```css
/* Touch-Friendly Sizing */
@media (max-width: 767px) {
  .biosero-button {
    min-height: 44px;
    padding: 0.75rem 1rem;
  }
  
  .biosero-tab-button {
    padding: 1rem 1rem;
    min-height: 44px;
  }
  
  .biosero-input {
    padding: 0.75rem;
    font-size: 16px; /* Prevent zoom on iOS */
  }
}

/* Navigation Mobile Behavior */
@media (max-width: 767px) {
  .biosero-nav-link {
    padding: 1rem;
    display: block;
    text-align: center;
  }
}
```

---

## 🔧 **Implementation Guidelines**

### **CSS Custom Properties Setup**
1. Define all color variables in `:root`
2. Use variables consistently throughout stylesheets
3. Provide fallback colors for older browsers
4. Test color combinations for accessibility compliance

### **Component Development Standards**
1. Use BEM methodology for CSS class naming
2. Implement keyboard navigation for all interactive elements
3. Include ARIA labels and roles for screen readers
4. Test components in high contrast mode

### **Performance Considerations**
1. Minimize use of backdrop-filter for better performance
2. Use CSS transforms for animations (GPU accelerated)
3. Optimize gradient usage to avoid performance impact
4. Use will-change property sparingly and remove after animations

---

**This specification provides comprehensive technical guidance for implementing Biosero brand compliance with dark theme optimization, ensuring professional scientific aesthetic while maintaining excellent user experience and accessibility standards.**