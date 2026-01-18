# GPU Configuration & Switching

**Last Updated:** January 18, 2026

## Overview

The system has **two GPUs** with different purposes:

| GPU | PCI Address | Purpose | Mode |
|-----|-------------|---------|------|
| **NVIDIA RTX 5070 Ti** | 06:00.0 | Windows Gaming + AI workloads | Shared (switch between host/VM) |
| **AMD RX 6800 XT** | 03:00.0 | Batocera retro gaming | Permanent VFIO passthrough |

---

## GPU Assignments

### NVIDIA RTX 5070 Ti (Shared)
- **Host/AI Mode**: nvidia driver for containers (Ollama, GBGreg)
- **Windows Gaming Mode**: VFIO passthrough to VM 101
- **Requires switching** via `/root/gpu-switch.sh`

### AMD RX 6800 XT (Dedicated)
- **Permanently bound to VFIO** for Batocera VM 103
- **No switching needed** - always available for Batocera
- Connect display directly to AMD GPU for Batocera output

---

## Hardware Details

| Component | PCI Address | Device ID | Driver |
|-----------|-------------|-----------|--------|
| RTX 5070 Ti GPU | 0000:06:00.0 | 10de:2d07 | nvidia (shared) |
| RTX 5070 Ti Audio | 0000:06:00.1 | 10de:22e9 | nvidia/vfio |
| RX 6800 XT GPU | 0000:03:00.0 | 1002:73bf | vfio-pci (permanent) |
| RX 6800 XT Audio | 0000:03:00.1 | 1002:ab28 | vfio-pci (permanent) |
| Intel UHD 630 | 0000:00:02.0 | 8086:3e92 | i915 (Plex QuickSync) |

---

## NVIDIA GPU Switch Script

Location: `/root/gpu-switch.sh`

**Only use this for NVIDIA GPU switching (Windows gaming).**

### Usage

```bash
# Check current NVIDIA GPU status
/root/gpu-switch.sh status

# Switch NVIDIA to Windows VM mode
/root/gpu-switch.sh vm
# or
/root/gpu-switch.sh gaming

# Switch NVIDIA back to Host/AI mode
/root/gpu-switch.sh host
# or
/root/gpu-switch.sh ai
```

---

## Workflows

### Windows Gaming Session (NVIDIA)

```bash
# 1. Switch NVIDIA GPU to VM mode
/root/gpu-switch.sh vm

# 2. Start Windows VM
qm start 101

# 3. Connect display to NVIDIA GPU output
# 4. Game!

# 5. When done - shutdown VM
qm shutdown 101

# 6. Switch NVIDIA back to host for AI
/root/gpu-switch.sh host
```

### Batocera Retro Gaming (AMD)

```bash
# No switching needed - AMD is always ready

# Just start the VM
qm start 103

# Connect display to AMD GPU output
# Game!

# Shutdown when done
qm shutdown 103
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

### Hackintosh (VM 102) - No GPU (uses vmware vga)
```
vga: vmware
```

---

## VFIO Configuration

File: `/etc/modprobe.d/vfio.conf`

```bash
# AMD RX 6800 XT - PERMANENT passthrough for Batocera
options vfio-pci ids=1002:73bf,1002:ab28
softdep amdgpu pre: vfio-pci

# NVIDIA RTX 5070 Ti - SHARED mode
# Stays on nvidia driver by default for AI containers
# Use gpu-switch.sh to bind to vfio for Windows gaming
# Do NOT add NVIDIA IDs here

# Intel UHD 630 - stays on i915 for Plex QuickSync
```

---

## GPU Consumers

### NVIDIA RTX 5070 Ti
| Mode | Consumer | Access |
|------|----------|--------|
| Host | GBGreg (CT 120) | LXC device bind |
| Host | Ollama | Docker nvidia-container-toolkit |
| Host | Any container | `--gpus all` |
| VM | WIN-GAMING (101) | VFIO passthrough |

### AMD RX 6800 XT
| Mode | Consumer | Access |
|------|----------|--------|
| VM (always) | BATOCERA (103) | VFIO passthrough |

### Intel UHD 630
| Mode | Consumer | Access |
|------|----------|--------|
| Host (always) | Plex | VA-API / QuickSync |

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

### Batocera black screen
- Check that display is connected to **AMD GPU output** (not NVIDIA)
- AMD GPU is at PCI slot 03:00 (usually second GPU slot on motherboard)

### VM won't start - NVIDIA GPU in use
```bash
# Check what's using NVIDIA
lsof /dev/nvidia* 2>/dev/null

# Stop GPU containers
docker stop ollama
pct stop 120

# Then switch to VM mode
/root/gpu-switch.sh vm
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Check NVIDIA status | `/root/gpu-switch.sh status` |
| NVIDIA → Windows VM | `/root/gpu-switch.sh vm && qm start 101` |
| NVIDIA → Host/AI | `/root/gpu-switch.sh host` |
| Start Batocera | `qm start 103` (no switch needed) |
| Stop Batocera | `qm shutdown 103` |
| Verify NVIDIA on host | `nvidia-smi` |
