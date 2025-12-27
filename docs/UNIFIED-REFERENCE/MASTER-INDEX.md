# 📚 MASTER INDEX - Proxmox Homelab Documentation

**Status**: ✅ **SINGLE SOURCE OF TRUTH**
**Updated**: 2025-08-29 - **GBGREG ENTERPRISE INTEGRATION COMPLETE**
**Location**: `/home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/`
**Purpose**: Central navigation hub for all project documentation

## 🎯 **Quick Navigation**

### **Essential Documents**
- [Gemini Development Framework](./FRAMEWORK/gemini_development_framework.md) - **Our new workflow guide.**
- [Post-Clear Context Packages](./OPERATIONS/post-clear-thread-context-packages.md) - **NEW** Complete context recovery for all threads
- [Cycle 14 Transition Summary](./CURRENT/cycle-14-transition-summary.md) - **NEW** User guide generation and maintenance phase
- [Enterprise AI Assessment](./ARCHITECTURE/enterprise-ai-deployment-assessment.md) - 3-tier scaling strategy & business case
- [RTX 5070 Ti Guide](./ARCHITECTURE/rtx-5070-ti-acceleration-guide.md) - ✅ **ENTERPRISE VALIDATED** GPU acceleration

## 📂 **Documentation Structure**

### **PROJECT_MANAGEMENT/** - Core Principles & Workflow
| Document | Description |
|----------|-------------|
| [README.md](./PROJECT_MANAGEMENT/README.md) | Overview of the project management section. |
| [CORE_PRINCIPLES.md](./PROJECT_MANAGEMENT/CORE_PRINCIPLES.md) | Core rules and principles of the project. |
| [AGENT_SYSTEM.md](./PROJECT_MANAGEMENT/AGENT_SYSTEM.md) | The AI agent architecture. | |

### **FRAMEWORK/** - Core Execution Models
| Document | Description |
|----------|-------------|
| [gemini_development_framework.md](./FRAMEWORK/gemini_development_framework.md) | The unified Gemini development workflow, replacing all previous thread-based models. |
| [frontend-style-guide.md](./FRAMEWORK/frontend-style-guide.md) | Frontend styling guidelines and coding conventions. |
| [vite-development-server.md](./FRAMEWORK/vite-development-server.md) | Vite development server setup and configuration. |

### **ARCHITECTURE/** - Technical Specifications
| Document | Description | Primary Thread |
|----------|-------------|---------------|
| [gbgreg-enterprise-integration.md](./ARCHITECTURE/gbgreg-enterprise-integration.md) | **NEW** ✅ **OPERATIONAL** Complete enterprise AI platform architecture | Documentation |
| [hardware-inventory.md](./ARCHITECTURE/hardware-inventory.md) | Complete hardware specs | Reader/Writer |
| [storage-zfs-pools.md](./ARCHITECTURE/storage-zfs-pools.md) | ZFS pool architecture | Writer |
| [rtx-5070-ti-acceleration-guide.md](./ARCHITECTURE/rtx-5070-ti-acceleration-guide.md) | ✅ **ENTERPRISE VALIDATED** GPU acceleration | Writer/Debug |
| [enterprise-ai-deployment-assessment.md](./ARCHITECTURE/enterprise-ai-deployment-assessment.md) | 3-tier scaling strategy & ROI analysis | Documentation |
| [enterprise-performance-addendum.md](./ARCHITECTURE/enterprise-performance-addendum.md) | Performance validation supplement | Documentation |
| [gbgreg-integration-roadmap.md](./ARCHITECTURE/gbgreg-integration-roadmap.md) | ✅ Multi-cycle roadmap with validated capabilities | Documentation |
| [HARDWARE_OVERVIEW.md](./ARCHITECTURE/HARDWARE_OVERVIEW.md) | System configuration and shopping list. | Writer |
| [SERVICES_OVERVIEW.md](./ARCHITECTURE/SERVICES_OVERVIEW.md) | Deployed services and their architecture. | Writer |
| [DEPLOYMENT_PATTERNS.md](./ARCHITECTURE/DEPLOYMENT_PATTERNS.md) | Standardized deployment patterns. | Writer |
| container-standards.md | Docker/LXC patterns | Writer |
| network-services.md | Network architecture | Writer |

