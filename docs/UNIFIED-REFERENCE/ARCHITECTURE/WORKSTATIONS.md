# Workstation Architecture & Deployment Guide

This document tracks the deployment and configuration of "Heavy" workstation nodes (VMs) in the homelab, distinct from the lightweight LXC service containers.

## Storage Architecture for VMs

Based on hardware analysis (January 2026), the storage hierarchy is:

| Pool Name | Physical Media | Speed Class | Use Case |
|-----------|---------------|-------------|----------|
| **local-lvm** | NVMe (HP EX920) | **Tier 1 (Fastest)** | OS Boot Drives (Windows/macOS), High-IOPS tasks. |
| **service-pool** | SATA SSD (PNY 250GB) | **Tier 2 (Fast)** | Secondary VM disks, scratch space, models, databases. |
| **media-pool** | SATA HDDs (Mix of 4TB/2TB) | **Tier 3 (Slow/Mass)** | Bulk storage, backups, media files. |

**Strategy:**
- **Boot:** Always install the VM OS on `local-lvm` (NVMe) for best responsiveness.
- **Data:** Attach a second virtual disk from `service-pool` or `media-pool` depending on speed requirements.

## Workstation Nodes

### 1. macOS (Sequoia / Latest)
*   **Purpose:** Development, Code Review, Testing.
*   **Infrastructure:**
    *   **VM ID:** TBD (Target: 130)
    *   **CPU:** Host Passthrough (Intel)
    *   **RAM:** 16GB+
    *   **GPU:** VirtIO-GPU (Initial) -> **Intel UHD 630 (Passthrough)**
        *   *Hardware Discovery:* The host has an Intel UHD 630 (iGPU) and an NVIDIA RTX 5070 Ti.
        *   *Constraint:* macOS does **not** support modern NVIDIA RTX cards.
        *   *Strategy:* Pass through the Intel UHD 630 for macOS Metal acceleration. This will speed up the UI and animations, even if accessed via RustDesk.
*   **Remote Access (RustDesk):**
    *   Since macOS running in a VM can have display quirks with standard VNC/Spice, we use **RustDesk**.
    *   **Self-Hosted Server:** `/opt/rustdesk-server/` on Proxmox
        *   `hbbs` (ID server): Port 54011 (TCP/UDP), 21115, 21118
        *   `hbbr` (relay server): Port 54012, 21119
    *   **Client Setup:**
        *   Install RustDesk Client on VMs and workstations
        *   Configure ID Server: `192.168.0.99:54011` (internal) or `darrenarney.com:54011` (external)
        *   Relay Server: `192.168.0.99:54012` (internal) or `darrenarney.com:54012` (external)
        *   Public key: Found in `/opt/rustdesk-server/rustdesk-data/id_ed25519.pub`

### 2. Gaming & AI Workstation (Dual Boot Node)
*   **Strategy:** "Scenario B" - Shared Hardware, Distinct Roles.
    *   This node will dual-boot between **Windows 11** (Gaming) and **Linux** (AI/Inference).
    *   **Rationale:** Maximizes performance for both use cases. The RTX 5070 Ti is passed through exclusively to whichever OS is running.
*   **Infrastructure:**
    *   **VM ID:** 140 (Windows 11) / 141 (Linux AI)
    *   **GPU:** **NVIDIA RTX 5070 Ti (Passthrough)**
        *   The card is isolated from the host (vfio-pci) and attached to the active VM.
    *   **Storage:**
        *   **Windows:** `local-lvm` (C:\), `service-pool` (D:\ Games).
        *   **Linux:** `local-lvm` (Root), `service-pool` (Models/Cache).

## Deployment Tools
*   **macOS Script:** `luchina-gabriel/OSX-PROXMOX` (Located at `/root/macos-install` on host).
    *   *Status:* Dependencies patched on host. Ready for execution.
*   **IOMMU Status:** Enabled (`intel_iommu=on iommu=pt` verified in kernel args).
