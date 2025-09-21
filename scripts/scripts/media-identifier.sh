#!/bin/bash

# Advanced Media File Identifier and Organizer
# Extracts metadata from recovered media files and attempts intelligent naming

# Configuration
SOURCE_DIR="${1:-/staging-pool/recovered-media}"
OUTPUT_DIR="${2:-/media-pool/media/organized}"
LOG_FILE="/var/log/media-organization.log"
TMDB_API_KEY=""  # Future: Add TMDb API key for enhanced matching

# Create output directories
mkdir -p "$OUTPUT_DIR"/{Movies,TV-Shows,Music,Other}
mkdir -p "$(dirname "$LOG_FILE")"

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to extract metadata using mediainfo
get_media_info() {
    local file="$1"
    local info_json=$(mediainfo --Output=JSON "$file" 2>/dev/null)
    
    # Extract key information
    local title=$(echo "$info_json" | jq -r '.media.track[0].Title // empty' 2>/dev/null)
    local duration=$(echo "$info_json" | jq -r '.media.track[0].Duration // empty' 2>/dev/null)
    local format=$(echo "$info_json" | jq -r '.media.track[0].Format // empty' 2>/dev/null)
    local file_size=$(echo "$info_json" | jq -r '.media.track[0].FileSize // empty' 2>/dev/null)
    local width=$(echo "$info_json" | jq -r '.media.track[1].Width // empty' 2>/dev/null)
    local height=$(echo "$info_json" | jq -r '.media.track[1].Height // empty' 2>/dev/null)
    
    # Return as JSON
    jq -n \
        --arg title "$title" \
        --arg duration "$duration" \
        --arg format "$format" \
        --arg file_size "$file_size" \
        --arg width "$width" \
        --arg height "$height" \
        '{title: $title, duration: $duration, format: $format, file_size: $file_size, width: $width, height: $height}'
}

# Function to determine file type based on characteristics
classify_media() {
    local file="$1"
    local info="$2"
    
    local duration=$(echo "$info" | jq -r '.duration // "0"' | sed 's/[^0-9.]//g')
    local width=$(echo "$info" | jq -r '.width // "0"' | sed 's/[^0-9]//g')
    local height=$(echo "$info" | jq -r '.height // "0"' | sed 's/[^0-9]//g')
    local file_size=$(echo "$info" | jq -r '.file_size // "0"' | sed 's/[^0-9]//g')
    
    # Convert duration to minutes (assuming it's in milliseconds)
    if [[ "$duration" =~ ^[0-9]+$ ]] && [ "$duration" -gt 0 ]; then
        duration_min=$((duration / 60000))
    else
        duration_min=0
    fi
    
    # Classification logic
    if [[ "$file" =~ \.(mp3|flac|wav|aac|m4a)$ ]]; then
        echo "Music"
    elif [ "$duration_min" -gt 60 ] && [ "$width" -gt 1000 ]; then
        echo "Movies"
    elif [ "$duration_min" -gt 15 ] && [ "$duration_min" -lt 90 ] && [ "$width" -gt 640 ]; then
        echo "TV-Shows"
    elif [[ "$file" =~ \.(mp4|mkv|avi|mov|wmv)$ ]] && [ "$file_size" -gt 100000000 ]; then
        echo "Movies"  # Large video file, assume movie
    else
        echo "Other"
    fi
}

