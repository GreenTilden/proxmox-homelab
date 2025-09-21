# Thread Prompting Standards & Templates

**Status**: ✅ **OPERATIONAL** - Production prompting protocols  
**Updated**: 2025-08-25  
**Authority**: Standardized thread communication system

## 🎯 **Main Thread Prompt Generation**

The Main Thread is responsible for creating **specific, actionable prompts** for each thread in the sequential workflow. Each prompt MUST include all required elements for autonomous thread execution.

## 📋 **Universal Prompt Template**

### **Header Section** (All Prompts):
```markdown
## 🔍 THREAD ASSIGNMENT: [READER|WRITER|DEBUG|DOCUMENTATION]
## 📊 PROJECT CONTEXT: 
[Current system state, active services, recent changes, project objectives]

## ⚡ SPECIFIC TASKS:
[Detailed, actionable tasks specific to this thread's capabilities]

## 🔒 AUTHORITY LEVEL:
[What this thread can/cannot do - reference capability matrix]

## ✅ SUCCESS CRITERIA:
[Measurable outcomes that define task completion]

## 📝 REPORTING REQUIREMENTS:
[Expected report format and required information for Main Thread]

## 🔄 NEXT THREAD:
[Which thread should receive this report - maintain workflow sequence]
```

## 🔍 **Reader Thread Prompt Template**

```markdown
## 🔍 THREAD ASSIGNMENT: READER THREAD
## 📊 PROJECT CONTEXT: 
Proxmox homelab with [X]/[Y] services operational. Recent changes: [list changes].
Current objective: [specific goal].

## ⚡ SPECIFIC TASKS:
### System Verification Required:
- [ ] SSH verification: [specific commands to run]
- [ ] Service status: [specific services to check]  
- [ ] Configuration validation: [specific configs to verify]
- [ ] Documentation accuracy: [specific claims to validate]

### Research Objectives:
- [ ] [Specific research questions to answer]
- [ ] [System information to gather]
- [ ] [Status reports to generate]

## 🔒 AUTHORITY LEVEL:
- ✅ SSH read-only system access for verification
- ✅ Status checking and system analysis
- 🔒 NO system modifications or deployments
- ✅ Documentation accuracy validation
- ✅ Content audit agent deployment

## ✅ SUCCESS CRITERIA:
- All verification tasks completed with evidence
- System reality documented accurately  
- Any discrepancies between documentation and reality identified
- Research questions answered with supporting data

## 📝 REPORTING REQUIREMENTS:
Use Reader Thread Report Template with:
- System health status (✅/⚠️/❌)
- Service operational status with evidence
- Configuration validation results
- Research findings with supporting data
- Identified discrepancies requiring Writer Thread attention

## 🔄 NEXT THREAD: Main Thread (for task delegation to Writer Thread)
```

## ⚡ **Writer Thread Prompt Template**

```markdown
## ⚡ THREAD ASSIGNMENT: WRITER THREAD  
## 📊 PROJECT CONTEXT:
Reader Thread verified: [verification results]. System ready for: [implementation tasks].
Current infrastructure: [service count, storage, networking].

## ⚡ SPECIFIC TASKS:
### Implementation Required:
- [ ] Service deployment: [specific containers/services]
- [ ] Configuration changes: [specific files/settings]
- [ ] Infrastructure modifications: [specific system changes]
- [ ] Integration tasks: [specific connection/networking]

### Using Established Patterns:
- Storage mounting: [reference ARCHITECTURE/storage-mounting.md]
- Container deployment: [reference proven Docker/LXC patterns]
- Network configuration: [reference existing service patterns]

## 🔒 AUTHORITY LEVEL:
- ✅ Full SSH system modification access
- ✅ Container deployment and management
- ✅ Configuration file modifications
- ✅ Service restart and management
- ✅ Implementation agent deployment
- 🔒 Complex troubleshooting → escalate to Debug Thread

## ✅ SUCCESS CRITERIA:
- All implementation tasks completed successfully
- Services operational and accessible
- Configurations properly applied and persistent
- Integration with existing services functional
- No system degradation or service interruption

## 📝 REPORTING REQUIREMENTS:
Use Writer Thread Report Template with:
- Implementation steps completed
- Service deployment status
- Configuration changes applied
- Testing results and verification
- Any issues requiring Debug Thread escalation

## 🔄 NEXT THREAD: Main Thread (for verification or Debug Thread escalation)
```

## 🔧 **Debug Thread Prompt Template**

