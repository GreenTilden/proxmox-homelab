#!/usr/bin/env python3
"""
Enhanced file browser server with directory navigation
Usage: python3 file-browser-server.py [port] [directory]
"""

import os
import sys
import urllib.parse
import html
from http.server import HTTPServer, SimpleHTTPRequestHandler

class FileBrowserHandler(SimpleHTTPRequestHandler):
    """HTTP server that handles file browsing with directory navigation"""

    def do_GET(self):
        """Handle GET requests for browsing files and directories"""
        try:
            # Parse the URL path
            parsed_path = urllib.parse.unquote(self.path)
            if parsed_path.startswith('/'):
                parsed_path = parsed_path[1:]

            # Construct full path
            full_path = os.path.join(self.server.base_dir, parsed_path)

            # Security check - don't allow going outside base directory
            if not os.path.abspath(full_path).startswith(os.path.abspath(self.server.base_dir)):
                self.send_error(403, "Access denied")
                return

            if os.path.isfile(full_path):
                # Serve the file
                self.path = '/' + parsed_path
                super().do_GET()
                return

            elif os.path.isdir(full_path):
                # Show directory listing
                self.send_response(200)
                self.send_header('Content-Type', 'text/html')
                self.end_headers()

                # Get relative path for display
                rel_path = os.path.relpath(full_path, self.server.base_dir)
                if rel_path == '.':
                    rel_path = ''

                html_content = f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <title>File Browser - {html.escape(rel_path or 'Root')}</title>
                    <style>
                        body {{ font-family: Arial, sans-serif; margin: 20px; }}
                        .header {{ background: #f0f0f0; padding: 10px; border-radius: 5px; margin-bottom: 20px; }}
                        .nav {{ margin-bottom: 20px; }}
                        .nav a {{ text-decoration: none; color: #0066cc; margin-right: 10px; }}
                        .file-list {{ list-style: none; padding: 0; }}
                        .file-list li {{ padding: 5px; border-bottom: 1px solid #eee; }}
                        .file-list a {{ text-decoration: none; color: #333; }}
                        .file-list a:hover {{ background: #f5f5f5; }}
                        .directory {{ font-weight: bold; color: #0066cc; }}
                        .file {{ color: #333; }}
                        .upload-form {{ background: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px; }}
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>[FOLDER] File Browser</h2>
                        <p><strong>Current Directory:</strong> /{html.escape(rel_path)}</p>
                    </div>
                """

                # Add navigation breadcrumb
                if rel_path:
                    html_content += '<div class="nav">'
                    html_content += '<a href="/">[HOME] Root</a>'

                    path_parts = rel_path.split(os.sep)
                    current_path = ""
                    for part in path_parts[:-1]:  # Don't include current directory
                        current_path = os.path.join(current_path, part)
                        encoded_path = urllib.parse.quote(current_path)
                        html_content += f' / <a href="/{encoded_path}">[FOLDER] {html.escape(part)}</a>'

                    # Current directory (not clickable)
                    html_content += f' / <span class="directory">[FOLDER] {html.escape(path_parts[-1])}</span>'
                    html_content += '</div>'

                # Upload form
                html_content += '''
                    <div class="upload-form">
                        <h3>[UPLOAD] Upload Files Here</h3>
                        <form action="" method="post" enctype="multipart/form-data">
                            <input type="file" name="file" multiple style="margin-bottom: 10px;">
                            <br>
                            <input type="submit" value="Upload" style="padding: 5px 15px;">
                        </form>
                    </div>
                '''

                # File and directory listing
                html_content += '<div class="file-list"><h3>[LIST] Contents:</h3><ul>'

                # Parent directory link
                if rel_path:
                    parent_path = os.path.dirname(rel_path)
                    if parent_path:
                        encoded_parent = urllib.parse.quote(parent_path)
                        html_content += f'<li><a href="/{encoded_parent}" class="directory">[FOLDER] .. (Parent Directory)</a></li>'
                    else:
                        html_content += f'<li><a href="/" class="directory">[FOLDER] .. (Parent Directory)</a></li>'

                try:
                    items = sorted(os.listdir(full_path))

                    # Directories first
                    for item in items:
                        item_path = os.path.join(full_path, item)
                        if os.path.isdir(item_path):
                            # Create URL for directory
                            if rel_path:
                                item_url = urllib.parse.quote(os.path.join(rel_path, item))
                            else:
                                item_url = urllib.parse.quote(item)
                            html_content += f'<li><a href="/{item_url}" class="directory">[FOLDER] {html.escape(item)}/</a></li>'

                    # Files second
                    for item in items:
                        item_path = os.path.join(full_path, item)
                        if os.path.isfile(item_path):
                            # Create URL for file
                            if rel_path:
                                item_url = urllib.parse.quote(os.path.join(rel_path, item))
                            else:
                                item_url = urllib.parse.quote(item)

                            # Get file size
                            file_size = os.path.getsize(item_path)
                            size_str = self.format_file_size(file_size)

                            html_content += f'<li><a href="/{item_url}" class="file">[FILE] {html.escape(item)} <small>({size_str})</small></a></li>'

                except PermissionError:
                    html_content += '<li><em>Permission denied</em></li>'

                html_content += '''
                    </ul></div>
                    </body>
                    </html>
                '''

                self.wfile.write(html_content.encode())
            else:
                self.send_error(404, "File not found")

        except Exception as e:
            self.send_error(500, f"Server error: {str(e)}")

    def format_file_size(self, size):
        """Format file size in human readable format"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024:
                return f"{size:.1f} {unit}"
            size /= 1024
        return f"{size:.1f} TB"

    def do_POST(self):
        """Handle file upload"""
        try:
            # Get current directory from URL
            parsed_path = urllib.parse.unquote(self.path)
            if parsed_path.startswith('/'):
                parsed_path = parsed_path[1:]

            upload_dir = os.path.join(self.server.base_dir, parsed_path)

            content_type = self.headers.get('Content-Type', '')
            if 'multipart/form-data' in content_type:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)

                # Extract filename and data (basic parsing)
                boundary = content_type.split('boundary=')[1].encode()
                parts = post_data.split(boundary)

                uploaded_files = []
                for part in parts:
                    if b'filename=' in part:
                        # Extract filename
                        lines = part.split(b'\r\n')
                        filename_line = [line for line in lines if b'filename=' in line][0]
                        filename = filename_line.split(b'filename="')[1].split(b'"')[0].decode()

                        if filename:
                            # Extract file data
                            data_start = part.find(b'\r\n\r\n') + 4
                            file_data = part[data_start:]
                            if file_data.endswith(b'\r\n'):
                                file_data = file_data[:-2]

                            # Save file
                            filepath = os.path.join(upload_dir, filename)
                            with open(filepath, 'wb') as f:
                                f.write(file_data)
                            uploaded_files.append(filename)

                # Redirect back to current directory
                self.send_response(302)
                self.send_header('Location', self.path)
                self.end_headers()
                return

            self.send_response(400)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(b'Upload failed')

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(f'Error: {str(e)}'.encode())

def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8021
    directory = sys.argv[2] if len(sys.argv) > 2 else os.getcwd()

    directory = os.path.abspath(directory)

    class CustomHTTPServer(HTTPServer):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self.base_dir = directory

    os.chdir(directory)

    with CustomHTTPServer(('0.0.0.0', port), FileBrowserHandler) as server:
        print(f"File browser serving from: {directory}")
        print(f"Server running on http://0.0.0.0:{port}")
        print("Browse directories and download files via web interface")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped")

if __name__ == '__main__':
    main()