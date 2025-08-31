# GBGreg Enterprise Operations and Management Procedures

**Status**: ✅ **OPERATIONAL** - Complete procedures validated 2025-08-29
**Updated**: 2025-08-29 (Documentation Thread synthesis)
**Authority**: Primary operational reference for GBGreg enterprise deployment
**Thread**: 📚 Documentation Thread - Procedures synthesis from Reader→Writer→Debug cycle

## Overview

This document provides comprehensive operational procedures for managing the GBGreg Enterprise AI Laboratory Integration. All procedures are designed for SSH-based remote management from the development laptop (dinux) to the Proxmox server (192.168.0.99).

**Operational Philosophy**: 
- **Remote-First**: All operations performed via SSH from development environment
- **Monitoring-Driven**: Prometheus metrics guide all operational decisions
- **Container-Native**: Docker-based service management with ZFS storage integration
- **Documentation-Centric**: All procedures generate documentation artifacts

## Service Management

### Primary Service Operations

#### Complete Service Status Check
```bash
# Comprehensive GBGreg service status from development laptop
ssh root@192.168.0.99 "docker ps --format 'table {{.Names}}\t{{.Ports}}\t{{.Status}}' | grep gbgreg"

# Expected output (all services operational):
# gbgreg-postgres        0.0.0.0:5433->5432/tcp    Up X hours
# gbgreg-vision          0.0.0.0:11439->11434/tcp  Up X hours  
# gbgreg-documentation   0.0.0.0:11438->11434/tcp  Up X hours
# gbgreg-technical       0.0.0.0:11437->11434/tcp  Up X hours
# gbgreg-coordinator     0.0.0.0:11436->11434/tcp  Up X hours
```

#### Service Startup Sequence
```bash
# Start services in dependency order (PostgreSQL first)
ssh root@192.168.0.99 "docker start gbgreg-postgres"
ssh root@192.168.0.99 "sleep 10"  # Allow database initialization

# Start AI model containers (parallel startup safe)
ssh root@192.168.0.99 "docker start gbgreg-coordinator gbgreg-technical gbgreg-documentation gbgreg-vision"

# Verify AI containers are responding
ssh root@192.168.0.99 "curl -s http://localhost:11436/api/tags | head -2"
ssh root@192.168.0.99 "curl -s http://localhost:11437/api/tags | head -2"

# Start API gateway and frontend
ssh root@192.168.0.99 "cd /service-pool/gbgreg-api-gateway && npm start &"
ssh root@192.168.0.99 "cd /service-pool/gbgreg-frontend && npm run dev &"

# Start monitoring exporter
ssh root@192.168.0.99 "cd /service-pool/gbgreg-monitoring && node exporter.js &"
```

#### Service Shutdown Sequence
```bash
# Graceful shutdown in reverse dependency order
ssh root@192.168.0.99 "pkill -f 'npm run dev'"      # Frontend first
ssh root@192.168.0.99 "pkill -f 'npm start'"        # API gateway
ssh root@192.168.0.99 "pkill -f 'node exporter'"    # Monitoring

# Stop AI containers (allow 30s for processing completion)
ssh root@192.168.0.99 "docker stop --time=30 gbgreg-coordinator gbgreg-technical gbgreg-documentation gbgreg-vision"

# Stop database last (ensure data integrity)
ssh root@192.168.0.99 "docker stop --time=60 gbgreg-postgres"
```

#### Individual Service Management
```bash
# Restart specific AI model (example: technical analysis)
ssh root@192.168.0.99 "docker restart gbgreg-technical"

# Check individual container logs
ssh root@192.168.0.99 "docker logs --tail=50 gbgreg-technical"

# Monitor resource usage for specific container
ssh root@192.168.0.99 "docker stats gbgreg-technical --no-stream"

# Execute commands inside containers
ssh root@192.168.0.99 "docker exec -it gbgreg-postgres psql -U gbgreg -d laboratory"
```

### Service Configuration Management

#### Container Volume Verification
```bash
# Verify ZFS pool mounting for all services
ssh root@192.168.0.99 "ls -la /service-pool/gbgreg-*"

# Check specific service storage allocation
ssh root@192.168.0.99 "du -sh /service-pool/gbgreg-*"

# Verify database storage and permissions
ssh root@192.168.0.99 "ls -la /service-pool/gbgreg-postgres/"
ssh root@192.168.0.99 "docker exec gbgreg-postgres psql -U gbgreg -d laboratory -c '\dt'"
```

