#!/bin/bash
# Complete AI Services Stack Deployment Script
# Deploys Ollama + Open WebUI with RTX 5070 Ti GPU support

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== AI Services Stack Deployment ===${NC}"
echo "Components: Ollama, Open WebUI, Model Management"
echo "GPU: RTX 5070 Ti (16GB VRAM)"
echo ""

# Configuration
OLLAMA_PORT=11434
WEBUI_PORT=3002
AI_MODELS_PATH="/ai-models"
AI_STAGING_PATH="/ai-staging"

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker installed${NC}"
    
    # Check NVIDIA drivers
    if ! command -v nvidia-smi &> /dev/null; then
        echo -e "${YELLOW}⚠️ NVIDIA drivers not installed${NC}"
        echo "Run: ./scripts/nvidia-driver-install.sh first"
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        echo -e "${GREEN}✅ NVIDIA drivers installed${NC}"
        nvidia-smi --query-gpu=name,memory.total --format=csv,noheader || true
    fi
    
    # Check nvidia-container-toolkit
    if ! docker info 2>/dev/null | grep -q nvidia; then
        echo -e "${YELLOW}Installing nvidia-container-toolkit...${NC}"
        apt update
        apt install -y nvidia-container-toolkit
        nvidia-ctk runtime configure --runtime=docker
        systemctl restart docker
    fi
    echo -e "${GREEN}✅ Container GPU support configured${NC}"
}

# Function to setup storage
setup_storage() {
    echo -e "${YELLOW}Setting up AI storage...${NC}"
    
    # Create ZFS datasets if they don't exist
    if ! zfs list service-pool/ai-models &>/dev/null; then
        echo "Creating AI models dataset..."
        zfs create -o mountpoint=/ai-models service-pool/ai-models
        zfs create -o compression=lz4 -o quota=150G service-pool/ai-models/ollama
        zfs create -o compression=lz4 -o quota=20G service-pool/ai-models/cache
        zfs create -o mountpoint=/ai-models/configs service-pool/ai-models/configs
    fi
    
    if ! zfs list staging-pool/ai-staging &>/dev/null; then
        echo "Creating AI staging dataset..."
        zfs create -o mountpoint=/ai-staging staging-pool/ai-staging
        zfs create staging-pool/ai-staging/downloads
        zfs create staging-pool/ai-staging/experiments
        zfs create staging-pool/ai-staging/backups
    fi
    
    # Set permissions
    chmod 755 /ai-models /ai-staging
    
    echo -e "${GREEN}✅ Storage configured${NC}"
    zfs list | grep ai- || true
}

# Function to create docker-compose.yml
create_compose_file() {
    echo -e "${YELLOW}Creating Docker Compose configuration...${NC}"
    
    cat > /root/ai-stack-compose.yml << 'EOF'
version: '3.8'

networks:
  ai-net:
    driver: bridge

services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama-service
    runtime: nvidia
    environment:
      - NVIDIA_VISIBLE_DEVICES=0
      - OLLAMA_MODELS=/models
      - OLLAMA_HOST=0.0.0.0:11434
      - OLLAMA_KEEP_ALIVE=24h
      - CUDA_VISIBLE_DEVICES=0
    volumes:
      - /ai-models/ollama:/models:rw
      - /ai-models/cache:/cache:rw
    ports:
      - "11434:11434"
    networks:
      - ai-net
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
      - WEBUI_AUTH=false
      - WEBUI_PORT=8080
      - DATA_DIR=/data
    volumes:
      - /ai-models/configs/webui:/data:rw
    ports:
      - "3002:8080"
    networks:
      - ai-net
    depends_on:
      - ollama
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
EOF
    
    echo -e "${GREEN}✅ Docker Compose file created${NC}"
}

# Function to deploy services
deploy_services() {
    echo -e "${YELLOW}Deploying AI services...${NC}"
    
    cd /root
    
    # Stop existing services if running
    docker-compose -f ai-stack-compose.yml down 2>/dev/null || true
    
    # Pull latest images
    docker-compose -f ai-stack-compose.yml pull
    
    # Start services
    docker-compose -f ai-stack-compose.yml up -d
    
    # Wait for services to be healthy
    echo "Waiting for services to start..."
    sleep 10
    
    # Check service health
    if docker ps | grep -q ollama-service; then
        echo -e "${GREEN}✅ Ollama service running${NC}"
    else
        echo -e "${RED}❌ Ollama service failed to start${NC}"
        docker logs ollama-service
        exit 1
    fi
    
    if docker ps | grep -q open-webui; then
        echo -e "${GREEN}✅ Open WebUI running${NC}"
    else
        echo -e "${RED}❌ Open WebUI failed to start${NC}"
        docker logs open-webui
        exit 1
    fi
}

