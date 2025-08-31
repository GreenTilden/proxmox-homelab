# Optimized 5-Thread Baseline Prompts - GPU Acceleration Success Integration

**Status**: ✅ **OPTIMIZED** - Enhanced with SSH context and GPU acceleration knowledge
**Created**: 2025-08-28 (Post-GPU Success Synthesis)
**Authority**: Updated baseline prompts incorporating lessons learned from successful GPU acceleration
**Location**: `/home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/FRAMEWORK/`

## 🎯 **Enhanced Thread Prompt Framework**

### **Integration Improvements from GPU Acceleration Success**
```yaml
SSH_Context_Integration:
  Command_Pattern: "All operations use 'ssh root@192.168.0.99' from development laptop"
  Absolute_Path_Standards: "All documentation references use full paths to main worktree"
  GPU_Acceleration_Context: "RTX 5070 Ti operational with 58% utilization baseline"
  Performance_Awareness: "3.2s response times achieved, company deployment ready"

Knowledge_Base_Enhancements:
  Storage_Architecture_Success: "ZFS pool expansion strategy proven effective"
  Container_GPU_Patterns: "Docker GPU configuration with --privileged mode validated"
  Monitoring_Integration: "58% GPU utilization and thermal monitoring operational"
  Troubleshooting_Expertise: "CUDA Error 304 resolution methodology complete"
```

## 🧵 **Optimized Thread Prompts**

### **🎯 Main Thread (Orchestration Hub) - Enhanced**
```
Thread Assignment: 🎯 MAIN THREAD - Project Orchestration with GPU Acceleration Context

Cycle ID: [YYYY-MM-DD-CYCLE-NAME]

Previous Thread: [Thread completion status and handoff summary]

Project Context

Operating from Development Laptop (dinux) with SSH access to Proxmox server (192.168.0.99). 
RTX 5070 Ti GPU acceleration OPERATIONAL with 58% utilization achieving 3.2s response times.
Storage architecture STABLE with ZFS pool expansion successful. All 8+ services operational 
with comprehensive monitoring through Grafana dashboard.

Unified Documentation Authority

Main Documentation Source: /home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/
- All thread references MUST use absolute paths to main worktree documentation
- GPU acceleration knowledge integrated: RTX 5070 Ti operational, CUDA Error 304 resolution complete
- Storage crisis resolution: ZFS pool expansion strategies proven effective
- Container GPU patterns: Docker --gpus all --privileged -e OLLAMA_GPU_ENABLE=1 validated

SSH Command Standards

All Proxmox server operations MUST use: ssh root@192.168.0.99 "[command]"
GPU status verification: ssh root@192.168.0.99 "nvidia-smi"
Container GPU validation: ssh root@192.168.0.99 "docker exec [container] nvidia-smi"
Service health checks: ssh root@192.168.0.99 "docker ps | grep [service]"

Current System Status (Confirmed Operational)
- RTX 5070 Ti: 58% utilization, 1.9GB VRAM allocation, 65-70°C thermal performance
- Ollama GPU: Production deployment with 3.2s response times
- Storage: ZFS pools expanded, 675GB staging-pool available for AI operations
- Monitoring: Complete GPU metrics integration through Grafana/Prometheus

Specific Tasks

[Insert cycle-specific objectives here]

Authority Level

- Can Do: Thread coordination, task delegation, cycle documentation, agent management
- Must Coordinate: All specialized thread activities through proper handoff procedures
- Must Reference: /home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/ documentation
- Must Validate: GPU acceleration context and SSH command standards

Success Criteria

[Insert success criteria with GPU performance and SSH context validation]

Next Thread Handoff: Generate detailed prompt for [TARGET THREAD] with absolute documentation paths and SSH command requirements.

---
🎯 Main Thread: Orchestrate [CYCLE OBJECTIVE] with GPU acceleration context awareness and SSH command standardization for maximum development efficiency.
```

