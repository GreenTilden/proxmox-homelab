#!/bin/bash

# Enhanced Media File Identifier and Organizer
# Specialized for data recovery scenarios with advanced metadata extraction
# Optimized for Plex media recovery and mixed content analysis

# Configuration
SOURCE_DIR="${1:-/media-pool/recovery/extracted}"
OUTPUT_DIR="${2:-/media-pool/media/recovered-organized}"
LOG_FILE="/var/log/enhanced-media-organization.log"
METADATA_FILE="/var/log/recovered-media-metadata.json"
PROGRESS_FILE="/tmp/media-recovery-progress.txt"

# Create output directories with enhanced categorization
mkdir -p "$OUTPUT_DIR"/{Movies,TV-Shows,Music,Photos,Plex-Metadata,Thumbnails,Unknown}
mkdir -p "$(dirname "$LOG_FILE")"
mkdir -p "$(dirname "$METADATA_FILE")"

# Logging with progress tracking
log_message() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo "$message" | tee -a "$LOG_FILE"
}

log_progress() {
    local current="$1"
    local total="$2"
    local file="$3"
    local percent=$((current * 100 / total))
    echo "Progress: $current/$total ($percent%) - Processing: $(basename "$file")" | tee "$PROGRESS_FILE"
    log_message "[$current/$total] $file"
}

# Enhanced metadata extraction for images and videos
get_enhanced_media_info() {
    local file="$1"
    local file_size=$(stat -c%s "$file" 2>/dev/null || echo 0)
    local file_ext="${file##*.}"
    local info_json="{}"
    
    case "${file_ext,,}" in
        jpg|jpeg|png|gif)
            # Image analysis using file command (fallback when ImageMagick not available)
            local file_info=$(file "$file" 2>/dev/null)
            local width height format
            
            # Extract dimensions from file output (when available)
            if [[ "$file_info" =~ ([0-9]+)x([0-9]+) ]]; then
                width=$(echo "$file_info" | sed -n 's/.*\([0-9]\+\)x\([0-9]\+\).*/\1/p')
                height=$(echo "$file_info" | sed -n 's/.*\([0-9]\+\)x\([0-9]\+\).*/\2/p')
            fi
            
            # Extract format
            if [[ "$file_info" =~ JPEG ]]; then
                format="JPEG"
            elif [[ "$file_info" =~ PNG ]]; then
                format="PNG" 
            elif [[ "$file_info" =~ GIF ]]; then
                format="GIF"
            else
                format="$file_ext"
            fi
            
            # Try to extract EXIF data (if exiftool available)
            local exif_info=""
            if command -v exiftool >/dev/null 2>&1; then
                exif_info=$(exiftool -json "$file" 2>/dev/null | jq '.[0]' 2>/dev/null)
            fi
            
            info_json=$(jq -n \
                --arg format "$format" \
                --arg file_size "$file_size" \
                --arg width "${width:-0}" \
                --arg height "${height:-0}" \
                --argjson exif "${exif_info:-null}" \
                '{format: $format, file_size: $file_size, width: $width, height: $height, exif: $exif}')
            ;;
        mp4|mkv|avi|mov|wmv)
            # Video analysis with mediainfo
            if command -v mediainfo >/dev/null 2>&1; then
                local mediainfo_json=$(mediainfo --Output=JSON "$file" 2>/dev/null)
                if [ -n "$mediainfo_json" ]; then
                    info_json="$mediainfo_json"
                else
                    info_json=$(jq -n --arg file_size "$file_size" '{file_size: $file_size}')
                fi
            else
                info_json=$(jq -n --arg file_size "$file_size" '{file_size: $file_size}')
            fi
            ;;
        mp3|flac|wav|aac|m4a)
            # Audio analysis
            info_json=$(jq -n --arg file_size "$file_size" '{file_size: $file_size, type: "audio"}')
            ;;
        *)
            # Generic file info
            info_json=$(jq -n --arg file_size "$file_size" '{file_size: $file_size}')
            ;;
    esac
    
    echo "$info_json"
}

