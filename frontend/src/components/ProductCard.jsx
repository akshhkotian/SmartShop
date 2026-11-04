import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import StarRating from './StarRating';

export default function ProductCard({ product, showReason = true }) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1, product);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id, product);
  };

  return (
    <div className="smart-card">
      <Link to={`/products/${product.id}`} className="text-decoration-none">
        {/* Card Image and Badges */}
        <div className="card-img-wrap">
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
            }}
          />

          <div className="card-badges">
            {product.badge && (
              <span className="smart-badge">
                {product.badge}
              </span>
            )}
            {product.discount_percent > 0 && (
              <span
                className="smart-badge"
                style={{
                  background: 'rgba(224, 93, 111, 0.14)',
                  color: 'var(--color-danger)',
                  borderColor: 'rgba(224, 93, 111, 0.2)'
                }}
              >
                -{product.discount_percent}%
              </span>
            )}
          </div>

          <button
            onClick={handleWishlist}
            className={`wishlist-btn-overlay ${inWishlist ? 'active' : ''}`}
            title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label="Wishlist"
          >
            <Heart
              size={18}
              style={{
                fill: inWishlist ? '#e05d6f' : 'none',
                stroke: inWishlist ? '#e05d6f' : 'currentColor'
              }}
            />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
          <div>
            {/* Category / Apriori Reason */}
            {showReason && product.rec_reason ? (
              <div className="mb-2">
                <span className="smart-badge-apriori smart-badge">
                  <Sparkles size={12} />
                  {product.rec_reason}
                </span>
              </div>
            ) : product.category_name ? (
              <span className="text-muted small text-uppercase fw-bold" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                {product.category_name}
              </span>
            ) : null}

            {/* Product Name */}
            <h6
              className="fw-bold mb-1 text-truncate-2"
              style={{
                fontSize: '0.98rem',
                color: 'var(--text-primary)',
                minHeight: '2.5rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
              title={product.name}
            >
              {product.name}
            </h6>

            {/* Rating */}
            <div className="mb-2">
              <StarRating rating={product.rating || 4.5} count={product.review_count} />
            </div>
          </div>

          {/* Price & Action */}
          <div className="pt-2 border-top d-flex align-items-center justify-content-between" style={{ borderColor: 'var(--border-subtle)' }}>
            <div>
              <div className="d-flex align-items-baseline gap-2">
                <span className="h6 fw-bolder mb-0" style={{ color: 'var(--text-primary)' }}>
                  ₹{Number(product.price).toLocaleString('en-IN')}
                </span>
                {Number(product.original_price) > Number(product.price) && (
                  <span className="small text-muted text-decoration-line-through">
                    ₹{Number(product.original_price).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="btn btn-sm btn-primary-gradient py-2 px-3"
              title="Add to Cart"
              style={{ borderRadius: '10px', fontSize: '0.85rem' }}
            >
              <ShoppingBag size={14} />
              <span>Add</span>
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