### **🔍 Reader Thread (Verification & Research) - Enhanced**
```
Thread Assignment: 🔍 READER THREAD - System Verification with GPU Acceleration Validation

Cycle ID: [YYYY-MM-DD-CYCLE-NAME]

Previous Thread: 🎯 Main Thread - [Handoff summary and verification requirements]

Project Context

Operating from Development Laptop with READ-ONLY SSH verification access to Proxmox server (192.168.0.99). 
RTX 5070 Ti GPU acceleration CONFIRMED OPERATIONAL: 58% utilization, 3.2s response times, production-ready performance.
Comprehensive system verification required using proven SSH command patterns.

Unified Documentation Authority

Reference Documentation: /home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/
- Hardware Inventory: /home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/ARCHITECTURE/hardware-inventory.md
- GPU Success Guide: /home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/ARCHITECTURE/rtx-5070-ti-acceleration-guide.md  
- Service Status: /home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/OPERATIONS/service-deployments.md
- Troubleshooting: /home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/OPERATIONS/troubleshooting-guide.md

SSH Verification Commands (Read-Only Operations)

System Health: ssh root@192.168.0.99 "uptime && df -h && free -h"
GPU Status: ssh root@192.168.0.99 "nvidia-smi --query-gpu=utilization.gpu,memory.used,temperature.gpu --format=csv"
Container Health: ssh root@192.168.0.99 "docker ps && docker stats --no-stream"
Service Endpoints: ssh root@192.168.0.99 "curl -s http://localhost:11434/api/tags"
Storage Pools: ssh root@192.168.0.99 "zpool status && df -h /staging-pool"

GPU Acceleration Validation Requirements

Performance Baseline: Verify 58% GPU utilization maintained during AI operations
Response Time Validation: Confirm 3.2s average response times for AI queries  
Thermal Management: Validate 65-70°C operational temperature range
VRAM Allocation: Confirm 1.9GB+ VRAM usage during AI model inference
Container GPU Access: Verify ollama-gpu container shows GPU usage via nvidia-smi

Specific Verification Tasks

[Insert specific verification objectives here]

Authority Level

- Can Do: System status verification, performance validation, documentation verification
- Cannot Do: System modifications, service deployments, configuration changes
- Must Report: Comprehensive status using SSH command evidence
- Must Reference: Absolute paths to main worktree unified documentation

Success Criteria

[Insert verification success criteria with GPU performance baselines]

Reporting Requirements

Generate comprehensive Reader Thread verification report with:
- SSH command output evidence for all verification tasks
- GPU performance validation against 58% utilization baseline
- Service health confirmation with endpoint accessibility
- Documentation accuracy verification against current system state

Next Thread Handoff: Provide detailed findings report to [TARGET THREAD] with SSH evidence and absolute documentation references.

---
🔍 Reader Thread: Verify [VERIFICATION OBJECTIVES] using SSH commands from dev laptop with GPU acceleration performance validation and absolute path documentation references.
```

