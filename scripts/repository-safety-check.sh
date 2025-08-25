#!/bin/bash
# Repository Safety Check - Prevents Trixie package installation

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_package_source() {
    local package=$1
    
    echo -e "${YELLOW}Checking package source for: $package${NC}"
    
    # Get package repository source
    local source=$(apt-cache policy "$package" 2>/dev/null | grep -A1 "Candidate:" | grep -E "500|http" | head -1)
    
    if echo "$source" | grep -q "trixie"; then
        echo -e "${RED}❌ BLOCKED: Package '$package' would install from Trixie repository${NC}"
        echo -e "${RED}This violates the CRITICAL REPOSITORY SAFETY RULE${NC}"
        echo "Alternative solutions:"
        echo "  1. Use manual installer (.run, .sh, compiled)"
        echo "  2. Deploy via Docker container"
        echo "  3. Find Bookworm/Proxmox repository version"
        return 1
    else
        echo -e "${GREEN}✅ Safe: Package not from Trixie repository${NC}"
        return 0
    fi
}

# Check if any arguments provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <package-name> [package-name2] ..."
    echo "Checks if packages would install from Trixie repositories"
    exit 1
fi

# Check all provided packages
SAFE=true
for package in "$@"; do
    if ! check_package_source "$package"; then
        SAFE=false
    fi
done

if [ "$SAFE" = true ]; then
    echo -e "${GREEN}All packages are safe to install${NC}"
    exit 0
else
    echo -e "${RED}Some packages violate repository safety rule${NC}"
    exit 1
fi