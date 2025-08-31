# Thread Handoff Templates and Protocols

**Status**: ✅ **OPERATIONAL** - Standardized handoff procedures
**Updated**: 2025-08-27
**Authority**: Required format for all thread transitions
**Location**: `/home/darney/projects/proxmox-homelab/docs/UNIFIED-REFERENCE/FRAMEWORK/`

## 📋 **Standard Thread Prompt Template**

Use this template when creating prompts for the next thread in sequence:

```markdown
## Thread Assignment: [THREAD NAME - Reader/Writer/Debug/Documentation]
## Cycle ID: [YYYY-MM-DD-HHMMSS]
## Previous Thread: [Source thread name and completion status]

### Project Context
[Current project state, active services, system configuration]

### Specific Tasks
1. [Task 1 - specific and measurable]
2. [Task 2 - specific and measurable]
3. [Task 3 - specific and measurable]

### Authority Level
- **Can Do**: [Specific permissions and capabilities]
- **Cannot Do**: [Restrictions and limitations]
- **Must Verify**: [Things to check before proceeding]

### Success Criteria
- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]
- [ ] [Measurable outcome 3]

### Reporting Requirements
- Generate structured status report using standard template
- Update relevant documentation in UNIFIED-REFERENCE
- Document any issues or blockers encountered
- Provide specific recommendations for next thread

### Next Thread
[Which thread should receive the report - usually Main for coordination]

### /compact Instructions
[Specific instructions if thread runs out of context]
```

## 📊 **Standard Thread Report Template**

Use this template when reporting back to Main thread:

```markdown
## [THREAD EMOJI] Thread Status Report
## Cycle ID: [YYYY-MM-DD-HHMMSS]
## Duration: [Time taken to complete tasks]

### ✅ Tasks Completed
1. [Completed task with specific result]
2. [Completed task with specific result]
3. [Completed task with specific result]

### 🔄 System Changes
- [Change 1 - what was modified and why]
- [Change 2 - what was modified and why]
- [Change 3 - what was modified and why]

### ⚠️ Issues Encountered
- **Issue**: [Description]
  - **Resolution**: [How it was resolved or workaround]
- **Issue**: [Description]
  - **Status**: [Blocked/Resolved/Workaround]

### 📋 Verification Results
- [System component]: [Status - Operational/Degraded/Failed]
- [Service]: [Health check result]
- [Configuration]: [Validation outcome]

### 💡 Recommendations
- **For Next Thread**: [Specific recommendation]
- **Architecture**: [Design consideration discovered]
- **Documentation**: [What needs updating]

### 🎯 Next Action Required
**Recommended Next Thread**: [Thread name]
**Priority Tasks**:
1. [Highest priority task]
2. [Second priority task]
3. [Third priority task]

### 📚 Documentation Updates
- Updated: [File path that was updated]
- Created: [New documentation created]
- Archived: [What was moved to archive]
```

## 🔄 **Thread-Specific Templates**

### **🔍 Reader Thread Report**
```markdown
## 🔍 Reader Thread Verification Report
## Cycle ID: [timestamp]

### System Health Check
- **Proxmox Status**: [Operational/Issues]
- **Service Health**: [X/Y services operational]
- **Storage Status**: [ZFS pool health]
- **Network Status**: [Connectivity verification]

### Research Findings
- [Key discovery 1]
- [Key discovery 2]
- [Key discovery 3]

### Assumption Validation
- **Assumed**: [What was assumed]
  - **Reality**: [What was actually found]
- **Assumed**: [What was assumed]
  - **Reality**: [What was actually found]

### Recommended Implementation Approach
[Specific guidance for Writer thread based on findings]
```

### **⚡ Writer Thread Report**
```markdown
## ⚡ Writer Thread Implementation Report  
## Cycle ID: [timestamp]

### Deployments Completed
- **Service**: [Name] - [Status]
  - Configuration: [Key settings]
  - Access: [URL/Port]
- **Infrastructure**: [Change made]
  - Impact: [What this enables]

### Code/Configuration Changes
- Modified: [File path] - [Purpose]
- Created: [File path] - [Purpose]
- Deployed: [Service/Container] - [Purpose]

### Performance Metrics
- Deployment Time: [Duration]
- Resource Usage: [CPU/Memory]
- Success Rate: [X/Y tasks]

### Handoff to Debug (if needed)
- **Issue Requiring Debug**: [Specific problem]
- **Attempted Solutions**: [What was tried]
- **Debug Focus Area**: [Where to investigate]
```