# Enhanced classification with recovery-specific logic
classify_recovered_media() {
    local file="$1"
    local info="$2"
    local filename=$(basename "$file")
    local file_size=$(echo "$info" | jq -r '.file_size // "0"' | sed 's/[^0-9]//g')
    local width=$(echo "$info" | jq -r '.width // "0"' | sed 's/[^0-9]//g')
    local height=$(echo "$info" | jq -r '.height // "0"' | sed 's/[^0-9]//g')
    
    # File size thresholds based on recovery analysis
    local size_kb=$((file_size / 1024))
    
    case "${file##*.}" in
        jpg|jpeg|png|gif)
            # Image classification based on recovery patterns
            if [ "$size_kb" -lt 10 ]; then
                echo "Thumbnails"  # Small images likely thumbnails
            elif [ "$width" -gt 1000 ] && [ "$height" -gt 1000 ] && [ "$size_kb" -gt 500 ]; then
                # Large high-res images with EXIF data
                local has_exif=$(echo "$info" | jq -r '.exif != null')
                if [ "$has_exif" = "true" ]; then
                    echo "Photos"
                else
                    echo "Plex-Metadata"
                fi
            elif [ "$width" -gt 200 ] && [ "$height" -gt 200 ] && [ "$size_kb" -gt 20 ]; then
                echo "Plex-Metadata"  # Medium-sized likely poster/backdrop images
            else
                echo "Thumbnails"
            fi
            ;;
        mp4|mkv|avi|mov|wmv)
            # Video classification
            local duration_ms=$(echo "$info" | jq -r '.media.track[0].Duration // "0"' | sed 's/[^0-9]//g')
            local duration_min=$((duration_ms / 60000))
            
            if [ "$duration_min" -gt 60 ] && [ "$size_kb" -gt 500000 ]; then
                echo "Movies"
            elif [ "$duration_min" -gt 15 ] && [ "$duration_min" -lt 90 ]; then
                echo "TV-Shows"
            elif [ "$size_kb" -gt 100000 ]; then
                echo "Movies"  # Large file, assume movie
            else
                echo "Unknown"
            fi
            ;;
        mp3|flac|wav|aac|m4a)
            echo "Music"
            ;;
        *)
            echo "Unknown"
            ;;
    esac
}

# Enhanced filename generation with metadata extraction
generate_enhanced_filename() {
    local original_file="$1"
    local info="$2"
    local category="$3"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    
    local basename=$(basename "$original_file" | sed 's/\.[^.]*$//')
    local extension="${original_file##*.}"
    
    # Extract title from EXIF or media metadata
    local title=""
    case "$category" in
        Photos)
            # For photos, try to extract date/time from EXIF
            local date_taken=$(echo "$info" | jq -r '.exif.DateTimeOriginal // .exif.CreateDate // empty' 2>/dev/null)
            if [ -n "$date_taken" ]; then
                local clean_date=$(echo "$date_taken" | sed 's/[: ]/_/g' | cut -c1-15)
                title="Photo_${clean_date}"
            else
                title="Photo_${timestamp}"
            fi
            ;;
        Plex-Metadata|Thumbnails)
            # Keep original filename for metadata images but clean it up
            title=$(echo "$basename" | sed 's/[^a-zA-Z0-9._-]/_/g' | sed 's/__*/_/g')
            if [ ${#title} -lt 3 ]; then
                title="${category}_${timestamp}"
            fi
            ;;
        Movies|TV-Shows)
            # Try to extract title from media metadata
            local media_title=$(echo "$info" | jq -r '.media.track[0].Title // empty' 2>/dev/null)
            if [ -n "$media_title" ] && [ ${#media_title} -gt 3 ]; then
                title=$(echo "$media_title" | sed 's/[^a-zA-Z0-9 .-]/_/g' | sed 's/__*/_/g' | sed 's/  */ /g')
            else
                # Fallback to cleaned filename
                title=$(echo "$basename" | sed 's/[^a-zA-Z0-9 .-]/_/g' | sed 's/__*/_/g')
            fi
            ;;
        *)
            title=$(echo "$basename" | sed 's/[^a-zA-Z0-9._-]/_/g' | sed 's/__*/_/g')
            ;;
    esac
    
    echo "${title}.${extension}"
}

# File integrity verification - simplified for systems without ImageMagick
verify_file_integrity() {
    local file="$1"
    local file_size=$(stat -c%s "$file" 2>/dev/null || echo 0)
    
    # Basic integrity checks
    if [ "$file_size" -eq 0 ]; then
        echo "EMPTY"
        return 1
    fi
    
    # Check if file can be read properly using file command
    local file_type=$(file -b "$file" 2>/dev/null)
    
    case "${file##*.}" in
        jpg|jpeg)
            if [[ "$file_type" =~ "JPEG image data" ]]; then
                echo "VALID"
            else
                echo "CORRUPTED"
                return 1
            fi
            ;;
        png)
            if [[ "$file_type" =~ "PNG image data" ]]; then
                echo "VALID"
            else
                echo "CORRUPTED"
                return 1
            fi
            ;;
        gif)
            if [[ "$file_type" =~ "GIF image data" ]]; then
                echo "VALID"
            else
                echo "CORRUPTED"
                return 1
            fi
            ;;
        mp4|mkv|avi|mov|wmv)
            if command -v ffprobe >/dev/null 2>&1; then
                if ffprobe "$file" >/dev/null 2>&1; then
                    echo "VALID"
                else
                    echo "CORRUPTED"
                    return 1
                fi
            else
                # Basic check for video files using file command
                if [[ "$file_type" =~ "video" ]] || [[ "$file_type" =~ "MP4" ]] || [[ "$file_type" =~ "Matroska" ]]; then
                    echo "VALID"
                else
                    echo "UNCHECKED"
                fi
            fi
            ;;
        *)
            echo "UNCHECKED"
            ;;
    esac
    
    return 0
}

