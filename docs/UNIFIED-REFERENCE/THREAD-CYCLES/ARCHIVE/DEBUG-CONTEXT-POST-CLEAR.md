# 🔧 DEBUG THREAD - Post-Clear Context Instructions

## **PRIMARY GOAL: Cycle 13 - Frontend Logging & Communication Issues Advanced Troubleshooting**
**Mission**: Resolve complex frontend-backend communication issues preventing manual website operation, implement advanced logging diagnostics, and ensure complete system stability while maintaining 77% GPU processing.

---

## 🎯 **Cycle 13 Debug Context (CRITICAL PRESERVATION)**

### **🚀 GPU ACCELERATION OPERATIONAL (ABSOLUTE PROTECTION REQUIRED)**
- **Current Achievement**: 77% GPU processing with deepseek-33b-main container
- **Performance Baseline**: <5s chat responses demonstrated
- **Preservation Mandate**: ZERO degradation allowed during brand implementation
- **Container Stability**: deepseek-33b-main must remain operational throughout changes

### **🔍 Frontend Logging & Communication Debug Scope**
- **Advanced CORS/CSP Resolution**: Complex cross-origin policy troubleshooting
- **Manual vs Test Environment Analysis**: Debug discrepancies between automated and manual operation
- **Performance Optimization**: Maintain system speed during logging implementation
- **Cross-Browser Compatibility**: Ensure logging and error tracking works across all platforms

### **⚠️ PRESERVATION COMMANDS**
```bash
# VERIFY GPU acceleration maintained (CHECK FIRST, ALWAYS)
ssh root@192.168.0.99 "nvidia-smi"
# CRITICAL: Must show 15.5GB/16.3GB memory, 20-48% utilization during processing

# CONFIRM working container operational
ssh root@192.168.0.99 "docker ps | grep deepseek-33b-main"
# CRITICAL: Container must be Up, never recreate this container

# VALIDATE GPU-accelerated inference working
ssh root@192.168.0.99 "curl -X POST localhost:11434/api/generate -d '{\"model\":\"deepseek-coder:33b\",\"prompt\":\"test\",\"stream\":false}'"
# CRITICAL: Response must be <5s with GPU processing
```

---

## 🚨 **Debugging Focus Areas**

### **1. Multi-Container GPU Coordination Issues**

```bash
# Assess current GPU memory allocation
ssh root@192.168.0.99 "nvidia-smi"
# Available GPU memory for additional containers

# Test additional container GPU access (CAREFULLY)
ssh root@192.168.0.99 "docker run --rm --gpus all ollama/ollama nvidia-smi"
# Validate GPU access without breaking existing setup

# Plan GPU memory allocation strategy
# deepseek-33b: ~15GB (preserve current allocation)
# coordinator: ~2GB for lightweight coordination
# vision: ~4GB for image processing
# documentation: ~3GB for text processing
```

### **2. Frontend Integration Advanced Troubleshooting**
**Scenario**: Writer Thread CORS/CSP implementation encounters complex issues

```bash
# Browser compatibility debugging
ssh root@192.168.0.99 "curl -v -H 'Origin: http://192.168.0.99:5173' \
-H 'Access-Control-Request-Method: POST' \
-X OPTIONS http://localhost:3333/api/upload/file"
# Detailed CORS header analysis

# Network layer debugging
ssh root@192.168.0.99 "netstat -tlnp | grep :3333"
ssh root@192.168.0.99 "netstat -tlnp | grep :5173"
# Service binding and port accessibility

# SSL/TLS and security policy advanced configuration
# Address "Not Secure" warnings and CSP violations
```

### **3. Performance Optimization Under Load**
**Scenario**: System performs well single-user but degrades with concurrent usage or large files

```bash
# Load testing with multiple concurrent requests
ssh root@192.168.0.99 "ab -n 10 -c 3 -p /tmp/test-prompt.json -T application/json http://localhost:11434/api/generate"
# Concurrent performance analysis

# Memory pressure testing
ssh root@192.168.0.99 "watch -n 1 'free -h && nvidia-smi'"
# System resource monitoring under load

# Large file processing testing
ssh root@192.168.0.99 "curl -X POST -F 'file=@large-project.zip' http://localhost:3333/api/upload/project"
# Large upload handling and processing performance
```

