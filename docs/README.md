# Proxmox Homelab Documentation

**Hierarchical documentation system for the Proxmox VE homelab infrastructure**

This documentation has been restructured into a logical hierarchy that separates current operational truth from historical context, architectural standards from operational procedures.

## Documentation Organization

### 📊 [CURRENT/](CURRENT/) - Verified System State
**What the system IS right now** - SSH-verified operational truth

- **[hardware-inventory.md](CURRENT/hardware-inventory.md)** - Current hardware configuration and status
- **[storage-architecture.md](CURRENT/storage-architecture.md)** - ZFS pool status and capacity utilization  
- **[services-deployed.md](CURRENT/services-deployed.md)** - Actually running services with confirmed URLs
- **[next-actions.md](CURRENT/next-actions.md)** - Immediately executable tasks and priorities

**Verification Standards**: All content verified via SSH to 192.168.0.99 on 2025-08-25 11:17 EDT

### 🏗️ [ARCHITECTURE/](ARCHITECTURE/) - Design Standards
**How the system SHOULD be built** - Proven patterns and standards

- **[storage-mounting.md](ARCHITECTURE/storage-mounting.md)** - Container storage architecture with ZFS pools
- **[worktree-strategy.md](ARCHITECTURE/worktree-strategy.md)** - Orchestrated multi-threaded development
- **[gpu-allocation.md](ARCHITECTURE/gpu-allocation.md)** - Dual GPU strategic allocation patterns

**Implementation Status**: Production-ready standards validated through real-world implementation

### ⚙️ [WORKFLOWS/](WORKFLOWS/) - Operational Procedures  
**How the system IS operated** - Repeatable procedures and workflows

- **[data-curation-workflow.md](WORKFLOWS/data-curation-workflow.md)** - Web-based file management procedures
- **[media-processing.md](WORKFLOWS/media-processing.md)** - Media file processing and Plex integration
- **[backup-procedures.md](WORKFLOWS/backup-procedures.md)** - Comprehensive data protection strategies

**Validation**: Procedures tested and refined through operational experience

### 📚 [ARCHIVE/](ARCHIVE/) - Historical Context
**What the system WAS** - Preserved historical documentation

- **[2025-08-recovery/](ARCHIVE/2025-08-recovery/)** - Complete data recovery mission documentation
- **[legacy-planning/](ARCHIVE/legacy-planning/)** - Early project planning and assessment documents  

**Purpose**: Learning resource, audit trail, and institutional knowledge preservation

## Quick Navigation

### New to the Project?
1. **[CURRENT/README.md](CURRENT/README.md)** - Start here for current system overview
2. **[CURRENT/hardware-inventory.md](CURRENT/hardware-inventory.md)** - Understand the hardware foundation
3. **[CURRENT/services-deployed.md](CURRENT/services-deployed.md)** - See what's currently running

### Planning Changes?
1. **[ARCHITECTURE/](ARCHITECTURE/)** - Review established patterns and standards
2. **[CURRENT/next-actions.md](CURRENT/next-actions.md)** - Check immediate priorities
3. **[WORKFLOWS/](WORKFLOWS/)** - Use proven operational procedures

### Researching History?
1. **[ARCHIVE/2025-08-recovery/](ARCHIVE/2025-08-recovery/)** - Data recovery success story
2. **[ARCHIVE/legacy-planning/](ARCHIVE/legacy-planning/)** - Project evolution from conception

### Need to Operate the System?
1. **[WORKFLOWS/README.md](WORKFLOWS/README.md)** - Overview of operational procedures
2. Service-specific workflows in **[WORKFLOWS/](WORKFLOWS/)** directory
3. **[CURRENT/services-deployed.md](CURRENT/services-deployed.md)** - Current service access information

## System Status Summary

### ✅ Operational (As of 2025-08-25)
- **Storage**: 9TB+ ZFS pools with excellent capacity (5.6% utilization)
- **Recovery**: 246MB personal content successfully preserved and protected
- **Services**: 6/8 services running (FileBrowser, Prometheus, Firefox, Plex, Node Exporter, WireGuard)
- **Hardware**: Dual GPU setup ready for deployment (pending NVIDIA drivers)

### ⚠️ Known Issues
- **Grafana**: Container stopped, monitoring dashboard inaccessible
- **Deluge**: LXC container stopped, torrent client offline  
- **GPU Drivers**: RTX 5070 Ti requires NVIDIA 575+ (not yet released)
- **External Access**: Services only respond to localhost (potential firewall issue)

### 🎯 Immediate Priorities
1. **Restart Monitoring Stack**: Restore Grafana and Deluge services
2. **GPU Driver Research**: Monitor NVIDIA driver availability for RTX 5070 Ti
3. **Service Expansion**: Deploy AI/LLM services pending GPU drivers
4. **External Access**: Investigate network accessibility configuration

## Documentation Standards

### Content Categories
- **CURRENT**: Only SSH-verified facts, no speculation or future plans
- **ARCHITECTURE**: Proven patterns from successful implementations
- **WORKFLOWS**: Step-by-step procedures tested in production
- **ARCHIVE**: Historical preservation with original context maintained

### Update Procedures
- **CURRENT**: Update when system state changes, verify via SSH
- **ARCHITECTURE**: Evolve based on proven implementation experience  
- **WORKFLOWS**: Refine based on operational feedback and lessons learned
- **ARCHIVE**: Preserve historical accuracy, minimal updates only for clarity

### Cross-Reference System
Each directory includes comprehensive README files with cross-references to related documentation, ensuring easy navigation between current state, architectural standards, operational procedures, and historical context.

## Migration Context

This hierarchical structure was created on 2025-08-25 by the Documentation Migration Agent to address critical discrepancies between documentation claims and actual system state identified by Reader Agent verification.

**Key Improvements**:
- **Accuracy**: Current documentation now reflects SSH-verified reality
- **Organization**: Logical separation of different documentation types
- **Navigation**: Clear directory structure with comprehensive README files
- **Preservation**: Complete historical context maintained in organized archive

The migration successfully restructured 21 markdown documents into this logical hierarchy while preserving all content and correcting service status discrepancies.