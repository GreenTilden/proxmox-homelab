#!/bin/bash

# Enhanced System Health Monitor with ZFS Health Tracking
# Version 3.0 - Added ZFS pool monitoring and alerting

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOG_FILE="/var/log/system-health.log"
ALERT_LOG="/var/log/system-alerts.log"

# Alert thresholds
CPU_TEMP_WARN=75
CPU_TEMP_CRIT=82
LOAD_WARN=4.0
LOAD_CRIT=6.0
MEM_WARN=80
MEM_CRIT=90

# Function to send alerts
send_alert() {
    local LEVEL=$1
    local MESSAGE=$2
    echo "[$TIMESTAMP] [$LEVEL] $MESSAGE" >> "$ALERT_LOG"
    # Future: email/webhook notifications can be added here
}

# Function to check ZFS health
check_zfs_health() {
    echo "=== ZFS POOL STATUS ==="
    printf "%-15s %-10s %-15s %-15s %-15s %-10s\n" "POOL" "STATE" "CAPACITY" "FRAGMENTATION" "ERRORS" "STATUS"
    printf "%-15s %-10s %-15s %-15s %-15s %-10s\n" "---------------" "----------" "---------------" "---------------" "---------------" "----------"

    # Check each pool
    zpool list -H | while IFS=$'\t' read -r name size alloc free ckpoint expandsz frag cap dedup health altroot; do
        # Parse capacity percentage
        cap_num=$(echo "$cap" | tr -d '%')
        
        # Determine status based on health and capacity
        status="HEALTHY"
        if [[ "$health" != "ONLINE" ]]; then
            status="DEGRADED"
            send_alert "CRITICAL" "ZFS Pool '$name' is $health"
        elif [[ "$cap_num" -gt 85 ]]; then
            status="FULL"
            send_alert "WARNING" "ZFS Pool '$name' is ${cap}% full"
        elif [[ "$cap_num" -gt 75 ]]; then
            status="HIGH"
            send_alert "INFO" "ZFS Pool '$name' is ${cap}% full"
        fi

        # Check for errors
        errors=$(zpool status "$name" | grep -E "(READ|WRITE|CKSUM)" | grep -v "0.*0.*0" | wc -l)
        if [[ "$errors" -gt 0 ]]; then
            status="ERRORS"
            send_alert "CRITICAL" "ZFS Pool '$name' has $errors error conditions"
        fi

        printf "%-15s %-10s %-15s %-15s %-15s %-10s\n" "$name" "$health" "$cap" "$frag" "$errors" "$status"
    done

    echo
    echo "=== ZFS DATASET USAGE ==="
    printf "%-40s %-10s %-10s %-10s\n" "DATASET" "USED" "AVAILABLE" "REFER"
    printf "%-40s %-10s %-10s %-10s\n" "----------------------------------------" "----------" "----------" "----------"
    
    zfs list -H -o name,used,available,refer | while IFS=$'\t' read -r name used avail refer; do
        printf "%-40s %-10s %-10s %-10s\n" "$name" "$used" "$avail" "$refer"
    done
    echo
}

# Function to check drive health
check_drive_health() {
    echo "=== DRIVE HEALTH CHECKS ==="
    printf "%-10s %-15s %-15s %-15s %-10s\n" "DEVICE" "SMART STATUS" "TEMPERATURE" "REALLOCATED" "STATUS"
    printf "%-10s %-15s %-15s %-15s %-10s\n" "----------" "---------------" "---------------" "---------------" "----------"

    for device in /dev/sd*; do
        if [[ "$device" =~ /dev/sd[a-z]$ ]]; then
            dev_name=$(basename "$device")
            
            # Check if SMART is available
            if smartctl -H "$device" >/dev/null 2>&1; then
                smart_status=$(smartctl -H "$device" | grep "SMART overall-health" | awk '{print $NF}')
                temp=$(smartctl -A "$device" | grep "Temperature" | head -1 | awk '{print $10}' 2>/dev/null)
                reallocated=$(smartctl -A "$device" | grep "Reallocated_Sector_Ct" | awk '{print $10}' 2>/dev/null)
                
                status="HEALTHY"
                if [[ "$smart_status" != "PASSED" ]]; then
                    status="FAILING"
                    send_alert "CRITICAL" "Drive $device SMART status: $smart_status"
                elif [[ -n "$reallocated" && "$reallocated" -gt 0 ]]; then
                    status="DEGRADED"
                    send_alert "WARNING" "Drive $device has $reallocated reallocated sectors"
                elif [[ -n "$temp" && "$temp" -gt 50 ]]; then
                    status="HOT"
                fi

                printf "%-10s %-15s %-15s %-15s %-10s\n" "$dev_name" "${smart_status:-N/A}" "${temp:-N/A}°C" "${reallocated:-0}" "$status"
            else
                printf "%-10s %-15s %-15s %-15s %-10s\n" "$dev_name" "NO SMART" "N/A" "N/A" "UNKNOWN"
            fi
        fi
    done
    echo
}