### **🔧 Debug Thread Report**
```markdown
## 🔧 Debug Thread Resolution Report
## Cycle ID: [timestamp]

### Problem Analysis
- **Root Cause**: [Identified issue]
- **Impact**: [What was affected]
- **Severity**: [Critical/High/Medium/Low]

### Resolution Steps
1. [Step taken to resolve]
2. [Step taken to resolve]
3. [Step taken to resolve]

### Verification
- **Before**: [Problem state]
- **After**: [Fixed state]
- **Tests**: [Validation performed]

### Prevention Recommendations
- [How to prevent recurrence]
- [Monitoring to add]
- [Documentation to update]
```

### **📚 Documentation Thread Report**
```markdown
## 📚 Documentation Thread Synthesis Report
## Cycle ID: [timestamp]

### Documentation Updates
- **UNIFIED-REFERENCE Updates**:
  - FRAMEWORK/: [Files updated]
  - ARCHITECTURE/: [Files updated]
  - OPERATIONS/: [Files updated]
  - THREAD-CYCLES/: [Cycle documented]

### Knowledge Synthesis
- **Patterns Identified**: [New patterns discovered]
- **Best Practices**: [Added to documentation]
- **Lessons Learned**: [Captured from cycle]

### Cross-Reference Updates
- Fixed: [X broken references]
- Updated: [Y file references to unified source]
- Deprecated: [Z redundant documents]

### Agent Knowledge Transfer
- **To Debug SME**: [Knowledge added]
- **To Dashboard Monitor**: [Metrics added]
- **From Disposable Agents**: [Knowledge extracted]
```

## 🚀 **Cycle Management Templates**

### **Cycle Initiation**
```markdown
## New Execution Cycle
## Cycle ID: [YYYY-MM-DD-HHMMSS]
## Objective: [Primary goal for this cycle]

### Cycle Scope
- [ ] [Deliverable 1]
- [ ] [Deliverable 2]
- [ ] [Deliverable 3]

### Thread Sequence Plan
1. **Reader**: [Verification tasks]
2. **Writer**: [Implementation tasks]
3. **Debug**: [If needed - troubleshooting]
4. **Documentation**: [Knowledge capture]

### Success Metrics
- Time Target: [Expected duration]
- Deliverables: [What must be completed]
- Quality Gates: [Validation criteria]
```

### **Cycle Completion**
```markdown
## Cycle Completion Report
## Cycle ID: [YYYY-MM-DD-HHMMSS]
## Duration: [Actual time taken]

### Achievements
- ✅ [Completed objective 1]
- ✅ [Completed objective 2]
- ⚠️ [Partial completion - details]
- ❌ [Not completed - reason]

### Metrics
- Thread Transitions: [Number]
- Success Rate: [Percentage]
- Documentation Updates: [Count]
- Issues Resolved: [Count]

### Next Cycle Recommendations
- Priority 1: [Most important task]
- Priority 2: [Second task]
- Priority 3: [Third task]

### Archive Location
- Cycle documentation: `/docs/UNIFIED-REFERENCE/THREAD-CYCLES/cycle-history/[cycle-id]/`
```

## 🔧 **/compact Instructions Template**

When a thread runs out of context, include these instructions:

```markdown
## /compact Recovery Instructions
## Thread: [Current thread name]
## Cycle ID: [Current cycle]

### Context Summary
[Brief summary of what was being worked on]

### Progress Status
- ✅ Completed: [What's done]
- 🔄 In Progress: [What's partially done]
- ⏳ Pending: [What hasn't started]

### Critical Information
- [Key fact 1 that must be preserved]
- [Key fact 2 that must be preserved]
- [Key fact 3 that must be preserved]

### Resume Instructions
1. Check current state with: [Specific command]
2. Continue with: [Next task]
3. Verify using: [Validation method]

### File References
- Working on: [File paths being edited]
- Reference: [Documentation to consult]
- Output to: [Where results should go]
```

## 📋 **Usage Guidelines**

1. **Always include Cycle ID** in all templates for tracking
2. **Use thread emojis** consistently for visual identification
3. **Be specific** about tasks and outcomes - avoid vague descriptions
4. **Document issues** even if resolved for pattern recognition
5. **Update UNIFIED-REFERENCE** as part of every thread execution
6. **Archive completed cycles** to cycle-history with full context

## 🔄 **Integration Points**

### With 5-Thread Execution Model
- Templates implement the mandatory sequential workflow
- Reports trigger next thread in sequence
- Cycle IDs maintain execution continuity

### With Documentation System  
- All reports contribute to UNIFIED-REFERENCE
- Cycle documentation preserved in THREAD-CYCLES
- Cross-references maintained automatically

### With Agent System
- Thread reports feed agent knowledge bases
- Agents use templates for consistency
- Knowledge transfer follows template structure

---

**These templates ensure consistent, high-quality handoffs between threads and maintain complete execution history.**