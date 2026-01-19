# GPU Configuration & Switching

**Last Updated:** January 18, 2026

## Overview

The system has **three GPUs** with two being switchable between host and VM modes:

| GPU | PCI Address | Default Mode | Switched Mode | Consumers |
|-----|-------------|--------------|---------------|-----------|
| **NVIDIA RTX 5070 Ti** | 06:00.0 | Host (nvidia) | VM (vfio) | AI containers, TTS → Windows Gaming |
| **AMD RX 6800 XT** | 03:00.0 | Host (amdgpu) | VM (vfio) | Plex transcoding → Batocera, macOS |
| **Intel UHD 630** | 00:02.0 | Host (i915) | - | Backup/fallback only |

---

## GPU Switch Scripts

### NVIDIA GPU: `/root/nvidia-gpu-switch.sh`

```bash
# Check status
/root/nvidia-gpu-switch.sh status

# Switch to VM mode (Windows gaming)
/root/nvidia-gpu-switch.sh vm
# or
/root/nvidia-gpu-switch.sh gaming

# Switch back to host (AI containers)
/root/nvidia-gpu-switch.sh host
# or
/root/nvidia-gpu-switch.sh ai
```

### AMD GPU: `/root/amd-gpu-switch.sh`

```bash
# Check status
/root/amd-gpu-switch.sh status

# Switch to VM mode (Batocera/macOS)
/root/amd-gpu-switch.sh vm
# or
/root/amd-gpu-switch.sh batocera
# or
/root/amd-gpu-switch.sh macos

# Switch back to host (Plex transcoding)
/root/amd-gpu-switch.sh host
# or
/root/amd-gpu-switch.sh plex
```

---

## Hardware Details

| Component | PCI Address | Device ID | Default Driver |
|-----------|-------------|-----------|----------------|
| RTX 5070 Ti GPU | 0000:06:00.0 | 10de:2c05 | nvidia (switchable) |
| RTX 5070 Ti Audio | 0000:06:00.1 | 10de:22e9 | snd_hda_intel |
| RX 6800 XT GPU | 0000:03:00.0 | 1002:73bf | amdgpu (switchable) |
| RX 6800 XT Audio | 0000:03:00.1 | 1002:ab28 | snd_hda_intel |
| Intel UHD 630 | 0000:00:02.0 | 8086:3e92 | i915 (permanent) |

---

## GPU Consumers

### NVIDIA RTX 5070 Ti

| Mode | Consumer | Access Method |
|------|----------|---------------|
| Host | Ollama | Docker nvidia-container-toolkit |
| Host | GBGreg (CT 120) | LXC device bind |
| Host | TTS/AI containers | `--gpus all` |
| VM | WIN-GAMING (101) | VFIO passthrough |

### AMD RX 6800 XT

| Mode | Consumer | Access Method |
|------|----------|---------------|
| Host | Plex | Docker `/dev/dri` (VA-API) |
| VM | BATOCERA (103) | VFIO passthrough |
| VM | macOS (102) | VFIO passthrough |

### Intel UHD 630

| Mode | Consumer | Access Method |
|------|----------|---------------|
| Host (always) | Backup only | VA-API / QuickSync |

---

## Workflows

### Windows Gaming Session (NVIDIA)

```bash
# 1. Switch NVIDIA GPU to VM mode
/root/nvidia-gpu-switch.sh vm

# 2. Start Windows VM
qm start 101

# 3. Connect display to NVIDIA GPU output
# 4. Game!

# 5. When done - shutdown VM
qm shutdown 101

# 6. Switch NVIDIA back to host for AI
/root/nvidia-gpu-switch.sh host
```

### Batocera Retro Gaming (AMD)

```bash
# 1. Switch AMD GPU to VM mode
/root/amd-gpu-switch.sh vm

# 2. Start Batocera VM
qm start 103

# 3. Connect display to AMD GPU output
# 4. Game!

# 5. When done - shutdown VM
qm shutdown 103

# 6. Switch AMD back to host for Plex
/root/amd-gpu-switch.sh host
```

### macOS with GPU (AMD)

```bash
# Note: Can't run simultaneously with Batocera

# 1. Switch AMD GPU to VM mode
/root/amd-gpu-switch.sh vm

# 2. Start macOS VM (ensure GPU passthrough configured)
qm start 102

# 3. When done
qm shutdown 102
/root/amd-gpu-switch.sh host
```

### Plex Hardware Transcoding (AMD VA-API)

```bash
# Default state - AMD should be on host
/root/amd-gpu-switch.sh status

# If AMD is in VM mode, switch to host
/root/amd-gpu-switch.sh host

# Plex container automatically uses /dev/dri for VA-API
docker ps | grep plex
```

---

## VM Configurations

### Windows Gaming (VM 101) - NVIDIA RTX 5070 Ti
```
hostpci0: 0000:06:00.0,pcie=1,x-vga=1
hostpci1: 0000:06:00.1,pcie=1
cpu: host,hidden=1
args: -cpu host,kvm=on,+hypervisor,+invtsc,hv_vapic,hv_relaxed,hv_spinlocks=0x1fff,hv_vendor_id=proxmox
```

### Batocera (VM 103) - AMD RX 6800 XT
```
hostpci0: 0000:03:00.0,pcie=1,x-vga=1
hostpci1: 0000:03:00.1,pcie=1
bios: seabios
vga: none
```

### macOS (VM 102) - AMD RX 6800 XT (optional)
```
# Add these lines to enable GPU passthrough:
hostpci0: 0000:03:00.0,pcie=1,x-vga=1
hostpci1: 0000:03:00.1,pcie=1
# Remove or comment out: vga: vmware
```

