# Next Phase Roadmap: Production Homelab Services

## Overview
With data recovery complete and 9TB+ storage operational, we're ready to deploy production services on our Proxmox homelab infrastructure.

## 📊 Current Infrastructure Status

### ✅ **Completed Foundation**
- **Storage**: 9.06TB media-pool + 232GB service-pool + 696GB staging-pool
- **Recovery**: 246MB personal content preserved with ZFS snapshots
- **Monitoring**: Web dashboard + system health monitoring
- **Management**: FileBrowser + SSH + Git worktrees
- **Platform**: Proxmox VE 9.0.3 with Docker ready

### 🎯 **Available Resources**
- **Media Storage**: 8.8TB available for Plex content
- **Service Storage**: 232GB fast SSD for containers/databases
- **Staging Storage**: 681GB for temporary workloads
- **ICY BAY Testing**: 2x 232GB SSDs for experiments
- **Compute**: i7-8700 (6C/12T) + 32GB RAM
- **GPU**: RTX 5070 Ti (16GB) + GTX 970 (4GB) - drivers needed

## 🚀 Phase 1: Core Media & AI Services (Priority 1)
**Multi-Threaded Coordination**: Main orchestrates, Writer implements, Reader validates, Features specialize

### 1.1 GPU Driver Configuration → **Writer Thread**
**Timeline**: 1-2 days
**Priority**: Essential for all GPU-dependent services
**Thread Assignment**: Writer Thread (system modifications required)
```bash
# Install NVIDIA drivers for both GPUs
# Configure IOMMU for VM passthrough  
# Test nvidia-smi functionality
# Set up GPU monitoring
```
**Deliverables**:
- Both GPUs operational with drivers
- Passthrough capability for VMs
- GPU monitoring in dashboard
**Status Reporting**: Writer → Main with GPU functionality validation

### 1.2 Plex Media Server → **Writer Thread**
**Timeline**: 1 day
**Storage**: 8.8TB available on media-pool
**GPU**: GTX 970 dedicated for transcoding
**Thread Assignment**: Writer Thread (container deployment required)
```bash
# Deploy Plex container with proper ZFS pool mounts
docker run -d --name plex \
  -v /service-pool/plex:/config \
  -v /media-pool:/data \
  -v /staging-pool/plex-transcode:/transcode \
  --device /dev/nvidia0:/dev/nvidia0 \
  plexinc/pms-docker

# CRITICAL: Mount actual pools, not /mnt
```
**Deliverables**:
- Plex server operational with proper storage architecture
- Hardware transcoding enabled  
- Ready for content addition
**Status Reporting**: Writer → Main with service accessibility confirmation

### 1.3 AI/LLM Infrastructure → **Feature Branch: ai-services**
**Timeline**: 2-3 days  
**GPU**: RTX 5070 Ti for inference
**Storage**: Service-pool for models
**Thread Assignment**: Feature Branch (specialized development)
```bash
# Deploy Ollama for local LLM inference
# Install Open WebUI for web interface
# Configure Continue.dev for VSCode
# Set up model management
```
**Models to Deploy**:
- CodeLlama 34B (coding assistance)
- Deepseek Coder 33B (advanced coding)
- Mixtral 8x7B (general purpose)  
- Custom fine-tuned models
**Status Reporting**: Feature → Main with inference capabilities and model availability

## 🔧 Phase 2: Development & Management (Priority 2)
**Multi-Threaded Coordination**: Reader researches, Writer implements, Features specialize

### 2.1 Container Orchestration → **Feature Branch: container-mgmt**
**Timeline**: 2-3 days
**Thread Assignment**: Feature Branch (specialized container management focus)
```bash
# Deploy Portainer with proper storage mounting
docker run -d --name portainer \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /service-pool/portainer:/data \
  -v /media-pool:/srv/media-pool:ro \
  -v /staging-pool:/srv/staging-pool \
  portainer/portainer-ce

# Set up Docker Compose stacks with ZFS pool architecture
# Configure container networking
# Implement backup strategies
```

**Storage Architecture Requirements**:
- All container deployments MUST follow proper ZFS pool mounting patterns
- Management tools require read access to all pools for visibility
- Document storage patterns for each service type
**Status Reporting**: Feature → Main with container management capabilities and storage integration validation

