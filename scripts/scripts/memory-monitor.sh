#!/bin/bash

# Memory monitoring script for homelab
# Shows detailed breakdown of memory usage including containers

echo "=== Proxmox Homelab Memory Report - $(date) ==="
echo

# Basic memory stats
free -h
echo

# Container memory usage
echo "=== Docker Container Memory Usage ==="
if command -v docker &> /dev/null && docker ps -q | grep -q .; then
    docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.MemPerc}}" | sort -k3 -nr
else
    echo "No running containers"
fi
echo

# ZFS ARC cache
echo "=== ZFS ARC Cache ==="
if [ -f /proc/spl/kstat/zfs/arcstats ]; then
    awk '/^size/ {printf "ARC Size: %.1f GB\n", $3/1024/1024/1024}' /proc/spl/kstat/zfs/arcstats
    awk '/^c_max/ {printf "ARC Max: %.1f GB\n", $3/1024/1024/1024}' /proc/spl/kstat/zfs/arcstats
else
    echo "ZFS not available"
fi
echo

# Top memory processes
echo "=== Top Memory Processes ==="
ps aux --sort=-%mem | head -8
echo

# Memory breakdown
echo "=== Memory Analysis ==="
awk '
/MemTotal:/{total=$2/1024/1024}
/MemAvailable:/{avail=$2/1024/1024}
/Active\(anon\):/{anon=$2/1024/1024}
/Cached:/{cached=$2/1024/1024}
END{
    printf "Total RAM: %.1f GB\n", total
    printf "Available: %.1f GB\n", avail
    printf "Active(anon): %.1f GB\n", anon  
    printf "Used: %.1f GB (%.1f%%)\n", total-avail, (total-avail)/total*100
    if(anon > 20) printf "⚠️  WARNING: High anonymous memory usage (%.1f GB)\n", anon
}' /proc/meminfo
echo

# LXC containers
echo "=== LXC Containers ==="
pct list 2>/dev/null || echo "Proxmox not available"