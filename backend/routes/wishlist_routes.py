from flask import Blueprint, request, jsonify, session
from backend.db import execute_query, execute_insert, execute_non_query
from backend.config import Config

wishlist_bp = Blueprint('wishlist', __name__, url_prefix='/api/wishlist')

def get_current_user_id():
    uid = request.headers.get('X-User-Id')
    if uid:
        try:
            return int(uid)
        except ValueError:
            pass
    return session.get('user_id')

@wishlist_bp.route('', methods=['GET'])
def get_wishlist():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'items': []})

    items = execute_query("""
        SELECT w.id as wishlist_id, w.created_at,
               p.id as product_id, p.name, p.slug, p.price, p.original_price,
               p.discount_percent, p.stock, p.image_url, p.rating, p.badge,
               c.name as category_name
        FROM wishlist w
        JOIN products p ON w.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE w.user_id = %s
        ORDER BY w.id DESC
    """, (user_id,))

    return jsonify({'items': items})

@wishlist_bp.route('/toggle', methods=['POST'])
def toggle_wishlist():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'Please log in to manage your wishlist.'}), 401

    data = request.get_json() or {}
    product_id = data.get('product_id')
    if not product_id:
        return jsonify({'error': 'Product ID required.'}), 400

    product = execute_query("SELECT id, name, category_id FROM products WHERE id = %s", (product_id,), fetchone=True)
    if not product:
        return jsonify({'error': 'Product not found.'}), 404

    existing = execute_query(
        "SELECT id FROM wishlist WHERE user_id = %s AND product_id = %s",
        (user_id, product_id),
        fetchone=True
    )

    if existing:
        execute_non_query("DELETE FROM wishlist WHERE id = %s", (existing['id'],))
        return jsonify({
            'message': f"Removed '{product['name']}' from your wishlist.",
            'in_wishlist': False,
            'product_id': product_id
        })
    else:
        execute_insert(
            "INSERT INTO wishlist (user_id, product_id) VALUES (%s, %s)",
            (user_id, product_id)
        )
        # Track activity
        execute_insert(
            """INSERT INTO user_activity (user_id, activity_type, product_id, category_id, weight)
            VALUES (%s, %s, %s, %s, %s)""",
            (user_id, 'wishlist_add', product_id, product['category_id'], Config.ACTIVITY_WEIGHTS['wishlist_add'])
        )
        return jsonify({
            'message': f"Added '{product['name']}' to your wishlist.",
            'in_wishlist': True,
            'product_id': product_id
        })

@wishlist_bp.route('/<int:product_id>', methods=['DELETE'])
def remove_from_wishlist(product_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'Please log in.'}), 401

    execute_non_query(
        "DELETE FROM wishlist WHERE user_id = %s AND product_id = %s",
        (user_id, product_id)
    )
    return jsonify({'message': 'Item removed from wishlist.'})
