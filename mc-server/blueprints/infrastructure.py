"""Infrastructure routes: rescan-plex, refresh-cync, upload-media."""
import os
import subprocess
import tempfile

from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename

from .shared import CONFIG

bp = Blueprint('infrastructure', __name__)

UPLOAD_DIR = CONFIG['upload_dir']
UPLOAD_TMP = os.path.join(UPLOAD_DIR, '.upload-tmp')
os.makedirs(UPLOAD_TMP, exist_ok=True)
tempfile.tempdir = UPLOAD_TMP


@bp.route('/api/rescan-plex', methods=['POST'])
def rescan_plex():
    """Execute the Plex library rescan script."""
    script_path = '/home/darney/projects/proxmox-homelab/scripts/rescan_plex.sh'
    if not os.path.exists(script_path):
        return jsonify({"error": f"Script not found at {script_path}"}), 500
    try:
        subprocess.run(['chmod', '+x', script_path], check=True)
        result = subprocess.run([script_path], capture_output=True, text=True, check=True)
        return jsonify({
            "message": "Plex rescan initiated successfully.",
            "output": result.stdout,
            "error_output": result.stderr
        }), 200
    except subprocess.CalledProcessError as e:
        return jsonify({"error": "Script execution failed.", "details": e.stderr}), 500
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred.", "details": str(e)}), 500


@bp.route('/api/refresh-cync', methods=['POST'])
def refresh_cync():
    """Reload the Cync integration in Home Assistant."""
    script_path = '/home/darney/projects/proxmox-homelab/scripts/refresh_cync.sh'
    if not os.path.exists(script_path):
        return jsonify({"error": f"Script not found at {script_path}"}), 500
    ha_token = CONFIG['ha_token']
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
        return jsonify({"error": "Failed to refresh Cync integration.", "details": e.stderr or e.stdout}), 500
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred.", "details": str(e)}), 500


@bp.route('/api/upload-media', methods=['POST'])
def upload_media():
    """Upload a file to the media pool for sorting via mc."""
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    filename = secure_filename(file.filename)
    if not filename:
        return jsonify({"error": "Invalid filename"}), 400
    dest = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(dest):
        return jsonify({"error": f"File '{filename}' already exists in media pool"}), 409
    try:
        file.save(dest)
        return jsonify({
            "message": f"Uploaded '{filename}' to media pool. Use mc to move it to the right folder.",
            "filename": filename
        }), 200
    except Exception as e:
        return jsonify({"error": "Upload failed.", "details": str(e)}), 500
