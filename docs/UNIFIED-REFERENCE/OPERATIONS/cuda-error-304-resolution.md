# CUDA Error 304 Resolution Methodology

**Purpose**: Systematic troubleshooting procedures for CUDA Error 304 (Invalid Context) based on real-world GPU acceleration cycle experience with RTX 5070 Ti and multiple AI services.

## Error Overview

### CUDA Error 304 Definition
**Error Type**: `CUDA Error 304 (Invalid Context)`
**Technical Meaning**: GPU context is invalid or has been destroyed, preventing CUDA operations
**Impact**: Complete GPU utilization failure, forcing CPU-only operation across all AI services

### Observed Service Impact
**Affected Services During Testing**:
- **Ollama**: Runtime errors during model inference operations
- **VLLM**: Container startup failures and model loading errors
- **LocalAI**: Backend initialization failures with GPU context
- **Custom CUDA Applications**: deviceQuery succeeds but inference fails

## Root Cause Analysis

### Primary Contributing Factors

#### 1. Driver Architecture Mismatch
**Issue**: NVIDIA 570.86.16 with Blackwell GB203 architecture  
**Evidence**: 
- GPU detection successful (lspci shows device)
- nvidia-smi functional (shows GPU specifications)
- deviceQuery confirms CUDA capability
- **But**: 0% GPU utilization across all inference operations

**Technical Analysis**:
```bash
# Hardware Detection - SUCCESSFUL
lspci | grep -i nvidia
# Output: NVIDIA Corporation GB203 [GeForce RTX 5070 Ti] (rev a1)

# Driver Verification - FUNCTIONAL
nvidia-smi
# Output: RTX 5070 Ti, Driver 570.86.16, CUDA 12.5

# Context Creation - FAILS
# AI inference operations fail with Invalid Context
```

#### 2. Container GPU Context Isolation
**Issue**: Docker container GPU context management problems
**Evidence**:
- Host GPU access functional
- Container GPU passthrough configured
- **But**: Context creation fails within container environment

**Container Testing Results**:
```bash
# Basic GPU Test - SUCCEEDS
docker run --rm --gpus all nvidia/cuda:12.0.0-base-ubuntu22.04 nvidia-smi

# Advanced Context Test - FAILS  
docker run --rm --gpus all nvidia/cuda:12.0.0-base-ubuntu22.04 deviceQuery
# Output: Invalid Context error during context-intensive operations
```

#### 3. Memory Management Conflicts
**Issue**: GPU memory allocation failures preventing context creation
**Evidence**:
- 16GB VRAM available but unused (0 MiB allocated)
- Storage crisis preventing model loading (28KB available space)
- **Result**: Context cannot be established for inference operations

### Secondary Contributing Factors

#### 4. Privileged Mode Requirements
**Finding**: Some services require privileged container mode for GPU context
**Evidence**: 
- VLLM requires `--privileged` flag for socket operations
- Standard GPU passthrough insufficient for full context access
- Security implications of privileged GPU container access

#### 5. CUDA Version Compatibility
**Current Configuration**:
- Driver CUDA Version: 12.5
- Container CUDA Version: 12.0.0 (base images)
- **Potential Mismatch**: Version drift between host and container CUDA

## Diagnostic Methodology

### Phase 1: Hardware and Driver Verification
**Objective**: Confirm GPU hardware detection and basic driver functionality

```bash
# Step 1: Hardware Detection
lspci | grep -i nvidia
lspci -v -s $(lspci | grep -i nvidia | cut -d' ' -f1)

# Step 2: Driver Status
nvidia-smi
cat /proc/driver/nvidia/version
dmesg | grep -i nvidia | tail -20

# Step 3: Basic CUDA Test
/usr/local/cuda/extras/demo_suite/deviceQuery
nvidia-smi --query-gpu=name,driver_version,memory.total --format=csv
```

**Success Criteria**: 
- GPU appears in lspci output
- nvidia-smi shows GPU specifications  
- deviceQuery reports "PASS"

### Phase 2: Container GPU Access Verification  
**Objective**: Validate GPU passthrough and context creation in containers