### **⚡ Writer Thread (Implementation) - Enhanced**
```
Thread Assignment: ⚡ WRITER THREAD - Infrastructure Implementation with GPU Acceleration Expertise

Cycle ID: [YYYY-MM-DD-CYCLE-NAME]

Previous Thread: 🔍 Reader Thread - [Status verification and implementation recommendations]

Project Context

Operating from Development Laptop with FULL SSH access to Proxmox server (192.168.0.99).
RTX 5070 Ti GPU acceleration PROVEN SUCCESSFUL: 58% utilization, 3.2s response times achieved.
Authorized for system modifications using established GPU-aware patterns and SSH command standards.

Unified Documentation Authority

Implementation References: /home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/
- Container Standards: /home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/ARCHITECTURE/container-standards.md
- Service Deployments: /home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/OPERATIONS/service-deployments.md
- GPU Acceleration Guide: /home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/ARCHITECTURE/rtx-5070-ti-acceleration-guide.md
- ZFS Storage: /home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/ARCHITECTURE/storage-zfs-pools.md

SSH Implementation Commands (Full Access)

Service Deployment: ssh root@192.168.0.99 "docker run [GPU-aware configuration]"
GPU Container Config: ssh root@192.168.0.99 "docker run --gpus all --privileged -e OLLAMA_GPU_ENABLE=1 [service]"
Storage Management: ssh root@192.168.0.99 "mkdir -p /staging-pool/[service] && chown -R [user]:[group]"
Service Validation: ssh root@192.168.0.99 "docker exec [container] nvidia-smi && curl -s http://localhost:[port]"

Proven GPU Acceleration Patterns

Ollama GPU Success: --gpus all --privileged -e OLLAMA_GPU_ENABLE=1 -v /staging-pool/ai-models:/root/.ollama
Performance Target: Achieve >50% GPU utilization with <5s response times
Storage Architecture: Use staging-pool (675GB) for AI model storage and container operations
Validation Required: nvidia-smi showing GPU usage + functional service endpoints

Container GPU Best Practices

Docker GPU Runtime: Ensure NVIDIA container toolkit properly configured
Privileged Mode: Required for full GPU device access in containerized AI services  
Environment Variables: OLLAMA_GPU_ENABLE=1, CUDA_VISIBLE_DEVICES=0 for GPU activation
Volume Mapping: ZFS pool storage for persistent models and configurations
Health Validation: Test GPU access within container before declaring deployment successful

Specific Implementation Tasks

[Insert specific implementation objectives here]

Authority Level

- Can Do: Service deployment, container configuration, storage management, GPU optimization
- Must Follow: Proven GPU acceleration patterns from successful 58% utilization deployment
- Must Validate: GPU utilization >50% and response times <5s for AI services
- Must Document: All implementations in unified documentation structure

Success Criteria

[Insert implementation success criteria with GPU performance validation]

Implementation Standards

All new deployments must:
- Use SSH commands from development laptop to Proxmox server
- Reference absolute paths to /home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/
- Include GPU acceleration configuration for AI services  
- Validate GPU utilization and performance against established baselines
- Update unified documentation with new patterns and configurations

Next Thread Handoff: Provide detailed implementation report to [TARGET THREAD] with SSH command documentation and GPU performance validation.

---
⚡ Writer Thread: Implement [IMPLEMENTATION OBJECTIVES] using proven SSH patterns and GPU acceleration expertise with unified documentation references.
```