# Enhanced file processing with recovery-specific features
process_recovered_file() {
    local file="$1"
    local current="$2"
    local total="$3"
    local filename=$(basename "$file")
    
    log_progress "$current" "$total" "$file"
    
    # Verify file integrity first
    local integrity=$(verify_file_integrity "$file")
    if [ "$integrity" = "EMPTY" ] || [ "$integrity" = "CORRUPTED" ]; then
        log_message "  Skipped: File integrity issue ($integrity)"
        return
    fi
    
    # Get enhanced media information
    local info=$(get_enhanced_media_info "$file")
    if [ -z "$info" ] || [ "$info" = "{}" ]; then
        log_message "  Warning: Limited media info available"
        info=$(jq -n --arg file_size "$(stat -c%s "$file")" '{file_size: $file_size}')
    fi
    
    # Classify the media with enhanced logic
    local category=$(classify_recovered_media "$file" "$info")
    log_message "  Category: $category ($integrity)"
    
    # Generate enhanced filename
    local new_filename=$(generate_enhanced_filename "$file" "$info" "$category")
    log_message "  New name: $new_filename"
    
    # Create target path
    local target_dir="$OUTPUT_DIR/$category"
    local target_path="$target_dir/$new_filename"
    
    # Handle duplicate names with hash-based deduplication
    local counter=1
    while [ -e "$target_path" ]; do
        # Check if it's actually the same file
        if cmp -s "$file" "$target_path"; then
            log_message "  Duplicate: Identical file already exists"
            return
        fi
        
        local base="${new_filename%.*}"
        local ext="${new_filename##*.}"
        target_path="$target_dir/${base}_${counter}.${ext}"
        counter=$((counter + 1))
    done
    
    # Copy the file with preservation of timestamps
    if cp -p "$file" "$target_path"; then
        log_message "  Success: Copied to $target_path"
        
        # Set proper permissions
        chmod 644 "$target_path"
        
        # Log enhanced metadata for reference
        local metadata=$(echo "$info" | jq \
            --arg original "$file" \
            --arg target "$target_path" \
            --arg category "$category" \
            --arg integrity "$integrity" \
            --arg timestamp "$(date -Iseconds)" \
            '. + {
                original_file: $original, 
                target_file: $target, 
                category: $category,
                integrity: $integrity,
                processed_at: $timestamp
            }')
        echo "$metadata" >> "$METADATA_FILE"
    else
        log_message "  Error: Failed to copy file"
    fi
}

# Progress monitoring function
show_progress() {
    if [ -f "$PROGRESS_FILE" ]; then
        tail -1 "$PROGRESS_FILE"
    fi
}

