#!/bin/bash
# Git Worktree Setup for Claude Threading

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PROJECT_NAME="$(basename "$PROJECT_ROOT")"
PARENT_DIR="$(dirname "$PROJECT_ROOT")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

setup_worktree() {
    local branch_name=$1
    local worktree_path=$2
    local description=$3
    
    if [ -d "$worktree_path" ]; then
        print_warning "Worktree already exists at $worktree_path"
        return
    fi
    
    print_status "Creating worktree: $branch_name at $worktree_path"
    git worktree add -b "$branch_name" "$worktree_path" main
    
    # Create a README in the worktree
    cat > "$worktree_path/WORKTREE.md" << EOF
# $branch_name Worktree

## Purpose
$description

## Usage
This is a git worktree for the $branch_name branch.
- Main project: $PROJECT_ROOT
- This worktree: $worktree_path

## Syncing Changes
\`\`\`bash
# Pull changes from main
git pull origin main

# Push changes to branch
git push origin $branch_name

# Merge back to main (from main directory)
cd $PROJECT_ROOT
git merge $branch_name
\`\`\`
EOF
    
    # Create symlink to CLAUDE.md
    if [ -f "$PROJECT_ROOT/CLAUDE.md" ]; then
        ln -sf "$PROJECT_ROOT/CLAUDE.md" "$worktree_path/CLAUDE.md"
        print_status "Linked CLAUDE.md to worktree"
    fi
    
    print_success "Created $branch_name worktree"
}

# Main setup function
main() {
    cd "$PROJECT_ROOT"
    
    print_status "Setting up Git worktrees for Claude threading"
    echo ""
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository!"
        exit 1
    fi
    
    # Show current worktrees
    print_status "Current worktrees:"
    git worktree list
    echo ""
    
    # Setup reader worktree
    setup_worktree \
        "reader" \
        "$PARENT_DIR/${PROJECT_NAME}-reader" \
        "Research, status checks, and read-only operations. Use with Sonnet model for efficiency."
    
    # Setup writer worktree
    setup_worktree \
        "writer" \
        "$PARENT_DIR/${PROJECT_NAME}-writer" \
        "Implementation, coding, and system changes. Use with Opus model for complex tasks."
    
    # Create features directory
    FEATURES_DIR="$PARENT_DIR/${PROJECT_NAME}-features"
    if [ ! -d "$FEATURES_DIR" ]; then
        mkdir -p "$FEATURES_DIR"
        print_success "Created features directory: $FEATURES_DIR"
    fi
    
    echo ""
    print_status "Final worktree structure:"
    git worktree list
    echo ""
    
    # Create helper script for quick navigation
    cat > "$PROJECT_ROOT/scripts/worktree_nav.sh" << 'EOF'
#!/bin/bash
# Quick navigation between worktrees

case "$1" in
    main)
        cd ~/projects/proxmox-homelab
        ;;
    reader)
        cd ~/projects/proxmox-homelab-reader
        ;;
    writer)
        cd ~/projects/proxmox-homelab-writer
        ;;
    feature)
        if [ -z "$2" ]; then
            echo "Usage: worktree_nav.sh feature <name>"
            exit 1
        fi
        cd ~/projects/proxmox-homelab-features/$2
        ;;
    list)
        git worktree list
        ;;
    *)
        echo "Usage: $0 {main|reader|writer|feature <name>|list}"
        exit 1
        ;;
esac
EOF
    chmod +x "$PROJECT_ROOT/scripts/worktree_nav.sh"
    
    print_success "Setup complete!"
    echo ""
    echo "Quick Start Guide:"
    echo "=================="
    echo "1. Open new terminal for reader thread:"
    echo "   cd $PARENT_DIR/${PROJECT_NAME}-reader"
    echo "   # Start Claude with Sonnet model"
    echo ""
    echo "2. Open new terminal for writer thread:"
    echo "   cd $PARENT_DIR/${PROJECT_NAME}-writer"
    echo "   # Start Claude with Opus model"
    echo ""
    echo "3. Create feature branch:"
    echo "   git worktree add -b feature/plex-setup $FEATURES_DIR/plex-setup"
    echo ""
    echo "4. List all worktrees:"
    echo "   git worktree list"
    echo ""
    echo "5. Remove a worktree:"
    echo "   git worktree remove <path>"
}

# Check for command
case "${1:-setup}" in
    setup)
        main
        ;;
    remove-all)
        print_warning "Removing all worktrees..."
        git worktree list | grep -v "$(pwd)" | awk '{print $1}' | while read -r path; do
            print_status "Removing worktree: $path"
            git worktree remove "$path" --force 2>/dev/null || true
        done
        print_success "All worktrees removed"
        ;;
    feature)
        if [ -z "$2" ]; then
            print_error "Usage: $0 feature <name>"
            exit 1
        fi
        FEATURE_NAME="$2"
        FEATURE_PATH="$PARENT_DIR/${PROJECT_NAME}-features/$FEATURE_NAME"
        setup_worktree "feature/$FEATURE_NAME" "$FEATURE_PATH" "Feature branch for $FEATURE_NAME"
        ;;
    *)
        echo "Usage: $0 {setup|remove-all|feature <name>}"
        exit 1
        ;;
esac