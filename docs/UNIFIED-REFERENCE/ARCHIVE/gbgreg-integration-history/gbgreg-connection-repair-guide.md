# GBGreg Connection Repair Guide - Frontend-Backend Communication

**Status**: ✅ **READY FOR TROUBLESHOOTING**
**Updated**: 2025-08-31 - Cycle 13 Connection Issue Resolution
**Authority**: Critical infrastructure repair procedures for Writer Thread
**Location**: `/home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/OPERATIONS/`
**Priority**: 🚨 **CRITICAL** - Must resolve before brand implementation

---

## 🚨 **Issue Summary**

### **Primary Problem**
- **Frontend**: Vue.js accessible on port 5173 ✅
- **Backend**: API Gateway partially operational
  - `/health` endpoint responds ✅
  - `/api/generate` endpoint connection refused ❌
- **GPU**: RTX 5070 Ti idle (0% utilization vs expected 77%)
- **Impact**: Complete frontend-backend communication failure

### **Root Cause Hypothesis**
- API Gateway service binding issues on port 3333
- AI model services not properly initialized
- Container networking or port forwarding problems
- GPU acceleration not activated for AI processing

---

## 🔧 **Diagnostic Procedures**

### **Phase 1: Container Status Investigation**
```bash
# Check all GBGreg containers
ssh root@192.168.0.99 "docker ps -a | grep gbgreg"
Expected Output: All gbgreg containers should show "Up" status

# Check container resource usage
ssh root@192.168.0.99 "docker stats --no-stream | grep gbgreg"
Expected: Coordinator and technical containers should show memory usage

# Inspect container configurations
ssh root@192.168.0.99 "docker inspect gbgreg-coordinator | grep -A5 'NetworkSettings'"
Expected: Port mappings should include 3333:3333
```

### **Phase 2: Service Log Analysis**
```bash
# Check coordinator logs (API Gateway)
ssh root@192.168.0.99 "docker logs gbgreg-coordinator --tail 50"
Look for: Port binding errors, API initialization failures, connection refused messages

# Check technical container logs (AI processing)
ssh root@192.168.0.99 "docker logs gbgreg-technical --tail 50"
Look for: Model loading errors, GPU initialization failures, CUDA errors

# Check database container logs
ssh root@192.168.0.99 "docker logs gbgreg-database --tail 50"
Look for: Connection errors, database initialization issues
```

### **Phase 3: Network Connectivity Testing**
```bash
# Check port binding status
ssh root@192.168.0.99 "netstat -tlnp | grep :3333"
Expected: Process should be listening on 0.0.0.0:3333

# Alternative port check
ssh root@192.168.0.99 "ss -tlnp | grep :3333"
Expected: Active listener on port 3333

# Test internal container connectivity
ssh root@192.168.0.99 "docker exec gbgreg-coordinator curl -s http://localhost:3333/health"
Expected: Should return health status JSON

# Test external connectivity
ssh root@192.168.0.99 "curl -s http://192.168.0.99:3333/health"
Expected: Should return same health status
```

### **Phase 4: AI Model Service Testing**
```bash
# Check Ollama service in technical container
ssh root@192.168.0.99 "docker exec gbgreg-technical curl -s http://localhost:11434/api/tags"
Expected: Should list available models including deepseek-coder:6.7b

# Test direct model interaction
ssh root@192.168.0.99 "docker exec gbgreg-technical curl -X POST http://localhost:11434/api/generate -d '{\"model\":\"deepseek-coder:6.7b\",\"prompt\":\"test\"}'"
Expected: Should generate response and show GPU utilization

# Verify GPU access in container
ssh root@192.168.0.99 "docker exec gbgreg-technical nvidia-smi"
Expected: Should show RTX 5070 Ti with processes when model running
```

---

## 🛠️ **Repair Procedures**

### **Scenario 1: Container Service Issues**

#### **Problem**: Containers not properly started or crashed
```bash
# Check docker-compose status
ssh root@192.168.0.99 "cd /service-pool/gbgreg && docker-compose ps"

# Restart all services
ssh root@192.168.0.99 "cd /service-pool/gbgreg && docker-compose down"
ssh root@192.168.0.99 "cd /service-pool/gbgreg && docker-compose up -d"

# Wait for initialization and check logs
ssh root@192.168.0.99 "sleep 30 && docker logs gbgreg-coordinator --tail 20"
```

