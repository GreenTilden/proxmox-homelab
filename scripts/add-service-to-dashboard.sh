#!/bin/bash
#
# add-service-to-dashboard.sh
# Automatically adds a new Docker container/service to the frontend dashboard
#
# Usage:
#   ./add-service-to-dashboard.sh <container-name> [options]
#   ./add-service-to-dashboard.sh --discover   # Auto-discover new containers
#
# Examples:
#   ./add-service-to-dashboard.sh tandoor --port 8080 --desc "Recipe Management"
#   ./add-service-to-dashboard.sh --discover --rebuild

set -e

# Configuration
PROXMOX_HOST="192.168.0.99"
FRONTEND_HOST="192.168.0.250"
FRONTEND_PATH="/var/www/vue-frontend"
SERVICE_FILE="src/composables/useServiceMonitoring.ts"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
PORT=""
DESCRIPTION=""
URL=""
HEALTH_ENDPOINT=""
REBUILD=false
DISCOVER=false
DRY_RUN=false

usage() {
    echo "Usage: $0 <container-name> [options]"
    echo "       $0 --discover [options]"
    echo ""
    echo "Options:"
    echo "  -p, --port PORT          Service port (required unless --discover)"
    echo "  -d, --desc DESCRIPTION   Service description"
    echo "  -u, --url URL            Custom URL (default: http://$PROXMOX_HOST:PORT)"
    echo "  -h, --health ENDPOINT    Health check endpoint"
    echo "  --discover               Auto-discover new Docker containers"
    echo "  --rebuild                Rebuild frontend after adding service"
    echo "  --dry-run                Show what would be added without making changes"
    echo "  --help                   Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 tandoor -p 8080 -d 'Recipe Management' --rebuild"
    echo "  $0 nextcloud -p 8443 -d 'Cloud Storage' -u 'https://192.168.0.99:8443'"
    echo "  $0 --discover --dry-run"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get existing services from the dashboard
get_existing_services() {
    ssh root@$FRONTEND_HOST "grep -oP \"id: '[^']+\" $FRONTEND_PATH/$SERVICE_FILE" 2>/dev/null | sed "s/id: '//g" || echo ""
}

# Get running Docker containers from Proxmox
get_docker_containers() {
    ssh root@$PROXMOX_HOST "docker ps --format '{{.Names}}|{{.Ports}}|{{.Image}}'" 2>/dev/null || echo ""
}

# Parse port from Docker port mapping
parse_port() {
    local ports="$1"
    # Extract first host port from mapping like "0.0.0.0:8080->80/tcp"
    echo "$ports" | grep -oP '0\.0\.0\.0:\K\d+' | head -1
}

# Generate service entry TypeScript code
generate_service_entry() {
    local id="$1"
    local name="$2"
    local desc="$3"
    local port="$4"
    local url="${5:-http://$PROXMOX_HOST:$port}"
    local health="${6:-$url}"

    # Convert container name to display name (capitalize, replace dashes)
    if [ "$name" = "$id" ]; then
        name=$(echo "$id" | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')
    fi

    cat << EOF
    {
      id: '$id',
      name: '$name',
      description: '$desc',
      status: 'unknown',
      lastChecked: null,
      responseTime: null,
      job: '$id',
      instance: '${id}-service',
      url: '$url',
      healthEndpoint: '$health'
    },
EOF
}

# Add service to the useServiceMonitoring.ts file
add_service_to_file() {
    local entry="$1"

    if [ "$DRY_RUN" = true ]; then
        log_info "Would add the following entry:"
        echo "$entry"
        return 0
    fi

    # Find the line with the services array and insert before the closing bracket
    # We look for the pattern "])" that ends the services ref array
    ssh root@$FRONTEND_HOST "
        cd $FRONTEND_PATH
        # Create backup
        cp $SERVICE_FILE ${SERVICE_FILE}.bak

        # Find the line number of the first ']' after 'services = ref<ServiceStatus[]>'
        # and insert our new service entry before it
        python3 << 'PYTHON'
import re

with open('$SERVICE_FILE', 'r') as f:
    content = f.read()

# Find the services array
pattern = r'(const services = ref<ServiceStatus\[\]>\(\[[\s\S]*?)(  \]\))'
match = re.search(pattern, content)

if match:
    before = match.group(1)
    after = match.group(2)

    # Insert new entry
    new_entry = '''$entry'''

    new_content = content[:match.end(1)] + new_entry + '\n' + content[match.start(2):]

    with open('$SERVICE_FILE', 'w') as f:
        f.write(new_content)
    print('Service added successfully')
else:
    print('Could not find services array')
    exit(1)
PYTHON
    "
}

# Check if service already exists
service_exists() {
    local id="$1"
    local existing=$(get_existing_services)
    echo "$existing" | grep -q "^${id}$"
}

# Discover new containers
discover_containers() {
    log_info "Discovering Docker containers on $PROXMOX_HOST..."

    local existing=$(get_existing_services)
    local containers=$(get_docker_containers)
    local new_count=0

    if [ -z "$containers" ]; then
        log_warn "No running containers found or unable to connect"
        return 1
    fi

    echo ""
    echo "Running containers:"
    echo "===================="

    while IFS='|' read -r name ports image; do
        [ -z "$name" ] && continue

        local port=$(parse_port "$ports")
        local status="NEW"

        if echo "$existing" | grep -q "^${name}$"; then
            status="EXISTS"
        fi

        if [ "$status" = "NEW" ] && [ -n "$port" ]; then
            echo -e "${GREEN}[NEW]${NC} $name (port: $port, image: $image)"
            ((new_count++)) || true

            if [ "$DRY_RUN" = false ]; then
                read -p "Add $name to dashboard? [y/N] " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    read -p "Description (default: '$name Service'): " desc
                    desc="${desc:-$name Service}"

                    local entry=$(generate_service_entry "$name" "$name" "$desc" "$port")
                    add_service_to_file "$entry"
                    log_success "Added $name to dashboard"
                fi
            else
                local entry=$(generate_service_entry "$name" "$name" "$name Service" "$port")
                log_info "Would add:"
                echo "$entry"
            fi
        elif [ "$status" = "EXISTS" ]; then
            echo -e "${BLUE}[EXISTS]${NC} $name (port: $port)"
        else
            echo -e "${YELLOW}[NO PORT]${NC} $name (no exposed port detected)"
        fi
    done <<< "$containers"

    echo ""
    echo "Summary: $new_count new container(s) found"
}

# Rebuild frontend
rebuild_frontend() {
    log_info "Rebuilding frontend..."
    ssh root@$FRONTEND_HOST "cd $FRONTEND_PATH && npm run build" 2>&1
    if [ $? -eq 0 ]; then
        log_success "Frontend rebuilt successfully"
    else
        log_error "Frontend build failed"
        return 1
    fi
}

# Main
main() {
    local container_name=""

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -p|--port)
                PORT="$2"
                shift 2
                ;;
            -d|--desc)
                DESCRIPTION="$2"
                shift 2
                ;;
            -u|--url)
                URL="$2"
                shift 2
                ;;
            -h|--health)
                HEALTH_ENDPOINT="$2"
                shift 2
                ;;
            --discover)
                DISCOVER=true
                shift
                ;;
            --rebuild)
                REBUILD=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --help)
                usage
                exit 0
                ;;
            -*)
                log_error "Unknown option: $1"
                usage
                exit 1
                ;;
            *)
                container_name="$1"
                shift
                ;;
        esac
    done

    # Discovery mode
    if [ "$DISCOVER" = true ]; then
        discover_containers
        if [ "$REBUILD" = true ] && [ "$DRY_RUN" = false ]; then
            rebuild_frontend
        fi
        exit 0
    fi

    # Manual add mode - require container name and port
    if [ -z "$container_name" ]; then
        log_error "Container name required"
        usage
        exit 1
    fi

    if [ -z "$PORT" ]; then
        log_error "Port required (-p PORT)"
        usage
        exit 1
    fi

    # Set defaults
    DESCRIPTION="${DESCRIPTION:-$container_name Service}"
    URL="${URL:-http://$PROXMOX_HOST:$PORT}"
    HEALTH_ENDPOINT="${HEALTH_ENDPOINT:-$URL}"

    # Check if already exists
    if service_exists "$container_name"; then
        log_warn "Service '$container_name' already exists in dashboard"
        exit 0
    fi

    # Generate and add entry
    log_info "Adding $container_name to dashboard..."
    local entry=$(generate_service_entry "$container_name" "$container_name" "$DESCRIPTION" "$PORT" "$URL" "$HEALTH_ENDPOINT")

    add_service_to_file "$entry"

    if [ $? -eq 0 ]; then
        log_success "Service '$container_name' added to dashboard"
    fi

    # Rebuild if requested
    if [ "$REBUILD" = true ] && [ "$DRY_RUN" = false ]; then
        rebuild_frontend
    fi
}

main "$@"
