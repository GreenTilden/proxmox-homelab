# macOS Sequoia Manual Installation on Proxmox

**Created**: January 2026
**VM ID**: 102
**Status**: Testing (No GPU Passthrough)

---

## Overview

This guide documents the manual installation of macOS Sequoia on Proxmox, based on:
- [Nick Sherlock's Proxmox macOS guides](https://www.nicksherlock.com/2022/10/installing-macos-13-ventura-on-proxmox/)
- [i12bretro Sequoia tutorial](https://i12bretro.github.io/tutorials/0944.html)
- [LongQT-sea/OpenCore-ISO](https://github.com/LongQT-sea/OpenCore-ISO)
- [kholia/OSX-KVM](https://github.com/kholia/OSX-KVM)

---

## Prerequisites

- Proxmox VE 8.x+
- Intel CPU with AVX2 support (Haswell or newer)
- KVM MSR handling enabled: `options kvm ignore_msrs=Y` in `/etc/modprobe.d/kvm.conf`

---

## Step 1: Download Required Files

### OpenCore Bootloader
```bash
cd /var/lib/vz/template/iso
wget https://github.com/LongQT-sea/OpenCore-ISO/releases/download/v0.6/LongQT-OpenCore-v0.6.iso -O LongQT-OpenCore.iso
```

### macOS Sequoia Recovery Image
```bash
cd /tmp
git clone --depth 1 https://github.com/kholia/OSX-KVM.git
cd OSX-KVM
python3 fetch-macOS-v2.py -s sequoia -o /var/lib/vz/template/iso/

# Rename for Proxmox
cp /var/lib/vz/template/iso/BaseSystem.dmg /var/lib/vz/template/iso/Sequoia-Recovery.iso
```

---

## Step 2: Create VM

### Basic VM Creation
```bash
qm create 102 \
    --name "macOS-Sequoia" \
    --ostype other \
    --machine q35 \
    --bios ovmf \
    --cpu host \
    --cores 8 \
    --memory 16384 \
    --balloon 0 \
    --vga vmware \
    --net0 vmxnet3,bridge=vmbr0
```

### Add Storage
```bash
# EFI disk
qm set 102 --efidisk0 local-lvm:1,format=raw,efitype=4m,pre-enrolled-keys=0

# Main disk (128GB VirtIO)
qm set 102 --virtio0 local-lvm:128,cache=unsafe,discard=on
```

### Add ISOs
```bash
qm set 102 --ide2 local:iso/LongQT-OpenCore.iso,media=cdrom
qm set 102 --ide3 local:iso/Sequoia-Recovery.iso,media=cdrom
qm set 102 --boot order=ide2
```

---

## Step 3: Configure VM Args

Edit `/etc/pve/qemu-server/102.conf` and add:

```conf
args: -device isa-applesmc,osk="ourhardworkbythesewordsguardedpleasedontsteal(c)AppleComputerInc" -smbios type=2 -device usb-kbd,bus=ehci.0,port=2 -device usb-tablet,bus=ehci.0,port=3 -global nec-usb-xhci.msi=off -global ICH9-LPC.acpi-pci-hotplug-with-bridge-support=off -cpu host,vendor=GenuineIntel,+invtsc,+hypervisor,kvm=on,vmware-cpuid-freq=on
```

### Final Tweaks
Change ISOs from `media=cdrom` to `cache=unsafe` for better performance:
```bash
sed -i 's/,media=cdrom/,cache=unsafe/' /etc/pve/qemu-server/102.conf
```

---

## Step 4: Install macOS

1. **Start VM**: `qm start 102`
2. **Open Console**: Proxmox web UI → VM 102 → Console
3. **OpenCore Menu**: Press Enter at boot menu
4. **Disk Utility**:
   - Select "Disk Utility"
   - Choose "VirtIO Block Media" (128GB)
   - Erase as "APFS" named "macOS"
5. **Install**:
   - Select "Install macOS Sequoia"
   - Choose the "macOS" disk
   - Wait for installation (multiple reboots required)
6. **First Boot**: After final reboot, select your disk from OpenCore menu

---

## Step 5: Post-Installation

### Make OpenCore Permanent
Inside macOS:
```bash
# Mount EFI partitions
diskutil list
sudo mkdir /Volumes/EFI
sudo mount -t msdos /dev/disk0s1 /Volumes/EFI

# Copy OpenCore from CD to internal EFI
# (Or use MountEFI tool from GitHub)
```

### Remove ISOs
After confirming boot works without ISOs:
```bash
qm set 102 --delete ide2
qm set 102 --delete ide3
qm set 102 --boot order=virtio0
```

---

## Final VM Configuration

```conf
balloon: 0
bios: ovmf
boot: order=ide2
cores: 8
cpu: host
efidisk0: local-lvm:vm-102-disk-0,efitype=4m,pre-enrolled-keys=0,size=4M
ide2: local:iso/LongQT-OpenCore.iso,cache=unsafe,size=15682K
ide3: local:iso/Sequoia-Recovery.iso,cache=unsafe,size=863592K
machine: q35
memory: 16384
name: macOS-Sequoia
net0: vmxnet3=BC:24:11:4A:1A:90,bridge=vmbr0
ostype: other
vga: vmware
virtio0: local-lvm:vm-102-disk-1,cache=unsafe,discard=on,size=128G
args: -device isa-applesmc,osk="..." -smbios type=2 -device usb-kbd,bus=ehci.0,port=2 -device usb-tablet,bus=ehci.0,port=3 -global nec-usb-xhci.msi=off -global ICH9-LPC.acpi-pci-hotplug-with-bridge-support=off -cpu host,vendor=GenuineIntel,+invtsc,+hypervisor,kvm=on,vmware-cpuid-freq=on
```

---

## GPU Passthrough (Future Step)

After base installation works, add GPU passthrough:

```bash
# Bind GPU to vfio-pci
/root/amd-gpu-switch.sh vm

# Add to VM config
qm set 102 --hostpci0 0000:03:00.0,pcie=1,x-vga=1
qm set 102 --hostpci1 0000:03:00.1,pcie=1
qm set 102 --vga none
```

OpenCore boot args for AMD GPU:
```
agdpmod=pikera unfairgva=1 radpg=15
```

---

## Troubleshooting

### Boot hangs at "PCI configuration"
- GPU reset issue - try fresh host reboot
- Check IOMMU groups

### Kernel panic on boot
- Check SMBIOS (must be supported in target macOS version)
- For Sequoia: use `MacPro7,1` (not `iMacPro1,1`)

### No display output
- Ensure `vga: vmware` for virtual graphics
- For passthrough: ensure `x-vga=1` and monitor connected

---

## Sources

- [Nick Sherlock - macOS Ventura on Proxmox](https://www.nicksherlock.com/2022/10/installing-macos-13-ventura-on-proxmox/)
- [i12bretro - Sequoia on Proxmox](https://i12bretro.github.io/tutorials/0944.html)
- [LongQT-sea/OpenCore-ISO](https://github.com/LongQT-sea/OpenCore-ISO)
- [kholia/OSX-KVM](https://github.com/kholia/OSX-KVM)
- [Dortania OpenCore Guide](https://dortania.github.io/OpenCore-Install-Guide/)
