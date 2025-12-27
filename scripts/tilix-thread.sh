#!/bin/bash
# Tilix Thread Launcher - Opens Tilix with theme matching current worktree
# Part of the 5-Thread Claude Code Execution Model

set -e

# Color codes for output
PURPLE='\033[0;35m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Detect current worktree directory
CURRENT_DIR=$(pwd)

# Default theme
THEME="SAE Main"
THREAD_NAME="Main"
THREAD_EMOJI="🎯"

# Detect which thread based on directory
if [[ "$CURRENT_DIR" == *"proxmox-homelab-threads/reader"* ]]; then
    THEME="Coffee Reader"
    THREAD_NAME="Reader"
    THREAD_EMOJI="🔍"
elif [[ "$CURRENT_DIR" == *"proxmox-homelab-threads/writer"* ]]; then
    THEME="Pacers Writer"
    THREAD_NAME="Writer"
    THREAD_EMOJI="⚡"
elif [[ "$CURRENT_DIR" == *"proxmox-homelab-threads/debug"* ]]; then
    THEME="Shadow Debug"
    THREAD_NAME="Debug"
    THREAD_EMOJI="🔧"
elif [[ "$CURRENT_DIR" == *"proxmox-homelab-threads/doc"* ]]; then
    THEME="Aqua Doc"
    THREAD_NAME="Documentation"
    THREAD_EMOJI="📚"
elif [[ "$CURRENT_DIR" == *"proxmox-homelab"* ]]; then
    THEME="SAE Main"
    THREAD_NAME="Main"
    THREAD_EMOJI="🎯"
else
    echo -e "${YELLOW}⚠️  Not in a known worktree directory${NC}"
    echo -e "Current: $CURRENT_DIR"
    echo -e "Using default Main thread theme"
fi

echo -e "${GREEN}${THREAD_EMOJI} Launching Tilix for ${THREAD_NAME} Thread${NC}"
echo -e "Theme: ${CYAN}${THEME}${NC}"
echo -e "Directory: ${BLUE}${CURRENT_DIR}${NC}"

# Get the Tilix profile UUID (usually default profile)
PROFILE_ID=$(dconf read /com/gexperts/Tilix/profileUUIDs | grep -oP '(?<=\['"'"')[^'"'"']+(?='"'"'\])' | head -n1)

if [ -z "$PROFILE_ID" ]; then
    echo -e "${YELLOW}⚠️  Could not detect Tilix profile. Using default settings.${NC}"
    # Just launch Tilix normally
    tilix &
    exit 0
fi

# Set the color scheme for the default profile
SCHEME_PATH="/com/gexperts/Tilix/profiles/${PROFILE_ID}/"

# Apply the color scheme
dconf write "${SCHEME_PATH}foreground-color" "'#C2AFD5'" 2>/dev/null || true
dconf write "${SCHEME_PATH}background-color" "'#46315E'" 2>/dev/null || true

case "$THEME" in
    "SAE Main")
        dconf write "${SCHEME_PATH}foreground-color" "'#C2AFD5'"
        dconf write "${SCHEME_PATH}background-color" "'#46315E'"
        dconf write "${SCHEME_PATH}cursor-foreground-color" "'#46315E'"
        dconf write "${SCHEME_PATH}cursor-background-color" "'#F4BD1D'"
        ;;
    "Coffee Reader")
        dconf write "${SCHEME_PATH}foreground-color" "'#EEF1BD'"
        dconf write "${SCHEME_PATH}background-color" "'#644536'"
        dconf write "${SCHEME_PATH}cursor-foreground-color" "'#644536'"
        dconf write "${SCHEME_PATH}cursor-background-color" "'#BBD686'"
        ;;
    "Pacers Writer")
        dconf write "${SCHEME_PATH}foreground-color" "'#BEC0C2'"
        dconf write "${SCHEME_PATH}background-color" "'#002d62'"
        dconf write "${SCHEME_PATH}cursor-foreground-color" "'#002d62'"
        dconf write "${SCHEME_PATH}cursor-background-color" "'#FDBB30'"
        ;;
    "Shadow Debug")
        dconf write "${SCHEME_PATH}foreground-color" "'#FBFEF9'"
        dconf write "${SCHEME_PATH}background-color" "'#191923'"
        dconf write "${SCHEME_PATH}cursor-foreground-color" "'#191923'"
        dconf write "${SCHEME_PATH}cursor-background-color" "'#0E79B2'"
        ;;
    "Aqua Doc")
        dconf write "${SCHEME_PATH}foreground-color" "'#46351D'"
        dconf write "${SCHEME_PATH}background-color" "'#DDFFF7'"
        dconf write "${SCHEME_PATH}cursor-foreground-color" "'#DDFFF7'"
        dconf write "${SCHEME_PATH}cursor-background-color" "'#46351D'"
        ;;
esac

# Launch Tilix in the current directory
echo -e "${GREEN}✓ Launching Tilix...${NC}"
tilix -w "$CURRENT_DIR" &

# Optional: Set terminal title to show thread name
sleep 0.5
echo -e "\033]0;${THREAD_EMOJI} ${THREAD_NAME} Thread\007"
