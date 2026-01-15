 v
> **Note:** For a fresh installation, see [MACOS_VM_CLEAN_INSTALL.md](./MACOS_VM_CLEAN_INSTALL.md) which recommends **macOS Monterey** for best Intel iGPU performance.

## Overview
This document outlines the specific configuration required to run a macOS Monterey VM on Proxmox with Intel iGPU passthrough and functional remote desktop via RustDesk.

### Current Setup (January 2026)
- **HDMI Dummy Plug** connected to motherboard HDMI port
- **vga: none** - No VMware VGA (avoids dual-display conflicts)
- **iGPU Only** - Intel UHD 630 with proper framebuffer configuration

**VM Details:**
*   **VMID:** 130
*   **Name:** HACK-MONTEREY
*   **IP Address:** 192.168.0.131
*   **OS:** macOS Monterey 12.7.4
*   **User:** darrenarney

## 1. Proxmox Configuration (`/etc/pve/qemu-server/130.conf`)

The VM uses iGPU-only graphics with an HDMI dummy plug for proper display output.

*   **Machine Type:** `q35`
*   **BIOS:** `OVMF` (UEFI)
*   **Graphics (VGA):** `none` (iGPU is the only display)
*   **PCI Passthrough:** `hostpci0: 0000:00:02.0,pcie=1` (Intel UHD 630 iGPU)
*   **CPU Args:**
    ```
    -device isa-applesmc,osk="..."
    -smbios type=2
    -global ICH9-LPC.acpi-pci-hotplug-with-bridge-support=off
    -cpu host,kvm=on,vendor=GenuineIntel,+kvm_pv_unhalt,+kvm_pv_eoi,+hypervisor,+invtsc
    ```

## 2. macOS Internal Configuration

### Display & Graphics
*   **HDMI Dummy Plug:** Physical dummy plug connected to motherboard HDMI port. The iGPU sees this as a real 4K monitor.
*   **OpenCore Framebuffer:** Configured with `AAPL,ig-platform-id` = `3E9B0007` for display output with 3 DP connectors
*   **Metal:** Available (AGXMetalA12 renderer)
*   **Power Management:** Display sleep is disabled to prevent issues.
    *   Command: `sudo pmset -a displaysleep 0`

### Auto-Login
*   **User:** `darrenarney`
*   **Mechanism:** `/etc/kcpassword` (obfuscated password file) generated to bypass the login screen, ensuring the desktop environment loads immediately on boot.

### Network & RustDesk
*   **Connectivity Fix (NAT Hairpinning):** The VM cannot reach the public IP of the self-hosted RustDesk server (`rustdesk.darrenarney.com`) from inside the network.
*   **The Hack:** `/etc/hosts` is modified to point the RustDesk domains directly to the local LAN IP of the relay server (`192.168.0.218`).
    ```
    # /etc/hosts
    192.168.0.218 rustdesk.darrenarney.com
    192.168.0.218 rs-ny.rustdesk.com
    ```
    *Note: `rs-ny.rustdesk.com` is used as an alias in the RustDesk config to trick the client if necessary, redirected to the local server.*

### RustDesk Client Configuration

> **Important:** Use **RustDesk 1.1.9** (Sciter-based), NOT 1.2.x+ (Flutter-based). Flutter versions require Metal GPU and can be unstable with virtual displays.

**Connection Details:**
*   **RustDesk ID:** `293266490`
*   **Password:** `V23satchmo4685`

**Automated Setup Script:**
```bash
# Run on macOS VM to install/configure RustDesk 1.1.9
bash /path/to/scripts/macos-vm/setup-rustdesk-119.sh
```

*   **Version:** 1.1.9 (Sciter) - works reliably with iGPU passthrough
*   **Download:** https://github.com/rustdesk/rustdesk/releases/download/1.1.9/rustdesk-1.1.9.dmg
*   **Config Files:** Located in `/Users/darrenarney/.config/rustdesk/`
*   **File Locking:** Config files (`RustDesk.toml`, `RustDesk2.toml`) are often locked with `chflags uchg` to prevent the app from reverting to public servers.
*   **Permissions:** `Screen Recording` and `Accessibility` permissions must be manually granted in System Settings.

### Screen Sharing (Backup)
*   **VNC URL:** `vnc://192.168.0.131`
*   Port 5900 is listening for VNC connections
*   Use Apple Screen Sharing from another Mac or any VNC client

## 3. Troubleshooting

**Issue: "Waiting for image" in RustDesk**
*   **Cause:** The virtual display is asleep or permissions are revoked.
*   **Fix:**
    1.  Connect via Proxmox Console (VNC).
    2.  Open **BetterDisplay** and ensure the Dummy Display is active/connected.
    3.  Check **System Settings -> Privacy & Security -> Screen Recording** and toggle RustDesk OFF and ON.

**Issue: "Offline" or "ID not valid"**
*   **Cause:** Network connectivity to the self-hosted server.
*   **Fix:**
    1.  Check `/etc/hosts` in the VM to ensure it points to `192.168.0.218`.
    2.  Verify the RustDesk service is running: `ps aux | grep RustDesk`.

**Issue: "No Metal Device" / Graphics Crash**
*   **Cause:** GPU passthrough is failing or disabled.
*   **Fix:** Ensure `hostpci0: 00:02.0` is present in the Proxmox config and that the VM was fully rebooted (Stop -> Start) after any PCI changes.

## 4. Maintenance Commands (SSH)

Connect to the VM:
```bash
ssh darrenarney@192.168.0.131
```

**Restart RustDesk Service:**
```bash
sudo pkill -9 RustDesk
# Wait a moment, launch as user for GUI access
open -a RustDesk
```

**Wake Display:**
```bash
sudo caffeinate -u -t 5
```
