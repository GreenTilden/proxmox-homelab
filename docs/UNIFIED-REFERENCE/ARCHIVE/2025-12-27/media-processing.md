# Media Processing Workflow

**Purpose**: Standardized procedures for media file processing, organization, and integration with Plex Media Server.

## Overview

This workflow transforms raw media files into an organized, Plex-compatible library structure with intelligent classification, metadata extraction, and quality validation.

## Workflow Components

### 1. Media Identification and Classification

#### File Classification Logic
```bash
# Movies
- Duration > 60 minutes
- Resolution > 1000px width  
- File size > 100MB
- Formats: mp4, mkv, avi, mov, wmv

# TV Shows  
- Duration 15-90 minutes
- Resolution > 640px width
- Episode-like characteristics in metadata

# Music
- Audio formats: mp3, flac, wav, aac, m4a
- Any duration acceptable

# Filter Out
- Files < 10MB (thumbnails, corrupted fragments)
- Invalid/corrupted media files
```

#### Metadata Extraction Tools
- **MediaInfo**: Primary metadata extraction (`mediainfo --version` to verify)
- **FFprobe**: Secondary validation and detailed analysis
- **ExifTool**: Image metadata and embedded information

### 2. Automated Organization Workflow

#### Directory Structure Creation
```bash
# Plex-compatible organization
/media-pool/media/organized/
├── Movies/
│   ├── Avatar (2009).mp4
│   └── Inception (2010).mkv
├── TV-Shows/  
│   ├── Breaking Bad S01E01.mp4
│   └── The Office S02E05.mkv
├── Music/
│   ├── Artist - Song Title.mp3
│   └── Album - Track Name.flac
└── Other/
    └── Unknown Format.file
```

#### Processing Scripts
```bash
# Primary workflow script
/usr/local/bin/media-identifier.sh /source/directory /target/directory

# Test organization system
/usr/local/bin/test-media-organization.sh

# Complete end-to-end processing
/usr/local/bin/recovery-workflow.sh /source/device
```

### 3. Quality Validation Process

#### File Integrity Checks
```bash
# Verify media file playability
ffprobe -v error -show_format -show_streams "$file"

# Check for corruption indicators
mediainfo --Output=XML "$file" | grep -i error

# Validate file size vs expected content
stat -c%s "$file" | numfmt --to=iec-i
```

#### Metadata Validation
```bash
# Extract and validate embedded metadata
mediainfo "$file" --Inform="General;%Title%|%Duration%|%FileSize%"

# Check for embedded thumbnails and artwork  
ffprobe -v quiet -select_streams v:0 -show_entries stream=codec_name "$file"

# EXIF data preservation (for personal photos)
exiftool -j "$file" | jq '.[] | {FileName, CreateDate, ImageWidth, ImageHeight}'
```

### 4. Plex Integration Workflow

#### Library Preparation
```bash
# Create Plex library directories with proper permissions
mkdir -p /media-pool/plex/{movies,tv,music}
chown -R 1000:1000 /media-pool/plex/
chmod -R 755 /media-pool/plex/
```

#### Plex Scanner Integration
```bash
# Trigger Plex library scan after organization
curl -X POST "http://192.168.0.99:32400/library/sections/1/refresh?X-Plex-Token=$PLEX_TOKEN"

# Monitor scan progress
curl "http://192.168.0.99:32400/library/sections?X-Plex-Token=$PLEX_TOKEN" | jq '.MediaContainer.Directory[]'
```

## Processing Timeline & Performance

### Expected Processing Times
| Phase | Duration | Description |
|-------|----------|-------------|
| **File Analysis** | 2-6 hours | Metadata extraction and classification |
| **Organization** | 1-3 hours | Directory creation and file movement |
| **Quality Validation** | 2-4 hours | Integrity checks and validation |
| **Plex Integration** | 1-2 hours | Library scan and metadata matching |

### Success Rates
- **Automatic Classification**: 80-85% accuracy
- **Metadata Extraction**: 95% success for valid files
- **Plex Recognition**: 90%+ for properly organized content
- **Quality Validation**: 100% corruption detection

## Storage Workflow Integration