### 2.2 Development Environment
**Timeline**: 2-3 days
```bash
# Deploy code-server (web-based VSCode)
# Configure AI coding assistants
# Set up development workflows
# Git integration and project management
```

### 2.3 Monitoring & Alerting
**Timeline**: 1-2 days
```bash
# Enhanced Grafana + Prometheus stack
# ZFS health monitoring
# GPU utilization tracking
# Alert notifications (email/Discord/Slack)
```

## 🌐 Phase 3: Network & Security Services (Priority 3)

### 3.1 Network Services
**Timeline**: 2-3 days
```bash
# PiHole for DNS filtering
# Nginx reverse proxy
# VPN server (WireGuard/OpenVPN)
# Network monitoring
```

### 3.2 Home Automation
**Timeline**: 3-4 days
```bash
# Home Assistant deployment
# IoT device integration
# Automation workflows
# Mobile app configuration
```

## 🎮 Phase 4: Advanced Features (Priority 4)

### 4.1 Gaming VM
**Timeline**: 3-4 days
**GPU**: RTX 5070 Ti passthrough
```bash
# Windows 11 VM creation
# GPU passthrough configuration
# Gaming performance optimization
# Remote access setup
```

### 4.2 Advanced Storage Features
**Timeline**: 2-3 days
```bash
# ZFS encryption for sensitive data
# Automated snapshot management
# Cross-pool replication
# Performance tuning
```

## 📋 Implementation Strategy

### Prerequisites: Multi-Threaded Orchestrated Architecture
**CRITICAL**: All development MUST use orchestrated multi-threaded approach
- **Main Branch**: Coordinates all phases and consolidates status reports
- **Reader Thread**: Validates system status before/during/after implementations  
- **Writer Thread**: Handles infrastructure implementations (GPU, Plex, system configs)
- **Feature Branches**: Specialize in complex deployments (AI, container management, etc.)
- Review `/home/darney/projects/proxmox-homelab/docs/orchestrated-worktree-strategy.md`
- Review `/home/darney/projects/proxmox-homelab/docs/container-storage-architecture.md`
- Update all Docker configurations to mount actual pools (`/media-pool`, `/service-pool`, `/staging-pool`)

### Week 1: Core Services (Multi-Threaded)
- Day 0: **Orchestrated Status Check** - Reader thread validates all systems before Writer implementations
- Day 1-2: **GPU drivers** (Writer thread) + **Interface validation** (Reader thread) 
- Day 3-4: **Plex deployment** (Writer thread) + **Service monitoring** (Reader thread)
- Day 5-7: **AI/LLM infrastructure** (ai-services feature branch) + **Status consolidation** (Main thread)

### Week 2: Development Platform
- Day 1-3: Container orchestration and management
- Day 4-5: Development environment setup
- Day 6-7: Enhanced monitoring and alerting

### Week 3: Network & Automation
- Day 1-3: Network services (DNS, proxy, VPN)
- Day 4-7: Home Assistant and IoT integration

### Week 4: Advanced Features
- Day 1-4: Gaming VM with GPU passthrough
- Day 5-7: Advanced ZFS features and optimization

## 🎯 Success Metrics

### Phase 1 Complete When:
- [x] GPU drivers operational on both cards
- [x] Plex serving media with hardware transcoding
- [x] AI/LLM models responding to queries
- [x] All services accessible via web interfaces

### Phase 2 Complete When:
- [x] All containers managed via Portainer
- [x] Code-server with AI assistance functional
- [x] Comprehensive monitoring dashboards operational
- [x] Automated alerting configured

### Phase 3 Complete When:
- [x] Network services filtering and routing traffic
- [x] Home Assistant controlling IoT devices
- [x] VPN providing secure remote access
- [x] All services behind reverse proxy

### Phase 4 Complete When:
- [x] Windows 11 VM gaming at native performance
- [x] ZFS advanced features operational
- [x] Cross-system backup and replication working
- [x] Performance optimized for all workloads

## 🔄 Ongoing Maintenance

### Daily
- Monitor system health dashboard
- Check ZFS pool status
- Review container health

### Weekly  
- Update system packages
- Review storage usage trends
- Test backup integrity

### Monthly
- ZFS scrub operations
- Security updates
- Performance optimization review
- Capacity planning assessment

This roadmap transforms your recovered homelab into a full-featured production environment leveraging all available hardware for maximum capability and learning opportunities.