#### Model Configuration Updates
```bash
# Update AI model in specific container (example: technical analysis)
ssh root@192.168.0.99 "docker exec gbgreg-technical ollama pull deepseek-coder:6.7b"

# Verify model installation and performance
ssh root@192.168.0.99 "docker exec gbgreg-technical ollama list"
ssh root@192.168.0.99 "docker exec gbgreg-technical ollama run deepseek-coder:6.7b 'Test model response'"
```

## Health Monitoring

### Comprehensive Health Check Protocol

#### System Resource Monitoring
```bash
# Complete system health check from development laptop
ssh root@192.168.0.99 "
echo '=== SYSTEM RESOURCES ==='
top -bn1 | head -5
echo '=== MEMORY USAGE ==='
free -h
echo '=== DISK USAGE ==='  
df -h | grep -E '(service-pool|staging-pool|media-pool)'
echo '=== GPU STATUS ==='
nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,noheader,nounits
"
```

#### Service Health Verification
```bash
# Verify all GBGreg services responding to health checks
ssh root@192.168.0.99 "
echo '=== AI MODEL HEALTH ==='
curl -s http://localhost:11436/api/tags | grep -c 'models' || echo 'Coordinator: FAILED'
curl -s http://localhost:11437/api/tags | grep -c 'models' || echo 'Technical: FAILED'  
curl -s http://localhost:11438/api/tags | grep -c 'models' || echo 'Documentation: FAILED'
curl -s http://localhost:11439/api/tags | grep -c 'models' || echo 'Vision: FAILED'

echo '=== DATABASE HEALTH ==='
docker exec gbgreg-postgres pg_isready -U gbgreg || echo 'PostgreSQL: FAILED'

echo '=== FRONTEND HEALTH ==='
curl -s http://localhost:5173 | head -1 | grep -c 'DOCTYPE' || echo 'Frontend: FAILED'

echo '=== MONITORING HEALTH ==='
curl -s http://localhost:9105/metrics | grep -c 'gbgreg' || echo 'Monitoring: FAILED'
"
```

#### Performance Metrics Collection
```bash
# Collect comprehensive performance metrics
ssh root@192.168.0.99 "
echo '=== CONTAINER RESOURCE USAGE ==='
docker stats --no-stream --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}' | grep gbgreg

echo '=== PROMETHEUS METRICS SAMPLE ==='
curl -s http://localhost:9105/metrics | grep gbgreg | head -10

echo '=== DATABASE PERFORMANCE ==='
docker exec gbgreg-postgres psql -U gbgreg -d laboratory -c '
SELECT schemaname,tablename,n_tup_ins,n_tup_upd,n_tup_del 
FROM pg_stat_user_tables ORDER BY n_tup_ins DESC LIMIT 5;'
"
```

### Automated Monitoring Integration

#### Grafana Dashboard Integration
**Dashboard Panels**: GBGreg-specific monitoring integrated with existing 16-bit gaming theme
- **Workflow Performance Panel**: Response times, success rates, task completion metrics
- **Resource Utilization Panel**: Container CPU/memory usage, GPU utilization
- **Database Performance Panel**: Query response times, connection pool status
- **API Gateway Metrics Panel**: Request rates, error rates, response time distribution

**Dashboard Access**: http://192.168.0.99:3000 (admin/test123)
**Mobile Responsiveness**: Optimized for phone/tablet GBGreg monitoring

#### Alert Configuration
```bash
# Configure Grafana alerts for GBGreg enterprise deployment
# Alert conditions:
# - AI model response time >120 seconds
# - Container CPU usage >80% sustained for 5 minutes  
# - Database connections >80% of pool capacity
# - Frontend response time >2 seconds
# - GPU temperature >75°C during AI processing

# Alert notifications:
# - Development laptop notification (webhook)
# - Prometheus Alertmanager integration
# - Log aggregation in /staging-pool/gbgreg-temp/logs/alerts.log
```

#### Prometheus Metrics Monitoring
```bash
# Monitor key GBGreg metrics in real-time
ssh root@192.168.0.99 "
# Watch container resource usage
watch -n 5 'docker stats --no-stream --format \"table {{.Name}}\\t{{.CPUPerc}}\\t{{.MemUsage}}\" | grep gbgreg'
"

# Monitor API response times
ssh root@192.168.0.99 "
curl -s http://localhost:9105/metrics | grep -E '(response_time|cpu_seconds)'
"
```