# Function to pull initial models
pull_initial_models() {
    echo -e "${YELLOW}Pulling initial AI models...${NC}"
    echo "This may take 10-30 minutes depending on internet speed"
    
    # Start with smaller models first
    models=(
        "llama3:8b"              # 4.7GB - Fast general purpose
        "codellama:7b"           # 3.8GB - Fast code completion
        "nomic-embed-text"       # 274MB - Embeddings
    )
    
    for model in "${models[@]}"; do
        echo -e "${BLUE}Pulling model: $model${NC}"
        docker exec ollama-service ollama pull $model || {
            echo -e "${YELLOW}⚠️ Failed to pull $model, continuing...${NC}"
        }
    done
    
    # List installed models
    echo -e "${GREEN}Installed models:${NC}"
    docker exec ollama-service ollama list
}

# Function to create helper scripts
create_helper_scripts() {
    echo -e "${YELLOW}Creating helper scripts...${NC}"
    
    # Model management script
    cat > /root/ai-model-manager.sh << 'EOF'
#!/bin/bash
# AI Model Manager

case "$1" in
    list)
        docker exec ollama-service ollama list
        ;;
    pull)
        docker exec ollama-service ollama pull "$2"
        ;;
    delete)
        docker exec ollama-service ollama rm "$2"
        ;;
    run)
        docker exec -it ollama-service ollama run "$2"
        ;;
    *)
        echo "Usage: $0 {list|pull <model>|delete <model>|run <model>}"
        exit 1
        ;;
esac
EOF
    chmod +x /root/ai-model-manager.sh
    
    # Service status script
    cat > /root/ai-status.sh << 'EOF'
#!/bin/bash
echo "=== AI Services Status ==="
echo ""
echo "Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "ollama|webui"
echo ""
echo "GPU Usage:"
nvidia-smi --query-gpu=name,memory.used,memory.total,utilization.gpu --format=csv
echo ""
echo "Models:"
docker exec ollama-service ollama list 2>/dev/null || echo "Ollama not running"
echo ""
echo "Storage:"
df -h | grep ai-
echo ""
echo "Access URLs:"
echo "- Ollama API: http://192.168.0.99:11434"
echo "- Open WebUI: http://192.168.0.99:3002"
EOF
    chmod +x /root/ai-status.sh
    
    # Quick test script
    cat > /root/ai-test.sh << 'EOF'
#!/bin/bash
echo "Testing Ollama API..."
curl -s http://localhost:11434/api/tags | jq '.models[].name' 2>/dev/null || echo "API not responding"

echo -e "\nTesting inference..."
curl -s -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3:8b",
    "prompt": "Hello, please respond with OK if you are working",
    "stream": false
  }' | jq '.response' 2>/dev/null || echo "Inference failed"
EOF
    chmod +x /root/ai-test.sh
    
    echo -e "${GREEN}✅ Helper scripts created${NC}"
}

# Function to setup monitoring
setup_monitoring() {
    echo -e "${YELLOW}Setting up AI monitoring...${NC}"
    
    # Add to Grafana if available
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "Adding AI metrics to Grafana..."
        # This would add dashboards - implementation depends on Grafana setup
    fi
    
    # Create simple monitoring cron
    cat > /etc/cron.d/ai-monitor << 'EOF'
*/5 * * * * root /root/ai-status.sh > /var/log/ai-status.log 2>&1
EOF
    
    echo -e "${GREEN}✅ Monitoring configured${NC}"
}

# Function to show completion message
show_completion() {
    echo ""
    echo -e "${GREEN}=== AI Stack Deployment Complete ===${NC}"
    echo ""
    echo "Access Points:"
    echo -e "${BLUE}Ollama API:${NC} http://192.168.0.99:${OLLAMA_PORT}"
    echo -e "${BLUE}Open WebUI:${NC} http://192.168.0.99:${WEBUI_PORT}"
    echo ""
    echo "Helper Scripts:"
    echo "- /root/ai-status.sh         - Check service status"
    echo "- /root/ai-model-manager.sh  - Manage models"
    echo "- /root/ai-test.sh          - Test functionality"
    echo ""
    echo "Next Steps:"
    echo "1. Access Open WebUI at http://192.168.0.99:${WEBUI_PORT}"
    echo "2. Pull additional models: ./ai-model-manager.sh pull codellama:34b"
    echo "3. Configure VSCode Continue.dev to use Ollama API"
    echo ""
    echo -e "${YELLOW}Note: Large models (34B+) require significant download time${NC}"
}

# Main deployment flow
main() {
    echo -e "${GREEN}Starting AI services deployment...${NC}"
    echo ""
    
    # Check if running as root
    if [ "$EUID" -ne 0 ]; then 
        echo -e "${RED}Please run as root${NC}"
        exit 1
    fi
    
    # Run deployment steps
    check_prerequisites
    setup_storage
    create_compose_file
    deploy_services
    pull_initial_models
    create_helper_scripts
    setup_monitoring
    show_completion
    
    # Run initial test
    echo ""
    echo -e "${YELLOW}Running initial test...${NC}"
    /root/ai-test.sh
}

# Run main function
main "$@"