```bash
# Step 1: Basic Container GPU Test
docker run --rm --gpus all nvidia/cuda:12.0.0-base-ubuntu22.04 nvidia-smi

# Step 2: Context Creation Test
docker run --rm --gpus all nvidia/cuda:12.0.0-base-ubuntu22.04 \
  /usr/local/cuda/extras/demo_suite/deviceQuery

# Step 3: Privileged Mode Test  
docker run --rm --privileged --gpus all nvidia/cuda:12.0.0-base-ubuntu22.04 \
  /usr/local/cuda/extras/demo_suite/deviceQuery
```

**Success Criteria**:
- Container can access GPU via nvidia-smi
- deviceQuery completes without Invalid Context error
- Context creation succeeds in both standard and privileged modes

### Phase 3: Memory and Context Analysis
**Objective**: Identify memory management and context creation issues

```bash
# Step 1: GPU Memory Status
nvidia-smi --query-gpu=memory.used,memory.total,memory.free --format=csv
watch -n 1 'nvidia-smi --query-gpu=memory.used --format=csv,noheader,nounits'

# Step 2: Process GPU Usage
nvidia-smi pmon -d 5
nvidia-smi dmon -d 5  

# Step 3: Context Stress Test
python3 -c "
import torch
print('CUDA Available:', torch.cuda.is_available())
print('Device Count:', torch.cuda.device_count())  
print('Current Device:', torch.cuda.current_device())
try:
    x = torch.randn(1000, 1000).cuda()
    print('Context Creation: SUCCESS')
except Exception as e:
    print('Context Creation: FAILED -', e)
"
```

**Success Criteria**:
- GPU memory properly reported and allocatable
- Processes can create and maintain GPU contexts
- PyTorch CUDA operations succeed without context errors

### Phase 4: Service-Specific Context Testing
**Objective**: Test context creation in actual AI service environments

```bash
# Ollama Context Test
OLLAMA_GPU_LAYERS=1 ollama run llama3.2:1b "test prompt"
# Monitor: nvidia-smi during execution

# VLLM Context Test  
docker run --rm --gpus all --privileged \
  -v /staging-pool/models:/models \
  vllm/vllm-openai:latest \
  --model microsoft/DialoGPT-medium \
  --max-model-len 512

# LocalAI Context Test
curl -X POST http://localhost:8080/v1/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "test-model", "prompt": "test", "max_tokens": 10}'
```

**Success Criteria**:
- Services can initialize GPU contexts
- Inference operations utilize GPU (>0% utilization)
- No Invalid Context errors in service logs

## Resolution Strategies

### Strategy 1: Driver Upgrade Approach
**Objective**: Resolve architecture compatibility issues

**Implementation Plan**:
1. **Monitor NVIDIA Releases**: Watch for 575+ series driver availability
2. **Manual Installation**: Use .run installer for maximum compatibility
3. **Configuration Optimization**: Enable all GPU features for Blackwell architecture

**Expected Timeline**: Dependent on NVIDIA release schedule
**Success Probability**: High - addresses root compatibility issue

### Strategy 2: Container Context Isolation Fix
**Objective**: Resolve container GPU context management

**Implementation Steps**:
```bash
# Method 1: Enhanced GPU Passthrough
docker run -d --name ai-service \
  --gpus all \
  --privileged \
  --device /dev/nvidia0:/dev/nvidia0 \
  --device /dev/nvidiactl:/dev/nvidiactl \
  --device /dev/nvidia-uvm:/dev/nvidia-uvm \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  ai-service:latest

# Method 2: NVIDIA Container Runtime Configuration
# Edit /etc/docker/daemon.json
{
  "default-runtime": "nvidia",
  "runtimes": {
    "nvidia": {
      "path": "nvidia-container-runtime",
      "runtimeArgs": []
    }
  }
}
```

**Success Probability**: Medium - addresses container isolation issues

### Strategy 3: Memory Management Optimization
**Objective**: Resolve GPU memory allocation and context creation

**Implementation Steps**:
```python
# GPU Memory Pre-allocation
import torch
torch.cuda.empty_cache()
torch.cuda.set_per_process_memory_fraction(0.8)

# Context Management
torch.cuda.init()  # Force CUDA initialization
torch.backends.cuda.matmul.allow_tf32 = True
torch.backends.cudnn.allow_tf32 = True
```

**Service Configuration**:
```bash
# Ollama Memory Management
export OLLAMA_MAX_VRAM=14336  # 14GB allocation
export OLLAMA_GPU_MEMORY_FRACTION=0.8

# VLLM Memory Configuration  
--gpu-memory-utilization 0.75 \
--max-model-len 4096
```

