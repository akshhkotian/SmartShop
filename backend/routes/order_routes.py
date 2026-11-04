import json
import random
import time
from flask import Blueprint, request, jsonify, session
from backend.db import execute_query, execute_insert, execute_non_query
from backend.config import Config
from backend.ml.apriori_engine import apriori_engine

order_bp = Blueprint('orders', __name__, url_prefix='/api/orders')

def get_current_user_id():
    uid = request.headers.get('X-User-Id')
    if uid:
        try:
            return int(uid)
        except ValueError:
            pass
    return session.get('user_id')

@order_bp.route('/checkout', methods=['POST'])
def checkout():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'Authentication required to complete checkout.'}), 401

    data = request.get_json() or {}
    shipping_address = data.get('shipping_address', '').strip()
    payment_method = data.get('payment_method', 'Credit Card').strip()
    coupon_code = data.get('coupon_code', '').strip().upper()

    if not shipping_address:
        return jsonify({'error': 'Shipping address is required.'}), 400

    # Get user's cart
    cart = execute_query("SELECT id FROM cart WHERE user_id = %s", (user_id,), fetchone=True)
    if not cart:
        return jsonify({'error': 'Cart is empty.'}), 400

    cart_items = execute_query("""
        SELECT ci.product_id, ci.quantity, p.name, p.price, p.category_id, p.stock
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.cart_id = %s
    """, (cart['id'],))

    if not cart_items:
        return jsonify({'error': 'Your cart is empty. Please add items before checkout.'}), 400

    subtotal = sum(float(item['price']) * item['quantity'] for item in cart_items)
    
    # Optional coupon logic
    discount = 0.0
    if coupon_code == 'SMART20':
        discount = round(subtotal * 0.20, 2)
    elif coupon_code == 'WELCOME10':
        discount = round(subtotal * 0.10, 2)

    shipping_fee = 0.0 if (subtotal - discount) >= 499.0 else 49.00
    final_amount = round(subtotal - discount + shipping_fee, 2)

    order_number = f"ORD-{int(time.time())}-{random.randint(1000, 9999)}"

    # 1. Create order
    order_id = execute_insert(
        """INSERT INTO orders 
        (user_id, order_number, total_amount, discount_amount, shipping_fee, final_amount, status, payment_method, shipping_address)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
        (user_id, order_number, subtotal, discount, shipping_fee, final_amount, 'Confirmed', payment_method, shipping_address)
    )

    purchased_pids = []
    # 2. Insert order items & reduce stock & record user purchase activity
    for item in cart_items:
        pid = item['product_id']
        qty = item['quantity']
        u_price = float(item['price'])
        t_price = round(u_price * qty, 2)
        purchased_pids.append(pid)

        execute_insert(
            """INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
            VALUES (%s, %s, %s, %s, %s)""",
            (order_id, pid, qty, u_price, t_price)
        )

        # Update stock
        execute_non_query(
            "UPDATE products SET stock = MAX(0, stock - %s) WHERE id = %s",
            (qty, pid)
        )

        # Track high-weight purchase activity for Apriori interest profile
        execute_insert(
            """INSERT INTO user_activity (user_id, activity_type, product_id, category_id, weight)
            VALUES (%s, %s, %s, %s, %s)""",
            (user_id, 'purchase', pid, item['category_id'], Config.ACTIVITY_WEIGHTS['purchase'])
        )

    # 3. Store new transaction basket for continuous Apriori learning
    if len(purchased_pids) > 1:
        execute_insert(
            "INSERT INTO transactions (transaction_code, user_id, product_ids_json, transaction_type) VALUES (%s, %s, %s, %s)",
            (f"TXN-{order_number}", user_id, json.dumps(purchased_pids), 'purchase')
        )
        # Retrain Apriori engine asynchronously/in-memory
        try:
            apriori_engine.train()
        except Exception as e:
            print(f"[Order] Apriori retrain warning: {e}")

    # 4. Clear cart
    execute_non_query("DELETE FROM cart_items WHERE cart_id = %s", (cart['id'],))

    return jsonify({
        'message': 'Order placed successfully! Thank you for shopping with ShopSmart.',
        'order': {
            'id': order_id,
            'order_number': order_number,
            'subtotal': subtotal,
            'discount': discount,
            'shipping_fee': shipping_fee,
            'final_amount': final_amount,
            'status': 'Confirmed',
            'item_count': sum(item['quantity'] for item in cart_items),
            'shipping_address': shipping_address,
            'payment_method': payment_method
        }
    }), 201

@order_bp.route('', methods=['GET'])
def get_user_orders():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'orders': []})

    orders = execute_query("""
        SELECT o.*, COUNT(oi.id) as total_items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = %s
        GROUP BY o.id
        ORDER BY o.created_at DESC
    """, (user_id,))

    # Attach preview item info
    for o in orders:
        items = execute_query("""
            SELECT oi.quantity, oi.unit_price, oi.total_price, p.name, p.image_url, p.slug
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = %s
        """, (o['id'],))
        o['items'] = items

    return jsonify({'orders': orders})

@order_bp.route('/<int:order_id>', methods=['GET'])
def get_order_detail(order_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'Authentication required.'}), 401

    order = execute_query(
        "SELECT * FROM orders WHERE id = %s AND user_id = %s",
        (order_id, user_id),
        fetchone=True
    )
    if not order:
        return jsonify({'error': 'Order not found.'}), 404

    items = execute_query("""
        SELECT oi.*, p.name, p.slug, p.image_url, p.rating
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = %s
    """, (order_id,))

    order['items'] = items
    return jsonify({'order': order})
