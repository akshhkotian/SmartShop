import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/formatCurrency';

export default function ProductCard({ product }) {
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
      <Link to={`/products/${product.id}`} className="text-decoration-none d-flex flex-column h-100">
        {/* Clean Image Container */}
        <div className="card-img-wrap">
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
            }}
          />

          {product.badge && (
            <div className="card-badges">
              <span className="smart-badge">
                {product.badge}
              </span>
            </div>
          )}

          <button
            onClick={handleWishlist}
            className={`wishlist-btn-overlay ${inWishlist ? 'active' : ''}`}
            title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label="Wishlist"
          >
            <Heart
              size={15}
              style={{
                fill: inWishlist ? 'currentColor' : 'none'
              }}
            />
          </button>
        </div>

        {/* Minimalist Card Body */}
        <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
          <div>
            {product.category_name && (
              <div className="small text-uppercase mb-1" style={{ fontSize: '0.68rem', letterSpacing: '0.08em', color: 'var(--color-secondary)', fontWeight: 600 }}>
                {product.category_name}
              </div>
            )}

            <h6
              className="mb-2"
              style={{
                fontSize: '0.92rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                lineHeight: 1.35,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: '2.5rem'
              }}
              title={product.name}
            >
              {product.name}
            </h6>
          </div>

          {/* Clean Price & Quick Add */}
          <div className="pt-2 d-flex align-items-center justify-content-between border-top" style={{ borderColor: 'var(--border-subtle)' }}>
            <div>
              <span className="fw-bold" style={{ color: 'var(--text-primary)', fontSize: '0.96rem' }}>
                {formatINR(product.price)}
              </span>
              {Number(product.original_price) > Number(product.price) && (
                <span className="small text-muted text-decoration-line-through ms-2" style={{ fontSize: '0.78rem' }}>
                  {formatINR(product.original_price)}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              className="btn btn-sm btn-outline-custom d-flex align-items-center justify-content-center p-2"
              title="Add to Cart"
              style={{ width: '32px', height: '32px', borderRadius: '50%' }}
            >
              <Plus size={15} />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
