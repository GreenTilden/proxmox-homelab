#!/usr/bin/env python3
"""
LCiBot Dashboard - Simple HTTP Server
Fixed version with proper MIME type handling
"""

import http.server
import socketserver
import os
import json
from urllib.parse import urlparse
from datetime import datetime
import mimetypes

class LCiBotRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Allow cross-origin requests for development
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
        """Fixed guess_type method with proper MIME handling"""
        # Use standard mimetypes library
        mime_type, encoding = mimetypes.guess_type(path)
        
        # Override for specific Vue.js assets
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
                "service": "LCiBot Dashboard",
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
        # Enhanced logging for debugging
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {format % args}")

if __name__ == "__main__":
    PORT = 8091
    Handler = LCiBotRequestHandler
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"🤖 LCiBot Dashboard server running on port {PORT}")
        print(f"   Access dashboard at http://localhost:{PORT}")
        print(f"   Health check: http://localhost:{PORT}/health")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🤖 LCiBot Dashboard server stopped")