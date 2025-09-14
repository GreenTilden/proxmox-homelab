#!/bin/bash

# Deploy Ollama + Open WebUI for AI/LLM Stack
# Homelab Mario Dashboard - Automation Scripts

set -e

echo "🚀 Mario Homelab - Deploying Ollama + Open WebUI Stack"
echo "======================================================"

# Configuration
OLLAMA_CT_ID=300
OPENWEBUI_CT_ID=301
OLLAMA_HOSTNAME="ollama-server"
OPENWEBUI_HOSTNAME="openwebui"

# Color output functions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on Proxmox host
if ! command -v pct >/dev/null 2>&1; then
    log_error "This script must be run on a Proxmox VE host"
    exit 1
fi

# Deploy Ollama LXC Container
deploy_ollama() {
    log_info "Deploying Ollama LXC Container..."
    
    # Download and execute the community script
    bash -c "$(curl -fsSL https://raw.githubusercontent.com/community-scripts/ProxmoxVE/main/ct/ollama.sh)" << EOF
$OLLAMA_CT_ID
$OLLAMA_HOSTNAME
4
8192
50
service-pool
debian-12-standard_12.2-1_amd64.tar.zst
auto
EOF

    log_info "Ollama container deployed with ID: $OLLAMA_CT_ID"
    
    # Start the container
    pct start $OLLAMA_CT_ID
    log_info "Ollama container started"
    
    # Wait for container to be ready
    sleep 30
    
    # Install basic models
    log_info "Installing base AI models..."
    pct exec $OLLAMA_CT_ID -- ollama pull llama3.2:3b
    pct exec $OLLAMA_CT_ID -- ollama pull codellama:7b
    
    log_info "Ollama deployment complete - API available at http://192.168.0.99:11434"
}

# Deploy Open WebUI LXC Container
deploy_openwebui() {
    log_info "Deploying Open WebUI LXC Container..."
    
    # Download and execute the community script
    bash -c "$(curl -fsSL https://raw.githubusercontent.com/community-scripts/ProxmoxVE/main/ct/openwebui.sh)" << EOF
$OPENWEBUI_CT_ID
$OPENWEBUI_HOSTNAME
2
4096
20
service-pool
debian-12-standard_12.2-1_amd64.tar.zst
auto
EOF

    log_info "Open WebUI container deployed with ID: $OPENWEBUI_CT_ID"
    
    # Start the container
    pct start $OPENWEBUI_CT_ID
    log_info "Open WebUI container started"
    
    # Wait for container to be ready
    sleep 30
    
    log_info "Open WebUI deployment complete - Web UI available at http://192.168.0.99:8080"
}

# Configure GPU passthrough (if RTX 5070 Ti available)
configure_gpu_access() {
    log_info "Configuring GPU access for AI workloads..."
    
    # Check for NVIDIA GPU
    if lspci | grep -i nvidia > /dev/null; then
        log_info "NVIDIA GPU detected, configuring passthrough..."
        
        # Add GPU device to Ollama container
        echo "lxc.cgroup2.devices.allow: c 195:* rwm" >> /etc/pve/lxc/${OLLAMA_CT_ID}.conf
        echo "lxc.mount.entry: /dev/nvidia0 dev/nvidia0 none bind,optional,create=file" >> /etc/pve/lxc/${OLLAMA_CT_ID}.conf
        echo "lxc.mount.entry: /dev/nvidiactl dev/nvidiactl none bind,optional,create=file" >> /etc/pve/lxc/${OLLAMA_CT_ID}.conf
        echo "lxc.mount.entry: /dev/nvidia-uvm dev/nvidia-uvm none bind,optional,create=file" >> /etc/pve/lxc/${OLLAMA_CT_ID}.conf
        
        # Restart container to apply GPU access
        pct stop $OLLAMA_CT_ID
        sleep 10
        pct start $OLLAMA_CT_ID
        
        log_info "GPU passthrough configured for Ollama container"
    else
        log_warn "No NVIDIA GPU detected, running in CPU-only mode"
    fi
}

# Update Mario Dashboard service list
update_dashboard_services() {
    log_info "Adding AI services to Mario Dashboard..."
    
    # This would ideally update the dashboard configuration
    # For now, display the services to add manually
    cat << EOF
    
📋 Add these services to your Mario Dashboard:

{
  id: 'ollama',
  name: 'Ollama AI Server',
  description: 'Local LLM API Server',
  url: 'http://192.168.0.99:11434',
  icon: 'Robot',
  status: 'checking',
  healthEndpoint: 'http://192.168.0.99:11434/api/version'
},
{
  id: 'openwebui',
  name: 'Open WebUI',
  description: 'ChatGPT-like AI Interface',
  url: 'http://192.168.0.99:8080',
  icon: 'ChatDotSquare',
  status: 'checking',
  healthEndpoint: 'http://192.168.0.99:8080/health'
}

EOF
}

# Main deployment function
main() {
    log_info "Starting Mario Homelab AI/LLM Stack Deployment"
    
    # Check if containers already exist
    if pct list | grep -q $OLLAMA_CT_ID; then
        log_warn "Ollama container $OLLAMA_CT_ID already exists, skipping..."
    else
        deploy_ollama
    fi
    
    if pct list | grep -q $OPENWEBUI_CT_ID; then
        log_warn "Open WebUI container $OPENWEBUI_CT_ID already exists, skipping..."
    else
        deploy_openwebui
    fi
    
    configure_gpu_access
    update_dashboard_services
    
    log_info "🎮 Mario Homelab AI/LLM Stack Deployment Complete!"
    log_info "Ollama API: http://192.168.0.99:11434"
    log_info "Open WebUI: http://192.168.0.99:8080"
    log_info "Ready for GBGreg project integration tomorrow!"
}

# Execute main function
main "$@"