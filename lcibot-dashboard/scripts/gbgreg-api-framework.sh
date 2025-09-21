#!/bin/bash

# GBGreg API Framework Setup
# Homelab Mario Dashboard - API Integration Layer

set -e

echo "🌐 Mario Homelab - GBGreg API Framework Setup"
echo "=============================================="

# Configuration
API_CT_ID=303
API_HOSTNAME="gbgreg-api"
API_PORT=3001

# Color output functions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# Create API container
create_api_container() {
    log_info "Creating GBGreg API container..."
    
    pct create $API_CT_ID \
        /var/lib/vz/template/cache/debian-12-standard_12.2-1_amd64.tar.zst \
        --hostname $API_HOSTNAME \
        --cores 2 \
        --memory 2048 \
        --rootfs service-pool:10 \
        --net0 name=eth0,bridge=vmbr0,ip=dhcp \
        --unprivileged 0 \
        --features nesting=1 \
        --startup order=4,up=30

    log_info "API container created with ID: $API_CT_ID"
}

# Setup Node.js environment
setup_nodejs_environment() {
    log_info "Setting up Node.js environment for API server..."
    
    pct start $API_CT_ID
    sleep 20
    
    # Install Node.js, npm, and development tools
    pct exec $API_CT_ID -- bash -c "
        apt update && apt install -y curl git build-essential
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt install -y nodejs
        npm install -g pm2 typescript ts-node
    "
    
    log_info "Node.js 20.x and development tools installed"
}

# Create GBGreg API framework
create_api_framework() {
    log_info "Creating GBGreg API framework structure..."
    
    # Create project structure in container
    pct exec $API_CT_ID -- bash -c "
        mkdir -p /opt/gbgreg-api
        cd /opt/gbgreg-api
        
        # Initialize Node.js project
        npm init -y
        
        # Install dependencies
        npm install express cors helmet morgan compression
        npm install winston sqlite3 node-cron axios
        npm install @types/express @types/node @types/cors --save-dev
        
        # Create TypeScript config
        npx tsc --init
    "
    
    # Create API server code
    pct exec $API_CT_ID -- bash -c "cat > /opt/gbgreg-api/src/server.ts << 'EOF'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import { createLogger, format, transports } from 'winston'
import cron from 'node-cron'
import axios from 'axios'
import sqlite3 from 'sqlite3'
import path from 'path'

const app = express()
const PORT = ${API_PORT}

// Logger setup
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.File({ filename: '/opt/gbgreg-api/logs/error.log', level: 'error' }),
    new transports.File({ filename: '/opt/gbgreg-api/logs/combined.log' }),
    new transports.Console({ format: format.simple() })
  ]
})

// Middleware
app.use(helmet())
app.use(cors())
app.use(compression())
app.use(morgan('combined'))
app.use(express.json())

// Database setup
const db = new sqlite3.Database('/opt/gbgreg-api/data/homelab.db')

