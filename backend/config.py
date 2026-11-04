import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / 'backend' / '.env')
load_dotenv(BASE_DIR / '.env')

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'shopsmart_secret_key_2026_super_secure_apriori_ai')
    JWT_SECRET = os.getenv('JWT_SECRET', 'shopsmart_jwt_secret_token_signature_key_2026')
    
    # Database Settings
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = int(os.getenv('DB_PORT', 3306))
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'root')
    DB_NAME = os.getenv('DB_NAME', 'shopsmart_db')
    
    # Fallback SQLite DB Path
    SQLITE_DB_PATH = os.path.join(str(BASE_DIR), 'database', 'shopsmart.db')
    
    # Apriori Association Rule Mining Parameters
    APRIORI_MIN_SUPPORT = float(os.getenv('APRIORI_MIN_SUPPORT', 0.04))
    APRIORI_MIN_CONFIDENCE = float(os.getenv('APRIORI_MIN_CONFIDENCE', 0.15))
    APRIORI_MIN_LIFT = float(os.getenv('APRIORI_MIN_LIFT', 1.0))
    
    # Activity weights for ranking customer interest
    # Purchases show the strongest intent, followed by cart, wishlist, view, and search
    ACTIVITY_WEIGHTS = {
        'purchase': 5.0,
        'cart_add': 3.5,
        'wishlist_add': 2.5,
        'view': 1.5,
        'search': 1.0
    }
