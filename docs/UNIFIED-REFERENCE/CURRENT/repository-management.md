# Repository Management Patterns

## Issue Fixed: Bookworm/Trixie Repository Mismatch

### Problem Identified
- **System Version**: Debian 13 (Trixie)
- **Repository Config**: Was using Debian 12 (Bookworm) repositories
- **Impact**: Potential package version conflicts and missing updates

### Solution Applied
Updated `/etc/apt/sources.list.d/debian.sources` to match system version:

```bash
Types: deb
URIs: http://deb.debian.org/debian/
Suites: trixie trixie-updates
Components: main contrib non-free non-free-firmware
Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg

Types: deb
URIs: http://security.debian.org/debian-security/
Suites: trixie-security
Components: main contrib non-free non-free-firmware
Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg
```

## Repository Management Best Practices

### 1. Version Consistency Check
```bash
# Verify system version matches repository configuration
cat /etc/debian_version
lsb_release -a
grep -E "Suites|Codename" /etc/apt/sources.list.d/debian.sources
```

### 2. Repository Configuration Standards

#### For Proxmox on Debian
- **Base System**: Use matching Debian repositories (trixie for Debian 13)
- **Proxmox Repos**: Keep on stable channel (bookworm) for compatibility
- **Docker Repos**: Use stable channel regardless of base system
- **Third-party**: Pin to specific versions to avoid conflicts

#### Repository Priority
```
1. Debian base repositories (matching system version)
2. Proxmox enterprise/no-subscription repositories
3. Docker CE stable repository
4. Application-specific repositories (pinned versions)
```

### 3. Safe Update Procedures
```bash
# Always backup before repository changes
cp /etc/apt/sources.list.d/debian.sources{,.backup}

# Test repository changes
apt update
apt list --upgradable

# Selective upgrades for critical systems
apt upgrade --simulate  # Dry run first
apt upgrade            # If simulation looks safe
```

### 4. Mixed Repository Handling

#### When Mixed Repos are Acceptable
- Proxmox on newer Debian (Proxmox bookworm on Debian trixie)
- Docker stable on testing/unstable systems
- Specific application requirements

#### When to Avoid Mixed Repos
- Core system libraries
- Kernel packages
- Security-critical components

### 5. Repository Backup Strategy
```bash
# Maintain repository configuration backups
mkdir -p /etc/apt/sources.list.d/backups/
cp -a /etc/apt/sources.list.d/*.list /etc/apt/sources.list.d/backups/
cp -a /etc/apt/sources.list.d/*.sources /etc/apt/sources.list.d/backups/
```

## Current Repository Status (2025-08-25)

### Active Repositories
- **Debian Base**: Trixie (main, contrib, non-free, non-free-firmware)
- **Debian Security**: Trixie-security
- **Proxmox**: Bookworm (PVE no-subscription)
- **Docker CE**: Bookworm stable

### Repository Health
- ✅ Base system repositories aligned with Debian 13
- ✅ Package manager stable after correction
- ✅ 70 packages available for upgrade (non-critical)
- ⚠️ Monitor Proxmox compatibility with Trixie base

## Troubleshooting Repository Issues

### Common Problems and Solutions

#### 1. GPG Key Errors
```bash
# Update keyring
apt update 2>&1 | grep "NO_PUBKEY" | awk '{print $NF}' | xargs apt-key adv --keyserver keyserver.ubuntu.com --recv-keys
```

#### 2. Repository Not Found
```bash
# Verify repository URL is valid
curl -I http://deb.debian.org/debian/dists/trixie/Release
```

#### 3. Package Conflicts
```bash
# Identify conflicting packages
apt-cache policy <package-name>
# Pin specific version if needed
echo "Package: <package>
Pin: version <version>
Pin-Priority: 1001" > /etc/apt/preferences.d/<package>
```

## Automated Repository Management Script
```bash
#!/bin/bash
# /scripts/repository-health-check.sh

check_repository_health() {
    echo "=== Repository Health Check ==="
    
    # Check system version
    echo "System Version: $(cat /etc/debian_version)"
    
    # Check repository suites
    echo "Configured Suites:"
    grep "Suites:" /etc/apt/sources.list.d/debian.sources
    
    # Test update
    if apt update 2>&1 | grep -E "Err:|W:"; then
        echo "⚠️ Repository issues detected"
        return 1
    else
        echo "✅ Repositories healthy"
        return 0
    fi
}

# Run check
check_repository_health
```

## Lessons Learned
1. Always verify system version matches repository configuration
2. Backup repository files before modifications
3. Test package manager after repository changes
4. Document any mixed repository requirements
5. Monitor for version conflicts after major changes