# Function to log output
log_output() {
    {
        echo "=== PROXMOX SYSTEM HEALTH REPORT - $TIMESTAMP ==="
        echo

        # Power Consumption Table
        echo "=== POWER CONSUMPTION ==="
        printf "%-20s %-15s %-15s %-10s\n" "COMPONENT" "CURRENT (W)" "AVERAGE (W)" "STATUS"
        printf "%-20s %-15s %-15s %-10s\n" "--------------------" "---------------" "---------------" "----------"

        # Intel RAPL power readings
        if [ -d /sys/class/powercap/intel-rapl:0 ]; then
            CPU_POWER=$(cat /sys/class/powercap/intel-rapl:0/energy_uj 2>/dev/null)
            if [ -n "$CPU_POWER" ]; then
                CPU_WATTS=$(echo "scale=1; $CPU_POWER / 1000000" | bc 2>/dev/null || echo "N/A")
                printf "%-20s %-15s %-15s %-10s\n" "CPU Package" "${CPU_WATTS}W" "~45W" "NORMAL"
            fi
        fi

        # GPU power (if nvidia-smi available)
        if command -v nvidia-smi >/dev/null 2>&1; then
            RTX_POWER=$(nvidia-smi --query-gpu=power.draw --format=csv,noheader,nounits -i 0 2>/dev/null)
            GTX_POWER=$(nvidia-smi --query-gpu=power.draw --format=csv,noheader,nounits -i 1 2>/dev/null)
            
            if [ -n "$RTX_POWER" ]; then
                printf "%-20s %-15s %-15s %-10s\n" "RTX 5070 Ti" "${RTX_POWER}W" "~200W" "NORMAL"
            else
                printf "%-20s %-15s %-15s %-10s\n" "RTX 5070 Ti" "N/A" "~200W" "NO DRIVER"
            fi
            
            if [ -n "$GTX_POWER" ]; then
                printf "%-20s %-15s %-15s %-10s\n" "GTX 970" "${GTX_POWER}W" "~145W" "NORMAL"
            else
                printf "%-20s %-15s %-15s %-10s\n" "GTX 970" "N/A" "~145W" "NO DRIVER"
            fi
        else
            printf "%-20s %-15s %-15s %-10s\n" "RTX 5070 Ti" "N/A" "~200W" "NO DRIVER"
            printf "%-20s %-15s %-15s %-10s\n" "GTX 970" "N/A" "~145W" "NO DRIVER"
        fi

        # System power estimate
        printf "%-20s %-15s %-15s %-10s\n" "System Total" "~400W" "~450W" "ESTIMATE"
        echo

        # Temperature Table with alerts
        echo "=== TEMPERATURE MONITORING ==="
        printf "%-20s %-10s %-10s %-10s %-15s\n" "COMPONENT" "CURRENT" "CRITICAL" "STATUS" "NOTES"
        printf "%-20s %-10s %-10s %-10s %-15s\n" "--------------------" "----------" "----------" "----------" "---------------"

        # CPU temperatures
        sensors 2>/dev/null | grep "Core" | while IFS= read -r line; do
            CORE=$(echo "$line" | grep -o "Core [0-9]")
            TEMP=$(echo "$line" | grep -o "+[0-9]*\.[0-9]*°C" | head -1 | tr -d '+°C')
            if [ -n "$TEMP" ]; then
                if (( $(echo "$TEMP > $CPU_TEMP_CRIT" | bc -l 2>/dev/null || echo "0") )); then
                    STATUS="CRITICAL"
                    send_alert "CRITICAL" "CPU $CORE temperature critical: ${TEMP}°C"
                elif (( $(echo "$TEMP > $CPU_TEMP_WARN" | bc -l 2>/dev/null || echo "0") )); then
                    STATUS="WARM"
                    send_alert "WARNING" "CPU $CORE temperature high: ${TEMP}°C"
                elif (( $(echo "$TEMP > 50" | bc -l 2>/dev/null || echo "0") )); then
                    STATUS="NORMAL"
                else
                    STATUS="COOL"
                fi
                printf "%-20s %-10s %-10s %-10s %-15s\n" "CPU $CORE" "${TEMP}°C" "${CPU_TEMP_CRIT}°C" "$STATUS" "i7-8700"
            fi
        done

        # System Load Table with alerts
        echo
        echo "=== SYSTEM PERFORMANCE ==="
        printf "%-20s %-15s %-15s %-10s\n" "METRIC" "CURRENT" "THRESHOLD" "STATUS"
        printf "%-20s %-15s %-15s %-10s\n" "--------------------" "---------------" "---------------" "----------"

        LOAD_1MIN=$(uptime | grep -o "load average: [0-9]*\.[0-9]*" | cut -d' ' -f3)
        LOAD_STATUS="NORMAL"
        if (( $(echo "$LOAD_1MIN > $LOAD_CRIT" | bc -l 2>/dev/null || echo "0") )); then 
            LOAD_STATUS="CRITICAL"
            send_alert "CRITICAL" "System load critical: $LOAD_1MIN"
        elif (( $(echo "$LOAD_1MIN > $LOAD_WARN" | bc -l 2>/dev/null || echo "0") )); then 
            LOAD_STATUS="HIGH"
            send_alert "WARNING" "System load high: $LOAD_1MIN"
        fi

        printf "%-20s %-15s %-15s %-10s\n" "Load Average (1m)" "$LOAD_1MIN" "$LOAD_WARN" "$LOAD_STATUS"

        MEM_USED=$(free | awk '/^Mem:/ {printf "%.1f", $3/1024/1024}')
        MEM_TOTAL=$(free | awk '/^Mem:/ {printf "%.1f", $2/1024/1024}')
        MEM_PERCENT=$(free | awk '/^Mem:/ {printf "%.0f", ($3/$2)*100}')
        MEM_STATUS="NORMAL"
        if [ "$MEM_PERCENT" -gt "$MEM_CRIT" ]; then 
            MEM_STATUS="CRITICAL"
            send_alert "CRITICAL" "Memory usage critical: ${MEM_PERCENT}%"
        elif [ "$MEM_PERCENT" -gt "$MEM_WARN" ]; then 
            MEM_STATUS="HIGH"
            send_alert "WARNING" "Memory usage high: ${MEM_PERCENT}%"
        fi

        printf "%-20s %-15s %-15s %-10s\n" "Memory Usage" "${MEM_USED}GB (${MEM_PERCENT}%)" "${MEM_TOTAL}GB" "$MEM_STATUS"

        UPTIME_STR=$(uptime -p)
        printf "%-20s %-15s %-15s %-10s\n" "System Uptime" "$UPTIME_STR" "N/A" "STABLE"
        echo

        # ZFS Health Checks
        check_zfs_health

        # Drive Health Checks
        check_drive_health

        # Active Operations
        echo "=== ACTIVE OPERATIONS ==="
        RECOVERY_PROCS=$(ps aux | grep -E 'ddrescue|photorec|testdisk' | grep -v grep | wc -l)
        if [ "$RECOVERY_PROCS" -gt 0 ]; then
            echo "Data recovery operations active:"
            ps aux | grep -E 'ddrescue|photorec|testdisk' | grep -v grep | awk '{print "   " $11 " (PID: " $2 ")"}'
        else
            echo "No active recovery operations"
        fi

        # Docker containers
        echo
        echo "=== CONTAINER STATUS ==="
        if command -v docker >/dev/null 2>&1; then
            printf "%-20s %-10s %-15s %-15s\n" "CONTAINER" "STATUS" "IMAGE" "PORTS"
            printf "%-20s %-10s %-15s %-15s\n" "--------------------" "----------" "---------------" "---------------"
            docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Image}}\t{{.Ports}}" | tail -n +2 | while read -r name status image ports; do
                printf "%-20s %-10s %-15s %-15s\n" "$name" "$status" "$image" "$ports"
            done
        else
            echo "Docker not available"
        fi
        echo

        echo "=== END REPORT ==="
        echo
    } | tee -a "$LOG_FILE"
}

# Main execution
log_output

# Rotate logs if they get too large (>10MB)
for log in "$LOG_FILE" "$ALERT_LOG"; do
    if [ -f "$log" ] && [ $(stat -f%z "$log" 2>/dev/null || stat -c%s "$log" 2>/dev/null || echo 0) -gt 10485760 ]; then
        mv "$log" "${log}.old"
        touch "$log"
        chmod 644 "$log"
    fi
done