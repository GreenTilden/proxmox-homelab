#!/bin/bash
# Manual NVIDIA Driver Installation for RTX 5070 Ti + GTX 970
# Avoids repository conflicts with Proxmox

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Manual NVIDIA Driver Installation ===${NC}"
echo "This script downloads and installs NVIDIA drivers directly from nvidia.com"
echo "Avoiding repository conflicts with Proxmox"
echo ""

# Driver version that supports BOTH RTX 5070 Ti AND GTX 970
DRIVER_VERSION="570.86.16"  # Latest version supporting both cards
DRIVER_URL="https://us.download.nvidia.com/XFree86/Linux-x86_64/${DRIVER_VERSION}/NVIDIA-Linux-x86_64-${DRIVER_VERSION}.run"
DRIVER_FILE="/tmp/NVIDIA-Linux-x86_64-${DRIVER_VERSION}.run"

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    # Check if running as root
    if [ "$EUID" -ne 0 ]; then 
        echo -e "${RED}Please run as root${NC}"
        exit 1
    fi
    
    # Check for build tools (already installed)
    if ! command -v gcc &> /dev/null; then
        echo -e "${RED}❌ Build tools not installed${NC}"
        echo "Run: apt install build-essential dkms pve-headers"
        exit 1
    fi
    echo -e "${GREEN}✅ Build tools present${NC}"
    
    # Check if nouveau is blacklisted
    if [ -f /etc/modprobe.d/blacklist-nouveau.conf ]; then
        echo -e "${GREEN}✅ Nouveau already blacklisted${NC}"
    else
        echo -e "${YELLOW}Blacklisting nouveau driver...${NC}"
        cat > /etc/modprobe.d/blacklist-nouveau.conf << 'EOF'
blacklist nouveau
blacklist lbm-nouveau
options nouveau modeset=0
alias nouveau off
alias lbm-nouveau off
EOF
        update-initramfs -u
        echo -e "${GREEN}✅ Nouveau blacklisted (reboot required)${NC}"
        REBOOT_REQUIRED=1
    fi
    
    # Check current GPU status
    echo -e "${YELLOW}Detected GPUs:${NC}"
    lspci | grep -i vga
}

# Function to download driver
download_driver() {
    echo -e "${YELLOW}Downloading NVIDIA driver ${DRIVER_VERSION}...${NC}"
    
    if [ -f "$DRIVER_FILE" ]; then
        echo -e "${GREEN}✅ Driver already downloaded${NC}"
    else
        wget -O "$DRIVER_FILE" "$DRIVER_URL" || {
            echo -e "${RED}❌ Failed to download driver${NC}"
            echo "Manual download URL: $DRIVER_URL"
            exit 1
        }
        chmod +x "$DRIVER_FILE"
        echo -e "${GREEN}✅ Driver downloaded${NC}"
    fi
}

# Function to stop X and display managers
stop_display_services() {
    echo -e "${YELLOW}Stopping display services...${NC}"
    
    # Stop any running X sessions
    systemctl stop display-manager 2>/dev/null || true
    systemctl stop gdm3 2>/dev/null || true
    systemctl stop lightdm 2>/dev/null || true
    
    # Kill any remaining X processes
    pkill -9 X 2>/dev/null || true
    pkill -9 Xorg 2>/dev/null || true
    
    echo -e "${GREEN}✅ Display services stopped${NC}"
}

# Function to install driver
install_driver() {
    echo -e "${YELLOW}Installing NVIDIA driver...${NC}"
    echo "This will take a few minutes..."
    
    # Run installer with appropriate flags
    "$DRIVER_FILE" \
        --silent \
        --dkms \
        --no-opengl-files \
        --no-x-check \
        --disable-nouveau \
        --run-nvidia-xconfig=no \
        --no-questions \
        --accept-license \
        --install-libglvnd || {
            echo -e "${RED}❌ Driver installation failed${NC}"
            echo "Try running manually without --silent flag:"
            echo "$DRIVER_FILE"
            exit 1
        }
    
    echo -e "${GREEN}✅ Driver installed${NC}"
}

