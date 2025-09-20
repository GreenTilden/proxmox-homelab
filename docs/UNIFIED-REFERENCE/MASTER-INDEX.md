# 📚 MASTER INDEX - Proxmox Homelab Documentation

**Status**: ✅ **SINGLE SOURCE OF TRUTH**
**Updated**: 2025-08-29 - **GBGREG ENTERPRISE INTEGRATION COMPLETE**
**Location**: `/home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/`
**Purpose**: Central navigation hub for all project documentation

## 🎯 **Quick Navigation**

### **Essential Documents**
- [5-Thread Execution Model](./FRAMEWORK/5-thread-execution-model.md) - **MANDATORY** execution protocol
- [Post-Clear Context Packages](./OPERATIONS/post-clear-thread-context-packages.md) - **NEW** Complete context recovery for all threads
- [Cycle 14 Transition Summary](./CURRENT/cycle-14-transition-summary.md) - **NEW** User guide generation and maintenance phase
- [Enterprise AI Assessment](./ARCHITECTURE/enterprise-ai-deployment-assessment.md) - 3-tier scaling strategy & business case
- [RTX 5070 Ti Guide](./ARCHITECTURE/rtx-5070-ti-acceleration-guide.md) - ✅ **ENTERPRISE VALIDATED** GPU acceleration

## 📂 **Documentation Structure**

### **FRAMEWORK/** - Core Execution Models
| Document | Description | Primary Thread |
|----------|-------------|---------------|
| [5-thread-execution-model.md](./FRAMEWORK/5-thread-execution-model.md) | Mandatory execution protocol | All threads |
| [thread-handoff-templates.md](./FRAMEWORK/thread-handoff-templates.md) | Standardized handoff formats | All threads |
| agent-coordination.md | Agent management protocols | Main/Debug |
| worktree-strategy.md | Git workflow patterns | All threads |

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
| container-standards.md | Docker/LXC patterns | Writer |
| network-services.md | Network architecture | Writer |

### **OPERATIONS/** - Service Procedures
| Document | Description | Primary Thread |
|----------|-------------|---------------|
| [post-clear-thread-context-packages.md](./OPERATIONS/post-clear-thread-context-packages.md) | **NEW** ✅ **COMPLETE** Context recovery packages for all thread types | Documentation |
| [memory-optimization-procedures.md](./OPERATIONS/memory-optimization-procedures.md) | RAM allocation resolution & large model deployment | Documentation |
| service-deployments.md | Service installation guides | Writer |
| monitoring-grafana.md | Monitoring stack setup | Writer |
| troubleshooting-guide.md | Debug procedures | Debug |
| [cuda-error-304-resolution.md](./OPERATIONS/cuda-error-304-resolution.md) | CUDA Error 304 resolution guide | Debug |
| backup-recovery.md | Data protection strategies | Writer |

### **THREAD-CYCLES/** - Execution Tracking
| Document | Description | Update Frequency |
|----------|-------------|------------------|
| [current-cycle.md](./THREAD-CYCLES/current-cycle.md) | Active cycle status | Every thread transition |
| [gbgreg-integration-cycle-2025-08-29/](./THREAD-CYCLES/cycle-history/gbgreg-integration-cycle-2025-08-29/) | **NEW** ✅ **COMPLETE** Enterprise integration cycle archive | Complete |
| [large-model-testing-cycle-plan.md](./THREAD-CYCLES/large-model-testing-cycle-plan.md) | Next cycle architecture for 33B-70B models | Ready for execution |
| next-objectives.md | Upcoming thread tasks | End of cycle |
| cycle-history/ | Completed cycles | Archive after completion |
| [gpu-maximum-capacity-testing-2025-08-28.md](./THREAD-CYCLES/cycle-history/gpu-maximum-capacity-testing-2025-08-28.md) | Complete 7-hour testing campaign baseline | Archive |

## 🔄 **Thread-Specific References**

### **🎯 Main Thread**
**Primary Documents**:
- [5-Thread Execution Model](./FRAMEWORK/5-thread-execution-model.md)
- [Thread Handoff Templates](./FRAMEWORK/thread-handoff-templates.md)
- [Current Cycle Status](./THREAD-CYCLES/current-cycle.md)

**Responsibilities**:
- Orchestrate thread execution
- Generate thread prompts
- Process status reports
- Update cycle documentation

### **🔍 Reader Thread**
**Primary Documents**:
- [Hardware Inventory](./ARCHITECTURE/hardware-inventory.md) (verification)
- [Service Status](./OPERATIONS/service-deployments.md) (health checks)
- Research findings documentation

**Responsibilities**:
- System verification
- Status analysis
- Research operations
- Report generation

### **⚡ Writer Thread**
**Primary Documents**:
- [Container Standards](./ARCHITECTURE/container-standards.md)
- [Service Deployments](./OPERATIONS/service-deployments.md)
- [ZFS Storage](./ARCHITECTURE/storage-zfs-pools.md)

