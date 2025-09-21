#!/usr/bin/env python3
"""
Deluge Prometheus Exporter
Exports Deluge torrent client metrics for Grafana dashboard integration
"""

import json
import time
import requests
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading

class DelugeAPI:
    def __init__(self, host="192.168.0.111", port=8112, password="deluge"):
        self.host = host
        self.port = port
        self.password = password
        self.session = requests.Session()
        self.cookie = None
        
    def login(self):
        """Authenticate with Deluge web interface"""
        try:
            # Get cookie
            response = self.session.post(f"http://{self.host}:{self.port}/json", 
                                       json={"method": "auth.check_session", "params": [], "id": 1})
            
            if response.status_code == 200:
                # Login with password
                login_response = self.session.post(f"http://{self.host}:{self.port}/json",
                                                 json={"method": "auth.login", "params": [self.password], "id": 2})
                return login_response.status_code == 200
        except Exception as e:
            print(f"Login failed: {e}")
            return False
    
    def get_session_stats(self):
        """Get Deluge session statistics"""
        try:
            response = self.session.post(f"http://{self.host}:{self.port}/json",
                                       json={"method": "core.get_session_status", "params": [], "id": 3})
            
            if response.status_code == 200:
                result = response.json()
                return result.get('result', {})
        except Exception as e:
            print(f"Failed to get session stats: {e}")
            return {}
    
    def get_torrents_status(self):
        """Get status of all torrents"""
        try:
            response = self.session.post(f"http://{self.host}:{self.port}/json",
                                       json={"method": "core.get_torrents_status", "params": [{}, []], "id": 4})
            
            if response.status_code == 200:
                result = response.json()
                return result.get('result', {})
        except Exception as e:
            print(f"Failed to get torrents status: {e}")
            return {}

class MetricsHandler(BaseHTTPRequestHandler):
    def __init__(self, deluge_api, *args, **kwargs):
        self.deluge_api = deluge_api
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        if self.path == '/metrics':
            metrics = self.generate_metrics()
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
            self.end_headers()
            self.wfile.write(metrics.encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def generate_metrics(self):
        """Generate Prometheus metrics from Deluge data"""
        # Re-authenticate if needed
        self.deluge_api.login()
        
        session_stats = self.deluge_api.get_session_stats()
        torrents_status = self.deluge_api.get_torrents_status()
        
        metrics = []
        
        # Session metrics
        if session_stats:
            download_rate = session_stats.get('download_rate', 0)
            upload_rate = session_stats.get('upload_rate', 0)
            num_peers = session_stats.get('num_peers', 0)
            
            metrics.extend([
                f'deluge_session_download_rate {download_rate}',
                f'deluge_session_upload_rate {upload_rate}',
                f'deluge_session_num_peers {num_peers}'
            ])
        
        # Torrent metrics
        if torrents_status:
            total_torrents = len(torrents_status)
            downloading = sum(1 for t in torrents_status.values() if t.get('state') == 'Downloading')
            seeding = sum(1 for t in torrents_status.values() if t.get('state') == 'Seeding')
            paused = sum(1 for t in torrents_status.values() if t.get('state') == 'Paused')
            error = sum(1 for t in torrents_status.values() if t.get('state') == 'Error')
            
            metrics.extend([
                f'deluge_torrents_total {total_torrents}',
                f'deluge_torrents_downloading {downloading}',
                f'deluge_torrents_seeding {seeding}',
                f'deluge_torrents_paused {paused}',
                f'deluge_torrents_error {error}'
            ])
        
        return '\n'.join(metrics) + '\n'
    
    def log_message(self, format, *args):
        # Suppress HTTP request logging
        pass

def run_exporter(port=9102):
    """Run the Prometheus metrics exporter"""
    deluge_api = DelugeAPI()
    
    # Test initial connection
    if not deluge_api.login():
        print("Failed to connect to Deluge. Exporter will still start but metrics may be empty.")
    
    def handler(*args, **kwargs):
        return MetricsHandler(deluge_api, *args, **kwargs)
    
    server = HTTPServer(('0.0.0.0', port), handler)
    print(f"Deluge Prometheus exporter running on port {port}")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nExporter shutting down...")
        server.shutdown()

if __name__ == '__main__':
    run_exporter()