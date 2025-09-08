# ⚠️ **ARCHIVED** - Legacy Week 1 Tasks

**Status**: Data recovery mission COMPLETED successfully (2025-08-17 to 2025-08-23).
**Recovery Results**: 31 personal photos + 1,246 forensic files preserved (246MB total).
**Current Development**: Multi-threaded orchestrated approach via Git worktrees.

**Active Task Management**: See `/docs/next-phase-roadmap.md` for current multi-threaded assignments.

---

# Legacy Week 1 Tasks - UPDATED FOR DATA RECOVERY

## 🚨 CRITICAL PRIORITY: ZFS Data Recovery
**Status**: ZFS pool signatures wiped on 2025-08-17  
**Impact**: 3.6TB Plex media library inaccessible  
**Action Required**: Immediate data recovery operations  

### Data Recovery Tasks (URGENT)
1. [ ] **Mount 4TB recovery drive** for staging operations
2. [ ] **Clone 3.6TB media drive** using ddrescue to recovery drive
3. [ ] **File carving** with photorec/foremost on cloned image
4. [ ] **Verify recovered files** before any reformatting
5. [ ] **Stage recovered data** on 4TB drive for Plex restoration

### Parallel Hardware Tasks
1. [ ] **Fix nvidia-smi** driver issues (RTX 5070 Ti detected but not accessible)
2. [ ] **Install GTX 970** when right angle audio cables arrive
3. [ ] **Configure GPU passthrough** (IOMMU) for both cards
4. [ ] **Fix repository sources** (debian.sources Trixie → Bookworm)

## Completed ✅
- [x] Fix repository configuration (Bookworm) - **PARTIAL** (debian.sources still needs fix)
- [x] Enable SSH access
- [x] Set up git worktree system
- [x] Document hardware status (RTX 5070 Ti installed)
- [x] Install ICY DOCK mobile rack
- [x] Identify ZFS data loss scope

## Blocked Until Data Recovery ⏸️
1. ~~Import ZFS pool~~ - **IMPOSSIBLE** (signatures wiped)
2. ~~Create Plex LXC container~~ - **WAITING** for data recovery
3. Configure Proxmox firewall - **LOW PRIORITY**
4. Set up SSL certificates - **LOW PRIORITY**
5. Plan storage architecture - **REDESIGN NEEDED** (post-ZFS)

## Emergency Commands
```bash
# Data Recovery
ssh proxmox
mkdir -p /mnt/recovery
mount /dev/sdX /mnt/recovery  # 4TB recovery drive
ddrescue /dev/sdb /mnt/recovery/media_backup.img /mnt/recovery/rescue.log

# GPU Diagnostics
lspci | grep VGA  # Verify GPU detection
nvidia-smi        # Check driver status
```

## Status Dashboard
- **Hardware**: RTX 5070 Ti ✅, GTX 970 ⏳, ICY DOCK ✅
- **Software**: Proxmox ✅, SSH ✅, Drivers ❌
- **Data**: ZFS pool ❌, Recovery drive ✅
- **Services**: None deployed (blocked by data loss)