#### **Verification Steps**:
- [ ] All containers show "Up" status
- [ ] Coordinator container listens on port 3333
- [ ] Health endpoint responds correctly
- [ ] No error messages in container logs

### **Scenario 2: Port Binding Problems**

#### **Problem**: Port 3333 not properly exposed or bound
```bash
# Check docker-compose.yml configuration
ssh root@192.168.0.99 "cd /service-pool/gbgreg && cat docker-compose.yml | grep -A10 coordinator"
Expected: Should show ports: "3333:3333"

# Restart with explicit port binding
ssh root@192.168.0.99 "docker stop gbgreg-coordinator"
ssh root@192.168.0.99 "docker run -d --name gbgreg-coordinator-temp -p 3333:3333 --gpus all gbgreg-coordinator:latest"

# Test connectivity
ssh root@192.168.0.99 "sleep 10 && curl -s http://192.168.0.99:3333/health"
```

#### **Verification Steps**:
- [ ] Port 3333 shows in netstat output
- [ ] External curl to port 3333 succeeds
- [ ] Frontend can communicate with backend
- [ ] API endpoints respond correctly

### **Scenario 3: AI Model Service Failure**

#### **Problem**: deepseek-coder:6.7b model not loaded or GPU not accessible
```bash
# Check if model exists
ssh root@192.168.0.99 "docker exec gbgreg-technical ls -la /root/.ollama/models/"

# Pull model if missing
ssh root@192.168.0.99 "docker exec gbgreg-technical ollama pull deepseek-coder:6.7b"

# Test model loading with GPU
ssh root@192.168.0.99 "docker exec gbgreg-technical ollama run deepseek-coder:6.7b 'test prompt'"

# Monitor GPU during model execution
ssh root@192.168.0.99 "nvidia-smi dmon -s pucvmet -d 1 -c 5"
```

#### **Verification Steps**:
- [ ] deepseek-coder:6.7b model available in container
- [ ] GPU utilization shows 77%+ during model execution
- [ ] Model responds within 5 seconds
- [ ] Response time meets performance targets

### **Scenario 4: Complete System Restart**

#### **Problem**: Multiple issues requiring full system restart
```bash
# Stop all GBGreg services
ssh root@192.168.0.99 "cd /service-pool/gbgreg && docker-compose down"

# Clean up any orphaned containers
ssh root@192.168.0.99 "docker container prune -f"

# Restart with fresh initialization
ssh root@192.168.0.99 "cd /service-pool/gbgreg && docker-compose up -d"

# Wait for full initialization (2-3 minutes for model loading)
ssh root@192.168.0.99 "sleep 180"

# Comprehensive system test
ssh root@192.168.0.99 "curl -s http://192.168.0.99:3333/health && echo 'Health OK'"
ssh root@192.168.0.99 "curl -X POST -H 'Content-Type: application/json' -d '{\"prompt\":\"system test\"}' http://192.168.0.99:3333/api/generate"
```

#### **Verification Steps**:
- [ ] All containers restart successfully
- [ ] Health endpoint accessible within 1 minute
- [ ] AI generation endpoint accessible within 3 minutes
- [ ] GPU utilization reaches 77% during processing
- [ ] Frontend-backend communication fully restored

---

## 📊 **Performance Validation**

### **GPU Acceleration Verification**
```bash
# Monitor GPU during AI processing
ssh root@192.168.0.99 "nvidia-smi dmon -s pucvmet -d 1 -c 10"
Target: GPU utilization >77%, Memory usage >10GB

# Response time testing
ssh root@192.168.0.99 "time curl -X POST -H 'Content-Type: application/json' -d '{\"prompt\":\"performance test\"}' http://192.168.0.99:3333/api/generate"
Target: Total time <5 seconds

# Memory usage validation
ssh root@192.168.0.99 "docker stats --no-stream gbgreg-technical"
Target: Memory usage >8GB during processing
```

