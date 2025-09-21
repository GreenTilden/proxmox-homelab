#!/bin/bash

# Deploy DCGM GPU Monitoring for RTX 5070 Ti
# Homelab Mario Dashboard - GPU Telemetry System

set -e

echo "🎯 Mario Homelab - Deploying GPU Monitoring Stack"
echo "=================================================="

# Configuration
GPU_MONITOR_CT_ID=302
GPU_MONITOR_HOSTNAME="gpu-monitor"
DCGM_PORT=9400

# Color output functions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# Check GPU status
check_gpu_status() {
    log_info "Checking RTX 5070 Ti status..."
    
    # Check for NVIDIA GPU
    if ! lspci | grep -i nvidia > /dev/null; then
        log_error "No NVIDIA GPU detected!"
        exit 1
    fi
    
    # Check if nvidia-smi is working
    if nvidia-smi > /dev/null 2>&1; then
        log_info "✅ nvidia-smi working correctly"
        nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader
    else
        log_warn "⚠️  nvidia-smi not working - GPU monitoring will be limited"
    fi
}

# Create LXC container for GPU monitoring
create_monitoring_container() {
    log_info "Creating GPU monitoring container..."
    
    # Create privileged container with GPU access
    pct create $GPU_MONITOR_CT_ID \
        /var/lib/vz/template/cache/debian-12-standard_12.2-1_amd64.tar.zst \
        --hostname $GPU_MONITOR_HOSTNAME \
        --cores 2 \
        --memory 2048 \
        --rootfs service-pool:10 \
        --net0 name=eth0,bridge=vmbr0,ip=dhcp \
        --unprivileged 0 \
        --features nesting=1 \
        --startup order=3,up=30

    log_info "Container created with ID: $GPU_MONITOR_CT_ID"
}

# Configure GPU passthrough for container
configure_gpu_passthrough() {
    log_info "Configuring GPU passthrough for monitoring container..."
    
    # Add GPU device access to container config
    cat >> /etc/pve/lxc/${GPU_MONITOR_CT_ID}.conf << EOF

# GPU Monitoring Access
lxc.cgroup2.devices.allow: c 195:* rwm
lxc.cgroup2.devices.allow: c 243:* rwm
lxc.mount.entry: /dev/nvidia0 dev/nvidia0 none bind,optional,create=file
lxc.mount.entry: /dev/nvidiactl dev/nvidiactl none bind,optional,create=file
lxc.mount.entry: /dev/nvidia-uvm dev/nvidia-uvm none bind,optional,create=file
lxc.mount.entry: /dev/nvidia-uvm-tools dev/nvidia-uvm-tools none bind,optional,create=file
lxc.mount.entry: /dev/nvidia-modeset dev/nvidia-modeset none bind,optional,create=file

# Docker support
lxc.apparmor.profile: unconfined
lxc.cap.add: sys_admin
lxc.cgroup2.devices.allow: a
lxc.mount.auto: "proc:rw sys:rw"
EOF

    log_info "GPU passthrough configured"
}

# Install Docker and DCGM in container
setup_monitoring_stack() {
    log_info "Starting monitoring container and installing Docker..."
    
    pct start $GPU_MONITOR_CT_ID
    sleep 20
    
    # Install Docker
    pct exec $GPU_MONITOR_CT_ID -- bash -c "
        apt update && apt install -y curl
        curl -fsSL https://get.docker.com | sh
        systemctl enable docker
        systemctl start docker
    "
    
    # Install NVIDIA Container Toolkit
    pct exec $GPU_MONITOR_CT_ID -- bash -c "
        distribution=\$(. /etc/os-release;echo \$ID\$VERSION_ID)
        curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
        curl -s -L https://nvidia.github.io/libnvidia-container/\$distribution/libnvidia-container.list | \\
            sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \\
            tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
        
        apt update
        apt install -y nvidia-container-toolkit
        nvidia-ctk runtime configure --runtime=docker
        systemctl restart docker
    "
    
    log_info "Docker and NVIDIA Container Toolkit installed"
}

# Deploy DCGM Exporter
deploy_dcgm_exporter() {
    log_info "Deploying DCGM Exporter for GPU telemetry..."
    
    # Create DCGM Exporter container
    pct exec $GPU_MONITOR_CT_ID -- docker run -d \
        --name dcgm-exporter \
        --restart unless-stopped \
        --gpus all \
        --cap-add SYS_ADMIN \
        -p ${DCGM_PORT}:9400 \
        nvcr.io/nvidia/k8s/dcgm-exporter:latest
    
    log_info "DCGM Exporter deployed on port $DCGM_PORT"
    
    # Wait for service to start
    sleep 15
    
    # Test GPU metrics endpoint
    if pct exec $GPU_MONITOR_CT_ID -- curl -s http://localhost:9400/metrics | grep -q "DCGM_FI_DEV_GPU_UTIL"; then
        log_info "✅ DCGM Exporter responding with GPU metrics"
    else
        log_warn "⚠️  DCGM Exporter may not be reporting GPU metrics correctly"
    fi
}