# Function to configure for container access
configure_container_access() {
    echo -e "${YELLOW}Configuring container GPU access...${NC}"
    
    # Load nvidia modules
    modprobe nvidia
    modprobe nvidia_uvm
    modprobe nvidia_drm
    modprobe nvidia_modeset
    
    # Create device nodes if they don't exist
    if [ ! -c /dev/nvidia0 ]; then
        mknod -m 666 /dev/nvidia0 c 195 0
    fi
    if [ ! -c /dev/nvidiactl ]; then
        mknod -m 666 /dev/nvidiactl c 195 255
    fi
    if [ ! -c /dev/nvidia-uvm ]; then
        mknod -m 666 /dev/nvidia-uvm c 509 0
    fi
    
    # Install nvidia-container-toolkit if not present
    if ! command -v nvidia-container-toolkit &> /dev/null; then
        echo "Installing nvidia-container-toolkit..."
        
        # Add NVIDIA container toolkit repository
        distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
        curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
        curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
            sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
            tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
        
        apt update
        apt install -y nvidia-container-toolkit
        nvidia-ctk runtime configure --runtime=docker
        systemctl restart docker
    fi
    
    echo -e "${GREEN}✅ Container access configured${NC}"
}

# Function to verify installation
verify_installation() {
    echo -e "${YELLOW}Verifying installation...${NC}"
    
    # Check if nvidia-smi works
    if nvidia-smi &>/dev/null; then
        echo -e "${GREEN}✅ nvidia-smi working${NC}"
        nvidia-smi
    else
        echo -e "${RED}❌ nvidia-smi not working${NC}"
        echo "Driver may not be loaded. Try rebooting."
        return 1
    fi
    
    # Check both GPUs detected
    local gpu_count=$(nvidia-smi --query-gpu=name --format=csv,noheader | wc -l)
    if [ "$gpu_count" -eq 2 ]; then
        echo -e "${GREEN}✅ Both GPUs detected${NC}"
    else
        echo -e "${YELLOW}⚠️ Only $gpu_count GPU(s) detected${NC}"
    fi
}

# Function to create persistence service
create_persistence_service() {
    echo -e "${YELLOW}Creating NVIDIA persistence service...${NC}"
    
    cat > /etc/systemd/system/nvidia-persistenced.service << 'EOF'
[Unit]
Description=NVIDIA Persistence Daemon
Wants=syslog.target

[Service]
Type=forking
ExecStart=/usr/bin/nvidia-persistenced --user nvidia-persistenced --no-persistence-mode --verbose
ExecStopPost=/bin/rm -rf /var/run/nvidia-persistenced

[Install]
WantedBy=multi-user.target
EOF
    
    # Create nvidia-persistenced user if not exists
    id nvidia-persistenced &>/dev/null || useradd -r -s /bin/false nvidia-persistenced
    
    systemctl daemon-reload
    systemctl enable nvidia-persistenced
    systemctl start nvidia-persistenced
    
    echo -e "${GREEN}✅ Persistence service created${NC}"
}

# Main installation flow
main() {
    echo -e "${GREEN}Starting manual NVIDIA driver installation...${NC}"
    echo "Driver version: ${DRIVER_VERSION}"
    echo "Supports: RTX 5070 Ti + GTX 970"
    echo ""
    
    REBOOT_REQUIRED=0
    
    # Run installation steps
    check_prerequisites
    
    if [ "$REBOOT_REQUIRED" -eq 1 ]; then
        echo ""
        echo -e "${YELLOW}⚠️ REBOOT REQUIRED${NC}"
        echo "Nouveau has been blacklisted. Please reboot and run this script again."
        exit 0
    fi
    
    download_driver
    stop_display_services
    install_driver
    configure_container_access
    create_persistence_service
    verify_installation
    
    echo ""
    echo -e "${GREEN}=== Installation Complete ===${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Reboot the system: reboot"
    echo "2. After reboot, verify with: nvidia-smi"
    echo "3. Test Docker GPU: docker run --rm --gpus all nvidia/cuda:12.3.0-base-ubuntu22.04 nvidia-smi"
    echo ""
    echo "GPU Assignment:"
    echo "- GPU 0: RTX 5070 Ti (AI/LLM workloads)"
    echo "- GPU 1: GTX 970 (Plex transcoding)"
}

# Cleanup function
cleanup() {
    echo -e "${YELLOW}Cleaning up...${NC}"
    rm -f "$DRIVER_FILE"
}

# Set trap for cleanup
trap cleanup EXIT

# Run main function
main "$@"