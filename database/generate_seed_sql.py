import sys
import json
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.seed_data import CATEGORIES, PRODUCTS, TRANSACTION_BASKETS, SAMPLE_USERS, SAMPLE_ADMIN
from werkzeug.security import generate_password_hash

lines = ['-- ShopSmart SQL Seed Data File\nUSE shopsmart_db;\n\n']

# Categories
lines.append('-- 1. Categories\n')
for c in CATEGORIES:
    desc = c['description'].replace("'", "''")
    lines.append(f"INSERT INTO categories (id, name, slug, description, image_url, icon) VALUES ({c['id']}, '{c['name']}', '{c['slug']}', '{desc}', '{c['image_url']}', '{c['icon']}');\n")

# Products
lines.append('\n-- 2. Products\n')
for p in PRODUCTS:
    desc = p['description'].replace("'", "''")
    name = p['name'].replace("'", "''")
    badge = f"'{p['badge']}'" if p['badge'] else 'NULL'
    lines.append(f"INSERT INTO products (id, category_id, name, slug, description, price, original_price, discount_percent, stock, rating, review_count, image_url, badge, is_featured, is_trending) VALUES ({p['id']}, {p['category_id']}, '{name}', '{p['slug']}', '{desc}', {p['price']}, {p['original_price']}, {p['discount_percent']}, {p['stock']}, {p['rating']}, {p['review_count']}, '{p['image_url']}', {badge}, {p['is_featured']}, {p['is_trending']});\n")

# Users
lines.append('\n-- 3. Sample Users (Default password: Password123!)\n')
pw_hash = generate_password_hash('Password123!')
for u in SAMPLE_USERS:
    lines.append(f"INSERT INTO users (id, username, email, password_hash, full_name, phone, address, city, postal_code) VALUES ({u['id']}, '{u['username']}', '{u['email']}', '{pw_hash}', '{u['full_name']}', '{u['phone']}', '{u['address']}', '{u['city']}', '{u['postal_code']}');\n")
    lines.append(f"INSERT INTO cart (user_id) VALUES ({u['id']});\n")

# Admin
admin_pw_hash = generate_password_hash(SAMPLE_ADMIN['password'])
lines.append(f"\n-- 4. Admin (Default password: {SAMPLE_ADMIN['password']})\n")
lines.append(f"INSERT INTO admins (username, email, password_hash, full_name, role) VALUES ('{SAMPLE_ADMIN['username']}', '{SAMPLE_ADMIN['email']}', '{admin_pw_hash}', '{SAMPLE_ADMIN['full_name']}', '{SAMPLE_ADMIN['role']}');\n")

# Transactions
lines.append('\n-- 5. Transactions for Apriori Mining\n')
for idx, b in enumerate(TRANSACTION_BASKETS, 1):
    js = json.dumps(b)
    lines.append(f"INSERT INTO transactions (transaction_code, user_id, product_ids_json, transaction_type) VALUES ('TXN-2026-{idx:04d}', {(idx % len(SAMPLE_USERS)) + 1}, '{js}', 'purchase');\n")

sql_file = ROOT_DIR / 'database' / 'seed.sql'
with open(sql_file, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print('Generated database/seed.sql successfully!')
