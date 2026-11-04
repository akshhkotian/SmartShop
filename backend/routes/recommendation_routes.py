from flask import Blueprint, request, jsonify, session
from backend.ml.apriori_engine import apriori_engine
from backend.db import execute_query

recommendation_bp = Blueprint('recommendations', __name__, url_prefix='/api/recommendations')

def get_current_user_id():
    uid = request.headers.get('X-User-Id')
    if uid:
        try:
            return int(uid)
        except ValueError:
            pass
    return session.get('user_id')

@recommendation_bp.route('/for-you', methods=['GET'])
def get_for_you_recommendations():
    user_id = get_current_user_id()
    limit = request.args.get('limit', 8, type=int)
    
    recommendations = apriori_engine.recommend_for_user(user_id=user_id, limit=limit)
    return jsonify({
        'user_id': user_id,
        'algorithm': 'Apriori Association Rule Mining',
        'is_personalized': bool(user_id),
        'products': recommendations
    })

@recommendation_bp.route('/frequently-bought-together', methods=['GET'])
def get_frequently_bought_together():
    pids_arg = request.args.get('product_id') or request.args.get('product_ids')
    limit = request.args.get('limit', 4, type=int)

    if not pids_arg:
        # Default to trending products if no product provided
        trending = apriori_engine.get_trending_products(limit=limit)
        return jsonify({'products': trending, 'source': 'trending_fallback'})

    try:
        pids = [int(p.strip()) for p in str(pids_arg).split(',') if p.strip().isdigit()]
    except Exception:
        pids = []

    if not pids:
        return jsonify({'products': []})

    fbt_products = apriori_engine.get_frequently_bought_together(pids, limit=limit)
    return jsonify({
        'input_product_ids': pids,
        'algorithm': 'Apriori Association Rules (Consequents with High Confidence & Lift)',
        'products': fbt_products
    })

@recommendation_bp.route('/recent-searches', methods=['GET'])
def get_recent_searches_recommendations():
    user_id = get_current_user_id()
    limit = request.args.get('limit', 6, type=int)

    products = apriori_engine.get_recommendations_by_search(user_id=user_id, limit=limit)
    return jsonify({
        'algorithm': 'Apriori Rule Expansion on Recent Search Keywords',
        'products': products
    })

@recommendation_bp.route('/recently-viewed', methods=['GET'])
def get_recently_viewed():
    user_id = get_current_user_id()
    limit = request.args.get('limit', 6, type=int)

    products = apriori_engine.get_recently_viewed(user_id=user_id, limit=limit)
    return jsonify({'products': products})

@recommendation_bp.route('/trending', methods=['GET'])
def get_trending():
    limit = request.args.get('limit', 8, type=int)
    products = apriori_engine.get_trending_products(limit=limit)
    return jsonify({'products': products})

@recommendation_bp.route('/similar-interests', methods=['GET'])
def get_similar_interests():
    user_id = get_current_user_id()
    limit = request.args.get('limit', 6, type=int)

    if user_id:
        # Check top interacted categories
        top_cats = execute_query("""
            SELECT category_id, COUNT(*) as cnt
            FROM user_activity
            WHERE user_id = %s AND category_id IS NOT NULL
            GROUP BY category_id
            ORDER BY cnt DESC
            LIMIT 2
        """, (user_id,))
        if top_cats:
            cat_ids = [c['category_id'] for c in top_cats]
            placeholders = ','.join(['%s'] * len(cat_ids))
            products = execute_query(f"""
                SELECT p.*, c.name as category_name
                FROM products p
                JOIN categories c ON p.category_id = c.id
                WHERE p.category_id IN ({placeholders})
                ORDER BY p.rating DESC, p.review_count DESC
                LIMIT %s
            """, (*cat_ids, limit))
            return jsonify({'products': products})

    # Fallback to featured
    featured = execute_query("""
        SELECT p.*, c.name as category_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.is_featured = 1
        ORDER BY p.rating DESC
        LIMIT %s
    """, (limit,))
    return jsonify({'products': featured})

@recommendation_bp.route('/retrain', methods=['POST'])
def retrain_model():
    apriori_engine.train()
    rules_count = len(apriori_engine.rules_df)
    return jsonify({
        'message': f'Apriori association rules re-mined successfully. Total active rules: {rules_count}',
        'rules_count': rules_count
    })
