# Core Project Principles

### 🚨 **CRITICAL: NO TRIXIE PACKAGES RULE**
**ABSOLUTELY NO packages from Trixie repositories may be installed during setup phase. This rule is IRONCLAD and NON-NEGOTIABLE.**
- See `/CRITICAL-REPOSITORY-RULE.md` for full details
- Installing Trixie packages will REMOVE Proxmox components
- Use manual installers or Docker containers instead
- This rule remains until system stable + explicit removal approval

### 📚 **UNIFIED DOCUMENTATION - SINGLE SOURCE OF TRUTH**
**All project documentation is centralized at `/home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/`**

**Key Documents**:
- **Framework**: `/docs/UNIFIED-REFERENCE/FRAMEWORK/5-thread-execution-model.md` - Mandatory execution protocol
- **Handoffs**: `/docs/UNIFIED-REFERENCE/FRAMEWORK/thread-handoff-templates.md` - Standard templates
- **Current Cycle**: `/docs/UNIFIED-REFERENCE/THREAD-CYCLES/current-cycle.md` - Active execution status
- **Master Index**: `/docs/UNIFIED-REFERENCE/MASTER-INDEX.md` - Complete navigation hub

**All worktrees reference this single documentation source to prevent fragmentation.**
