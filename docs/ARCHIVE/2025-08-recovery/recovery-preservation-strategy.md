# Recovery Data Preservation Strategy

## Overview
Comprehensive preservation of all recovered data from the corrupted 3.6TB Plex drive with multiple access layers for future analysis.

## Storage Architecture

### Original Carved Files - `/media-pool/carved-originals/` (ZFS Dataset)
**Purpose**: Permanent archive of raw carved files exactly as recovered
**Content**: 
- `audit.txt` - Foremost recovery log (1,247 JPG files cataloged)
- `jpg/` - 1,247 original carved JPEG files (123MB)
- `mp4/` - Empty (no video files recovered)

**Access**: Read-only preservation, ZFS snapshots for immutability
**Benefits**:
- Preserves original file headers and metadata
- Enables future analysis with different tools
- Maintains forensic integrity of recovered data

### Organized Media - `/media-pool/media/final-recovery/` 
**Purpose**: Categorized and analyzed copies for practical use
**Structure**:
- `Thumbnails/` - Small images <100KB (majority of recovered files)
- `Photos/` - Personal photos with EXIF data >500KB
- `Plex-Metadata/` - Movie/TV posters and artwork 100KB-500KB
- `Movies/`, `TV-Shows/`, `Music/`, `Unknown/` - Other media types

### Processing Metadata - `/var/log/recovered-media-metadata.json`
**Purpose**: Detailed tracking of all file processing decisions
**Contains**:
- Original file paths and new organized locations
- File integrity status (VALID/CORRUPTED/UNCHECKED)  
- Metadata extracted (dimensions, EXIF data, format)
- Processing timestamps and categorization logic

## Recovery Statistics
- **Source Image**: 238GB ZFS drive image (`sdg3-zfs.img`)
- **Files Recovered**: 1,247 JPEG images
- **Total Size**: 123MB (0.003% of original drive)
- **File Distribution**: 
  - Thumbnails: ~1,100 files (<100KB each)
  - Medium images: ~140 files (100KB-500KB)  
  - Large photos: ~7 files (>500KB)

## Future Analysis Capabilities

### With Original Carved Files Preserved:
1. **Alternative Recovery Tools**: TestDisk, R-Studio, UFS Explorer
2. **Specialized Image Analysis**: Extract embedded thumbnails, analyze EXIF trails
3. **Forensic Investigation**: File carving with different block sizes
4. **Metadata Mining**: Search for filename patterns indicating original media

### With Organized Structure:
1. **Plex Reconstruction**: Use metadata images to identify lost content
2. **Personal Photo Recovery**: Extract and enhance personal memories
3. **Collection Analysis**: Understand viewing habits and preferences

## ZFS Protection Strategy
```bash
# Create read-only snapshots of preserved data
zfs snapshot media-pool/carved-originals@recovery-complete-$(date +%Y%m%d)
zfs set readonly=on media-pool/carved-originals

# Enable compression for metadata
zfs set compression=lz4 media-pool/carved-originals
```

## Access Patterns
- **Daily Use**: Organized media in `/media-pool/media/final-recovery/`
- **Analysis**: Original carved files in `/media-pool/carved-originals/`
- **Research**: Processing logs and metadata JSON files
- **Backup**: All datasets included in standard ZFS replication

This strategy ensures we can revisit the recovery with new tools or approaches while providing immediate access to usable content.