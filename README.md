# ShopSmart – Personalized E-Commerce with Apriori Recommendation System

[![GitHub Repository](https://img.shields.io/badge/GitHub-akshhkotian%2FSmartShop-blue?logo=github)](https://github.com/akshhkotian/SmartShop.git)

**ShopSmart** is a production-grade, modern, personalized online shopping platform built with **React.js**, **Bootstrap 5**, **Python Flask**, **MySQL / SQLite**, and **MLxtend Apriori Machine Learning**, tailored for the **Indian market** with full Indian Rupee (`₹` / INR) currency formatting, Indian personas, and localized payment options (UPI, Net Banking, COD).

The application delivers individualized product suggestions generated dynamically using the **Apriori Association Rule Mining Algorithm**, weighting user searches, browsing history, cart additions, wishlist saves, and purchases.

---

## 🌟 Key Highlights & Architectural Features

### 1. Apriori Association Rule Mining Engine
- **Real Apriori Implementation**: Powered by `mlxtend.frequent_patterns.apriori` and `association_rules` over pandas transaction itemsets. No static mock recommendations.
- **Support, Confidence & Lift**: Calculates rule metrics to identify cross-category and within-category affinity patterns.
- **Interest Weighting**:
  - `Purchase`: **5.0x** (Highest customer commitment)
  - `Cart Addition`: **3.5x** (Strong purchase intent)
  - `Wishlist Save`: **2.5x** (Expressed preference)
  - `Product View`: **1.5x** (Active browsing attention)
  - `Search Query`: **1.0x** (Exploratory intent)
- **Continuous Learning**: Every completed order and shopping basket automatically updates transaction baskets and triggers Apriori re-mining.
- **Dynamic Recommendation Sections**:
  - *Recommended For You* (Apriori profile matching & lift ranking)
  - *Frequently Bought Together* (Interactive bundle add-to-cart on product details & cart page)
  - *Based on Your Recent Searches* (Keyword expansion matching antecedent rules)
  - *Trending Products* & *Popular Items* (Fallback for first-time / guest visitors)
  - *Recently Viewed Products* (Time-decayed personal history)

### 2. Dual-Theme Visual Design System (Light & Dark)
- **Sun / Moon Theme Switcher**: Clearly visible in the navigation bar with smooth icon transitions.
- **Local Storage Persistence**: Persists user choice across visits with fallback to system `prefers-color-scheme`. Zero theme flashing on reload.
- **Light Theme**: Soft lavender (`#ece7f8`), pastel blue (`#dfebfb`), soft mint (`#e2f2ec`), warm off-white surfaces, and light gradient cards with subtle drop shadows.
- **Dark Theme**: Deep charcoal navy (`#0f1118`), muted navy surfaces (`#161824`), muted purple/lavender accents (`#9b8df7`), soft pink badges (`#e58d99`), and high-contrast typography.
- **CSS Variable Architecture**: Strict adherence to CSS custom properties with zero Tailwind dependencies.

### 3. Shopping Experience
- **Catalog Filtering**: Multi-faceted filter by category, price slider (₹100 - ₹2,50,000), minimum rating (3.5★, 4.0★, 4.5★), and sorting (Popularity, Rating, Price Low-High, Price High-Low, Newest).
- **Live Search Autocomplete**: Debounced search dropdown displaying matched products with thumbnails, prices in Indian Rupees (₹), and matching category links.
- **Persistent Cart & Wishlist**: Stored in the database with real-time quantity adjustments, INR price calculations, and promo code discounts (`SMART20`, `WELCOME10`).
- **Complete Checkout Flow**: Indian address delivery information, Indian payment options (UPI, RuPay/Cards, Net Banking, COD), and order tracking with immediate post-purchase recommendations.

### 4. Admin Management & Recommendation Analytics
- **Executive KPI Dashboard**: Total revenue, orders, active products, and active Apriori rules count.
- **Visual Analytics Charts**: Monthly sales growth velocity bar charts and product category distribution.
- **Mined Association Rules Table**: Real-time table displaying Antecedents, Consequents, Support %, Confidence %, and Lift multiplier.
- **Product Management (CRUD)**: Modal interface to add, edit, or delete catalog products.
- **Order Status Operations**: Live status dropdown updates (Processing, Shipped, Delivered, Cancelled).

---

## 🏗️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, React Router 7, Vite | Fast, responsive single-page application |
| **Styling** | Custom CSS Variables, Bootstrap 5.3, Bootstrap Icons | Polished light/dark design without Tailwind |
| **Icons** | Lucide React | Clean, modern iconography |
| **Backend** | Python 3.12, Flask, Flask-CORS | REST API handling auth, shopping, & recommendation models |
| **Machine Learning** | MLxtend, Pandas, NumPy | Apriori frequent itemsets and association rule mining |
| **Database** | MySQL 8.0+ / 9.x (with local SQLite fallback) | Full relational schema with foreign keys and indexes |

---

## 📁 Project Directory Structure

```
c:\SMARTSHOP\
├── database/
│   ├── schema.sql              # Complete MySQL DDL schema
│   ├── seed.sql                # Complete SQL seed data (categories, products, baskets)
│   ├── init_db.py              # Standalone DB initialization & Apriori trainer
│   └── generate_seed_sql.py    # SQL generator utility
│
├── backend/
│   ├── app.py                  # Flask entry point & blueprint registration
│   ├── config.py               # Configuration & Apriori hyperparameters
│   ├── db.py                   # MySQL connection pooling & auto-fallback engine
│   ├── seed_data.py            # 35+ realistic products across 7 categories & 60+ transaction baskets
│   ├── ml/
│   │   ├── __init__.py
│   │   └── apriori_engine.py   # Apriori Association Rule Miner & Personalization Ranker
│   └── routes/
│       ├── __init__.py
│       ├── auth_routes.py      # Registration, login, admin auth, profile
│       ├── product_routes.py   # Catalog, search autocomplete, category filtering
│       ├── cart_routes.py      # Add to cart, update qty, remove, subtotal
│       ├── wishlist_routes.py  # Wishlist toggle and listing
│       ├── order_routes.py     # Checkout, order items, Apriori basket sync
│       ├── activity_routes.py  # User activity tracking & dashboard summaries
│       ├── recommendation_routes.py # Apriori 'For You', 'FBT', and search endpoints
│       └── admin_routes.py     # Metrics, charts data, CRUD products, order status
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js          # Vite config with API proxy
│   ├── index.html              # HTML with Inter typography
│   └── src/
│       ├── index.css           # Complete Dual-Theme CSS Design System
│       ├── App.jsx             # Routes & layout container
│       ├── main.jsx
│       ├── context/
│       │   ├── ThemeContext.jsx# Light/Dark mode state & localStorage detection
│       │   ├── AuthContext.jsx # User auth, session, and toast notifications
│       │   └── CartContext.jsx # Cart & wishlist synchronizer
│       ├── services/
│       │   └── api.js          # Axios client with user/admin headers
│       ├── components/
│       │   ├── Navbar.jsx      # Navigation, search autocomplete, theme button
│       │   ├── Footer.jsx      # E-commerce footer & newsletter
│       │   ├── ProductCard.jsx # Gradient card with Apriori explanation badges
│       │   ├── StarRating.jsx  # 5-star visual rating component
│       │   ├── ThemeToggle.jsx # Sun/Moon toggle with Lucide icons
│       │   └── ToastContainer.jsx # Floating notification alerts
│       └── pages/
│           ├── HomePage.jsx    # Hero, categories, 5 Apriori recommendation sections
│           ├── ProductsPage.jsx# Multi-faceted search and filter catalog
│           ├── ProductDetailPage.jsx # Product specs & Frequently Bought Together bundle
│           ├── CartPage.jsx    # Cart items, promo codes, cart recommendations
│           ├── WishlistPage.jsx# Saved items
│           ├── CheckoutPage.jsx# Multi-step checkout & payment
│           ├── OrderSuccessPage.jsx # Order confirmation & post-order recommendations
│           ├── OrdersPage.jsx  # Order tracking history
│           ├── UserDashboardPage.jsx # Personal analytics, recent searches, top categories
│           ├── AdminDashboardPage.jsx # Metrics, charts, CRUD, Apriori rules table
│           ├── LoginPage.jsx   # Customer & Admin login with 1-click demo logins
│           ├── RegisterPage.jsx# Customer registration
│           └── ForgotPasswordPage.jsx # Secure password recovery
│
├── tests/
│   └── test_api_e2e.py         # Full 12-test automated integration test suite
├── requirements.txt            # Python dependencies
├── run_backend.cmd             # Quick launcher for Flask backend
├── run_frontend.cmd            # Quick launcher for React frontend
└── run_all.cmd                 # Quick launcher for entire application
```

---

## ⚡ Quick Start & Execution Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24.16.0)
- **Python**: 3.10+ (tested on Python 3.12.3)
- **MySQL**: (Optional / Automatic) MySQL Server 8.0+ or MySQL 9.x. If MySQL is not running or credentials are not yet configured, the system automatically runs on zero-config SQLite (`database/shopsmart.db`) with 100% of features functioning seamlessly!

### 2. Install Dependencies
```bash
# Python dependencies
pip install -r requirements.txt

# React frontend dependencies
cd frontend
npm install --legacy-peer-deps
cd ..
```

### 3. Initialize Database & Apriori Models
Run the database initializer to create tables, seed 35+ realistic products across 7 categories, and mine the initial Apriori association rules:
```bash
python database/init_db.py
```

### 4. Run Automated End-to-End Tests
Verify all 12 platform features and Apriori rule calculations:
```bash
python tests/test_api_e2e.py
```

### 5. Start the Application
You can run the full application with the convenient batch script or run backend and frontend separately:

**Option A: One-click launcher**
```cmd
run_all.cmd
```

**Option B: Separate terminals**
```cmd
# Terminal 1: Backend
python backend/app.py

# Terminal 2: Frontend
cd frontend
npm run dev
```

Open your browser to: **[http://localhost:5173](http://localhost:5173)**

---

## 🔐 Seeded Accounts (For Testing & Evaluation)

Use the following credentials to test personalized recommendations, cart, and checkout:

| Role | Username / Email | Password | Location / Profile |
| :--- | :--- | :--- | :--- |
| **Customer 1** | `aarav@example.com` (`aarav_tech`) | `Password123!` | Indiranagar, Bengaluru (Tech & Workstations: MacBook, Logitech, Wireless Stand) |
| **Customer 2** | `ananya@example.com` (`ananya_style`) | `Password123!` | Bandra West, Mumbai (Skincare & Fashion: Serums, Kurta, Denim Jacket) |
| **Customer 3** | `rohan@example.com` (`rohan_fitness`) | `Password123!` | Sector 62, Noida (Sports & Fitness: Yoga Mat, Dumbbells, Protein) |
| **Administrator** | `admin@shopsmart.com` | `AdminPassword123!` | ShopSmart India Administrator (Full Analytics, CRUD, Mined Apriori Rules) |

---

## 🧮 Apriori Association Rule Mining Details

The recommendation engine mines customer shopping sessions using the standard formulas:

$$\text{Support}(A \Rightarrow B) = \frac{\text{Count}(A \cup B)}{\text{Total Transactions}}$$

$$\text{Confidence}(A \Rightarrow B) = \frac{\text{Support}(A \cup B)}{\text{Support}(A)}$$

$$\text{Lift}(A \Rightarrow B) = \frac{\text{Confidence}(A \Rightarrow B)}{\text{Support}(B)}$$

- **Lift > 1.0**: Confirms positive correlation between products (e.g. buying a *MacBook Pro* increases the likelihood of buying a *Laptop Sleeve* or *Logitech MX Master* by **7.0x**).
- **User Activity Scoring**: Combines activity weight ($W_{\text{purchase}}=5.0, W_{\text{cart}}=3.5, W_{\text{wish}}=2.5, W_{\text{view}}=1.5, W_{\text{search}}=1.0$) with rule confidence and lift to rank recommendations.
- **Cart De-duplication**: Filters out items already present in the active cart to avoid redundant recommendations.

---

## 🎨 Theme Customization

The active theme is controlled by CSS variables defined in `frontend/src/index.css`:
- To modify light theme colors, update `:root`.
- To modify dark theme colors, update `[data-theme='dark']`.
- Theme changes are applied instantaneously without page reloads and stored in `localStorage.getItem('shopsmart_theme')`.
