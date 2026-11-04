from flask import Blueprint, request, jsonify, session
from backend.db import execute_query, execute_insert, execute_non_query
from backend.config import Config

cart_bp = Blueprint('cart', __name__, url_prefix='/api/cart')

def get_current_user_id():
    uid = request.headers.get('X-User-Id')
    if uid:
        try:
            return int(uid)
        except ValueError:
            pass
    return session.get('user_id')

def ensure_user_cart(user_id):
    cart = execute_query("SELECT id FROM cart WHERE user_id = %s", (user_id,), fetchone=True)
    if cart:
        return cart['id']
    return execute_insert("INSERT INTO cart (user_id) VALUES (%s)", (user_id,))

@cart_bp.route('', methods=['GET'])
def get_cart():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({
            'items': [],
            'subtotal': 0.0,
            'discount': 0.0,
            'shipping': 0.0,
            'total': 0.0,
            'item_count': 0
        })

    cart_id = ensure_user_cart(user_id)
    items = execute_query("""
        SELECT ci.id as cart_item_id, ci.quantity, ci.product_id,
               p.name, p.slug, p.price, p.original_price, p.discount_percent,
               p.stock, p.image_url, p.rating, c.name as category_name
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE ci.cart_id = %s
        ORDER BY ci.id DESC
    """, (cart_id,))

    subtotal = sum(float(item['price']) * item['quantity'] for item in items)
    original_total = sum(float(item['original_price']) * item['quantity'] for item in items)
    discount = max(0.0, original_total - subtotal)
    shipping = 0.0 if subtotal >= 499.0 or subtotal == 0 else 49.00
    total = subtotal + shipping
    total_qty = sum(item['quantity'] for item in items)

    return jsonify({
        'items': items,
        'subtotal': round(subtotal, 2),
        'discount': round(discount, 2),
        'shipping': round(shipping, 2),
        'total': round(total, 2),
        'item_count': total_qty
    })

@cart_bp.route('/add', methods=['POST'])
def add_to_cart():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'Please log in to add items to your cart.'}), 401

    data = request.get_json() or {}
    product_id = data.get('product_id')
    quantity = int(data.get('quantity', 1))

    if not product_id or quantity < 1:
        return jsonify({'error': 'Valid product ID and quantity are required.'}), 400

    product = execute_query("SELECT id, name, category_id, stock FROM products WHERE id = %s", (product_id,), fetchone=True)
    if not product:
        return jsonify({'error': 'Product not found.'}), 404

    cart_id = ensure_user_cart(user_id)

    # Check if item exists in cart
    existing = execute_query(
        "SELECT id, quantity FROM cart_items WHERE cart_id = %s AND product_id = %s",
        (cart_id, product_id),
        fetchone=True
    )

    if existing:
        new_qty = existing['quantity'] + quantity
        execute_non_query(
            "UPDATE cart_items SET quantity = %s WHERE id = %s",
            (new_qty, existing['id'])
        )
    else:
        execute_insert(
            "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (%s, %s, %s)",
            (cart_id, product_id, quantity)
        )

    # Track activity for Apriori recommendation weighting
    execute_insert(
        """INSERT INTO user_activity (user_id, activity_type, product_id, category_id, weight)
        VALUES (%s, %s, %s, %s, %s)""",
        (user_id, 'cart_add', product_id, product['category_id'], Config.ACTIVITY_WEIGHTS['cart_add'])
    )

    return jsonify({
        'message': f"Added '{product['name']}' to your shopping cart.",
        'product_id': product_id
    })

@cart_bp.route('/update', methods=['PUT'])
def update_quantity():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'Please log in.'}), 401

    data = request.get_json() or {}
    product_id = data.get('product_id')
    quantity = int(data.get('quantity', 1))

    cart_id = ensure_user_cart(user_id)

    if quantity <= 0:
        execute_non_query(
            "DELETE FROM cart_items WHERE cart_id = %s AND product_id = %s",
            (cart_id, product_id)
        )
        return jsonify({'message': 'Item removed from cart.'})

    execute_non_query(
        "UPDATE cart_items SET quantity = %s WHERE cart_id = %s AND product_id = %s",
        (quantity, cart_id, product_id)
    )

    return jsonify({'message': 'Cart quantity updated.'})

@cart_bp.route('/remove/<int:product_id>', methods=['DELETE'])
def remove_from_cart(product_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'Please log in.'}), 401

    cart_id = ensure_user_cart(user_id)
    execute_non_query(
        "DELETE FROM cart_items WHERE cart_id = %s AND product_id = %s",
        (cart_id, product_id)
    )

    return jsonify({'message': 'Item removed from cart.'})

@cart_bp.route('/clear', methods=['POST'])
def clear_cart():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'Please log in.'}), 401

    cart_id = ensure_user_cart(user_id)
    execute_non_query("DELETE FROM cart_items WHERE cart_id = %s", (cart_id,))

    return jsonify({'message': 'Cart cleared.'})
