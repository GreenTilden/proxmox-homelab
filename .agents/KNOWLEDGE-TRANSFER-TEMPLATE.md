# Agent Knowledge Transfer Template

## Overview
This template defines the workflow for transferring knowledge between disposable project agents and persistent SME agents when project goals are completed.

## Transfer Workflow Process

### Phase 1: Pre-Transfer Assessment
**Timing**: When disposable agent nears project completion
**Responsible**: Disposable Agent + Main Thread Coordination

#### Checklist
- [ ] **Project Objectives Complete**: All disposable agent tasks marked as done
- [ ] **Implementation Documented**: Configuration changes and decisions recorded
- [ ] **Issues Catalog**: Problems encountered and solutions documented
- [ ] **Performance Metrics**: Baseline measurements and improvements noted

### Phase 2: Knowledge Extraction
**Timing**: Upon project completion
**Responsible**: Disposable Agent

#### System-Wide Insights to Extract
1. **Architecture Patterns**
   - Configuration approaches that worked vs failed
   - Integration patterns with existing services
   - Storage and network architecture decisions
   - Container vs LXC deployment considerations

2. **Monitoring & Alerting**
   - New metrics that should be tracked
   - Alert thresholds discovered during implementation
   - Dashboard panel configurations needed
   - Performance monitoring patterns

3. **Security & Access**
   - Authentication configurations
   - Network security considerations
   - Container permission requirements
   - GPU/hardware passthrough security

4. **Troubleshooting Knowledge**
   - Common failure modes encountered
   - Debugging approaches that worked
   - Log file locations and analysis techniques
   - Recovery procedures for service failures

### Phase 3: Persistent Agent Updates
**Timing**: After knowledge extraction
**Responsible**: Persistent SME Agents

#### Dashboard Agent Updates
- **New Service Integration**: Add monitoring for new services deployed
- **Alert Threshold Learning**: Update based on observed performance patterns
- **Dashboard Panel Creation**: Add panels for new metrics discovered
- **Mobile Optimization**: Ensure new services work on mobile interfaces

#### Infrastructure Agent Updates (Future)
- **Deployment Patterns**: Add successful deployment templates
- **Hardware Configuration**: Update GPU, storage, network patterns
- **Security Baselines**: Incorporate new security configurations
- **Automation Scripts**: Add new maintenance and monitoring scripts

### Phase 4: Next Project Agent Creation
**Timing**: When starting new project goal
**Responsible**: Main Thread + New Disposable Agent

#### Context Inheritance Template
```markdown
## Inherited Knowledge (From Previous Projects)

### From Persistent Agents
- **Monitoring Patterns**: [Dashboard Agent learnings]
- **Infrastructure Standards**: [System architecture decisions]
- **Security Baseline**: [Authentication and access patterns]

### From Previous Disposable Agents
- **[Previous Project Name]**: 
  - **Key Learnings**: [Successful approaches]
  - **Avoid Patterns**: [Failed approaches to avoid]
  - **Integration Points**: [How this connects to other services]

### Current System Context
- **Active Services**: [List of operational services]
- **Hardware Status**: [GPU, storage, network availability]
- **Monitoring Baseline**: [Current Grafana dashboard status]
```

## Documentation Requirements

### Disposable Agent Archive Format
```markdown
# [Agent Name] - ARCHIVED [DATE]

## Project Summary
- **Goal**: [What was accomplished]
- **Duration**: [Project timeline]
- **Success Metrics**: [Measurable outcomes]

## Implementation Details
- **Configuration Changes**: [Files modified, settings changed]
- **Integration Points**: [How service connects to existing infrastructure]
- **Testing Results**: [Performance metrics, validation tests]

## Knowledge Transfer
- **To Dashboard Agent**: [Monitoring insights transferred]
- **To Documentation**: [Architecture decisions recorded]
- **To Future Agents**: [Patterns to reuse or avoid]

## Lessons Learned
- **Success Factors**: [What made this project successful]
- **Challenge Resolution**: [How problems were solved]
- **Recommendations**: [Advice for similar future projects]
```

### Persistent Agent Evolution Tracking
```markdown
## Agent Evolution Log

### [Date] - [Project] Knowledge Integration
- **New Capabilities**: [Skills/knowledge added]
- **Updated Monitoring**: [New metrics or thresholds]
- **Pattern Recognition**: [Behavioral patterns learned]
- **Decision Improvements**: [Better decision-making criteria]
```

## Quality Gates

### Knowledge Transfer Completion Criteria
- [ ] **Disposable Agent Archived**: Complete documentation with lessons learned
- [ ] **Persistent Agents Updated**: New knowledge integrated into ongoing operations
- [ ] **Documentation Current**: CLAUDE.md reflects new system state
- [ ] **Next Agent Ready**: New disposable agent created with inherited context
- [ ] **Monitoring Integrated**: New services appear in Grafana with proper dashboards

### Success Metrics
1. **Knowledge Retention**: Future agents reference and build on previous learnings
2. **Implementation Speed**: New projects start faster due to inherited patterns
3. **Quality Improvement**: Fewer repeated mistakes across projects
4. **Monitoring Coverage**: All services maintain proper dashboard integration
5. **Documentation Currency**: Project state accurately reflected in documentation

## Integration with Worktree System

### Thread Responsibilities
- **🎯 Main Thread**: Coordinates knowledge transfer sessions, updates CLAUDE.md
- **🔍 Reader Thread**: Archives disposable agents, validates documentation
- **⚡ Writer Thread**: Updates persistent agent configurations
- **🚀 Feature Threads**: Create new disposable agents with inherited context

### Automation Opportunities
- **Pre-commit Hooks**: Automatic documentation updates during transfers
- **Agent Status Tracking**: Monitor agent effectiveness over time
- **Knowledge Base Search**: Quick reference for inherited patterns
- **Template Generation**: Automated disposable agent creation with context