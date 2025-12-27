# Project Workflows

## Current Workflow: Gemini Interactive Model

This project is now developed and maintained using an interactive, iterative workflow with the Gemini AI assistant. This model prioritizes direct collaboration, real-time feedback, and adaptive planning, moving away from a rigidly sequential, multi-threaded system.

### Key Principles

*   **Interactive Collaboration**: Direct, conversational engagement with the Gemini assistant for task execution, problem-solving, and decision-making.
*   **Adaptive Planning with `write_todos`**: Task planning and progress tracking are managed through a dynamic `write_todos` list, allowing for flexibility and real-time adjustments.
*   **Iterative Development Loop**: A continuous cycle of:
    1.  **Proposal**: Gemini suggests a course of action based on the user's request.
    2.  **Execution**: Gemini uses its tools (e.g., `read_file`, `replace`, `run_shell_command`) to perform the task.
    3.  **Review & Feedback**: The user reviews the output and provides feedback, guiding the next iteration.
*   **Documentation-First Approach**: Changes to documentation are prioritized before corresponding code modifications, ensuring the "single source of truth" remains accurate and up-to-date.
*   **Specialized Agent Delegation**: For complex analysis, architectural insights, or root-cause identification, Gemini can delegate tasks to specialized sub-agents (e.g., `codebase_investigator`), streamlining deep-dive investigations.
*   **Contextual Awareness**: The workflow leverages Gemini's ability to maintain context across multiple prompts, facilitating the development of complex features through a series of focused interactions.

### Workflow Protocol

1.  **Define Objective**: User states a clear objective (e.g., add feature, fix bug, refactor).
2.  **Plan & Track (with `write_todos`)**: Gemini proposes a detailed plan, broken down into manageable sub-tasks, and tracks progress using `write_todos`.
3.  **Execute & Iterate**: Gemini executes sub-tasks, presenting results for user review and feedback at each significant step.
4.  **Documentation Update**: Relevant documentation is updated *before* or *concurrently* with code changes.
5.  **Verification**: Changes are verified through testing, linting, and adherence to project standards.
6.  **Finalization**: Task is considered complete upon user approval.

This interactive model fosters a highly efficient and transparent development process, ensuring continuous alignment with project goals and user intent.

---

## Legacy Workflow: 5-Thread Claude Code Execution Model (Historical Reference)

This project EXCLUSIVELY uses a 5-thread Claude Code execution model with SEQUENTIAL workflow processing.

**NEVER work outside this model.** All development, research, and implementation MUST use the specialized Claude Code instances:

- **🎯 Main Thread (Opus)**: Orchestration, task delegation, sequential workflow coordination
- **🔍 Reader Thread (Sonnet)**: System verification, research, status analysis  
- **⚡ Writer Thread (Opus)**: Infrastructure implementation, deployments, system modifications
- **🔧 Debug Thread (Opus)**: Advanced troubleshooting, complex problem resolution
- **📚 Documentation Thread (Sonnet)**: Knowledge synthesis, documentation updates

**Sequential Workflow Protocol**: `Main → Reader → Writer → Debug (if needed) → Documentation → Main`

**Every thread execution MUST follow prompting standards and generate structured reports for the next thread in sequence.**

### Thread Status Reporting Integration
**Standard Template for All Thread Reports:**
```
## Current 5-Thread Execution Status
- **🎯 Main (Opus)**: [orchestration task]
- **🔍 Reader (Sonnet)**: [verification task]  
- **⚡ Writer (Opus)**: [implementation task]
- **🔧 Debug (Opus)**: [troubleshooting status]
- **📚 Documentation (Sonnet)**: [knowledge synthesis task]

## Sequential Workflow Position: [Current thread in sequence]
## Next Thread Handoff: [Target thread for next prompt]
```

**Use orchestrated commands ONLY:**
- `./scripts/claude_threads.sh status-all` - Comprehensive status
- `./scripts/claude_threads.sh reader` - Research session
- `./scripts/claude_threads.sh writer` - Implementation session
- `./scripts/claude_threads.sh sync-all` - Coordinate all branches

### Orchestrated Multi-Thread Workflow

#### Thread Coordination Strategy
**Main Branch** acts as orchestration hub:
- Coordinates between all worktrees
- Consolidates status reports from reader/writer threads
- Assigns tasks to appropriate branches
- Maintains project-wide documentation and priorities

#### Status Reporting Protocol
Each thread reports to main branch using standardized format:

#### Thread Status Report Format

**🎯 Main Thread Coordination**:
```
## Current Worktree Thread Status  
- 🎯 **Main**: [current coordination task]
- 🔍 **Reader**: [current research/status task]  
- ⚡ **Writer**: [current implementation task]
- 🚀 **Active Features**: [list active feature branches]

## Task Delegation
🔍 **Reader Analysis Required**: [diagnostic tasks]
⚡ **Writer Implementation Required**: [deployment tasks] 
🚀 **Feature Development**: [specialized work]
```

**🔍 Reader Thread Reports**:
```
## 🔍 Reader Status Report - [DATE]
### System Health: ✅/⚠️/❌
- CPU Load: [current load average]
- Memory Usage: [usage percentage]  
- ZFS Pools: [pool health status]

### Service Status: ✅/⚠️/❌
- Proxmox: [interface accessible/issues]
- Grafana: [dashboard operational/issues]
- FileBrowser: [working/permission issues]

### Research Findings:
- [Key discoveries or status changes]
```

**⚡ Writer Thread Reports**:
```  
## ⚡ Writer Status Report - [DATE]
### Implementations Completed: [count]
- [List of completed tasks]

### In Progress: [count]  
- [Current implementation work]

### Blockers: [count]
- [Issues preventing progress]

### Next Priority:
- [Next task to be implemented]
```

#### Real-Time Thread Activity Visibility
Every response should include thread identifier when work is performed:
- 🎯 **Main**: Coordinating task X
- 🔍 **Reader**: Analyzing logs for service Y  
- ⚡ **Writer**: Deploying container Z
- 🚀 **Feature**: Implementing feature W

#### Task Distribution Matrix

| Task Type | Assigned Thread | Rationale |
|-----------|----------------|-----------|
| System Status Checks | Reader | Read-only operations, efficient |
| Interface Exploration | Reader | Research and documentation |
| Container Deployments | Writer | System modifications required |
| GPU Configuration | Writer | Hardware changes needed |
| Documentation Updates | Main | Cross-cutting concerns |
| Feature Development | Feature Branch | Isolated development |

#### Coordination Commands
```bash
# Status consolidation from main branch
./scripts/claude_threads.sh status-all    # All worktree status
./scripts/claude_threads.sh report        # Generate consolidated report
./scripts/claude_threads.sh sync-all      # Sync all branches

# Thread-specific operations
./scripts/claude_threads.sh reader        # Switch to reader
./scripts/claude_threads.sh writer        # Switch to writer  
- ./scripts/claude_threads.sh feature [name] # Create/switch feature branch
```
