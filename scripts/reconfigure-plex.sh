#!/bin/bash
# Plex Server Reconfiguration Script
# Reclaims Plex server with fresh setup and proper library structure

# Configuration
CLAIM_TOKEN="$1"
PLEX_CONTAINER="plex"
LOG_FILE="/service-pool/plex-reconfiguration.log"

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Validation
if [ -z "$CLAIM_TOKEN" ]; then
    echo "Usage: $0 <claim-token>"
    echo "Get claim token from: https://plex.tv/claim"
    exit 1
fi

if [ ${#CLAIM_TOKEN} -lt 20 ]; then
    echo "Error: Claim token seems too short. Please verify."
    exit 1
fi

log_message "Starting Plex server reconfiguration..."
log_message "Claim token: ${CLAIM_TOKEN:0:10}..."

# Stop existing Plex container
log_message "Stopping Plex container..."
docker stop "$PLEX_CONTAINER" || {
    log_message "Warning: Could not stop container (may already be stopped)"
}

# Remove container (keep volumes)
log_message "Removing old container..."
docker rm "$PLEX_CONTAINER" || {
    log_message "Warning: Could not remove container (may not exist)"
}

# Clear old Plex data (since it was from wiped server anyway)
log_message "Clearing old Plex configuration..."
rm -rf /service-pool/plex/Library/Application\ Support/Plex\ Media\ Server/Preferences.xml || true

# Create fresh Plex container with claim token
log_message "Creating new Plex container with claim token..."
docker run -d \
  --name="$PLEX_CONTAINER" \
  --net=host \
  -e PUID=0 \
  -e PGID=0 \
  -e TZ="America/New_York" \
  -e PLEX_CLAIM="$CLAIM_TOKEN" \
  -v /service-pool/plex:/config \
  -v /service-pool/plex/transcode:/transcode \
  -v /media-pool/movies:/media/movies \
  -v /media-pool/tv-shows:/media/tv-shows \
  -v /media-pool/disney-shorts:/media/disney-shorts \
  --restart unless-stopped \
  plexinc/pms-docker:latest

if [ $? -eq 0 ]; then
    log_message "✅ Plex container created successfully!"
else
    log_message "❌ Failed to create Plex container"
    exit 1
fi

# Wait for container to start
log_message "Waiting for Plex to start..."
sleep 30

# Check if Plex is responding
for i in {1..12}; do
    if curl -f -s http://localhost:32400/web > /dev/null; then
        log_message "✅ Plex is responding!"
        break
    else
        log_message "Waiting for Plex startup... ($i/12)"
        sleep 10
    fi
done

# Final status check
if curl -f -s http://localhost:32400/web > /dev/null; then
    log_message "🎉 Plex server reconfiguration complete!"
    log_message "🌐 Access your server at: http://192.168.0.99:32400"
    log_message "📚 Configure libraries:"
    log_message "   - Movies: /media/movies"
    log_message "   - TV Shows: /media/tv-shows" 
    log_message "   - Disney Shorts: /media/disney-shorts"
    exit 0
else
    log_message "❌ Plex server may not have started properly"
    log_message "Check logs with: docker logs $PLEX_CONTAINER"
    exit 1
fi