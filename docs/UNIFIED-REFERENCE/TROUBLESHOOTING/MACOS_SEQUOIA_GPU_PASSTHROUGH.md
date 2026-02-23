# macOS Sequoia + RX 6800 XT GPU Passthrough Troubleshooting

**Status**: Work in Progress
**Last Updated**: January 2026
**Hardware**: AMD RX 6800 XT (Navi 21) → macOS Sequoia VM (VMID 102)

---

## Summary

Attempting to pass through an AMD RX 6800 XT to a macOS Sequoia VM on Proxmox. Boot hangs at various stages depending on configuration.

---

## What Works

| Component | Status | Notes |
|-----------|--------|-------|
| macOS Sequoia VM (no GPU) | ✅ | Boots, installs, reaches desktop |
| thenickdude's OpenCore v21 | ✅ | With ScanPolicy=0 |
| Properly converted recovery image | ✅ | `qemu-img convert` from DMG to raw |
| GPU binds to vfio-pci | ✅ | Manual binding works |
| VFCT (GPU VBIOS) table loads | ✅ | Shows in verbose boot |
| ACPI tables load | ✅ | All 3 tables acquired |
| 8 CPUs detected | ✅ | ProcessorId 0-7 enabled |
| Boot past PCI config (after fresh host reboot) | ✅ | Gets to IOAPIC stage |

## What Doesn't Work

| Issue | Details |
|-------|---------|
| GPU passthrough boot | ❌ Hangs at "PCIConfigurator" stage |
| GPU reset error | `error writing '1' to '/sys/bus/pci/devices/0000:03:00.0/reset': Inappropriate ioctl for device` |
| vendor-reset not applicable | vendor-reset is for RDNA 1 (Navi 10) only, **NOT Navi 2x** |
| Boot hangs at "PCI configuration PCIO" | After VM restart without host reboot |

## Key Research Finding (January 2026)

