#!/bin/bash
# =============================================================================
# RustDesk 1.1.9 (Sciter) Automated Setup for macOS VM
# =============================================================================
# This script installs and configures RustDesk 1.1.9 on a macOS VM running on
# Proxmox. Version 1.1.9 uses Sciter (not Flutter) and does NOT require Metal
# GPU support, making it compatible with VMware VGA display adapters.
#
# Usage: curl -fsSL <url>/setup-rustdesk-119.sh | bash
# Or:    bash setup-rustdesk-119.sh
# =============================================================================

set -e

# Configuration
RUSTDESK_VERSION="1.1.9"
RUSTDESK_DMG_URL="https://github.com/rustdesk/rustdesk/releases/download/${RUSTDESK_VERSION}/rustdesk-${RUSTDESK_VERSION}.dmg"
RUSTDESK_SERVER_IP="192.168.0.218"
RUSTDESK_CONFIG_DIR="$HOME/Library/Preferences/com.carriez.RustDesk"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# =============================================================================
# Step 1: Remove existing RustDesk installations
# =============================================================================
log_info "Removing existing RustDesk installations..."

# Kill any running RustDesk processes
sudo pkill -9 -f RustDesk 2>/dev/null || true

# Remove existing app
if [ -d "/Applications/RustDesk.app" ]; then
    log_info "Removing /Applications/RustDesk.app"
    sudo rm -rf /Applications/RustDesk.app
fi

# Remove old config (fresh start)
if [ -d "$RUSTDESK_CONFIG_DIR" ]; then
    log_info "Removing old RustDesk config"
    sudo chflags -R nouchg "$RUSTDESK_CONFIG_DIR" 2>/dev/null || true
    rm -rf "$RUSTDESK_CONFIG_DIR"
fi

# =============================================================================
# Step 2: Download and install RustDesk 1.1.9
# =============================================================================
log_info "Downloading RustDesk ${RUSTDESK_VERSION}..."

TEMP_DIR=$(mktemp -d)
DMG_PATH="${TEMP_DIR}/rustdesk.dmg"

curl -fsSL -o "$DMG_PATH" "$RUSTDESK_DMG_URL"

log_info "Mounting DMG..."
MOUNT_POINT=$(hdiutil attach "$DMG_PATH" -nobrowse | tail -1 | awk '{print $3}')

log_info "Installing RustDesk.app to /Applications..."
sudo cp -R "${MOUNT_POINT}/RustDesk.app" /Applications/

log_info "Unmounting DMG..."
hdiutil detach "$MOUNT_POINT" -quiet

rm -rf "$TEMP_DIR"

# =============================================================================
# Step 3: Configure /etc/hosts for local RustDesk server
# =============================================================================
log_info "Configuring /etc/hosts for local RustDesk server..."

# RustDesk 1.1.9 hardcodes public server addresses. We redirect them to local.
HOSTS_ENTRIES=(
    "${RUSTDESK_SERVER_IP} rs-ny.rustdesk.com"
    "${RUSTDESK_SERVER_IP} rs-sg.rustdesk.com"
    "${RUSTDESK_SERVER_IP} rs-cn.rustdesk.com"
    "${RUSTDESK_SERVER_IP} rustdesk.darrenarney.com"
)

for entry in "${HOSTS_ENTRIES[@]}"; do
    hostname=$(echo "$entry" | awk '{print $2}')
    if ! grep -q "$hostname" /etc/hosts; then
        echo "$entry" | sudo tee -a /etc/hosts > /dev/null
        log_info "Added: $entry"
    else
        log_warn "Already exists: $hostname"
    fi
done

# Flush DNS cache
log_info "Flushing DNS cache..."
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder 2>/dev/null || true

# =============================================================================
# Step 4: Create LaunchDaemon for /etc/hosts persistence
# =============================================================================
log_info "Creating LaunchDaemon for /etc/hosts persistence..."

LAUNCH_DAEMON="/Library/LaunchDaemons/com.local.rustdesk-hosts.plist"

sudo tee "$LAUNCH_DAEMON" > /dev/null << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.local.rustdesk-hosts</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>-c</string>
        <string>
            grep -q "rs-ny.rustdesk.com" /etc/hosts || {
                echo "192.168.0.218 rs-ny.rustdesk.com" >> /etc/hosts
                echo "192.168.0.218 rs-sg.rustdesk.com" >> /etc/hosts
                echo "192.168.0.218 rs-cn.rustdesk.com" >> /etc/hosts
                echo "192.168.0.218 rustdesk.darrenarney.com" >> /etc/hosts
            }
        </string>
    </array>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
PLIST

sudo chmod 644 "$LAUNCH_DAEMON"
sudo chown root:wheel "$LAUNCH_DAEMON"
sudo launchctl load "$LAUNCH_DAEMON" 2>/dev/null || true

log_info "LaunchDaemon created for /etc/hosts persistence"

# =============================================================================
# Step 5: Create RustDesk auto-start LaunchAgent
# =============================================================================
log_info "Creating RustDesk auto-start LaunchAgent..."

LAUNCH_AGENT_DIR="$HOME/Library/LaunchAgents"
mkdir -p "$LAUNCH_AGENT_DIR"

LAUNCH_AGENT="$LAUNCH_AGENT_DIR/com.carriez.rustdesk.plist"

cat > "$LAUNCH_AGENT" << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.carriez.rustdesk</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Applications/RustDesk.app/Contents/MacOS/RustDesk</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/rustdesk.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/rustdesk.err</string>
</dict>
</plist>
PLIST

chmod 644 "$LAUNCH_AGENT"
launchctl load "$LAUNCH_AGENT" 2>/dev/null || true

# =============================================================================
# Step 6: Launch RustDesk
# =============================================================================
log_info "Launching RustDesk..."
sleep 2
open -a RustDesk

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "============================================================================="
echo -e "${GREEN}RustDesk ${RUSTDESK_VERSION} Installation Complete!${NC}"
echo "============================================================================="
echo ""
echo "Next Steps:"
echo "1. Grant Screen Recording permission:"
echo "   System Preferences > Privacy & Security > Screen Recording > Enable RustDesk"
echo ""
echo "2. Grant Accessibility permission:"
echo "   System Preferences > Privacy & Security > Accessibility > Enable RustDesk"
echo ""
echo "3. Note your RustDesk ID from the application window"
echo ""
echo "4. Set a permanent password in RustDesk Settings if desired"
echo ""
echo "Server: ${RUSTDESK_SERVER_IP} (redirected via /etc/hosts)"
echo "============================================================================="
