#!/bin/bash

# ==============================================================================
# Plex Library Rescan Script
#
# Sends a request to the Plex Media Server to scan all libraries for new
# media.
# ==============================================================================

# --- Configuration ---
# Your Plex server's IP address or hostname.
# IMPORTANT: Replace "localhost" with your Plex server's actual IP address.
PLEX_HOST="192.168.0.99"

# Your Plex authentication token.
# IMPORTANT: Replace "YOUR_PLEX_TOKEN" with your actual X-Plex-Token.
PLEX_TOKEN="VBCYFzX72FmTYzVWgvyM"

# --- Main Script ---

echo "Starting Plex library scan..."

# Find all library section IDs
# The `curl` command gets all sections, `jq` filters for those that are 'movie' or 'show' libraries, and `tr` cleans up the output.
LIBRARY_IDS=$(curl -s "http://${PLEX_HOST}:32400/library/sections?X-Plex-Token=${PLEX_TOKEN}" | grep -o 'key="[0-9]*"' | sed 's/key=//g' | tr -d '"')

if [ -z "${LIBRARY_IDS}" ]; then
    echo "ERROR: Could not find any library sections. Is the Plex host and token correct?"
    exit 1
fi

echo "Found library sections: ${LIBRARY_IDS}"

# Loop through each library ID and trigger a scan
for LIB_ID in ${LIBRARY_IDS}; do
    echo "Scanning library section ${LIB_ID}..."
    curl -s "http://${PLEX_HOST}:32400/library/sections/${LIB_ID}/refresh?X-Plex-Token=${PLEX_TOKEN}"
done

echo "Plex library scan initiated for all sections."
exit 0