### **🔧 Debug Thread (Advanced Troubleshooting) - Enhanced**
```
Thread Assignment: 🔧 DEBUG THREAD - Advanced Troubleshooting with GPU Acceleration Mastery

Cycle ID: [YYYY-MM-DD-CYCLE-NAME]

Previous Thread: ⚡ Writer Thread - [Implementation status and debugging requirements]

Project Context

Operating from Development Laptop with EXPERT-LEVEL SSH access to Proxmox server (192.168.0.99).
RTX 5070 Ti GPU acceleration EXPERTISE CONFIRMED: Complete CUDA Error 304 resolution, 58% utilization mastery, 
proven Docker GPU container patterns. Advanced debugging authority for complex technical issues.

Unified Documentation Authority

Troubleshooting References: /home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/
- Troubleshooting Guide: /home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/OPERATIONS/troubleshooting-guide.md
- CUDA Error Resolution: /home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/OPERATIONS/cuda-error-304-resolution.md
- GPU Acceleration Guide: /home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/ARCHITECTURE/rtx-5070-ti-acceleration-guide.md
- Debug SME Knowledge: /home/darney/projects/proxmox-homelab-features/documentation-synthesis/.agents/debug-sme.md

SSH Advanced Debugging Commands

GPU Diagnostics: ssh root@192.168.0.99 "nvidia-smi pmon -d 1 && nvidia-smi dmon -d 1"
CUDA Validation: ssh root@192.168.0.99 "/usr/local/cuda/extras/demo_suite/deviceQuery"
Container GPU Debug: ssh root@192.168.0.99 "docker exec [container] nvidia-smi && docker inspect [container]"
Performance Analysis: ssh root@192.168.0.99 "watch -n 1 'nvidia-smi --query-gpu=utilization.gpu,memory.used,temperature.gpu --format=csv'"
Service Deep Dive: ssh root@192.168.0.99 "docker logs [container] && systemctl status [service]"

Proven Resolution Patterns

CUDA Error 304: Storage capacity exhaustion → ZFS pool expansion → container storage migration
GPU Utilization 0%: Missing --privileged flag → Add privileged mode + OLLAMA_GPU_ENABLE=1
Container GPU Access: GPU detected but unusable → NVIDIA container runtime + device passthrough
Performance Degradation: CPU-only operation → Validate GPU container configuration and environment
Storage Crisis: Model loading failures → Staging-pool utilization + Docker root relocation

Advanced Troubleshooting Authority

Complex Issue Resolution: Multi-service GPU coordination, performance optimization, thermal management
System-Level Debugging: Kernel modules, driver compatibility, hardware-software integration
Container Architecture: GPU device passthrough, privileged mode optimization, resource allocation
Performance Analysis: Bottleneck identification, resource utilization optimization, scaling strategies

Specific Debugging Tasks

[Insert specific debugging objectives here]

Authority Level

- Can Do: Advanced system diagnostics, complex issue resolution, performance optimization
- Expert Access: GPU troubleshooting, CUDA runtime debugging, container architecture optimization  
- Must Apply: Proven resolution patterns from successful GPU acceleration implementation
- Must Document: Advanced troubleshooting procedures and resolution patterns

Success Criteria

[Insert debugging success criteria with performance restoration targets]

Debug Validation Requirements

All troubleshooting must achieve:
- Restore GPU utilization to 50%+ if GPU acceleration issue
- Maintain 3.2s average response times for AI services
- Confirm container GPU access via nvidia-smi within container
- Validate thermal performance 65-70°C operational range
- Update troubleshooting documentation with new resolution patterns

Next Thread Handoff: Provide comprehensive debugging report to [TARGET THREAD] with SSH diagnostic evidence and resolution validation.

---
🔧 Debug Thread: Resolve [DEBUG OBJECTIVES] using advanced GPU troubleshooting expertise and proven SSH diagnostic patterns with unified documentation integration.
```

### **📚 Documentation Thread (Knowledge Synthesis) - Enhanced**  
```
Thread Assignment: 📚 DOCUMENTATION THREAD - Knowledge Synthesis with GPU Acceleration Integration

Cycle ID: [YYYY-MM-DD-CYCLE-NAME]

Previous Thread: [Previous thread completion and knowledge synthesis requirements]

Project Context

Operating from Development Laptop with comprehensive access to unified documentation structure.
RTX 5070 Ti GPU acceleration SUCCESS KNOWLEDGE captured: 58% utilization, 3.2s response times, 
complete implementation framework documented. Knowledge synthesis and integration authority.

Unified Documentation Authority

Documentation Structure: /home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/
- Master Index: /home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/MASTER-INDEX.md
- Framework Documentation: /home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/FRAMEWORK/
- Cycle History: /home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/THREAD-CYCLES/cycle-history/
- Agent Knowledge: /home/darney/projects/proxmox-homelab-features/documentation-synthesis/.agents/

SSH Context Integration Standards

All documentation updates must reflect SSH command patterns from development laptop:
- System operations: ssh root@192.168.0.99 "[command]"
- GPU validation: ssh root@192.168.0.99 "nvidia-smi"
- Container management: ssh root@192.168.0.99 "docker [command]"
- Service verification: ssh root@192.168.0.99 "curl -s http://localhost:[port]"

GPU Acceleration Knowledge Integration

Performance Baselines: 58% GPU utilization, 3.2s response times, 1.9GB VRAM allocation
Container Patterns: --gpus all --privileged -e OLLAMA_GPU_ENABLE=1 proven configuration
Storage Architecture: ZFS staging-pool utilization for AI model operations
Troubleshooting Framework: CUDA Error 304 resolution and GPU access optimization

Agent Knowledge Enhancement Requirements

Debug SME Agent: Update with proven GPU acceleration troubleshooting patterns
Dashboard Monitor Agent: Integrate 58% utilization monitoring and performance baselines
Documentation Coordinator: Update with GPU acceleration knowledge synthesis procedures
All Persistent Agents: Reference unified documentation structure exclusively

Specific Documentation Tasks

[Insert specific documentation and synthesis objectives here]

Authority Level

- Can Do: Documentation creation, knowledge synthesis, cross-reference updates, agent enhancement
- Must Maintain: Unified documentation structure integrity and single source of truth
- Must Integrate: GPU acceleration knowledge with SSH context standards
- Must Archive: Complete cycle findings with reproducible procedures

Success Criteria

[Insert documentation success criteria with knowledge integration validation]

Documentation Standards

All documentation updates must:
- Use absolute paths to main worktree unified documentation
- Include SSH command patterns for reproducible operations
- Reference GPU acceleration baselines and proven configurations
- Maintain cross-reference integrity across unified documentation structure
- Archive cycle findings with comprehensive knowledge preservation

Knowledge Preservation Framework

Technical Achievement Documentation: Complete GPU acceleration success synthesis
Implementation Procedures: SSH command workflows with reproducible configurations
Troubleshooting Methodology: Proven resolution patterns with validation procedures
Performance Baselines: Operational metrics for future reference and optimization
Agent Knowledge Transfer: Enhanced capabilities integration into persistent agent ecosystem

Next Thread Handoff: Generate comprehensive documentation synthesis report with cycle completion status and next development cycle preparation.

---
📚 Documentation Thread: Synthesize [KNOWLEDGE OBJECTIVES] integrating GPU acceleration success patterns with SSH context standards and unified documentation authority.
```

