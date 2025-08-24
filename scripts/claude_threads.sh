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
    
  status-all)
    echo "=== ORCHESTRATED WORKTREE STATUS REPORT ==="
    echo "Generated: $(date)"
    echo ""
    
    echo "=== Git Worktrees ==="
    git worktree list
    echo ""
    
    echo "=== Branch Status ==="
    for worktree in $(git worktree list --porcelain | grep "^worktree" | cut -d' ' -f2); do
        branch=$(cd "$worktree" && git branch --show-current)
        status=$(cd "$worktree" && git status --porcelain | wc -l)
        echo "  $branch: $status uncommitted changes"
    done
    echo ""
    
    echo "=== System Health ==="
    ssh proxmox "pvesh get /nodes/lcib/status" 2>/dev/null || echo "Unable to connect to Proxmox"
    echo ""
    
    echo "=== Service Status ==="
    echo "Proxmox: $(curl -s -k -m 5 https://192.168.0.99:8006 >/dev/null && echo '✅ Accessible' || echo '❌ Unreachable')"
    echo "Grafana: $(curl -s -m 5 http://192.168.0.99:3000 >/dev/null && echo '✅ Accessible' || echo '❌ Unreachable')"
    echo "FileBrowser: $(curl -s -m 5 http://192.168.0.99:8080 >/dev/null && echo '✅ Accessible' || echo '❌ Unreachable')"
    echo ""
    ;;
    
  report)
    REPORT_FILE="status-report-$(date +%Y%m%d-%H%M%S).md"
    echo "Generating consolidated status report: $REPORT_FILE"
    
    {
        echo "# Proxmox Homelab Status Report"
        echo "**Generated**: $(date)"
        echo ""
        
        echo "## Worktree Status"
        git worktree list
        echo ""
        
        echo "## System Health"
        ssh proxmox "pvesh get /nodes/lcib/status" 2>/dev/null || echo "Unable to connect to Proxmox"
        echo ""
        
        echo "## Recent Activity"
        echo "### Last 24 hours commits:"
        git log --oneline --since="24 hours ago" --all-match --pretty=format:"- %h %s (%an)" | head -10
        echo ""
        
        echo "## Service Accessibility"
        echo "- Proxmox: $(curl -s -k -m 5 https://192.168.0.99:8006 >/dev/null && echo '✅ Accessible' || echo '❌ Unreachable')"
        echo "- Grafana: $(curl -s -m 5 http://192.168.0.99:3000 >/dev/null && echo '✅ Accessible' || echo '❌ Unreachable')"
        echo "- FileBrowser: $(curl -s -m 5 http://192.168.0.99:8080 >/dev/null && echo '✅ Accessible' || echo '❌ Unreachable')"
    } > "$REPORT_FILE"
    
    echo "Report saved to: $REPORT_FILE"
    ;;
    
  sync-all)
    echo "=== ORCHESTRATED SYNC OPERATION ==="
    print_info "Syncing all worktrees from main branch coordination"
    
    # First sync main
    cd "$PROJECT_ROOT"
    if ! git diff --quiet || ! git diff --cached --quiet; then
        print_info "Committing main branch changes..."
        git add -A
        git commit -m "Main branch coordination update - $(date)"
    fi
    
    # Sync each worktree
    for worktree in $(git worktree list --porcelain | grep "^worktree" | cut -d' ' -f2); do
        if [ "$worktree" != "$PROJECT_ROOT" ]; then
            branch=$(cd "$worktree" && git branch --show-current)
            print_info "Syncing $branch worktree..."
            
            cd "$worktree"
            if ! git diff --quiet || ! git diff --cached --quiet; then
                git add -A
                git commit -m "Auto-sync from $branch worktree - $(date)"
            fi
            
            # Merge main branch updates
            git fetch "$PROJECT_ROOT" main:main
            git merge main --no-edit || print_warning "Merge conflict in $branch - manual resolution needed"
        fi
    done
    
    print_info "Orchestrated sync complete"
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
    echo "Usage: $0 {setup|reader|writer|feature|sync|status|status-all|report|sync-all|list|remove}"
    echo ""
    echo "Core Commands:"
    echo "  setup       - Initialize worktree structure"
    echo "  reader      - Open reader worktree (research/read-only)"
    echo "  writer      - Open writer worktree (implementation)"
    echo "  feature <n> - Create feature branch worktree"
    echo ""
    echo "Orchestration Commands:"
    echo "  status-all  - Comprehensive status of all worktrees and services"
    echo "  report      - Generate timestamped markdown status report"
    echo "  sync-all    - Orchestrated sync of all worktrees from main"
    echo ""
    echo "Legacy Commands:"
    echo "  sync        - Basic sync changes between worktrees"
    echo "  status      - Show worktrees and Proxmox status"
    echo "  list        - List all worktrees"
    echo "  remove <n>  - Remove a worktree"
    echo ""
    echo "Orchestrated Workflow:"
    echo "  $0 setup            # Initialize all worktrees"
    echo "  $0 status-all       # Get comprehensive status"
    echo "  $0 reader           # Start research session (Sonnet)"
    echo "  $0 writer           # Start implementation session (Opus)" 
    echo "  $0 feature plex     # Create feature branch"
    echo "  $0 report           # Generate status report"
    echo "  $0 sync-all         # Orchestrated synchronization"
    exit 1
    ;;
esac