"""
ShopSmart End-to-End API Integration & Apriori Recommendation Test Suite
Tests authentication, product filtering, shopping cart, checkout,
activity tracking, and real Apriori association rule generation.
"""

import sys
import os
import json
from pathlib import Path

# Force utf-8 output encoding for Windows command line
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app import app
from backend.ml.apriori_engine import apriori_engine

def run_tests():
    print("=" * 70)
    print(" Starting ShopSmart Full End-to-End Integration Test")
    print("=" * 70)

    client = app.test_client()

    # Test 1: Health check
    res = client.get('/api/health')
    assert res.status_code == 200, f"Health check failed: {res.data}"
    data = res.get_json()
    print(f"[OK] Health Check Passed: Status={data['status']}, Database={data['database_engine']}, Apriori Rules={data['apriori_rules_count']}")

    # Test 2: Categories
    res = client.get('/api/categories')
    assert res.status_code == 200
    cats = res.get_json()['categories']
    assert len(cats) >= 7, f"Expected 7 categories, got {len(cats)}"
    print(f"[OK] Categories API Passed: Found {len(cats)} categories")

    # Test 3: Products & Filtering
    res = client.get('/api/products?category=electronics&min_price=10000')
    assert res.status_code == 200
    prods = res.get_json()['products']
    assert len(prods) > 0
    print(f"[OK] Products Filtering Passed: Found {len(prods)} electronics over ₹10,000")

    # Test 4: Search Autocomplete
    res = client.get('/api/products/search/suggestions?q=lap')
    assert res.status_code == 200
    sugg = res.get_json()
    assert len(sugg['products']) > 0
    print(f"[OK] Autocomplete Suggestions Passed: Found {len(sugg['products'])} suggestions for 'lap'")

    # Test 5: Authentication (Login with seeded user Aarav Sharma)
    res = client.post('/api/auth/login', json={
        'identifier': 'aarav@example.com',
        'password': 'Password123!'
    })
    assert res.status_code == 200, f"Login failed: {res.data}"
    user = res.get_json()['user']
    user_id = user['id']
    headers = {'X-User-Id': str(user_id)}
    print(f"[OK] User Authentication Passed: Logged in as '{user['full_name']}' (ID: {user_id})")

    # Test 6: Shopping Cart Operations
    # Add product 1 (MacBook Pro) to cart
    res = client.post('/api/cart/add', headers=headers, json={'product_id': 1, 'quantity': 1})
    assert res.status_code == 200
    # Add product 3 (Logitech Mouse) to cart
    res = client.post('/api/cart/add', headers=headers, json={'product_id': 3, 'quantity': 2})
    assert res.status_code == 200

    # Fetch Cart
    res = client.get('/api/cart', headers=headers)
    assert res.status_code == 200
    cart_data = res.get_json()
    assert cart_data['item_count'] >= 3
    print(f"[OK] Cart Operations Passed: {cart_data['item_count']} items in cart, Subtotal=₹{cart_data['subtotal']}")

    # Test 7: Apriori Personalized Recommendations
    res = client.get('/api/recommendations/for-you?limit=6', headers=headers)
    assert res.status_code == 200
    recs = res.get_json()['products']
    assert len(recs) > 0
    top_rec = recs[0]
    print(f"[OK] Apriori Recommendations Passed: Top recommendation for Aarav Sharma: '{top_rec['name']}' (Reason: {top_rec.get('rec_reason')})")

    # Test 8: Apriori Frequently Bought Together
    res = client.get('/api/recommendations/frequently-bought-together?product_id=1&limit=3')
    assert res.status_code == 200
    fbt = res.get_json()['products']
    assert len(fbt) > 0
    print(f"[OK] Apriori Frequently Bought Together Passed: Found {len(fbt)} items associated with MacBook Pro (e.g. '{fbt[0]['name']}')")

    # Test 9: Wishlist
    # Reset wishlist item state first for repeatability
    client.delete('/api/wishlist/2', headers=headers)
    res = client.post('/api/wishlist/toggle', headers=headers, json={'product_id': 2})
    assert res.status_code == 200
    res = client.get('/api/wishlist', headers=headers)
    assert len(res.get_json()['items']) > 0
    print("[OK] Wishlist Operations Passed")

    # Test 10: Checkout & Order Placement
    res = client.post('/api/orders/checkout', headers=headers, json={
        'shipping_address': '12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka, 560038',
        'payment_method': 'UPI',
        'coupon_code': 'SMART20'
    })
    assert res.status_code == 201, f"Checkout failed: {res.data}"
    order = res.get_json()['order']
    print(f"[OK] Checkout & Order Placement Passed: Created order #{order['order_number']}, Total=₹{order['final_amount']} (Saved ₹{order['discount']} with SMART20)")

    # Test 11: Admin Login & Rules Inspection
    res = client.post('/api/auth/admin-login', json={
        'identifier': 'admin@shopsmart.com',
        'password': 'AdminPassword123!'
    })
    assert res.status_code == 200
    admin_headers = {'X-Admin-Auth': 'true'}

    res = client.get('/api/admin/rules', headers=admin_headers)
    assert res.status_code == 200
    rules = res.get_json()['rules']
    assert len(rules) > 0
    print(f"[OK] Admin Apriori Rules API Passed: Found {len(rules)} mined association rules in database")
    print(f"   Example Top Rule: {rules[0]['antecedent_names']} => {rules[0]['consequent_names']} (Lift: {rules[0]['lift']}x, Confidence: {float(rules[0]['confidence'])*100:.1f}%)")

    # Test 12: Admin Metrics
    res = client.get('/api/admin/metrics', headers=admin_headers)
    assert res.status_code == 200
    met = res.get_json()
    print(f"[OK] Admin Analytics Metrics Passed: Total Users={met['total_users']}, Products={met['total_products']}, Orders={met['total_orders']}, Total Sales=₹{met['total_sales']}")

    print("\n" + "=" * 70)
    print(" ALL 12 INTEGRATION TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == '__main__':
    run_tests()