---

## VFIO Configuration

File: `/etc/modprobe.d/vfio.conf`

```bash
# VFIO passthrough configuration
# Updated: January 18, 2026 - Both AMD and NVIDIA are now SWITCHABLE

# AMD RX 6800 XT - SWITCHABLE mode (default: host for Plex VA-API)
# Do NOT permanently bind AMD here
# Use /root/amd-gpu-switch.sh to switch modes

# NVIDIA RTX 5070 Ti - SWITCHABLE mode (default: host for AI containers)
# Do NOT add NVIDIA IDs here
# Use /root/nvidia-gpu-switch.sh to switch modes

# Intel UHD 630 - stays on i915 (backup only)

# LSI HBA - keep on mpt3sas for host storage
softdep mpt3sas pre: vfio-pci
```

**Important:** After changing this file, run `update-initramfs -u` and reboot.

---

## Plex Configuration

Plex uses AMD VA-API for hardware transcoding via `/dev/dri`.

Docker compose location: `/opt/plex/docker-compose.yml`

```yaml
services:
  plex:
    devices:
      - /dev/dri:/dev/dri
```

**Note:** AMD GPU must be on host (`/root/amd-gpu-switch.sh host`) for Plex transcoding.

---

## Troubleshooting

### NVIDIA GPU stuck after Windows VM shutdown
```bash
# Force unbind from vfio
echo "0000:06:00.0" > /sys/bus/pci/drivers/vfio-pci/unbind
echo "0000:06:00.1" > /sys/bus/pci/drivers/vfio-pci/unbind

# Rescan and reload nvidia
echo 1 > /sys/bus/pci/rescan
modprobe nvidia nvidia_uvm nvidia_modeset
```

### AMD GPU stuck after Batocera VM shutdown
```bash
# Force unbind from vfio
echo "0000:03:00.0" > /sys/bus/pci/drivers/vfio-pci/unbind
echo "0000:03:00.1" > /sys/bus/pci/drivers/vfio-pci/unbind

# Rescan and reload amdgpu
echo 1 > /sys/bus/pci/rescan
modprobe amdgpu

# Restart Plex
docker restart plex
```

### Batocera/macOS black screen
- Ensure AMD GPU is in VM mode: `/root/amd-gpu-switch.sh status`
- Check display is connected to **AMD GPU output** (PCI slot 03:00)
- Verify VM has GPU passthrough configured

### Plex not using hardware transcoding
```bash
# Check AMD is on host
/root/amd-gpu-switch.sh status

# Check /dev/dri exists
ls -la /dev/dri/

# Should show card0 (Intel), card1 (AMD), renderD128, renderD129
# If card1/renderD129 missing, AMD is not on host

# Check Plex can see the devices
docker exec plex ls -la /dev/dri/

# Check VA-API in Plex logs
docker logs plex 2>&1 | grep -i vaapi
```

### VM won't start - GPU in use
```bash
# For NVIDIA - check what's using it
lsof /dev/nvidia* 2>/dev/null
docker stop ollama  # or other GPU containers
pct stop 120        # GBGreg container
/root/nvidia-gpu-switch.sh vm

# For AMD - check Plex
docker stop plex
/root/amd-gpu-switch.sh vm
```

---

## Quick Reference

| Task | Command |
|------|---------|
| **NVIDIA Status** | `/root/nvidia-gpu-switch.sh status` |
| NVIDIA → Windows VM | `/root/nvidia-gpu-switch.sh vm && qm start 101` |
| NVIDIA → Host/AI | `/root/nvidia-gpu-switch.sh host` |
| **AMD Status** | `/root/amd-gpu-switch.sh status` |
| AMD → Batocera VM | `/root/amd-gpu-switch.sh vm && qm start 103` |
| AMD → macOS VM | `/root/amd-gpu-switch.sh vm && qm start 102` |
| AMD → Host/Plex | `/root/amd-gpu-switch.sh host` |
| Check NVIDIA | `nvidia-smi` |
| Check AMD | `lspci -k -s 03:00.0` |
| Check VA-API | `vainfo` |

---

## Architecture Diagram

```
                    ┌─────────────────────────────────────────┐
                    │           PROXMOX HOST                  │
                    └─────────────────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│ NVIDIA 5070 Ti  │         │  AMD RX 6800 XT │         │  Intel UHD 630  │
│   PCI 06:00     │         │    PCI 03:00    │         │    PCI 00:02    │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ DEFAULT: nvidia │         │ DEFAULT: amdgpu │         │  ALWAYS: i915   │
│ SWITCH: vfio    │         │ SWITCH: vfio    │         │                 │
└────────┬────────┘         └────────┬────────┘         └────────┬────────┘
         │                           │                           │
    ┌────┴────┐                 ┌────┴────┐                      │
    │         │                 │         │                      │
    ▼         ▼                 ▼         ▼                      ▼
┌───────┐ ┌───────┐       ┌───────┐ ┌───────┐             ┌───────────┐
│Ollama │ │ WIN   │       │ Plex  │ │BATOC. │             │  Backup   │
│GBGreg │ │GAMING │       │VA-API │ │macOS  │             │  Display  │
│  TTS  │ │VM 101 │       │Docker │ │VM 102 │             │           │
└───────┘ └───────┘       └───────┘ │VM 103 │             └───────────┘
  HOST      VFIO            HOST    └───────┘
                                      VFIO
```
