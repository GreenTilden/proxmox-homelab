#!/bin/bash
# NVIDIA Driver Installation Script for Dual GPU Setup
# RTX 5070 Ti + GTX 970 on Proxmox/Debian 13 Trixie

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== NVIDIA Dual GPU Driver Installation ===${NC}"
echo "System: Debian 13 (Trixie) on Proxmox VE"
echo "GPUs: RTX 5070 Ti (Primary) + GTX 970 (Secondary)"
echo ""

# Function to check current status
check_current_status() {
    echo -e "${YELLOW}Checking current GPU status...${NC}"
    
    # Check if GPUs are detected
    if lspci | grep -i vga | grep -i nvidia > /dev/null; then
        echo -e "${GREEN}✅ NVIDIA GPUs detected:${NC}"
        lspci | grep -i vga | grep -i nvidia
    else
        echo -e "${RED}❌ No NVIDIA GPUs detected${NC}"
        exit 1
    fi
    
    # Check if drivers are installed
    if command -v nvidia-smi &> /dev/null; then
        echo -e "${YELLOW}⚠️ NVIDIA drivers already installed${NC}"
        nvidia-smi || true
        read -p "Continue with reinstallation? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 0
        fi
    else
        echo -e "${YELLOW}No NVIDIA drivers currently installed${NC}"
    fi
}

# Function to backup current configuration
backup_configuration() {
    echo -e "${YELLOW}Creating configuration backup...${NC}"
    
    BACKUP_DIR="/root/gpu-driver-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup key files if they exist
    [ -f /etc/modprobe.d/blacklist-nouveau.conf ] && cp /etc/modprobe.d/blacklist-nouveau.conf "$BACKUP_DIR/"
    [ -f /etc/default/grub ] && cp /etc/default/grub "$BACKUP_DIR/"
    [ -f /etc/modules ] && cp /etc/modules "$BACKUP_DIR/"
    
    echo -e "${GREEN}✅ Backup created at: $BACKUP_DIR${NC}"
}

# Function to install prerequisites
install_prerequisites() {
    echo -e "${YELLOW}Installing prerequisites...${NC}"
    
    apt update
    apt install -y \
        build-essential \
        linux-headers-$(uname -r) \
        dkms \
        pve-headers \
        firmware-misc-nonfree
    
    echo -e "${GREEN}✅ Prerequisites installed${NC}"
}

# Function to blacklist nouveau
blacklist_nouveau() {
    echo -e "${YELLOW}Blacklisting nouveau driver...${NC}"
    
    cat > /etc/modprobe.d/blacklist-nouveau.conf << 'EOF'
blacklist nouveau
blacklist lbm-nouveau
options nouveau modeset=0
alias nouveau off
alias lbm-nouveau off
EOF
    
    # Update initramfs
    update-initramfs -u
    
    echo -e "${GREEN}✅ Nouveau blacklisted${NC}"
}

# Function to enable IOMMU for passthrough
enable_iommu() {
    echo -e "${YELLOW}Enabling IOMMU for GPU passthrough...${NC}"
    
    # Check CPU type
    if grep -q "Intel" /proc/cpuinfo; then
        IOMMU_PARAM="intel_iommu=on iommu=pt"
        echo "Detected Intel CPU"
    else
        IOMMU_PARAM="amd_iommu=on iommu=pt"
        echo "Detected AMD CPU"
    fi
    
    # Update GRUB
    if ! grep -q "$IOMMU_PARAM" /etc/default/grub; then
        sed -i "s/GRUB_CMDLINE_LINUX_DEFAULT=\"/GRUB_CMDLINE_LINUX_DEFAULT=\"$IOMMU_PARAM /" /etc/default/grub
        update-grub
        echo -e "${GREEN}✅ IOMMU enabled (reboot required)${NC}"
    else
        echo -e "${GREEN}✅ IOMMU already enabled${NC}"
    fi
}

# Function to install NVIDIA drivers
install_nvidia_drivers() {
    echo -e "${YELLOW}Installing NVIDIA drivers...${NC}"
    
    # Add non-free repositories if not present
    if ! grep -q "non-free" /etc/apt/sources.list.d/debian.sources; then
        echo -e "${RED}❌ non-free repositories required${NC}"
        echo "Please add 'contrib non-free non-free-firmware' to your sources"
        exit 1
    fi
    
    # Install NVIDIA driver and utilities
    apt update
    apt install -y \
        nvidia-driver \
        nvidia-kernel-dkms \
        nvidia-smi \
        nvidia-container-toolkit
    
    echo -e "${GREEN}✅ NVIDIA drivers installed${NC}"
}

