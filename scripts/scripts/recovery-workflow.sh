#!/bin/bash

# Complete Media Recovery Workflow
# Orchestrates the entire process from drive imaging to organized media files

# Configuration
RECOVERY_BASE="/staging-pool/recovery"
IMAGES_DIR="$RECOVERY_BASE/images"
CARVED_DIR="$RECOVERY_BASE/carved"
ORGANIZED_DIR="/media-pool/media/organized"
LOG_DIR="/var/log/recovery"

# Create directories
mkdir -p "$IMAGES_DIR" "$CARVED_DIR" "$ORGANIZED_DIR" "$LOG_DIR"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_step() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1" | tee -a "$LOG_DIR/recovery.log"
}

log_success() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} ✅ $1" | tee -a "$LOG_DIR/recovery.log"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')]${NC} ⚠️  $1" | tee -a "$LOG_DIR/recovery.log"
}

log_error() {
    echo -e "${RED}[$(date '+%H:%M:%S')]${NC} ❌ $1" | tee -a "$LOG_DIR/recovery.log"
}

# Function to check system health before intensive operations
check_system_health() {
    log_step "Checking system health..."
    
    # Check temperature
    local max_temp=$(sensors 2>/dev/null | grep "Core" | grep -o "+[0-9]*\.[0-9]*°C" | tr -d '+°C' | sort -n | tail -1)
    if [ -n "$max_temp" ] && (( $(echo "$max_temp > 75" | bc -l 2>/dev/null || echo "0") )); then
        log_warning "High CPU temperature: ${max_temp}°C"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        [[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
    fi
    
    # Check available space
    local staging_space=$(df "$RECOVERY_BASE" | awk 'NR==2 {print $4}')
    local media_space=$(df "$ORGANIZED_DIR" | awk 'NR==2 {print $4}')
    
    log_step "Available space - Staging: $(( staging_space / 1024 / 1024 ))GB, Media: $(( media_space / 1024 / 1024 ))GB"
    
    # Check ZFS pools
    if ! zpool status >/dev/null 2>&1; then
        log_error "ZFS pools not accessible"
        exit 1
    fi
    
    log_success "System health check passed"
}

# Phase 1: Drive Imaging
create_drive_image() {
    local source_drive="$1"
    local image_file="$IMAGES_DIR/$(basename "$source_drive")-recovery-$(date +%Y%m%d).img"
    local log_file="$LOG_DIR/ddrescue-$(basename "$source_drive").log"
    
    log_step "Creating drive image: $source_drive -> $image_file"
    
    if [ -f "$image_file" ]; then
        log_warning "Image file already exists, skipping drive imaging"
        echo "$image_file"
        return
    fi
    
    # Start ddrescue in background with progress monitoring
    ddrescue -f -n "$source_drive" "$image_file" "$log_file" &
    local ddrescue_pid=$!
    
    # Monitor progress
    while kill -0 "$ddrescue_pid" 2>/dev/null; do
        if [ -f "$log_file" ]; then
            local progress=$(tail -1 "$log_file" 2>/dev/null | grep -o '[0-9]*%' || echo "0%")
            log_step "Drive imaging progress: $progress"
        fi
        sleep 300  # Check every 5 minutes
    done
    
    wait $ddrescue_pid
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        log_success "Drive image created successfully"
    else
        log_error "Drive imaging failed with exit code $exit_code"
        exit 1
    fi
    
    echo "$image_file"
}

# Phase 2: ZFS Recovery Attempt
attempt_zfs_recovery() {
    local image_file="$1"
    local loop_device="/dev/loop10"
    
    log_step "Attempting ZFS pool recovery from image"
    
    # Set up loop device
    if ! losetup "$loop_device" "$image_file"; then
        log_error "Failed to set up loop device"
        return 1
    fi
    
    # Try various ZFS recovery methods
    local pool_name="plex-media-v1"
    local recovery_methods=(
        "zpool import -F -R $ORGANIZED_DIR $pool_name"
        "zpool import -F -R $ORGANIZED_DIR -d /dev/loop10 $pool_name"
        "zpool import -FX -R $ORGANIZED_DIR $pool_name"
    )
    
    for method in "${recovery_methods[@]}"; do
        log_step "Trying: $method"
        if eval "$method" 2>/dev/null; then
            log_success "ZFS pool recovery successful!"
            losetup -d "$loop_device"
            return 0
        fi
    done
    
    # Clean up
    losetup -d "$loop_device"
    log_warning "ZFS pool recovery failed, proceeding to file carving"
    return 1
}

# Phase 3: File Carving
perform_file_carving() {
    local image_file="$1"
    
    log_step "Starting file carving with PhotoRec"
    
    # Create photorec configuration
    cat > "$LOG_DIR/photorec.conf" << EOF
# PhotoRec configuration for media recovery
fileopt,everything,enable
fileopt,mp4,enable
fileopt,mkv,enable
fileopt,avi,enable
fileopt,mov,enable
fileopt,wmv,enable
fileopt,mp3,enable
fileopt,flac,enable
fileopt,jpg,disable
fileopt,png,disable
# Set minimum file size to 10MB to avoid thumbnails
$image_file
$CARVED_DIR
search
quit
EOF
    
    # Run photorec
    log_step "Running PhotoRec (this will take several hours)..."
    if photorec /log "$LOG_DIR/photorec.conf" /cmd "$image_file" "$CARVED_DIR"; then
        log_success "File carving completed"
        
        # Count recovered files
        local file_count=$(find "$CARVED_DIR" -type f | wc -l)
        local total_size=$(du -sh "$CARVED_DIR" | cut -f1)
        log_success "Recovered $file_count files totaling $total_size"
    else
        log_error "File carving failed"
        return 1
    fi
}

# Phase 4: File Organization
organize_recovered_files() {
    local source_dir="$1"
    
    log_step "Organizing recovered media files"
    
    # Run the media identifier script
    if /usr/local/bin/media-identifier.sh "$source_dir" "$ORGANIZED_DIR"; then
        log_success "Media organization completed"
        
        # Generate final report
        {
            echo "=== RECOVERY SUMMARY ==="
            echo "Date: $(date)"
            echo "Recovery completed successfully"
            echo ""
            echo "File counts by category:"
            find "$ORGANIZED_DIR" -mindepth 1 -maxdepth 1 -type d | while read -r dir; do
                local category=$(basename "$dir")
                local count=$(find "$dir" -type f | wc -l)
                local size=$(du -sh "$dir" | cut -f1)
                echo "  $category: $count files ($size)"
            done
            echo ""
            echo "Next steps:"
            echo "1. Review organized files in $ORGANIZED_DIR"
            echo "2. Add directories to Plex library"
            echo "3. Run Plex library scan"
        } | tee "$LOG_DIR/recovery-summary.txt"
        
    else
        log_error "Media organization failed"
        return 1
    fi
}

# Main workflow
main() {
    local source_drive="${1:-/dev/sdf}"
    
    echo "================================================"
    echo "🔧 MEDIA RECOVERY WORKFLOW"
    echo "================================================"
    echo "Source Drive: $source_drive"
    echo "Recovery Base: $RECOVERY_BASE"
    echo "Final Output: $ORGANIZED_DIR"
    echo ""
    
    read -p "Start recovery process? This will take many hours. (y/N): " -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Yy]$ ]] && exit 0
    
    # System health check
    check_system_health
    
    # Phase 1: Create drive image
    log_step "=== PHASE 1: DRIVE IMAGING ==="
    local image_file=$(create_drive_image "$source_drive")
    
    # Phase 2: Try ZFS recovery
    log_step "=== PHASE 2: ZFS RECOVERY ATTEMPT ==="
    if attempt_zfs_recovery "$image_file"; then
        log_success "ZFS recovery successful! Media files restored with original structure."
        organize_recovered_files "$ORGANIZED_DIR"
    else
        # Phase 3: File carving fallback
        log_step "=== PHASE 3: FILE CARVING ==="
        perform_file_carving "$image_file"
        
        # Phase 4: Organization
        log_step "=== PHASE 4: FILE ORGANIZATION ==="
        organize_recovered_files "$CARVED_DIR"
    fi
    
    log_success "=== RECOVERY WORKFLOW COMPLETE ==="
    echo ""
    echo "📊 Check the summary report at: $LOG_DIR/recovery-summary.txt"
    echo "🎬 Organized media files at: $ORGANIZED_DIR"
    echo "📋 Full logs available at: $LOG_DIR/"
    echo ""
    echo "Next steps:"
    echo "1. Add $ORGANIZED_DIR to your Plex library"
    echo "2. Run Plex library scan to identify content"
    echo "3. Review and manually fix any misnamed files"
}

# Show usage if no arguments provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <source_drive>"
    echo "Example: $0 /dev/sdf"
    echo ""
    echo "This script will:"
    echo "1. Create a complete image of the source drive"
    echo "2. Attempt ZFS pool recovery"  
    echo "3. Fall back to file carving if ZFS recovery fails"
    echo "4. Organize recovered files for Plex"
    exit 1
fi

# Run main function
main "$@"