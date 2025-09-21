# CYCLE 5 - WRITER THREAD CORE INITIALIZATION

## Thread Assignment: WRITER THREAD (Core Infrastructure)
## Cycle ID: 2025-09-20-CYCLE-5-CORE
## Previous Thread: Reader Thread verification complete

### 🎯 Project Context
**[TO BE FILLED FROM READER REPORT]**
- API endpoint verification results: [READER VALIDATION REQUIRED]
- ZFS metrics availability: [READER VALIDATION REQUIRED]
- Performance baseline: [READER VALIDATION REQUIRED]
- Identified feasibility: [READER VALIDATION REQUIRED]

**Critical Validation Checkpoint**: This initialization is INVALID until Reader Thread confirms:
1. ✅ APIs tested and working
2. ✅ ZFS metrics available in Prometheus
3. ✅ No critical blockers identified
4. ✅ Implementation priority order established

### 📋 Specific Tasks

#### **1. Validate Reader Findings**
**MANDATORY FIRST STEP**

Before ANY implementation, verify Reader Thread claims:
```bash
# Confirm Reader's API test results
curl -X GET "http://192.168.0.99:32400/library/recentlyAdded?limit=1"
curl -X GET "http://192.168.0.111:8112/api/v2/torrents/info"
curl "http://192.168.0.99:9090/api/v1/query?query=zfs_pool_health"

# If ANY of these fail, STOP and return to Reader Thread
```

**Validation Criteria:**
- [ ] Plex API returns valid JSON (not just HTTP 200)
- [ ] qBittorrent API accessible (authentication method noted)
- [ ] ZFS pool metrics return actual pool data
- [ ] Reader's difficulty assessment appears accurate

#### **2. Incremental Package Installation**
**ONLY install what Reader verified is needed**

Based on Reader's dependency analysis:
```json
// Install ONLY if Reader confirmed Chart.js not present:
npm install chart.js vue-chartjs

// Install ONLY if Reader confirmed these specific libraries needed:
npm install @types/chart.js
```

**Installation Rules:**
- NEVER mass-install packages speculatively
- Each package must be justified by Reader findings
- Document WHY each package is needed
- Verify bundle size impact after each install

#### **3. Create API Service Foundation**
**Start with ONE service - ZFS metrics (lowest risk)**

```typescript
// Create: src/services/zfsApi.ts
// Purpose: Extend existing Prometheus client with ZFS-specific queries
// Validation: Must return real data from Reader-verified endpoints

interface ZFSPoolData {
  name: string
  health: string
  usedBytes: number
  totalBytes: number
  usagePercent: number
}

class ZFSMetricsService {
  // Extend prometheusClient with ZFS-specific methods
  // Handle errors gracefully
  // Provide fallback data for offline/error states
}
```

**Implementation Requirements:**
- Use existing prometheusClient from src/services/prometheusApi.ts
- Handle network failures gracefully
- TypeScript interfaces for all return types
- Error logging but no console spam

#### **4. Create Single Proof-of-Concept Component**
**ZFSPoolChart.vue - Simple 2D chart (NOT 3D initially)**

```vue
<!-- Create: src/components/monitoring/ZFSPoolChart.vue -->
<!-- Purpose: Prove ZFS data -> chart rendering pipeline works -->
<!-- Validation: Must show real pool data, not mock data -->

<template>
  <div class="zfs-pool-chart j32-card">
    <h3>ZFS Pool Usage</h3>
    <!-- Simple bar chart or pie chart -->
    <!-- Jehkoba32 theme colors -->
    <!-- Loading/error states -->
  </div>
</template>
```

**Component Requirements:**
- Use existing Jehkoba32 theme variables
- Integrate with existing SystemMetricsWidget structure
- Show loading state while fetching data
- Graceful error handling (show "Data unavailable")
- Mobile responsive

#### **5. Integration Test**
**Add component to System Metrics tab**

```vue
<!-- Modify: src/components/monitoring/SystemMetricsWidget.vue -->
<!-- Add ZFSPoolChart below existing metrics -->
<!-- Ensure grid layout handles new component -->
```

