# CYCLE 5 - READER THREAD INITIALIZATION

## Thread Assignment: READER THREAD
## Cycle ID: 2025-09-20-CYCLE-5
## Previous Thread: Main Thread (Cycle 5 orchestration)

### 🎯 Project Context
- **LCiBot Dashboard**: Production at http://192.168.0.218:8090, Dev server at http://192.168.0.218:8092 with Jehkoba32 theme system
- **Current State**: System Metrics tab with basic metrics (CPU, Memory, Storage, Load Average)
- **Infrastructure Available**:
  - Prometheus API client (src/services/prometheusApi.ts)
  - Vue 3 + TypeScript + TailwindCSS
  - Existing service monitoring components
- **Target Enhancement**: Advanced interactive features for System Metrics tab

### 📋 Specific Tasks

#### **1. API Endpoint Verification**
**Priority: CRITICAL** - Must verify before any implementation

```bash
# Test these endpoints and document response formats:

# Plex API - Recently Added Media
curl -X GET "http://192.168.0.99:32400/library/recentlyAdded?limit=10"

# qBittorrent API - Active Torrents
curl -X GET "http://192.168.0.111:8112/api/v2/torrents/info" \
  -H "Content-Type: application/json"

# Verify authentication requirements for each API
curl -I "http://192.168.0.99:32400/identity"
curl -I "http://192.168.0.111:8112/api/v2/app/version"
```

**Document for each endpoint:**
- Authentication method (token, cookie, none)
- Response format and key fields
- CORS headers present
- Error responses and status codes

#### **2. Prometheus ZFS Metrics Verification**
**Priority: HIGH** - Core feature dependency

```bash
# Test these Prometheus queries via curl:
curl "http://192.168.0.99:9090/api/v1/query?query=zfs_pool_health"
curl "http://192.168.0.99:9090/api/v1/query?query=zfs_pool_used_bytes"
curl "http://192.168.0.99:9090/api/v1/query?query=zfs_pool_size_bytes"
```

**Verify availability of:**
- Pool names and health status
- Used/total bytes for percentage calculations
- Dataset-level metrics for drill-down
- Update frequency of metrics

#### **3. Current Dashboard Analysis**
**Priority: MEDIUM** - Performance baseline

```bash
# Check current package dependencies
cat package.json | grep -A 20 '"dependencies"'

# Measure current bundle size
npm run build
ls -la dist/assets/

# Test current load performance
curl -w "%{time_total}" http://192.168.0.218:8090/ -o /dev/null -s
curl -w "%{time_total}" http://192.168.0.218:8092/ -o /dev/null -s
```

**Document:**
- Current bundle size (JS/CSS)
- Load time of System Metrics tab
- Memory usage in browser dev tools
- Chart.js already installed? (Check package.json)

#### **4. Feature Feasibility Assessment**
For each proposed feature, determine:

**ZFS 3D Pool Charts:**
- Chart.js availability and version
- Browser 3D canvas support requirements
- Data refresh rate limitations

**Torrent Management:**
- qBittorrent API authentication method
- Available torrent status fields
- Real-time update capabilities

**Plex Integration:**
- API token requirements
- Recent media data structure
- Rate limiting concerns

**Terminal Integration:**
- WebSocket support requirements
- Security implications for shell access
- Alternative approaches (iframe, separate service)

### 🔐 Authority Level
- **Can Do**:
  - Read all project files
  - Test API endpoints with curl/fetch
  - Run diagnostic commands
  - Measure performance metrics
  - Research library compatibility

- **Cannot Do**:
  - Install packages or modify package.json
  - Change any source code
  - Modify configurations
  - Commit changes

- **Must Verify**:
  - All API endpoints return expected data
  - CORS settings allow browser requests
  - Required data fields are available
  - No authentication blockers exist

### ✅ Success Criteria
- [ ] **API Verification Complete**: All 3 target APIs tested with documented response formats
- [ ] **ZFS Metrics Confirmed**: Prometheus queries return pool data suitable for charts
- [ ] **Performance Baseline**: Current bundle size and load times measured
- [ ] **Feasibility Matrix**: Each feature rated (Easy/Medium/Hard/Blocked) with reasoning
- [ ] **Authentication Requirements**: Documented for each API endpoint
- [ ] **CORS Status**: Verified browser can access all required endpoints
- [ ] **Risk Assessment**: Identified potential blockers and mitigation strategies

### 📊 Reporting Requirements
Generate **READER-REPORT-CYCLE-5.md** at `/home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/THREAD-CYCLES/CYCLE-5-INIT/` with:

#### **API Endpoint Results**
```markdown
## API Verification Results

### Plex API (http://192.168.0.99:32400)
- Status: [WORKING/BLOCKED/ERROR]
- Authentication: [None/Token/Cookie required]
- CORS: [Enabled/Disabled/Partial]
- Key endpoints tested: [List with status]
- Response format: [JSON structure summary]

### qBittorrent API (http://192.168.0.111:8112)
- Status: [WORKING/BLOCKED/ERROR]
- Authentication: [Method required]
- Available data: [Torrent fields available]
- Update frequency: [How often data changes]

### Prometheus ZFS Metrics
- Pool metrics available: [Yes/No + details]
- Queries tested: [List with sample results]
- Update interval: [How often metrics refresh]
```

#### **Feasibility Assessment**
```markdown
## Feature Implementation Difficulty

| Feature | Difficulty | Reasoning | Blockers |
|---------|------------|-----------|----------|
| ZFS 3D Charts | [Easy/Med/Hard] | [Why] | [None/List] |
| Torrent Status | [Easy/Med/Hard] | [Why] | [None/List] |
| Plex Integration | [Easy/Med/Hard] | [Why] | [None/List] |
| Terminal Embed | [Easy/Med/Hard] | [Why] | [None/List] |
```

#### **Performance Baseline**
```markdown
## Current Performance Metrics
- Bundle size: [JS: Xkb, CSS: Ykb]
- Load time: [Xs average]
- Dependencies: [Chart.js present: Y/N]
- Memory usage: [Browser dev tools reading]
```

#### **Recommendations**
```markdown
## Implementation Priority Order
1. [Feature] - [Reasoning]
2. [Feature] - [Reasoning]
3. [Feature] - [Reasoning]

## Required Package Additions
- [Library]: [Version] - [Purpose]
- [Library]: [Version] - [Purpose]

## Risk Mitigation
- [Risk]: [Mitigation strategy]
- [Risk]: [Mitigation strategy]
```

### ➡️ Next Thread
**Writer Thread - Core Infrastructure** (only if feasibility confirmed)

### 📝 /compact Instructions
If context runs low, generate abbreviated report with:
1. API test results (working/blocked)
2. ZFS metrics availability (yes/no)
3. Top 3 implementation priorities
4. Critical blockers identified
5. Recommended next steps

---

**Thread Start Time**: [Record when started]
**Estimated Duration**: 3-4 hours
**Success Measurement**: All APIs tested, feasibility confirmed, clear next steps identified