# AI Services Deployment Architecture

## Overview
Complete AI/LLM stack deployment utilizing RTX 5070 Ti (16GB VRAM) for local model inference and development assistance.

## Core Components

### 1. Ollama - LLM Inference Engine
- **Purpose**: Local LLM model serving
- **GPU**: RTX 5070 Ti (device 0)
- **Port**: 11434
- **Models**: CodeLlama 34B, Deepseek Coder 33B, Mixtral 8x7B

### 2. Open WebUI - User Interface
- **Purpose**: Web-based chat interface for LLMs
- **Port**: 3000 (conflicts with Grafana, will use 3002)
- **Features**: Multi-model support, conversation history, API access

### 3. Continue.dev - VSCode Integration
- **Purpose**: AI coding assistant in development environment
- **Connection**: Direct to Ollama API
- **Features**: Code completion, explanation, refactoring

## Storage Architecture

### ZFS Pool Allocation
```
service-pool (232GB SSD) - Fast access for active models
├── /ai-models/
│   ├── ollama/          # Ollama model storage (150GB allocated)
│   ├── cache/           # Model cache and temporary files (20GB)
│   └── configs/         # Service configurations (1GB)

staging-pool (675GB) - Model downloads and experiments
├── /ai-staging/
│   ├── downloads/       # Model download staging (100GB)
│   ├── experiments/     # Fine-tuning and testing (50GB)
│   └── backups/         # Model backups (50GB)
```

### Model Storage Strategy
```bash
# Create ZFS datasets for AI
zfs create -o mountpoint=/ai-models service-pool/ai-models
zfs create -o compression=lz4 -o quota=150G service-pool/ai-models/ollama
zfs create -o compression=lz4 -o quota=20G service-pool/ai-models/cache
zfs create -o mountpoint=/ai-staging staging-pool/ai-staging
```

## Deployment Configuration

### Docker Compose Stack
```yaml
version: '3.8'

services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama-service
    runtime: nvidia
    environment:
      - NVIDIA_VISIBLE_DEVICES=0  # RTX 5070 Ti
      - OLLAMA_MODELS=/models
      - OLLAMA_HOST=0.0.0.0:11434
      - OLLAMA_KEEP_ALIVE=24h
      - CUDA_VISIBLE_DEVICES=0
    volumes:
      - /ai-models/ollama:/models:rw
      - /ai-models/cache:/cache:rw
    ports:
      - "11434:11434"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              device_ids: ['0']
              capabilities: [gpu]
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:11434/"]
      interval: 30s
      timeout: 10s
      retries: 3

  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    environment:
      - OLLAMA_API_BASE_URL=http://ollama:11434
      - WEBUI_AUTH=false  # Enable for production
      - WEBUI_PORT=8080
      - DATA_DIR=/data
    volumes:
      - /ai-models/configs/webui:/data:rw
    ports:
      - "3002:8080"  # Avoid Grafana conflict
    depends_on:
      - ollama
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Optional: LocalAI for additional model compatibility
  localai:
    image: quay.io/go-skynet/local-ai:latest
    container_name: localai-service
    runtime: nvidia
    environment:
      - NVIDIA_VISIBLE_DEVICES=0
      - THREADS=12
      - CONTEXT_SIZE=4096
      - MODELS_PATH=/models
    volumes:
      - /ai-models/localai:/models:rw
    ports:
      - "8081:8080"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              device_ids: ['0']
              capabilities: [gpu]
    restart: unless-stopped
    profiles: ["advanced"]  # Only start with --profile advanced
```

## Model Management

### Initial Model Setup Script
```bash
#!/bin/bash
# /scripts/ai-models-setup.sh

echo "=== AI Model Initial Setup ==="

# Pull essential models
models=(
    "codellama:34b"           # Code generation
    "deepseek-coder:33b"      # Advanced coding
    "mixtral:8x7b"            # General purpose
    "llama3:8b"               # Fast responses
    "nomic-embed-text"        # Embeddings
)

for model in "${models[@]}"; do
    echo "Pulling model: $model"
    docker exec ollama-service ollama pull $model
    
    # Show model info
    docker exec ollama-service ollama show $model --modelfile
done

# List all models
echo -e "\n=== Installed Models ==="
docker exec ollama-service ollama list

# Test inference
echo -e "\n=== Testing Inference ==="
docker exec ollama-service ollama run llama3:8b "Hello, test response"
```