# Function to configure for dual GPUs
configure_dual_gpu() {
    echo -e "${YELLOW}Configuring dual GPU setup...${NC}"
    
    # Create Xorg configuration for dual GPUs
    cat > /etc/X11/xorg.conf.d/10-nvidia-dual.conf << 'EOF'
Section "Device"
    Identifier     "RTX5070Ti"
    Driver         "nvidia"
    BusID          "PCI:1:0:0"  # Adjust based on lspci output
    Option         "AllowEmptyInitialConfiguration"
EndSection

Section "Device"
    Identifier     "GTX970"
    Driver         "nvidia"
    BusID          "PCI:2:0:0"  # Adjust based on lspci output
    Option         "AllowEmptyInitialConfiguration"
EndSection
EOF
    
    echo -e "${GREEN}✅ Dual GPU configuration created${NC}"
}

# Function to setup container GPU access
setup_container_access() {
    echo -e "${YELLOW}Setting up container GPU access...${NC}"
    
    # Configure Docker for GPU support
    if command -v docker &> /dev/null; then
        # Install nvidia-container-toolkit
        distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
        curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | apt-key add -
        curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | \
            tee /etc/apt/sources.list.d/nvidia-docker.list
        
        apt update
        apt install -y nvidia-container-toolkit
        
        # Configure Docker daemon
        nvidia-ctk runtime configure --runtime=docker
        systemctl restart docker
        
        echo -e "${GREEN}✅ Docker GPU support configured${NC}"
    fi
    
    # Create LXC GPU passthrough hook
    cat > /usr/share/lxc/hooks/nvidia-hook.sh << 'EOF'
#!/bin/bash
# LXC GPU Passthrough Hook
for dev in /dev/nvidia*; do
    if [ -c "$dev" ]; then
        mknod -m 666 "${LXC_ROOTFS_MOUNT}${dev}" c $(stat -c %t $dev | xargs printf "%d\n") $(stat -c %T $dev | xargs printf "%d\n")
    fi
done
EOF
    chmod +x /usr/share/lxc/hooks/nvidia-hook.sh
    
    echo -e "${GREEN}✅ Container GPU access configured${NC}"
}

# Function to create test scripts
create_test_scripts() {
    echo -e "${YELLOW}Creating GPU test scripts...${NC}"
    
    # Docker GPU test
    cat > /root/test-docker-gpu.sh << 'EOF'
#!/bin/bash
echo "Testing Docker GPU access..."
docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi
EOF
    chmod +x /root/test-docker-gpu.sh
    
    # Basic GPU test
    cat > /root/test-gpu-status.sh << 'EOF'
#!/bin/bash
echo "=== GPU Status Test ==="
echo ""
echo "1. Hardware Detection:"
lspci | grep -i vga
echo ""
echo "2. Driver Status:"
nvidia-smi || echo "nvidia-smi not available"
echo ""
echo "3. CUDA Version:"
nvcc --version 2>/dev/null || echo "CUDA not installed"
echo ""
echo "4. Container Runtime:"
docker run --rm --gpus all ubuntu:22.04 nvidia-smi 2>/dev/null || echo "Container GPU access not configured"
EOF
    chmod +x /root/test-gpu-status.sh
    
    echo -e "${GREEN}✅ Test scripts created${NC}"
}

# Function to create rollback script
create_rollback_script() {
    echo -e "${YELLOW}Creating rollback script...${NC}"
    
    cat > /root/rollback-nvidia-drivers.sh << 'EOF'
#!/bin/bash
echo "Rolling back NVIDIA driver installation..."

# Remove NVIDIA packages
apt purge -y nvidia-* cuda-*
apt autoremove -y

# Remove blacklist
rm -f /etc/modprobe.d/blacklist-nouveau.conf

# Remove GPU configs
rm -f /etc/X11/xorg.conf.d/10-nvidia-dual.conf

# Update initramfs
update-initramfs -u

echo "Rollback complete. Please reboot."
EOF
    chmod +x /root/rollback-nvidia-drivers.sh
    
    echo -e "${GREEN}✅ Rollback script created at /root/rollback-nvidia-drivers.sh${NC}"
}

# Main installation flow
main() {
    echo -e "${GREEN}Starting NVIDIA driver installation...${NC}"
    echo ""
    
    # Check if running as root
    if [ "$EUID" -ne 0 ]; then 
        echo -e "${RED}Please run as root${NC}"
        exit 1
    fi
    
    # Run installation steps
    check_current_status
    backup_configuration
    install_prerequisites
    blacklist_nouveau
    enable_iommu
    install_nvidia_drivers
    configure_dual_gpu
    setup_container_access
    create_test_scripts
    create_rollback_script
    
    echo ""
    echo -e "${GREEN}=== Installation Complete ===${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Reboot the system: reboot"
    echo "2. After reboot, test with: /root/test-gpu-status.sh"
    echo "3. Test Docker GPU: /root/test-docker-gpu.sh"
    echo ""
    echo "If issues occur, rollback with: /root/rollback-nvidia-drivers.sh"
    echo ""
    echo -e "${YELLOW}⚠️ IMPORTANT: System reboot required for drivers to load${NC}"
}

# Run main function
main "$@"