## Troubleshooting Procedures

### Common Issues and Diagnostic Steps

#### Issue: AI Model Container Not Responding
**Symptoms**: API endpoints return timeout errors, curl requests fail
**Diagnostic Steps**:
```bash
# Check container status and logs
ssh root@192.168.0.99 "docker ps | grep gbgreg-technical"
ssh root@192.168.0.99 "docker logs --tail=50 gbgreg-technical"

# Check resource constraints
ssh root@192.168.0.99 "docker stats gbgreg-technical --no-stream"

# Verify model availability inside container
ssh root@192.168.0.99 "docker exec gbgreg-technical ollama list"

# Test model functionality
ssh root@192.168.0.99 "docker exec gbgreg-technical ollama run deepseek-coder:6.7b 'Hello world'"
```
**Resolution Steps**:
```bash
# Restart container with increased resources
ssh root@192.168.0.99 "docker stop gbgreg-technical"
ssh root@192.168.0.99 "docker run -d --name gbgreg-technical --restart=always \
  --gpus all --privileged \
  -e OLLAMA_GPU_ENABLE=1 \
  -v /service-pool/gbgreg-technical:/root/.ollama \
  -p 11437:11434 \
  -m 12g --cpus=4 \
  ollama/ollama:latest"

# Reload model configuration
ssh root@192.168.0.99 "docker exec gbgreg-technical ollama pull deepseek-coder:6.7b"
```

#### Issue: PostgreSQL Database Connection Failures
**Symptoms**: API gateway cannot connect to database, authentication errors
**Diagnostic Steps**:
```bash
# Check database container status
ssh root@192.168.0.99 "docker ps | grep gbgreg-postgres"
ssh root@192.168.0.99 "docker logs --tail=20 gbgreg-postgres"

# Test database connectivity
ssh root@192.168.0.99 "docker exec gbgreg-postgres pg_isready -U gbgreg"

# Check database connections and locks
ssh root@192.168.0.99 "docker exec gbgreg-postgres psql -U gbgreg -d laboratory -c '
SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = \"active\";
SELECT count(*) as waiting_queries FROM pg_stat_activity WHERE wait_event IS NOT NULL;'"
```
**Resolution Steps**:
```bash
# Restart database with connection pool reset
ssh root@192.168.0.99 "docker restart gbgreg-postgres"
ssh root@192.168.0.99 "sleep 15"  # Allow initialization

# Verify database integrity
ssh root@192.168.0.99 "docker exec gbgreg-postgres psql -U gbgreg -d laboratory -c '\dt'"

# Reset connection pools in API gateway
ssh root@192.168.0.99 "cd /service-pool/gbgreg-api-gateway && pkill -f 'npm start' && npm start &"
```

#### Issue: Frontend Interface Not Loading
**Symptoms**: Vue.js development server not accessible, white screen errors
**Diagnostic Steps**:
```bash
# Check frontend process status
ssh root@192.168.0.99 "ps aux | grep 'npm run dev'"

# Check development server logs
ssh root@192.168.0.99 "cd /service-pool/gbgreg-frontend && npm run dev"

# Verify frontend dependencies
ssh root@192.168.0.99 "cd /service-pool/gbgreg-frontend && npm list"

# Check API gateway connectivity from frontend
ssh root@192.168.0.99 "curl -s http://localhost:8000/api/v1/health"
```
**Resolution Steps**:
```bash
# Restart frontend development server
ssh root@192.168.0.99 "pkill -f 'npm run dev'"
ssh root@192.168.0.99 "cd /service-pool/gbgreg-frontend && npm install"
ssh root@192.168.0.99 "cd /service-pool/gbgreg-frontend && npm run dev &"

# Clear browser cache and test
# Access: http://192.168.0.99:5173 (force refresh with Ctrl+F5)
```