### Model Performance Optimization
```bash
#!/bin/bash
# /scripts/optimize-ai-models.sh

# Quantization settings for different models
optimize_model() {
    local model=$1
    local quantization=$2
    
    echo "Optimizing $model with $quantization quantization..."
    
    # Create optimized version
    docker exec ollama-service ollama create "${model}-optimized" \
      --quantization $quantization \
      --gpu-layers 35 \
      --context-length 4096
}

# Optimize large models for RTX 5070 Ti (16GB VRAM)
optimize_model "codellama:34b" "q4_K_M"
optimize_model "mixtral:8x7b" "q4_0"
optimize_model "deepseek-coder:33b" "q5_K_S"
```

## Integration Patterns

### VSCode Continue.dev Configuration
```json
{
  "models": [
    {
      "title": "CodeLlama 34B",
      "model": "codellama:34b",
      "apiBase": "http://192.168.0.99:11434",
      "provider": "ollama"
    },
    {
      "title": "Deepseek Coder",
      "model": "deepseek-coder:33b",
      "apiBase": "http://192.168.0.99:11434",
      "provider": "ollama"
    }
  ],
  "tabAutocompleteModel": {
    "title": "Fast Autocomplete",
    "model": "codellama:7b",
    "apiBase": "http://192.168.0.99:11434",
    "provider": "ollama"
  },
  "allowAnonymousTelemetry": false
}
```

### API Access Examples
```python
# Python example
import requests

def query_ollama(prompt, model="llama3:8b"):
    response = requests.post(
        "http://192.168.0.99:11434/api/generate",
        json={
            "model": model,
            "prompt": prompt,
            "stream": False
        }
    )
    return response.json()["response"]

# Usage
result = query_ollama("Explain Docker networking")
print(result)
```

```bash
# Bash/curl example
curl -X POST http://192.168.0.99:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "codellama:34b",
    "prompt": "Write a Python function to calculate fibonacci",
    "stream": false
  }'
```

## Monitoring and Maintenance

### GPU Usage Monitoring
```bash
# Monitor GPU usage during inference
watch -n 1 'nvidia-smi | grep ollama'

# Track model memory usage
docker exec ollama-service ollama ps

# Monitor inference performance
docker logs -f ollama-service 2>&1 | grep "eval"
```

### Backup and Recovery
```bash
#!/bin/bash
# /scripts/backup-ai-models.sh

BACKUP_DIR="/ai-staging/backups/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

# Backup model files
echo "Backing up AI models..."
zfs snapshot service-pool/ai-models@backup-$(date +%Y%m%d)
zfs send service-pool/ai-models@backup-$(date +%Y%m%d) | \
  gzip > "$BACKUP_DIR/ai-models.zfs.gz"

# Backup configurations
tar -czf "$BACKUP_DIR/ai-configs.tar.gz" /ai-models/configs/

echo "Backup complete: $BACKUP_DIR"
```

## Performance Tuning

### RTX 5070 Ti Optimization
```yaml
# Optimal settings for 16GB VRAM
environment:
  - OLLAMA_NUM_GPU_LAYERS=35        # Maximum layers on GPU
  - OLLAMA_GPU_MEMORY_FRACTION=0.9  # Use 90% of VRAM
  - OLLAMA_NUM_THREADS=12           # Match CPU threads
  - CUDA_VISIBLE_DEVICES=0          # Lock to RTX 5070 Ti
```

### Model-Specific Settings
| Model | VRAM Usage | Optimal Batch | Context Length |
|-------|------------|---------------|----------------|
| CodeLlama 34B | ~14GB | 512 | 4096 |
| Deepseek 33B | ~13GB | 512 | 8192 |
| Mixtral 8x7B | ~12GB | 256 | 32768 |
| Llama3 8B | ~6GB | 1024 | 8192 |

## Security Considerations

### Network Isolation
```bash
# Create AI services network
docker network create ai-net --subnet=172.20.0.0/16

# Add firewall rules
iptables -A INPUT -p tcp --dport 11434 -s 192.168.0.0/24 -j ACCEPT
iptables -A INPUT -p tcp --dport 11434 -j DROP
```

### Authentication Setup
```yaml
# Enable authentication in production
open-webui:
  environment:
    - WEBUI_AUTH=true
    - WEBUI_SECRET_KEY=$(openssl rand -hex 32)
    - ENABLE_SIGNUP=false
```

## Deployment Checklist
- [ ] ZFS datasets created for AI storage
- [ ] NVIDIA drivers installed and tested
- [ ] Docker Compose stack deployed
- [ ] Initial models pulled
- [ ] Open WebUI accessible at port 3002
- [ ] Continue.dev configured in VSCode
- [ ] GPU monitoring active
- [ ] Backup strategy implemented
- [ ] Security rules configured