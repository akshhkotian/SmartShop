#!/usr/bin/env python3
"""
ShopSmart Database Initialization Script
Initializes MySQL database tables from schema.sql and seeds data.
Can also fall back to SQLite if MySQL is unavailable.
"""

import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.db import init_database
from backend.ml.apriori_engine import apriori_engine

if __name__ == '__main__':
    print("=" * 60)
    print(" ShopSmart E-Commerce Database Initializer")
    print("=" * 60)
    init_database()
    print("Mining Apriori association rules...")
    apriori_engine.train()
    print(f"Apriori rule mining complete: {len(apriori_engine.rules_df)} rules generated.")
    print("Done! Database is ready.")
