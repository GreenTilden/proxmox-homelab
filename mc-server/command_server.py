"""LCiB Dashboard Command Server — Flask app with Blueprint modules."""
from flask import Flask
from flask_cors import CORS

from blueprints.shared import CONFIG, check_token
from blueprints import infrastructure, ha, oliver, calendar, cathy, freezer, tasks, financials
from blueprints import health as health_bp

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024 * 1024  # 50 GB max upload
CORS(app, origins=CONFIG['cors_origins'])
app.before_request(check_token)

for bp in [infrastructure.bp, ha.bp, oliver.bp, calendar.bp,
           cathy.bp, freezer.bp, tasks.bp, financials.bp,
           health_bp.bp]:
    app.register_blueprint(bp)


@app.route('/api/health-check', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return {"status": "ok"}, 200


if __name__ == '__main__':
    if not CONFIG['secret_token']:
        raise ValueError("COMMAND_SERVER_TOKEN environment variable not set. Please create a .env file.")
    app.run(host='0.0.0.0', port=5001)
