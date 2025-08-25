# GPU Allocation Architecture

**Purpose**: Define strategic GPU allocation patterns for dual GPU setup in Proxmox homelab environment.

## Hardware Configuration

### Current GPU Setup
- **Primary GPU**: NVIDIA GeForce RTX 5070 Ti 16GB (PCIe x16_1)
  - Architecture: Blackwell GB203
  - Status: Hardware detected, awaiting NVIDIA 575+ drivers
- **Secondary GPU**: NVIDIA GeForce GTX 970 4GB (PCIe x16_2) 
  - Architecture: Maxwell GM204
  - Status: Hardware installed and detected

## Allocation Strategy

### RTX 5070 Ti (Primary - 16GB VRAM)

#### Workload Allocation
- **Gaming VMs**: Windows 11 VM with full GPU passthrough
- **AI/LLM Inference**: Large language model serving (70B+ parameters)
- **Development Workloads**: AI coding assistants, model fine-tuning
- **Heavy Transcoding**: 4K content processing when needed

#### Technical Specifications
- **VRAM**: 16GB (suitable for large AI models)
- **Performance**: High-end gaming and compute workloads
- **Power**: ~285W TGP (within PSU capacity)
- **Passthrough**: Primary candidate for VM GPU passthrough

### GTX 970 (Secondary - 4GB VRAM)

#### Workload Allocation  
- **Plex Transcoding**: Dedicated 1080p transcoding optimization
- **Backup Transcoding**: Failover when primary GPU busy with gaming
- **Development Testing**: Container workloads and experimental tasks
- **Continuous Services**: Always-available transcoding for media server

#### Technical Specifications
- **VRAM**: 4GB (sufficient for 1080p transcoding)
- **Performance**: Efficient for dedicated media server tasks
- **Power**: ~145W TGP (lower power consumption)
- **Availability**: Frees premium GPU for high-value tasks

## Dynamic Management Patterns

### Script-Based GPU Switching
```bash
# Example GPU reassignment workflow
./scripts/gpu-allocate.sh --service plex --gpu gtx970
./scripts/gpu-allocate.sh --service gaming --gpu rtx5070ti
./scripts/gpu-allocate.sh --service ai-inference --gpu rtx5070ti
```

### Load Monitoring Integration
- **Real-time Monitoring**: GPU utilization tracking per service
- **Automatic Failover**: Switch transcoding to backup GPU during gaming
- **Performance Optimization**: Dynamic allocation based on workload requirements

### Container GPU Access Patterns

#### Plex Media Server
```bash
docker run -d --name plex \
  --device /dev/nvidia0:/dev/nvidia0 \  # GTX 970 dedicated
  --gpus device=0 \
  plexinc/pms-docker
```

#### AI/LLM Services
```bash  
docker run -d --name ollama \
  --device /dev/nvidia1:/dev/nvidia1 \  # RTX 5070 Ti for inference
  --gpus device=1 \
  ollama/ollama
```

#### Development Environment
```bash
# Flexible GPU access for development
docker run -d --name dev-env \
  --gpus all \  # Access both GPUs as needed
  development-image
```

## Proxmox GPU Passthrough Configuration

### IOMMU Groups Configuration
```bash
# Enable IOMMU in GRUB
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on iommu=pt"

# Blacklist nvidia driver on host (for passthrough)
echo "blacklist nouveau" >> /etc/modprobe.d/blacklist.conf
echo "blacklist nvidia" >> /etc/modprobe.d/blacklist.conf

# VFIO configuration for GPU passthrough
echo "vfio-pci" >> /etc/modules
```

### VM GPU Allocation
- **Windows 11 Gaming VM**: RTX 5070 Ti full passthrough
- **Linux Development VM**: Shared GPU access as needed
- **Container Services**: GTX 970 shared among multiple containers

## Performance Optimization Patterns

### Workload Separation Benefits
1. **Gaming Performance**: Dedicated RTX 5070 Ti ensures no transcoding interference
2. **Media Server Reliability**: GTX 970 provides consistent transcoding availability
3. **Resource Efficiency**: Both GPUs fully utilized without conflicts
4. **Thermal Management**: Distributed heat generation across two cards

### Power Management
- **Idle Power**: GTX 970 lower idle consumption for continuous services
- **Peak Performance**: RTX 5070 Ti available for demanding workloads
- **Balanced Load**: 750W PSU adequate for both cards under normal operation

## Service-Specific GPU Requirements

### Media Services (GTX 970 Recommended)
- **Plex Media Server**: Hardware transcoding for 1080p streams
- **Jellyfin**: Alternative media server with GPU acceleration
- **Video Processing**: Automated transcoding workflows

### Gaming Services (RTX 5070 Ti Required)
- **Windows 11 VM**: Full GPU passthrough for native gaming performance
- **Game Streaming**: High-quality streaming with NVENC encoding
- **VR Applications**: VRAM-intensive VR gaming support

### AI/ML Services (RTX 5070 Ti Preferred)
- **Ollama**: Large language model inference server
- **Continue.dev**: AI coding assistant integration  
- **Custom Models**: Fine-tuning and training workflows
- **Jupyter Notebooks**: GPU-accelerated data science workflows

### Development Services (Both GPUs)
- **CUDA Development**: Access to both architectures for testing
- **OpenCL Workloads**: Cross-vendor GPU compute tasks
- **Performance Testing**: Benchmarking across different GPU generations

## Troubleshooting Patterns

### Driver Issues
- **RTX 5070 Ti**: Requires NVIDIA driver 575+ (not yet available)
- **GTX 970**: Compatible with current NVIDIA drivers
- **Fallback Strategy**: Use GTX 970 for all workloads until RTX 5070 Ti drivers available

### Resource Conflicts
- **GPU Memory**: Monitor VRAM usage to prevent allocation conflicts  
- **Process Priority**: Gaming VMs get priority over background transcoding
- **Temperature Management**: Ensure adequate cooling for dual GPU operation

### Service Availability
- **Graceful Degradation**: Media services continue on single GPU if other fails
- **Monitoring Integration**: GPU health monitoring in Grafana dashboards
- **Alert Thresholds**: Temperature and utilization alerts for both cards

## Future Expansion Considerations

### Three-GPU Scenarios
- **Additional GTX 970**: Dedicated transcoding farm for multiple streams
- **Compute Card**: Tesla/Quadro for specialized AI workloads
- **Slot Availability**: PCIe x16_3 available for additional cards

### Software Evolution
- **Container Orchestration**: Kubernetes GPU scheduling across both cards
- **AI Workload Growth**: Scaling to larger models requiring both GPUs
- **Gaming Evolution**: Multiple gaming VMs with GPU allocation

This architecture ensures optimal utilization of both GPUs while maintaining clear separation of concerns and enabling dynamic allocation based on workload requirements.