**Responsibilities**:
- Infrastructure implementation
- Service deployment
- Configuration updates
- Documentation creation

### **🔧 Debug Thread**
**Primary Documents**:
- [Memory Optimization Procedures](./OPERATIONS/memory-optimization-procedures.md) - **NEW** RAM allocation resolution authority
- [Troubleshooting Guide](./OPERATIONS/troubleshooting-guide.md)
- [CUDA Error 304 Resolution](./OPERATIONS/cuda-error-304-resolution.md)
- [RTX 5070 Ti Acceleration Guide](./ARCHITECTURE/rtx-5070-ti-acceleration-guide.md) - **ENHANCED** with large model support
- [GPU Driver Issues](./ARCHITECTURE/gpu-rtx-5070-ti.md)
- Debug SME agent knowledge

**Responsibilities**:
- Complex troubleshooting
- Memory allocation optimization
- Large model infrastructure validation
- Performance optimization
- GPU acceleration debugging
- Issue resolution
- Knowledge capture

### **📚 Documentation Thread**
**Primary Documents**:
- This MASTER-INDEX.md
- All UNIFIED-REFERENCE content
- [Thread Cycle History](./THREAD-CYCLES/cycle-history/)

**Responsibilities**:
- Documentation synthesis
- Cross-reference maintenance
- Knowledge organization
- Archive management

## 📊 **Current System Status - CYCLE 14 READY**

### **Infrastructure**
- **Proxmox Version**: 9.0.3
- **IP Address**: 192.168.0.99
- **Storage**: 9.9TB total ZFS pools
- **Services**: Multi-container AI system operational

1. **4-Container AI Architecture**: ✅ **OPERATIONAL** - Coordinator, Technical, Documentation, Vision models deployed
2. **Database Integration**: ✅ **OPERATIONAL** - PostgreSQL on port 5433 with sustained performance
3. **Frontend Interface**: ✅ **AVAILABLE** - Vue.js responsive interface on port 5173 ready for user guide creation
4. **API Gateway**: ✅ **RESPONDING** - Port 3333 health endpoints operational for system monitoring
5. **Documentation Architecture**: ✅ **COMPLETE** - UNIFIED-REFERENCE single source of truth with post-clear context packages
6. **Transition Readiness**: ✅ **PREPARED** - Ready for user-focused documentation generation and maintenance automation

### **Recent Achievements** 🚀
- ✅ **GBGREG ENTERPRISE INTEGRATION COMPLETE**: Full enterprise AI laboratory automation platform operational (2025-08-29)
- ✅ **Multi-Container AI Architecture**: 5-container coordination system with specialized AI models deployed
- ✅ **Production Database Integration**: PostgreSQL with laboratory automation schemas and performance optimization
- ✅ **Modern Frontend Deployment**: Vue.js responsive interface with API gateway and real-time updates
- ✅ **Enterprise Monitoring Stack**: Custom Prometheus exporter with Grafana dashboard integration
- ✅ **Comprehensive Documentation**: 47-page technical architecture + operational procedures + complete cycle archive
- ✅ **Remote Management Excellence**: SSH-based operations from development laptop with proven reliability
- ✅ **Knowledge Synthesis Complete**: Multi-threaded development best practices and enterprise patterns documented

### **Complete Model Performance Matrix** ✅

| Model | Parameters | VRAM Usage | Response Time | Words Generated | GPU Utilization | Enterprise Application |
|-------|------------|------------|---------------|-----------------|------------------|---------------------|
| **llama3.2:1b** | 1.3B | 3-4GB | 15-30s | 150-250 | 65-75% | Real-time coordination |
| **llama3.2:3b** | 3.2B | 4-5GB | 30-60s | 200-300 | 70-80% | Rapid experiment planning |
| **deepseek-coder:6.7b** | 6.7B | **11.4GB** | **1m15s** | **465** | **91%** | ✅ **OPTIMAL** Production coding |
| **codellama:7b** | 7B | 8-10GB | 45-90s | 300-400 | 80-85% | Code generation |
| **llava:7b** | 7B | **5.4GB** | **1m49s** | **210** | **92%** | Vision analysis (screenshots) |
| **llama3.1:8b** | 8.1B | **10.8GB** | **1m30s** | **688** | **75%** | Technical documentation |
| **mistral:7b** | 7.3B | 6-8GB | 45-75s | 250-350 | 75-85% | General analysis |

**Key Findings**: Multi-model ensemble approach provides superior efficiency compared to single 70B+ models due to system RAM constraints. Optimal production configuration identified.

## 🚀 **Quick Start Guides**

