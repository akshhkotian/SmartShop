from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from backend.db import execute_query, execute_insert, execute_non_query

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    full_name = data.get('full_name', '').strip()
    phone = data.get('phone', '').strip()
    address = data.get('address', '').strip()
    city = data.get('city', '').strip()
    postal_code = data.get('postal_code', '').strip()

    if not username or not email or not password or not full_name:
        return jsonify({'error': 'Username, email, full name, and password are required.'}), 400

    # Check existing username
    existing_username = execute_query(
        "SELECT id FROM users WHERE username = %s",
        (username,),
        fetchone=True
    )
    if existing_username:
        return jsonify({'error': f"Username '{username}' is already taken. Please choose a different username."}), 409

    # Check existing email
    existing_email = execute_query(
        "SELECT id FROM users WHERE email = %s",
        (email,),
        fetchone=True
    )
    if existing_email:
        return jsonify({'error': f"An account with email '{email}' already exists. Please log in instead."}), 409

    pw_hash = generate_password_hash(password)
    user_id = execute_insert(
        """INSERT INTO users (username, email, password_hash, full_name, phone, address, city, postal_code)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
        (username, email, pw_hash, full_name, phone, address, city, postal_code)
    )

    # Initialize empty cart
    execute_non_query("INSERT INTO cart (user_id) VALUES (%s)", (user_id,))

    user_info = {
        'id': user_id,
        'username': username,
        'email': email,
        'full_name': full_name,
        'phone': phone,
        'address': address,
        'city': city,
        'postal_code': postal_code,
        'is_admin': False
    }

    session['user_id'] = user_id
    session['is_admin'] = False

    return jsonify({
        'message': 'Registration successful! Welcome to ShopSmart.',
        'user': user_info
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    identifier = data.get('identifier', '').strip()
    password = data.get('password', '')

    if not identifier or not password:
        return jsonify({'error': 'Email or username and password are required.'}), 400

    # 1. Search in users table (case-insensitive)
    user = execute_query(
        "SELECT * FROM users WHERE LOWER(email) = LOWER(%s) OR LOWER(username) = LOWER(%s)",
        (identifier, identifier),
        fetchone=True
    )

    if user and check_password_hash(user['password_hash'], password):
        session['user_id'] = user['id']
        session['is_admin'] = False

        user_info = {
            'id': user['id'],
            'username': user['username'],
            'email': user['email'],
            'full_name': user['full_name'],
            'phone': user.get('phone', ''),
            'address': user.get('address', ''),
            'city': user.get('city', ''),
            'postal_code': user.get('postal_code', ''),
            'is_admin': False
        }

        return jsonify({
            'message': f"Welcome back, {user['full_name']}!",
            'user': user_info
        })

    # 2. Also check admins table (seamless admin detection)
    admin = execute_query(
        "SELECT * FROM admins WHERE LOWER(email) = LOWER(%s) OR LOWER(username) = LOWER(%s)",
        (identifier, identifier),
        fetchone=True
    )

    if admin and check_password_hash(admin['password_hash'], password):
        session['admin_id'] = admin['id']
        session['is_admin'] = True

        admin_info = {
            'id': admin['id'],
            'username': admin['username'],
            'email': admin['email'],
            'full_name': admin['full_name'],
            'role': admin.get('role', 'admin'),
            'is_admin': True
        }

        return jsonify({
            'message': f"Welcome, {admin['full_name']}! (Administrator)",
            'user': admin_info
        })

    return jsonify({'error': 'Invalid email/username or password. Tip: You can click any 1-Click Demo Profile below to sign in instantly.'}), 401

@auth_bp.route('/admin-login', methods=['POST'])
def admin_login():
    data = request.get_json() or {}
    identifier = data.get('identifier', '').strip().lower()
    password = data.get('password', '')

    if not identifier or not password:
        return jsonify({'error': 'Admin username/email and password are required.'}), 400

    admin = execute_query(
        "SELECT * FROM admins WHERE LOWER(email) = LOWER(%s) OR LOWER(username) = LOWER(%s)",
        (identifier, identifier),
        fetchone=True
    )

    if not admin or not check_password_hash(admin['password_hash'], password):
        return jsonify({'error': 'Invalid administrator credentials.'}), 401

    session['admin_id'] = admin['id']
    session['is_admin'] = True

    admin_info = {
        'id': admin['id'],
        'username': admin['username'],
        'email': admin['email'],
        'full_name': admin['full_name'],
        'role': admin.get('role', 'admin'),
        'is_admin': True
    }

    return jsonify({
        'message': f"Administrator access granted. Welcome, {admin['full_name']}!",
        'user': admin_info
    })

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully.'})

@auth_bp.route('/profile', methods=['GET'])
def get_profile():
    user_id = request.headers.get('X-User-Id') or session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated.'}), 401

    user = execute_query(
        "SELECT id, username, email, full_name, phone, address, city, postal_code, created_at FROM users WHERE id = %s",
        (user_id,),
        fetchone=True
    )
    if not user:
        return jsonify({'error': 'User not found.'}), 404

    user['is_admin'] = False
    return jsonify({'user': user})

@auth_bp.route('/profile', methods=['PUT'])
def update_profile():
    user_id = request.headers.get('X-User-Id') or session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated.'}), 401

    data = request.get_json() or {}
    full_name = data.get('full_name', '').strip()
    phone = data.get('phone', '').strip()
    address = data.get('address', '').strip()
    city = data.get('city', '').strip()
    postal_code = data.get('postal_code', '').strip()

    execute_non_query(
        """UPDATE users 
        SET full_name = %s, phone = %s, address = %s, city = %s, postal_code = %s 
        WHERE id = %s""",
        (full_name, phone, address, city, postal_code, user_id)
    )

    updated_user = execute_query(
        "SELECT id, username, email, full_name, phone, address, city, postal_code FROM users WHERE id = %s",
        (user_id,),
        fetchone=True
    )
    updated_user['is_admin'] = False
    return jsonify({'message': 'Profile updated successfully!', 'user': updated_user})

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    new_password = data.get('new_password', '')

    if not email or not new_password:
        return jsonify({'error': 'Email and new password are required.'}), 400

    user = execute_query("SELECT id FROM users WHERE email = %s", (email,), fetchone=True)
    if not user:
        return jsonify({'error': 'No account found with this email address.'}), 404

    pw_hash = generate_password_hash(new_password)
    execute_non_query("UPDATE users SET password_hash = %s WHERE id = %s", (pw_hash, user['id']))

    return jsonify({'message': 'Password has been reset successfully. You can now log in.'})

@auth_bp.route('/demo-users', methods=['GET'])
def get_demo_users():
    """Returns sample users for quick evaluation and testing."""
    users = execute_query(
        "SELECT id, username, email, full_name FROM users LIMIT 3"
    )
    admin = execute_query(
        "SELECT id, username, email, full_name, role FROM admins LIMIT 1",
        fetchone=True
    )
    return jsonify({
        'users': users,
        'default_user_password': 'Password123!',
        'admin': admin,
        'default_admin_password': 'AdminPassword123!'
    })