**The "Inappropriate ioctl" error is NOT the real problem.** Per [Proxmox Forums](https://forum.proxmox.com/threads/amd-passthrough-to-vm-start-with-error-message-error-writing-1-to-sys-bus-pci-devices-0000-06-00-0-reset-inappropriate-ioctl-for-device.159195/): "This is a common Proxmox message for 6000-series AMD GPUs and not an error. The 6800 XT resets properly by itself."

---

## Configuration Tested

### VM Config (`/etc/pve/qemu-server/102.conf`)

```conf
agent: 1
args: -device isa-applesmc,osk="..." -smbios type=2 -device qemu-xhci -device usb-kbd -device usb-tablet -global nec-usb-xhci.msi=off -global ICH9-LPC.acpi-pci-hotplug-with-bridge-support=off -cpu host,kvm=on,vendor=GenuineIntel,+kvm_pv_unhalt,+kvm_pv_eoi,+hypervisor,+invtsc
bios: ovmf
cores: 8
hostpci0: 0000:03:00.0,pcie=1,x-vga=1
hostpci1: 0000:03:00.1,pcie=1
machine: q35
memory: 16384
vga: none
```

### OpenCore Config

- **Boot args**: `-v keepsyms=1 debug=0x100 agdpmod=pikera unfairgva=1 radpg=15`
- **SMBIOS**: `MacPro7,1` (required for Sequoia, iMacPro1,1 not supported)
- **Kexts**: Lilu 1.7.0, WhateverGreen 1.6.9, VirtualSMC 1.3.6

### VFIO Boot Binding (`/etc/modprobe.d/vfio-amd.conf`)

```conf
options vfio-pci ids=1002:73bf,1002:ab28
softdep amdgpu pre: vfio-pci
```

---

## Configurations Tried

| Config | Result |
|--------|--------|
| `x-vga=1` | Hangs at PCI config (after VM restart) |
| `x-vga=0` | Hangs at PCI config |
| `pcie=0` (legacy PCI) | No display output |
| `romfile=rx6800xt.rom` | No change |
| Without ROM file | No change |
| SMBIOS `iMacPro1,1` | Kernel panic (not supported in Sequoia) |
| SMBIOS `MacPro7,1` | Fixed panic, still hangs |
| PCI remove/rescan cycle | Temporarily helps |

---

## Research Findings

### RX 6800 XT Reset Behavior

Per [Proxmox Forums](https://forum.proxmox.com/threads/gpu-passthrough-radeon-6800xt-and-beyond.86932/):
> "The RX 6800-6950XT resets fine but others from the 6000-series do not always."

### vendor-reset Not Applicable

Per [Proxmox Forums](https://forum.proxmox.com/threads/all-new-amd-passthrough-vendor-reset.179010/):
> "vendor-reset should not be used for anything beyond NAVI10 (RDNA 1)"

The vendor-reset module we have loaded is for older cards. The 6800 XT (Navi 21/RDNA 2) should reset properly without it.

### Recommended GRUB Parameters

Per [Nick Sherlock's Guide](https://www.nicksherlock.com/2020/11/working-around-the-amd-gpu-reset-bug-on-proxmox/):
```
GRUB_CMDLINE_LINUX_DEFAULT="quiet nomodeset amd_iommu=on iommu=pt initcall_blacklist=sysfb_init"
```

### BIOS Settings

- **Resizable BAR / Smart Access Memory**: Should be **OFF** (not supported in VMs)
- **IOMMU**: Should be **Enabled** (not AUTO)
- **Above 4G Decoding**: Should be **Enabled**

---

## Potential Solutions to Try (Priority Order)

### 1. Remove `x-vga=1` from VM Config (HIGH PRIORITY)

Per [Proxmox Forums](https://forum.proxmox.com/threads/macos-pci-gpu-passthrough-troubles.122861/): "x-vga=1 is a workaround for NVidia GPUs and probably not needed for AMD GPUs."

```bash
# Change from:
hostpci0: 0000:03:00.0,pcie=1,x-vga=1
# To:
hostpci0: 0000:03:00.0,pcie=1
```

### 2. Add `initcall_blacklist=sysfb_init` to GRUB (HIGH PRIORITY)

Per [thenickdude/KVM-Opencore#44](https://github.com/thenickdude/KVM-Opencore/issues/44): "Since you passthrough the boot GPU you definitely need `initcall_blacklist=sysfb_init`" - prevents framebuffer from touching GPU during Proxmox boot.

```bash
# Edit /etc/default/grub:
GRUB_CMDLINE_LINUX_DEFAULT="quiet nomodeset amd_iommu=on iommu=pt initcall_blacklist=sysfb_init"

# Then run:
update-grub
reboot
```

### 3. Check/Update BIOS Settings

- [ ] Verify **Resizable BAR is OFF** (not supported in VMs)
- [ ] Verify **IOMMU is explicitly Enabled** (not AUTO)
- [ ] Verify **Above 4G Decoding is Enabled**

### 4. Early-bind GPU to vfio-pci at Boot

Create `/etc/modprobe.d/vfio.conf`:
```conf
options vfio-pci ids=1002:73bf,1002:ab28
softdep amdgpu pre: vfio-pci
```

Then update initramfs:
```bash
update-initramfs -u
reboot
```

### 5. Try GPU ROM File

Per [Proxmox Forums](https://forum.proxmox.com/threads/gpu-passthrough-error.178089/): Download ROM from https://www.techpowerup.com/vgabios/

```conf
hostpci0: 0000:03:00.0,pcie=1,rombar=0,romfile=rx6800xt.rom
```

### 6. Remove vendor-reset Module (if installed)

Since it's not for Navi 21, it might be interfering:
```bash
rmmod vendor_reset
# Remove from /etc/modules if present
```

### 7. Try Different macOS Version (Fallback)

Sequoia is very new. Try:
- macOS Sonoma (14)
- macOS Ventura (13)
- macOS Monterey (12) - known to work per existing VM 130

---

## Useful Commands

### Check GPU Binding
```bash
lspci -nnk -s 03:00
```

### PCI Reset Cycle
```bash
echo 1 > /sys/bus/pci/devices/0000:03:00.0/remove
echo 1 > /sys/bus/pci/devices/0000:03:00.1/remove
sleep 2
echo 1 > /sys/bus/pci/rescan
sleep 2
echo "0000:03:00.0" > /sys/bus/pci/drivers/vfio-pci/bind
echo "0000:03:00.1" > /sys/bus/pci/drivers/vfio-pci/bind
```

### Check IOMMU Groups
```bash
for d in /sys/kernel/iommu_groups/*/devices/*; do
  n=$(basename $d)
  echo "IOMMU Group $(basename $(dirname $(dirname $d))): $(lspci -nns $n)"
done | grep -E '03:00|02:00|01:00' | sort -V
```

### Monitor dmesg During Boot
```bash
dmesg -w | grep -i 'vfio\|amd\|gpu\|reset'
```

---

## Sources

- [Nick Sherlock - Working around AMD GPU Reset bug](https://www.nicksherlock.com/2020/11/working-around-the-amd-gpu-reset-bug-on-proxmox/)
- [Proxmox Forums - GPU Passthrough RX 6800 XT](https://forum.proxmox.com/threads/gpu-passthrough-radeon-6800xt-and-beyond.86932/)
- [Proxmox Forums - AMD Passthrough vendor-reset](https://forum.proxmox.com/threads/all-new-amd-passthrough-vendor-reset.179010/)
- [Proxmox Wiki - PCI Passthrough](https://pve.proxmox.com/wiki/PCI_Passthrough)
- [ultimate-macOS-KVM](https://github.com/Coopydood/ultimate-macOS-KVM)
- [OSX-KVM](https://github.com/kholia/OSX-KVM)

---

## Next Steps

1. Check BIOS settings (Resizable BAR, IOMMU, Above 4G)
2. Update GRUB parameters with `nomodeset` and `initcall_blacklist=sysfb_init`
3. Remove vendor-reset module (not needed for Navi 21)
4. Consider trying Monterey/Ventura instead of Sequoia
5. Investigate hook script approach for cleaner GPU handoff
