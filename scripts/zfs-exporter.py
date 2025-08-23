#!/usr/bin/env python3
"""
ZFS Metrics Exporter for Prometheus
Exports ZFS pool and dataset metrics in Prometheus format
"""

import subprocess
import json
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading

class ZFSMetrics:
    def __init__(self):
        self.metrics = {}
        self.update_metrics()
    
    def run_command(self, cmd):
        """Execute command and return output"""
        try:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            return result.stdout.strip() if result.returncode == 0 else ""
        except Exception:
            return ""
    
    def get_zpool_metrics(self):
        """Get ZFS pool metrics"""
        pools = {}
        
        # Get pool list with detailed info
        cmd = "zpool list -H -o name,size,allocated,free,capacity,health,frag"
        output = self.run_command(cmd)
        
        for line in output.split('\n'):
            if line.strip():
                parts = line.split('\t')
                if len(parts) >= 7:
                    name = parts[0]
                    size = self.parse_size(parts[1])
                    allocated = self.parse_size(parts[2])
                    free = self.parse_size(parts[3])
                    capacity = float(parts[4].replace('%', '')) if parts[4] != '-' else 0
                    health = parts[5]
                    frag = float(parts[6].replace('%', '')) if parts[6] != '-' else 0
                    
                    pools[name] = {
                        'size_bytes': size,
                        'allocated_bytes': allocated,
                        'free_bytes': free,
                        'capacity_percent': capacity,
                        'health_status': 1 if health == 'ONLINE' else 0,
                        'fragmentation_percent': frag
                    }
        
        return pools
    
    def get_dataset_metrics(self):
        """Get ZFS dataset metrics"""
        datasets = {}
        
        # Get dataset info
        cmd = "zfs list -H -o name,used,available,referenced,mountpoint"
        output = self.run_command(cmd)
        
        for line in output.split('\n'):
            if line.strip():
                parts = line.split('\t')
                if len(parts) >= 5:
                    name = parts[0]
                    used = self.parse_size(parts[1])
                    available = self.parse_size(parts[2])
                    referenced = self.parse_size(parts[3])
                    mountpoint = parts[4]
                    
                    datasets[name] = {
                        'used_bytes': used,
                        'available_bytes': available,
                        'referenced_bytes': referenced,
                        'mounted': 1 if mountpoint != '-' else 0
                    }
        
        return datasets
    
    def parse_size(self, size_str):
        """Convert size string to bytes"""
        if not size_str or size_str == '-':
            return 0
        
        size_str = size_str.upper()
        multipliers = {
            'K': 1024,
            'M': 1024**2,
            'G': 1024**3,
            'T': 1024**4,
            'P': 1024**5
        }
        
        if size_str[-1] in multipliers:
            return float(size_str[:-1]) * multipliers[size_str[-1]]
        else:
            return float(size_str)
    
    def get_recovery_metrics(self):
        """Get data recovery metrics"""
        recovery = {}
        
        # Count files in recovery directories
        dirs = {
            'carved_originals': '/media-pool/carved-originals',
            'personal_photos': '/media-pool/media/personal-photos',
            'final_recovery': '/media-pool/media/final-recovery'
        }
        
        for key, path in dirs.items():
            file_count = self.run_command(f"find {path} -type f 2>/dev/null | wc -l")
            dir_size = self.run_command(f"du -sb {path} 2>/dev/null | cut -f1")
            
            recovery[key] = {
                'file_count': int(file_count) if file_count else 0,
                'size_bytes': int(dir_size) if dir_size else 0
            }
        
        return recovery
    
    def update_metrics(self):
        """Update all metrics"""
        self.metrics = {
            'pools': self.get_zpool_metrics(),
            'datasets': self.get_dataset_metrics(),
            'recovery': self.get_recovery_metrics(),
            'timestamp': int(time.time())
        }
    
    def generate_prometheus_metrics(self):
        """Generate Prometheus format metrics"""
        lines = []
        
        # Pool metrics
        for pool_name, pool_data in self.metrics['pools'].items():
            labels = f'pool="{pool_name}"'
            lines.append(f'zfs_pool_size_bytes{{{labels}}} {pool_data["size_bytes"]}')
            lines.append(f'zfs_pool_allocated_bytes{{{labels}}} {pool_data["allocated_bytes"]}')
            lines.append(f'zfs_pool_free_bytes{{{labels}}} {pool_data["free_bytes"]}')
            lines.append(f'zfs_pool_capacity_percent{{{labels}}} {pool_data["capacity_percent"]}')
            lines.append(f'zfs_pool_health_status{{{labels}}} {pool_data["health_status"]}')
            lines.append(f'zfs_pool_fragmentation_percent{{{labels}}} {pool_data["fragmentation_percent"]}')
        
        # Dataset metrics
        for dataset_name, dataset_data in self.metrics['datasets'].items():
            labels = f'dataset="{dataset_name}"'
            lines.append(f'zfs_dataset_used_bytes{{{labels}}} {dataset_data["used_bytes"]}')
            lines.append(f'zfs_dataset_available_bytes{{{labels}}} {dataset_data["available_bytes"]}')
            lines.append(f'zfs_dataset_referenced_bytes{{{labels}}} {dataset_data["referenced_bytes"]}')
            lines.append(f'zfs_dataset_mounted{{{labels}}} {dataset_data["mounted"]}')
        
        # Recovery metrics
        for category, data in self.metrics['recovery'].items():
            labels = f'category="{category}"'
            lines.append(f'recovery_files_total{{{labels}}} {data["file_count"]}')
            lines.append(f'recovery_size_bytes{{{labels}}} {data["size_bytes"]}')
        
        # Add timestamp
        lines.append(f'zfs_exporter_last_update {self.metrics["timestamp"]}')
        
        return '\n'.join(lines) + '\n'

class MetricsHandler(BaseHTTPRequestHandler):
    def __init__(self, zfs_metrics, *args):
        self.zfs_metrics = zfs_metrics
        super().__init__(*args)
    
    def do_GET(self):
        if self.path == '/metrics':
            # Update metrics on each request
            self.zfs_metrics.update_metrics()
            
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.end_headers()
            
            metrics = self.zfs_metrics.generate_prometheus_metrics()
            self.wfile.write(metrics.encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        pass  # Suppress access logs

def main():
    print("Starting ZFS Exporter on port 9101...")
    
    zfs_metrics = ZFSMetrics()
    
    def handler(*args):
        MetricsHandler(zfs_metrics, *args)
    
    httpd = HTTPServer(('0.0.0.0', 9101), handler)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("Shutting down...")
        httpd.shutdown()

if __name__ == '__main__':
    main()