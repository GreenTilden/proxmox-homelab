# Cycle 13 Debug Thread Knowledge Package
**Date**: 2025-09-01  
**Purpose**: Complete diagnostic context and reference materials for Debug Thread  
**Authority**: Main Thread coordination for seamless Debug Thread initiation  
**Location**: `/home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/OPERATIONS/`

---

## 📋 **DEBUG THREAD CONTEXT PACKAGE**

### **Writer Thread Success Foundation - CRITICAL PRESERVATION**
🚀 **UNPRECEDENTED SUCCESS**: GPU acceleration and model routing completely restored with transformational performance

**MUST PRESERVE - Working Configuration**:
- **GPU Utilization**: 77% during AI processing (RTX 5070 Ti fully operational)
- **Model Loading**: deepseek-coder:33b (21GB) persistent in GPU memory (13.6GB allocated)
- **Response Performance**: 6-12 second response times (90% improvement from 61+ seconds)
- **API Routing**: Port 3333 → Port 11434 routing operational and stable
- **System Stability**: Sustained professional performance without memory leaks

**Critical Commands - Working State Validation**:
```bash
# GPU utilization verification (MUST show 77% during processing)
ssh root@192.168.0.99 "nvidia-smi --query-gpu=utilization.gpu,memory.used,temperature.gpu --format=csv"

# Primary model performance test (MUST complete in 6-12 seconds)
ssh root@192.168.0.99 "time curl -X POST -H 'Content-Type: application/json' -d '{\"model\":\"deepseek-coder:33b\",\"prompt\":\"test performance\"}' http://192.168.0.99:3333/api/generate"

# System health baseline (all working components)
ssh root@192.168.0.99 "docker ps | grep gbgreg && curl -s http://192.168.0.99:3333/health"
```

---

## 🚨 **PRIORITY 1 DIAGNOSTICS: Backend Model Integration**

### **Current Model Status - Evidence for Debug Thread**
**API Health Check Results**:
```json
{
  "status": "healthy", 
  "database": "connected",
  "models": {
    "coordinator": {"status": "healthy", "loadedModels": 1},
    "technical": {"status": "healthy", "loadedModels": 1},
    "documentation": {"status": "error", "error": "fetch failed"}, 
    "vision": {"status": "error", "error": "fetch failed"}
  }
}
```

### **Diagnostic Commands for Model Container Analysis**
```bash
# Container status verification
ssh root@192.168.0.99 "docker ps -a | grep gbgreg"
ssh root@192.168.0.99 "docker stats gbgreg-documentation gbgreg-vision --no-stream"

# Container log analysis for failure patterns
ssh root@192.168.0.99 "docker logs --tail 50 gbgreg-documentation"
ssh root@192.168.0.99 "docker logs --tail 50 gbgreg-vision" 

# Network connectivity testing between containers
ssh root@192.168.0.99 "docker exec gbgreg-coordinator ping -c 3 gbgreg-documentation"
ssh root@192.168.0.99 "docker exec gbgreg-coordinator curl -v http://gbgreg-documentation:11434/api/tags"

# GPU access verification in failing containers
ssh root@192.168.0.99 "docker exec gbgreg-documentation nvidia-smi"
ssh root@192.168.0.99 "docker exec gbgreg-vision nvidia-smi"

# Model availability checking
ssh root@192.168.0.99 "docker exec gbgreg-documentation ollama list"  
ssh root@192.168.0.99 "docker exec gbgreg-vision ollama list"
```

### **Known Working Container Configuration - Reference**
**Successful Containers (coordinator, technical)**:
- **Image**: Working GPU-enabled configuration
- **Model Loading**: Successful with GPU memory allocation
- **API Response**: Healthy status with loaded models
- **Resource Access**: Proper GPU device access configured

**Use successful containers as reference for fixing failing ones**

---

## 🔧 **PRIORITY 2 DIAGNOSTICS: Frontend Development Environment**

### **Current Development Environment Status**
**Multiple Dev Server Issue Evidence**:
```bash  
# Expected diagnostic results showing port confusion
ssh root@192.168.0.99 "netstat -tlnp | grep -E ':(5173|5174|5175)'"
ssh root@192.168.0.99 "ps aux | grep 'vue\|vite\|npm'"

# Development server process identification
ssh root@192.168.0.99 "cd /service-pool/gbgreg-frontend && pwd && ls -la"
```

