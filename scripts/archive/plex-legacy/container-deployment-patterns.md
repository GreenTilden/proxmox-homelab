# Successful Container Deployment Patterns

## Plex Media Server - Working Configuration

### Deployment Method: Docker Container
- **Image**: `linuxserver/plex:latest`
- **Port Mapping**: `32400:32400`
- **Storage Strategy**: Direct ZFS pool mounting

### Critical Mount Points
```bash
# ZFS Pool Mounts (Essential for proper operation)
-v /media-pool:/srv/media-pool:ro          # Read-only media access
-v /staging-pool:/srv/staging-pool:rw      # Transcoding workspace
-v /service-pool:/srv/service-pool:rw      # Configuration persistence

# Container-specific volumes
-v plex-config:/config                     # Application configuration
-v plex-transcode:/tmp                     # Temporary transcoding files
```

### Container Environment Variables
```bash
PLEX_CLAIM=claim-xxxxxxxxxxxxxx    # From plex.tv/claim
PUID=1000
PGID=1000
TZ=America/New_York
PLEX_UID=1000
PLEX_GID=1000
```

### Key Success Factors
1. **Direct ZFS Mounting**: Avoiding container filesystem limits
2. **Read-Only Media Access**: Prevents accidental modifications
3. **Dedicated Transcoding Space**: Uses high-IOPS staging pool
4. **Proper Claim Token**: Enables Google authentication

### Validated Working Status
- ✅ **Web Interface**: http://192.168.0.99:32400
- ✅ **Google Authentication**: Successfully configured
- ✅ **Library Scanning**: Operational on 8.7TB media pool
- ✅ **Transcoding**: Software transcoding functional

## FileBrowser - Working Configuration

### Deployment Method: Docker Container
- **Image**: `filebrowser/filebrowser`
- **Port Mapping**: `8080:80`
- **Access Pattern**: `/files/` endpoint (not root)

### Mount Strategy
```bash
# Complete ZFS pool access
-v /media-pool:/srv/media-pool:rw
-v /service-pool:/srv/service-pool:rw
-v /staging-pool:/srv/staging-pool:rw
-v /mnt:/srv/mnt:ro                        # System mounts (read-only)

# Configuration persistence
-v filebrowser-config:/config
-v filebrowser-db:/database
```

### Authentication Configuration
- **Method**: NoAuth (trusted network)
- **Access**: Direct file system management
- **Interface**: Web-based file operations

## General Container Deployment Principles

### Storage Architecture
1. **Never use container filesystem** for large data operations
2. **Direct ZFS pool mounting** avoids space limitations
3. **Read-only for media**, read-write for processing
4. **Dedicated pools** for different data types (media vs staging vs service)

### Container Health Patterns
- **Health Checks**: Implement proper HTTP endpoint monitoring
- **Graceful Shutdown**: Handle SIGTERM signals properly
- **Resource Limits**: Set appropriate memory/CPU constraints
- **Restart Policies**: Use `unless-stopped` for production services

### Successful Service Stack
- **Plex**: Media serving with Google authentication
- **FileBrowser**: File management with ZFS access
- **Grafana**: Monitoring with 16-bit gaming theme
- **Prometheus**: Metrics collection and alerting

## Lessons Learned

### What Works
- LinuxServer.io images for Plex (specific case)
- Official images for FileBrowser
- Direct ZFS pool mounting patterns
- Separate pools for different workload types

### What Doesn't Work
- LinuxServer.io images for torrent clients (s6 permission issues)
- Container-based storage for large media operations
- Single pool for all data types
- Default container network isolation for media services

### Best Practices Established
1. **Research container compatibility** before deployment
2. **Test with proper ZFS mounts** from the beginning
3. **Document working configurations** immediately after success
4. **Use LXC containers** when Docker has permission issues
5. **Monitor resource usage** during media operations