# Function to generate smart filename
generate_filename() {
    local original_file="$1"
    local info="$2"
    local category="$3"
    
    local title=$(echo "$info" | jq -r '.title // empty')
    local basename=$(basename "$original_file" | sed 's/\.[^.]*$//')  # Remove extension
    local extension="${original_file##*.}"
    
    # Clean up title if it exists
    if [ -n "$title" ] && [ "$title" != "null" ] && [ "$title" != "" ]; then
        # Clean title: remove special chars, normalize spaces
        clean_title=$(echo "$title" | sed 's/[^a-zA-Z0-9 .-]//g' | sed 's/  */ /g' | sed 's/^ *//;s/ *$//')
        if [ ${#clean_title} -gt 3 ]; then
            echo "${clean_title}.${extension}"
            return
        fi
    fi
    
    # Fallback: try to extract meaningful info from filename
    if [[ "$basename" =~ [0-9]{4} ]]; then
        # Contains year, might be movie
        clean_name=$(echo "$basename" | sed 's/[^a-zA-Z0-9 .-]/ /g' | sed 's/  */ /g')
        echo "${clean_name}.${extension}"
    else
        # Use original with cleaned name
        clean_name=$(echo "$basename" | sed 's/[^a-zA-Z0-9 .-]/ /g' | sed 's/  */ /g')
        echo "${clean_name}.${extension}"
    fi
}

# Function to process a single file
process_file() {
    local file="$1"
    local filename=$(basename "$file")
    
    log_message "Processing: $filename"
    
    # Skip very small files (likely thumbnails or corrupted)
    local size=$(stat -c%s "$file" 2>/dev/null || echo 0)
    if [ "$size" -lt 10485760 ]; then  # Less than 10MB
        log_message "  Skipped: File too small ($size bytes)"
        return
    fi
    
    # Get media information
    local info=$(get_media_info "$file")
    if [ -z "$info" ]; then
        log_message "  Error: Could not extract media info"
        return
    fi
    
    # Classify the media
    local category=$(classify_media "$file" "$info")
    log_message "  Category: $category"
    
    # Generate appropriate filename
    local new_filename=$(generate_filename "$file" "$info" "$category")
    log_message "  New name: $new_filename"
    
    # Create target path
    local target_dir="$OUTPUT_DIR/$category"
    local target_path="$target_dir/$new_filename"
    
    # Handle duplicate names
    local counter=1
    while [ -e "$target_path" ]; do
        local base="${new_filename%.*}"
        local ext="${new_filename##*.}"
        target_path="$target_dir/${base}_${counter}.${ext}"
        counter=$((counter + 1))
    done
    
    # Copy the file
    if cp "$file" "$target_path"; then
        log_message "  Success: Copied to $target_path"
        
        # Set proper permissions
        chmod 644 "$target_path"
        
        # Log metadata for reference
        echo "$info" | jq --arg original "$file" --arg target "$target_path" \
            '. + {original_file: $original, target_file: $target}' \
            >> "/var/log/media-metadata.json"
    else
        log_message "  Error: Failed to copy file"
    fi
}

# Main processing function
main() {
    log_message "=== Media Organization Started ==="
    log_message "Source: $SOURCE_DIR"
    log_message "Output: $OUTPUT_DIR"
    
    if [ ! -d "$SOURCE_DIR" ]; then
        log_message "Error: Source directory does not exist: $SOURCE_DIR"
        exit 1
    fi
    
    # Find all media files
    local file_count=0
    while IFS= read -r -d '' file; do
        if [[ "$file" =~ \.(mp4|mkv|avi|mov|wmv|mp3|flac|wav|aac|m4a)$ ]]; then
            process_file "$file"
            file_count=$((file_count + 1))
        fi
    done < <(find "$SOURCE_DIR" -type f -print0)
    
    log_message "=== Processing Complete: $file_count files processed ==="
    
    # Generate summary report
    generate_summary_report
}

# Function to generate summary report
generate_summary_report() {
    local report_file="$OUTPUT_DIR/organization-report.txt"
    
    {
        echo "=== MEDIA ORGANIZATION REPORT ==="
        echo "Date: $(date)"
        echo "Source: $SOURCE_DIR"
        echo "Output: $OUTPUT_DIR"
        echo ""
        
        for category in Movies TV-Shows Music Other; do
            local count=$(find "$OUTPUT_DIR/$category" -type f 2>/dev/null | wc -l)
            local size=$(du -sh "$OUTPUT_DIR/$category" 2>/dev/null | cut -f1)
            echo "$category: $count files, $size"
        done
        
        echo ""
        echo "=== NEXT STEPS ==="
        echo "1. Review organized files in $OUTPUT_DIR"
        echo "2. Manually rename any incorrectly classified files"
        echo "3. Add organized directories to Plex library"
        echo "4. Let Plex agent identify and match content"
        
    } | tee "$report_file"
    
    log_message "Summary report generated: $report_file"
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi