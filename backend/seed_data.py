"""
ShopSmart E-Commerce Database Seed Data (India Market Localized)
Provides categories, products, sample users, admin, and realistic transaction baskets.
"""

CATEGORIES = [
    {
        "id": 1,
        "name": "Electronics",
        "slug": "electronics",
        "description": "Premium laptops, audio gear, smart accessories, and cutting-edge tech gadgets.",
        "image_url": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
        "icon": "Laptop"
    },
    {
        "id": 2,
        "name": "Fashion",
        "slug": "fashion",
        "description": "Timeless wardrobe essentials, modern tailoring, footwear, and curated apparel.",
        "image_url": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
        "icon": "Shirt"
    },
    {
        "id": 3,
        "name": "Beauty & Skincare",
        "slug": "beauty",
        "description": "Clean, dermatologist-formulated skincare, serums, and organic wellness essentials.",
        "image_url": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80",
        "icon": "Sparkles"
    },
    {
        "id": 4,
        "name": "Home Appliances",
        "slug": "home-appliances",
        "description": "Smart, aesthetic home technology, coffee stations, and climate appliances.",
        "image_url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80",
        "icon": "Home"
    },
    {
        "id": 5,
        "name": "Books & Learning",
        "slug": "books",
        "description": "Bestselling literature on technology, personal finance, psychology, and productivity.",
        "image_url": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80",
        "icon": "BookOpen"
    },
    {
        "id": 6,
        "name": "Accessories",
        "slug": "accessories",
        "description": "Everyday carry essentials, minimalist wallets, organizers, and tech protection.",
        "image_url": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80",
        "icon": "Watch"
    },
    {
        "id": 7,
        "name": "Sports & Fitness",
        "slug": "sports",
        "description": "Active gear, home gym strength essentials, recovery mats, and workout apparel.",
        "image_url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80",
        "icon": "Activity"
    }
]

PRODUCTS = [
    {
        "id": 1,
        "category_id": 1,
        "name": "MacBook Pro M3 Max Studio",
        "slug": "macbook-pro-m3-max",
        "description": "Ultra-fast Apple Silicon workstation with Liquid Retina XDR 120Hz display, 36GB unified memory, and 22-hour battery life. Engineered for developers and creators.",
        "price": 189900.0,
        "original_price": 219900.0,
        "discount_percent": 10,
        "stock": 25,
        "rating": 4.9,
        "review_count": 142,
        "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
        "badge": "Best Seller",
        "is_featured": 1,
        "is_trending": 1
    },
    {
        "id": 2,
        "category_id": 1,
        "name": "Sony WH-1000XM5 Noise Cancelling Headphones",
        "slug": "sony-wh-1000xm5-headphones",
        "description": "Industry-leading active noise cancellation with dual processors, 8 microphones, LDAC Hi-Res audio, and 30-hour playback for crystal-clear music and calls.",
        "price": 28990.0,
        "original_price": 34990.0,
        "discount_percent": 13,
        "stock": 48,
        "rating": 4.8,
        "review_count": 310,
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        "badge": "Top Rated",
        "is_featured": 1,
        "is_trending": 1
    },
    {
        "id": 3,
        "category_id": 1,
        "name": "Logitech MX Master 3S Wireless Mouse",
        "slug": "logitech-mx-master-3s",
        "description": "Quiet clicks, 8K DPI track-on-glass sensor, electromagnetic MagSpeed wheel, ergonomic thumb cradle, and seamless multi-computer flow control.",
        "price": 8995.0,
        "original_price": 10995.0,
        "discount_percent": 17,
        "stock": 80,
        "rating": 4.9,
        "review_count": 520,
        "image_url": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80",
        "badge": "Popular",
        "is_featured": 0,
        "is_trending": 1
    },
    {
        "id": 4,
        "category_id": 1,
        "name": "Keychron Q1 Pro Custom Mechanical Keyboard",
        "slug": "keychron-q1-pro-keyboard",
        "description": "CNC aluminum gasket mount wireless mechanical keyboard, hot-swappable tactile switches, screw-in stabilizers, and South-facing RGB backlighting.",
        "price": 16499.0,
        "original_price": 19999.0,
        "discount_percent": 13,
        "stock": 35,
        "rating": 4.7,
        "review_count": 89,
        "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
        "badge": "Editor's Choice",
        "is_featured": 1,
        "is_trending": 0
    },
    {
        "id": 5,
        "category_id": 1,
        "name": "Dell UltraSharp 32-inch 4K UHD USB-C Hub Monitor",
        "slug": "dell-ultrasharp-32-4k-monitor",
        "description": "IPS Black technology with 2000:1 contrast ratio, 98% DCI-P3 wide color gamut, 90W power delivery USB-C hub, and integrated comfortview plus.",
        "price": 58990.0,
        "original_price": 69990.0,
        "discount_percent": 19,
        "stock": 18,
        "rating": 4.7,
        "review_count": 64,
        "image_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",
        "badge": "Special Offer",
        "is_featured": 0,
        "is_trending": 0
    },
    {
        "id": 6,
        "category_id": 1,
        "name": "Pixel 9 Pro AI Flagship Smartphone",
        "slug": "pixel-9-pro-flagship",
        "description": "Google Tensor G4 chip with Gemini Nano AI, pro triple camera system with 5x telephoto optical zoom, Super Actua display, and 7 years of OS updates.",
        "price": 106999.0,
        "original_price": 119999.0,
        "discount_percent": 9,
        "stock": 40,
        "rating": 4.8,
        "review_count": 180,
        "image_url": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80",
        "badge": "New Arrival",
        "is_featured": 1,
        "is_trending": 1
    },
    {
        "id": 7,
        "category_id": 2,
        "name": "Organic Heavyweight Cotton Oversized Hoodie",
        "slug": "organic-cotton-oversized-hoodie",
        "description": "450 GSM French Terry organic cotton, pre-shrunk with double-stitched ribbed trims. A minimalist staple delivering everyday comfort and structured drape.",
        "price": 1999.0,
        "original_price": 2799.0,
        "discount_percent": 18,
        "stock": 65,
        "rating": 4.6,
        "review_count": 94,
        "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80",
        "badge": "Trending",
        "is_featured": 1,
        "is_trending": 1
    },
    {
        "id": 8,
        "category_id": 2,
        "name": "Japanese Selvedge Slim-Taper Denim Jeans",
        "slug": "japanese-selvedge-slim-denim",
        "description": "13.5oz Kuroki Mills raw selvedge denim woven on shuttle looms. Develops personalized patina fades with time, finished with copper rivets.",
        "price": 2499.0,
        "original_price": 3499.0,
        "discount_percent": 16,
        "stock": 42,
        "rating": 4.8,
        "review_count": 76,
        "image_url": "https://images.unsplash.com/photo-1542272604-780c96856592?w=800&q=80",
        "badge": None,
        "is_featured": 0,
        "is_trending": 1
    },
    {
        "id": 9,
        "category_id": 2,
        "name": "Minimalist White Leather Low-Top Sneakers",
        "slug": "minimalist-leather-sneakers",
        "description": "Full-grain Italian calfskin leather with Margom rubber cupsole, waxed cotton laces, and cushioned arch-support leather footbed.",
        "price": 3499.0,
        "original_price": 4499.0,
        "discount_percent": 17,
        "stock": 55,
        "rating": 4.7,
        "review_count": 130,
        "image_url": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
        "badge": "Essential",
        "is_featured": 1,
        "is_trending": 1
    },
    {
        "id": 10,
        "category_id": 2,
        "name": "Double-Breasted Wool Blend Overcoat",
        "slug": "double-breasted-wool-overcoat",
        "description": "Tailored virgin wool blend with notched lapels, horn buttons, deep exterior welt pockets, and smooth cupro silk interior lining.",
        "price": 5999.0,
        "original_price": 7999.0,
        "discount_percent": 17,
        "stock": 20,
        "rating": 4.9,
        "review_count": 48,
        "image_url": "https://images.unsplash.com/photo-1539533018447-63fcce667883?w=800&q=80",
        "badge": "Luxury",
        "is_featured": 0,
        "is_trending": 0
    },
    {
        "id": 11,
        "category_id": 2,
        "name": "Classic Polarized Aviator Sunglasses",
        "slug": "classic-polarized-aviator-sunglasses",
        "description": "Ultralight titanium frame with mineral glass polarized lenses, anti-reflective coating, and 100% UVA/UVB optical protection.",
        "price": 1499.0,
        "original_price": 2199.0,
        "discount_percent": 23,
        "stock": 70,
        "rating": 4.6,
        "review_count": 112,
        "image_url": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
        "badge": "Popular",
        "is_featured": 0,
        "is_trending": 0
    },
    {
        "id": 12,
        "category_id": 3,
        "name": "Multi-Molecular Hyaluronic Acid Hydrating Serum",
        "slug": "hyaluronic-acid-hydrating-serum",
        "description": "Combines 5 molecular weights of pure hyaluronic acid with provitamin B5 to penetrate multiple skin depths for plump, hydrated dewy skin.",
        "price": 699.0,
        "original_price": 999.0,
        "discount_percent": 21,
        "stock": 90,
        "rating": 4.9,
        "review_count": 420,
        "image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80",
        "badge": "Best Seller",
        "is_featured": 1,
        "is_trending": 1
    },
    {
        "id": 13,
        "category_id": 3,
        "name": "Antioxidant Botanical Vitamin C Glow Cream",
        "slug": "botanical-vitamin-c-glow-cream",
        "description": "15% stabilized THD ascorbate blended with Kakadu plum extract, ferulic acid, and squalane to brighten hyperpigmentation and fight free radicals.",
        "price": 599.0,
        "original_price": 899.0,
        "discount_percent": 20,
        "stock": 65,
        "rating": 4.8,
        "review_count": 215,
        "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80",
        "badge": "Top Rated",
        "is_featured": 0,
        "is_trending": 1
    },
    {
        "id": 14,
        "category_id": 3,
        "name": "Soothing Organic Rosewater Facial Balancing Mist",
        "slug": "organic-rosewater-balancing-mist",
        "description": "100% steam-distilled Bulgarian Rosa Damascena hydrosol with aloe vera and cucumber extract. Instantly cools, calms redness, and sets makeup.",
        "price": 449.0,
        "original_price": 649.0,
        "discount_percent": 17,
        "stock": 100,
        "rating": 4.7,
        "review_count": 184,
        "image_url": "https://images.unsplash.com/photo-1608248597359-24285d95d123?w=800&q=80",
        "badge": None,
        "is_featured": 0,
        "is_trending": 0
    },
    {
        "id": 15,
        "category_id": 3,
        "name": "Broad Spectrum Mineral Invisible Sunscreen SPF 50",
        "slug": "mineral-invisible-sunscreen-spf50",
        "description": "Non-nano zinc oxide formula that blends transparently without white cast. Infused with niacinamide and green tea to soothe and defend against pollution.",
        "price": 649.0,
        "original_price": 849.0,
        "discount_percent": 20,
        "stock": 85,
        "rating": 4.8,
        "review_count": 310,
        "image_url": "https://images.unsplash.com/photo-1556228722-d0b5de75d776?w=800&q=80",
        "badge": "Daily Essential",
        "is_featured": 1,
        "is_trending": 1
    },
    {
        "id": 16,
        "category_id": 3,
        "name": "Gentle Amino Acid Foaming Gel Cleanser",
        "slug": "gentle-amino-acid-cleanser",
        "description": "Sulfate-free pH 5.5 cleanser that removes makeup and impurities without stripping the protective moisture barrier. Hypoallergenic and fragrance-free.",
        "price": 499.0,
        "original_price": 749.0,
        "discount_percent": 19,
        "stock": 75,
        "rating": 4.7,
        "review_count": 140,
        "image_url": "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80",
        "badge": None,
        "is_featured": 0,
        "is_trending": 0
    },
    {
        "id": 17,
        "category_id": 4,
        "name": "Barista Touch Espresso & Cappuccino Machine",
        "slug": "barista-touch-espresso-machine",
        "description": "Precision ThermoJet heating system with PID temperature control, automated microfoam milk texturing, integrated conical burr grinder, and touch screen preset menus.",
        "price": 14990.0,
        "original_price": 18990.0,
        "discount_percent": 20,
        "stock": 15,
        "rating": 4.9,
        "review_count": 275,
        "image_url": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80",
        "badge": "Popular",
        "is_featured": 1,
        "is_trending": 1
    },
    {
        "id": 18,
        "category_id": 4,
        "name": "Smart LiDAR Robot Vacuum & Sonic Mop",
        "slug": "smart-lidar-robot-vacuum-mop",
        "description": "6000Pa extreme suction with 3D obstacle avoidance LiDAR navigation, multi-floor mapping, self-emptying dustbin dock, and sonic scrubbing mop.",
        "price": 26990.0,
        "original_price": 32990.0,
        "discount_percent": 23,
        "stock": 28,
        "rating": 4.7,
        "review_count": 160,
        "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
        "badge": "Smart Living",
        "is_featured": 1,
        "is_trending": 1
    },
    {
        "id": 19,
        "category_id": 4,
        "name": "WhisperQuiet HEPA H13 Air Purifier Pro",
        "slug": "whisperquiet-hepa-air-purifier",
        "description": "True HEPA filtration captures 99.97% of airborne dust, smoke, pet dander, and odors in rooms up to 1200 sq ft. Real-time air quality index display.",
        "price": 8990.0,
        "original_price": 12990.0,
        "discount_percent": 17,
        "stock": 40,
        "rating": 4.8,
        "review_count": 198,
        "image_url": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
        "badge": "Wellness",
        "is_featured": 0,
        "is_trending": 0
    },
    {
        "id": 20,
        "category_id": 4,
        "name": "High-Speed Commercial Countertop Blender",
        "slug": "high-speed-countertop-blender",
        "description": "1800W motor with hardened stainless steel blades, variable speed dials, and pulse presets for frozen smoothies, hot soups, and nut butters.",
        "price": 4999.0,
        "original_price": 6999.0,
        "discount_percent": 20,
        "stock": 35,
        "rating": 4.6,
        "review_count": 115,
        "image_url": "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&q=80",
        "badge": None,
        "is_featured": 0,
        "is_trending": 0
    },
    {
        "id": 21,
        "category_id": 4,
        "name": "Minimalist Nordic Smart LED Floor Lamp",
        "slug": "minimalist-nordic-smart-led-lamp",
        "description": "Dimmable warm-to-cool white light (2700K-6500K) with 16 million RGB accent colors, aluminum slim profile, magnetic touch control, and app sync.",
        "price": 2199.0,
        "original_price": 2999.0,
        "discount_percent": 20,
        "stock": 45,
        "rating": 4.7,
        "review_count": 87,
        "image_url": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
        "badge": "Design Icon",
        "is_featured": 0,
        "is_trending": 1
    },
    {
        "id": 22,
        "category_id": 5,
        "name": "Atomic Habits: Proven Way to Build Good Habits",
        "slug": "atomic-habits-james-clear",
        "description": "The #1 New York Times bestseller by James Clear. A comprehensive, practical guide on how small changes lead to remarkable results.",
        "price": 499.0,
        "original_price": 799.0,
        "discount_percent": 30,
        "stock": 120,
        "rating": 4.9,
        "review_count": 890,
        "image_url": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
        "badge": "#1 Best Seller",
        "is_featured": 1,
        "is_trending": 1
    },
    {
        "id": 23,
        "category_id": 5,
        "name": "Clean Code: A Handbook of Agile Software Craftsmanship",
        "slug": "clean-code-robert-martin",
        "description": "Legendary software engineering handbook by Robert C. Martin. Learn how to write robust, maintainable code, refactor legacy codebases, and master readability.",
        "price": 699.0,
        "original_price": 999.0,
        "discount_percent": 21,
        "stock": 60,
        "rating": 4.8,
        "review_count": 340,
        "image_url": "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=800&q=80",
        "badge": "Tech Essential",
        "is_featured": 1,
        "is_trending": 0
    },
    {
        "id": 24,
        "category_id": 5,
        "name": "The Pragmatic Programmer (20th Anniversary Edition)",
        "slug": "pragmatic-programmer-anniversary",
        "description": "David Thomas and Andrew Hunt guide modern engineers on software architecture, professional career growth, testing excellence, and avoiding traps.",
        "price": 749.0,
        "original_price": 1099.0,
        "discount_percent": 24,
        "stock": 50,
        "rating": 4.9,
        "review_count": 210,
        "image_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
        "badge": "Must Read",
        "is_featured": 0,
        "is_trending": 1
    },
    {
        "id": 25,
        "category_id": 5,
        "name": "Designing Data-Intensive Applications",
        "slug": "designing-data-intensive-applications",
        "description": "Martin Kleppmann explores data systems, replication, partitioning, transactions, batch processing, and distributed consistency. The Bible of modern backend design.",
        "price": 899.0,
        "original_price": 1299.0,
        "discount_percent": 22,
        "stock": 45,
        "rating": 4.9,
        "review_count": 415,
        "image_url": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80",
        "badge": "Top Technical",
        "is_featured": 0,
        "is_trending": 1
    },
    {
        "id": 26,
        "category_id": 5,
        "name": "The Psychology of Money: Timeless Lessons",
        "slug": "the-psychology-of-money",
        "description": "Morgan Housel shares 19 short stories exploring the strange ways people think about money, risk, greed, happiness, and investing decisions.",
        "price": 399.0,
        "original_price": 599.0,
        "discount_percent": 25,
        "stock": 95,
        "rating": 4.8,
        "review_count": 620,
        "image_url": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80",
        "badge": "Best Seller",
        "is_featured": 0,
        "is_trending": 1
    },
    {
        "id": 27,
        "category_id": 6,
        "name": "Ultra-Slim RFID-Blocking Carbon Fiber Wallet",
        "slug": "ultra-slim-carbon-fiber-wallet",
        "description": "Aerospace-grade 3K carbon fiber plates with flexible elastic band, integrated cash strap, and RFID-theft protection for up to 12 cards.",
        "price": 799.0,
        "original_price": 1299.0,
        "discount_percent": 25,
        "stock": 110,
        "rating": 4.7,
        "review_count": 380,
        "image_url": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80",
        "badge": "Everyday Carry",
        "is_featured": 1,
        "is_trending": 1
    },
    {
        "id": 28,
        "category_id": 6,
        "name": "Double-Wall Insulated Stainless Steel Water Bottle 750ml",
        "slug": "stainless-steel-water-bottle-750ml",
        "description": "Vacuum-insulated 18/8 pro-grade stainless steel keeps beverages icy cold for 24 hours or piping hot for 12 hours. Sweat-free powder coat exterior.",
        "price": 899.0,
        "original_price": 1299.0,
        "discount_percent": 21,
        "stock": 130,
        "rating": 4.8,
        "review_count": 450,
        "image_url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
        "badge": "Eco Friendly",
        "is_featured": 0,
        "is_trending": 1
    },
    {
        "id": 29,
        "category_id": 6,
        "name": "Water-Resistant Vegan Leather Laptop Sleeve 14-16\"",
        "slug": "vegan-leather-laptop-sleeve",
        "description": "Supple waterproof vegan microfiber leather with plush faux-fur shock-absorbing lining, magnetic flap closure, and rear accessory stash pocket.",
        "price": 1499.0,
        "original_price": 2199.0,
        "discount_percent": 22,
        "stock": 70,
        "rating": 4.8,
        "review_count": 190,
        "image_url": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80",
        "badge": "Popular",
        "is_featured": 1,
        "is_trending": 1
    },
    {
        "id": 30,
        "category_id": 6,
        "name": "3-in-1 Foldable Magnetic Fast Wireless Charging Stand",
        "slug": "3-in-1-wireless-charging-stand",
        "description": "Simultaneously charges iPhone with MagSafe, Apple Watch, and wireless earbuds with 15W peak output. Folds completely flat for travel.",
        "price": 2499.0,
        "original_price": 3499.0,
        "discount_percent": 25,
        "stock": 85,
        "rating": 4.7,
        "review_count": 210,
        "image_url": "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80",
        "badge": "Best Seller",
        "is_featured": 1,
        "is_trending": 1
    },
    {
        "id": 31,
        "category_id": 6,
        "name": "Canvas Travel Tech Cable & Charger Organizer Pouch",
        "slug": "canvas-travel-cable-organizer",
        "description": "Heavy-duty waxed canvas with elastic loops, zippered mesh compartments, and water-repellent zipper to organize cables, power banks, and adapters.",
        "price": 699.0,
        "original_price": 999.0,
        "discount_percent": 23,
        "stock": 90,
        "rating": 4.6,
        "review_count": 125,
        "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
        "badge": None,
        "is_featured": 0,
        "is_trending": 0
    },
    {
        "id": 32,
        "category_id": 7,
        "name": "Non-Slip Natural Tree Rubber Eco Yoga Mat 5mm",
        "slug": "non-slip-eco-rubber-yoga-mat",
        "description": "Sustainably harvested biodegradable tree rubber with textured polyurethane top layer. Unsurpassed dry and wet grip with alignment guideline laser etchings.",
        "price": 1199.0,
        "original_price": 1799.0,
        "discount_percent": 20,
        "stock": 50,
        "rating": 4.9,
        "review_count": 230,
        "image_url": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80",
        "badge": "Top Rated",
        "is_featured": 1,
        "is_trending": 1
    },
    {
        "id": 33,
        "category_id": 7,
        "name": "Heavy-Duty Latex Resistance Exercise Bands Set (5 Pack)",
        "slug": "latex-resistance-exercise-bands",
        "description": "5 progressive resistance levels from 10 lbs to 50 lbs. Includes cushioned foam handles, door anchor, ankle straps, and compact travel carry pouch.",
        "price": 649.0,
        "original_price": 999.0,
        "discount_percent": 26,
        "stock": 95,
        "rating": 4.7,
        "review_count": 310,
        "image_url": "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&q=80",
        "badge": "Value Pack",
        "is_featured": 0,
        "is_trending": 1
    },
    {
        "id": 34,
        "category_id": 7,
        "name": "Rapid-Adjust Quick-Select Dumbbell Pair (5-52.5 lbs)",
        "slug": "rapid-adjust-dumbbell-pair",
        "description": "Turn the dial to instantly select weights in 2.5-pound increments up to 52.5 lbs. Space-saving engineering replaces 15 sets of weights.",
        "price": 2999.0,
        "original_price": 3999.0,
        "discount_percent": 19,
        "stock": 20,
        "rating": 4.8,
        "review_count": 180,
        "image_url": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80",
        "badge": "Home Gym",
        "is_featured": 1,
        "is_trending": 0
    },
    {
        "id": 35,
        "category_id": 7,
        "name": "Ultra-Absorbent Microfiber Quick-Dry Gym Towel",
        "slug": "microfiber-quick-dry-gym-towel",
        "description": "Antibacterial silver-infused microfiber absorbs 4x its weight in water and dries 3x faster than cotton. Includes corner zipper storage pocket.",
        "price": 399.0,
        "original_price": 599.0,
        "discount_percent": 23,
        "stock": 140,
        "rating": 4.6,
        "review_count": 145,
        "image_url": "https://images.unsplash.com/photo-1520256862855-398228c41684?w=800&q=80",
        "badge": None,
        "is_featured": 0,
        "is_trending": 0
    }
]

TRANSACTION_BASKETS = [
    [
        1,
        3,
        4
    ],
    [
        1,
        3,
        29
    ],
    [
        1,
        4,
        29
    ],
    [
        1,
        3,
        4,
        5
    ],
    [
        1,
        3,
        5
    ],
    [
        1,
        29,
        31
    ],
    [
        1,
        2,
        3
    ],
    [
        1,
        2,
        29
    ],
    [
        3,
        4
    ],
    [
        3,
        4,
        5
    ],
    [
        3,
        5
    ],
    [
        4,
        5
    ],
    [
        6,
        30
    ],
    [
        6,
        2
    ],
    [
        6,
        2,
        30
    ],
    [
        6,
        27
    ],
    [
        6,
        27,
        30
    ],
    [
        2,
        30
    ],
    [
        2,
        31
    ],
    [
        2,
        1,
        30
    ],
    [
        23,
        24
    ],
    [
        23,
        25
    ],
    [
        24,
        25
    ],
    [
        23,
        24,
        25
    ],
    [
        22,
        26
    ],
    [
        22,
        23
    ],
    [
        22,
        24
    ],
    [
        22,
        26,
        28
    ],
    [
        12,
        13
    ],
    [
        12,
        14
    ],
    [
        12,
        15
    ],
    [
        12,
        13,
        15
    ],
    [
        13,
        15
    ],
    [
        16,
        12,
        13
    ],
    [
        16,
        12
    ],
    [
        16,
        14,
        15
    ],
    [
        12,
        13,
        14,
        15
    ],
    [
        32,
        33
    ],
    [
        32,
        35
    ],
    [
        32,
        33,
        35
    ],
    [
        33,
        34
    ],
    [
        34,
        35
    ],
    [
        32,
        33,
        28
    ],
    [
        34,
        35,
        28
    ],
    [
        33,
        28
    ],
    [
        9,
        32,
        35
    ],
    [
        7,
        8
    ],
    [
        7,
        9
    ],
    [
        7,
        8,
        9
    ],
    [
        8,
        9
    ],
    [
        7,
        11
    ],
    [
        8,
        11
    ],
    [
        9,
        11
    ],
    [
        7,
        8,
        27
    ],
    [
        10,
        8,
        9
    ],
    [
        10,
        11
    ],
    [
        17,
        28
    ],
    [
        18,
        19
    ],
    [
        18,
        21
    ],
    [
        19,
        21
    ],
    [
        17,
        21
    ],
    [
        20,
        28
    ]
]

SAMPLE_USERS = [
    {
        "id": 1,
        "username": "aarav_tech",
        "email": "aarav@example.com",
        "password": "Password123!",
        "full_name": "Aarav Sharma",
        "phone": "+91 98765 43210",
        "address": "Flat 402, Shanti Heights, 100ft Road, Indiranagar",
        "city": "Bengaluru",
        "postal_code": "560038"
    },
    {
        "id": 2,
        "username": "ananya_style",
        "email": "ananya@example.com",
        "password": "Password123!",
        "full_name": "Ananya Iyer",
        "phone": "+91 98123 45678",
        "address": "74, Sea Green Apartments, Bandra West",
        "city": "Mumbai",
        "postal_code": "400050"
    },
    {
        "id": 3,
        "username": "rohan_fitness",
        "email": "rohan@example.com",
        "password": "Password123!",
        "full_name": "Rohan Mehta",
        "phone": "+91 99887 76655",
        "address": "B-12, Sector 62",
        "city": "Noida",
        "postal_code": "201301"
    }
]

SAMPLE_ADMIN = {
    "username": "admin",
    "email": "admin@shopsmart.com",
    "password": "AdminPassword123!",
    "full_name": "ShopSmart India Administrator",
    "role": "superadmin"
}
