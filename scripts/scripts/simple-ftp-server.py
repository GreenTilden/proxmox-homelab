#!/usr/bin/env python3
"""
Simple FTP server for file uploads
Usage: python3 simple-ftp-server.py [port] [directory]
"""

import os
import sys
import socketserver
from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.parse
import html

class UploadHTTPRequestHandler(SimpleHTTPRequestHandler):
    """HTTP server that handles file uploads via POST"""

    def do_POST(self):
        """Handle file upload"""
        try:
            content_type = self.headers.get('Content-Type', '')
            if 'multipart/form-data' in content_type:
                # Parse multipart data (simple implementation)
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)

                # Extract filename and data (very basic parsing)
                boundary = content_type.split('boundary=')[1].encode()
                parts = post_data.split(boundary)

                for part in parts:
                    if b'filename=' in part:
                        # Extract filename
                        lines = part.split(b'\r\n')
                        filename_line = [line for line in lines if b'filename=' in line][0]
                        filename = filename_line.split(b'filename="')[1].split(b'"')[0].decode()

                        # Extract file data
                        data_start = part.find(b'\r\n\r\n') + 4
                        file_data = part[data_start:]
                        if file_data.endswith(b'\r\n'):
                            file_data = file_data[:-2]

                        # Save file
                        if filename:
                            filepath = os.path.join(os.getcwd(), filename)
                            with open(filepath, 'wb') as f:
                                f.write(file_data)

                            self.send_response(200)
                            self.send_header('Content-Type', 'text/html')
                            self.end_headers()
                            self.wfile.write(f'File {filename} uploaded successfully!'.encode())
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

    def do_GET(self):
        """Serve files and upload form"""
        if self.path == '/':
            # Show upload form
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()

            html_content = """
            <!DOCTYPE html>
            <html>
            <head><title>File Upload Server</title></head>
            <body>
                <h2>Upload Files</h2>
                <form action="/" method="post" enctype="multipart/form-data">
                    <input type="file" name="file" multiple>
                    <input type="submit" value="Upload">
                </form>
                <hr>
                <h3>Current Directory: {}</h3>
                <ul>
            """.format(html.escape(os.getcwd()))

            # List current files
            for item in os.listdir('.'):
                if os.path.isfile(item):
                    html_content += f'<li><a href="{urllib.parse.quote(item)}">{html.escape(item)}</a></li>'

            html_content += """
                </ul>
            </body>
            </html>
            """

            self.wfile.write(html_content.encode())
        else:
            # Serve files normally
            super().do_GET()

def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8021
    directory = sys.argv[2] if len(sys.argv) > 2 else os.getcwd()

    os.chdir(directory)

    with HTTPServer(('0.0.0.0', port), UploadHTTPRequestHandler) as server:
        print(f"Serving files from {directory}")
        print(f"Upload server running on http://0.0.0.0:{port}")
        print("Upload files via web browser or curl:")
        print(f"  curl -F 'file=@filename' http://localhost:{port}/")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped")

if __name__ == '__main__':
    main()