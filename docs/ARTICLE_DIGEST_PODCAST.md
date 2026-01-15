# Article Digest Podcast System

A self-hosted, automated podcast generation system that aggregates RSS feeds, extracts full article text, generates audio using AI TTS, and serves a podcast feed for Pocket Casts.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  RSS Sources    │────▶│  FreshRSS       │────▶│  Text Extractor │
│  - Substacks    │     │  (CT 131)       │     │  Trafilatura    │
│  - News sites   │     │  192.168.0.131  │     │  (same CT)      │
│  - Blogs        │     │  :8080          │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                        ┌────────────────────────────────┘
                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Pocket Casts   │◀────│  Podcast Server │◀────│  TTS Generator  │
│  (subscribe)    │     │  (CT 131)       │     │  Coqui TTS      │
│                 │     │  :8081/feed.xml │     │  (CT 120 - CPU) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Container Configuration

### CT 131 - podcast-factory

| Setting | Value |
|---------|-------|
| CTID | 131 |
| Hostname | podcast-factory |
| IP | 192.168.0.131 |
| Memory | 1GB |
| Cores | 2 |
| Disk | 50GB (service-pool) |
| OS | Ubuntu 22.04 |

**Services:**
- FreshRSS (RSS aggregation) - port 8080
- Nginx (podcast feed server) - port 8081
- Trafilatura (text extraction)
- Orchestrator scripts (Python)

### CT 120 - gbgreg (GPU Server)

Uses existing GPU server for TTS generation:
- Coqui TTS installed alongside Ollama
- CPU mode (RTX 5070 Ti sm_120 not yet supported by PyTorch)
- Flask API on port 5011
- ~1.27x real-time generation speed

## Access URLs

| Service | URL |
|---------|-----|
| FreshRSS | http://192.168.0.131:8080 |
| Podcast Feed | http://192.168.0.131:8081/feed.xml |
| TTS API Health | http://192.168.0.120:5011/health |

## Credentials

- FreshRSS Admin: `admin` / `podcast2026`

## File Structure

### CT 131: /opt/podcast/
```
├── config.yaml           # Configuration
├── orchestrator.py       # Main scheduling script
├── tts_client.py         # TTS API client
├── feed_generator.py     # RSS feed creation
└── venv/                 # Python virtual environment
```

### CT 131: /var/www/podcast/
```
├── feed.xml              # Podcast RSS feed
├── cover.svg             # Podcast artwork
└── episodes/
    ├── episodes.json     # Episode metadata
    └── *.mp3             # Audio files
```

### CT 120: /opt/podcast-tts/
```
├── tts_service.py        # Flask API for TTS
└── venv/                 # Python virtual environment
```

## Usage

### Generate Episode Manually

```bash
ssh proxmox "pct exec 131 -- bash -c 'cd /opt/podcast && source venv/bin/activate && python orchestrator.py --generate-now'"
```

### Update Feed Only

```bash
ssh proxmox "pct exec 131 -- bash -c 'cd /opt/podcast && source venv/bin/activate && python orchestrator.py --update-feed'"
```

### Check TTS API Status

```bash
curl http://192.168.0.120:5011/health
```

## Adding to Pocket Casts

1. Open Pocket Casts app
2. Go to Search → Enter URL
3. Add: `http://192.168.0.131:8081/feed.xml`

For external access, expose via Caddy with authentication.

## Systemd Services

### TTS API (CT 120)

```bash
# Status
pct exec 120 -- systemctl status tts-api

# Restart
pct exec 120 -- systemctl restart tts-api

# Logs
pct exec 120 -- journalctl -u tts-api -f
```

## Configuration

Edit `/opt/podcast/config.yaml` on CT 131:

```yaml
# TTS API
tts:
  api_url: "http://192.168.0.120:5011"
  timeout: 300

# Podcast Settings
podcast:
  title: "Article Digest"
  description: "Biweekly digest of articles"
  author: "Darren"
  base_url: "http://192.168.0.131:8081"

# Article Selection
selection:
  max_articles: 5
  min_word_count: 300
  max_word_count: 5000
  lookback_days: 14
```

## Future Enhancements

### Pending Tasks
- [ ] Configure FreshRSS with initial RSS feeds
- [ ] Set up cron job for biweekly episode generation
- [ ] Integrate FreshRSS API for article selection
- [ ] Add GPU support when AMD RX 6800 XT is available

### Optional Improvements
- External access via Caddy with authentication
- Multiple voice options
- Chapter markers for each article
- Show notes with article links

## Technical Notes

### RTX 5070 Ti CUDA Compatibility

The RTX 5070 Ti uses sm_120 (Blackwell architecture) which is not yet supported by PyTorch (as of PyTorch 2.6.0). TTS runs in CPU mode with acceptable performance (~1.27x real-time).

When AMD RX 6800 XT becomes available, ROCm can be explored as an alternative.

### Performance Metrics

- TTS generation: ~1.27x real-time (faster than playback)
- Episode generation: ~2-3 minutes for 5 articles
- Storage: ~50MB per 45-minute episode

## Created

- **Date**: January 14, 2026
- **Author**: Claude Code
