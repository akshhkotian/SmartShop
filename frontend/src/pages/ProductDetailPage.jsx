import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Check,
  Share2,
  ChevronRight,
  Plus
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard';
import { formatINR } from '../utils/formatCurrency';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user, trackActivity, showToast } = useAuth();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [fbtProducts, setFbtProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedFbtIds, setSelectedFbtIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setQuantity(1);
    window.scrollTo(0, 0);

    api.get(`/products/${id}`)
      .then(res => {
        const prod = res.data.product;
        setProduct(prod);
        setRelated(res.data.related_products || []);

        // Track user view activity for Apriori interest profile
        trackActivity('view', { product_id: prod.id, category_id: prod.category_id, duration_seconds: 25 });

        // Fetch Apriori Frequently Bought Together recommendations
        return api.get(`/recommendations/frequently-bought-together?product_id=${prod.id}&limit=3`);
      })
      .then(fbtRes => {
        const fbt = fbtRes.data.products || [];
        setFbtProducts(fbt);
        // Pre-select all FBT items
        setSelectedFbtIds(new Set(fbt.map(p => p.id)));
      })
      .catch(err => {
        console.error('Error fetching product:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary my-5" role="status"></div>
        <p className="text-muted">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <h3 className="fw-bold mb-3">Product Not Found</h3>
        <p className="text-muted mb-4">The item you are looking for may have been retired or moved.</p>
        <Link to="/products" className="btn-primary-gradient px-4 py-2">
          Browse Products
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);

  const toggleFbtSelection = (fbtId) => {
    setSelectedFbtIds(prev => {
      const next = new Set(prev);
      if (next.has(fbtId)) {
        next.delete(fbtId);
      } else {
        next.add(fbtId);
      }
      return next;
    });
  };

  const handleAddBundleToCart = () => {
    // Add main item
    addToCart(product.id, 1, product);
    // Add selected bundle items
    fbtProducts.forEach(item => {
      if (selectedFbtIds.has(item.id)) {
        addToCart(item.id, 1, item);
      }
    });
    showToast(`Added bundle (${selectedFbtIds.size + 1} items) to your shopping cart!`);
  };

  // Bundle pricing
  const bundleItems = fbtProducts.filter(p => selectedFbtIds.has(p.id));
  const bundleTotal = Number(product.price) + bundleItems.reduce((acc, cur) => acc + Number(cur.price), 0);

  return (
    <div className="py-4">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="mb-4 small text-muted d-flex align-items-center gap-2">
          <Link to="/" className="text-decoration-none text-muted">Home</Link>
          <ChevronRight size={14} />
          <Link to={`/products?category=${product.category_slug}`} className="text-decoration-none text-muted">
            {product.category_name}
          </Link>
          <ChevronRight size={14} />
          <span className="text-truncate fw-medium" style={{ color: 'var(--text-primary)', maxWidth: '280px' }}>
            {product.name}
          </span>
        </nav>

        {/* Product Overview Section */}
        <div className="row g-5 mb-5">
          {/* Product Image Gallery */}
          <div className="col-lg-6">
            <div
              className="p-3 rounded-4 position-relative"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <img
                src={product.image_url}
                alt={product.name}
                className="w-100 rounded-3"
                style={{ maxHeight: '480px', objectFit: 'contain' }}
              />

              {product.badge && (
                <span className="smart-badge position-absolute top-0 start-0 m-4">
                  {product.badge}
                </span>
              )}
            </div>
          </div>

          {/* Product Details & Actions */}
          <div className="col-lg-6 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="smart-badge-apriori smart-badge">
                  <Sparkles size={12} />
                  Top Rated Pick
                </span>
                <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                  {product.category_name}
                </span>
              </div>

              <h1 className="h2 fw-bolder mb-2" style={{ letterSpacing: '-0.02em' }}>
                {product.name}
              </h1>

              {/* Rating & Stock */}
              <div className="d-flex align-items-center gap-3 mb-3">
                <StarRating rating={product.rating} count={product.review_count} size={18} />
                <div className="vr" style={{ opacity: 0.2 }}></div>
                <span className={`small fw-bold ${product.stock > 0 ? 'text-success' : 'text-danger'}`}>
                  {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                </span>
              </div>

              {/* Price Banner */}
              <div className="p-3 rounded-3 mb-4 d-flex align-items-baseline gap-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <span className="h3 fw-bolder mb-0 text-primary">
                  {formatINR(product.price)}
                </span>
                {Number(product.original_price) > Number(product.price) && (
                  <>
                    <span className="text-muted text-decoration-line-through">
                      {formatINR(product.original_price)}
                    </span>
                    <span className="badge bg-danger rounded-pill">
                      Save {product.discount_percent}%
                    </span>
                  </>
                )}
              </div>

              <p className="mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {product.description}
              </p>

              {/* Quantity Controls & Add to Cart */}
              <div className="d-flex flex-wrap gap-3 align-items-center mb-4">
                <div className="d-flex align-items-center border rounded-3 p-1" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface)' }}>
                  <button
                    className="btn btn-sm border-0 px-3 fw-bold"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <span className="px-3 fw-bold">{quantity}</span>
                  <button
                    className="btn btn-sm border-0 px-3 fw-bold"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => addToCart(product.id, quantity, product)}
                  className="btn-primary-gradient px-4 py-3 flex-grow-1"
                  style={{ fontSize: '1rem' }}
                >
                  <ShoppingBag size={18} />
                  <span>Add to Shopping Cart</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product.id, product)}
                  className={`btn btn-outline-custom p-3 ${inWishlist ? 'text-danger border-danger' : ''}`}
                  title={inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                >
                  <Heart size={20} style={{ fill: inWishlist ? '#e05d6f' : 'none' }} />
                </button>
              </div>
            </div>

            {/* Confidence & Guarantees */}
            <div className="row g-3 pt-3 border-top" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="col-4 d-flex align-items-center gap-2">
                <Truck size={20} className="text-primary flex-shrink-0" />
                <span className="small text-muted">Free Shipping ₹499+</span>
              </div>
              <div className="col-4 d-flex align-items-center gap-2">
                <RotateCcw size={20} className="text-primary flex-shrink-0" />
                <span className="small text-muted">30 Days Returns</span>
              </div>
              <div className="col-4 d-flex align-items-center gap-2">
                <ShieldCheck size={20} className="text-primary flex-shrink-0" />
                <span className="small text-muted">2-Year Warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Frequently Bought Together */}
        {fbtProducts.length > 0 && (
          <section className="p-4 rounded-4 my-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="smart-badge-apriori smart-badge">
                <Sparkles size={13} />
                Bundle & Save
              </span>
              <h4 className="fw-bold mb-0">Frequently Bought Together</h4>
            </div>
            <p className="small text-muted mb-4">
              Shoppers who purchased this item frequently paired it with these complementary products.
            </p>

            <div className="row align-items-center g-4">
              {/* Product thumbnails with plus signs */}
              <div className="col-lg-8">
                <div className="d-flex flex-wrap align-items-center gap-3">
                  {/* Main Product */}
                  <div className="text-center" style={{ width: '130px' }}>
                    <div className="p-2 rounded-3 mb-2" style={{ background: 'var(--bg-surface)', border: '2px solid var(--color-primary)' }}>
                      <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '6px' }} />
                    </div>
                    <div className="small fw-bold text-truncate" title={product.name}>{product.name}</div>
                    <div className="small text-primary fw-bold">{formatINR(product.price)}</div>
                  </div>

                  {fbtProducts.map((fbt) => (
                    <React.Fragment key={fbt.id}>
                      <Plus size={20} className="text-muted" />
                      <div
                        className={`text-center cursor-pointer ${selectedFbtIds.has(fbt.id) ? 'opacity-100' : 'opacity-50'}`}
                        style={{ width: '130px', cursor: 'pointer' }}
                        onClick={() => toggleFbtSelection(fbt.id)}
                      >
                        <div
                          className="p-2 rounded-3 mb-2 position-relative"
                          style={{
                            background: 'var(--bg-surface)',
                            border: `2px solid ${selectedFbtIds.has(fbt.id) ? 'var(--color-primary)' : 'var(--border-color)'}`
                          }}
                        >
                          <img src={fbt.image_url} alt={fbt.name} style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '6px' }} />
                          {selectedFbtIds.has(fbt.id) && (
                            <span className="position-absolute top-0 end-0 badge bg-primary rounded-circle p-1 m-1">
                              <Check size={10} />
                            </span>
                          )}
                        </div>
                        <div className="small fw-bold text-truncate" title={fbt.name}>{fbt.name}</div>
                        <div className="small text-primary fw-bold">{formatINR(fbt.price)}</div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                {/* Checkboxes */}
                <div className="mt-3 d-flex flex-column gap-1">
                  <div className="form-check small">
                    <input className="form-check-input" type="checkbox" checked disabled id="main-item" />
                    <label className="form-check-label fw-bold" htmlFor="main-item">
                      This item: {product.name} ({formatINR(product.price)})
                    </label>
                  </div>
                  {fbtProducts.map((fbt) => (
                    <div key={fbt.id} className="form-check small">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={selectedFbtIds.has(fbt.id)}
                        onChange={() => toggleFbtSelection(fbt.id)}
                        id={`fbt-${fbt.id}`}
                      />
                      <label className="form-check-label cursor-pointer" htmlFor={`fbt-${fbt.id}`}>
                        {fbt.name} ({formatINR(fbt.price)}) – <span className="text-muted">{fbt.rec_reason}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bundle Checkout Box */}
              <div className="col-lg-4 border-start ps-lg-4" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="p-3 rounded-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                  <div className="small text-muted mb-1">Total Bundle Price ({selectedFbtIds.size + 1} items):</div>
                  <div className="h4 fw-bolder text-primary mb-3">
                    {formatINR(bundleTotal)}
                  </div>
                  <button onClick={handleAddBundleToCart} className="btn-primary-gradient w-100 py-2">
                    <ShoppingBag size={16} />
                    <span>Add All to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. Related Products / You May Also Like */}
        {related.length > 0 && (
          <section className="my-5">
            <h4 className="fw-bold mb-4">You May Also Like</h4>
            <div className="row g-4">
              {related.map((p) => (
                <div key={p.id} className="col-12 col-sm-6 col-md-3">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