### **Tailwind Configuration Status**
**Current Configuration File Location**: `/service-pool/gbgreg-frontend/tailwind.config.js`
**Issue**: Missing Biosero color palette integration despite CSS variables being defined

**Diagnostic Commands**:
```bash
# Check current Tailwind configuration
ssh root@192.168.0.99 "cat /service-pool/gbgreg-frontend/tailwind.config.js"

# Verify Biosero CSS variables defined
ssh root@192.168.0.99 "cat /service-pool/gbgreg-frontend/src/style.css | grep -A 20 'biosero'"

# Check component existence and structure
ssh root@192.168.0.99 "ls -la /service-pool/gbgreg-frontend/src/components/biosero/"
```

### **Biosero Component Status - Ready for Integration**
**Working Components Created by Writer Thread**:
- `BioseroButton.vue` - 3 variants (primary, secondary, ghost)
- `BioseroCard.vue` - 2 variants (default, elevated)  
- `BioseroLogo.vue` - Simple text logo with brand colors

**CSS Variables Defined**:
```css
/* Confirmed available in /service-pool/gbgreg-frontend/src/style.css */
:root {
  --biosero-primary: #00d4ff;
  --biosero-secondary: #1a1a2e;  
  --biosero-accent: #8b5cf6;
  /* Additional Biosero color palette variables */
}
```

---

## 🎯 **PRIORITY 3 DIAGNOSTICS: User Workflow Testing**

### **User Workflow Test Procedures**
**Upload Tab Testing Protocol**:
```bash
# Access frontend application  
# Navigate to http://192.168.0.99:5173 (or determined authoritative port)
# Test file upload functionality through Upload tab
# Verify backend processing and storage

# Backend file processing verification
ssh root@192.168.0.99 "ls -la /service-pool/gbgreg/uploads/" 
ssh root@192.168.0.99 "docker logs gbgreg-coordinator | grep upload"
```

**Database Tab Testing Protocol**:
```bash
# Test script storage and retrieval through Database tab
# Verify search functionality operational
# Check data persistence in PostgreSQL

# Database connectivity verification  
ssh root@192.168.0.99 "docker exec gbgreg-coordinator psql -U gbgreg_user -d gbgreg_db -c '\dt'"
```

**Chat Tab Testing Protocol**:
```bash
# Test AI interaction through Chat tab using working deepseek-coder:33b
# Verify response times maintained at 6-12 seconds
# Confirm GPU utilization stays at 77% during processing

# AI processing performance validation during chat testing
ssh root@192.168.0.99 "watch -n 2 'nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader,nounits'"
```

---

## 📊 **PRIORITY 4 DIAGNOSTICS: System Monitoring Integration**

### **Existing Grafana Infrastructure - Integration Target**
**Current Monitoring Stack**:
- **Grafana**: http://192.168.0.99:3000 (admin/test123)
- **Prometheus**: http://192.168.0.99:9090
- **Existing Exporters**: Node Exporter (9100), ZFS Exporter (9101), Deluge Exporter (9102)

**Metrics to Add to Grafana**:
```bash
# GPU utilization and memory usage
ssh root@192.168.0.99 "nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,noheader,nounits"

# Model response time tracking
# API endpoint availability monitoring
# Container health status tracking
# Model loading status monitoring
```

**Grafana Dashboard Integration Commands**:
```bash
# Access existing Grafana configuration
ssh root@192.168.0.99 "ls -la /service-pool/grafana/data/dashboards/"
ssh root@192.168.0.99 "docker exec grafana grafana-cli plugins list"
```

---

## 🔍 **HISTORICAL CONTEXT - Debug Thread Reference**

### **Previous Debug Thread Success Pattern - Cycle 11**
**Reference Documentation**: `/home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/THREAD-CYCLES/DEBUG-THREAD-HANDOFF-CYCLE-11.md`

**Cycle 11 Debug Thread Achievements**:
- **GPU Acceleration Resolution**: Successfully resolved CUDA container deployment
- **Performance Optimization**: Achieved target response times through container configuration  
- **System Integration**: Resolved frontend-backend communication issues
- **Professional Polish**: Established monitoring and health validation

