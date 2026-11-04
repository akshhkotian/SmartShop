from flask import Blueprint, request, jsonify, session
from backend.db import execute_query, execute_insert, execute_non_query
from backend.ml.apriori_engine import apriori_engine

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def verify_admin_access():
    # Allow if admin_id in session or X-Admin-Auth header
    admin_auth = request.headers.get('X-Admin-Auth')
    if admin_auth == 'true' or session.get('is_admin'):
        return True
    return False

@admin_bp.route('/metrics', methods=['GET'])
def get_metrics():
    # 1. Total counts
    u_count = execute_query("SELECT COUNT(*) as cnt FROM users", fetchone=True)['cnt']
    p_count = execute_query("SELECT COUNT(*) as cnt FROM products", fetchone=True)['cnt']
    o_count = execute_query("SELECT COUNT(*) as cnt FROM orders", fetchone=True)['cnt']
    sales_res = execute_query("SELECT COALESCE(SUM(final_amount), 0) as total FROM orders", fetchone=True)
    total_sales = float(sales_res['total'])

    # 2. Category Distribution
    cat_distribution = execute_query("""
        SELECT c.name, COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        GROUP BY c.id
        ORDER BY product_count DESC
    """)

    # 3. Monthly/Recent Sales Timeline (mock/aggregated)
    sales_timeline = [
        {"month": "May", "sales": 1420.00, "orders": 12},
        {"month": "Jun", "sales": 2350.50, "orders": 19},
        {"month": "Jul", "sales": 3120.00, "orders": 26},
        {"month": "Aug", "sales": 4890.75, "orders": 38},
        {"month": "Sep", "sales": 5420.00, "orders": 44},
        {"month": "Oct", "sales": 6910.25, "orders": 55},
        {"month": "Nov", "sales": 8240.00, "orders": 68}
    ]

    # Add real current sales if orders exist
    real_orders = execute_query("SELECT final_amount, created_at FROM orders")
    if real_orders:
        sum_real = sum(float(o['final_amount']) for o in real_orders)
        sales_timeline[-1]['sales'] += sum_real
        sales_timeline[-1]['orders'] += len(real_orders)

    return jsonify({
        'total_users': u_count,
        'total_products': p_count,
        'total_orders': o_count,
        'total_sales': round(total_sales, 2),
        'category_distribution': cat_distribution,
        'sales_timeline': sales_timeline,
        'active_rules_count': len(apriori_engine.rules_df)
    })

@admin_bp.route('/products', methods=['GET'])
def get_admin_products():
    products = execute_query("""
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.id ASC
    """)
    return jsonify({'products': products})

@admin_bp.route('/products', methods=['POST'])
def create_product():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    category_id = data.get('category_id')
    price = float(data.get('price', 0))
    original_price = float(data.get('original_price', price))
    stock = int(data.get('stock', 20))
    description = data.get('description', '').strip()
    image_url = data.get('image_url', '').strip()
    badge = data.get('badge')
    is_featured = int(data.get('is_featured', 0))
    is_trending = int(data.get('is_trending', 0))

    if not name or not category_id or price <= 0:
        return jsonify({'error': 'Name, valid category, and positive price are required.'}), 400

    import re
    slug = re.sub(r'[^a-zA-Z0-9]+', '-', name.lower()).strip('-')
    # ensure uniqueness
    slug_existing = execute_query("SELECT id FROM products WHERE slug = %s", (slug,), fetchone=True)
    if slug_existing:
        slug = f"{slug}-{int(time.time())}"

    discount_percent = int(max(0, ((original_price - price) / original_price) * 100)) if original_price > price else 0

    new_id = execute_insert("""
        INSERT INTO products 
        (name, slug, category_id, description, price, original_price, discount_percent, stock, image_url, badge, is_featured, is_trending)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (name, slug, category_id, description, price, original_price, discount_percent, stock, image_url, badge, is_featured, is_trending))

    # Refresh engine lookup
    apriori_engine.load_transactions()

    return jsonify({'message': 'Product created successfully!', 'product_id': new_id}), 201

@admin_bp.route('/products/<int:prod_id>', methods=['PUT'])
def update_product(prod_id):
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    category_id = data.get('category_id')
    price = float(data.get('price', 0))
    original_price = float(data.get('original_price', price))
    stock = int(data.get('stock', 0))
    description = data.get('description', '').strip()
    image_url = data.get('image_url', '').strip()
    badge = data.get('badge')
    is_featured = int(data.get('is_featured', 0))
    is_trending = int(data.get('is_trending', 0))

    discount_percent = int(max(0, ((original_price - price) / original_price) * 100)) if original_price > price else 0

    execute_non_query("""
        UPDATE products 
        SET name = %s, category_id = %s, price = %s, original_price = %s,
            discount_percent = %s, stock = %s, description = %s,
            image_url = %s, badge = %s, is_featured = %s, is_trending = %s
        WHERE id = %s
    """, (name, category_id, price, original_price, discount_percent, stock, description, image_url, badge, is_featured, is_trending, prod_id))

    apriori_engine.load_transactions()
    return jsonify({'message': 'Product updated successfully.'})

@admin_bp.route('/products/<int:prod_id>', methods=['DELETE'])
def delete_product(prod_id):
    execute_non_query("DELETE FROM products WHERE id = %s", (prod_id,))
    apriori_engine.load_transactions()
    return jsonify({'message': 'Product deleted successfully.'})

@admin_bp.route('/orders', methods=['GET'])
def get_admin_orders():
    orders = execute_query("""
        SELECT o.*, u.full_name, u.email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
    """)
    for o in orders:
        items = execute_query("""
            SELECT oi.*, p.name, p.image_url
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = %s
        """, (o['id'],))
        o['items'] = items
    return jsonify({'orders': orders})

@admin_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    data = request.get_json() or {}
    status = data.get('status', 'Processing')
    execute_non_query("UPDATE orders SET status = %s WHERE id = %s", (status, order_id))
    return jsonify({'message': f'Order status updated to {status}.'})

@admin_bp.route('/users', methods=['GET'])
def get_admin_users():
    users = execute_query("""
        SELECT u.id, u.username, u.email, u.full_name, u.phone, u.city, u.created_at,
               COUNT(DISTINCT o.id) as order_count,
               COALESCE(SUM(o.final_amount), 0) as total_spent
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        GROUP BY u.id
        ORDER BY u.id ASC
    """)
    return jsonify({'users': users})

@admin_bp.route('/rules', methods=['GET'])
def get_admin_rules():
    rules = apriori_engine.get_mined_rules_summary()
    return jsonify({'rules': rules, 'total_rules': len(rules)})

@admin_bp.route('/analytics', methods=['GET'])
def get_analytics():
    # Top searched terms
    top_searches = execute_query("""
        SELECT search_query, COUNT(*) as query_count 
        FROM search_history 
        GROUP BY search_query 
        ORDER BY query_count DESC 
        LIMIT 6
    """)

    # Top viewed products
    top_views = execute_query("""
        SELECT p.name, p.image_url, COUNT(bh.id) as view_count
        FROM browsing_history bh
        JOIN products p ON bh.product_id = p.id
        GROUP BY p.id
        ORDER BY view_count DESC
        LIMIT 5
    """)

    # Top purchased products
    top_purchased = execute_query("""
        SELECT p.name, p.image_url, SUM(oi.quantity) as total_sold, SUM(oi.total_price) as total_revenue
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        GROUP BY p.id
        ORDER BY total_sold DESC
        LIMIT 5
    """)

    return jsonify({
        'top_searches': top_searches,
        'top_views': top_views,
        'top_purchased': top_purchased
    })
