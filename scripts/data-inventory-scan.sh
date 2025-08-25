#!/bin/bash
#
# Data Inventory Scanner - Post ZFS Recovery
# Safely examines drives without writing to identify data types
# 
# CRITICAL: This script is READ-ONLY and will not modify any data
#

set -euo pipefail

# Configuration
SCAN_DATE=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_DIR="/tmp/data-inventory-${SCAN_DATE}"
MAX_SAMPLES=100  # Limit file samples per drive to avoid overwhelming output

# Drives to examine (ZFS partition 3 on each)
declare -A DRIVES=(
    ["sda3"]="1.8T Storage Drive"
    ["sdb3"]="3.6T Media Drive (Plex)"  
    ["sdc3"]="698G Games Drive"
    ["sdd3"]="223G SSD Drive"
)

# File type signatures for identification
declare -A FILE_SIGNATURES=(
    ["video"]="mp4|mkv|avi|mov|wmv|flv|webm|m4v"
    ["audio"]="mp3|flac|wav|aac|ogg|m4a|wma"
    ["images"]="jpg|jpeg|png|gif|bmp|tiff|webp|raw"
    ["documents"]="pdf|doc|docx|txt|rtf|odt|xlsx|pptx"
    ["archives"]="zip|rar|7z|tar|gz|bz2|xz"
    ["games"]="exe|msi|steam|pak|wad|rom|iso"
    ["code"]="py|js|html|css|php|java|cpp|c|go|rs"
    ["configs"]="conf|cfg|ini|xml|json|yaml|yml"
)

# Initialize report directory
mkdir -p "${REPORT_DIR}"
echo "Data Inventory Scan - ${SCAN_DATE}" > "${REPORT_DIR}/summary.txt"
echo "=======================================" >> "${REPORT_DIR}/summary.txt"

log() {
    echo "[$(date '+%H:%M:%S')] $1" | tee -a "${REPORT_DIR}/scan.log"
}

# Function to safely examine a drive
examine_drive() {
    local device="$1"
    local description="$2"
    local output_file="${REPORT_DIR}/${device}_analysis.txt"
    
    log "Starting examination of /dev/${device} (${description})"
    
    echo "Drive Analysis: /dev/${device}" > "${output_file}"
    echo "Description: ${description}" >> "${output_file}"
    echo "Scan Date: ${SCAN_DATE}" >> "${output_file}"
    echo "=================================" >> "${output_file}"
    
    # Basic drive information
    echo "" >> "${output_file}"
    echo "DRIVE INFORMATION:" >> "${output_file}"
    echo "-----------------" >> "${output_file}"
    
    # Drive size and partitions
    lsblk "/dev/${device%3}" 2>/dev/null >> "${output_file}" || echo "Could not read drive info" >> "${output_file}"
    
    echo "" >> "${output_file}"
    echo "PARTITION INFORMATION:" >> "${output_file}"
    echo "---------------------" >> "${output_file}"
    
    # Partition details
    fdisk -l "/dev/${device%3}" 2>/dev/null | grep -A 10 "Device\|Disk" >> "${output_file}" || echo "Could not read partition info" >> "${output_file}"
    
    echo "" >> "${output_file}"
    echo "FILE SYSTEM ANALYSIS:" >> "${output_file}"
    echo "--------------------" >> "${output_file}"
    
    # Check for any remaining filesystem signatures
    file -s "/dev/${device}" >> "${output_file}" 2>/dev/null || echo "Could not identify filesystem" >> "${output_file}"
    
    echo "" >> "${output_file}"
    echo "RAW DATA SAMPLING:" >> "${output_file}"
    echo "-----------------" >> "${output_file}"
    
    # Sample data from different areas of the drive
    # Beginning of partition (skip first 1MB to avoid any remaining metadata)
    echo "Sample from beginning (offset 1MB):" >> "${output_file}"
    dd if="/dev/${device}" bs=1M skip=1 count=1 2>/dev/null | strings | head -20 >> "${output_file}" 2>/dev/null || echo "Could not read beginning" >> "${output_file}"
    
    echo "" >> "${output_file}"
    echo "Sample from middle:" >> "${output_file}"
    local middle_offset=$(($(blockdev --getsize64 "/dev/${device}") / 2 / 1024 / 1024))
    dd if="/dev/${device}" bs=1M skip=${middle_offset} count=1 2>/dev/null | strings | head -20 >> "${output_file}" 2>/dev/null || echo "Could not read middle" >> "${output_file}"
    
    echo "" >> "${output_file}"
    echo "FILE TYPE ANALYSIS:" >> "${output_file}"
    echo "------------------" >> "${output_file}"
    
    # Use foremost to identify file types without extracting
    log "Running file type analysis on /dev/${device}..."
    foremost -T -i "/dev/${device}" -o "${REPORT_DIR}/${device}_foremost" 2>/dev/null || log "Foremost analysis failed for ${device}"
    
    if [ -f "${REPORT_DIR}/${device}_foremost/audit.txt" ]; then
        echo "Foremost Analysis Results:" >> "${output_file}"
        cat "${REPORT_DIR}/${device}_foremost/audit.txt" >> "${output_file}"
    fi
    
    echo "" >> "${output_file}"
    echo "STRING ANALYSIS (Common Patterns):" >> "${output_file}"
    echo "--------------------------------" >> "${output_file}"
    
    # Look for common file headers and patterns
    log "Scanning for common file patterns on /dev/${device}..."
    
    # Video file patterns
    echo "Video files detected:" >> "${output_file}"
    strings "/dev/${device}" | grep -i -E "\.(mp4|mkv|avi|mov)" | head -10 >> "${output_file}" 2>/dev/null || echo "None found" >> "${output_file}"
    
    # Audio file patterns  
    echo "Audio files detected:" >> "${output_file}"
    strings "/dev/${device}" | grep -i -E "\.(mp3|flac|wav)" | head -10 >> "${output_file}" 2>/dev/null || echo "None found" >> "${output_file}"
    
    # Document patterns
    echo "Document files detected:" >> "${output_file}"
    strings "/dev/${device}" | grep -i -E "\.(pdf|doc|txt)" | head -10 >> "${output_file}" 2>/dev/null || echo "None found" >> "${output_file}"
    
    # Game-related patterns (for sdc specifically)
    if [[ "${device}" == "sdc3" ]]; then
        echo "Game-related files detected:" >> "${output_file}"
        strings "/dev/${device}" | grep -i -E "(steam|game|\.exe|\.pak)" | head -10 >> "${output_file}" 2>/dev/null || echo "None found" >> "${output_file}"
    fi
    
    # Plex-related patterns (for sdb specifically)
    if [[ "${device}" == "sdb3" ]]; then
        echo "Plex-related files detected:" >> "${output_file}"
        strings "/dev/${device}" | grep -i -E "(plex|media|movies|tv|shows)" | head -10 >> "${output_file}" 2>/dev/null || echo "None found" >> "${output_file}"
    fi
    
    log "Completed examination of /dev/${device}"
}