### **OPERATIONS/** - Service Procedures
| Document | Description | Primary Thread |
|----------|-------------|---------------|
| [post-clear-thread-context-packages.md](./OPERATIONS/post-clear-thread-context-packages.md) | **NEW** ✅ **COMPLETE** Context recovery packages for all thread types | Documentation |
| [memory-optimization-procedures.md](./OPERATIONS/memory-optimization-procedures.md) | RAM allocation resolution & large model deployment | Documentation |
| [GIT_WORKTREE_STRATEGY.md](./OPERATIONS/GIT_WORKTREE_STRATEGY.md) | Details on the Git worktree setup. | All threads |
| [NOTION_INTEGRATION.md](./OPERATIONS/NOTION_INTEGRATION.md) | How the project integrates with Notion. | All threads |
| [KEY_COMMANDS.md](./OPERATIONS/KEY_COMMANDS.md) | A reference for key shell commands. | All threads |
| [MONITORING_AND_SAFETY.md](./OPERATIONS/MONITORING_AND_SAFETY.md) | System health check protocols. | All threads |
| service-deployments.md | Service installation guides | Writer |
| monitoring-grafana.md | Monitoring stack setup | Writer |
| troubleshooting-guide.md | Debug procedures | Debug |
| [cuda-error-304-resolution.md](./OPERATIONS/cuda-error-304-resolution.md) | CUDA Error 304 resolution guide | Debug |
| backup-recovery.md | Data protection strategies | Writer |






## 🚀 **Quick Start Guides**

- Access operational services: Frontend (http://192.168.0.218:5000), API gateway, monitoring (Port 9090).
- Refer to the [Gemini Development Framework](./FRAMEWORK/gemini_development_framework.md) for our updated workflow.


## 📝 **Documentation Standards**

### **File Naming**
- Use lowercase with hyphens: `service-name.md`
- Include category prefix: `gpu-rtx-5070-ti.md`
- Date archives: `2025-08-27-consolidation/`

### **Content Structure**
1. **Header**: Status badge, date, location
2. **Overview**: Purpose and context
3. **Details**: Comprehensive information
4. **Examples**: Practical usage
5. **Troubleshooting**: Common issues
6. **References**: Related documents

### **Update Protocol**
1. Update source document in UNIFIED-REFERENCE
2. Update MASTER-INDEX if structure changes
3. Update current-cycle.md with changes
4. Archive old versions if major revision

## 🔗 **External References**

### **Git Repositories**
- Main: `/home/darney/projects/proxmox-homelab/`
- Reader: `/home/darney/projects/proxmox-homelab-reader/`
- Writer: `/home/darney/projects/proxmox-homelab-writer/`
- Debug: `/home/darney/projects/proxmox-homelab-debug-agent/`

### **System Access**
- Proxmox UI: https://192.168.0.99:8006
- SSH: `ssh root@192.168.0.99`
- Plex: http://192.168.0.99:32400
- Prometheus: http://192.168.0.99:9090
- Ollama Coordinator: http://192.168.0.99:11436
- Ollama Technical: http://192.168.0.99:11437
- qBittorrent: http://192.168.0.111:8112

### **Service Documentation**
- [Proxmox Wiki](https://pve.proxmox.com/wiki/)
- [ZFS Documentation](https://openzfs.github.io/openzfs-docs/)
- [Notion API Documentation](https://developers.notion.com/docs)

## 🔍 **Search Index**

### **By Topic**
- **AI Deployment**: [Enterprise AI Deployment Assessment](./ARCHITECTURE/enterprise-ai-deployment-assessment.md), [Performance Validation](./ARCHITECTURE/enterprise-performance-addendum.md), [Model Performance Matrix](./ARCHITECTURE/enterprise-performance-addendum.md)
- **Hardware & Infrastructure**: [Hardware Overview](./ARCHITECTURE/HARDWARE_OVERVIEW.md), [RTX 5070 Ti Guide](./ARCHITECTURE/rtx-5070-ti-acceleration-guide.md)
- **Performance & Monitoring**: [Monitoring and Safety](./OPERATIONS/MONITORING_AND_SAFETY.md), [Vue Performance Optimization](./MOBILE/vue-performance-optimization-patterns.md)
- **Storage & Containers**: [ZFS Pools](./ARCHITECTURE/storage-zfs-pools.md), [Deployment Patterns](./ARCHITECTURE/DEPLOYMENT_PATTERNS.md)
- **Development Methodology**: [Gemini Development Framework](./FRAMEWORK/gemini_development_framework.md), [Git Workflow](./OPERATIONS/GIT_WORKTREE_STRATEGY.md)



---

**This MASTER INDEX is the primary navigation hub for all project documentation.**
**All worktrees should reference `/home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/` as the single source of truth.**