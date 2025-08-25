#!/bin/bash
# Create working Plex preferences file

PREFS_FILE="/service-pool/plex/Library/Application Support/Plex Media Server/Preferences.xml"

echo "🔧 Creating Plex preferences with open access..."

# Get the current token from backup
TOKEN=$(grep -o 'PlexOnlineToken="[^"]*"' "$PREFS_FILE.backup2" | cut -d'"' -f2)
MACHINE_ID=$(grep -o 'MachineIdentifier="[^"]*"' "$PREFS_FILE.backup2" | cut -d'"' -f2)
PROCESSED_ID=$(grep -o 'ProcessedMachineIdentifier="[^"]*"' "$PREFS_FILE.backup2" | cut -d'"' -f2)
ANON_ID=$(grep -o 'AnonymousMachineIdentifier="[^"]*"' "$PREFS_FILE.backup2" | cut -d'"' -f2)

echo "Using token: ${TOKEN:0:10}..."
echo "Using machine ID: ${MACHINE_ID:0:10}..."

# Create new preferences with open access
cat > "$PREFS_FILE" << EOF
<?xml version="1.0" encoding="utf-8"?>
<Preferences 
    MachineIdentifier="$MACHINE_ID"
    ProcessedMachineIdentifier="$PROCESSED_ID" 
    PlexOnlineToken="$TOKEN"
    AnonymousMachineIdentifier="$ANON_ID"
    AcceptedEULA="1"
    PublishServerOnPlexOnlineKey="1"
    PlexOnlineHome="1"
    allowedNetworks="192.168.0.0/255.255.255.0,127.0.0.1,0.0.0.0/0"
    LocalNetworkAddresses="192.168.0.99"
    customCertificateDomain="localhost,192.168.0.99,*"
    enableHttps="0"
    secureConnections="0"
    treatWanIpAsLocal="1"
    GdmEnabled="1"
    EnableIPv6="0"
    FriendlyName="Proxmox Media Server"
    DisableRemoteSecurity="1"
    TranscoderTempDirectory="/transcode"
    />
EOF

echo "✅ Created open access Plex preferences"
echo "🔄 Starting Plex with new configuration..."

docker start plex
sleep 20

echo "✅ Plex started - testing access..."
if curl -f -s http://localhost:32400/web > /dev/null; then
    echo "🎉 Plex web interface is accessible!"
    echo "🌐 Try: http://192.168.0.99:32400/web/"
else
    echo "❌ Still having access issues"
    echo "📋 Try: https://app.plex.tv/desktop/"
fi