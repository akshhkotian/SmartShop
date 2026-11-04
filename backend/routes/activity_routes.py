from flask import Blueprint, request, jsonify, session
from backend.db import execute_query, execute_insert
from backend.config import Config

activity_bp = Blueprint('activity', __name__, url_prefix='/api/activity')

def get_current_user_id():
    uid = request.headers.get('X-User-Id')
    if uid:
        try:
            return int(uid)
        except ValueError:
            pass
    return session.get('user_id')

@activity_bp.route('/track', methods=['POST'])
def track_activity():
    user_id = get_current_user_id()
    data = request.get_json() or {}
    activity_type = data.get('activity_type')
    product_id = data.get('product_id')
    category_id = data.get('category_id')
    query_text = data.get('query_text')
    duration = data.get('duration_seconds', 10)

    if not activity_type:
        return jsonify({'error': 'Activity type is required.'}), 400

    weight = Config.ACTIVITY_WEIGHTS.get(activity_type, 1.0)

    # 1. Log to generic user_activity table if user is logged in
    if user_id:
        execute_insert(
            """INSERT INTO user_activity (user_id, activity_type, product_id, category_id, query_text, weight)
            VALUES (%s, %s, %s, %s, %s, %s)""",
            (user_id, activity_type, product_id, category_id, query_text, weight)
        )

        # 2. Specific tracking tables
        if activity_type == 'view' and product_id:
            execute_insert(
                "INSERT INTO browsing_history (user_id, product_id, duration_seconds) VALUES (%s, %s, %s)",
                (user_id, product_id, duration)
            )

        if activity_type == 'search' and query_text:
            count = data.get('results_count', 0)
            execute_insert(
                "INSERT INTO search_history (user_id, search_query, results_count) VALUES (%s, %s, %s)",
                (user_id, query_text, count)
            )

    return jsonify({'status': 'tracked', 'activity_type': activity_type})

@activity_bp.route('/summary', methods=['GET'])
def get_activity_summary():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({
            'searches_count': 0,
            'views_count': 0,
            'cart_adds_count': 0,
            'orders_count': 0,
            'top_categories': [],
            'recent_searches': []
        })

    # Summary metrics
    searches = execute_query(
        "SELECT COUNT(*) as cnt FROM user_activity WHERE user_id = %s AND activity_type = 'search'",
        (user_id,), fetchone=True
    )
    views = execute_query(
        "SELECT COUNT(*) as cnt FROM user_activity WHERE user_id = %s AND activity_type = 'view'",
        (user_id,), fetchone=True
    )
    cart_adds = execute_query(
        "SELECT COUNT(*) as cnt FROM user_activity WHERE user_id = %s AND activity_type = 'cart_add'",
        (user_id,), fetchone=True
    )
    orders = execute_query(
        "SELECT COUNT(*) as cnt FROM orders WHERE user_id = %s",
        (user_id,), fetchone=True
    )

    # Top categories explored
    top_categories = execute_query("""
        SELECT c.id, c.name, c.slug, c.icon, COUNT(ua.id) as interaction_count
        FROM user_activity ua
        JOIN categories c ON ua.category_id = c.id
        WHERE ua.user_id = %s
        GROUP BY c.id
        ORDER BY interaction_count DESC
        LIMIT 4
    """, (user_id,))

    # Recent searches
    recent_searches = execute_query(
        "SELECT search_query, created_at FROM search_history WHERE user_id = %s ORDER BY created_at DESC LIMIT 5",
        (user_id,)
    )

    return jsonify({
        'searches_count': searches['cnt'] if searches else 0,
        'views_count': views['cnt'] if views else 0,
        'cart_adds_count': cart_adds['cnt'] if cart_adds else 0,
        'orders_count': orders['cnt'] if orders else 0,
        'top_categories': top_categories,
        'recent_searches': [s['search_query'] for s in recent_searches]
    })
