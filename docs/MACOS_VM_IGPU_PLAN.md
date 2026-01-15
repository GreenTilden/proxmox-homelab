# macOS VM Fresh Setup Plan - iGPU + Dummy Plug + RustDesk

**Selected Approach:** Option A - HDMI Dummy Plug (No VMware VGA ever)
**Remote Access:** RustDesk (primary)

## Research Summary

### Is This Possible? Evidence from Others

**Partially - with significant caveats.** Here's an honest assessment:

### What WORKS (Confirmed Success Stories)

1. **[William Lam's Mac Mini 2018 Guide](https://williamlam.com/2020/06/passthrough-of-integrated-gpu-igpu-for-apple-mac-mini-2018.html)** - UHD 630 passthrough for Metal API access on ESXi (not Proxmox)

2. **[Proxmox Forum](https://forum.proxmox.com/threads/gpu-passthrough-on-proxmox-ve-macos-monterey-part-04x04.140579/)** - AMD RX 580 passthrough works, but they kept VMware VGA alongside GPU

3. **[User with AMD 5700G iGPU](https://forum.proxmox.com/threads/igpu-passthrough-vm.147468/)** - Metal 3 working with Screen Sharing, but "Display shows unknown"

### What DOESN'T Work Well

1. **Intel iGPU display output** - [Multiple users report](https://forum.proxmox.com/threads/pve-intel-gpu-passthrough-to-macos-monterey-no-signal.115502/) "black screen" when trying to use iGPU HDMI/DP output
2. **Proxmox 8.2+ with kernel 6.8** - [Breaks UHD 630 passthrough](https://forum.proxmox.com/threads/proxmox-8-2-kernel-6-8-breaks-igpu-passthrough-for-uhd630.146256/)
3. **iGPU passthrough on laptops** - Generally problematic due to IOMMU groups

### The Honest Reality

From research: **"Fully working macOS + UHD 630 + Proxmox success stories are rare."** Most users achieve one of:
- iGPU visible in macOS but no display output (black screen)
- Metal working via Screen Sharing but laggy/limited resolution
- Display output only on older kernel versions (5.15)

### Headless Compute Option (Most Reliable)

[WhateverGreen FAQ](https://github.com/acidanthera/WhateverGreen/blob/master/Manual/FAQ.IntelHD.en.md) documents **headless framebuffer** `3E920003`:
- PortCount: 0, PipeCount: 0 (no display connectors)
- VRAM: 1536 MB (Metal compute available)
- Use with Screen Sharing for GUI access

This is designed for **compute-only** (Metal/QuickSync) with no display output.

### Why Previous Approach Failed
- Tried to disable VMware VGA (`vga: none`) without working remote access
- RustDesk Flutter (1.2.x+) requires Metal but crashes without proper WindowServer
- BetterDisplay virtual display + VMware VGA caused dual-display conflicts
- VMware VGA is primary, iGPU is secondary - wrong display captured

---

## macOS-Only Use Cases (Beyond AirTag Tracking)

Based on research from [Carmatec](https://www.carmatec.com/blog/how-to-develop-ios-apps-on-windows/), [CircleCI](https://circleci.com/docs/using-macos/), and [MacStadium](https://macstadium.com/solutions/app-development):

### 1. iOS/macOS App Development
- **Xcode** - Full IDE with Interface Builder, Swift Playgrounds
- **iOS Simulator** - Test on all iPhone/iPad models and iOS versions
- **watchOS/tvOS Simulators** - Develop for Apple Watch and Apple TV
- **SwiftUI Previews** - Real-time UI previews (requires Metal)

### 2. CI/CD Pipelines
- **Fastlane** - Automate iOS app builds, screenshots, code signing
- **Self-hosted GitHub Actions runner** - Free unlimited builds for your repos
- **Jenkins/GitLab Runner** - Build and test iOS apps automatically
- **App Store deployment** - Automate TestFlight and App Store submissions

### 3. Apple Ecosystem Tools
- **Xcode Instruments** - Performance profiling (requires Metal)
- **Core ML** - Train and test machine learning models for iOS
- **ARKit development** - Augmented reality (requires Metal)
- **Metal Shader development** - GPU compute and graphics

### 4. Cross-Platform Development
- **React Native iOS builds** - Build iOS version of RN apps
- **Flutter iOS builds** - Compile Flutter apps for iOS
- **Capacitor/Cordova** - Build native iOS apps from web code
- **Expo** - Build iOS apps from React Native

### 5. Exclusive Apple Software
- **Final Cut Pro / Logic Pro** - Video/audio editing (requires Metal)
- **Keynote/Pages/Numbers** - Apple's office suite
- **Apple Configurator** - Manage iOS devices in bulk
- **Find My** - AirTag tracking (your current use case)

---

## Recommended Approach: Apple Remote Desktop First

Based on research from [Eclectic Light Company](https://eclecticlight.co/2023/08/22/enhance-your-macos-vms-with-apple-remote-desktop/), ARD/Screen Sharing is more reliable than RustDesk for headless macOS.

### Why ARD Instead of RustDesk?
1. **Native macOS support** - No third-party dependencies
2. **Works with headless Macs** - Apple's own solution for this scenario
3. **No Metal requirement** - Screen Sharing works without GPU acceleration
4. **Built-in** - `/System/Library/CoreServices/Applications/Screen Sharing.app`

### Alternative Remote Access Options
| Method | Pros | Cons |
|--------|------|------|
| Apple Remote Desktop ($80) | Full control, scripting, file transfer | Cost |
| Screen Sharing (free) | Built-in, works well | Basic features only |
| VNC clients | Cross-platform | Can be slow/laggy |
| SSH + ARD combo | Best of both worlds | More setup |

---

## Implementation Plan

### Option A: HDMI Dummy Plug (Recommended - iGPU from Start)

**Hardware needed:** [HDMI Dummy Plug (~$10 on Amazon)](https://www.amazon.com/fit-Headless-Emulator-Headless-Acceleration-3840x2160/dp/B08RCJZ3PR)

This approach avoids VMware VGA entirely:

1. **Plug HDMI dummy into Proxmox server's motherboard HDMI/DP port**
   - The iGPU now thinks a 4K monitor is connected
   - No "headless" display issues

2. **Create VM with iGPU passthrough from the start:**
   ```
   vga: none
   hostpci0: 0000:00:02.0,pcie=1,romfile=vbios.bin
   ```
   Note: May need to extract vBIOS ROM - see [intel-igpu-passthru guide](https://github.com/LongQT-sea/intel-igpu-passthru)

3. **During installation:**
   - iGPU outputs to "dummy monitor"
   - Use VNC viewer connecting to iGPU's virtual display
   - OR temporarily connect a real monitor to motherboard HDMI

4. **After macOS installed:**
   - Enable SSH and Screen Sharing immediately
   - Test both work before removing real monitor (if used)
   - Dummy plug stays connected permanently

**Pros:** No display driver conflicts, iGPU is primary from day 1, modern RustDesk should work
**Cons:** Requires $10 purchase, slightly more complex initial setup

---

### Option B: VMware VGA Temporary (Simpler Setup)

Use VMware VGA just for installation, then switch permanently to iGPU:

#### Phase 1: Fresh macOS Monterey Install (With VMware VGA)

1. Stop/delete current VM 130
2. Create new VM with OSX-PROXMOX installer (Monterey)
3. **Keep `vga: vmware`** for initial setup ONLY
4. Complete macOS installation via Proxmox VNC console
5. Create user account, enable auto-login

#### Phase 2: Configure Multiple Remote Access Methods

**Immediately after first boot** (before any other setup):
1. **Enable SSH**: System Preferences → Sharing → Remote Login
2. **Enable Screen Sharing**: System Preferences → Sharing → Screen Sharing
3. **Enable Remote Management** (if available)
4. **Test SSH from Proxmox host**: `ssh darrenarney@192.168.0.134`
5. **Test Screen Sharing from another Mac**: `vnc://192.168.0.134`
6. **Install RustDesk 1.1.9** as backup (via `setup-rustdesk-119.sh`)

**Critical:** Do NOT install any apps or configure displays until SSH/Screen Sharing verified working.

**Pros:** No hardware purchase, uses existing docs/scripts
**Cons:** Display driver transition may cause issues

---

### Phase 3 (Option B Only): Switch to iGPU

Once SSH/Screen Sharing are verified working, edit Proxmox VM config:
```
vga: none
hostpci0: 0000:00:02.0,pcie=1
```

---

### Phase 4 (Both Options): Configure OpenCore for Headless iGPU

**Option 4A: Headless Compute Only (Most Reliable)**

For Metal/compute without display output, use framebuffer `3E920003`:
```xml
<key>DeviceProperties</key>
<dict>
    <key>Add</key>
    <dict>
        <key>PciRoot(0x0)/Pci(0x2,0x0)</key>
        <dict>
            <key>AAPL,ig-platform-id</key>
            <data>AwCSPg==</data>  <!-- 0300923E = 3E920003 headless compute -->
        </dict>
    </dict>
</dict>
```
- No display connectors (PortCount: 0)
- VRAM: 1536 MB for Metal compute
- Rely on Screen Sharing for GUI access

**Option 4B: Display Output (Less Reliable)**

For display output via HDMI dummy plug, use framebuffer `3E9B0007`:
```xml
<key>DeviceProperties</key>
<dict>
    <key>Add</key>
    <dict>
        <key>PciRoot(0x0)/Pci(0x2,0x0)</key>
        <dict>
            <key>AAPL,ig-platform-id</key>
            <data>BwCbPg==</data>  <!-- 07009B3E = 3E9B0007 with display -->
            <key>device-id</key>
            <data>mz4HAA==</data>  <!-- 9B3E0007 -->
            <key>framebuffer-patch-enable</key>
            <data>AQAAAA==</data>
            <key>framebuffer-stolenmem</key>
            <data>AAAwAQ==</data>  <!-- 19 MB -->
        </dict>
    </dict>
</dict>
```
- 3 display connectors (DP)
- May require HDMI dummy plug
- Mixed success reported

### Phase 5: Install BetterDisplay & Verify Metal

1. **Connect via Screen Sharing or SSH**
2. **Install BetterDisplay** for virtual display on iGPU (if no dummy plug)
3. **Test Metal:**
   ```bash
   system_profiler SPDisplaysDataType | grep Metal
   ```
   Should show "Metal: Supported"

### Phase 6: Test Modern RustDesk (Optional)

If Metal is working:
1. Download RustDesk 1.3.x (latest Flutter version)
2. Test if it can capture the iGPU-rendered display
3. If it works, you have modern RustDesk with all features

---

## Key Differences from Previous Approach

| Previous | New Approach |
|----------|--------------|
| RustDesk first, then disable VGA | Multiple remote methods first, test ALL before changing |
| Tried to use BetterDisplay + VMware VGA | Configure OpenCore for headless iGPU BEFORE BetterDisplay |
| Relied solely on RustDesk | Use native Screen Sharing as primary, RustDesk as backup |
| Flutter RustDesk without Metal | Only try Flutter RustDesk after confirming Metal works |

---

## Verification Steps

1. **SSH works**: `ssh darrenarney@192.168.0.134`
2. **Screen Sharing works**: Connect with vnc://192.168.0.134
3. **Metal available**: Run `system_profiler SPDisplaysDataType | grep Metal`
4. **Display working**: Can see desktop via Screen Sharing
5. **RustDesk (optional)**: Modern version connects and shows image

---

## Files to Modify

- `/etc/pve/qemu-server/130.conf` - Proxmox VM configuration
- OpenCore `config.plist` - Add headless iGPU properties (inside VM's EFI partition)
- macOS System Preferences - Enable Screen Sharing, SSH
- `/etc/hosts` on macOS - RustDesk server redirects (if using RustDesk)

---

## Risk Mitigation

**If you lose remote access:**
1. Stop VM from Proxmox
2. Re-enable `vga: vmware` in config
3. Start VM, use Proxmox VNC console
4. Troubleshoot and try again

**Backup plan:** Keep VMware VGA config handy to restore console access.

---

## Final Plan: iGPU + Dummy Plug + RustDesk

### Hardware Required
- **HDMI Dummy Plug** (~$10): [Amazon 4K@60Hz](https://www.amazon.com/fit-Headless-Emulator-Headless-Acceleration-3840x2160/dp/B08RCJZ3PR)
- Plug into Proxmox server's motherboard HDMI/DP port

### Step-by-Step Execution

**Day 1: Preparation**
1. Order/obtain HDMI dummy plug
2. Plug into server motherboard HDMI/DP port
3. Verify iGPU sees "monitor": Check in BIOS or with `lspci -v`

**Day 2: VM Creation**
1. Delete existing VM 130 (if keeping data, backup first)
2. Run OSX-PROXMOX installer for Monterey
3. **CRITICAL**: Set VM config BEFORE first boot:
   ```
   vga: none
   hostpci0: 0000:00:02.0,pcie=1,romfile=igd.rom
   ```
4. Download iGPU ROM from [intel-igpu-passthru](https://github.com/LongQT-sea/intel-igpu-passthru) for your CPU gen

**Day 2: macOS Installation**
1. Connect temporary real monitor OR use VNC if iGPU outputs to dummy (test this)
2. Boot VM, complete macOS installation
3. Create user account (`darrenarney`)
4. Enable auto-login immediately
5. Enable SSH: System Preferences → Sharing → Remote Login
6. Enable Screen Sharing: System Preferences → Sharing → Screen Sharing
7. **Test SSH works** from Proxmox host before continuing

**Day 3: OpenCore Configuration**
1. Mount VM's EFI partition
2. Edit `config.plist` to add iGPU properties (use 3E9B0007 with display connectors)
3. Add WhateverGreen.kext and Lilu.kext if not present
4. Reboot VM

**Day 4: BetterDisplay + RustDesk**
1. SSH in, verify Metal: `system_profiler SPDisplaysDataType | grep Metal`
2. Install BetterDisplay v2.3.9 (Monterey compatible)
3. Create virtual 1920x1080 display
4. Run `setup-rustdesk-119.sh` script
5. Try RustDesk 1.1.9 first (guaranteed to work without Metal)
6. If Metal confirmed working, try RustDesk 1.3.x (Flutter/modern)

### Expected Outcome
With dummy plug + proper OpenCore config:
- iGPU thinks real monitor is connected
- Metal should be available
- RustDesk 1.3.x MAY work (requires Metal)
- RustDesk 1.1.9 definitely works as fallback
- Screen Sharing always works as backup

### If It Still Doesn't Work
Fallback to headless compute framebuffer (3E920003):
- Metal compute available
- No display output
- Screen Sharing + RustDesk 1.1.9 only
