# Proxmox Homelab Comprehensive Status Report
**Date**: August 22, 2025  
**Last Updated**: Post-hardware integration analysis  

## 🔧 **CURRENT HARDWARE STATUS**

### ✅ **Installed & Working**
- **CPU**: Intel i7-8700 (6C/12T, boost to 4.6GHz)
- **RAM**: 32GB DDR4 (16GB Corsair LPX DDR4-2400 + 16GB T-Force DDR4-3000)
- **Primary GPU**: NVIDIA GeForce RTX 5070 Ti 16GB - **INSTALLED** ✅
  - Detected in PCIe slot (lspci shows GB203 controller)
  - Driver issues: nvidia-smi command not found
  - Passthrough not yet configured
- **Storage**: 512GB NVMe (Proxmox OS), 4 SATA drives connected
- **PSU**: 750W Seasonic Focus PX-750 (adequate for dual GPU setup)
- **Network**: Proxmox accessible at 192.168.0.99
- **ICY DOCK**: MB024SP-B mobile rack installed for hot-swap testing

### ⏳ **Hardware Pending Installation**
- **Secondary GPU**: GTX 970 4GB - Ready to install
  - **Blocker**: Waiting for right angle audio cables for clearance
  - **Target Slot**: PCIe x16_2 (currently available)
  - **Purpose**: Dedicated Plex transcoding, frees RTX 5070 Ti for gaming/AI

### 💾 **Storage Infrastructure**

#### Current Drive Layout
- **nvme0n1**: 476.9G (Proxmox OS, LVM with 347.9G thin pool)
- **sda**: 1.8T (Storage drive) - **ZFS signatures wiped**
- **sdb**: 3.6T (Media drive, likely Plex data) - **ZFS signatures wiped**
- **sdc**: 698.6G (Games drive) - **ZFS signatures wiped**
- **sdd**: 223.6G (SSD) - **ZFS signatures wiped**
- **Recovery Drive**: 4TB blank drive available for data staging

#### Expansion Ready
- **LSI HBA Slot**: PCIe x16_2 available (will move to x16_3 after GTX 970)
- **USB Drives**: 3 external drives ready for shucking
- **SATA Power**: Need splitters to support all drives simultaneously

## 🚨 **CRITICAL ISSUE: ZFS Data Loss Incident**

### What Happened (2025-08-17)
1. **Attempted Import**: Tried to import degraded ZFS pool 'rpool'
2. **Error**: Pool showed "insufficient replicas" due to missing nvme device
3. **Critical Mistake**: Ran `wipefs -a` on all ZFS partitions
4. **Result**: ZFS member signatures erased from all 4 drives

### Impact Assessment
- **Pool Status**: No longer detectable by `zpool import`
- **Data Status**: Raw data blocks likely intact but inaccessible
- **Plex Library**: 3.6TB media collection currently unreachable
- **Recovery Window**: Data recovery possible but urgent

### Data Recovery Strategy
```bash
# Priority 1: Clone critical drives before any recovery attempts
ddrescue /dev/sdb /mnt/recovery/sdb_backup.img /mnt/recovery/sdb.log  # 3.6TB media
ddrescue /dev/sda /mnt/recovery/sda_backup.img /mnt/recovery/sda.log  # 1.8TB storage

# Priority 2: File carving on cloned images
photorec /mnt/recovery/sdb_backup.img  # Extract media files
foremost -i /mnt/recovery/sdb_backup.img -o /mnt/recovery/extracted/

# Priority 3: Verify recovered content before reformatting
```

## 💻 **SOFTWARE & CONFIGURATION STATUS**

### Proxmox Environment
- **Version**: Proxmox VE 9.0.3/025864202ebb6109
- **Kernel**: 6.14.8-2-pve
- **Uptime**: Stable, low load (0.00-0.03)
- **Memory**: 32GB total, 29GB available
- **Storage Pools**:
  - local: 98G total, 91G available
  - local-lvm: 347G total, 347G available (unused)

### Repository Configuration Issue
- **Problem**: Mixed Bookworm/Trixie repositories
- **Main sources.list**: Debian Bookworm ✅
- **Proxmox repo**: bookworm pve-no-subscription ✅
- **Issue**: `/etc/apt/sources.list.d/debian.sources` points to Trixie ❌
- **Fix Required**: Change Trixie → Bookworm in debian.sources

### Container/VM Status
- **Containers**: None currently running
- **VMs**: None currently configured
- **GPU Passthrough**: Not yet enabled (requires IOMMU setup)

## 🎯 **GPU ALLOCATION STRATEGY**

### RTX 5070 Ti (Primary - 16GB VRAM)
- **Gaming**: Windows 11 VM with full passthrough
- **AI/LLM**: Large model inference (CodeLlama 34B, Mixtral 8x7B)
- **Heavy Transcoding**: 4K content when needed
- **Development**: AI coding assistants, model fine-tuning

