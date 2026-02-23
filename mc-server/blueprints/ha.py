"""Home Assistant proxy routes."""
import requests as http_requests
from flask import Blueprint, request, jsonify

from .shared import CONFIG

bp = Blueprint('ha', __name__)


def _ha_headers():
    return {
        'Authorization': f'Bearer {CONFIG["ha_token"]}',
        'Content-Type': 'application/json'
    }


@bp.route('/api/ha/states', methods=['GET'])
def ha_states():
    """Proxy HA states API to avoid CORS issues."""
    try:
        r = http_requests.get(
            f'{CONFIG["ha_url"]}/api/states',
            headers=_ha_headers(),
            timeout=10
        )
        return jsonify(r.json()), r.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 502


@bp.route('/api/ha/services/<domain>/<service>', methods=['POST'])
def ha_call_service(domain, service):
    """Proxy HA service calls to avoid CORS issues."""
    try:
        r = http_requests.post(
            f'{CONFIG["ha_url"]}/api/services/{domain}/{service}',
            headers=_ha_headers(),
            json=request.get_json(),
            timeout=10
        )
        return jsonify(r.json() if r.text else {}), r.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 502
