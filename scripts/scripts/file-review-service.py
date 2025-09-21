#!/usr/bin/env python3
"""
File Review Service for Data Recovery Operations
Simple web interface to help categorize and manage recovered files
"""

import os
import json
from pathlib import Path
from flask import Flask, render_template_string, request, jsonify, send_file
import mimetypes
from datetime import datetime

app = Flask(__name__)

# Configuration
STAGING_ROOT = "/mnt/staging"
REVIEW_DATA_FILE = "/tmp/file_review_data.json"

def load_review_data():
    """Load existing review decisions"""
    if os.path.exists(REVIEW_DATA_FILE):
        with open(REVIEW_DATA_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_review_data(data):
    """Save review decisions"""
    with open(REVIEW_DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def scan_staging_directories():
    """Scan staging directories for files to review"""
    files_to_review = []
    
    for root, dirs, files in os.walk(STAGING_ROOT):
        for file in files:
            if file.startswith('.') or file.endswith(('.log', '.img')):
                continue
                
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, STAGING_ROOT)
            
            try:
                stat = os.stat(full_path)
                file_info = {
                    'path': rel_path,
                    'full_path': full_path,
                    'size': stat.st_size,
                    'modified': datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d %H:%M'),
                    'type': mimetypes.guess_type(full_path)[0] or 'unknown'
                }
                files_to_review.append(file_info)
            except OSError:
                continue
    
    return sorted(files_to_review, key=lambda x: x['size'], reverse=True)

HTML_TEMPLATE = '''
<!DOCTYPE html>
<html>
<head>
    <title>Recovery File Review</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #2c3e50; color: white; padding: 15px; margin-bottom: 20px; }
        .file-item { border: 1px solid #ddd; margin: 10px 0; padding: 15px; }
        .file-info { display: flex; justify-content: space-between; align-items: center; }
        .file-details { flex-grow: 1; }
        .file-actions { display: flex; gap: 10px; }
        .btn { padding: 8px 16px; border: none; cursor: pointer; }
        .btn-keep { background: #27ae60; color: white; }
        .btn-delete { background: #e74c3c; color: white; }
        .btn-unsure { background: #f39c12; color: white; }
        .status-keep { border-left: 5px solid #27ae60; }
        .status-delete { border-left: 5px solid #e74c3c; }
        .status-unsure { border-left: 5px solid #f39c12; }
        .summary { background: #ecf0f1; padding: 15px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 Recovery File Review Service</h1>
        <p>Review recovered files and mark them for Keep/Delete/Unsure</p>
    </div>
    
    <div class="summary">
        <strong>Summary:</strong> {{ files|length }} files found | 
        Keep: <span id="keep-count">0</span> | 
        Delete: <span id="delete-count">0</span> | 
        Unsure: <span id="unsure-count">0</span>
    </div>
    
    <div id="file-list">
        {% for file in files %}
        <div class="file-item" id="file-{{ loop.index }}" data-path="{{ file.path }}">
            <div class="file-info">
                <div class="file-details">
                    <strong>{{ file.path }}</strong><br>
                    Size: {{ "%.1f"|format(file.size/1024/1024) }} MB | 
                    Type: {{ file.type }} | 
                    Modified: {{ file.modified }}
                </div>
                <div class="file-actions">
                    <button class="btn btn-keep" onclick="markFile('{{ file.path }}', 'keep')">Keep</button>
                    <button class="btn btn-unsure" onclick="markFile('{{ file.path }}', 'unsure')">Unsure</button>
                    <button class="btn btn-delete" onclick="markFile('{{ file.path }}', 'delete')">Delete</button>
                </div>
            </div>
        </div>
        {% endfor %}
    </div>
    
    <script>
        let reviewData = {};
        
        function markFile(path, action) {
            reviewData[path] = action;
            
            // Update UI
            const fileElement = document.querySelector('[data-path="' + path + '"]');
            fileElement.className = 'file-item status-' + action;
            
            // Update counts
            updateCounts();
            
            // Save to server
            fetch('/api/mark', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({path: path, action: action})
            });
        }
        
        function updateCounts() {
            const counts = {keep: 0, delete: 0, unsure: 0};
            Object.values(reviewData).forEach(action => counts[action]++);
            
            document.getElementById('keep-count').textContent = counts.keep;
            document.getElementById('delete-count').textContent = counts.delete;
            document.getElementById('unsure-count').textContent = counts.unsure;
        }
        
        // Load existing review data
        fetch('/api/data').then(r => r.json()).then(data => {
            reviewData = data;
            Object.entries(data).forEach(([path, action]) => {
                const fileElement = document.querySelector('[data-path="' + path + '"]');
                if (fileElement) {
                    fileElement.className = 'file-item status-' + action;
                }
            });
            updateCounts();
        });
    </script>
</body>
</html>
'''

@app.route('/')
def index():
    files = scan_staging_directories()
    return render_template_string(HTML_TEMPLATE, files=files)

@app.route('/api/data')
def get_review_data():
    return jsonify(load_review_data())

@app.route('/api/mark', methods=['POST'])
def mark_file():
    data = request.json
    review_data = load_review_data()
    review_data[data['path']] = data['action']
    save_review_data(review_data)
    return jsonify({'status': 'success'})

@app.route('/api/execute', methods=['POST'])
def execute_decisions():
    """Execute the file decisions (delete marked files)"""
    review_data = load_review_data()
    results = {'deleted': 0, 'kept': 0, 'errors': []}
    
    for path, action in review_data.items():
        full_path = os.path.join(STAGING_ROOT, path)
        if action == 'delete' and os.path.exists(full_path):
            try:
                os.remove(full_path)
                results['deleted'] += 1
            except OSError as e:
                results['errors'].append(f"{path}: {str(e)}")
        elif action == 'keep':
            results['kept'] += 1
    
    return jsonify(results)

if __name__ == '__main__':
    print(f"Starting File Review Service...")
    print(f"Access at: http://192.168.0.99:5000")
    print(f"Staging root: {STAGING_ROOT}")
    app.run(host='0.0.0.0', port=5000, debug=True)