#### Issue: GPU Acceleration Not Working
**Symptoms**: AI models running slowly, nvidia-smi shows 0% utilization
**Diagnostic Steps**:
```bash
# Verify GPU hardware detection
ssh root@192.168.0.99 "nvidia-smi"

# Check container GPU access
ssh root@192.168.0.99 "docker exec gbgreg-technical nvidia-smi"

# Verify OLLAMA GPU configuration
ssh root@192.168.0.99 "docker exec gbgreg-technical env | grep OLLAMA"
```
**Resolution Steps**:
```bash
# Recreate containers with proper GPU access
ssh root@192.168.0.99 "docker stop gbgreg-technical gbgreg-coordinator gbgreg-documentation gbgreg-vision"

# Launch with GPU acceleration enabled
ssh root@192.168.0.99 "docker run -d --name gbgreg-technical --restart=always \
  --gpus all --privileged \
  -e OLLAMA_GPU_ENABLE=1 \
  -v /service-pool/gbgreg-technical:/root/.ollama \
  -p 11437:11434 \
  ollama/ollama:latest"

# Verify GPU utilization during model inference
ssh root@192.168.0.99 "docker exec gbgreg-technical ollama run deepseek-coder:6.7b 'Complex coding task' &
nvidia-smi -l 2"
```

### Performance Optimization Procedures

#### Model Response Time Optimization
```bash
# Optimize AI model configurations for faster response
ssh root@192.168.0.99 "docker exec gbgreg-technical ollama show deepseek-coder:6.7b | grep parameters"

# Monitor response time during optimization
ssh root@192.168.0.99 "
time docker exec gbgreg-technical ollama run deepseek-coder:6.7b 'Write hello world in Python'
"

# Configure model-specific optimizations
ssh root@192.168.0.99 "docker exec gbgreg-technical ollama create optimized-technical --from deepseek-coder:6.7b"
```

#### Database Performance Tuning
```bash
# Optimize PostgreSQL configuration for laboratory workloads
ssh root@192.168.0.99 "docker exec gbgreg-postgres psql -U gbgreg -d laboratory -c '
ANALYZE;  -- Update table statistics
REINDEX DATABASE laboratory;  -- Rebuild indices
VACUUM ANALYZE;  -- Clean up and update statistics
'"

# Monitor query performance
ssh root@192.168.0.99 "docker exec gbgreg-postgres psql -U gbgreg -d laboratory -c '
SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 5;
'"
```

#### Resource Allocation Optimization
```bash
# Monitor and adjust container resource allocation
ssh root@192.168.0.99 "docker stats --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}' | grep gbgreg"

# Update container resource limits based on usage patterns
ssh root@192.168.0.99 "docker update --memory=14g --cpus=5 gbgreg-technical"

# Verify optimization results
ssh root@192.168.0.99 "docker exec gbgreg-technical ollama run deepseek-coder:6.7b 'Performance test query'"
```

## User Guide

### Laboratory Automation Workflows

#### Workflow 1: Screenshot Analysis and Documentation
**Objective**: Analyze system screenshots and generate comprehensive documentation
**Steps**:
1. **Screenshot Capture**: Save screenshot to `/staging-pool/gbgreg-temp/screenshots/`
2. **Vision Analysis**: Access http://192.168.0.99:5173 → Upload screenshot → Request analysis
3. **Technical Review**: System routes to gbgreg-vision → gbgreg-technical → gbgreg-documentation
4. **Result Delivery**: Comprehensive analysis with technical insights and documentation

**API Usage Example**:
```bash
# Submit screenshot for analysis via API
ssh root@192.168.0.99 "curl -X POST http://localhost:8000/api/v1/workflows \
  -H 'Content-Type: application/json' \
  -d '{
    \"type\": \"screenshot_analysis\",
    \"screenshot_path\": \"/staging-pool/gbgreg-temp/screenshots/interface.png\",
    \"analysis_depth\": \"comprehensive\"
  }'"
```

#### Workflow 2: Technical Documentation Generation
**Objective**: Generate technical documentation for code or system configurations
**Steps**:
1. **Content Submission**: Provide code/configuration via frontend interface
2. **Analysis Pipeline**: gbgreg-coordinator → gbgreg-technical → gbgreg-documentation
3. **Review Process**: Automated cross-references and quality validation
4. **Output Generation**: Formatted documentation with cross-references

**Frontend Usage**:
- Access: http://192.168.0.99:5173
- Navigation: Workflows → Technical Documentation → New Document
- Input: Paste code or upload configuration files
- Options: Documentation style, target audience, cross-reference generation