```markdown
## 🔧 THREAD ASSIGNMENT: DEBUG THREAD
## 📊 PROJECT CONTEXT:
Writer Thread encountered: [specific issues]. System state: [current status].
Services affected: [list affected services]. Urgency level: [HIGH/MEDIUM/LOW].

## ⚡ SPECIFIC TASKS:
### Issue Resolution Required:
- [ ] Problem diagnosis: [specific symptoms to investigate]
- [ ] Root cause analysis: [specific system components to examine]
- [ ] Solution implementation: [specific fixes to apply]
- [ ] System restoration: [specific recovery procedures]

### Diagnostic Approach:
- Container troubleshooting: [specific container issues]
- Network connectivity: [specific networking problems]
- Service integration: [specific integration failures]
- Configuration conflicts: [specific config issues]

## 🔒 AUTHORITY LEVEL:
- ✅ Full SSH diagnostic and repair access
- ✅ Emergency system modifications
- ✅ Service restart and recovery procedures
- ✅ Advanced troubleshooting capabilities
- ✅ Debug SME agent utilization
- ✅ System rollback if necessary

## ✅ SUCCESS CRITERIA:
- Root cause identified and documented
- Issue resolved without system degradation
- Services restored to operational status
- Solution documented for future reference
- System stability confirmed

## 📝 REPORTING REQUIREMENTS:
Use Debug Thread Report Template with:
- Problem diagnosis results
- Root cause analysis findings
- Solution steps implemented  
- System recovery status
- Lessons learned for prevention
- Recommendations for improved reliability

## 🔄 NEXT THREAD: Main Thread (for coordination) → Documentation Thread (for knowledge capture)
```

## 📚 **Documentation Thread Prompt Template**

```markdown
## 📚 THREAD ASSIGNMENT: DOCUMENTATION THREAD
## 📊 PROJECT CONTEXT:
Thread cycle completed: [Main → Reader → Writer → Debug]. Project milestone: [specific achievement].
Knowledge to capture: [learning from this cycle]. Documentation updates required: [specific files].

## ⚡ SPECIFIC TASKS:
### Documentation Updates Required:
- [ ] CURRENT/: Update system state based on thread reports
- [ ] ARCHITECTURE/: Document new patterns from implementation
- [ ] WORKFLOWS/: Record new operational procedures
- [ ] Agent files: Update agent knowledge with new learnings

### Knowledge Synthesis:
- [ ] Best practices identification from thread cycle
- [ ] Pattern recognition from successful implementations  
- [ ] Lessons learned from troubleshooting activities
- [ ] Efficiency improvements for future thread cycles

## 🔒 AUTHORITY LEVEL:
- 🔒 Limited SSH access (verification only)
- ✅ All documentation file modifications
- ✅ Knowledge transfer between agents
- ✅ Documentation agent coordination
- ✅ Best practice cataloging and synthesis
- 🔒 NO system modifications

## ✅ SUCCESS CRITERIA:
- All thread learnings documented accurately
- System state documentation current and accurate
- New patterns added to architecture documentation
- Agent knowledge updated with cycle learnings
- Documentation consistency maintained across hierarchy

## 📝 REPORTING REQUIREMENTS:
Use Documentation Thread Report Template with:
- Documentation files updated
- Knowledge transfer completed
- Best practices identified and cataloged
- System documentation accuracy status
- Recommendations for improved documentation processes

## 🔄 NEXT THREAD: Main Thread (for next project cycle coordination)
```

## 📊 **Standard Report Templates**

### **Reader Thread Report Template**:
```markdown
## 🔍 Reader Status Report - [DATE]
### System Health: ✅/⚠️/❌
- CPU Load: [load average]
- Memory Usage: [percentage used]  
- Storage Status: [ZFS pool health]
- Network Status: [connectivity tests]

### Service Operational Status:
- [Service Name]: ✅/⚠️/❌ [URL/Port] [Evidence]
- [Service Count]: [X]/[Y] services operational

### Verification Results:
- [Claim]: ✅/❌ [Verification evidence]
- [Documentation]: ✅/❌ [Accuracy confirmation]

### Research Findings:
- [Question]: [Answer with supporting data]
- [Investigation]: [Results and implications]

### Issues Requiring Writer Thread Attention:
- [Issue]: [Description and recommended action]

### Next Action Required:
[Specific recommendation for Main Thread task delegation]
```

### **Writer Thread Report Template**:
```markdown
## ⚡ Writer Status Report - [DATE]
### Implementation Completed: [count]
- [Task]: ✅ [Evidence of completion]
- [Service]: ✅ [URL/Port accessible]
- [Configuration]: ✅ [Applied and verified]

### System Changes Applied:
- [Change]: [Description and impact]
- [Service]: [Modified configuration]

### Integration Status:
- [Service]: ✅ [Integration working]
- [Dependency]: ✅ [Connection verified]

### Issues Encountered:
- [Issue]: [Description and resolution]
- [Problem]: [Escalation requirement]

### Next Action Required:
[Recommendation for Main Thread or Debug Thread escalation]
```

## 🔄 **Sequential Workflow Integration**

These prompting standards ensure:
1. **Thread Autonomy**: Each thread has complete task context
2. **Accountability**: Clear success criteria and reporting requirements
3. **Workflow Continuity**: Proper handoffs between threads
4. **Knowledge Retention**: All learnings captured in documentation
5. **Quality Assurance**: Consistent execution standards

**All Main Thread prompt generation MUST use these templates to maintain workflow integrity and production efficiency.**