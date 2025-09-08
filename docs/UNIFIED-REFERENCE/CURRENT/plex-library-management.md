# Plex Library Management Workflow

## Library Structure (Implemented 2025-08-25)

### Three-Library Organization
Successfully deployed separation strategy for better content management and user experience.

#### 1. Disney Collection Library
- **Path**: `/media-pool/plex/Disney/`
- **Content**: 101 files of Disney/Pixar content
- **Purpose**: Family-friendly content isolation
- **Access Control**: Can be shared with specific users/kids
- **Metadata Agent**: TheMovieDB with family filters

#### 2. TV Shows Library  
- **Path**: `/media-pool/plex/TV/`
- **Content**: 244 files organized by show/season/episode
- **Purpose**: Series content with episode tracking
- **Naming Convention**: `Show Name/Season XX/Show.Name.SXXEXX.quality.ext`
- **Metadata Agent**: TheTVDB primary, TMDB secondary

#### 3. Movies Library
- **Path**: `/media-pool/plex/Movies/`
- **Content**: 187 general movie files
- **Purpose**: Non-Disney theatrical releases
- **Naming Convention**: `Movie.Name.Year.quality.ext`
- **Metadata Agent**: TheMovieDB with Plex Movie agent fallback

## Library Management Commands

### Force Library Scan
```bash
# Via Plex Web UI
http://192.168.0.99:32400/web → Settings → Libraries → Scan

# Via Docker exec
docker exec plex /usr/lib/plexmediaserver/Plex\ Media\ Scanner --scan --refresh

# Via API
curl "http://192.168.0.99:32400/library/sections/all/refresh?X-Plex-Token=YOUR_TOKEN"
```

### Monitor Library Health
```bash
# Check file permissions
docker exec plex ls -la /srv/media-pool/plex/

# View scanning logs
docker logs plex --tail 50 | grep -i scan

# Database optimization
docker exec plex sqlite3 "/config/Library/Application Support/Plex Media Server/Plug-in Support/Databases/com.plexapp.plugins.library.db" "VACUUM;"
```

## Content Processing Pipeline

### Automated Workflow
1. **Download**: Deluge → `/staging-pool/downloads/`
2. **Classification**: Custom script sorts by type
3. **Organization**: Move to appropriate library folder
4. **Naming**: Rename to Plex conventions
5. **Scan**: Trigger library update
6. **Metadata**: Automatic agent matching

### Manual Override Process
```bash
# Move content to specific library
mv "/staging-pool/downloads/movie.mkv" "/media-pool/plex/Movies/Movie.Name.2024.1080p.mkv"

# Force specific library scan
curl "http://192.168.0.99:32400/library/sections/1/refresh?X-Plex-Token=TOKEN"
```

## Troubleshooting Patterns

### Common Issues & Solutions
1. **Missing Content**: Check file permissions (should be 755/644)
2. **Wrong Metadata**: Fix naming convention, force rematch
3. **Duplicate Items**: Clean bundles, optimize database
4. **Slow Scanning**: Disable video preview generation

### Performance Optimizations
- Disabled thumbnail generation during scan
- Set scanner to use 4 threads
- Configured direct play for local network
- Enabled hardware acceleration when GPU available

## Future Enhancements
- Implement Sonarr/Radarr for automated acquisition
- Add Bazarr for subtitle management
- Configure Tautulli for viewing statistics
- Set up Overseerr for request management

---
*Knowledge transferred from Plex-Server-Reconfig disposable agent*
*Last Updated: 2025-08-25*