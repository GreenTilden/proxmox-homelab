# Proxmox Homelab Project Guide

**This document is the former project guide and has been refactored.**

The project's documentation has been broken down into smaller, more focused documents and is now maintained in a centralized location.

## Key Documents

*   **[📚 MASTER INDEX](./docs/UNIFIED-REFERENCE/MASTER-INDEX.md)**: The primary navigation hub for all project documentation. This is the best place to start.

*   **[📄 Core Principles](./docs/UNIFIED-REFERENCE/PROJECT_MANAGEMENT/CORE_PRINCIPLES.md)**: The fundamental rules and guiding principles of the project.

*   **[⚙️ 5-Thread Workflow](./docs/UNIFIED-REFERENCE/PROJECT_MANAGEMENT/5_THREAD_WORKFLOW.md)**: A detailed explanation of the 5-thread execution model.

*   **[🏗️ Services Overview](./docs/UNIFIED-REFERENCE/ARCHITECTURE/SERVICES_OVERVIEW.md)**: An overview of all deployed services and their architecture.

*   **[💾 Hardware Overview](./docs/UNIFIED-REFERENCE/ARCHITECTURE/HARDWARE_OVERVIEW.md)**: Details on the physical hardware and storage setup.

All detailed project information has been moved to the `docs/UNIFIED-REFERENCE/` directory. This file remains as a historical marker and entry point.

## Development Environment

### Frontend (Vue Dashboard)

The frontend is developed and served from **192.168.0.250** (not locally).

- **Source location**: `root@192.168.0.250:/var/www/vue-frontend/`
- **Edit files directly via SSH**: `ssh root@192.168.0.250` then edit in `/var/www/vue-frontend/src/`
- **Build after changes**: `cd /var/www/vue-frontend && npm run build`
- **Served by nginx** from `/var/www/vue-frontend/dist/`
- **Code-server available** at `http://192.168.0.250:8081` (no password)

When making frontend changes, always edit files on 192.168.0.250 directly, not the local copy.

## SSH Access

Use the configured SSH aliases for quick access:

```bash
ssh proxmox        # Proxmox host (192.168.0.99)
ssh frontend       # Frontend server (192.168.0.250) - if configured
```

SSH config is at `~/.ssh/config`.
