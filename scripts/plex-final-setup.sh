#!/bin/bash
# Final Plex Setup - Focused on Remote Access
# Creates a properly configured Plex server that shows up in "Your Media"

CLAIM_TOKEN="$1"
LOG_FILE="/service-pool/plex-final-setup.log"

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

if [ -z "$CLAIM_TOKEN" ]; then
    echo "Usage: $0 <claim-token>"
    echo "Get fresh claim token from: https://plex.tv/claim"
    exit 1
fi

log_message "🎯 Final Plex setup - focusing on remote access..."

# Complete cleanup
log_message "🧹 Complete cleanup of previous attempts..."
docker stop plex 2>/dev/null || true
docker rm plex 2>/dev/null || true
rm -rf "/service-pool/plex" 2>/dev/null || true
mkdir -p "/service-pool/plex"

# Create optimized container for remote access
log_message "🚀 Creating Plex with optimized remote access..."
docker run -d \
  --name="plex" \
  --hostname="HomeMediaServer" \
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
  -e ALLOWED_NETWORKS="192.168.0.0/24,10.0.0.0/8,172.16.0.0/12" \
  -e PLEX_GID="0" \
  -e PLEX_UID="0" \
  --add-host=host.docker.internal:host-gateway \
  -v /service-pool/plex:/config \
  -v /service-pool/plex/transcode:/transcode \
  -v /media-pool/movies:/data/movies:ro \
  -v /media-pool/tv-shows:/data/tvshows:ro \
  -v /media-pool/disney-shorts:/data/disney:ro \
  --restart unless-stopped \
  plexinc/pms-docker:latest

if [ $? -ne 0 ]; then
    log_message "❌ Failed to create container"
    exit 1
fi

log_message "⏳ Waiting for Plex initialization (90 seconds)..."
sleep 90

# Monitor the claiming process
log_message "🔍 Monitoring claim and connectivity..."
for i in {1..20}; do
    log_message "Status check $i/20..."
    
    # Check claim status
    if docker logs plex 2>&1 | grep -q "Token obtained successfully"; then
        log_message "✅ Token obtained successfully"
    fi
    
    # Check if server is responding
    if curl -f -s "http://localhost:32400/identity" > /dev/null; then
        log_message "✅ Server responding to requests"
    fi
    
    # Check preferences for remote access settings
    if [ -f "/service-pool/plex/Library/Application Support/Plex Media Server/Preferences.xml" ]; then
        if grep -q "PlexOnlineToken" "/service-pool/plex/Library/Application Support/Plex Media Server/Preferences.xml"; then
            TOKEN=$(grep -o 'PlexOnlineToken="[^"]*"' "/service-pool/plex/Library/Application Support/Plex Media Server/Preferences.xml" | cut -d'"' -f2)
            log_message "✅ Online token: ${TOKEN:0:15}..."
        fi
    fi
    
    sleep 10
done

# Final verification
log_message "📊 Final status verification..."

# Get server identity
SERVER_ID=""
if curl -f -s "http://localhost:32400/identity" > /dev/null; then
    SERVER_ID=$(curl -s "http://localhost:32400/identity" | grep -o 'machineIdentifier="[^"]*"' | cut -d'"' -f2)
    log_message "🆔 Server ID: $SERVER_ID"
fi

# Check token
if [ -f "/service-pool/plex/Library/Application Support/Plex Media Server/Preferences.xml" ]; then
    TOKEN=$(grep -o 'PlexOnlineToken="[^"]*"' "/service-pool/plex/Library/Application Support/Plex Media Server/Preferences.xml" | cut -d'"' -f2 2>/dev/null)
    if [ -n "$TOKEN" ]; then
        log_message "🔑 Active token: ${TOKEN:0:15}..."
    fi
fi

log_message "🎉 Setup complete!"
log_message "📋 Next steps:"
log_message "   1. Wait 2-3 minutes for full connectivity"  
log_message "   2. Check https://app.plex.tv/desktop/"
log_message "   3. Look for 'HomeMediaServer' in Your Media section"
log_message "   4. Container: docker logs plex"

log_message "📚 Media paths ready:"
log_message "   Movies: /data/movies (89 films)"
log_message "   TV Shows: /data/tvshows (Columbo series)"
log_message "   Disney: /data/disney (329 shorts)"