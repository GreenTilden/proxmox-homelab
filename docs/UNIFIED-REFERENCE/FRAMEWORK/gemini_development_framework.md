# Gemini Development Framework

This document outlines the operational framework for developing and maintaining the Proxmox homelab with the assistance of the Gemini AI. It supersedes previous workflow documentation and integrates best practices for AI-assisted development, documentation maintenance, and project quality assurance.

## 1. Gemini Interactive Model

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

## 2. Git Workflow: Gemini-Assisted Trunk-Based Development
[Content will be moved from OPERATIONS/GIT_WORKTREE_STRATEGY.md]

## 3. Documentation Maintenance & Quality Assurance

Maintaining high-quality, up-to-date documentation is paramount to the long-term success and clarity of this project. The following principles and practices are integrated into the Gemini development framework to ensure our documentation remains a reliable "single source of truth."

### Core Principles for Documentation
*   **Single Source of Truth**: All primary project documentation resides within `/docs/UNIFIED-REFERENCE/`. No critical information should exist outside this structure.
*   **End-of-Task Review**: Every significant task or feature implementation will conclude with a review of relevant documentation to ensure accuracy and completeness.
*   **Automated Validation (Planned)**: Future iterations of this framework will explore automated checks for documentation integrity, including broken links and detection of scattered documents.
*   **Quality Standards**:
    *   **Completeness**: All essential procedures, configurations, and decisions are documented.
    *   **Accuracy**: Information is verified against the actual system implementation and current operational state.
    *   **Consistency**: All essential procedures, configurations, and decisions are documented.
    *   **Accuracy**: Information is verified against the actual system implementation and current operational state.
    *   **Consistency**: A uniform style, formatting, and organization pattern is maintained across all documents.
    *   **Accessibility**: Documentation is easy to navigate through `MASTER-INDEX.md` and contains functional links.
    *   **Maintenance**: Documentation is regularly reviewed, updated, and archived to prevent drift.

### Prevention Protocols
*   **Centralized Creation**: All new documentation files are created within `UNIFIED-REFERENCE` structure.
*   **Reference Unified Sources**: All cross-references and internal links point to documents within `UNIFIED-REFERENCE`.
*   **Archival**: Obsolete or historical documents are moved to the `ARCHIVE/` directory with proper dating and rationale.

## 4. Task Categorization & Streamlined Execution

To ensure efficient and targeted development, tasks are categorized and executed through a streamlined process, adapting the "Point Update" philosophy to the Gemini interactive model.

### Task Categories
*   **Performance Optimization**: Focus on fine-tuning existing capabilities for enhanced efficiency (e.g., improving response times, optimizing resource utilization).
*   **User Experience Enhancement**: Focus on interface improvements and workflow streamlining (e.g., UI refinements, accessibility).
*   **Integration & Expansion**: Focus on adding complementary capabilities (e.g., external API connections, new service integrations).
*   **Maintenance & Reliability**: Focus on system health, long-term operational excellence, and documentation updates (e.g., health checks, backups, security).

### Streamlined Execution Protocol (3-Phase Process)
Every task, regardless of category, follows a lightweight, iterative 3-phase process:

**Phase 1: Assessment & Planning** (Gemini-Assisted)
*   **Current State Analysis**: Gemini assists in validating system performance and identifying optimization opportunities.
*   **Impact Assessment**: Gemini helps determine the scope and potential interactions with existing functionality.
*   **Success Criteria Definition**: Clearly define measurable outcomes for the task.
*   **Risk Evaluation**: Identify potential issues and rollback procedures.
*   **Tools**: `write_todos` for planning, `read_file`, `run_shell_command` for analysis.

**Phase 2: Implementation** (Gemini-Assisted)
*   **Targeted Implementation**: Gemini performs specific improvements or implements new features.
*   **Incremental Testing**: Changes are validated during implementation to prevent regression.
*   **Performance Monitoring**: Baselines are maintained or improved.
*   **User Experience Validation**: Improvements meet defined success criteria.
*   **Tools**: `replace`, `write_file`, `run_shell_command` for code modifications and execution.

**Phase 3: Validation & Documentation** (Gemini-Assisted & User Review)
*   **Comprehensive Testing**: Gemini assists in validating task success without system regression.
*   **Performance Verification**: Confirm all baseline metrics maintained or improved.
*   **Documentation Update**: Gemini updates relevant sections of the `UNIFIED-REFERENCE` with task details and outcomes.
*   **Knowledge Transfer**: Lessons learned and new patterns are integrated into the framework documentation.
*   **User Review**: The user provides final validation of the implemented changes and documentation.
*   **Tools**: `notion_updater.py` for external logging, `read_file` for verification, `write_file` for documentation.

