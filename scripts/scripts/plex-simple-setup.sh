#!/bin/bash
# Simple Plex Setup Script
# Uses bridge networking and minimal configuration for reliable access

CLAIM_TOKEN="$1"
PLEX_CONTAINER="plex"
LOG_FILE="/service-pool/plex-simple-setup.log"

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

log_message "Starting simple Plex setup with bridge networking..."

# Stop and remove existing container
log_message "Removing existing Plex container..."
docker stop "$PLEX_CONTAINER" 2>/dev/null || true
docker rm "$PLEX_CONTAINER" 2>/dev/null || true

# Clear problematic configuration
log_message "Clearing Plex configuration..."
rm -f "/service-pool/plex/Library/Application Support/Plex Media Server/Preferences.xml" 2>/dev/null || true

# Create new Plex container with bridge networking
log_message "Creating Plex container with bridge networking..."
docker run -d \
  --name="$PLEX_CONTAINER" \
  -p 32400:32400/tcp \
  -p 3005:3005/tcp \
  -p 8324:8324/tcp \
  -p 32469:32469/tcp \
  -p 1900:1900/udp \
  -p 32410:32410/udp \
  -p 32412:32412/udp \
  -p 32413:32413/udp \
  -p 32414:32414/udp \
  -e PUID=0 \
  -e PGID=0 \
  -e TZ="America/New_York" \
  -e PLEX_CLAIM="$CLAIM_TOKEN" \
  -e ADVERTISE_IP="http://192.168.0.99:32400/" \
  -v /service-pool/plex:/config \
  -v /service-pool/plex/transcode:/transcode \
  -v /media-pool/movies:/data/movies \
  -v /media-pool/tv-shows:/data/tvshows \
  -v /media-pool/disney-shorts:/data/disney \
  --restart unless-stopped \
  plexinc/pms-docker:latest

if [ $? -eq 0 ]; then
    log_message "✅ Plex container created successfully with bridge networking!"
else
    log_message "❌ Failed to create Plex container"
    exit 1
fi

# Wait for startup
log_message "Waiting for Plex to initialize..."
sleep 45

# Check status
for i in {1..20}; do
    if curl -f -s http://localhost:32400/web > /dev/null; then
        log_message "✅ Plex web interface is accessible!"
        break
    else
        log_message "Waiting for Plex... ($i/20)"
        sleep 5
    fi
done

# Final check
if curl -f -s http://localhost:32400/web > /dev/null; then
    log_message "🎉 Plex setup complete!"
    log_message "🌐 Access: http://192.168.0.99:32400"
    log_message "📚 Library paths:"
    log_message "   - Movies: /data/movies"
    log_message "   - TV Shows: /data/tvshows"
    log_message "   - Disney: /data/disney"
else
    log_message "❌ Plex web interface may not be accessible"
    log_message "Check container logs: docker logs plex"
fi