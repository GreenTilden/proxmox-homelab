# 🚨 CRITICAL REPOSITORY SAFETY RULE 🚨

## IRONCLAD RULE - EFFECTIVE IMMEDIATELY

### ❌ ABSOLUTELY NO TRIXIE PACKAGES
**Under NO circumstances should Trixie repository packages be installed on the Proxmox system during setup phase.**

### Why This Rule Exists
- **Proxmox Integrity**: Installing Trixie packages attempts to remove critical Proxmox components
- **System Stability**: Mixed repositories cause package conflicts and dependency hell
- **GPU Driver Conflict**: NVIDIA drivers from Trixie repos are incompatible and destructive

### What Happened
- Attempted to install nvidia-driver from Trixie repos
- APT tried to REMOVE: proxmox-ve, pve-firmware, proxmox-kernel
- This would have destroyed the Proxmox installation

### Current Repository Status
```
System: Debian 13 (Trixie) base
Proxmox: Bookworm repositories (stable)
Docker: Bookworm repositories (stable)
```

### Enforcement Rules
1. **NO apt install** of packages that pull from Trixie repos
2. **USE manual installers** for software not in Proxmox/Bookworm repos
3. **ALWAYS check** with `apt-cache policy <package>` before installing
4. **HOLD critical packages**: proxmox-ve, pve-firmware, proxmox-kernel
5. **PREFER Docker containers** over system packages when possible

### Safe Installation Methods
- ✅ Manual .run installers (NVIDIA drivers)
- ✅ Docker containers (isolated from system)
- ✅ Proxmox repository packages
- ✅ Compiled from source
- ❌ Trixie repository packages
- ❌ Mixed repository dependencies

### Package Hold Protection
```bash
# These packages are currently held to prevent removal:
proxmox-ve
pve-firmware
proxmox-kernel-6.14
proxmox-default-kernel
```

### When This Rule Can Be Removed
Only after:
1. All critical services are deployed and stable
2. GPU drivers are installed via manual methods
3. System has been running stable for 7+ days
4. Explicit user approval to remove this rule

### Emergency Recovery
If Trixie packages are accidentally installed:
```bash
# Check what was installed
apt list --installed | grep trixie

# Remove Trixie packages
apt remove <package-names>

# Reinstall Proxmox packages if needed
apt install --reinstall proxmox-ve pve-firmware
```

---

**THIS RULE IS NON-NEGOTIABLE UNTIL EXPLICITLY REMOVED**

**Date Enacted**: 2025-08-25
**Enacted By**: Writer Thread (with user mandate)
**Status**: ACTIVE AND ENFORCED