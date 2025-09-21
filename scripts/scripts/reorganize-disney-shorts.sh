#!/bin/bash
# Disney Shorts Reorganization Script
# Moves Disney character shorts from movies to separate library

SOURCE_DIR="/media-pool/movies"
DEST_DIR="/media-pool/disney-shorts"
LOG_FILE="/service-pool/disney-reorganization.log"

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_message "Starting Disney Shorts reorganization..."

# Create destination directory
mkdir -p "$DEST_DIR"

# Disney character patterns to match
DISNEY_PATTERNS=(
    "Mickey"
    "Donald"
    "Pluto" 
    "Goofy"
    "Minnie"
    "Oswald"
    "Chip"
    "Dale"
    "Figaro"
    "Clarabelle"
)

moved_count=0
error_count=0

# Move directories matching Disney patterns
for pattern in "${DISNEY_PATTERNS[@]}"; do
    log_message "Processing pattern: $pattern"
    
    # Find and move matching directories
    find "$SOURCE_DIR" -type d -name "*$pattern*" | while read -r dir; do
        if [ -d "$dir" ]; then
            dirname=$(basename "$dir")
            dest_path="$DEST_DIR/$dirname"
            
            if [ ! -d "$dest_path" ]; then
                log_message "Moving: $dirname"
                if mv "$dir" "$dest_path"; then
                    ((moved_count++))
                else
                    log_message "ERROR: Failed to move $dirname"
                    ((error_count++))
                fi
            else
                log_message "SKIP: $dirname already exists in destination"
            fi
        fi
    done
done

# Also move classic animation years (pre-1960 shorts)
log_message "Processing classic animation years (1920-1959)..."

for year in {1920..1959}; do
    find "$SOURCE_DIR" -type d -name "${year}*" | while read -r dir; do
        if [ -d "$dir" ]; then
            dirname=$(basename "$dir")
            dest_path="$DEST_DIR/$dirname"
            
            # Check if it's actually Disney content (contains Disney characters or classic animation terms)
            if echo "$dirname" | grep -qiE "(Mickey|Donald|Pluto|Goofy|Disney|Animation|Cartoon|Symphony)" ; then
                if [ ! -d "$dest_path" ]; then
                    log_message "Moving classic short: $dirname"
                    if mv "$dir" "$dest_path"; then
                        ((moved_count++))
                    else
                        log_message "ERROR: Failed to move $dirname"
                        ((error_count++))
                    fi
                else
                    log_message "SKIP: $dirname already exists in destination"
                fi
            fi
        fi
    done
done

# Final count
disney_count=$(find "$DEST_DIR" -type d -mindepth 1 | wc -l)
remaining_movies=$(find "$SOURCE_DIR" -type d -mindepth 1 | wc -l)

log_message "Reorganization complete!"
log_message "Disney Shorts moved: $disney_count directories"
log_message "Remaining Movies: $remaining_movies directories" 
log_message "Errors encountered: $error_count"

echo "Disney Shorts: $disney_count"
echo "Movies remaining: $remaining_movies"