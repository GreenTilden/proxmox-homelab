# Article Digest Podcast System

A self-hosted, automated podcast generation system that aggregates RSS feeds, extracts full article text, generates audio using AI TTS, and serves a podcast feed for Pocket Casts.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  RSS Sources    │────▶│  FreshRSS       │────▶│  Text Extractor │
│  - Substacks    │     │  (CT 131)       │     │  Trafilatura    │
│  - News sites   │     │  192.168.0.131  │     │  (same CT)      │
│  - Blogs        │     │  :80 (Apache)   │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                        ┌────────────────────────────────┘
                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Pocket Casts   │◀────│  Podcast Server │◀────│  TTS Generator  │
│  (subscribe)    │     │  (CT 131)       │     │  Kokoro-82M     │
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
| Memory | 2GB + 1GB swap |
| Cores | 2 |
| Disk | 8GB (service-pool) |
| OS | Ubuntu 22.04 |

**Services:**
- FreshRSS (RSS aggregation) - port 80 (Apache)
- Apache (podcast feed server) - port 8081
- Trafilatura (text extraction)
- Orchestrator scripts (Python)

### CT 120 - gbgreg (GPU Server)

Uses existing server for TTS generation:
- **Kokoro-82M** via ONNX runtime (replaced Coqui TTS Feb 2026)
- CPU mode — runs ~2.5x real-time, far faster than old Coqui (~0.02x)
- 82M parameter model, ~338MB model files
- Flask API on port 5011
- 54 available voices (default: `af_heart`)

## Access URLs

| Service | URL |
|---------|-----|
| FreshRSS | http://192.168.0.131 |
| Podcast Feed | http://192.168.0.131:8081/feed.xml |
| TTS API Health | http://192.168.0.120:5011/health |
| TTS Voices | http://192.168.0.120:5011/voices |

## Credentials

- FreshRSS credentials: See `/opt/.env` on CT 131

## File Structure

### CT 131: /opt/podcast/
```
├── config.yaml           # Pipeline configuration
├── orchestrator.py       # Main CLI (--generate-now, --dry-run, --test-tts, etc.)
├── article_extractor.py  # FreshRSS Google Reader API client + trafilatura
├── tts_client.py         # TTS API client with retry logic
├── feed_generator.py     # iTunes-compatible RSS feed generator
├── episodes.json         # Episode state/metadata
└── venv/                 # Python virtual environment
```

### CT 131: /var/www/podcast/
```
├── feed.xml              # Podcast RSS feed
├── cover.png             # Podcast artwork
└── episodes/
    └── *.mp3             # Audio files
```

### CT 120: /opt/kokoro-tts/
```
├── tts_service.py        # Flask API for Kokoro TTS
├── kokoro-v1.0.onnx      # ONNX model (311MB)
├── voices-v1.0.bin       # Voice embeddings (27MB)
└── venv/                 # Python virtual environment
```

## Usage

### Generate Episode Manually

```bash
ssh proxmox "pct exec 131 -- /opt/podcast/venv/bin/python /opt/podcast/orchestrator.py --generate-now"
```

### Dry Run (show what would happen)

```bash
ssh proxmox "pct exec 131 -- /opt/podcast/venv/bin/python /opt/podcast/orchestrator.py --dry-run"
```

### Update Feed Only

```bash
ssh proxmox "pct exec 131 -- /opt/podcast/venv/bin/python /opt/podcast/orchestrator.py --update-feed"
```

### Test TTS Connection

```bash
ssh proxmox "pct exec 131 -- /opt/podcast/venv/bin/python /opt/podcast/orchestrator.py --test-tts"
```

### Test FreshRSS Connection

```bash
ssh proxmox "pct exec 131 -- /opt/podcast/venv/bin/python /opt/podcast/orchestrator.py --test-freshrss"
```

### Check TTS API Status

```bash
curl http://192.168.0.120:5011/health
```

## Adding to Pocket Casts

1. Open Pocket Casts app
2. Go to Search > Enter URL
3. Add: `http://192.168.0.131:8081/feed.xml`

For external access, expose via nginx/Authelia proxy.

## TTS API Endpoints (CT 120:5011)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Status check (engine, voices, mode) |
| `/voices` | GET | List all available voice IDs |
| `/synthesize` | POST | Short text -> WAV (max 5000 chars) |
| `/synthesize_mp3` | POST | Short text -> MP3 (max 5000 chars) |
| `/synthesize_long` | POST | Long text with auto-chunking -> MP3 (max 100K chars) |
| `/cleanup` | POST | Remove temp files older than 1 hour |

POST body: `{"text": "...", "voice": "af_heart", "speed": 1.0}`

## Systemd Services

### Kokoro TTS API (CT 120)

```bash
pct exec 120 -- systemctl status kokoro-tts
pct exec 120 -- systemctl restart kokoro-tts
pct exec 120 -- journalctl -u kokoro-tts -f
```

### Podcast Generator Timer (CT 131)

Runs biweekly on the 1st and 15th at 6am UTC.

```bash
pct exec 131 -- systemctl status podcast-generator.timer
pct exec 131 -- systemctl list-timers podcast-generator.timer
pct exec 131 -- journalctl -u podcast-generator.service -f
```

### Manual Trigger via systemd

```bash
pct exec 131 -- systemctl start podcast-generator.service
```

## Configuration

Edit `/opt/podcast/config.yaml` on CT 131:

```yaml
tts:
  url: "http://192.168.0.120:5011"
  voice: "af_heart"
  speed: 1.0
  timeout: 600

freshrss:
  url: "http://localhost"
  user: "admin"
  api_password: "${FRESHRSS_API_PASSWORD}  # See /opt/.env on CT 131"

podcast:
  title: "Article Digest"
  description: "AI-narrated articles from your RSS feeds"
  author: "Darren Arney"
  base_url: "http://192.168.0.131:8081"

selection:
  max_articles: 5
  min_words: 300
  max_words: 5000
  lookback_days: 14
  source: "starred"  # "starred" or "unread"
```

## Workflow

1. **Add feeds** to FreshRSS at http://192.168.0.131
2. **Star articles** you want in the next podcast episode
3. **Wait for timer** (1st/15th at 6am) or run `--generate-now`
4. Pipeline: fetch starred -> extract text -> generate TTS -> concatenate -> update feed
5. Processed articles are automatically un-starred

## Performance Metrics

- **Kokoro TTS**: ~2.5x real-time on CPU (332 words = 54s audio in 19s)
- **Episode generation**: ~2-5 minutes for a typical episode
- **Storage**: ~1MB per minute of audio (128kbps MP3)

## History

- **January 2026**: Initial setup — CT 131 created, FreshRSS installed, Coqui TTS on CT 120 (too slow: ~47s/word)
- **February 2026**: Full implementation — Replaced Coqui with Kokoro-82M (~2.5x RT), built complete pipeline (article extraction, TTS, feed generation, scheduling)
