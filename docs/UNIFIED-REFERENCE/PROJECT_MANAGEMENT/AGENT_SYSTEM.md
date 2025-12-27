# AI-Assisted Workflow & Agent System

## Overview
This project leverages the Gemini AI assistant to streamline development, automate tasks, and maintain documentation. The workflow is interactive and collaborative, using Gemini's capabilities to enhance productivity.

## Core Philosophy
*   **Interactive Partnership**: The user and Gemini work together. The user sets the high-level goals, and Gemini handles the detailed execution.
*   **Dynamic Planning**: Rigid, pre-defined plans are replaced with flexible task lists (`write_todos`) that can adapt to new information.
*   **Tool-Augmented AI**: Gemini is equipped with tools (`run_shell_command`, `read_file`, `write_file`, etc.) to directly interact with the project and its environment.

## Agent Delegation Model
For complex tasks requiring deep analysis or specialized knowledge, the primary Gemini assistant can delegate to sub-agents. This is analogous to a senior developer assigning a task to a junior developer with a specific skillset.

*   **Invocation**: `delegate_to_agent(agent_name="<name>", objective="<detailed_objective>")`
*   **Available Agents**:
    *   **`codebase_investigator`**: Performs deep static analysis of the codebase to understand architecture, dependencies, and identify key files related to a task. This is used for planning large changes or diagnosing complex bugs.

## Knowledge Management
Instead of relying on a complex system of persistent and disposable agent-specific documentation, knowledge is managed through:

*   **Centralized Documentation**: The `docs/UNIFIED-REFERENCE/` directory serves as the single source of truth for all project information. This documentation is updated by the AI as changes are made.
*   **Conversational History**: The chat history with the Gemini assistant serves as a log of decisions, experiments, and outcomes.

This model simplifies the previous "5-Thread" system, eliminates the need for manual knowledge transfer between agents, and keeps the project documentation continuously up-to-date.
