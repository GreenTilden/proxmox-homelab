# Currently Deployed Services

**Last Verified**: 2025-08-25 11:17 EDT via SSH to 192.168.0.99

## Service Status Summary

**Overall Status**: 6/8 services running (2 services down)

## ✅ Working Services (6/8)

### Web Services
| Service | URL | Status Code | Container Status | Notes |
|---------|-----|-------------|------------------|-------|
| **FileBrowser** | http://192.168.0.99:8080 | 200 | filebrowser-zfs (healthy) | ZFS pool access working |
| **Prometheus** | http://192.168.0.99:9090 | 302 | prometheus (up 1+ hour) | Metrics collection active |
| **Firefox** | http://192.168.0.99:3001 | 200 | firefox-simple (up 1+ hour) | VNC web browser |

### Media Services  
| Service | URL | Status Code | Implementation | Notes |
|---------|-----|-------------|----------------|-------|
| **Plex Media Server** | http://192.168.0.99:32400 | 302 | Native process | Not containerized, working |

### System Services
| Service | Port | Status | Container | Purpose |
|---------|------|--------|-----------|---------|
| **Node Exporter** | 9100 | Active | node-exporter | System metrics |
| **WireGuard Server** | 51820/udp | Active | wireguard-server | VPN access |

## ❌ Non-Working Services (2/8)

### Monitoring Stack Issues
| Service | Expected URL | Status | Issue | Last Seen |
|---------|-------------|--------|-------|-----------|
| **Grafana** | http://192.168.0.99:3000 | Container Stopped | Docker container "grafana" exited | 8 hours ago |
| **Deluge** | http://192.168.0.111:8112 | LXC Stopped | LXC container CT 110 "deluge-server" stopped | Unknown |

## Docker Container Details

**Verified via `docker ps` command:**

### Running Containers (5/6)
```
firefox-simple      Up 1+ hour    0.0.0.0:3001->5800/tcp
filebrowser-zfs     Up 1+ hour    healthy, 0.0.0.0:8080->80/tcp
wireguard-server    Up 1+ hour    0.0.0.0:51820->51820/udp
node-exporter       Up 1+ hour    0.0.0.0:9100->9100/tcp  
prometheus          Up 1+ hour    0.0.0.0:9090->9090/tcp
plex               Up 43 minutes  (no port mappings listed)
```

### Stopped Containers (1/6)
```
grafana             Exited 8 hours ago
```

## LXC Container Status

**Verified via `pct list` command:**

- **VMID 110**: deluge-server (STOPPED)

## Service Implementation Details

### Container Architecture
- **Docker Services**: 6 containers (5 running, 1 stopped)
- **LXC Services**: 1 container (stopped)  
- **Native Services**: 1 service (Plex running directly on host)

### Container Mounts (Verified - Plex Example)
```
/staging-pool -> /staging (bind mount)
/service-pool/docker/plex/config -> /config (bind mount)
/media-pool/plex/tv -> /tv (bind mount)  
/media-pool/plex/movies -> /movies (bind mount)
```

## Network Accessibility 

### Local Access (192.168.0.99)
- ✅ All working services respond to local requests
- ✅ Port bindings confirmed on expected interfaces
- ✅ Internal service communication functional

### External Access Status
- ⚠️ Services only responding to localhost requests
- ⚠️ External network access may be blocked by firewall
- ⚠️ Remote administration capabilities limited

## Missing Service Components

### Exporters Status
- **ZFS Exporter** (Port 9101): Cannot verify - port not found in active listeners
- **Deluge Exporter** (Port 9102): Cannot verify - Deluge service down

### Dashboard Access
- **Grafana Dashboards**: Inaccessible due to container being stopped
- **16-bit Gaming Theme**: Cannot verify with Grafana offline
- **Mobile Responsive Design**: Cannot test without active dashboard

## Service URLs Quick Reference

### ✅ Currently Accessible
```bash
curl http://192.168.0.99:8080     # FileBrowser (200)
curl http://192.168.0.99:9090     # Prometheus (302)  
curl http://192.168.0.99:3001     # Firefox (200)
curl http://192.168.0.99:32400    # Plex (302)
```

### ❌ Currently Inaccessible  
```bash
curl http://192.168.0.99:3000     # Grafana (connection refused)
curl http://192.168.0.111:8112    # Deluge (LXC stopped)
```

## System Resource Usage

**Docker Service Status**: Active (running), 109 tasks, 138MB memory usage

## Immediate Actions Required

1. **Restart Grafana**: `docker start grafana` to restore monitoring dashboard
2. **Start Deluge LXC**: `pct start 110` to restore torrent client
3. **Verify Exporters**: Check if ZFS/Deluge exporters are running
4. **Test External Access**: Investigate firewall settings for remote access

**Note**: Service count should be updated from "8/8 operational" to "6/8 operational" in all documentation until Grafana and Deluge are restored.