#### Workflow 3: Multi-Modal System Analysis
**Objective**: Combined screenshot + technical analysis for comprehensive system understanding
**Steps**:
1. **Data Collection**: Screenshots + log files + configuration exports
2. **Multi-Model Processing**: Parallel analysis by specialized AI models
3. **Synthesis**: Coordinator combines insights from all models
4. **Deliverable**: Comprehensive system analysis report

### API Integration Guide

#### Authentication and Access
```bash
# Obtain JWT token for API access
curl -X POST http://192.168.0.99:8000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username": "admin", "password": "your_password"}'

# Use token for authenticated requests
export GBGREG_TOKEN="your_jwt_token_here"
curl -H "Authorization: Bearer $GBGREG_TOKEN" \
  http://192.168.0.99:8000/api/v1/workflows
```

#### Common API Operations
```bash
# List active workflows
curl -H "Authorization: Bearer $GBGREG_TOKEN" \
  http://192.168.0.99:8000/api/v1/workflows

# Submit new technical analysis task
curl -X POST -H "Authorization: Bearer $GBGREG_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"type": "technical_analysis", "content": "analyze this code..."}' \
  http://192.168.0.99:8000/api/v1/tasks

# Check task status
curl -H "Authorization: Bearer $GBGREG_TOKEN" \
  http://192.168.0.99:8000/api/v1/tasks/task_id/status

# Retrieve completed results  
curl -H "Authorization: Bearer $GBGREG_TOKEN" \
  http://192.168.0.99:8000/api/v1/tasks/task_id/results
```

### Frontend Interface Guide

#### Dashboard Navigation
- **Main Dashboard**: Overview of active workflows and system status
- **Workflow Management**: Create, monitor, and manage laboratory automation tasks
- **Technical Analysis**: Submit code/configurations for specialized AI analysis
- **Documentation Center**: Generate and manage technical documentation
- **Vision Analysis**: Screenshot and visual content analysis interface
- **System Monitoring**: Real-time performance metrics and health status

#### Mobile Interface Optimization
- **Responsive Design**: Optimized for phone/tablet access with touch controls
- **Quick Actions**: Swipe gestures for common workflow operations
- **Status Monitoring**: Mobile-optimized dashboards for system health
- **Notification Integration**: Push notifications for workflow completion

## Maintenance Schedules

### Daily Maintenance Tasks (Automated)
```bash
# Automated daily maintenance script
ssh root@192.168.0.99 "cat > /usr/local/bin/gbgreg-daily-maintenance.sh << 'EOF'
#!/bin/bash
# GBGreg daily maintenance - automated execution

# Health check and metrics collection
docker stats --no-stream --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}' | grep gbgreg >> /var/log/gbgreg-daily-stats.log

# Database maintenance
docker exec gbgreg-postgres psql -U gbgreg -d laboratory -c 'VACUUM ANALYZE;'

# Log rotation and cleanup
find /staging-pool/gbgreg-temp/logs/ -name '*.log' -mtime +7 -delete

# Container log cleanup
docker system prune -f --volumes --filter 'until=24h'

# Performance metrics snapshot
curl -s http://localhost:9105/metrics | grep gbgreg > /var/log/gbgreg-metrics-$(date +%Y%m%d).log
EOF"

# Make executable and schedule
ssh root@192.168.0.99 "chmod +x /usr/local/bin/gbgreg-daily-maintenance.sh"
ssh root@192.168.0.99 "echo '0 2 * * * /usr/local/bin/gbgreg-daily-maintenance.sh' >> /etc/crontab"
```

### Weekly Maintenance Tasks (Manual)
```bash
# Weekly comprehensive system review (execute from development laptop)
ssh root@192.168.0.99 "
echo '=== WEEKLY GBGREG MAINTENANCE REPORT ==='
echo 'Date: $(date)'
echo

echo '=== SERVICE UPTIME ==='
docker ps --format 'table {{.Names}}\t{{.Status}}' | grep gbgreg

echo '=== RESOURCE UTILIZATION TRENDS ==='
tail -20 /var/log/gbgreg-daily-stats.log

echo '=== DATABASE PERFORMANCE ANALYSIS ==='
docker exec gbgreg-postgres psql -U gbgreg -d laboratory -c '
SELECT schemaname,tablename,n_tup_ins,n_tup_upd,n_tup_del,n_tup_hot_upd 
FROM pg_stat_user_tables ORDER BY n_tup_ins DESC LIMIT 10;'

echo '=== STORAGE UTILIZATION ==='
du -sh /service-pool/gbgreg-*
df -h | grep -E '(service-pool|staging-pool)'

echo '=== MODEL PERFORMANCE SUMMARY ==='
# Review response time trends from Grafana metrics
curl -s http://localhost:9105/metrics | grep -E 'gbgreg_model_response|gbgreg_workflow_completion'
"
```

