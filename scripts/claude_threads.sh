#!/bin/bash
# Claude Code Thread Management with Git Worktrees

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PROJECT_NAME="$(basename "$PROJECT_ROOT")"
PARENT_DIR="$(dirname "$PROJECT_ROOT")"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

case "$1" in
  setup)
    echo "Setting up git worktrees for threading..."
    "$SCRIPT_DIR/worktree_setup.sh" setup
    ;;
    
  reader)
    READER_PATH="$PARENT_DIR/${PROJECT_NAME}-reader"
    if [ ! -d "$READER_PATH" ]; then
        print_warning "Reader worktree not found. Running setup..."
        "$SCRIPT_DIR/worktree_setup.sh" setup
    fi
    
    echo -e "${GREEN}Starting Reader Thread${NC}"
    echo "================================"
    echo "Purpose: Research, status checks, read-only operations"
    echo "Location: $READER_PATH"
    echo "Recommended: Use Sonnet model for efficiency"
    echo ""
    echo "Start Claude in the reader directory:"
    echo "  cd $READER_PATH"
    echo "  claude  # Then select Sonnet model"
    echo ""
    echo "Opening in new terminal..."
    # Try to open new terminal in reader directory
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal --working-directory="$READER_PATH" &
    elif command -v xterm &> /dev/null; then
        xterm -e "cd $READER_PATH && bash" &
    else
        echo "Please manually open terminal at: $READER_PATH"
    fi
    ;;
    
  writer)
    WRITER_PATH="$PARENT_DIR/${PROJECT_NAME}-writer"
    if [ ! -d "$WRITER_PATH" ]; then
        print_warning "Writer worktree not found. Running setup..."
        "$SCRIPT_DIR/worktree_setup.sh" setup
    fi
    
    echo -e "${GREEN}Starting Writer Thread${NC}"
    echo "================================"
    echo "Purpose: Implementation, coding, system changes"
    echo "Location: $WRITER_PATH"
    echo "Recommended: Use Opus model for complex tasks"
    echo ""
    echo "Start Claude in the writer directory:"
    echo "  cd $WRITER_PATH"
    echo "  claude  # Then select Opus model"
    echo ""
    echo "Opening in new terminal..."
    # Try to open new terminal in writer directory
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal --working-directory="$WRITER_PATH" &
    elif command -v xterm &> /dev/null; then
        xterm -e "cd $WRITER_PATH && bash" &
    else
        echo "Please manually open terminal at: $WRITER_PATH"
    fi
    ;;
    
  feature)
    if [ -z "$2" ]; then
        echo "Usage: $0 feature <name>"
        exit 1
    fi
    FEATURE_NAME="$2"
    "$SCRIPT_DIR/worktree_setup.sh" feature "$FEATURE_NAME"
    ;;
    
  sync)
    echo "Syncing changes between worktrees..."
    cd "$PROJECT_ROOT"
    
    # Commit any pending changes in main
    if ! git diff --quiet || ! git diff --cached --quiet; then
        print_info "Committing changes in main..."
        git add -A
        git commit -m "Auto-sync from main worktree"
    fi
    
    # Pull changes from other worktrees
    for worktree in $(git worktree list --porcelain | grep "^worktree" | cut -d' ' -f2); do
        if [ "$worktree" != "$PROJECT_ROOT" ]; then
            branch=$(git worktree list --porcelain | grep -A1 "^worktree $worktree" | grep "^branch" | cut -d' ' -f2 | sed 's/refs\/heads\///')
            if [ -n "$branch" ]; then
                print_info "Pulling from $branch..."
                git fetch . "$branch:$branch" 2>/dev/null || true
            fi
        fi
    done
    
    echo "Sync complete. Review and merge branches as needed."
    ;;
    
  status)
    echo "=== Git Worktrees ==="
    git worktree list
    echo -e "\n=== Proxmox Status ==="
    ssh proxmox "pvesh get /nodes/lcib/status" 2>/dev/null || echo "Unable to connect to Proxmox"
    echo -e "\n=== Container Status ==="
    ssh proxmox "pct list" 2>/dev/null || echo "Unable to list containers"
    echo -e "\n=== Storage Status ==="
    ssh proxmox "pvesm status" 2>/dev/null || echo "Unable to check storage"
    ;;
    
  list)
    echo "Available worktrees:"
    git worktree list
    ;;
    
  remove)
    if [ -z "$2" ]; then
        echo "Usage: $0 remove <worktree-name>"
        exit 1
    fi
    WORKTREE_NAME="$2"
    WORKTREE_PATH="$PARENT_DIR/${PROJECT_NAME}-${WORKTREE_NAME}"
    if [ -d "$WORKTREE_PATH" ]; then
        git worktree remove "$WORKTREE_PATH"
        echo "Removed worktree: $WORKTREE_PATH"
    else
        echo "Worktree not found: $WORKTREE_PATH"
        exit 1
    fi
    ;;
    
  *)
    echo "Usage: $0 {setup|reader|writer|feature|sync|status|list|remove}"
    echo ""
    echo "Commands:"
    echo "  setup       - Initialize worktree structure"
    echo "  reader      - Open reader worktree (research/read-only)"
    echo "  writer      - Open writer worktree (implementation)"
    echo "  feature <n> - Create feature branch worktree"
    echo "  sync        - Sync changes between worktrees"
    echo "  status      - Show worktrees and Proxmox status"
    echo "  list        - List all worktrees"
    echo "  remove <n>  - Remove a worktree"
    echo ""
    echo "Example workflow:"
    echo "  $0 setup           # Initial setup"
    echo "  $0 reader          # Start research session"
    echo "  $0 writer          # Start coding session"
    echo "  $0 feature plex    # Create plex feature branch"
    echo "  $0 sync            # Sync changes"
    exit 1
    ;;
esac