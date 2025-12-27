# Git Workflow: Gemini-Assisted Trunk-Based Development

## Overview
This project utilizes a **Trunk-Based Development** model, assisted by the Gemini AI. The complex 5-thread `git worktree` system has been deprecated in favor of a simpler, more streamlined approach using short-lived feature branches.

## Core Principles
*   **`main` is the Trunk**: The `main` branch is the single source of truth. It should always be stable and deployable.
*   **Short-Lived Feature Branches**: All new work, including features, bugfixes, and documentation, is done on a temporary branch created from `main`.
*   **AI-Assisted Development**: The Gemini assistant is leveraged for creating and developing on branches.
*   **User-Managed Merges**: The user reviews all changes and is responsible for merging the completed feature branches back into `main` via Pull Requests.

## The Workflow Protocol
1.  **Create a Feature Branch**: For any new task, a new branch is created from `main`.
    *   Example: `git checkout -b feature/add-dark-mode`
2.  **Develop on the Branch**: All work is performed on this isolated branch. The Gemini assistant can be instructed to perform file modifications, run commands, and install dependencies.
3.  **Prepare for Pull Request**: Once the work is complete and tested, the branch is pushed to the remote repository.
    *   Example: `git push -u origin feature/add-dark-mode`
    *   Gemini can assist in summarizing the changes for the Pull Request description.
4.  **Review and Merge**: The user creates a Pull Request in the Git hosting platform (e.g., GitHub, GitLab). After review, the user merges the branch into `main`.
5.  **Clean Up**: The feature branch is deleted after the merge.

This model simplifies the development process, eliminates the need for complex sync scripts like `claude_threads.sh`, and aligns with modern DevOps best practices.
