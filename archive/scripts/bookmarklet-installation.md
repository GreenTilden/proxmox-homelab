# Iconscout Download Bookmarklet Installation Guide

## Overview
This bookmarklet provides a 16-bit gaming themed interface for efficiently downloading and cataloging icons from your Iconscout license for the homelab Homer dashboard.

## Installation Steps

### Step 1: Copy the Bookmarklet Code
The bookmarklet code is located in `/scripts/iconscout-downloader.js`. The entire contents need to be copied as a single line.

### Step 2: Create Browser Bookmark
1. **Chrome/Edge/Brave**:
   - Right-click bookmarks bar → "Add page"
   - Name: `🎮 16-Bit Icon Hunter`
   - URL: [paste entire bookmarklet code]

2. **Firefox**:
   - Bookmarks → "Add Bookmark"
   - Name: `🎮 16-Bit Icon Hunter` 
   - Location: [paste entire bookmarklet code]

3. **Safari**:
   - Bookmarks → "Add Bookmark"
   - Title: `🎮 16-Bit Icon Hunter`
   - Address: [paste entire bookmarklet code]

### Step 3: Test Installation
1. Navigate to any Iconscout icon page (e.g., https://iconscout.com/icons/gaming)
2. Click the bookmarklet in your bookmarks bar
3. Verify the 16-bit themed interface appears

## Usage Instructions

### Basic Workflow
1. **Browse Iconscout**: Use search terms from `/configs/target-icons-research.md`
2. **Activate Tool**: Click bookmarklet on icon pages
3. **Categorize**: Select appropriate category (Gaming/Media/Science/Development/Infrastructure)
4. **Customize Name**: Edit filename for consistency
5. **Download & Log**: Click "📥 DOWNLOAD & LOG" button

### Interface Features

#### 🎮 16-BIT ICON HUNTER Interface
- **Retro Gaming Theme**: Matches your homelab's 16-bit aesthetic
- **Category Selection**: Maps directly to Homer dashboard structure  
- **Custom Naming**: Ensures consistent file organization
- **Tag Extraction**: Automatically captures icon metadata
- **Download Logging**: Tracks all collected icons for batch processing

#### Category Mapping
- 🎮 **Gaming**: Entertainment and media server interfaces
- 🎬 **Media**: Plex, streaming, and content services
- 🔬 **Science**: Data analysis, monitoring, and research tools
- 💻 **Development**: Code editors, terminals, and dev tools
- 🔧 **Infrastructure**: Servers, networks, and system management

### Advanced Features

#### Download Logging
All icon selections are logged to browser localStorage for batch processing:
```javascript
// Export collected icons to CSV
exportIconLog()

// Clear the log when done
clearIconLog()
```

#### Batch Processing
1. Collect multiple icons using the bookmarklet
2. Export log to CSV: Run `exportIconLog()` in browser console
3. Process downloads: Use CSV to organize files in proper directories
4. Clear log: Run `clearIconLog()` when batch is complete

## File Organization Workflow

### Download Process
1. Icons download to your browser's default download folder
2. Move to appropriate category folders:
   ```
   /service-pool/homer-assets/icons/
   ├── gaming/
   ├── media/  
   ├── science/
   ├── development/
   └── infrastructure/
   ```

### Naming Convention
Format: `{category}-{service-name}-{style}.svg`

Examples:
- `media-plex-streaming.svg`
- `infrastructure-grafana-dashboard.svg`
- `gaming-arcade-cabinet.svg`
- `development-terminal-neon.svg`

### Quality Checklist
- [ ] SVG format preferred (scalable)
- [ ] Multicolor/vibrant 16-bit aesthetic
- [ ] Readable at 64x64 pixels minimum
- [ ] Consistent visual style within categories
- [ ] Proper file naming applied

## Troubleshooting

### Common Issues

#### Bookmarklet Not Loading
- Ensure entire JavaScript code is copied as one line
- Check for any line breaks in the bookmark URL
- Try copying code again from source file

#### Interface Not Appearing
- Verify you're on an Iconscout.com page
- Check browser JavaScript is enabled
- Try refreshing the page and clicking again

#### Download Not Working
- Verify Iconscout account has download permissions
- Check browser popup blocker settings
- Ensure you have active Iconscout license

### Browser Compatibility
- ✅ Chrome/Chromium (Recommended)
- ✅ Firefox
- ✅ Edge
- ✅ Safari
- ⚠️ Mobile browsers (limited functionality)

## Security Notes
- Bookmarklet only runs on Iconscout.com domains
- No external network requests made
- Local storage only used for download logging
- All data stays in your browser

## Next Steps
1. Install and test the bookmarklet
2. Begin systematic collection using target icon research
3. Organize downloaded files in proper directory structure
4. Proceed with Homer dashboard configuration
5. Test icon integration with 16-bit theme