3. Access operational services: Frontend (http://192.168.0.99:5173), API gateway, monitoring (Port 9105)
4. Follow [Integration Cycle Archive](./THREAD-CYCLES/cycle-history/gbgreg-integration-cycle-2025-08-29/) - Complete development knowledge

### **For Enterprise AI Deployment**
1. Review [Enterprise Assessment](./ARCHITECTURE/enterprise-ai-deployment-assessment.md) - Complete business case
2. Check [Performance Validation](./THREAD-CYCLES/cycle-history/gpu-maximum-capacity-testing-2025-08-28.md) - Technical specifications
3. Deploy [optimal model configuration](./ARCHITECTURE/enterprise-performance-addendum.md) - deepseek-coder:6.7b
4. Implement [monitoring integration](./ARCHITECTURE/enterprise-performance-addendum.md#enterprise-monitoring-integration)

### **For New Thread Sessions**
1. Check [Current Cycle](./THREAD-CYCLES/current-cycle.md)
2. Review thread-specific documents above
3. Use [Handoff Templates](./FRAMEWORK/thread-handoff-templates.md)
4. Update cycle documentation after completion

### **For Service Deployment**
1. Review [Container Standards](./ARCHITECTURE/container-standards.md)
2. Check [ZFS Mounting Patterns](./ARCHITECTURE/storage-zfs-pools.md)
3. Follow [Service Deployment Guide](./OPERATIONS/service-deployments.md)
4. Update [Monitoring Configuration](./OPERATIONS/monitoring-grafana.md)

### **For Troubleshooting**
1. Start with [Troubleshooting Guide](./OPERATIONS/troubleshooting-guide.md)
2. Check [Hardware Status](./ARCHITECTURE/hardware-inventory.md)
3. Review [Service Logs](./OPERATIONS/service-deployments.md)
4. Escalate to Debug Thread if needed

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
- Grafana: http://192.168.0.99:3000
- Plex: http://192.168.0.99:32400

### **Service Documentation**
- [Grafana Docs](https://grafana.com/docs/)
- [Proxmox Wiki](https://pve.proxmox.com/wiki/)
- [ZFS Documentation](https://openzfs.github.io/openzfs-docs/)

## 🔍 **Search Index**

### **By Topic**
- **🚀 Enterprise AI Deployment**: [Business Assessment](./ARCHITECTURE/enterprise-ai-deployment-assessment.md), [Performance Validation](./ARCHITECTURE/enterprise-performance-addendum.md), [Testing Results](./THREAD-CYCLES/cycle-history/gpu-maximum-capacity-testing-2025-08-28.md)
- **🔧 Hardware & Infrastructure**: [Inventory](./ARCHITECTURE/hardware-inventory.md), [RTX 5070 Ti Guide](./ARCHITECTURE/rtx-5070-ti-acceleration-guide.md) ✅ **ENTERPRISE VALIDATED**
- **📊 Performance & Monitoring**: [Model Performance Matrix](./ARCHITECTURE/enterprise-performance-addendum.md), [Custom Prometheus Integration](./OPERATIONS/gbgreg-enterprise-procedures.md#monitoring-and-operations-integration)
- **🗃️ Storage & Containers**: [ZFS Pools](./ARCHITECTURE/storage-zfs-pools.md), [Container Standards](./ARCHITECTURE/container-standards.md), [Deployment Patterns](./OPERATIONS/service-deployments.md)
- **📋 Development Methodology**: [5-Thread Execution](./FRAMEWORK/5-thread-execution-model.md), [Multi-Cycle Planning](./ARCHITECTURE/gbgreg-integration-roadmap.md), [Knowledge Synthesis](./THREAD-CYCLES/cycle-history/gbgreg-integration-cycle-2025-08-29/lessons-learned.md)

### **By Thread**
- **Main**: [Framework](./FRAMEWORK/5-thread-execution-model.md), [Cycles](./THREAD-CYCLES/)
- **Reader**: [Verification](./FRAMEWORK/thread-handoff-templates.md#reader-thread-report)
- **Writer**: [Implementation](./OPERATIONS/service-deployments.md)
- **Debug**: [Troubleshooting](./OPERATIONS/troubleshooting-guide.md)
- **Documentation**: [Synthesis](./FRAMEWORK/thread-handoff-templates.md#documentation-thread-report)

### **By Workflow**
- **Deployment**: [Standards](./ARCHITECTURE/container-standards.md) → [Procedures](./OPERATIONS/service-deployments.md) → [Monitoring](./OPERATIONS/monitoring-grafana.md)
- **Troubleshooting**: [Guide](./OPERATIONS/troubleshooting-guide.md) → [Debug Thread](./FRAMEWORK/5-thread-execution-model.md#debug-thread)
- **Documentation**: [Templates](./FRAMEWORK/thread-handoff-templates.md) → [Updates](./THREAD-CYCLES/current-cycle.md)

## 📅 **Maintenance Schedule**

| Task | Frequency | Location | Thread |
|------|-----------|----------|--------|
| Cycle documentation | Per execution | THREAD-CYCLES/ | All |
| Cross-reference check | Weekly | All documents | Documentation |
| Archive old cycles | Monthly | cycle-history/ | Documentation |
| Index update | As needed | This file | Documentation |

---

**This MASTER INDEX is the primary navigation hub for all project documentation.**
**All worktrees should reference `/home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/` as the single source of truth.**