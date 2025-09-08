# Proxmox Homelab Project Knowledge Summary
**For Claude Web App Integration**  
**Generated**: August 22, 2025  
**Status**: Post-hardware installation, pre-data recovery  

## 🏗️ **PROJECT OVERVIEW**

Building a professional homelab on **Proxmox VE 9.0.3** with dual GPU setup for gaming, AI/LLM inference, and media serving. The project emphasizes flexibility through git worktree management and dynamic GPU allocation.

**Key Innovation**: Dual GPU strategy separates workloads - RTX 5070 Ti for gaming/AI, GTX 970 for dedicated Plex transcoding.

## 🔧 **HARDWARE CONFIGURATION**

### Current Installation ✅
- **System**: Intel i7-8700 (6C/12T), 32GB DDR4, 750W PSU
- **Primary GPU**: NVIDIA GeForce RTX 5070 Ti 16GB (installed, detected)
- **Storage**: 512GB NVMe (Proxmox), 4 SATA drives (1.8T + 3.6T + 698G + 223G)
- **Expansion**: ICY DOCK MB024SP-B mobile rack for hot-swap testing
- **Recovery**: 4TB blank drive ready for data staging operations

### Pending Hardware ⏳
- **Secondary GPU**: GTX 970 4GB (waiting for right angle audio cables)
- **Storage Expansion**: LSI HBA card, 3 external drives ready for shucking
- **Power**: SATA splitters for additional drive power

### Network & Access ✅
- **IP**: 192.168.0.99 (SSH accessible with key auth)
- **Management**: Proxmox web UI working
- **Repository**: Bookworm-based (needs debian.sources fix: Trixie→Bookworm)

## 🚨 **CRITICAL ISSUE: DATA RECOVERY**

### ZFS Incident (2025-08-17)
**What Happened**: Accidentally wiped ZFS pool signatures with `wipefs -a`  
**Impact**: 3.6TB Plex media library currently inaccessible  
**Status**: Raw data intact, signatures destroyed, pool undetectable  

### Recovery Strategy
1. **Clone First**: ddrescue on 3.6TB media drive to 4TB staging
2. **File Carving**: photorec/foremost to extract media files
3. **Verification**: Confirm recovered files before reformatting
4. **Restoration**: Rebuild Plex library from recovered data

**Priority**: Data recovery must complete before major service deployment

## 🎮 **GPU ALLOCATION ARCHITECTURE**

### RTX 5070 Ti (Primary - 16GB VRAM)
- **Gaming**: Windows 11 VM with full passthrough
- **AI/LLM**: Large model inference (70B+ parameters)
- **Development**: AI coding assistants, model fine-tuning
- **Heavy Transcoding**: 4K content when needed

### GTX 970 (Secondary - 4GB VRAM)
- **Plex Server**: Dedicated 1080p transcoding optimization
- **Backup Transcoding**: When primary GPU busy with gaming
- **Testing**: Development and experimental workloads
- **Efficiency**: Frees premium hardware for high-value tasks

### Dynamic Management
- **Script-Based Switching**: One-command GPU reassignment
- **Load Monitoring**: Automatic failover between cards
- **Resource Optimization**: Real-time workload balancing

## 🌳 **GIT WORKTREE SYSTEM**

### Multi-Branch Development
```
~/projects/proxmox-homelab/           # Main (planning/docs)
~/projects/proxmox-homelab-reader/    # Research/diagnostics
~/projects/proxmox-homelab-writer/    # Implementation
~/projects/proxmox-homelab-features/  # Feature development
    └── data-recovery-urgent/         # Current focus
```

### Workflow Benefits
- **Parallel Sessions**: Multiple Claude instances without conflicts
- **Role Separation**: Reader for research, Writer for implementation
- **Feature Isolation**: Dedicated branches for major features
- **Sync Management**: `./scripts/claude_threads.sh` for coordination

## 🚀 **SERVICE ARCHITECTURE**

### Core Services Stack
1. **Plex Media Server**: GTX 970 transcoding, recovered library
2. **AI/LLM Services**: Ollama + Continue.dev on RTX 5070 Ti
3. **Gaming Environment**: Windows 11 VM with GPU passthrough
4. **Container Platform**: Docker/Portainer for service management
5. **Development**: Code-server with AI assistant integration
6. **Network Services**: PiHole, VPN, Home Assistant
7. **Storage**: MergerFS pooling, ICY DOCK testing workflow

### Technical Implementation
- **Containers**: LXC for Linux services, KVM for Windows gaming
- **GPU Passthrough**: IOMMU configuration for both cards
- **Storage Flexibility**: Hot-swap testing, expandable architecture
- **Monitoring**: Resource usage dashboards, health tracking