### **Connection Stability Testing**
```bash
# Test multiple concurrent requests
for i in {1..5}; do
  ssh root@192.168.0.99 "curl -X POST -H 'Content-Type: application/json' -d '{\"prompt\":\"test $i\"}' http://192.168.0.99:3333/api/generate &"
done

# Wait for all requests to complete
wait

# Verify system stability
ssh root@192.168.0.99 "docker ps | grep gbgreg"
Expected: All containers still running
```

---

## 🔍 **Troubleshooting Common Issues**

### **Issue**: "Connection Refused" on Port 3333
**Likely Causes**:
- Coordinator container not running
- Port mapping incorrect in docker-compose.yml
- Internal service binding to localhost only

**Solutions**:
1. Check container status: `docker ps | grep coordinator`
2. Verify port mapping: `docker port gbgreg-coordinator`
3. Restart coordinator: `docker restart gbgreg-coordinator`

### **Issue**: API Gateway Health OK but Generate Fails
**Likely Causes**:
- Technical container (AI processing) not responding
- Model not loaded in Ollama service
- GPU not accessible to container

**Solutions**:
1. Check technical container logs: `docker logs gbgreg-technical`
2. Test Ollama directly: `docker exec gbgreg-technical ollama list`
3. Verify GPU access: `docker exec gbgreg-technical nvidia-smi`

### **Issue**: GPU Utilization Remains 0%
**Likely Causes**:
- Container lacks GPU access (--gpus flag missing)
- NVIDIA container runtime not configured
- Model running on CPU instead of GPU

**Solutions**:
1. Check container GPU access: `docker exec gbgreg-technical nvidia-smi`
2. Verify container runtime: `docker info | grep nvidia`
3. Restart with GPU flag: `docker run --gpus all ...`

### **Issue**: Frontend Cannot Connect to Backend
**Likely Causes**:
- CORS configuration blocking requests
- Network routing issues
- Frontend using incorrect API endpoint URL

**Solutions**:
1. Test CORS: `curl -H "Origin: http://192.168.0.99:5173" http://192.168.0.99:3333/health`
2. Check frontend API configuration
3. Verify network connectivity between containers

---

## ✅ **Success Validation Checklist**

### **Infrastructure Health**
- [ ] All GBGreg containers showing "Up" status
- [ ] Port 3333 accessible from external network
- [ ] Health endpoint returns 200 OK status
- [ ] No error messages in container logs

### **AI Processing Capability**
- [ ] deepseek-coder:6.7b model loaded and accessible
- [ ] GPU utilization reaches 77%+ during AI processing
- [ ] Response times consistently <5 seconds
- [ ] AI generation produces coherent responses

### **Frontend-Backend Communication**
- [ ] Frontend can successfully call backend API
- [ ] CORS headers properly configured
- [ ] API responses properly formatted
- [ ] No JavaScript errors in browser console

### **Performance Baselines**
- [ ] GPU utilization: 77%+ during processing
- [ ] Response time: <5 seconds for typical prompts
- [ ] Memory usage: >8GB in technical container during processing
- [ ] System stability: No crashes or restarts required

---

## 📋 **Post-Repair Documentation**

After successful repair, document the following:

### **Root Cause Analysis**
- Exact cause of the connection failure
- Which containers were affected
- Specific error messages encountered
- Time to resolution

### **Resolution Steps**
- Commands executed to resolve the issue
- Configuration changes made
- Performance impact during repair process
- Validation steps completed

### **Prevention Measures**
- Monitoring alerts to implement
- Regular health check procedures
- Container restart automation
- Performance baseline monitoring

---

## 🔄 **Integration with Brand Implementation**

Once connection repair is complete, the Writer Thread should:

1. **Validate Infrastructure**: Confirm all systems operational before brand work
2. **Monitor Performance**: Maintain GPU utilization during brand changes
3. **Test Continuously**: Verify connection stability throughout implementation
4. **Document Changes**: Record any configuration modifications needed

---

**This guide provides comprehensive procedures for diagnosing and repairing GBGreg frontend-backend communication issues, ensuring stable infrastructure before proceeding with brand implementation.**