**Successful Debug Patterns to Replicate**:
- **Sequential Priority Execution**: Address highest priority issues first
- **Preservation Focus**: Never compromise working components during debug
- **Comprehensive Validation**: Test each resolution thoroughly before proceeding
- **Documentation Integration**: Update UNIFIED-REFERENCE with all resolution procedures

---

## 🛡️ **RISK MITIGATION - CRITICAL SUCCESS PRESERVATION**

### **Absolute Protection Requirements**
**NEVER MODIFY OR RISK**:
- **API Gateway Configuration**: Port 3333 → 11434 routing
- **Model Loading Configuration**: deepseek-coder:33b loading and persistence  
- **GPU Allocation**: 13.6GB memory allocation for primary model
- **Container Configuration**: Working coordinator and technical containers

### **Continuous Monitoring During Debug Work**
**Performance Validation Commands** (run before/during/after each change):
```bash
# GPU utilization baseline (MUST maintain 77%)
ssh root@192.168.0.99 "nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader,nounits"

# Primary model response time (MUST maintain 6-12 seconds)
ssh root@192.168.0.99 "time curl -X POST -H 'Content-Type: application/json' -d '{\"model\":\"deepseek-coder:33b\",\"prompt\":\"test\"}' http://192.168.0.99:3333/api/generate"

# System stability check
ssh root@192.168.0.99 "docker ps | grep gbgreg | wc -l" # Should show 4+ containers
```

### **Immediate Rollback Procedures**
**If ANY regression detected**:
```bash
# Container restart for stability
ssh root@192.168.0.99 "docker restart gbgreg-coordinator gbgreg-technical"

# Model reload if GPU acceleration impacted  
ssh root@192.168.0.99 "docker exec gbgreg-technical ollama pull deepseek-coder:33b"

# API Gateway restart if routing affected
ssh root@192.168.0.99 "docker restart gbgreg-coordinator"
```

---

## 📚 **REFERENCE DOCUMENTATION FOR DEBUG THREAD**

### **Essential UNIFIED-REFERENCE Files**
- **Thread Templates**: `/FRAMEWORK/thread-handoff-templates.md`
- **GPU Architecture**: `/ARCHITECTURE/gpu-acceleration-cycle-ready.md`  
- **Container Standards**: `/OPERATIONS/container-architecture-standards.md`
- **System Status**: `/CURRENT/gpu-acceleration-breakthrough-status.md`
- **Agent Resources**: `/OPERATIONS/agent-comprehensive-audit-2025-08-31.md`

### **Working Configuration Files - PRESERVE**
- **API Gateway**: `/service-pool/gbgreg/server.js` (contains working deepseek-coder:33b routing)
- **Docker Compose**: `/service-pool/gbgreg/docker-compose.yml` (working container configuration)  
- **Frontend Components**: `/service-pool/gbgreg-frontend/src/components/biosero/` (ready for integration)

### **Performance Baselines - Validation Targets**
- **GPU Utilization**: 77% during AI processing
- **Response Time**: 6-12 seconds for coding requests  
- **GPU Memory**: 13.6GB allocated for deepseek-coder:33b
- **System Stability**: All containers operational, no crashes or memory leaks

---

## 🎯 **DEBUG THREAD SUCCESS DEFINITION**

### **Complete Success Criteria**
1. **All Backend Models Operational**: 4/4 models showing "healthy" status with no "fetch failed" errors
2. **Frontend Environment Professional**: Single dev server with complete Biosero styling integration
3. **User Workflows Validated**: Upload/Database/Chat workflows tested and operational  
5. **GPU Performance Preserved**: 77% utilization and 6-12s response times maintained throughout

### **Professional System Standards Achieved**
- **Reliability**: Zero component failures or error states
- **Performance**: All operations <10 seconds with sustained GPU acceleration  
- **User Experience**: Seamless workflows with professional interface polish
- **Monitoring**: Comprehensive health tracking with proactive alerting

**Expected Outcome**: Transform the highly successful Writer Thread foundation into a completely professional laboratory automation system ready for production use.

---

**This knowledge package provides complete diagnostic context, reference materials, and preservation protocols for successful Debug Thread optimization while maintaining all critical Writer Thread achievements.**