### ZFS Pool Utilization
```bash
# Staging area for processing
/staging-pool/processing/  (675GB available)

# Final organized storage  
/media-pool/media/  (8.8TB available)

# Working space for temporary operations
/staging-pool/temp/
```

### File Movement Patterns
```bash
# Stage 1: Initial processing in staging pool
cp "$source_file" /staging-pool/processing/

# Stage 2: Analysis and classification
./scripts/analyze-media.sh /staging-pool/processing/

# Stage 3: Move to final location with organization
mv /staging-pool/processing/organized/* /media-pool/plex/

# Stage 4: Cleanup staging area
rm -rf /staging-pool/processing/temp/*
```

## Advanced Processing Features

### Duplicate Detection
```bash
# Find duplicate files across processing stages
fdupes -r /media-pool/plex/ > duplicates.txt

# Smart duplicate handling based on quality
./scripts/smart-duplicate-handler.sh duplicates.txt
```

### Subtitle Integration  
```bash
# Extract embedded subtitles
ffmpeg -i "$video_file" -map 0:s:0 "$subtitle_file.srt"

# Download external subtitles
# Integration with OpenSubtitles API for automatic subtitle retrieval

# Sync timing corrections
ffmpeg -i "$subtitle_file" -itsoffset 2.5 "$corrected_subtitle_file"
```

### Format Optimization
```bash
# Standardize video encoding for Plex compatibility
ffmpeg -i "$input_file" -c:v libx264 -c:a aac "$output_file"

# Optimize for streaming (fast start)
ffmpeg -i "$input_file" -movflags +faststart "$optimized_file"
```

## Monitoring and Logging

### Processing Logs
- `/var/log/media-organization.log` - File classification and organization
- `/var/log/media-metadata.json` - Extracted metadata for reference
- `/var/log/media-processing.log` - Overall workflow status
- `/var/log/plex-integration.log` - Plex library integration results

### Real-Time Monitoring
```bash
# Watch processing progress
tail -f /var/log/media-processing.log

# Monitor system resources during processing
watch -n 60 'df -h /staging-pool /media-pool && top -bn1 | head -5'

# Check Plex library scan status
watch -n 30 'curl -s "http://192.168.0.99:32400/status/sessions" | jq .'
```

## Error Handling and Recovery

### Common Issues and Solutions

#### Insufficient Storage Space
```bash
# Monitor available space during processing
df -h /staging-pool /media-pool

# Clean up temporary files if space runs low
find /staging-pool/temp/ -mtime +1 -delete

# Move processed files to free up staging space
rsync --remove-source-files -av /staging-pool/processed/ /media-pool/plex/
```

#### Metadata Extraction Failures
```bash
# Test MediaInfo functionality
mediainfo --version && mediainfo /path/to/test/file

# Fallback to FFprobe for difficult files
ffprobe -v quiet -show_format -show_streams "$file" -of json

# Manual metadata entry for failed extractions
echo "$file|UNKNOWN|$size|$date" >> /var/log/manual-metadata.txt
```

#### Plex Integration Issues  
```bash
# Verify Plex server accessibility
curl -I http://192.168.0.99:32400/web/index.html

# Check Plex permissions on media directories  
ls -la /media-pool/plex/

# Force Plex library refresh
curl -X POST "http://192.168.0.99:32400/library/sections/all/refresh"
```

## Quality Assurance Procedures

### Pre-Processing Validation
1. **Source File Integrity**: Verify files are not corrupted before processing
2. **Available Space**: Ensure adequate storage in staging and destination pools
3. **Service Dependencies**: Confirm MediaInfo, FFmpeg, and Plex are operational

### Post-Processing Verification
1. **File Organization**: Verify proper directory structure and naming
2. **Metadata Preservation**: Confirm critical metadata retained during processing
3. **Plex Integration**: Test media playback and metadata display in Plex
4. **Cleanup Completion**: Ensure temporary files removed and staging cleaned

### Success Metrics
- **Processing Speed**: Files per hour processed
- **Classification Accuracy**: Percentage correctly categorized
- **Error Rate**: Failed processing attempts per batch
- **Plex Integration**: Successful library additions

This workflow ensures consistent, automated processing of media files from any source into a well-organized, Plex-compatible media library.