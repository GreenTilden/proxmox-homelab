#!/bin/bash

# Alert checker and notification system
# Monitors alert log and sends notifications

ALERT_LOG="/var/log/system-alerts.log"
LAST_CHECK_FILE="/tmp/last-alert-check"
NOTIFICATION_URL=""  # Future: webhook/email endpoint

# Get timestamp of last check
if [ -f "$LAST_CHECK_FILE" ]; then
    LAST_CHECK=$(cat "$LAST_CHECK_FILE")
else
    LAST_CHECK="1970-01-01 00:00:00"
fi

# Update last check timestamp
date '+%Y-%m-%d %H:%M:%S' > "$LAST_CHECK_FILE"

# Check for new alerts since last check
if [ -f "$ALERT_LOG" ]; then
    NEW_ALERTS=$(awk -v last_check="$LAST_CHECK" '
        function datetime_to_epoch(dt) {
            # Convert YYYY-MM-DD HH:MM:SS to epoch
            gsub(/[-:]/, " ", dt)
            return mktime(dt)
        }
        {
            # Extract timestamp from log line [YYYY-MM-DD HH:MM:SS]
            match($0, /\[([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2})\]/, arr)
            if (arr[1] && datetime_to_epoch(arr[1]) > datetime_to_epoch(last_check)) {
                print $0
            }
        }' "$ALERT_LOG")

    if [ -n "$NEW_ALERTS" ]; then
        echo "=== NEW SYSTEM ALERTS - $(date) ===" >> /var/log/notifications.log
        echo "$NEW_ALERTS" >> /var/log/notifications.log
        echo "" >> /var/log/notifications.log
        
        # Count alerts by severity
        CRITICAL_COUNT=$(echo "$NEW_ALERTS" | grep -c "\[CRITICAL\]" || echo 0)
        WARNING_COUNT=$(echo "$NEW_ALERTS" | grep -c "\[WARNING\]" || echo 0)
        
        if [ "$CRITICAL_COUNT" -gt 0 ]; then
            logger -t "ProxmoxAlert" "CRITICAL: $CRITICAL_COUNT critical alerts detected"
        fi
        
        if [ "$WARNING_COUNT" -gt 0 ]; then
            logger -t "ProxmoxAlert" "WARNING: $WARNING_COUNT warnings detected"
        fi
        
        # Future: Send to external notification system
        # if [ -n "$NOTIFICATION_URL" ]; then
        #     curl -X POST "$NOTIFICATION_URL" -H "Content-Type: application/json" \
        #          -d "{\"alerts\": $CRITICAL_COUNT, \"warnings\": $WARNING_COUNT}"
        # fi
    fi
fi