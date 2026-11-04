"""
Apriori Association Rule Mining Recommendation Engine
Uses mlxtend and pandas to mine frequent itemsets and association rules.
Calculates personalized product recommendations based on user activities:
purchases, cart additions, wishlist additions, views, and searches.
"""

import json
import pandas as pd
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder
from backend.config import Config
from backend.db import execute_query, execute_non_query

class AprioriRecommendationEngine:
    def __init__(self):
        self.rules_df = pd.DataFrame()
        self.frequent_itemsets = pd.DataFrame()
        self.product_lookup = {}
        self.last_trained = None

    def load_transactions(self):
        """
        Loads all transactions and cart/order baskets from database.
        Returns a list of transaction item lists, e.g. [[1, 3, 4], [2, 6], ...]
        """
        # Fetch from transactions table
        tx_rows = execute_query("SELECT product_ids_json FROM transactions")
        baskets = []
        for r in tx_rows:
            try:
                p_ids = json.loads(r['product_ids_json'])
                if isinstance(p_ids, list) and len(p_ids) > 1:
                    baskets.append([int(pid) for pid in p_ids])
            except Exception:
                continue

        # Fetch from completed orders with >1 item
        order_rows = execute_query("""
            SELECT order_id, product_id 
            FROM order_items 
            ORDER BY order_id
        """)
        order_baskets = {}
        for r in order_rows:
            oid = r['order_id']
            pid = int(r['product_id'])
            order_baskets.setdefault(oid, []).append(pid)

        for oid, items in order_baskets.items():
            if len(items) > 1 and items not in baskets:
                baskets.append(items)

        # Cache product lookup for fast access
        prod_rows = execute_query("SELECT id, name, category_id, price, image_url, rating, badge, slug FROM products")
        self.product_lookup = {int(p['id']): p for p in prod_rows}

        return baskets

    def train(self, min_support=None, min_confidence=None, min_lift=None):
        """
        Executes the Apriori algorithm and generates association rules.
        Saves mined rules to the association_rules database table.
        """
        min_support = min_support or Config.APRIORI_MIN_SUPPORT
        min_confidence = min_confidence or Config.APRIORI_MIN_CONFIDENCE
        min_lift = min_lift or Config.APRIORI_MIN_LIFT

        baskets = self.load_transactions()
        if not baskets:
            print("[Apriori Engine] No transaction baskets available for mining.")
            return

        print(f"[Apriori Engine] Mining {len(baskets)} transaction baskets (min_sup={min_support}, min_conf={min_confidence}, min_lift={min_lift})...")

        # 1. One-hot encode transactions
        te = TransactionEncoder()
        te_ary = te.fit(baskets).transform(baskets)
        df_encoded = pd.DataFrame(te_ary, columns=te.columns_)

        # 2. Frequent Itemsets using Apriori
        frequent_itemsets = apriori(df_encoded, min_support=min_support, use_colnames=True)
        if frequent_itemsets.empty:
            # Fallback with slightly lower support if dataset is small
            print("[Apriori Engine] Retrying with lower min_support=0.02...")
            frequent_itemsets = apriori(df_encoded, min_support=0.02, use_colnames=True)

        self.frequent_itemsets = frequent_itemsets

        # 3. Association Rules
        if not frequent_itemsets.empty:
            rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=min_confidence)
            # Filter by lift
            rules = rules[rules['lift'] >= min_lift]
            self.rules_df = rules.sort_values(by=['lift', 'confidence'], ascending=[False, False])
        else:
            self.rules_df = pd.DataFrame()

        print(f"[Apriori Engine] Discovered {len(self.rules_df)} association rules.")

        # 4. Save to association_rules database table
        self.persist_rules_to_db()

    def persist_rules_to_db(self):
        """
        Saves active rules to association_rules database table for admin analytics.
        """
        try:
            execute_non_query("DELETE FROM association_rules")
            for _, r in self.rules_df.iterrows():
                ant_ids = list(r['antecedents'])
                con_ids = list(r['consequents'])
                ant_names = [self.product_lookup.get(pid, {}).get('name', f"Product {pid}") for pid in ant_ids]
                con_names = [self.product_lookup.get(pid, {}).get('name', f"Product {pid}") for pid in con_ids]

                execute_non_query(
                    """INSERT INTO association_rules 
                    (antecedent_ids, consequent_ids, antecedent_names, consequent_names, support, confidence, lift, leverage, conviction)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                    (
                        json.dumps(ant_ids),
                        json.dumps(con_ids),
                        ", ".join(ant_names),
                        ", ".join(con_names),
                        float(r['support']),
                        float(r['confidence']),
                        float(r['lift']),
                        float(r.get('leverage', 0.0)),
                        float(r.get('conviction', 1.0) if r.get('conviction', 1.0) != float('inf') else 999.0)
                    )
                )
        except Exception as e:
            print(f"[Apriori Engine] Error saving rules to DB: {e}")

    def get_user_interest_profile(self, user_id):
        """
        Gathers user activity history with weighted scores.
        Weights: purchase (5.0) > cart_add (3.5) > wishlist_add (2.5) > view (1.5) > search (1.0)
        Returns a dict of {product_id: cumulative_interest_score}
        """
        if not user_id:
            return {}

        weights = Config.ACTIVITY_WEIGHTS
        product_interest = {}

        # 1. Activities from user_activity
        activities = execute_query(
            "SELECT activity_type, product_id, created_at FROM user_activity WHERE user_id = %s ORDER BY created_at DESC LIMIT 50",
            (user_id,)
        )
        for act in activities:
            pid = act.get('product_id')
            atype = act.get('activity_type')
            if pid:
                w = weights.get(atype, 1.0)
                product_interest[int(pid)] = product_interest.get(int(pid), 0.0) + w

        # 2. Items currently in cart
        cart_rows = execute_query("""
            SELECT ci.product_id 
            FROM cart_items ci
            JOIN cart c ON ci.cart_id = c.id
            WHERE c.user_id = %s
        """, (user_id,))
        for r in cart_rows:
            pid = int(r['product_id'])
            product_interest[pid] = product_interest.get(pid, 0.0) + weights['cart_add']

        # 3. Items in wishlist
        wish_rows = execute_query("SELECT product_id FROM wishlist WHERE user_id = %s", (user_id,))
        for r in wish_rows:
            pid = int(r['product_id'])
            product_interest[pid] = product_interest.get(pid, 0.0) + weights['wishlist_add']

        # 4. Items in browsing history
        browse_rows = execute_query("SELECT product_id FROM browsing_history WHERE user_id = %s ORDER BY created_at DESC LIMIT 15", (user_id,))
        for r in browse_rows:
            pid = int(r['product_id'])
            product_interest[pid] = product_interest.get(pid, 0.0) + weights['view']

        return product_interest

    def get_user_cart_pids(self, user_id):
        """Returns set of product IDs already in user's cart to exclude from certain recommendations."""
        if not user_id:
            return set()
        rows = execute_query("""
            SELECT ci.product_id 
            FROM cart_items ci 
            JOIN cart c ON ci.cart_id = c.id 
            WHERE c.user_id = %s
        """, (user_id,))
        return {int(r['product_id']) for r in rows}

    def recommend_for_user(self, user_id=None, limit=8):
        """
        Core Personalized Recommendation ('Recommended For You')
        Matches user's interested products against Apriori association rules,
        weights by activity interest score and rule lift/confidence,
        and excludes products already in the cart.
        """
        if self.rules_df.empty:
            self.train()

        cart_pids = self.get_user_cart_pids(user_id) if user_id else set()
        user_interest = self.get_user_interest_profile(user_id) if user_id else {}

        candidate_scores = {}
        candidate_reasons = {}

        if user_interest and not self.rules_df.empty:
            for pid, interest_weight in user_interest.items():
                # Find rules where pid is in antecedents
                matched_rules = self.rules_df[
                    self.rules_df['antecedents'].apply(lambda ant: pid in ant)
                ]

                for _, rule in matched_rules.iterrows():
                    for con_pid in rule['consequents']:
                        con_pid = int(con_pid)
                        if con_pid in cart_pids:
                            continue
                        # Composite recommendation score = user_interest * rule_lift * rule_confidence
                        score = float(interest_weight * rule['lift'] * rule['confidence'])
                        if score > candidate_scores.get(con_pid, 0):
                            candidate_scores[con_pid] = score
                            src_prod = self.product_lookup.get(pid, {}).get('name', 'your interaction')
                            candidate_reasons[con_pid] = f"Frequently paired with {src_prod}"

        # Sort candidate products
        sorted_pids = sorted(candidate_scores.keys(), key=lambda x: candidate_scores[x], reverse=True)
        recommended_products = []

        for pid in sorted_pids:
            if pid in self.product_lookup:
                prod = dict(self.product_lookup[pid])
                prod['rec_score'] = round(candidate_scores[pid], 2)
                prod['rec_reason'] = candidate_reasons.get(pid, "Based on your shopping patterns")
                recommended_products.append(prod)
                if len(recommended_products) >= limit:
                    break

        # If insufficient recommendations, supplement with trending/top rated items
        if len(recommended_products) < limit:
            fallback = self.get_trending_products(limit=limit * 2)
            existing_ids = {p['id'] for p in recommended_products} | cart_pids
            for p in fallback:
                if p['id'] not in existing_ids:
                    prod = dict(p)
                    prod['rec_reason'] = "Popular item shoppers love"
                    recommended_products.append(prod)
                    if len(recommended_products) >= limit:
                        break

        return recommended_products

    def get_frequently_bought_together(self, product_ids, limit=4):
        """
        'Frequently Bought Together'
        Given a single product ID or cart product IDs, finds consequents with highest confidence and lift.
        """
        if self.rules_df.empty:
            self.train()

        if isinstance(product_ids, int):
            product_ids = [product_ids]
        product_ids = [int(p) for p in product_ids]

        candidate_scores = {}
        candidate_reasons = {}

        if not self.rules_df.empty:
            for pid in product_ids:
                matched = self.rules_df[
                    self.rules_df['antecedents'].apply(lambda ant: pid in ant)
                ]
                for _, rule in matched.iterrows():
                    for con_pid in rule['consequents']:
                        con_pid = int(con_pid)
                        if con_pid in product_ids:
                            continue
                        score = float(rule['confidence'] * rule['lift'])
                        if score > candidate_scores.get(con_pid, 0):
                            candidate_scores[con_pid] = score
                            conf_pct = int(rule['confidence'] * 100)
                            candidate_reasons[con_pid] = f"{conf_pct}% of customers buy this together"

        sorted_pids = sorted(candidate_scores.keys(), key=lambda x: candidate_scores[x], reverse=True)
        results = []
        for pid in sorted_pids:
            if pid in self.product_lookup:
                prod = dict(self.product_lookup[pid])
                prod['rec_reason'] = candidate_reasons.get(pid, "Bought together often")
                results.append(prod)
                if len(results) >= limit:
                    break

        # Fallback to same-category products if no rule found
        if len(results) < limit and product_ids:
            first_prod = self.product_lookup.get(product_ids[0])
            if first_prod:
                cat_id = first_prod['category_id']
                cat_items = execute_query(
                    "SELECT id, name, category_id, price, image_url, rating, badge, slug FROM products WHERE category_id = %s AND id NOT IN (%s) LIMIT %s",
                    (cat_id, product_ids[0], limit - len(results))
                )
                for ci in cat_items:
                    if int(ci['id']) not in [p['id'] for p in results]:
                        ci_copy = dict(ci)
                        ci_copy['rec_reason'] = "Pairs great in this category"
                        results.append(ci_copy)

        return results

    def get_recommendations_by_search(self, user_id=None, limit=6):
        """
        'Based on Your Recent Searches'
        Extracts recent queries, finds matching products, and uses Apriori rules to expand recommendations.
        """
        if not user_id:
            return self.get_trending_products(limit=limit)

        recent_searches = execute_query(
            "SELECT search_query FROM search_history WHERE user_id = %s ORDER BY created_at DESC LIMIT 5",
            (user_id,)
        )
        if not recent_searches:
            return self.get_trending_products(limit=limit)

        matched_pids = set()
        for s in recent_searches:
            q = f"%{s['search_query'].strip()}%"
            prods = execute_query(
                "SELECT id FROM products WHERE name LIKE %s OR description LIKE %s LIMIT 3",
                (q, q)
            )
            for p in prods:
                matched_pids.add(int(p['id']))

        if not matched_pids:
            return self.get_trending_products(limit=limit)

        # Get rules for these products
        associated = self.get_frequently_bought_together(list(matched_pids), limit=limit)
        return associated if associated else self.get_trending_products(limit=limit)

    def get_recently_viewed(self, user_id, limit=6):
        """
        'Recently Viewed Products'
        """
        if not user_id:
            return []

        rows = execute_query("""
            SELECT p.id, p.name, p.category_id, p.price, p.image_url, p.rating, p.badge, p.slug, bh.created_at
            FROM browsing_history bh
            JOIN products p ON bh.product_id = p.id
            WHERE bh.user_id = %s
            ORDER BY bh.created_at DESC
            LIMIT %s
        """, (user_id, limit))
        
        # Deduplicate while preserving recency order
        seen = set()
        deduped = []
        for r in rows:
            if r['id'] not in seen:
                seen.add(r['id'])
                deduped.append(r)
        return deduped

    def get_trending_products(self, limit=8):
        """
        'Trending Products' (also fallback for new users)
        """
        rows = execute_query("""
            SELECT id, name, category_id, price, original_price, discount_percent, rating, review_count, image_url, badge, slug, is_trending
            FROM products
            WHERE is_trending = 1 OR is_featured = 1
            ORDER BY rating DESC, review_count DESC
            LIMIT %s
        """, (limit,))
        return rows

    def get_mined_rules_summary(self):
        """
        Returns association rules formatted for the Admin Dashboard.
        """
        rows = execute_query("""
            SELECT id, antecedent_names, consequent_names, support, confidence, lift, leverage, conviction
            FROM association_rules
            ORDER BY lift DESC
            LIMIT 25
        """)
        return rows


# Global singleton instance
apriori_engine = AprioriRecommendationEngine()