// Initialize database schema
db.serialize(() => {
  db.run(\`CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    url TEXT,
    status TEXT,
    last_check DATETIME,
    response_time INTEGER,
    uptime_percentage REAL
  )\`)
  
  db.run(\`CREATE TABLE IF NOT EXISTS system_metrics (
    timestamp DATETIME PRIMARY KEY,
    cpu_usage REAL,
    memory_usage REAL,
    disk_usage REAL,
    gpu_usage REAL,
    gpu_temp REAL,
    gpu_memory REAL
  )\`)
  
  db.run(\`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    type TEXT,
    service TEXT,
    message TEXT,
    severity TEXT
  )\`)
})

// Service status endpoints
app.get('/api/services', (req, res) => {
  db.all('SELECT * FROM services ORDER BY name', (err, rows) => {
    if (err) {
      logger.error('Database error:', err)
      return res.status(500).json({ error: 'Database error' })
    }
    res.json(rows)
  })
})

app.get('/api/services/:id', (req, res) => {
  const { id } = req.params
  db.get('SELECT * FROM services WHERE id = ?', [id], (err, row) => {
    if (err) {
      logger.error('Database error:', err)
      return res.status(500).json({ error: 'Database error' })
    }
    if (!row) {
      return res.status(404).json({ error: 'Service not found' })
    }
    res.json(row)
  })
})

// System metrics endpoints
app.get('/api/metrics/current', async (req, res) => {
  try {
    // Collect current system metrics
    const metrics = await collectSystemMetrics()
    res.json(metrics)
  } catch (error) {
    logger.error('Error collecting metrics:', error)
    res.status(500).json({ error: 'Failed to collect metrics' })
  }
})

app.get('/api/metrics/history', (req, res) => {
  const { hours = 24 } = req.query
  const since = new Date(Date.now() - Number(hours) * 60 * 60 * 1000)
  
  db.all(
    'SELECT * FROM system_metrics WHERE timestamp > ? ORDER BY timestamp DESC LIMIT 1000',
    [since.toISOString()],
    (err, rows) => {
      if (err) {
        logger.error('Database error:', err)
        return res.status(500).json({ error: 'Database error' })
      }
      res.json(rows)
    }
  )
})

// Events and logs endpoints
app.get('/api/events', (req, res) => {
  const { limit = 100, severity } = req.query
  let query = 'SELECT * FROM events'
  const params: any[] = []
  
  if (severity) {
    query += ' WHERE severity = ?'
    params.push(severity)
  }
  
  query += ' ORDER BY timestamp DESC LIMIT ?'
  params.push(Number(limit))
  
  db.all(query, params, (err, rows) => {
    if (err) {
      logger.error('Database error:', err)
      return res.status(500).json({ error: 'Database error' })
    }
    res.json(rows)
  })
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  })
})

// GBGreg project specific endpoints
app.get('/api/gbgreg/dashboard-config', (req, res) => {
  res.json({
    title: 'Mario Homelab Dashboard',
    theme: 'mario',
    services: [],
    layout: 'grid',
    refreshInterval: 30000
  })
})

app.get('/api/gbgreg/system-overview', async (req, res) => {
  try {
    const [services, metrics, recentEvents] = await Promise.all([
      getServices(),
      getLatestMetrics(),
      getRecentEvents(10)
    ])
    
    res.json({
      services,
      metrics,
      events: recentEvents,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Error generating system overview:', error)
    res.status(500).json({ error: 'Failed to generate overview' })
  }
})

// Utility functions
async function collectSystemMetrics() {
  // This would collect actual system metrics
  // For now, return mock data structure
  return {
    cpu_usage: Math.random() * 100,
    memory_usage: Math.random() * 100,
    disk_usage: Math.random() * 100,
    gpu_usage: Math.random() * 100,
    gpu_temp: 45 + Math.random() * 30,
    gpu_memory: Math.random() * 100,
    timestamp: new Date().toISOString()
  }
}

async function getServices() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM services', (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}

async function getLatestMetrics() {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM system_metrics ORDER BY timestamp DESC LIMIT 1',
      (err, row) => {
        if (err) reject(err)
        else resolve(row)
      }
    )
  })
}

async function getRecentEvents(limit: number) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM events ORDER BY timestamp DESC LIMIT ?',
      [limit],
      (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      }
    )
  })
}

// Scheduled tasks
cron.schedule('*/30 * * * * *', async () => {
  try {
    const metrics = await collectSystemMetrics()
    db.run(
      \`INSERT INTO system_metrics (
        timestamp, cpu_usage, memory_usage, disk_usage,
        gpu_usage, gpu_temp, gpu_memory
      ) VALUES (?, ?, ?, ?, ?, ?, ?)\`,
      [
        metrics.timestamp,
        metrics.cpu_usage,
        metrics.memory_usage, 
        metrics.disk_usage,
        metrics.gpu_usage,
        metrics.gpu_temp,
        metrics.gpu_memory
      ]
    )
  } catch (error) {
    logger.error('Error collecting scheduled metrics:', error)
  }
})

// Start server
app.listen(PORT, '0.0.0.0', () => {
  logger.info(\`GBGreg API server running on port \${PORT}\`)
  console.log(\`🌐 GBGreg API Framework ready at http://0.0.0.0:\${PORT}\`)
})

export default app
EOF"
    
    # Create directories
    pct exec $API_CT_ID -- bash -c "
        mkdir -p /opt/gbgreg-api/src
        mkdir -p /opt/gbgreg-api/logs
        mkdir -p /opt/gbgreg-api/data
    "
    
    log_info "GBGreg API framework created"
}

# Create PM2 ecosystem file
create_pm2_config() {
    log_info "Creating PM2 process management configuration..."
    
    pct exec $API_CT_ID -- bash -c "cat > /opt/gbgreg-api/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'gbgreg-api',
    script: 'ts-node',
    args: 'src/server.ts',
    cwd: '/opt/gbgreg-api',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: '${API_PORT}'
    },
    error_file: '/opt/gbgreg-api/logs/pm2-error.log',
    out_file: '/opt/gbgreg-api/logs/pm2-out.log',
    log_file: '/opt/gbgreg-api/logs/pm2-combined.log',
    time: true
  }]
}
EOF"

    log_info "PM2 configuration created"
}

# Create systemd service
create_systemd_service() {
    log_info "Creating systemd service for GBGreg API..."
    
    pct exec $API_CT_ID -- bash -c "cat > /etc/systemd/system/gbgreg-api.service << 'EOF'
[Unit]
Description=GBGreg API Framework
After=network.target

[Service]
Type=forking
User=root
WorkingDirectory=/opt/gbgreg-api
ExecStart=/usr/bin/pm2 start ecosystem.config.js --env production
ExecReload=/usr/bin/pm2 reload ecosystem.config.js --env production
ExecStop=/usr/bin/pm2 delete gbgreg-api
Restart=always

[Install]
WantedBy=multi-user.target
EOF"

    # Enable and start service
    pct exec $API_CT_ID -- bash -c "
        systemctl daemon-reload
        systemctl enable gbgreg-api
        systemctl start gbgreg-api
    "
    
    log_info "GBGreg API service started and enabled"
}

# Update Mario Dashboard with API service
update_dashboard_api_service() {
    log_info "Adding GBGreg API service to Mario Dashboard..."
    
    cat << EOF
    
🌐 Add this service to Mario Dashboard App.vue:

{
  id: 'gbgreg-api',
  name: 'GBGreg API',
  description: 'System Integration Framework',
  url: 'http://192.168.0.99:${API_PORT}/api/health',
  icon: 'Connection',
  status: 'checking', 
  healthEndpoint: 'http://192.168.0.99:${API_PORT}/api/health'
}

🔗 API Endpoints Available:
- GET /api/health - Health check
- GET /api/services - All services status
- GET /api/metrics/current - Current system metrics
- GET /api/gbgreg/system-overview - Complete system overview
- GET /api/events - System events and logs

Ready for GBGreg frontend integration!

EOF
}

# Main deployment function
main() {
    log_info "Starting GBGreg API Framework Deployment"
    
    # Check if container already exists
    if pct list | grep -q $API_CT_ID; then
        log_warn "GBGreg API container $API_CT_ID already exists"
        log_info "Checking API service status..."
        
        if pct exec $API_CT_ID -- systemctl is-active gbgreg-api >/dev/null 2>&1; then
            log_info "✅ GBGreg API service already running"
        else
            log_info "Starting GBGreg API service..."
            pct exec $API_CT_ID -- systemctl start gbgreg-api
        fi
    else
        create_api_container
        setup_nodejs_environment
        create_api_framework
        create_pm2_config
        create_systemd_service
    fi
    
    update_dashboard_api_service
    
    log_info "🌐 GBGreg API Framework Deployment Complete!"
    log_info "API Server: http://192.168.0.99:${API_PORT}"
    log_info "Health Check: http://192.168.0.99:${API_PORT}/api/health"
    log_info "System Overview: http://192.168.0.99:${API_PORT}/api/gbgreg/system-overview"
    log_info "Ready for tomorrow's GBGreg frontend development!"
}

# Execute main function
main "$@"