### 🔐 Authority Level
- **Can Do**:
  - Install packages verified necessary by Reader
  - Create new service files
  - Create new Vue components
  - Modify existing components (SystemMetricsWidget)
  - Test API integrations

- **Cannot Do**:
  - Install packages NOT verified by Reader
  - Delete or heavily modify existing functionality
  - Change routing or navigation
  - Modify other tabs/components outside System Metrics

- **Must Verify**:
  - Reader's claims about API availability
  - Each change maintains existing dashboard functionality
  - New components follow Jehkoba32 theme system
  - No console errors introduced

### ✅ Success Criteria
**Primary Goals:**
- [ ] **Reader Validation Passed**: All Reader claims verified independently
- [ ] **ZFS Service Created**: API service returning real pool data
- [ ] **Chart Component Working**: ZFSPoolChart displays actual ZFS data
- [ ] **Integration Complete**: Component added to System Metrics tab
- [ ] **No Regressions**: Existing dashboard functionality intact
- [ ] **Theme Compliance**: New components use Jehkoba32 colors/styles

**Quality Gates:**
- [ ] No console errors in browser
- [ ] Mobile responsive layout maintained
- [ ] Loading states implemented
- [ ] Error handling functional
- [ ] TypeScript types complete

### 📊 Reporting Requirements
Generate **WRITER-CORE-REPORT-CYCLE-5.md** at `/home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/THREAD-CYCLES/CYCLE-5-INIT/` with:

#### **Reader Validation Results**
```markdown
## Reader Thread Verification
- Plex API test: [PASS/FAIL] - [Details]
- qBittorrent API test: [PASS/FAIL] - [Details]
- ZFS metrics test: [PASS/FAIL] - [Sample data]
- Reader assessment validation: [ACCURATE/INACCURATE] - [Reasoning]
```

#### **Implementation Summary**
```markdown
## Files Created
- src/services/zfsApi.ts - [Purpose and methods]
- src/components/monitoring/ZFSPoolChart.vue - [Description]

## Files Modified
- src/components/monitoring/SystemMetricsWidget.vue - [Changes made]
- package.json - [Packages added and why]

## Package Changes
- Installed: [List with reasons]
- Bundle size impact: [Before: Xkb, After: Ykb]
```

#### **Component Integration**
```markdown
## ZFS Chart Implementation
- Data source: [Prometheus queries used]
- Chart type: [Bar/Pie/etc and library]
- Real data displayed: [Pool names and usage percentages]
- Error handling: [How offline/error states handled]
- Performance: [Render time, update interval]
```

#### **Testing Results**
```markdown
## Functional Testing
- Desktop browser: [PASS/FAIL]
- Mobile browser: [PASS/FAIL]
- Network offline: [Graceful degradation confirmed]
- ZFS service stopped: [Error handling confirmed]

## Integration Testing
- Existing metrics still work: [PASS/FAIL]
- System Metrics tab layout: [PASS/FAIL]
- Theme consistency: [PASS/FAIL]
```

#### **Next Steps**
```markdown
## Ready for Features Thread
- [Yes/No] with reasoning
- Priority features based on implementation experience:
  1. [Next feature] - [Why this should be next]
  2. [Next feature] - [Why this should be second]

## Issues for Debug Thread
- [None/List issues that need debugging]

## Blockers Discovered
- [None/List any new blockers found during implementation]
```

### ➡️ Next Thread
**Writer Thread - Features** (only if core implementation successful)
OR
**Debug Thread** (if critical issues discovered)

### 📝 /compact Instructions
If context runs low, ensure report includes:
1. Reader validation results (pass/fail)
2. ZFS chart working status (yes/no with screenshot/description)
3. Any critical issues discovered
4. Recommended next steps
5. Files created/modified

### ⚠️ CRITICAL VALIDATION POINTS
1. **DO NOT PROCEED** without validating Reader's API claims
2. **STOP IMMEDIATELY** if ZFS data is not available as reported
3. **ROLLBACK CHANGES** if existing functionality breaks
4. **REQUEST DEBUG THREAD** if authentication/CORS issues discovered

---

**Thread Start Time**: [Record when started]
**Estimated Duration**: 4-6 hours
**Success Measurement**: Working ZFS chart with real data integrated into dashboard