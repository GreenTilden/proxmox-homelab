#!/bin/bash
# Proxmox Repository Configuration Fix Script
# Purpose: Fix mixed Bookworm/Trixie repositories and remove duplicate entries
# Date: 2025-08-16

set -euo pipefail

REMOTE_HOST="proxmox"
LOG_FILE="/tmp/fix_repositories.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}ERROR: $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}SUCCESS: $1${NC}" | tee -a "$LOG_FILE"
}

# Check if we can connect to Proxmox
check_connection() {
    log "Checking SSH connection to $REMOTE_HOST..."
    if ! ssh "$REMOTE_HOST" "echo 'Connection successful'" >/dev/null 2>&1; then
        error "Cannot connect to $REMOTE_HOST via SSH"
    fi
    success "SSH connection verified"
}

# Backup current configuration
backup_configs() {
    log "Creating backups of current repository configuration..."
    ssh "$REMOTE_HOST" "
        cp /etc/apt/sources.list /etc/apt/sources.list.backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true
        cp /etc/apt/sources.list.d/debian.sources /etc/apt/sources.list.d/debian.sources.backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true
    "
    success "Configuration backups created"
}

# Fix debian.sources file (remove Trixie, use only Bookworm)
fix_debian_sources() {
    log "Fixing /etc/apt/sources.list.d/debian.sources..."
    ssh "$REMOTE_HOST" "cat > /etc/apt/sources.list.d/debian.sources << 'EOF'
Types: deb
URIs: http://deb.debian.org/debian/
Suites: bookworm bookworm-updates
Components: main contrib non-free-firmware
Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg

Types: deb
URIs: http://security.debian.org/debian-security/
Suites: bookworm-security
Components: main contrib non-free-firmware
Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg
EOF"
    success "debian.sources updated to use only Bookworm repositories"
}

# Clean up main sources.list to remove duplicates
clean_sources_list() {
    log "Cleaning /etc/apt/sources.list to remove duplicates..."
    ssh "$REMOTE_HOST" "cat > /etc/apt/sources.list << 'EOF'
#deb cdrom:[Debian GNU/Linux 12.11.0 _Bookworm_ - Official amd64 NETINST with firmware 20250517-09:51]/ bookworm contrib main non-free-firmware

# This system was installed using small removable media
# (e.g. netinst, live or single CD). The matching \"deb cdrom\"
# entries were disabled at the end of the installation process.
# For information about how to configure apt package sources,
# see the sources.list(5) manual.

# Note: Main Debian repositories are now configured in /etc/apt/sources.list.d/debian.sources
EOF"
    success "sources.list cleaned up - duplicates removed"
}

# Verify repository configuration
verify_config() {
    log "Verifying repository configuration..."
    
    # Test apt update
    if ssh "$REMOTE_HOST" "apt update" 2>&1 | grep -q "WARNING\|Warning"; then
        warning "Some warnings present during apt update"
    else
        success "apt update completed without warnings"
    fi
    
    # Check that we're using only Bookworm
    local trixie_count
    trixie_count=$(ssh "$REMOTE_HOST" "grep -r 'trixie' /etc/apt/ 2>/dev/null | wc -l")
    if [ "$trixie_count" -eq 0 ]; then
        success "No Trixie repositories found - using only Bookworm"
    else
        warning "Found $trixie_count references to Trixie repositories"
    fi
}

# Display current configuration
show_config() {
    log "Current repository configuration:"
    echo "=== /etc/apt/sources.list.d/debian.sources ==="
    ssh "$REMOTE_HOST" "cat /etc/apt/sources.list.d/debian.sources"
    echo ""
    echo "=== /etc/apt/sources.list.d/pve-no-subscription.list ==="
    ssh "$REMOTE_HOST" "cat /etc/apt/sources.list.d/pve-no-subscription.list"
    echo ""
}

# Main execution
main() {
    log "Starting Proxmox repository configuration fix..."
    
    check_connection
    backup_configs
    fix_debian_sources
    clean_sources_list
    verify_config
    show_config
    
    success "Repository configuration fix completed successfully!"
    log "Log file saved to: $LOG_FILE"
}

# Run main function
main "$@"