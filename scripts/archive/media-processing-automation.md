# Media Processing Automation Templates

## Complete Media Workflow Pipeline

### Phase 1: Content Acquisition (✅ OPERATIONAL)
```bash
# Firefox Container - Secure Browsing
docker run -d --name firefox-container \
  --privileged \
  -p 3001:5800 \
  -v /service-pool/firefox-alt/downloads:/config/downloads \
  jlesage/firefox:latest

# Deluge LXC Container - Torrent Processing  
pct create 110 local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst \
  --hostname deluge-server \
  --memory 2048 \
  --rootfs service-pool:18 \
  --mp0 /staging-pool,mp=/staging-pool \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp
```

### Phase 2: Download Management (✅ ACTIVE)
```bash
# Automated .torrent Processing Script
#!/bin/bash
# /staging-pool/torrent-automation.sh

SOURCE_DIR="/service-pool/firefox-alt/downloads"  
TARGET_DIR="/staging-pool/downloads"
WATCH_DIR="/var/lib/deluge/watch"

# Move .torrent files to Deluge watch folder
find "$SOURCE_DIR" -name "*.torrent" -mtime -1 -exec mv {} "$WATCH_DIR" \;

# Monitor download completion and organize
for file in "$TARGET_DIR"/*.{mp4,mkv,avi}; do
    if [[ -f "$file" ]]; then
        # Extract year and type from filename
        YEAR=$(echo "$file" | grep -oE '(19|20)[0-9]{2}' | head -1)
        
        if [[ "$file" =~ [Ss][0-9]{2}[Ee][0-9]{2} ]]; then
            # TV Show detected
            mkdir -p "/staging-pool/organized/TV Shows/"
            mv "$file" "/staging-pool/organized/TV Shows/"
        else
            # Movie detected  
            mkdir -p "/staging-pool/organized/Movies/$YEAR"
            mv "$file" "/staging-pool/organized/Movies/$YEAR/"
        fi
    fi
done
```

### Phase 3: Media Organization (📋 TEMPLATE)
```bash
# FileBot Integration Template
docker run --rm \
  -v /staging-pool/downloads:/input \
  -v /staging-pool/organized:/output \
  -v /media-pool:/library \
  jlesage/filebot:latest \
  --action move \
  --conflict auto \
  --db TheMovieDB \
  --format "/output/{n} ({y})/{n} ({y})" \
  /input

# Alternative: Custom Organization Script
#!/bin/bash
# /scripts/organize-media.sh

process_tv_show() {
    local file="$1"
    local show_name=$(echo "$file" | sed -E 's/[Ss][0-9]{2}[Ee][0-9]{2}.*//' | sed 's/[._]/ /g')
    local season=$(echo "$file" | grep -oE '[Ss]([0-9]{2})' | grep -oE '[0-9]{2}')
    local episode=$(echo "$file" | grep -oE '[Ee]([0-9]{2})' | grep -oE '[0-9]{2}')
    
    mkdir -p "/media-pool/TV Shows/$show_name/Season $season"
    mv "$file" "/media-pool/TV Shows/$show_name/Season $season/"
}

process_movie() {
    local file="$1" 
    local year=$(echo "$file" | grep -oE '(19|20)[0-9]{2}' | head -1)
    local movie_name=$(echo "$file" | sed -E "s/\.$year.*//" | sed 's/[._]/ /g')
    
    mkdir -p "/media-pool/Movies/$movie_name ($year)"
    mv "$file" "/media-pool/Movies/$movie_name ($year)/"
}
```

### Phase 4: Subtitle Integration (📋 PLANNED)
```bash
# Subtitle Download & Processing
#!/bin/bash
# /scripts/subtitle-processor.sh

# Extract embedded subtitles
extract_embedded_subs() {
    local video_file="$1"
    local base_name=$(basename "$video_file" .mkv)
    local dir_name=$(dirname "$video_file")
    
    ffmpeg -i "$video_file" \
      -map 0:s:0 -c:s subrip "$dir_name/$base_name.srt" \
      2>/dev/null
}

# Download external subtitles
download_external_subs() {
    local video_file="$1"
    local imdb_id="$2"  # Extract from filename or use API
    
    # OpenSubtitles API integration
    subliminal download \
      --provider opensubtitles \
      --language en \
      "$video_file"
}

# Sync subtitle timing
sync_subtitles() {
    local video_file="$1"
    local subtitle_file="$2"
    
    # Auto-sync using audio fingerprinting
    ffsubsync "$video_file" -i "$subtitle_file" -o "${subtitle_file%.srt}.synced.srt"
}
```

### Phase 5: Quality Control (📋 TEMPLATE)
```bash
# Media Quality Verification
#!/bin/bash
# /scripts/quality-control.sh

verify_video_integrity() {
    local file="$1"
    
    # Check file corruption
    ffmpeg -v error -i "$file" -f null - 2>"$file.error.log"
    
    if [[ -s "$file.error.log" ]]; then
        echo "CORRUPTED: $file" >> /staging-pool/quality-report.log
        return 1
    fi
    
    # Check resolution and bitrate
    local resolution=$(ffprobe -v quiet -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$file")
    local bitrate=$(ffprobe -v quiet -select_streams v:0 -show_entries format=bit_rate -of default=noprint_wrappers=1:nokey=1 "$file")
    
    echo "VERIFIED: $file [$resolution @ ${bitrate}bps]" >> /staging-pool/quality-report.log
}

# Duplicate detection
detect_duplicates() {
    find /media-pool -type f -name "*.mkv" -exec md5sum {} + | sort | uniq -w32 -dD
}
```