### GTX 970 (Secondary - 4GB VRAM)
- **Plex Transcoding**: Dedicated 1080p optimization
- **Backup Transcoding**: When RTX 5070 Ti busy with gaming
- **Testing**: Development workloads
- **Efficiency**: Frees premium GPU for high-value tasks

### Dynamic GPU Management
- Script-based GPU reassignment between containers
- Real-time load monitoring and automatic failover
- One-command switching for different workload priorities

## 🏗️ **GIT WORKTREE OPERATIONAL STATUS**

### Active Worktrees
```
✅ ~/projects/proxmox-homelab/                    (main - documentation/planning)
✅ ~/projects/proxmox-homelab-reader/             (reader - research/diagnostics)
✅ ~/projects/proxmox-homelab-writer/             (writer - implementation)
✅ ~/projects/proxmox-homelab-features/           (feature branches)
    └── data-recovery-urgent/                    (ZFS recovery focus)
```

### Worktree Health
- **Threading Scripts**: Operational via `./scripts/claude_threads.sh`
- **Branch Sync**: All branches aware of hardware changes
- **Documentation**: ZFS incident documented in reader branch
- **Task Distribution**: Reader for diagnostics, writer for implementation

## 📋 **EXECUTION PHASES**

### Phase 1: Data Recovery (IMMEDIATE - Days 1-3)
```bash
# 🔥 CRITICAL PATH
1. Mount 4TB recovery drive for staging
2. Clone 3.6TB media drive (sdb) using ddrescue
3. File carving with photorec/foremost on cloned image
4. Verify recovered Plex media files
5. Stage recovered data on 4TB drive
```

### Phase 2: GPU Configuration (Days 2-4)
```bash
# Parallel to data recovery
1. Fix nvidia-smi driver issues
2. Install GTX 970 (pending cable arrival)
3. Configure IOMMU for dual GPU passthrough
4. Test basic GPU allocation to containers
```

### Phase 3: Service Restoration (Days 4-7)
```bash
# After data recovery success
1. Create Plex LXC container with GTX 970 access
2. Restore Plex library from recovered data
3. Set up Windows 11 gaming VM with RTX 5070 Ti
4. Configure AI/LLM services (Ollama, Continue.dev)
```

### Phase 4: Storage Expansion (Week 2)
```bash
# Full infrastructure buildout
1. Install LSI HBA for additional SATA ports
2. Shuck external drives for pool expansion
3. ICY DOCK testing workflow implementation
4. New storage pool architecture (post-ZFS)
```

## 🚀 **READY ACTIONS** (Available Now)

### High Priority Queue
1. **Mount Recovery Drive**: Prepare 4TB staging area
2. **Driver Diagnostics**: Investigate nvidia-smi issues
3. **Repository Fix**: Correct Trixie→Bookworm in sources
4. **Cable Monitoring**: Track right angle audio cable delivery
5. **Backup Planning**: Document current data recovery approach

### Research Tasks (Reader Worktree)
- Drive health assessment with smartctl
- GPU driver troubleshooting
- ZFS recovery tool evaluation
- ICY DOCK functionality testing

### Implementation Tasks (Writer Worktree)
- Repository configuration fixes
- Basic container templates
- GPU passthrough preparation
- Recovery script development

## 📊 **SUCCESS METRICS**

### Data Recovery Phase
- **Target**: 80%+ media file recovery from 3.6TB drive
- **Quality**: Playable video files with intact metadata
- **Speed**: Complete cloning within 24-48 hours

### GPU Configuration Phase
- **nvidia-smi**: Working GPU monitoring and stats
- **Passthrough**: Both GPUs accessible to containers/VMs
- **Performance**: Baseline transcoding tests successful

### Service Restoration Phase
- **Plex**: Functional media server with recovered library
- **Gaming**: Windows 11 VM with RTX 5070 Ti performance
- **AI**: Local model inference operational

## 🔮 **STRATEGIC OUTLOOK**

### Hardware Advantages
- **Dual GPU**: Professional transcoding + gaming/AI separation
- **32GB RAM**: Sufficient for multiple VMs and AI workloads
- **750W PSU**: Headroom for future expansion
- **ICY DOCK**: Flexible storage testing and hot-swap capabilities

### Software Flexibility
- **Worktree System**: Parallel development streams
- **Container Focus**: Lightweight service deployment
- **GPU Sharing**: Dynamic resource allocation
- **Recovery Capability**: Multiple data rescue strategies

### Future Expansion
- **Storage**: Easy scaling with LSI HBA and drive shucking
- **Compute**: Container orchestration with GPU acceleration
- **Development**: Full AI coding assistant stack
- **Gaming**: High-performance Windows VM

---

**Next Immediate Action**: Mount 4TB recovery drive and begin sdb cloning process  
**Primary Blocker**: ZFS data recovery must complete before major service deployment  
**Hardware Ready**: GTX 970 installation pending cable delivery (expected within days)