---

## 🔧 **Advanced Resolution Capabilities**

### **GPU Memory Management Optimization**
```bash
# GPU memory fragmentation analysis
ssh root@192.168.0.99 "nvidia-smi -q -d MEMORY"
# Detailed GPU memory utilization

# Ollama process GPU usage optimization
ssh root@192.168.0.99 "docker exec deepseek-33b-main ollama ps"
# Model loading and GPU allocation status

# Multi-process GPU sharing configuration
# Coordinate GPU memory across multiple Ollama containers
```

### **API Gateway Performance Tuning**
```bash
# Node.js API gateway performance analysis
ssh root@192.168.0.99 "docker exec gbgreg-api-gateway top"
# CPU and memory usage during file processing

# Database connection pooling optimization
ssh root@192.168.0.99 "docker exec gbgreg-postgres psql -U gbgreg -c 'SHOW max_connections;'"
# Connection limits and pool management

# File processing pipeline optimization
# Async processing, queue management, response streaming
```

### **System Integration Debugging**
```bash
# Container network communication analysis
ssh root@192.168.0.99 "docker network ls"
ssh root@192.168.0.99 "docker network inspect bridge"
# Container-to-container communication debugging

# ZFS storage performance under AI workload
ssh root@192.168.0.99 "zpool iostat -v 1"
# Storage I/O performance during large file processing

# Service discovery and health checking
ssh root@192.168.0.99 "curl http://localhost:3333/health"
ssh root@192.168.0.99 "curl http://localhost:5173/"
# Service availability and integration validation
```

---

## 🎯 **Primary Goal Troubleshooting**

### **End-to-End Workflow Debugging**
**Target Flow**: Upload project.zip → Extract → GPU-accelerated analysis → Store in database → Chat interface with project context

```bash
# Step-by-step workflow validation
# 1. File upload debugging
ssh root@192.168.0.99 "curl -v -X POST -F 'file=@test.zip' http://localhost:3333/api/upload/project"

# 2. ZIP extraction validation
ssh root@192.168.0.99 "ls -la /staging-pool/gbgreg-projects/"

# 3. GPU processing verification
ssh root@192.168.0.99 "curl -X POST localhost:11434/api/generate -w 'Total time: %{time_total}s'"

# 4. Database integration testing
ssh root@192.168.0.99 "docker exec gbgreg-postgres psql -U gbgreg -d gbgreg -c 'SELECT * FROM gbgreg_projects ORDER BY created_at DESC LIMIT 1;'"

# 5. Chat context retrieval
ssh root@192.168.0.99 "curl -X POST -d '{\"prompt\":\"What is this project?\"}' http://localhost:3333/api/chat/generate"
```

### **Performance Issue Resolution**
```bash
# Response time analysis and optimization
ssh root@192.168.0.99 "time curl -X POST localhost:11434/api/generate -d '{\"model\":\"deepseek-coder:33b\",\"prompt\":\"Analyze this code\"}'"
# Target: <5s response time maintenance

# Concurrent user performance debugging
# Multiple browser sessions, load testing, resource contention analysis

# Memory leak detection and prevention
ssh root@192.168.0.99 "docker stats gbgreg-api-gateway gbgreg-postgres deepseek-33b-main"
# Resource usage monitoring over extended sessions
```

---

## 🚨 **Emergency Procedures**

### **GPU Acceleration Recovery (If Broken)**
```bash
# EMERGENCY: If GPU processing stops working
ssh root@192.168.0.99 "docker restart deepseek-33b-main"
# Try container restart first (preserves model)

# If restart doesn't work, check GPU driver
ssh root@192.168.0.99 "nvidia-smi"
ssh root@192.168.0.99 "docker exec deepseek-33b-main nvidia-smi"

# Last resort: Preserve model data before any container recreation
ssh root@192.168.0.99 "docker exec deepseek-33b-main ollama list"
# Document loaded models before any drastic changes
```

