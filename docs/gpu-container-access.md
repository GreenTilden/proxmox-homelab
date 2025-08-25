# GPU Container Access Configuration

## Dual GPU Architecture
- **RTX 5070 Ti (16GB)**: Primary GPU for AI/LLM and gaming
- **GTX 970 (4GB)**: Secondary GPU for Plex transcoding

## Container GPU Access Patterns

### Docker Container GPU Access

#### Method 1: Native Docker GPU Support
```bash
# Install NVIDIA Container Toolkit
apt install nvidia-container-toolkit
nvidia-ctk runtime configure --runtime=docker
systemctl restart docker

# Run container with GPU access
docker run --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi

# Specific GPU assignment
docker run --gpus '"device=0"' ollama/ollama  # RTX 5070 Ti
docker run --gpus '"device=1"' linuxserver/plex  # GTX 970
```

#### Method 2: Device Passthrough (Legacy)
```bash
# Pass GPU devices directly
docker run -d \
  --device /dev/nvidia0:/dev/nvidia0 \
  --device /dev/nvidiactl:/dev/nvidiactl \
  --device /dev/nvidia-uvm:/dev/nvidia-uvm \
  container-image
```

### LXC Container GPU Access

#### Privileged Container Configuration
```bash
# Edit container config
nano /etc/pve/lxc/VMID.conf

# Add GPU passthrough
lxc.cgroup2.devices.allow: c 195:* rwm
lxc.cgroup2.devices.allow: c 509:* rwm
lxc.mount.entry: /dev/nvidia0 dev/nvidia0 none bind,optional,create=file
lxc.mount.entry: /dev/nvidiactl dev/nvidiactl none bind,optional,create=file
lxc.mount.entry: /dev/nvidia-uvm dev/nvidia-uvm none bind,optional,create=file
```

#### Unprivileged Container with GPU Hook
```bash
# Create hook script
cat > /usr/share/lxc/hooks/nvidia-lxc.sh << 'EOF'
#!/bin/bash
for dev in /dev/nvidia*; do
    if [ -c "$dev" ]; then
        mknod -m 666 "${LXC_ROOTFS_MOUNT}${dev}" c \
          $(stat -c %t $dev | xargs printf "%d\n") \
          $(stat -c %T $dev | xargs printf "%d\n")
    fi
done
EOF
chmod +x /usr/share/lxc/hooks/nvidia-lxc.sh

# Add to container config
echo "lxc.hook.pre-start: /usr/share/lxc/hooks/nvidia-lxc.sh" >> /etc/pve/lxc/VMID.conf
```

## Service-Specific GPU Configurations

### Plex Media Server (GTX 970)
```yaml
# Docker Compose
services:
  plex:
    image: linuxserver/plex:latest
    runtime: nvidia
    environment:
      - NVIDIA_VISIBLE_DEVICES=1  # GTX 970
      - NVIDIA_DRIVER_CAPABILITIES=compute,video,utility
    devices:
      - /dev/dri:/dev/dri  # Intel QuickSync fallback
```

### Ollama AI Service (RTX 5070 Ti)
```yaml
# Docker Compose
services:
  ollama:
    image: ollama/ollama:latest
    runtime: nvidia
    environment:
      - NVIDIA_VISIBLE_DEVICES=0  # RTX 5070 Ti
      - CUDA_VISIBLE_DEVICES=0
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              device_ids: ['0']
              capabilities: [gpu]
```

### Open WebUI with GPU
```yaml
services:
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    environment:
      - OLLAMA_API_BASE_URL=http://ollama:11434
    depends_on:
      - ollama
```

## GPU Allocation Strategy

### Dynamic GPU Assignment Script
```bash
#!/bin/bash
# /scripts/gpu-allocate.sh

allocate_gpu() {
    local service=$1
    local gpu_id=$2
    
    case $service in
        "plex")
            docker update --runtime=nvidia \
              --env NVIDIA_VISIBLE_DEVICES=$gpu_id \
              plex-media-server
            ;;
        "ollama")
            docker update --runtime=nvidia \
              --env NVIDIA_VISIBLE_DEVICES=$gpu_id \
              ollama-service
            ;;
        *)
            echo "Unknown service: $service"
            return 1
            ;;
    esac
}

# Usage
allocate_gpu plex 1      # Assign GTX 970 to Plex
allocate_gpu ollama 0    # Assign RTX 5070 Ti to Ollama
```

## GPU Resource Monitoring

### Container GPU Usage
```bash
# Monitor GPU usage by containers
nvidia-smi dmon -s u -c 1

# Show process GPU memory usage
nvidia-smi --query-compute-apps=pid,process_name,gpu_name,used_memory --format=csv

# Docker-specific GPU monitoring
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.GPUPerc}}"
```

### Grafana GPU Metrics
```yaml
# Prometheus GPU exporter
services:
  nvidia-exporter:
    image: mindprince/nvidia_gpu_prometheus_exporter:latest
    runtime: nvidia
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
    ports:
      - "9445:9445"
```

## Troubleshooting GPU Access

### Common Issues and Solutions

#### 1. Container Can't Access GPU
```bash
# Check NVIDIA runtime
docker info | grep nvidia

# Verify devices exist
ls -la /dev/nvidia*

# Test with minimal container
docker run --rm --gpus all ubuntu:22.04 nvidia-smi
```

#### 2. Permission Denied
```bash
# Fix device permissions
chmod 666 /dev/nvidia*

# Add user to video group
usermod -aG video $USER
```

#### 3. CUDA Version Mismatch
```bash
# Check driver CUDA version
nvidia-smi | grep "CUDA Version"

# Use matching CUDA container
docker run --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04
```

## Best Practices

### 1. GPU Isolation
- Dedicate GTX 970 to transcoding workloads
- Reserve RTX 5070 Ti for AI/compute tasks
- Avoid GPU sharing between critical services

### 2. Resource Limits
```yaml
# Set GPU memory limits
services:
  service-name:
    deploy:
      resources:
        limits:
          nvidia.com/gpu: 1
        reservations:
          devices:
            - capabilities: [gpu]
              options:
                memory: 8GB  # Limit GPU memory
```

### 3. Monitoring and Alerts
- Set up Prometheus GPU exporter
- Create Grafana dashboards for GPU metrics
- Configure alerts for GPU temperature/usage

## Testing GPU Access

### Quick Test Script
```bash
#!/bin/bash
# /scripts/test-container-gpu.sh

echo "=== Docker GPU Test ==="
docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi

echo -e "\n=== LXC GPU Test ==="
pct exec 100 -- nvidia-smi 2>/dev/null || echo "LXC GPU not configured"

echo -e "\n=== Service GPU Assignment ==="
docker exec plex-media-server nvidia-smi 2>/dev/null || echo "Plex GPU not assigned"
docker exec ollama-service nvidia-smi 2>/dev/null || echo "Ollama GPU not assigned"
```

## Future Enhancements
1. Implement GPU time-sharing for non-critical workloads
2. Add automatic GPU failover mechanisms
3. Create GPU scheduling system for batch jobs
4. Integrate with Kubernetes GPU operator for advanced orchestration