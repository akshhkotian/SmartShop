from flask import Blueprint, request, jsonify
from backend.db import execute_query

product_bp = Blueprint('products', __name__, url_prefix='/api')

@product_bp.route('/products', methods=['GET'])
def get_products():
    category = request.args.get('category', '').strip()
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    min_rating = request.args.get('min_rating', type=float)
    sort_by = request.args.get('sort_by', 'popularity')
    search = request.args.get('search', '').strip()
    featured_only = request.args.get('featured', type=int)
    trending_only = request.args.get('trending', type=int)
    limit = request.args.get('limit', 20, type=int)
    page = request.args.get('page', 1, type=int)
    offset = (page - 1) * limit

    conditions = ["1=1"]
    params = []

    if category:
        if category.isdigit():
            conditions.append("p.category_id = %s")
            params.append(int(category))
        else:
            conditions.append("(c.slug = %s OR c.name LIKE %s)")
            params.extend([category, f"%{category}%"])

    if min_price is not None:
        conditions.append("p.price >= %s")
        params.append(min_price)

    if max_price is not None:
        conditions.append("p.price <= %s")
        params.append(max_price)

    if min_rating is not None:
        conditions.append("p.rating >= %s")
        params.append(min_rating)

    if search:
        conditions.append("(p.name LIKE %s OR p.description LIKE %s OR c.name LIKE %s)")
        wildcard = f"%{search}%"
        params.extend([wildcard, wildcard, wildcard])

    if featured_only:
        conditions.append("p.is_featured = 1")

    if trending_only:
        conditions.append("p.is_trending = 1")

    where_clause = " AND ".join(conditions)

    # Sorting
    sort_sql = "p.review_count DESC, p.rating DESC" # default popularity
    if sort_by == 'price_asc':
        sort_sql = "p.price ASC"
    elif sort_by == 'price_desc':
        sort_sql = "p.price DESC"
    elif sort_by == 'rating':
        sort_sql = "p.rating DESC, p.review_count DESC"
    elif sort_by == 'newest':
        sort_sql = "p.id DESC"

    # Count total
    count_sql = f"""
        SELECT COUNT(*) as total 
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE {where_clause}
    """
    total_row = execute_query(count_sql, tuple(params), fetchone=True)
    total_count = total_row['total'] if total_row else 0

    query_sql = f"""
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE {where_clause}
        ORDER BY {sort_sql}
        LIMIT %s OFFSET %s
    """
    query_params = list(params) + [limit, offset]
    products = execute_query(query_sql, tuple(query_params))

    return jsonify({
        'products': products,
        'total': total_count,
        'page': page,
        'limit': limit,
        'total_pages': (total_count + limit - 1) // limit if limit else 1
    })

@product_bp.route('/products/featured', methods=['GET'])
def get_featured_products():
    limit = request.args.get('limit', 8, type=int)
    products = execute_query("""
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_featured = 1
        ORDER BY p.rating DESC
        LIMIT %s
    """, (limit,))
    return jsonify({'products': products})

@product_bp.route('/products/trending', methods=['GET'])
def get_trending_products():
    limit = request.args.get('limit', 8, type=int)
    products = execute_query("""
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_trending = 1
        ORDER BY p.review_count DESC, p.rating DESC
        LIMIT %s
    """, (limit,))
    return jsonify({'products': products})

@product_bp.route('/products/<identifier>', methods=['GET'])
def get_product_detail(identifier):
    if identifier.isdigit():
        sql = """
            SELECT p.*, c.name as category_name, c.slug as category_slug, c.description as category_description
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = %s
        """
        params = (int(identifier),)
    else:
        sql = """
            SELECT p.*, c.name as category_name, c.slug as category_slug, c.description as category_description
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.slug = %s
        """
        params = (identifier,)

    product = execute_query(sql, params, fetchone=True)
    if not product:
        return jsonify({'error': 'Product not found.'}), 404

    # Related items in the same category
    related = execute_query("""
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.category_id = %s AND p.id != %s
        ORDER BY p.rating DESC
        LIMIT 4
    """, (product['category_id'], product['id']))

    return jsonify({
        'product': product,
        'related_products': related
    })

@product_bp.route('/products/search/suggestions', methods=['GET'])
def get_search_suggestions():
    q = request.args.get('q', '').strip()
    if not q or len(q) < 2:
        return jsonify({'suggestions': []})

    wildcard = f"%{q}%"
    rows = execute_query("""
        SELECT id, name, slug, price, image_url, rating 
        FROM products 
        WHERE name LIKE %s OR description LIKE %s
        ORDER BY review_count DESC
        LIMIT 6
    """, (wildcard, wildcard))

    categories = execute_query("""
        SELECT id, name, slug, icon 
        FROM categories 
        WHERE name LIKE %s 
        LIMIT 3
    """, (wildcard,))

    return jsonify({
        'products': rows,
        'categories': categories
    })

@product_bp.route('/categories', methods=['GET'])
def get_categories():
    categories = execute_query("""
        SELECT c.*, COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        GROUP BY c.id
        ORDER BY c.id ASC
    """)
    return jsonify({'categories': categories})
