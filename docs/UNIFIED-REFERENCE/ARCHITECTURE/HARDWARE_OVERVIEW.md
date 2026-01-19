# Hardware Overview

## Current System Configuration
- **CPU**: Intel i7-8700 (6 cores, 12 threads, VT-x/VT-d enabled)
- **Motherboard**: 6 SATA ports, 2 M.2 slots, multiple PCIe slots
- **RAM**: 32GB total (all 4 DIMM slots occupied)
  - DIMM_A1/A2: 16GB Corsair Vengeance LPX DDR4-2400 (2x8GB)
  - DIMM_B1/B2: 16GB T-Force DARK DDR4-3000 (2x8GB)
- **Primary GPU**: NVIDIA GeForce RTX 5070 Ti 16GB (PCIe x16_1 slot) - **INSTALLED** ✅
  - Reserved for: AI/LLM inference, Gaming VMs
  - Driver: NVIDIA 570.86.16 with CUDA 12.5
- **Secondary GPU**: AMD Radeon RX 6800 XT 16GB (PCIe x16_2 slot) - **PLANNED**
  - Role: Host display, VM passthrough, macOS, Plex transcoding
  - Offloads general workloads from 5070 Ti
  - Native macOS support (Monterey/Ventura compatible)
- **PSU**: Seasonic Focus PX-750 (750W 80+ Platinum) - Excellent for upgrades
- **Network**: 192.168.0.99

## Current Storage Architecture (Post-Recovery)
- **M.2_1**: HP SSD EX920 512GB NVMe (Proxmox OS + 347.9G LVM)
- **M.2_2**: Available

**ZFS Production Pools:**
- **media-pool** (9.06TB): sdf (3.6TB) + sde (1.8TB) + sdg (3.6TB) - All HDDs for Plex
- **service-pool** (232GB): sda (232GB SSD) - Fast storage for containers/services
- **staging-pool** (696GB): sdc (698GB) - Working storage and staging area

**ICY BAY Independent Drives:**
- **sdb** (232GB SSD) - Hot-swap testing and experiments
- **sdd** (223GB SSD) - Hot-swap testing and experiments

**Recovery Data Protected:**
- Personal photos: 31 files (43MB) with EXIF data preserved
- Carved originals: 1,246 files (123MB) forensic archive
- Organized recovery: 929 files (80MB) categorized content

## Hardware Status Update (2026-01-16)
- ✅ **GPU Setup**: RTX 5070 Ti operational with NVIDIA 570.86.16 drivers
- ✅ **ICY DOCK**: MB024SP-B mobile rack operational
- 🔄 **Dual GPU Plan**: RX 6800 XT incoming for workload separation
  - AMD GPU handles: host, VMs, macOS passthrough, Plex (VAAPI/AMF)
  - NVIDIA GPU reserved: AI inference, gaming (dedicated)
- 🔧 **Storage Expansion Plans**:
  - LSI HBA card in PCIe x16_2 slot (adds 8 SATA ports)
  - SATA power splitters for additional drives
  - Shuck 3 external USB drives for pool growth
  - Configure M.2_2 to x2 mode (preserves SATA_5/6 ports)

## Hardware Shopping Guide

### Current System Summary for Shopping
- **Motherboard**: 6 SATA ports (3-4 used), PCIe x16_2 slot available
- **PSU**: 750W 80+ Platinum (excellent for upgrades)
- **Available Storage**: 4TB blank drive ready for data recovery staging
- **Expansion Ready**: 3 USB drives to shuck, multiple PCIe slots free
- **Goal**: ZFS pool recovery + AI/LLM inference capabilities

### Priority 1: Storage Infrastructure (Essential - $80-120)

#### LSI HBA Card ($50-70)
- **LSI 9211-8i in IT Mode** - Install in PCIe x16_2 slot
- **Include**: 2x SFF-8087 to 4x SATA breakout cables
- **Result**: Adds 8 SATA ports (total: 14 drives possible)

#### SATA Power Expansion ($20-30)
- **2x GELRHONR 4-Way SATA Power Splitters**
- **SATA cable variety pack** (18", 24", 36" lengths)
- **Result**: Power for all current + shucked drives

### Priority 2: Future GPU Transcoding (Dependent on Drivers)

#### RTX 5070 Ti Hardware Transcoding
- **Status**: Awaiting NVIDIA 575+ driver release for Blackwell architecture
- **Current Workaround**: Software transcoding in Plex container
- **Future Setup**: Hardware transcoding with proper GPU passthrough
- **Power**: Already installed and powered

### Priority 3: GPU Driver Configuration (Essential - $0)
- **Fix nvidia-smi**: Install proper NVIDIA drivers
- **Enable Passthrough**: Configure IOMMU for both GPUs
- **Container Access**: Set up GPU sharing for Plex/AI services

### Optimized Microcenter Shopping List
```
Essential (Phase 1) - ~$100:
□ LSI 9211-8i HBA Card (IT Mode) + breakout cables
□ 2x 4-way SATA power splitters
□ SATA cable variety pack (3-4 cables)

Immediate Hardware Tasks:
□ Wait for NVIDIA 575+ driver release
□ Configure single GPU passthrough when drivers available
□ Implement hardware transcoding in Plex

Optional Tools:
□ USB 3.0 to SATA adapter (~$25)
□ External drive dock (~$40)
```

### Expected Capabilities When Drivers Available
- **Storage Expansion**: 10+ drive capacity with LSI HBA card
- **RTX 5070 Ti Full Utilization**: Hardware transcoding, AI/LLM inference
- **Professional AI Stack**: Multiple models, custom agents, local development
