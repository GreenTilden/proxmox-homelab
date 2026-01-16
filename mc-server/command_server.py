import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Get the secret token from environment variables
SECRET_TOKEN = os.getenv("COMMAND_SERVER_TOKEN")

@app.before_request
def check_token():
    """Check for a valid secret token on all requests."""
    # Allow OPTIONS requests (CORS preflight) without auth
    if request.method == 'OPTIONS':
        return

    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Authorization header missing"}), 401
    
    try:
        auth_type, token = auth_header.split()
        if auth_type.lower() != 'bearer' or token != SECRET_TOKEN:
            return jsonify({"error": "Invalid or missing token"}), 403
    except ValueError:
        return jsonify({"error": "Invalid Authorization header format"}), 401

@app.route('/api/rescan-plex', methods=['POST'])
def rescan_plex_endpoint():
    """Execute the Plex library rescan script."""
    script_path = '/home/darney/projects/proxmox-homelab/scripts/rescan_plex.sh' # Using absolute path

    if not os.path.exists(script_path):
        return jsonify({"error": f"Script not found at {script_path}"}), 500

    try:
        # Make the script executable and run it
        subprocess.run(['chmod', '+x', script_path], check=True)
        result = subprocess.run([script_path], capture_output=True, text=True, check=True)

        return jsonify({
            "message": "Plex rescan initiated successfully.",
            "output": result.stdout,
            "error_output": result.stderr
        }), 200
    except subprocess.CalledProcessError as e:
        return jsonify({
            "error": "Script execution failed.",
            "details": e.stderr
        }), 500
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred.", "details": str(e)}), 500

@app.route('/api/refresh-cync', methods=['POST'])
def refresh_cync_endpoint():
    """Reload the Cync integration in Home Assistant."""
    script_path = '/home/darney/projects/proxmox-homelab/scripts/refresh_cync.sh'

    if not os.path.exists(script_path):
        return jsonify({"error": f"Script not found at {script_path}"}), 500

    ha_token = os.getenv("HA_TOKEN")
    if not ha_token or ha_token == "YOUR_HA_TOKEN_HERE":
        return jsonify({"error": "HA_TOKEN not configured in .env file"}), 500

    try:
        subprocess.run(['chmod', '+x', script_path], check=True)
        env = os.environ.copy()
        env['HA_TOKEN'] = ha_token
        result = subprocess.run([script_path], capture_output=True, text=True, check=True, env=env)

        return jsonify({
            "message": "Cync integration refreshed successfully.",
            "output": result.stdout,
            "error_output": result.stderr
        }), 200
    except subprocess.CalledProcessError as e:
        return jsonify({
            "error": "Failed to refresh Cync integration.",
            "details": e.stderr or e.stdout
        }), 500
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred.", "details": str(e)}), 500

if __name__ == '__main__':
    if not SECRET_TOKEN:
        raise ValueError("COMMAND_SERVER_TOKEN environment variable not set. Please create a .env file.")
    app.run(host='0.0.0.0', port=5001)
