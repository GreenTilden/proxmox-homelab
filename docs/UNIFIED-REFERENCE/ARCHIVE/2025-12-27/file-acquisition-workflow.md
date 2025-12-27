# File Acquisition Workflow Guide

## Overview
This document describes the secure, containerized media acquisition workflow deployed on the Proxmox homelab, featuring dual VPN architecture for maximum security and remote access capabilities.

## Architecture Components

### 🛡️ Dual VPN Security Model
1. **Commercial VPN Client (Gluetun)**: Routes all download traffic through external VPN provider
2. **HomeVPN Server (WireGuard)**: Provides secure remote access to entire homelab

### 📦 Container Stack (Current Implementation)
- **Firefox Container**: Containerized web browser for secure browsing (Docker)
- **qBittorrent**: Download client in LXC CT 110 (native Proxmox container)
- **WireGuard**: VPN server for remote homelab access
- **Automated Processing**: Python-based media organization pipeline

## Storage Architecture

### Directory Structure
```
/staging-pool/ (696GB - Working Space)
├── downloads/
│   ├── incomplete/      # Active downloads
│   └── complete/        # Finished downloads
└── processing/          # Manual curation area

/media-pool/ (8.7TB - Final Storage)
├── movies/              # Plex movie library
├── tv-shows/            # Plex TV library
└── music/               # Plex music library

/service-pool/ (232GB - Container Configs)
├── gluetun/             # VPN client config
├── qbittorrent/         # Download client config
├── firefox/             # Browser config
└── wireguard/           # VPN server config
```

### ZFS Integration
- **Fast Downloads**: staging-pool (SSD-backed working space)
- **Bulk Storage**: media-pool (9TB for final content)
- **Container Data**: service-pool (fast SSD for app configs)

## Workflow Process

### Step 1: Secure Content Discovery
1. **Access Firefox Container**: http://192.168.0.99:3001
2. **VNC Interface**: Web-based desktop with isolated browser
3. **Safe Browsing**: Containerized environment prevents host contamination
4. **Download Links**: Copy magnet links or .torrent files

### Step 2: Secure Downloading
1. **qBittorrent Interface**: http://192.168.0.111:8112 (username: "admin", password: "adminadmin")
2. **LXC Container**: CT 110 running native Ubuntu 22.04
3. **Direct Storage**: Downloads directly to `/staging-pool/downloads/`
4. **Monitoring**: Real-time torrent progress via Grafana dashboard

### Step 3: Automated Content Processing ✅
1. **Automatic Detection**: Python script classifies TV shows vs Movies
2. **Smart Organization**: Year-based directories with metadata extraction
3. **Safe Processing**: Error handling and comprehensive logging
4. **Processing Script**: `/usr/local/bin/media-processor.py`
   ```bash
   # Manual processing
   python3 /usr/local/bin/media-processor.py
   
   # Test run (no changes)
   python3 /usr/local/bin/media-processor.py --dry-run
   
   # Process specific directory
   python3 /usr/local/bin/media-processor.py --directory "Series Name"
   ```

### Step 4: Plex Integration
1. **Automatic Scanning**: Plex detects new content in media directories
2. **Library Updates**: Content appears in Plex within minutes
3. **Metadata Matching**: Plex automatically matches and organizes content

## Security Features

### Network Isolation
- **Download Traffic**: All qBittorrent traffic through commercial VPN
- **Browser Isolation**: Firefox runs in separate container
- **Kill Switch**: Gluetun terminates connections if VPN fails
- **DNS Protection**: All DNS queries through VPN tunnel

### Remote Access Security
- **WireGuard Encryption**: Military-grade encryption for remote access
- **Key-Based Authentication**: No password-based access
- **Network Tunneling**: Full homelab access through secure tunnel

## Service URLs

### Local Network Access
- **Plex Media Server**: http://192.168.0.99:32400
- **qBittorrent Torrent Client**: http://192.168.0.111:8112 (username: admin, password: adminadmin)
- **Firefox Browser**: http://192.168.0.99:3001 (VNC interface)
- **FileBrowser**: http://192.168.0.99:8080 (file management)
- **Grafana Dashboard**: http://192.168.0.99:3000 (admin/test123)

### Remote Access (via WireGuard)
1. **Connect to WireGuard VPN** using client configuration
2. **Access all services** through VPN tunnel as if on local network
3. **Full Functionality**: Complete homelab access from anywhere

## Configuration Files

### Docker Compose Deployment
```bash
# Deploy entire media acquisition stack
cd /home/darney/projects/proxmox-homelab/configs/
docker-compose -f media-acquisition-stack.yml up -d

# Check status
docker-compose -f media-acquisition-stack.yml ps

# View logs
docker-compose -f media-acquisition-stack.yml logs [service-name]
```

### VPN Provider Setup
1. **Choose Provider**: Mullvad, ProtonVPN, Surfshark, etc.
2. **Get Credentials**: WireGuard private key and server details
3. **Update Config**: Edit `media-acquisition-stack.yml` with your credentials
4. **Redeploy**: `docker-compose up -d gluetun`

### WireGuard Client Setup
1. **Find Configs**: Check `/service-pool/wireguard/` for client .conf files
2. **QR Codes**: Use `docker exec wireguard-server /app/show-peer peer1` for mobile
3. **Install Client**: WireGuard app on phone/laptop
4. **Connect**: Import configuration and connect

## Troubleshooting

### VPN Connection Issues
```bash
# Check Gluetun status
docker logs gluetun-vpn

# Test IP address (should show VPN provider IP)
docker exec gluetun-vpn curl ifconfig.me

# Restart VPN if needed
docker restart gluetun-vpn qbittorrent
```

### Download Issues
```bash
# Check qBittorrent logs
docker logs qbittorrent

# Verify directory permissions
ls -la /staging-pool/downloads/

# Fix permissions if needed
chmod -R 755 /staging-pool/downloads/
```

### Remote Access Issues
```bash
# Check WireGuard server
docker logs wireguard-server

# Verify port forwarding (router must forward 51820/udp)
# Test from external network: nmap -sU -p 51820 YOUR_PUBLIC_IP
```

## Performance Optimization

### Storage Optimization
- **Downloads**: Fast staging-pool for active transfers
- **Processing**: Manual review on staging before final placement
- **Archives**: Large media-pool for long-term storage

### Network Optimization
- **VPN Server Selection**: Choose geographically close VPN servers
- **Protocol Selection**: WireGuard preferred over OpenVPN for speed
- **Bandwidth Management**: qBittorrent rate limiting if needed

## Best Practices

### Security
1. **Regular Updates**: Keep all containers updated
2. **VPN Monitoring**: Verify VPN connectivity regularly
3. **Access Logs**: Monitor WireGuard connection logs
4. **Credential Rotation**: Update VPN credentials periodically

### Maintenance
1. **Storage Monitoring**: Check disk space regularly via Grafana
2. **Container Health**: Monitor container status and logs
3. **Backup Configs**: Backup `/service-pool/` configurations
4. **Network Testing**: Verify VPN and remote access functionality

## Integration with Existing Services

### Monitoring Integration
- **Grafana Dashboards**: Monitor download speeds and storage usage
- **Prometheus Metrics**: Container health and system resources
- **ZFS Monitoring**: Pool health and capacity tracking

### File Management
- **FileBrowser Integration**: Direct file management through web interface
- **Plex Integration**: Automatic library scanning and updates
- **Storage Architecture**: Consistent ZFS pool mounting patterns

This workflow provides enterprise-grade security with user-friendly operation, ensuring safe content acquisition while maintaining easy access to your media library from anywhere.