# Function to generate summary report
generate_summary() {
    local summary_file="${REPORT_DIR}/INVENTORY_SUMMARY.md"
    
    log "Generating comprehensive summary report..."
    
    cat > "${summary_file}" << 'EOF'
# Data Recovery Inventory Report

## Scan Information
- **Date**: SCAN_DATE_PLACEHOLDER
- **Purpose**: Assess data types on drives after ZFS signature loss
- **Method**: Read-only analysis using strings, foremost, and sampling
- **Status**: Post-incident inventory for recovery planning

## Drive Analysis Summary

### /dev/sda3 (1.8T Storage Drive)
**Expected Content**: General storage, documents, backups
**Priority**: Medium - Mixed content storage

**Findings**:
EOF

    # Replace placeholder
    sed -i "s/SCAN_DATE_PLACEHOLDER/${SCAN_DATE}/g" "${summary_file}"
    
    # Add findings from each drive analysis
    for device in "${!DRIVES[@]}"; do
        echo "" >> "${summary_file}"
        echo "### Analysis of ${device} (${DRIVES[$device]})" >> "${summary_file}"
        
        if [ -f "${REPORT_DIR}/${device}_analysis.txt" ]; then
            echo "**Status**: Completed" >> "${summary_file}"
            
            # Extract key findings
            if [ -f "${REPORT_DIR}/${device}_foremost/audit.txt" ]; then
                echo "**File Types Detected**:" >> "${summary_file}"
                grep -E "FILES EXTRACTED|jpg|gif|png|pdf|zip|avi|mov|mp4" "${REPORT_DIR}/${device}_foremost/audit.txt" | head -5 >> "${summary_file}" 2>/dev/null || echo "No specific types detected" >> "${summary_file}"
            fi
        else
            echo "**Status**: Analysis failed or incomplete" >> "${summary_file}"
        fi
    done
    
    cat >> "${summary_file}" << 'EOF'

## Recovery Recommendations

### Priority 1: /dev/sdb3 (3.6T - Plex Media)
- **Action**: Full file carving with photorec
- **Target**: Video files (MP4, MKV, AVI), audio files
- **Tools**: `photorec /dev/sdb3` with video/audio focus

### Priority 2: /dev/sdd3 (223G - SSD)
- **Action**: Comprehensive file recovery
- **Target**: Documents, configurations, recent files
- **Tools**: photorec + testdisk for maximum recovery

### Priority 3: /dev/sdc3 (698G - Games)
- **Action**: Selective recovery based on findings
- **Target**: Game saves, personal data mixed with games
- **Tools**: photorec with document/archive focus

### Priority 4: /dev/sda3 (1.8T - Storage)
- **Action**: General file recovery
- **Target**: Documents, backups, miscellaneous files
- **Tools**: photorec comprehensive scan

## Next Steps
1. **Create full disk images** before any recovery attempts
2. **Start with Priority 1** (Plex media) as highest value
3. **Use cloned images** for all recovery operations
4. **Verify recovered files** before considering drives for reformatting

## Critical Notes
- **NO WRITES** to original drives until recovery complete
- **Work from clones** to preserve original data
- **Test recovered files** before trusting recovery success
EOF

    log "Summary report generated: ${summary_file}"
}

# Main execution
main() {
    log "Starting comprehensive data inventory scan"
    log "Report directory: ${REPORT_DIR}"
    
    # Ensure we're running as root for raw device access
    if [[ $EUID -ne 0 ]]; then
        echo "This script must be run as root for raw device access"
        exit 1
    fi
    
    # Check all drives exist
    for device in "${!DRIVES[@]}"; do
        if [[ ! -b "/dev/${device}" ]]; then
            log "ERROR: Device /dev/${device} not found"
            exit 1
        fi
    done
    
    # Examine each drive
    for device in "${!DRIVES[@]}"; do
        examine_drive "${device}" "${DRIVES[$device]}"
        sleep 2  # Brief pause between drives
    done
    
    # Generate summary
    generate_summary
    
    log "Data inventory scan completed"
    log "Reports available in: ${REPORT_DIR}"
    log "Summary report: ${REPORT_DIR}/INVENTORY_SUMMARY.md"
    
    echo ""
    echo "SCAN COMPLETE"
    echo "============="
    echo "Reports: ${REPORT_DIR}"
    echo "Summary: ${REPORT_DIR}/INVENTORY_SUMMARY.md"
    echo ""
    echo "Next: Review findings and plan recovery strategy"
}

# Run main function
main "$@"