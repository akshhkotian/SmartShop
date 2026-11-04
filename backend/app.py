import os
import sys
from pathlib import Path
from flask import Flask, jsonify, request
from flask_cors import CORS

# Ensure root directory is on PYTHONPATH
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.config import Config
from backend.db import init_database
from backend.ml.apriori_engine import apriori_engine
from backend.routes import (
    auth_bp,
    product_bp,
    cart_bp,
    wishlist_bp,
    order_bp,
    activity_bp,
    recommendation_bp,
    admin_bp
)

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for React frontend
    CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"])

    # Register API Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(product_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(wishlist_bp)
    app.register_blueprint(order_bp)
    app.register_blueprint(activity_bp)
    app.register_blueprint(recommendation_bp)
    app.register_blueprint(admin_bp)

    @app.route('/api/health', methods=['GET'])
    def health_check():
        from backend.db import ACTIVE_DB
        return jsonify({
            'status': 'online',
            'platform': 'ShopSmart E-Commerce API',
            'database_engine': ACTIVE_DB,
            'apriori_rules_count': len(apriori_engine.rules_df)
        })

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Resource not found.'}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'error': 'An internal server error occurred.', 'details': str(e)}), 500

    # Initialize DB schema & Apriori rules
    with app.app_context():
        try:
            init_database()
            print("[ShopSmart] Training initial Apriori recommendation models...")
            apriori_engine.train()
            print(f"[ShopSmart] Apriori model ready with {len(apriori_engine.rules_df)} association rules!")
        except Exception as e:
            print(f"[ShopSmart] Initialization warning: {e}")

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"\n=======================================================")
    print(f" ShopSmart Backend Server starting on http://localhost:{port}")
    print(f" Apriori Association Rule Mining Recommendation Engine Active")
    print(f"=======================================================\n")
    app.run(host='0.0.0.0', port=port, debug=False)