## 📊 **CURRENT OPERATIONAL STATUS**

### ✅ Working Systems
- Proxmox VE 9.0.3 installed and accessible
- SSH access configured with key authentication
- RTX 5070 Ti hardware detection (lspci confirms GB203)
- Git worktree system operational
- ICY DOCK hot-swap rack functional
- 4TB recovery drive ready for data operations

### ⚠️ Issues Requiring Attention
- **nvidia-smi not found**: Driver configuration needed
- **ZFS data loss**: Recovery operations pending
- **Repository mixing**: debian.sources needs Bookworm fix
- **GPU passthrough**: IOMMU configuration pending
- **GTX 970 installation**: Waiting for cable clearance

### 🎯 Ready Actions
- Mount 4TB recovery drive for data staging
- Begin ddrescue cloning of 3.6TB media drive
- Troubleshoot NVIDIA driver installation
- Configure repository sources consistently
- Prepare container templates for services

## 🚀 **EXECUTION ROADMAP**

### Phase 1: Data Recovery (Days 1-3) 🔥
- **Critical Path**: Clone and recover Plex media library
- **Tools**: ddrescue, photorec, foremost
- **Success Metric**: 80%+ file recovery rate
- **Parallel**: GPU driver troubleshooting

### Phase 2: GPU Configuration (Days 2-5)
- **Dual GPU Setup**: Install GTX 970, configure passthrough
- **Driver Stack**: Fix nvidia-smi, enable container access
- **Testing**: Basic transcoding and inference benchmarks

### Phase 3: Service Deployment (Days 5-10)
- **Plex Restoration**: Container with GTX 970 transcoding
- **Gaming VM**: Windows 11 with RTX 5070 Ti passthrough
- **AI Services**: Ollama deployment for local inference

### Phase 4: Infrastructure Expansion (Week 2+)
- **Storage Scaling**: LSI HBA installation, drive shucking
- **Service Ecosystem**: Full container stack deployment
- **Optimization**: Performance tuning, monitoring setup

## 💡 **STRATEGIC ADVANTAGES**

### Hardware Flexibility
- **Dual GPU**: Workload separation prevents resource conflicts
- **Hot-Swap Storage**: ICY DOCK enables safe drive testing
- **Expansion Ready**: PCIe slots and power capacity for growth
- **Recovery Capability**: Multiple data rescue strategies

### Software Architecture
- **Container Native**: Lightweight, scalable service deployment
- **GPU Acceleration**: Hardware transcoding + AI inference
- **Development Environment**: Full AI-assisted coding stack
- **Monitoring Integration**: Health tracking across all services

### Operational Benefits
- **Parallel Development**: Worktree system enables multi-tasking
- **Resource Optimization**: Dynamic GPU allocation
- **Testing Workflow**: Safe hardware experimentation
- **Disaster Recovery**: Documented processes, backup strategies

## 🎯 **SUCCESS CRITERIA**

### Data Recovery Phase
- **Media Files**: 80%+ recovery of Plex library content
- **File Integrity**: Playable videos with preserved metadata
- **Timeline**: Complete within 48-72 hours

### System Configuration Phase
- **GPU Access**: Both cards accessible to containers/VMs
- **Performance**: Baseline transcoding benchmarks met
- **Stability**: 24+ hour uptime without GPU conflicts

### Service Deployment Phase
- **Plex Functional**: Media streaming with hardware transcoding
- **Gaming Ready**: Windows VM with RTX 5070 Ti performance
- **AI Operational**: Local model inference and coding assistance

## 📱 **INTEGRATION POINTS FOR CLAUDE WEB APP**

### Project Context Awareness
- **Current Focus**: Data recovery operations are blocking other tasks
- **Hardware Status**: RTX 5070 Ti installed, GTX 970 pending
- **Software State**: Proxmox operational, containers not yet deployed
- **Critical Path**: ZFS recovery → GPU configuration → service deployment

### Decision Support Areas
- **Data Recovery**: Provide guidance on file carving techniques
- **GPU Configuration**: Assist with passthrough and driver issues
- **Service Architecture**: Help design container deployment strategies
- **Performance Optimization**: Advise on resource allocation

### Knowledge Base Updates
- **Monitor**: Data recovery progress and success rates
- **Track**: GPU configuration milestones and performance
- **Document**: Service deployment patterns and optimization
- **Maintain**: Hardware expansion plans and capacity planning

---

**Next Critical Action**: Begin ZFS data recovery with ddrescue cloning  
**Primary Dependency**: 3.6TB media drive recovery success rate  
**Success Indicator**: Restored Plex library with functional transcoding