### Phase 6: Plex Integration (✅ ACTIVE)
```bash
# Plex Library Refresh
trigger_plex_scan() {
    local library_id="$1"  # Get from Plex API
    local plex_token="$2"   # From Plex settings
    
    curl -X GET \
      "http://192.168.0.99:32400/library/sections/$library_id/refresh?X-Plex-Token=$plex_token"
}

# Automatic library update on new content
#!/bin/bash
# /scripts/plex-auto-refresh.sh

# Watch for new files in media pool
inotifywait -m -r -e create --format '%w%f' /media-pool | while read file; do
    if [[ "$file" =~ \.(mkv|mp4|avi)$ ]]; then
        sleep 60  # Allow file write completion
        trigger_plex_scan "1" "$PLEX_TOKEN"  # Movies library
        trigger_plex_scan "2" "$PLEX_TOKEN"  # TV Shows library
    fi
done
```

## Automation Scheduling

### Cron Job Configuration
```bash
# /etc/crontab entries for automated processing

# Torrent file processing (every 30 seconds)
* * * * * root /staging-pool/torrent-automation.sh
* * * * * root sleep 30; /staging-pool/torrent-automation.sh

# Media organization (every hour)
0 * * * * root /scripts/organize-media.sh

# Subtitle processing (daily at 2 AM)
0 2 * * * root /scripts/subtitle-processor.sh

# Quality control (weekly on Sunday at 3 AM)  
0 3 * * 0 root /scripts/quality-control.sh

# Plex library refresh (when needed)
# Triggered by inotify, not cron
```

### Monitoring Integration
```bash
# Grafana metrics for media processing
echo "media_files_processed $PROCESSED_COUNT" | curl -X POST \
  --data-binary @- \
  http://192.168.0.99:9091/metrics/job/media-automation

# Health check endpoint
health_check_endpoint() {
    local status="healthy"
    local errors=0
    
    # Check download space
    local available=$(df /staging-pool | awk 'NR==2 {print $4}')
    if [[ $available -lt 10485760 ]]; then  # Less than 10GB
        status="warning"
        ((errors++))
    fi
    
    # Check Deluge connectivity
    if ! curl -s http://192.168.0.111:8112 > /dev/null; then
        status="critical" 
        ((errors++))
    fi
    
    echo "{\"status\":\"$status\",\"errors\":$errors,\"available_gb\":$((available/1024/1024))}"
}
```

## Configuration Management

### Container Volume Strategy
```yaml
# docker-compose.yml template for media processing stack
version: '3.8'

services:
  firefox:
    image: jlesage/firefox:latest
    container_name: firefox-media
    privileged: true
    ports:
      - "3001:5800"
    volumes:
      - /service-pool/firefox-alt:/config:rw
      - /staging-pool/downloads:/downloads:rw
    restart: unless-stopped
    
  filebot:
    image: jlesage/filebot:latest
    container_name: filebot-processor
    volumes:
      - /staging-pool/downloads:/input:rw
      - /staging-pool/organized:/output:rw
      - /media-pool:/library:rw
      - /service-pool/filebot:/config:rw
    environment:
      - USER_ID=1000
      - GROUP_ID=1000
    restart: "no"  # Run on-demand only
```

### LXC Container Templates
```bash
# Deluge LXC Template
pct create $VMID local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst \
  --hostname deluge-media \
  --memory 2048 \
  --cores 2 \
  --rootfs service-pool:20 \
  --mp0 /staging-pool,mp=/staging-pool \
  --mp1 /media-pool,mp=/media-pool,ro=1 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --nameserver 8.8.8.8 \
  --searchdomain local \
  --features nesting=1 \
  --unprivileged 1 \
  --start 1
```

## Success Metrics & Monitoring

### Key Performance Indicators
- **Download Speed**: Monitor torrent completion rates
- **Processing Time**: Track organization and subtitle sync duration  
- **Storage Efficiency**: Monitor duplicate detection and cleanup
- **Plex Integration**: Library refresh success rate
- **Quality Control**: Corruption detection and resolution verification

### Automated Reporting
```bash
# Daily processing report
generate_daily_report() {
    local date=$(date +%Y-%m-%d)
    local report="/staging-pool/reports/media-report-$date.txt"
    
    echo "Media Processing Report - $date" > "$report"
    echo "=================================" >> "$report"
    echo "Files Downloaded: $(find /staging-pool/downloads -name "*.mkv" -newermt "yesterday" | wc -l)" >> "$report"
    echo "Files Organized: $(find /media-pool -name "*.mkv" -newermt "yesterday" | wc -l)" >> "$report"
    echo "Subtitles Added: $(find /media-pool -name "*.srt" -newermt "yesterday" | wc -l)" >> "$report"
    echo "Storage Used: $(du -sh /media-pool | cut -f1)" >> "$report"
    echo "Available Space: $(df -h /staging-pool | awk 'NR==2 {print $4}')" >> "$report"
}
```

This automation framework provides a complete template for scaling media processing operations while maintaining the successful patterns we've established.