# Create system health check script
create_health_check_script() {
    log_info "Creating comprehensive system health check script..."
    
    cat > /home/darney/projects/proxmox-homelab-writer/homelab-mario-dashboard/scripts/health-check.sh << 'EOF'
#!/bin/bash

# Mario Homelab - Comprehensive Health Check
# Monitors GPU, services, storage, and system health

echo "🎮 Mario Homelab Health Check - $(date)"
echo "==========================================="

# GPU Status
echo "🎯 GPU Status:"
if command -v nvidia-smi >/dev/null 2>&1; then
    nvidia-smi --query-gpu=name,temperature.gpu,utilization.gpu,utilization.memory,memory.used,memory.total --format=csv,noheader,nounits
else
    echo "❌ nvidia-smi not available"
fi

# Service Status  
echo ""
echo "🔧 Service Status:"
services=("proxmox:8006" "grafana:3000" "plex:32400" "deluge:8112" "filebrowser:8080" "ollama:11434" "openwebui:3000" "dcgm:9400")

for service in "${services[@]}"; do
    name=${service%%:*}
    port=${service##*:}
    if timeout 3 nc -z 192.168.0.99 $port 2>/dev/null; then
        echo "✅ $name (port $port): Online"
    else
        echo "❌ $name (port $port): Offline"
    fi
done

# ZFS Pool Status
echo ""
echo "💾 Storage Status:"
zpool status -x
zfs list -o name,used,avail,refer,mountpoint | grep -E "(media-pool|service-pool|staging-pool)"

# System Resources
echo ""
echo "⚡ System Resources:"
echo "CPU Load: $(uptime | awk -F'load average:' '{print $2}')"
echo "Memory: $(free -h | grep Mem | awk '{print $3"/"$2" ("$3/$2*100"%%)"}')"
echo "Disk Usage: $(df -h / | tail -1 | awk '{print $3"/"$2" ("$5")"}')"

# Container Status
echo ""
echo "📦 Container Status:"
pct list | grep -E "(running|stopped)"

echo ""
echo "Health check complete - $(date)"
EOF

    chmod +x /home/darney/projects/proxmox-homelab-writer/homelab-mario-dashboard/scripts/health-check.sh
    log_info "Health check script created"
}

# Add GPU monitoring to Grafana configuration
configure_grafana_gpu_dashboard() {
    log_info "Configuring Grafana GPU monitoring dashboard..."
    
    cat << EOF
    
📊 Grafana GPU Dashboard Configuration:

1. Add Prometheus data source: http://192.168.0.99:9400
2. Import GPU dashboard with ID: 12239
3. Or create custom dashboard with these key metrics:
   - DCGM_FI_DEV_GPU_UTIL (GPU Utilization %)
   - DCGM_FI_DEV_MEM_COPY_UTIL (Memory Utilization %)  
   - DCGM_FI_DEV_GPU_TEMP (GPU Temperature °C)
   - DCGM_FI_DEV_POWER_USAGE (Power Usage W)
   - DCGM_FI_DEV_FB_USED (VRAM Used MB)

Access GPU metrics at: http://192.168.0.99:9400/metrics

EOF
}

# Update Mario Dashboard with GPU monitoring service
update_dashboard_gpu_service() {
    log_info "Adding GPU monitoring service to Mario Dashboard..."
    
    cat << EOF
    
🎮 Add this service to Mario Dashboard App.vue:

{
  id: 'gpu-monitor',
  name: 'GPU Monitor',
  description: 'RTX 5070 Ti Telemetry',
  url: 'http://192.168.0.99:9400/metrics',
  icon: 'Monitor', 
  status: 'checking',
  healthEndpoint: 'http://192.168.0.99:9400/metrics'
}

EOF
}

# Main deployment function
main() {
    log_info "Starting Mario Homelab GPU Monitoring Deployment"
    
    check_gpu_status
    
    # Check if container already exists
    if pct list | grep -q $GPU_MONITOR_CT_ID; then
        log_warn "GPU monitor container $GPU_MONITOR_CT_ID already exists"
        log_info "Checking DCGM Exporter status..."
        
        if pct exec $GPU_MONITOR_CT_ID -- docker ps | grep -q dcgm-exporter; then
            log_info "✅ DCGM Exporter already running"
        else
            log_info "Starting DCGM Exporter..."
            deploy_dcgm_exporter
        fi
    else
        create_monitoring_container
        configure_gpu_passthrough
        setup_monitoring_stack
        deploy_dcgm_exporter
    fi
    
    create_health_check_script
    configure_grafana_gpu_dashboard
    update_dashboard_gpu_service
    
    log_info "🎯 Mario Homelab GPU Monitoring Deployment Complete!"
    log_info "GPU Metrics: http://192.168.0.99:9400/metrics"
    log_info "Health Check: ./scripts/health-check.sh"
    log_info "Ready for production monitoring!"
}

# Execute main function
main "$@"