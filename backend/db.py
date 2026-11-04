import os
import sqlite3
import threading
import json
from pathlib import Path
from werkzeug.security import generate_password_hash
from backend.config import Config

ACTIVE_DB = 'mysql'
_mysql_pool = None
_sqlite_conn = None
_lock = threading.Lock()

def get_mysql_connection():
    import pymysql
    import pymysql.cursors
    return pymysql.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME,
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True,
        connect_timeout=3
    )

def test_mysql_available():
    try:
        import pymysql
        conn = pymysql.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            connect_timeout=2
        )
        # Try to ensure database exists or use it
        with conn.cursor() as cur:
            cur.execute(f"CREATE DATABASE IF NOT EXISTS {Config.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        conn.select_db(Config.DB_NAME)
        conn.close()
        return True
    except Exception as e:
        return False

def get_db():
    global ACTIVE_DB
    if ACTIVE_DB == 'mysql':
        try:
            return get_mysql_connection()
        except Exception as e:
            print(f"[ShopSmart DB] MySQL connection failed ({e}). Falling back to local SQLite engine.")
            ACTIVE_DB = 'sqlite'
            return get_sqlite_connection()
    else:
        return get_sqlite_connection()

def get_sqlite_connection():
    os.makedirs(os.path.dirname(Config.SQLITE_DB_PATH), exist_ok=True)
    conn = sqlite3.connect(Config.SQLITE_DB_PATH, check_same_thread=False, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn

def execute_query(sql, params=None, fetchone=False, fetchall=True):
    """
    Unified query runner. Normalizes %s to ? for SQLite automatically.
    Returns dictionaries or list of dictionaries.
    """
    global ACTIVE_DB
    params = params or ()
    
    # Try MySQL first if configured
    if ACTIVE_DB == 'mysql':
        try:
            conn = get_mysql_connection()
            try:
                with conn.cursor() as cur:
                    cur.execute(sql, params)
                    if fetchone:
                        return cur.fetchone()
                    if fetchall:
                        return cur.fetchall()
                    return cur.rowcount
            finally:
                conn.close()
        except Exception as e:
            # Fallback to SQLite if MySQL fails at runtime
            ACTIVE_DB = 'sqlite'

    # SQLite runner
    with _lock:
        conn = get_sqlite_connection()
        try:
            # Replace %s with ? for SQLite compatibility
            sqlite_sql = sql.replace('%s', '?')
            cur = conn.cursor()
            cur.execute(sqlite_sql, params)
            if fetchone:
                row = cur.fetchone()
                return dict(row) if row else None
            if fetchall:
                rows = cur.fetchall()
                return [dict(r) for r in rows]
            conn.commit()
            return cur.rowcount
        finally:
            conn.close()

def execute_insert(sql, params=None):
    """
    Unified insert runner. Returns the last inserted ID.
    """
    global ACTIVE_DB
    params = params or ()
    
    if ACTIVE_DB == 'mysql':
        try:
            conn = get_mysql_connection()
            try:
                with conn.cursor() as cur:
                    cur.execute(sql, params)
                    return cur.lastrowid
            finally:
                conn.close()
        except Exception as e:
            ACTIVE_DB = 'sqlite'

    with _lock:
        conn = get_sqlite_connection()
        try:
            sqlite_sql = sql.replace('%s', '?')
            cur = conn.cursor()
            cur.execute(sqlite_sql, params)
            conn.commit()
            return cur.lastrowid
        finally:
            conn.close()

def execute_non_query(sql, params=None):
    """
    Unified runner for UPDATE, DELETE, CREATE, DROP.
    """
    global ACTIVE_DB
    params = params or ()
    
    if ACTIVE_DB == 'mysql':
        try:
            conn = get_mysql_connection()
            try:
                with conn.cursor() as cur:
                    cur.execute(sql, params)
                    return cur.rowcount
            finally:
                conn.close()
        except Exception:
            ACTIVE_DB = 'sqlite'

    with _lock:
        conn = get_sqlite_connection()
        try:
            sqlite_sql = sql.replace('%s', '?')
            cur = conn.cursor()
            cur.execute(sqlite_sql, params)
            conn.commit()
            return cur.rowcount
        finally:
            conn.close()

def init_database():
    """
    Initializes tables and seeds base records for either MySQL or SQLite.
    """
    global ACTIVE_DB
    print("[ShopSmart DB] Initializing database...")
    
    mysql_ok = test_mysql_available()
    if mysql_ok:
        ACTIVE_DB = 'mysql'
        print("[ShopSmart DB] Successfully verified MySQL Server connection.")
        init_mysql_schema()
    else:
        ACTIVE_DB = 'sqlite'
        print("[ShopSmart DB] Using SQLite local database engine (zero-config, high speed).")
        init_sqlite_schema()
        
    seed_tables_if_empty()
    print("[ShopSmart DB] Database initialized and verified.")

def init_mysql_schema():
    schema_path = Path(__file__).resolve().parent.parent / 'database' / 'schema.sql'
    if not schema_path.exists():
        return
    with open(schema_path, 'r', encoding='utf-8') as f:
        statements = f.read().split(';')
    import pymysql
    conn = pymysql.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME,
        autocommit=True
    )
    with conn.cursor() as cur:
        for stmt in statements:
            s = stmt.strip()
            if s and not s.lower().startswith('create database') and not s.lower().startswith('use '):
                try:
                    cur.execute(s)
                except Exception as e:
                    pass
    conn.close()

def init_sqlite_schema():
    conn = get_sqlite_connection()
    cur = conn.cursor()
    
    cur.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        city TEXT,
        postal_code TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        image_url TEXT,
        icon TEXT DEFAULT 'tag',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        original_price REAL NOT NULL,
        discount_percent INTEGER DEFAULT 0,
        stock INTEGER NOT NULL DEFAULT 50,
        rating REAL DEFAULT 4.5,
        review_count INTEGER DEFAULT 12,
        image_url TEXT NOT NULL,
        badge TEXT,
        is_featured INTEGER DEFAULT 0,
        is_trending INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS search_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        search_query TEXT NOT NULL,
        results_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS browsing_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        duration_seconds INTEGER DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cart_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE (cart_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS wishlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE (user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        order_number TEXT NOT NULL UNIQUE,
        total_amount REAL NOT NULL,
        discount_amount REAL DEFAULT 0.0,
        shipping_fee REAL DEFAULT 0.0,
        final_amount REAL NOT NULL,
        status TEXT DEFAULT 'Processing',
        payment_method TEXT DEFAULT 'Credit Card',
        shipping_address TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_activity (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        activity_type TEXT NOT NULL,
        product_id INTEGER,
        category_id INTEGER,
        query_text TEXT,
        weight REAL DEFAULT 1.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_code TEXT NOT NULL,
        user_id INTEGER,
        product_ids_json TEXT NOT NULL,
        transaction_type TEXT DEFAULT 'purchase',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recommendations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        recommendation_type TEXT NOT NULL,
        score REAL DEFAULT 1.0,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS association_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        antecedent_ids TEXT NOT NULL,
        consequent_ids TEXT NOT NULL,
        antecedent_names TEXT NOT NULL,
        consequent_names TEXT NOT NULL,
        support REAL NOT NULL,
        confidence REAL NOT NULL,
        lift REAL NOT NULL,
        leverage REAL DEFAULT 0.0,
        conviction REAL DEFAULT 1.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    conn.commit()
    conn.close()

def seed_tables_if_empty():
    from backend.seed_data import CATEGORIES, PRODUCTS, TRANSACTION_BASKETS, SAMPLE_USERS, SAMPLE_ADMIN
    
    # Check if products already exist
    existing = execute_query("SELECT COUNT(*) as count FROM products", fetchone=True)
    if existing and existing.get('count', 0) > 0:
        return
        
    print("[ShopSmart DB] Seeding initial categories and products...")
    # Seed Categories
    for cat in CATEGORIES:
        execute_non_query(
            "INSERT INTO categories (id, name, slug, description, image_url, icon) VALUES (%s, %s, %s, %s, %s, %s)",
            (cat['id'], cat['name'], cat['slug'], cat['description'], cat['image_url'], cat['icon'])
        )
        
    # Seed Products
    for p in PRODUCTS:
        execute_non_query(
            """INSERT INTO products 
            (id, category_id, name, slug, description, price, original_price, discount_percent, stock, rating, review_count, image_url, badge, is_featured, is_trending)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (
                p['id'], p['category_id'], p['name'], p['slug'], p['description'], 
                p['price'], p['original_price'], p['discount_percent'], p['stock'],
                p['rating'], p['review_count'], p['image_url'], p['badge'],
                p['is_featured'], p['is_trending']
            )
        )
        
    # Seed Users
    default_pw_hash = generate_password_hash("Password123!")
    for u in SAMPLE_USERS:
        execute_non_query(
            """INSERT INTO users (id, username, email, password_hash, full_name, phone, address, city, postal_code)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (u['id'], u['username'], u['email'], default_pw_hash, u['full_name'], u['phone'], u['address'], u['city'], u['postal_code'])
        )
        # Create empty cart for each user
        execute_non_query("INSERT INTO cart (user_id) VALUES (%s)", (u['id'],))
        
    # Seed Admin
    admin_pw_hash = generate_password_hash(SAMPLE_ADMIN['password'])
    execute_non_query(
        """INSERT INTO admins (username, email, password_hash, full_name, role)
        VALUES (%s, %s, %s, %s, %s)""",
        (SAMPLE_ADMIN['username'], SAMPLE_ADMIN['email'], admin_pw_hash, SAMPLE_ADMIN['full_name'], SAMPLE_ADMIN['role'])
    )
    
    # Seed Transactions for Apriori Mining
    for idx, basket in enumerate(TRANSACTION_BASKETS, 1):
        code = f"TXN-2026-{idx:04d}"
        u_id = (idx % len(SAMPLE_USERS)) + 1
        execute_non_query(
            "INSERT INTO transactions (transaction_code, user_id, product_ids_json, transaction_type) VALUES (%s, %s, %s, %s)",
            (code, u_id, json.dumps(basket), 'purchase')
        )
        
    # Seed Initial User Activity for sample users
    # User 1 (Aarav Sharma - Tech interest): viewed laptop, mouse, keyboard
    execute_non_query("INSERT INTO user_activity (user_id, activity_type, product_id, category_id, query_text, weight) VALUES (%s, %s, %s, %s, %s, %s)",
                      (1, 'view', 1, 1, None, 1.5))
    execute_non_query("INSERT INTO user_activity (user_id, activity_type, product_id, category_id, query_text, weight) VALUES (%s, %s, %s, %s, %s, %s)",
                      (1, 'cart_add', 3, 1, None, 3.5))
    execute_non_query("INSERT INTO user_activity (user_id, activity_type, product_id, category_id, query_text, weight) VALUES (%s, %s, %s, %s, %s, %s)",
                      (1, 'search', None, None, 'laptop', 1.0))
    execute_non_query("INSERT INTO search_history (user_id, search_query, results_count) VALUES (%s, %s, %s)",
                      (1, 'laptop', 5))
    execute_non_query("INSERT INTO browsing_history (user_id, product_id, duration_seconds) VALUES (%s, %s, %s)",
                      (1, 1, 45))
    execute_non_query("INSERT INTO browsing_history (user_id, product_id, duration_seconds) VALUES (%s, %s, %s)",
                      (1, 3, 60))
                      
    # User 2 (Ananya Iyer - Beauty/Fashion interest)
    execute_non_query("INSERT INTO user_activity (user_id, activity_type, product_id, category_id, query_text, weight) VALUES (%s, %s, %s, %s, %s, %s)",
                      (2, 'view', 12, 3, None, 1.5))
    execute_non_query("INSERT INTO user_activity (user_id, activity_type, product_id, category_id, query_text, weight) VALUES (%s, %s, %s, %s, %s, %s)",
                      (2, 'wishlist_add', 13, 3, None, 2.5))
    execute_non_query("INSERT INTO wishlist (user_id, product_id) VALUES (%s, %s)", (2, 13))
    execute_non_query("INSERT INTO browsing_history (user_id, product_id, duration_seconds) VALUES (%s, %s, %s)",
                      (2, 12, 50))
    execute_non_query("INSERT INTO search_history (user_id, search_query, results_count) VALUES (%s, %s, %s)",
                      (2, 'serum', 3))

    # User 3 (Rohan Mehta - Fitness interest)
    execute_non_query("INSERT INTO user_activity (user_id, activity_type, product_id, category_id, query_text, weight) VALUES (%s, %s, %s, %s, %s, %s)",
                      (3, 'view', 32, 7, None, 1.5))
    execute_non_query("INSERT INTO user_activity (user_id, activity_type, product_id, category_id, query_text, weight) VALUES (%s, %s, %s, %s, %s, %s)",
                      (3, 'purchase', 33, 7, None, 5.0))
    execute_non_query("INSERT INTO browsing_history (user_id, product_id, duration_seconds) VALUES (%s, %s, %s)",
                      (3, 32, 80))

    # Seed Sample Completed Order
    execute_non_query(
        """INSERT INTO orders (id, user_id, order_number, total_amount, discount_amount, shipping_fee, final_amount, status, payment_method, shipping_address)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
        (1, 1, 'ORD-2026-8812', 37985.00, 2000.00, 0.00, 35985.00, 'Delivered', 'UPI', 'Flat 402, Shanti Heights, 100ft Road, Indiranagar, Bengaluru, Karnataka, 560038')
    )
    execute_non_query("INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES (%s, %s, %s, %s, %s)",
                      (1, 2, 1, 28990.00, 28990.00))
    execute_non_query("INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES (%s, %s, %s, %s, %s)",
                      (1, 3, 1, 8995.00, 8995.00))

    print("[ShopSmart DB] Seeding completed.")