### **System Recovery Procedures**
```bash
# Service recovery sequence
ssh root@192.168.0.99 "docker start gbgreg-postgres"
ssh root@192.168.0.99 "sleep 10"  # Database initialization
ssh root@192.168.0.99 "cd /service-pool/gbgreg-api-gateway && npm start &"
ssh root@192.168.0.99 "cd /service-pool/gbgreg-frontend && npm run dev &"

# Verify recovery success
ssh root@192.168.0.99 "curl http://localhost:3333/health && curl http://localhost:5173/ && nvidia-smi"
```

---

## 📊 **Advanced Diagnostics**

### **Performance Profiling**
```bash
# GPU utilization profiling during workflow
ssh root@192.168.0.99 "nvidia-smi dmon -s pucvmet -d 1"
# Continuous GPU monitoring during testing

# API response time profiling
ssh root@192.168.0.99 "curl -w '@curl-format.txt' -X POST http://localhost:3333/api/chat/generate"
# Detailed timing breakdown

# Database query performance analysis
ssh root@192.168.0.99 "docker exec gbgreg-postgres psql -U gbgreg -c 'EXPLAIN ANALYZE SELECT * FROM gbgreg_projects;'"
```

### **System Integration Analysis**
```bash
# Container resource allocation optimization
ssh root@192.168.0.99 "docker stats --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}'"

# Network latency between services
ssh root@192.168.0.99 "ping -c 3 localhost"
ssh root@192.168.0.99 "curl -w 'Connect: %{time_connect}s\n' http://localhost:3333/health"
```

---

## 📋 **Success Criteria & Validation**

### **✅ System Performance Optimization**
- [ ] GPU acceleration maintained at 77% processing efficiency
- [ ] Chat responses consistently <5s under all load conditions  
- [ ] Concurrent user support (3+ simultaneous) without degradation
- [ ] Large file processing (10-50MB projects) without system issues

### **🔗 Integration Troubleshooting Complete**
- [ ] Frontend → API gateway communication flawless
- [ ] File upload → processing → chat workflow seamless
- [ ] Database integration optimized for project storage and retrieval
- [ ] All browser compatibility and security issues resolved

### **⚡ Advanced Configuration Deployed**
- [ ] Multi-container GPU access configured (if needed)
- [ ] Performance monitoring and alerting operational
- [ ] Error handling and recovery procedures validated
- [ ] System scalability and production readiness confirmed

---

## 📚 **Documentation Requirements**

### **Troubleshooting Knowledge Base**
- `/docs/UNIFIED-REFERENCE/OPERATIONS/gpu-acceleration-troubleshooting.md` - GPU issue resolution
- `/docs/UNIFIED-REFERENCE/OPERATIONS/performance-optimization-guide.md` - System tuning procedures  
- `/docs/UNIFIED-REFERENCE/OPERATIONS/integration-debugging.md` - Complex system issue resolution

### **Configuration Preservation**
- **GPU Configuration**: Document working multi-container setup
- **Performance Tuning**: Archive optimization settings and parameters
- **Error Recovery**: Maintain emergency procedure documentation

---

## 🎯 **Escalation and Coordination**

### **When to Escalate to Documentation Thread**
- **Success**: All issues resolved, system operational end-to-end
- **Partial Success**: Major issues resolved, minor optimizations documented
- **Knowledge Capture**: Advanced troubleshooting procedures need archival

### **System State Handoff**
- **GPU Status**: Confirmed operational with performance metrics
- **Integration Status**: Complete workflow functionality validation
- **Performance Baselines**: Documented system capabilities and limitations

---

## 🚀 **Ultimate Success Target**

**Complete Resolution**: User can upload any reasonable project.zip → System processes with full GPU acceleration → User enjoys responsive <5s chat interaction about project content → System handles multiple concurrent users → All technical issues resolved for production deployment.

**Technical Excellence**: 77% GPU processing breakthrough leveraged for enterprise-grade user experience with professional reliability and performance.

---

**Context**: GPU acceleration preserved and optimized - resolve remaining technical blockers for complete workflow
**Authority**: Advanced system troubleshooting with full modification access
**Goal**: Eliminate all barriers to project.zip upload → chat testing workflow perfection