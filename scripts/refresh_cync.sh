#!/bin/bash

# ==============================================================================
# Home Assistant Cync Integration Refresh Script
#
# Reloads the Cync integration in Home Assistant to fix connection issues.
# ==============================================================================

# --- Configuration ---
HA_HOST="${HA_HOST:-192.168.0.99}"
HA_PORT="${HA_PORT:-8123}"
HA_TOKEN="${HA_TOKEN:-}"

if [ -z "${HA_TOKEN}" ]; then
    echo "ERROR: HA_TOKEN environment variable not set."
    exit 1
fi

HA_URL="http://${HA_HOST}:${HA_PORT}"

echo "Fetching config entries from Home Assistant..."

# Get all config entries and find the Cync one
CYNC_ENTRY_ID=$(curl -s -X GET "${HA_URL}/api/config/config_entries/entry" \
    -H "Authorization: Bearer ${HA_TOKEN}" \
    -H "Content-Type: application/json" | \
    python3 -c "import sys, json; entries = json.load(sys.stdin); cync = next((e for e in entries if 'cync' in e.get('domain', '').lower()), None); print(cync['entry_id'] if cync else '')")

if [ -z "${CYNC_ENTRY_ID}" ]; then
    echo "ERROR: Could not find Cync integration. Is it installed in Home Assistant?"
    exit 1
fi

echo "Found Cync integration with entry_id: ${CYNC_ENTRY_ID}"
echo "Reloading Cync integration..."

# Reload the config entry
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${HA_URL}/api/config/config_entries/entry/${CYNC_ENTRY_ID}/reload" \
    -H "Authorization: Bearer ${HA_TOKEN}" \
    -H "Content-Type: application/json")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "Cync integration reloaded successfully!"
    exit 0
else
    echo "ERROR: Failed to reload Cync integration. HTTP ${HTTP_CODE}"
    echo "Response: ${BODY}"
    exit 1
fi