# Enhanced main processing function
main() {
    log_message "=== Enhanced Media Recovery Organization Started ==="
    log_message "Source: $SOURCE_DIR"
    log_message "Output: $OUTPUT_DIR"
    log_message "Recovery Mode: Enabled with integrity checking"
    
    if [ ! -d "$SOURCE_DIR" ]; then
        log_message "Error: Source directory does not exist: $SOURCE_DIR"
        exit 1
    fi
    
    # Initialize metadata file
    echo '[]' > "$METADATA_FILE"
    
    # Find all files (expanded to include images for recovery)
    log_message "Scanning for recoverable files..."
    local files=()
    while IFS= read -r -d '' file; do
        if [[ "$file" =~ \.(mp4|mkv|avi|mov|wmv|mp3|flac|wav|aac|m4a|jpg|jpeg|png|gif)$ ]]; then
            files+=("$file")
        fi
    done < <(find "$SOURCE_DIR" -type f -print0)
    
    local total_files=${#files[@]}
    log_message "Found $total_files recoverable files"
    
    if [ "$total_files" -eq 0 ]; then
        log_message "No recoverable files found in source directory"
        exit 1
    fi
    
    # Process files with progress tracking
    local current=0
    for file in "${files[@]}"; do
        current=$((current + 1))
        process_recovered_file "$file" "$current" "$total_files"
    done
    
    log_message "=== Recovery Processing Complete: $total_files files processed ==="
    
    # Generate enhanced summary report
    generate_enhanced_summary_report
    
    # Clean up progress file
    rm -f "$PROGRESS_FILE"
}

# Enhanced summary report with recovery statistics
generate_enhanced_summary_report() {
    local report_file="$OUTPUT_DIR/recovery-organization-report.txt"
    local stats_file="$OUTPUT_DIR/recovery-statistics.json"
    
    {
        echo "=== ENHANCED MEDIA RECOVERY REPORT ==="
        echo "Date: $(date)"
        echo "Source: $SOURCE_DIR"
        echo "Output: $OUTPUT_DIR"
        echo "Metadata: $METADATA_FILE"
        echo ""
        echo "=== RECOVERY STATISTICS ==="
        
        local total_files=0
        local total_size=0
        local stats_json="{"
        
        for category in Movies TV-Shows Music Photos Plex-Metadata Thumbnails Unknown; do
            local count=$(find "$OUTPUT_DIR/$category" -type f 2>/dev/null | wc -l)
            local size_bytes=$(find "$OUTPUT_DIR/$category" -type f -exec stat -c%s {} \; 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
            local size_human=$(du -sh "$OUTPUT_DIR/$category" 2>/dev/null | cut -f1 || echo "0")
            
            echo "$category: $count files, $size_human"
            total_files=$((total_files + count))
            total_size=$((total_size + size_bytes))
            
            # Add to JSON stats
            stats_json="$stats_json\"$category\":{\"count\":$count,\"size_bytes\":$size_bytes},"
        done
        
        stats_json="${stats_json%,}}"
        echo "$stats_json" | jq '.' > "$stats_file" 2>/dev/null
        
        echo ""
        echo "TOTAL: $total_files files recovered"
        echo "TOTAL SIZE: $(numfmt --to=iec $total_size)"
        echo ""
        echo "=== FILE INTEGRITY SUMMARY ==="
        
        # Analyze integrity from metadata
        if [ -f "$METADATA_FILE" ] && [ -s "$METADATA_FILE" ]; then
            local valid_count=$(jq -r '.[] | select(.integrity=="VALID") | .target_file' "$METADATA_FILE" 2>/dev/null | wc -l)
            local corrupted_count=$(jq -r '.[] | select(.integrity=="CORRUPTED") | .target_file' "$METADATA_FILE" 2>/dev/null | wc -l)
            local unchecked_count=$(jq -r '.[] | select(.integrity=="UNCHECKED") | .target_file' "$METADATA_FILE" 2>/dev/null | wc -l)
            
            echo "Valid files: $valid_count"
            echo "Corrupted files: $corrupted_count"
            echo "Unchecked files: $unchecked_count"
        fi
        
        echo ""
        echo "=== NEXT STEPS ==="
        echo "1. Review organized files in $OUTPUT_DIR"
        echo "2. Check Photos directory for personal images"
        echo "3. Analyze Plex-Metadata directory for media clues"
        echo "4. Review Thumbnails for additional recovery hints"
        echo "5. Add valid media directories to Plex library"
        echo "6. Run advanced recovery tools on remaining data"
        echo ""
        echo "=== FILES FOR REVIEW ==="
        echo "Full metadata: $METADATA_FILE"
        echo "Statistics: $stats_file"
        echo "Processing log: $LOG_FILE"
        
    } | tee "$report_file"
    
    log_message "Enhanced recovery report generated: $report_file"
    log_message "Statistics saved: $stats_file"
}

# Background progress monitoring
if [ "$1" = "--monitor-progress" ]; then
    while true; do
        show_progress
        sleep 5
    done
    exit 0
fi

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi