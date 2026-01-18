# GPU Switching Workflow

**Last Updated:** January 18, 2026

## Overview

The RTX 5070 Ti operates in **shared mode** - it can be used by either:
- **Host/AI Mode**: NVIDIA driver on host, accessible by containers (Ollama, GBGreg CT 120)
- **VM/Gaming Mode**: VFIO passthrough to Windows VM 101 or Batocera VM 103

Only one mode can be active at a time.

---

## Current Hardware

| Component | PCI Address | Device ID |
|-----------|-------------|-----------|
| RTX 5070 Ti GPU | 0000:06:00.0 | 10de:2d07 |
| RTX 5070 Ti Audio | 0000:06:00.1 | 10de:22e9 |

**Driver Version:** 590.48.01 (CUDA 13.1)

---

## GPU Switch Script

Location: `/root/gpu-switch.sh`

### Usage

```bash
# Check current GPU status
/root/gpu-switch.sh status

# Switch to VM/Gaming mode (unbind nvidia, bind vfio)
/root/gpu-switch.sh vm
# or
/root/gpu-switch.sh gaming

# Switch back to Host/AI mode (unbind vfio, load nvidia)
/root/gpu-switch.sh host
# or
/root/gpu-switch.sh ai
```

---

## Workflows

### Starting a Gaming Session (Windows or Batocera)

```bash
# 1. Switch GPU to VM mode
/root/gpu-switch.sh vm

# 2. Start the VM
qm start 101    # Windows Gaming
# or
qm start 103    # Batocera

# 3. Connect via Proxmox console, SPICE, or physical display
```

### Ending Gaming Session

```bash
# 1. Shutdown the VM (from inside the OS or force stop)
qm shutdown 101    # graceful
# or
qm stop 101        # force

# 2. Switch GPU back to host
/root/gpu-switch.sh host

# 3. GPU is now available for AI workloads
nvidia-smi    # verify
```

---

## GPU Consumers by Mode

### Host/AI Mode (nvidia driver)
| Consumer | Type | Access Method |
|----------|------|---------------|
| GBGreg (CT 120) | LXC | Device bind mounts |
| Ollama | Docker | nvidia-container-toolkit |
| Any host container | Docker | `--gpus all` flag |

### VM/Gaming Mode (vfio-pci)
| Consumer | VM ID | Purpose |
|----------|-------|---------|
| WIN-GAMING | 101 | Windows 11 gaming |
| BATOCERA | 103 | Retro gaming |
| HACK-SEQUOIA | 102 | macOS (if GPU added) |

---

## LXC GPU Passthrough (GBGreg Style)

For containers that need GPU access in Host mode, add to LXC config:

```
# /etc/pve/lxc/120.conf
lxc.cgroup2.devices.allow: c 195:* rwm
lxc.cgroup2.devices.allow: c 509:* rwm
lxc.cgroup2.devices.allow: c 234:* rwm
lxc.mount.entry: /dev/nvidia0 dev/nvidia0 none bind,optional,create=file
lxc.mount.entry: /dev/nvidiactl dev/nvidiactl none bind,optional,create=file
lxc.mount.entry: /dev/nvidia-uvm dev/nvidia-uvm none bind,optional,create=file
lxc.mount.entry: /dev/nvidia-uvm-tools dev/nvidia-uvm-tools none bind,optional,create=file
lxc.mount.entry: /dev/nvidia-modeset dev/nvidia-modeset none bind,optional,create=file
```

Container must have `features: nesting=1` enabled.

---

## VFIO Configuration

File: `/etc/modprobe.d/vfio.conf`

```bash
# NVIDIA RTX 5070 Ti - shared mode
# Manually unbind for Windows gaming VM when needed
# Do NOT add to vfio-pci ids= for auto-bind at boot

# AMD RX 6800 XT - permanent passthrough (if present)
options vfio-pci ids=1002:73bf,1002:ab28
softdep amdgpu pre: vfio-pci
```

The RTX 5070 Ti is **not** in the vfio-pci ids because we want it on the nvidia driver by default.

---

## Troubleshooting

### GPU stuck after VM shutdown
```bash
# Force unbind from vfio
echo "0000:06:00.0" > /sys/bus/pci/drivers/vfio-pci/unbind
echo "0000:06:00.1" > /sys/bus/pci/drivers/vfio-pci/unbind

# Rescan and reload nvidia
echo 1 > /sys/bus/pci/rescan
modprobe nvidia nvidia_uvm nvidia_modeset
```

### nvidia-smi shows no GPU after switch
```bash
# Remove old vfio bindings
echo "10de:2d07" > /sys/bus/pci/drivers/vfio-pci/remove_id 2>/dev/null
echo "10de:22e9" > /sys/bus/pci/drivers/vfio-pci/remove_id 2>/dev/null

# Full rescan
echo 1 > /sys/bus/pci/rescan
sleep 2
modprobe -r nvidia_uvm nvidia_modeset nvidia
modprobe nvidia nvidia_uvm nvidia_modeset
```

### VM won't start - GPU in use
```bash
# Check what's using the GPU
lsof /dev/nvidia* 2>/dev/null

# Stop containers using GPU
docker stop ollama
pct stop 120

# Then switch to VM mode
/root/gpu-switch.sh vm
```

---

## VM Configurations

### Windows Gaming (VM 101)
```
hostpci0: 0000:06:00.0,pcie=1,x-vga=1
hostpci1: 0000:06:00.1,pcie=1
cpu: host,hidden=1
args: -cpu host,kvm=on,+hypervisor,+invtsc,hv_vapic,hv_relaxed,hv_spinlocks=0x1fff,hv_vendor_id=proxmox
```

### Batocera (VM 103)
```
# Currently no GPU passthrough
# Add for GPU gaming:
hostpci0: 0000:06:00.0,pcie=1,x-vga=1
hostpci1: 0000:06:00.1,pcie=1
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `/root/gpu-switch.sh status` | Show current GPU mode |
| `/root/gpu-switch.sh vm` | Switch to VM passthrough |
| `/root/gpu-switch.sh host` | Switch to host/containers |
| `nvidia-smi` | Verify host GPU access |
| `qm start 101` | Start Windows gaming VM |
| `qm start 103` | Start Batocera VM |
