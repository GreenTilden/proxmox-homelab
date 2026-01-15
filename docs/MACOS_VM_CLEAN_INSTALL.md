# macOS VM Clean Install Guide (Monterey)

## Overview

This guide documents a clean installation of macOS Monterey on Proxmox VE with Intel UHD 630 iGPU passthrough and RustDesk 1.1.9 for remote access.

**Why Monterey over Ventura/Sonoma:**
- Best performance on Intel-based VMs (Sonoma/Ventura are optimized for Apple Silicon)
- Most stable for hackintosh configurations
- Fewer patches required for Intel iGPU
- Full Metal support with Intel UHD 630
- Lower resource overhead

## Prerequisites

- Proxmox VE 7.x or 8.x
- Intel CPU with UHD 630 iGPU (Coffee Lake or newer)
- IOMMU enabled in BIOS
- At least 8GB RAM for the VM
- 64GB+ storage

## Phase 1: Proxmox Preparation

### 1.1 Enable IOMMU

Edit `/etc/default/grub`:
```bash
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on iommu=pt"
```

Update grub and reboot:
```bash
update-grub
reboot
```

### 1.2 Load VFIO Modules

Add to `/etc/modules`:
```
vfio
vfio_iommu_type1
vfio_pci
vfio_virqfd
```

### 1.3 Blacklist Intel Graphics (for passthrough)

Create `/etc/modprobe.d/blacklist.conf`:
```
blacklist i915
blacklist snd_hda_intel
```

Rebuild initramfs:
```bash
update-initramfs -u -k all
reboot
```

## Phase 2: macOS Installation

### 2.1 Use OSX-PROXMOX Installer

Run in Proxmox shell:
```bash
/bin/bash -c "$(curl -fsSL https://install.osx-proxmox.com)"
```

**Select:**
- macOS Version: **Monterey (12)**
- VM ID: 130 (or your preferred ID)
- RAM: 8192MB minimum
- Cores: 4 minimum
- Storage: 64GB minimum

### 2.2 VM Configuration Adjustments

After creation, edit `/etc/pve/qemu-server/130.conf`:

```conf
# Add iGPU passthrough (adjust PCI address as needed)
hostpci0: 0000:00:02.0,pcie=1

# Keep VMware VGA for Proxmox console fallback
vga: vmware

# Machine type must be q35
machine: q35

# Required CPU arguments for macOS
args: -device isa-applesmc,osk="..." -smbios type=2 -global ICH9-LPC.acpi-pci-hotplug-with-bridge-support=off -cpu host,kvm=on,vendor=GenuineIntel,+kvm_pv_unhalt,+kvm_pv_eoi,+hypervisor,+invtsc
```

### 2.3 Complete macOS Setup

1. Boot VM and complete macOS installation wizard
2. Create user account (e.g., `dackintosh`)
3. Enable auto-login: System Preferences > Users & Groups > Login Options
4. Disable display sleep: `sudo pmset -a displaysleep 0`

## Phase 3: Install BetterDisplay (Headless GPU Support)

The iGPU has no physical monitor attached. BetterDisplay creates a virtual display.

1. Download BetterDisplay from: https://github.com/waydabber/BetterDisplay
2. Install and launch
3. Create a "Dummy" display at 1920x1080
4. Set BetterDisplay to start at login

## Phase 4: Install RustDesk 1.1.9

### 4.1 Automated Setup (Recommended)

SSH into the macOS VM and run:
```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_REPO/scripts/macos-vm/setup-rustdesk-119.sh | bash
```

Or manually copy and execute `setup-rustdesk-119.sh` from this repo.

### 4.2 Manual Setup

If automated setup fails:

**Download RustDesk 1.1.9:**
```bash
curl -fsSL -o /tmp/rustdesk.dmg https://github.com/rustdesk/rustdesk/releases/download/1.1.9/rustdesk-1.1.9.dmg
hdiutil attach /tmp/rustdesk.dmg
sudo cp -R /Volumes/RustDesk/RustDesk.app /Applications/
hdiutil detach /Volumes/RustDesk
```

**Configure /etc/hosts:**
```bash
sudo tee -a /etc/hosts << 'EOF'
192.168.0.218 rs-ny.rustdesk.com
192.168.0.218 rs-sg.rustdesk.com
192.168.0.218 rs-cn.rustdesk.com
192.168.0.218 rustdesk.darrenarney.com
EOF
```

**Grant Permissions:**
1. System Preferences > Privacy & Security > Screen Recording > Enable RustDesk
2. System Preferences > Privacy & Security > Accessibility > Enable RustDesk

## Phase 5: Post-Install Configuration

### 5.1 Verify RustDesk Connection

1. Launch RustDesk
2. Should show "Ready" with ~1-2ms latency (local server)
3. Note the ID number
4. Set a permanent password in Settings

### 5.2 Test Remote Connection

From another machine with RustDesk:
1. Enter the VM's RustDesk ID
2. Enter the password
3. Connection should succeed

## Troubleshooting

### RustDesk shows "Connecting to network"

1. Check /etc/hosts has the correct entries:
   ```bash
   cat /etc/hosts | grep rustdesk
   ```

2. Flush DNS:
   ```bash
   sudo dscacheutil -flushcache
   sudo killall -HUP mDNSResponder
   ```

3. Restart RustDesk:
   ```bash
   sudo pkill -9 RustDesk
   open -a RustDesk
   ```

4. Verify server is reachable:
   ```bash
   nc -zv 192.168.0.218 21116
   ```

### RustDesk shows "Waiting for image"

1. Check BetterDisplay dummy display is active
2. Toggle Screen Recording permission off/on
3. Run `sudo caffeinate -u -t 5` to wake display

### UUID Mismatch Errors (Server Side)

If server logs show "uuid mismatch" for an old ID:
```bash
# On the RustDesk server (192.168.0.218)
docker stop rustdesk-hbbs
sqlite3 /path/to/rustdesk-data/db_v2.sqlite3 "DELETE FROM peer WHERE id = 'OLD_ID';"
docker start rustdesk-hbbs
```

### /etc/hosts Entries Lost After Reboot

The setup script creates a LaunchDaemon to persist entries. If issues persist:
```bash
# Check LaunchDaemon exists
ls -la /Library/LaunchDaemons/com.local.rustdesk-hosts.plist

# Reload if needed
sudo launchctl load /Library/LaunchDaemons/com.local.rustdesk-hosts.plist
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `/etc/pve/qemu-server/130.conf` | Proxmox VM configuration |
| `/etc/hosts` | DNS overrides for RustDesk server |
| `~/Library/Preferences/com.carriez.RustDesk/` | RustDesk config directory |
| `/Library/LaunchDaemons/com.local.rustdesk-hosts.plist` | Hosts persistence daemon |
| `~/Library/LaunchAgents/com.carriez.rustdesk.plist` | RustDesk auto-start agent |

## Version History

- **RustDesk 1.1.9**: Last Sciter-based version, no Metal requirement
- **RustDesk 1.2.x+**: Flutter-based, requires Metal GPU (won't work with VMware VGA)

## External References

- [OSX-PROXMOX Installer](https://github.com/luchina-gabriel/OSX-PROXMOX)
- [Intel UHD 630 on macOS](https://github.com/perez987/Intel-UHD-630-on-macOS)
- [Dortania OpenCore Guide](https://dortania.github.io/OpenCore-Install-Guide/)
- [RustDesk Releases](https://github.com/rustdesk/rustdesk/releases)