**Success Probability**: Medium - improves memory management efficiency

### Strategy 4: Alternative Service Architecture
**Objective**: Bypass context issues through service redesign

**Implementation Options**:
1. **Host-Native Services**: Run AI services directly on host (not containerized)
2. **LXC Alternative**: Use Proxmox LXC containers instead of Docker
3. **Service Proxy**: GPU operations on host, API access through containers

**Success Probability**: High - eliminates container context isolation

## Monitoring and Validation

### Real-Time Context Monitoring
```bash
# GPU Context Monitoring Script
#!/bin/bash
while true; do
  echo "=== $(date) ==="
  nvidia-smi --query-gpu=utilization.gpu,memory.used --format=csv,noheader
  nvidia-smi pmon -c 1
  echo "Context Status: $(nvidia-smi | grep -o '[0-9]*MiB' | head -1)"
  sleep 5
done
```

### Service-Specific Context Validation
```bash
# Ollama Context Validation
ollama list | grep -E "(NAME|llama)"
OLLAMA_GPU_LAYERS=1 ollama run llama3.2:1b "GPU test" &
PID=$!
nvidia-smi pmon -d 1 -c 10
wait $PID

# VLLM Container Context Check
docker logs vllm-service | grep -i "cuda\|context\|error"
curl -s http://localhost:8000/health | jq .status
```

### Context Error Pattern Recognition
**Error Signatures to Monitor**:
- `CUDA Error 304 (Invalid Context)`: Primary error pattern
- `RuntimeError: CUDA out of memory`: Secondary memory issue
- `Failed to initialize CUDA context`: Initialization failure
- `GPU not available for inference`: Service fallback indicator

## Prevention Strategies

### System Configuration Standards
**GPU Service Deployment Checklist**:
1. ✅ Verify driver compatibility with GPU architecture
2. ✅ Confirm CUDA version matching between host and container
3. ✅ Test basic GPU context creation before service deployment
4. ✅ Implement GPU memory monitoring and alerting
5. ✅ Document context error patterns for rapid diagnosis

### Container Best Practices
**GPU Container Configuration Standards**:
```yaml
# docker-compose.yml template
services:
  ai-service:
    image: ai-service:latest
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    environment:
      - CUDA_VISIBLE_DEVICES=0
      - NVIDIA_VISIBLE_DEVICES=all
    privileged: true  # If required by service
    volumes:
      - /staging-pool/models:/models
      - /service-pool/config:/config
```

### Monitoring Integration
**Grafana Dashboard Metrics**:
- GPU Context Creation Success Rate
- Context Error Frequency (errors per hour)
- Service GPU Utilization Percentage
- Memory Allocation Success/Failure Ratio

## Future Enhancement Strategy

### Driver Upgrade Automation
**Automated Driver Testing Pipeline**:
1. Monitor NVIDIA driver releases for 575+ series
2. Deploy to test environment for compatibility validation
3. Automated rollback if context errors persist
4. Production deployment with monitoring validation

### Service Architecture Evolution
**Context-Resilient Service Design**:
- Automatic context recreation on failure
- Service-level GPU health monitoring
- Graceful degradation to CPU-only operation
- Real-time context error alerting and recovery

### Documentation Integration
**Knowledge Transfer Requirements**:
- Update troubleshooting guide with context error procedures
- Enhance container standards with GPU context best practices  
- Document service-specific context management patterns
- Archive resolution strategies for future reference

## Cycle Integration Summary

**Technical Knowledge Captured**: ✅
- CUDA Error 304 systematic analysis and diagnosis procedures
- Container GPU context isolation troubleshooting methodology
- Service-specific context error patterns and resolution strategies
- Real-world testing results from RTX 5070 Ti GPU acceleration cycle

**Implementation Status**: ⚠️ Driver Dependent
- Diagnostic procedures validated and documented
- Resolution strategies identified and prioritized
- Primary resolution dependent on NVIDIA 575+ driver release
- Secondary optimizations available for immediate implementation

This comprehensive resolution methodology provides structured troubleshooting procedures for CUDA Error 304 issues, enabling efficient diagnosis and resolution in future GPU acceleration implementations.