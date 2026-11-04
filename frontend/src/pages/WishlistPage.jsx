import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import { formatINR } from '../utils/formatCurrency';

export default function WishlistPage() {
  const { wishlist, addToCart, toggleWishlist } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="container py-5 text-center">
        <div className="p-5 rounded-4 mx-auto" style={{ maxWidth: '500px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
          <Heart size={48} className="text-muted mb-3 opacity-50" />
          <h3 className="fw-bold mb-2">Sign In to View Your Wishlist</h3>
          <p className="text-muted mb-4">Save items you love and review them anytime across all your devices.</p>
          <Link to="/login" className="btn-primary-gradient px-4 py-2">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="p-5 rounded-4 mx-auto" style={{ maxWidth: '500px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
          <Heart size={48} className="text-muted mb-3 opacity-50" />
          <h3 className="fw-bold mb-2">Your Wishlist is Empty</h3>
          <p className="text-muted mb-4">Tap the heart on any product to save it here for later.</p>
          <Link to="/products" className="btn-primary-gradient px-4 py-2">
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5">
      <div className="container">
        <h1 className="h3 fw-bold mb-4">My Wishlist ({wishlist.length} items)</h1>

        <div className="row g-4">
          {wishlist.map((item) => (
            <div key={item.product_id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div className="smart-card">
                <div className="card-img-wrap">
                  <img src={item.image_url} alt={item.name} />
                  <button
                    onClick={() => toggleWishlist(item.product_id)}
                    className="wishlist-btn-overlay active"
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
                  <div>
                    <span className="text-muted small text-uppercase fw-bold" style={{ fontSize: '0.72rem' }}>
                      {item.category_name}
                    </span>
                    <h6 className="fw-bold mb-1 text-truncate-2" style={{ fontSize: '0.95rem', minHeight: '2.5rem' }}>
                      <Link to={`/products/${item.product_id}`} className="text-decoration-none">
                        {item.name}
                      </Link>
                    </h6>
                    <StarRating rating={item.rating || 4.5} />
                  </div>

                  <div className="pt-3 border-top mt-2 d-flex align-items-center justify-content-between" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="fw-bolder text-primary">
                      {formatINR(item.price)}
                    </div>

                    <button
                      onClick={() => addToCart(item.product_id, 1, item)}
                      className="btn btn-sm btn-primary-gradient py-2 px-3"
                      style={{ borderRadius: '10px' }}
                    >
                      <ShoppingBag size={14} />
                      <span>Move to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
