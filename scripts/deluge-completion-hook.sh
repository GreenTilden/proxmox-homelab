#!/bin/bash
# Deluge Completion Hook
# Automatically process completed torrents for Plex integration
# Usage: Run this script when torrents complete in Deluge

# Configuration
MEDIA_PROCESSOR="/usr/local/bin/media-processor.py"
LOG_FILE="/service-pool/deluge-completion.log"
LOCK_FILE="/tmp/media-processing.lock"

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Check if processing is already running
if [ -f "$LOCK_FILE" ]; then
    log_message "Media processing already in progress, skipping..."
    exit 0
fi

# Create lock file
touch "$LOCK_FILE"
trap "rm -f $LOCK_FILE" EXIT

log_message "Starting automatic media processing..."

# Process all completed downloads
python3 "$MEDIA_PROCESSOR" >> "$LOG_FILE" 2>&1

if [ $? -eq 0 ]; then
    log_message "Media processing completed successfully"
else
    log_message "Media processing failed with exit code $?"
fi

# Trigger Plex library refresh
curl -X POST "http://localhost:32400/library/sections/all/refresh" &>/dev/null || true

log_message "Processing cycle finished"