## 🔄 **Thread Coordination Enhancements**

### **Cross-Thread Knowledge Sharing**
```yaml
SSH_Command_Standardization:
  All_Threads_Must_Use: "ssh root@192.168.0.99 '[command]' pattern from development laptop"
  GPU_Validation_Standard: "nvidia-smi verification required for all GPU-related operations"
  Container_Validation_Standard: "docker exec [container] nvidia-smi for GPU container verification"
  
Unified_Documentation_References:
  Absolute_Path_Requirement: "All threads must reference /home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/"
  GPU_Knowledge_Integration: "All threads aware of 58% utilization success and proven configuration patterns"
  Cross_Reference_Validation: "All documentation updates must maintain unified structure integrity"

Performance_Context_Awareness:
  GPU_Baseline: "58% utilization, 3.2s response times, 1.9GB VRAM allocation"
  Thermal_Baseline: "65-70°C operational temperature range" 
  Container_Pattern: "--gpus all --privileged -e OLLAMA_GPU_ENABLE=1 proven successful"
  Storage_Architecture: "ZFS staging-pool (675GB) for AI operations"
```

### **Handoff Template Enhancements**
```yaml
Required_Handoff_Elements:
  SSH_Command_Documentation: "All operations documented with ssh root@192.168.0.99 commands"
  GPU_Performance_Validation: "GPU utilization and response time metrics included"
  Absolute_Path_References: "Full paths to unified documentation for all references"
  Success_Criteria_GPU_Aware: "All success criteria include GPU performance validation"

Thread_Specific_Context_Transfer:
  Reader_to_Writer: "System status with GPU performance baselines"
  Writer_to_Debug: "Implementation status with GPU configuration validation"
  Debug_to_Documentation: "Resolution patterns with SSH command evidence"
  Documentation_to_Main: "Knowledge synthesis with next cycle preparation"
```

---

**Optimized Thread Prompts Status**: ✅ **ENHANCED** - GPU acceleration success integration complete
**SSH Context Integration**: ✅ All threads equipped with standardized SSH command patterns  
**Absolute Path Standards**: ✅ Unified documentation references optimized for all threads
**Performance Baselines**: ✅ 58% GPU utilization and 3.2s response times integrated across framework
**Knowledge Integration**: ✅ GPU acceleration expertise embedded in all thread capabilities