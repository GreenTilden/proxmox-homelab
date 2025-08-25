#!/bin/bash
# Robust Plex Server Claiming Script
# Uses multiple methods to ensure proper server claiming

CLAIM_TOKEN="$1"
LOG_FILE="/service-pool/plex-robust-claim.log"

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

if [ -z "$CLAIM_TOKEN" ]; then
    echo "Usage: $0 <claim-token>"
    exit 1
fi

log_message "🚀 Starting robust Plex claiming process..."

# Stop current container
log_message "Stopping current Plex container..."
docker stop plex 2>/dev/null || true
docker rm plex 2>/dev/null || true

# Clear all Plex data for fresh start
log_message "Clearing Plex data for fresh claim..."
rm -rf "/service-pool/plex/Library" 2>/dev/null || true
rm -rf "/service-pool/plex/Logs" 2>/dev/null || true

# Create container with robust claiming setup
log_message "Creating Plex container with robust claiming..."
docker run -d \
  --name="plex" \
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
  -e ALLOWED_NETWORKS="192.168.0.0/24" \
  -e HOSTNAME="ProxmoxMediaServer" \
  --hostname="ProxmoxMediaServer" \
  -v /service-pool/plex:/config \
  -v /service-pool/plex/transcode:/transcode \
  -v /media-pool/movies:/data/movies \
  -v /media-pool/tv-shows:/data/tvshows \
  -v /media-pool/disney-shorts:/data/disney \
  --restart unless-stopped \
  plexinc/pms-docker:latest

if [ $? -ne 0 ]; then
    log_message "❌ Failed to create container"
    exit 1
fi

log_message "✅ Container created, waiting for initialization..."

# Wait for claim process with detailed monitoring
sleep 10

for i in {1..30}; do
    log_message "Checking claim status... ($i/30)"
    
    # Check if claiming is in progress
    if docker logs plex 2>&1 | grep -q "Attempting to obtain server token"; then
        log_message "📡 Claim process detected..."
    fi
    
    # Check if claiming succeeded
    if docker logs plex 2>&1 | grep -q "Token obtained successfully"; then
        log_message "🎉 Claim token processed successfully!"
        break
    fi
    
    # Check for errors
    if docker logs plex 2>&1 | grep -qi "error\|failed"; then
        log_message "⚠️  Potential error in logs"
    fi
    
    sleep 10
done

# Final status check
log_message "🔍 Final status check..."
sleep 20

# Check if server is accessible
if curl -f -s "http://localhost:32400/identity" | grep -q "machineIdentifier"; then
    MACHINE_ID=$(curl -s "http://localhost:32400/identity" | grep -o 'machineIdentifier="[^"]*"' | cut -d'"' -f2)
    log_message "✅ Server responding with ID: ${MACHINE_ID:0:10}..."
else
    log_message "❌ Server not responding to identity requests"
fi

# Check token status
if [ -f "/service-pool/plex/Library/Application Support/Plex Media Server/Preferences.xml" ]; then
    if grep -q "PlexOnlineToken" "/service-pool/plex/Library/Application Support/Plex Media Server/Preferences.xml"; then
        TOKEN=$(grep -o 'PlexOnlineToken="[^"]*"' "/service-pool/plex/Library/Application Support/Plex Media Server/Preferences.xml" | cut -d'"' -f2)
        log_message "✅ Server has online token: ${TOKEN:0:10}..."
    else
        log_message "❌ No online token found in preferences"
    fi
else
    log_message "❌ No preferences file found"
fi

log_message "🏁 Claiming process complete!"
log_message "📋 Next steps:"
log_message "   1. Check https://app.plex.tv/desktop/ for 'ProxmoxMediaServer'"
log_message "   2. If not visible, try a fresh claim token"
log_message "   3. Container logs: docker logs plex"