### Monthly Maintenance Tasks (Planned)
```bash
# Monthly optimization and backup procedures
# Execute monthly during planned maintenance window

# Complete database backup
ssh root@192.168.0.99 "docker exec gbgreg-postgres pg_dump -U gbgreg laboratory > /media-pool/gbgreg-archive/backup-$(date +%Y%m%d).sql"

# Model configuration backup
ssh root@192.168.0.99 "tar -czf /media-pool/gbgreg-archive/models-$(date +%Y%m%d).tar.gz /service-pool/gbgreg-*"

# Performance optimization review
ssh root@192.168.0.99 "docker exec gbgreg-postgres psql -U gbgreg -d laboratory -c 'REINDEX DATABASE laboratory;'"

# ZFS snapshot creation for rollback capability
ssh root@192.168.0.99 "zfs snapshot service-pool/gbgreg@monthly-$(date +%Y%m%d)"

# Security update review
ssh root@192.168.0.99 "docker images | grep gbgreg"  # Review for updated base images
```

## Security and Access Control

### SSH-Based Security Model
**Primary Access**: SSH key authentication from development laptop (dinux)
**Network Security**: Internal container networking with selective port exposure
**Data Protection**: PostgreSQL authentication, container isolation
**Monitoring Security**: Metrics exposure without sensitive data

### Container Security
```bash
# Review container security configuration
ssh root@192.168.0.99 "docker inspect gbgreg-technical | grep -A 5 -B 5 'Privileged\|User\|Capabilities'"

# Verify non-root execution where possible
ssh root@192.168.0.99 "docker exec gbgreg-postgres whoami"

# Check container network isolation
ssh root@192.168.0.99 "docker network ls | grep gbgreg"
```

### Backup and Recovery Procedures

#### Complete System Backup
```bash
# Full GBGreg system backup procedure
ssh root@192.168.0.99 "
# Stop services for consistent backup
docker stop gbgreg-coordinator gbgreg-technical gbgreg-documentation gbgreg-vision
docker stop gbgreg-postgres

# Create ZFS snapshots
zfs snapshot service-pool/gbgreg@backup-$(date +%Y%m%d-%H%M)
zfs snapshot staging-pool/gbgreg@backup-$(date +%Y%m%d-%H%M)

# Database dump
docker start gbgreg-postgres
sleep 10
docker exec gbgreg-postgres pg_dump -U gbgreg laboratory > /media-pool/gbgreg-archive/full-backup-$(date +%Y%m%d).sql

# Configuration backup
tar -czf /media-pool/gbgreg-archive/config-backup-$(date +%Y%m%d).tar.gz /service-pool/gbgreg-*

# Restart services
docker start gbgreg-coordinator gbgreg-technical gbgreg-documentation gbgreg-vision
"
```

#### Recovery Procedures
```bash
# Complete system recovery from backup
ssh root@192.168.0.99 "
# Restore from ZFS snapshots
zfs rollback service-pool/gbgreg@backup-YYYYMMDD-HHMM
zfs rollback staging-pool/gbgreg@backup-YYYYMMDD-HHMM

# Database recovery
docker exec gbgreg-postgres psql -U gbgreg -d laboratory < /media-pool/gbgreg-archive/full-backup-YYYYMMDD.sql

# Verify service integrity after recovery
docker restart gbgreg-coordinator gbgreg-technical gbgreg-documentation gbgreg-vision gbgreg-postgres
"

# Recovery verification checklist
ssh root@192.168.0.99 "
curl -s http://localhost:11436/api/tags | grep -c models
curl -s http://localhost:11437/api/tags | grep -c models  
docker exec gbgreg-postgres pg_isready -U gbgreg
curl -s http://localhost:5173 | head -1
"
```

---

**These operational procedures provide comprehensive management guidance for sustained GBGreg enterprise operations with validated troubleshooting, monitoring, and maintenance protocols optimized for SSH-based remote management from the development environment.**