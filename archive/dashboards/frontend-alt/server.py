#!/usr/bin/env python3
"""
Proxmox Homelab Frontend Server
Simple HTTP server for Vue.js dashboard
"""

import http.server
import socketserver
import os
import json
import subprocess
from urllib.parse import urlparse
from datetime import datetime
import mimetypes

class FrontendRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Allow cross-origin requests
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

        # Proper caching for static assets
        if self.path.startswith('/assets/'):
            self.send_header('Cache-Control', 'public, max-age=31536000, immutable')
        elif self.path.endswith(('.js', '.css', '.png', '.ico')):
            self.send_header('Cache-Control', 'public, max-age=3600')
        else:
            self.send_header('Cache-Control', 'no-cache')

        super().end_headers()

    def guess_type(self, path):
        """Proper MIME type handling"""
        mime_type, encoding = mimetypes.guess_type(path)

        if path.endswith('.js'):
            return 'application/javascript'
        elif path.endswith('.mjs'):
            return 'application/javascript'
        elif path.endswith('.css'):
            return 'text/css'
        elif path.endswith('.json'):
            return 'application/json'
        elif path.endswith('.ico'):
            return 'image/x-icon'
        elif path.endswith('.png'):
            return 'image/png'

        return mime_type or 'application/octet-stream'

    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        # Health endpoint
        if path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            health_data = {
                "status": "healthy",
                "timestamp": datetime.now().isoformat(),
                "service": "Proxmox Homelab Frontend",
                "version": "1.0.0"
            }
            self.wfile.write(json.dumps(health_data, indent=2).encode())
            return

        # Check if file exists
        file_path = self.translate_path(self.path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return super().do_GET()

        # SPA fallback to index.html for Vue Router
        self.path = '/index.html'
        return super().do_GET()

    def do_OPTIONS(self):
        # Handle preflight requests for CORS
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def log_message(self, format, *args):
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {format % args}")

def build_frontend():
    """Build the Vue.js frontend"""
    print("🔨 Building Vue.js frontend...")
    try:
        result = subprocess.run(['npm', 'run', 'build'],
                              capture_output=True, text=True, check=True)
        print("✅ Frontend build successful")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Frontend build failed: {e}")
        print(f"Output: {e.stdout}")
        print(f"Error: {e.stderr}")
        return False
    except FileNotFoundError:
        print("❌ npm not found. Please install Node.js")
        return False

if __name__ == "__main__":
    PORT = 8092

    # Check if we should build first
    if not os.path.exists('dist') or not os.path.exists('dist/index.html'):
        print("📦 No built frontend found, building...")
        if not build_frontend():
            print("❌ Cannot start server without built frontend")
            exit(1)

    # Change to serve from dist directory if it exists
    if os.path.exists('dist'):
        os.chdir('dist')
        print(f"📁 Serving from dist/ directory")

    Handler = FrontendRequestHandler

    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"🌐 Proxmox Homelab Frontend server running on port {PORT}")
        print(f"   📱 Dashboard: http://192.168.0.218:{PORT}")
        print(f"   🔍 Health check: http://192.168.0.218:{PORT}/health")
        print(f"   📂 Serving from: {os.getcwd()}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Frontend server stopped")