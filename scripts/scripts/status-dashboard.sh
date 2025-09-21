#!/bin/bash

# Simple web dashboard generator
# Creates HTML status page for system monitoring

OUTPUT_DIR="/var/www/html"
HTML_FILE="$OUTPUT_DIR/system-status.html"

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR"

# Generate HTML dashboard
cat > "$HTML_FILE" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Proxmox System Status</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="refresh" content="30">
    <style>
        body { font-family: monospace; margin: 20px; background-color: #1a1a1a; color: #e0e0e0; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .section { margin: 20px 0; padding: 15px; background-color: #2a2a2a; border-radius: 5px; }
        .section h3 { color: #4a9eff; margin-top: 0; }
        .status-table { width: 100%; border-collapse: collapse; }
        .status-table th, .status-table td { padding: 8px; text-align: left; border-bottom: 1px solid #444; }
        .status-table th { background-color: #333; }
        .status-healthy { color: #4CAF50; }
        .status-warning { color: #FF9800; }
        .status-critical { color: #F44336; }
        .status-degraded { color: #FF5722; }
        .status-unknown { color: #9E9E9E; }
        .timestamp { text-align: center; color: #888; font-size: 0.9em; }
        pre { background-color: #1e1e1e; padding: 10px; border-radius: 3px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🖥️ Proxmox Homelab Status Dashboard</h1>
            <p class="timestamp">Last Updated: <span id="timestamp">TIMESTAMP_PLACEHOLDER</span></p>
        </div>
        
        <div class="section">
            <h3>📊 Quick Overview</h3>
            <table class="status-table">
                <tr>
                    <th>Component</th>
                    <th>Status</th>
                    <th>Details</th>
                </tr>
                <tr>
                    <td>System Load</td>
                    <td class="LOAD_STATUS_CLASS">LOAD_STATUS</td>
                    <td>LOAD_VALUE</td>
                </tr>
                <tr>
                    <td>Memory Usage</td>
                    <td class="MEM_STATUS_CLASS">MEM_STATUS</td>
                    <td>MEM_VALUE</td>
                </tr>
                <tr>
                    <td>ZFS Pools</td>
                    <td class="ZFS_STATUS_CLASS">ZFS_STATUS</td>
                    <td>ZFS_DETAILS</td>
                </tr>
                <tr>
                    <td>Temperature</td>
                    <td class="TEMP_STATUS_CLASS">TEMP_STATUS</td>
                    <td>TEMP_VALUE</td>
                </tr>
            </table>
        </div>

        <div class="section">
            <h3>💾 Storage Status</h3>
            <table class="status-table">
                <tr>
                    <th>Pool/Dataset</th>
                    <th>Used</th>
                    <th>Available</th>
                    <th>Usage</th>
                    <th>Status</th>
                </tr>
                STORAGE_TABLE_ROWS
            </table>
        </div>

        <div class="section">
            <h3>🔄 Recovery Data</h3>
            <table class="status-table">
                <tr>
                    <th>Category</th>
                    <th>Size</th>
                    <th>Files</th>
                    <th>Location</th>
                </tr>
                <tr>
                    <td>Original Carved Files</td>
                    <td class="status-healthy">CARVED_SIZE</td>
                    <td>1,246</td>
                    <td>/media-pool/carved-originals</td>
                </tr>
                <tr>
                    <td>Personal Photos</td>
                    <td class="status-healthy">PHOTOS_SIZE</td>
                    <td>PHOTOS_COUNT</td>
                    <td>/media-pool/media/personal-photos</td>
                </tr>
                <tr>
                    <td>Plex Thumbnails</td>
                    <td class="status-healthy">THUMBS_SIZE</td>
                    <td>THUMBS_COUNT</td>
                    <td>/media-pool/media/final-recovery</td>
                </tr>
            </table>
        </div>

        <div class="section">
            <h3>📸 ZFS Snapshots</h3>
            <pre>ZFS_SNAPSHOTS</pre>
        </div>

        <div class="section">
            <h3>🐳 Container Status</h3>
            <pre>CONTAINER_STATUS</pre>
        </div>

        <div class="section">
            <h3>🚨 Recent Alerts</h3>
            <pre>RECENT_ALERTS</pre>
        </div>

        <div class="section">
            <h3>📈 System Information</h3>
            <table class="status-table">
                <tr>
                    <td>Uptime</td>
                    <td>SYSTEM_UPTIME</td>
                </tr>
                <tr>
                    <td>IP Address</td>
                    <td>192.168.0.99</td>
                </tr>
                <tr>
                    <td>FileBrowser</td>
                    <td><a href="http://192.168.0.99:8080" target="_blank" style="color: #4a9eff;">http://192.168.0.99:8080</a></td>
                </tr>
            </table>
        </div>
    </div>

    <script>
        // Auto-refresh timestamp
        setInterval(function() {
            location.reload();
        }, 30000);
    </script>
</body>
</html>
EOF

# Update template with real data
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOAD_1MIN=$(uptime | grep -o "load average: [0-9]*\.[0-9]*" | cut -d' ' -f3)
MEM_PERCENT=$(free | awk '/^Mem:/ {printf "%.0f", ($3/$2)*100}')
MEM_USED=$(free | awk '/^Mem:/ {printf "%.1f", $3/1024/1024}')
UPTIME_STR=$(uptime -p)

# Determine status classes
if (( $(echo "$LOAD_1MIN > 4.0" | bc -l 2>/dev/null || echo "0") )); then
    LOAD_STATUS="HIGH"; LOAD_CLASS="status-warning"
else
    LOAD_STATUS="NORMAL"; LOAD_CLASS="status-healthy"
fi

if [ "$MEM_PERCENT" -gt 80 ]; then
    MEM_STATUS="HIGH"; MEM_CLASS="status-warning"
else
    MEM_STATUS="NORMAL"; MEM_CLASS="status-healthy"
fi

# Get ZFS status
ZFS_POOLS=$(zpool list -H | wc -l)
if zpool status 2>/dev/null | grep -q "DEGRADED"; then
    ZFS_STATUS="DEGRADED"; ZFS_CLASS="status-critical"
else
    ZFS_STATUS="HEALTHY"; ZFS_CLASS="status-healthy"
fi

# Get temperature
MAX_TEMP=$(sensors 2>/dev/null | grep "Core" | grep -o "+[0-9]*\.[0-9]*°C" | tr -d '+°C' | sort -n | tail -1)
if [ -n "$MAX_TEMP" ]; then
    if (( $(echo "$MAX_TEMP > 75" | bc -l 2>/dev/null || echo "0") )); then
        TEMP_STATUS="WARM"; TEMP_CLASS="status-warning"
    else
        TEMP_STATUS="NORMAL"; TEMP_CLASS="status-healthy"
    fi
    TEMP_VALUE="Max: ${MAX_TEMP}°C"
else
    TEMP_STATUS="UNKNOWN"; TEMP_CLASS="status-unknown"; TEMP_VALUE="Sensors unavailable"
fi

# Get container status
CONTAINER_STATUS=$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "Docker unavailable")

# Get recent alerts
RECENT_ALERTS=$(tail -20 /var/log/system-alerts.log 2>/dev/null | tail -10 || echo "No recent alerts")

# Get ZFS pool status
ZFS_POOL_STATUS=$(zpool status 2>/dev/null || echo "ZFS unavailable")

# Get ZFS snapshots
ZFS_SNAPSHOTS=$(zfs list -t snapshot -o name,used,refer,creation 2>/dev/null | head -20 || echo "No snapshots")

# Generate storage table rows - using zpool list for accurate pool-level data
STORAGE_ROWS=""
while IFS=$'\t' read -r name size alloc free cap health; do
    # Skip header and empty lines
    [[ "$name" =~ ^NAME ]] && continue
    [[ -z "$name" ]] && continue
    
    # Clean up cap percentage (remove %)
    usage_pct=$(echo "$cap" | sed 's/%//')
    
    # Determine status class based on usage percentage
    if [[ "$usage_pct" =~ ^[0-9]+$ ]] && [ "$usage_pct" -gt 0 ]; then
        if [ "$usage_pct" -gt 90 ]; then
            status_class="status-critical"
            status="CRITICAL"
        elif [ "$usage_pct" -gt 80 ]; then
            status_class="status-warning" 
            status="HIGH"
        else
            status_class="status-healthy"
            status="NORMAL"
        fi
        # Add visual progress bar for better readability
        bar_filled=$((usage_pct / 5))  # Scale to 20 chars max
        bar_empty=$((20 - bar_filled))
        progress_bar=""
        for ((i=0; i<bar_filled; i++)); do progress_bar+="█"; done
        for ((i=0; i<bar_empty; i++)); do progress_bar+="░"; done
    else
        status_class="status-healthy"
        status="NORMAL"
        usage_pct="0"
        # Minimal progress bar for zero usage
        progress_bar="░░░░░░░░░░░░░░░░░░░░"
    fi
    
    STORAGE_ROWS="$STORAGE_ROWS
                <tr>
                    <td><strong>$name</strong><br><small>$size total</small></td>
                    <td>$alloc used</td>
                    <td>$free available</td>
                    <td>
                        <div style=\"font-family: monospace; font-size: 12px; margin: 2px 0;\"
                             title=\"$usage_pct% used\">$progress_bar</div>
                        <strong>${usage_pct}%</strong>
                    </td>
                    <td class=\"$status_class\">$status</td>
                </tr>"
done < <(zpool list -H -o name,size,allocated,free,capacity,health)

# Get recovery data stats
CARVED_SIZE=$(du -sh /media-pool/carved-originals 2>/dev/null | cut -f1 || echo "0")
PHOTOS_SIZE=$(du -sh /media-pool/media/personal-photos 2>/dev/null | cut -f1 || echo "0")  
PHOTOS_COUNT=$(find /media-pool/media/personal-photos -type f 2>/dev/null | wc -l || echo "0")
THUMBS_SIZE=$(du -sh /media-pool/media/final-recovery/Thumbnails 2>/dev/null | cut -f1 || echo "0")
THUMBS_COUNT=$(find /media-pool/media/final-recovery/Thumbnails -type f 2>/dev/null | wc -l || echo "0")

# Replace placeholders
sed -i "s/TIMESTAMP_PLACEHOLDER/$TIMESTAMP/g" "$HTML_FILE"
sed -i "s/LOAD_STATUS_CLASS/$LOAD_CLASS/g" "$HTML_FILE"
sed -i "s/LOAD_STATUS/$LOAD_STATUS/g" "$HTML_FILE"
sed -i "s/LOAD_VALUE/$LOAD_1MIN/g" "$HTML_FILE"
sed -i "s/MEM_STATUS_CLASS/$MEM_CLASS/g" "$HTML_FILE"
sed -i "s/MEM_STATUS/$MEM_STATUS/g" "$HTML_FILE"
sed -i "s/MEM_VALUE/${MEM_USED}GB (${MEM_PERCENT}%)/g" "$HTML_FILE"
sed -i "s/ZFS_STATUS_CLASS/$ZFS_CLASS/g" "$HTML_FILE"
sed -i "s/ZFS_STATUS/$ZFS_STATUS/g" "$HTML_FILE"
sed -i "s/ZFS_DETAILS/$ZFS_POOLS pools/g" "$HTML_FILE"
sed -i "s/TEMP_STATUS_CLASS/$TEMP_CLASS/g" "$HTML_FILE"
sed -i "s/TEMP_STATUS/$TEMP_STATUS/g" "$HTML_FILE"
sed -i "s/TEMP_VALUE/$TEMP_VALUE/g" "$HTML_FILE"
sed -i "s/SYSTEM_UPTIME/$UPTIME_STR/g" "$HTML_FILE"

# Replace recovery data placeholders
sed -i "s/CARVED_SIZE/$CARVED_SIZE/g" "$HTML_FILE"
sed -i "s/PHOTOS_SIZE/$PHOTOS_SIZE/g" "$HTML_FILE"
sed -i "s/PHOTOS_COUNT/$PHOTOS_COUNT/g" "$HTML_FILE"
sed -i "s/THUMBS_SIZE/$THUMBS_SIZE/g" "$HTML_FILE"
sed -i "s/THUMBS_COUNT/$THUMBS_COUNT/g" "$HTML_FILE"

# Replace storage table rows
echo "$STORAGE_ROWS" > /tmp/storage_rows.tmp
sed -i '/STORAGE_TABLE_ROWS/r /tmp/storage_rows.tmp' "$HTML_FILE"
sed -i '/STORAGE_TABLE_ROWS/d' "$HTML_FILE"

# Replace multi-line content with safer approach
echo "$CONTAINER_STATUS" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g' > /tmp/container.tmp
echo "$RECENT_ALERTS" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g' > /tmp/alerts.tmp
echo "$ZFS_POOL_STATUS" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g' > /tmp/zpool.tmp
echo "$ZFS_SNAPSHOTS" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g' > /tmp/snapshots.tmp

# Replace placeholders with file contents
sed -i '/CONTAINER_STATUS/r /tmp/container.tmp' "$HTML_FILE"
sed -i '/CONTAINER_STATUS/d' "$HTML_FILE"
sed -i '/RECENT_ALERTS/r /tmp/alerts.tmp' "$HTML_FILE"
sed -i '/RECENT_ALERTS/d' "$HTML_FILE"
sed -i '/ZFS_POOL_STATUS/r /tmp/zpool.tmp' "$HTML_FILE"
sed -i '/ZFS_POOL_STATUS/d' "$HTML_FILE"
sed -i '/ZFS_SNAPSHOTS/r /tmp/snapshots.tmp' "$HTML_FILE"
sed -i '/ZFS_SNAPSHOTS/d' "$HTML_FILE"

# Cleanup temp files
rm -f /tmp/container.tmp /tmp/alerts.tmp /tmp/zpool.tmp /tmp/snapshots.tmp

echo "Dashboard updated: $HTML_FILE"