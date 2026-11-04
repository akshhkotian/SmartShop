import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { formatINR } from '../utils/formatCurrency';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user, isAuthenticated, showToast } = useAuth();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [cartRecommendations, setCartRecommendations] = useState([]);

  // Fetch Apriori recommendations based on current cart items
  useEffect(() => {
    if (cart.items && cart.items.length > 0) {
      const pids = cart.items.map(i => i.product_id).join(',');
      api.get(`/recommendations/frequently-bought-together?product_ids=${pids}&limit=4`)
        .then(res => {
          setCartRecommendations(res.data.products || []);
        })
        .catch(() => {});
    } else {
      setCartRecommendations([]);
    }
  }, [cart.items]);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === 'SMART20') {
      setAppliedPromo({ code, discountPercent: 20 });
      showToast('Promo code SMART20 applied! 20% discount added.');
    } else if (code === 'WELCOME10') {
      setAppliedPromo({ code, discountPercent: 10 });
      showToast('Promo code WELCOME10 applied! 10% discount added.');
    } else {
      showToast('Invalid promo code. Try SMART20 or WELCOME10.', 'error');
    }
  };

  const subtotal = cart.subtotal || 0;
  const promoDiscount = appliedPromo ? roundPrice(subtotal * (appliedPromo.discountPercent / 100)) : 0;
  const shipping = subtotal >= 99 || subtotal === 0 ? 0 : 9.99;
  const finalTotal = Math.max(0, subtotal - promoDiscount + shipping);

  function roundPrice(val) {
    return Math.round(val * 100) / 100;
  }

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      showToast('Please sign in or register to complete your order.', 'info');
      navigate('/login?redirect=checkout');
      return;
    }
    navigate('/checkout', { state: { appliedPromo } });
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="p-5 rounded-4 mx-auto" style={{ maxWidth: '540px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <ShoppingBag size={54} className="text-muted mb-3 opacity-50" />
          <h3 className="fw-bold mb-2">Your Shopping Bag is Empty</h3>
          <p className="text-muted mb-4">
            Looks like you haven't added anything yet. Explore our curated collections with intelligent recommendations!
          </p>
          <Link to="/products" className="btn-primary-gradient px-4 py-2">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 fw-bold mb-0">Shopping Cart ({cart.item_count} items)</h1>
          <button onClick={clearCart} className="btn btn-sm btn-link text-danger text-decoration-none">
            Clear Cart
          </button>
        </div>

        <div className="row g-5">
          {/* Cart Items List */}
          <div className="col-lg-8">
            <div className="d-flex flex-column gap-3">
              {cart.items.map((item) => (
                <div
                  key={item.cart_item_id || item.product_id}
                  className="p-3 rounded-4 d-flex align-items-center gap-3"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    style={{ width: '84px', height: '84px', objectFit: 'cover', borderRadius: '12px' }}
                  />

                  <div className="flex-grow-1 overflow-hidden">
                    <span className="small text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>
                      {item.category_name}
                    </span>
                    <h6 className="fw-bold mb-1 text-truncate" title={item.name}>
                      <Link to={`/products/${item.product_id}`} className="text-decoration-none">
                        {item.name}
                      </Link>
                    </h6>
                    <div className="fw-bold text-primary">
                      {formatINR(item.price)}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="d-flex align-items-center border rounded-3 p-1" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface)' }}>
                    <button
                      className="btn btn-sm border-0 px-2 fw-bold"
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="px-2 small fw-bold">{item.quantity}</span>
                    <button
                      className="btn btn-sm border-0 px-2 fw-bold"
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-end" style={{ minWidth: '80px' }}>
                    <div className="fw-bold">
                      {formatINR(Number(item.price) * item.quantity)}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="btn btn-sm text-muted p-2"
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            {/* Cart-Based Recommendations */}
            {cartRecommendations.length > 0 && (
              <div className="mt-5 p-4 rounded-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span className="smart-badge-apriori smart-badge">
                    <Sparkles size={12} />
                    Pairs Great With Your Cart
                  </span>
                  <h5 className="fw-bold mb-0">Complete Your Setup</h5>
                </div>
                <p className="small text-muted mb-4">
                  Customers with similar carts frequently added these products before checkout.
                </p>
                <div className="row g-3">
                  {cartRecommendations.slice(0, 3).map((rec) => (
                    <div key={rec.id} className="col-12 col-md-4">
                      <ProductCard product={rec} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="col-lg-4">
            <div
              className="p-4 rounded-4 position-sticky"
              style={{
                top: '90px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <h5 className="fw-bold mb-3">Order Summary</h5>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="mb-4">
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code (e.g. SMART20)"
                    className="form-control-custom flex-grow-1"
                    style={{ height: '42px', fontSize: '0.85rem' }}
                  />
                  <button type="submit" className="btn-outline-custom px-3" style={{ height: '42px' }}>
                    Apply
                  </button>
                </div>
                {appliedPromo && (
                  <div className="small text-success mt-1 d-flex align-items-center gap-1">
                    <Tag size={12} />
                    <span>{appliedPromo.code} applied (-{appliedPromo.discountPercent}%)</span>
                  </div>
                )}
              </form>

              {/* Line Items */}
              <div className="d-flex flex-column gap-2 mb-3 pb-3 border-bottom" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="d-flex justify-content-between text-muted">
                  <span>Subtotal</span>
                  <span className="fw-semibold" style={{ color: 'var(--text-primary)' }}>
                    {formatINR(subtotal)}
                  </span>
                </div>

                {promoDiscount > 0 && (
                  <div className="d-flex justify-content-between text-success">
                    <span>Discount ({appliedPromo.code})</span>
                    <span>-{formatINR(promoDiscount)}</span>
                  </div>
                )}

                <div className="d-flex justify-content-between text-muted">
                  <span>Estimated Shipping</span>
                  <span>{shipping === 0 ? <strong className="text-success">Free</strong> : formatINR(shipping)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="d-flex justify-content-between align-items-baseline mb-4">
                <span className="h6 fw-bold mb-0">Total</span>
                <span className="h4 fw-bolder mb-0 text-primary">
                  {formatINR(finalTotal)}
                </span>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="btn-primary-gradient w-100 py-3 mb-3 d-flex align-items-center justify-content-center gap-2"
                style={{ fontSize: '1rem' }}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </button>

              <div className="small text-muted text-center d-flex align-items-center justify-content-center gap-1">
                <ShieldCheck size={16} className="text-success" />
                <span>Encrypted 256-bit Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
