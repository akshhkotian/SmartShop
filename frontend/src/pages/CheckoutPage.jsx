import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, CreditCard, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatINR } from '../utils/formatCurrency';

export default function CheckoutPage() {
  const { cart, refreshCart } = useCart();
  const { user, showToast } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const appliedPromo = location.state?.appliedPromo || null;

  const [address, setAddress] = useState(user?.address || '12th Main Road, HAL 2nd Stage, Indiranagar');
  const [city, setCity] = useState(user?.city || 'Bengaluru');
  const [postalCode, setPostalCode] = useState(user?.postal_code || '560038');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [submitting, setSubmitting] = useState(false);

  const subtotal = cart.subtotal || 0;
  const promoDiscount = appliedPromo ? Math.round(subtotal * (appliedPromo.discountPercent / 100) * 100) / 100 : 0;
  const shipping = subtotal >= 499 || subtotal === 0 ? 0 : 49;
  const finalTotal = Math.max(0, subtotal - promoDiscount + shipping);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address.trim() || !city.trim()) {
      showToast('Please fill in complete shipping address information.', 'error');
      return;
    }

    setSubmitting(true);
    const fullShippingAddress = `${address.trim()}, ${city.trim()}, ${postalCode.trim()}`;

    try {
      const res = await api.post('/orders/checkout', {
        shipping_address: fullShippingAddress,
        payment_method: paymentMethod,
        coupon_code: appliedPromo?.code || ''
      });

      await refreshCart();
      showToast('Order confirmed! Generating recommendation updates...');
      navigate('/order-success', { state: { order: res.data.order } });
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to place order. Please try again.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-5">
      <div className="container">
        <Link to="/cart" className="d-inline-flex align-items-center gap-1 text-muted text-decoration-none small mb-4">
          <ArrowLeft size={16} />
          <span>Return to Shopping Bag</span>
        </Link>

        <h1 className="h3 fw-bold mb-4">Checkout & Confirmation</h1>

        <div className="row g-5">
          {/* Shipping & Payment Form */}
          <div className="col-lg-7">
            <form onSubmit={handlePlaceOrder}>
              {/* Shipping Address Section */}
              <div className="p-4 rounded-4 mb-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <h5 className="fw-bold mb-3">1. Delivery Address</h5>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small fw-semibold text-muted">Street Address / House No.</label>
                    <input
                      type="text"
                      className="form-control-custom w-100"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Flat / House No., Landmark, Area"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">City</label>
                    <input
                      type="text"
                      className="form-control-custom w-100"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Bengaluru, Mumbai, Delhi"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">PIN Code</label>
                    <input
                      type="text"
                      className="form-control-custom w-100"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="6-digit PIN code (e.g. 560038)"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="p-4 rounded-4 mb-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <h5 className="fw-bold mb-3">2. Payment Method</h5>
                <div className="d-flex flex-column gap-2">
                  {[
                    'UPI (Google Pay / PhonePe / Paytm / BHIM)',
                    'RuPay / Debit / Credit Cards',
                    'Net Banking (All Indian Banks)',
                    'Cash on Delivery (COD)'
                  ].map((method) => (
                    <label
                      key={method}
                      className="p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer"
                      style={{
                        borderColor: paymentMethod === method ? 'var(--color-primary)' : 'var(--border-color)',
                        background: paymentMethod === method ? 'var(--badge-bg)' : 'transparent',
                        cursor: 'pointer'
                      }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === method}
                          onChange={() => setPaymentMethod(method)}
                          className="form-check-input mt-0"
                        />
                        <span className="fw-semibold">{method}</span>
                      </div>
                      <CreditCard size={18} className="text-muted" />
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary-gradient w-100 py-3"
                style={{ fontSize: '1.05rem' }}
              >
                {submitting ? (
                  <span>Processing Order...</span>
                ) : (
                  <span>Place Order ({formatINR(finalTotal)})</span>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="col-lg-5">
            <div className="p-4 rounded-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <h5 className="fw-bold mb-3">Order Items ({cart.item_count})</h5>

              <div className="d-flex flex-column gap-3 mb-4 max-h-300 overflow-auto">
                {cart.items.map((item) => (
                  <div key={item.product_id} className="d-flex align-items-center gap-3">
                    <img src={item.image_url} alt={item.name} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '10px' }} />
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="small fw-bold text-truncate">{item.name}</div>
                      <div className="small text-muted">Qty: {item.quantity}</div>
                    </div>
                    <div className="small fw-bold">
                      {formatINR(Number(item.price) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-top d-flex flex-column gap-2 mb-3" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="d-flex justify-content-between text-muted small">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="d-flex justify-content-between text-success small">
                    <span>Discount</span>
                    <span>-{formatINR(promoDiscount)}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between text-muted small">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : formatINR(shipping)}</span>
                </div>
              </div>

              <div className="pt-2 border-top d-flex justify-content-between align-items-baseline mb-4" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="h6 fw-bold mb-0">Total Due</span>
                <span className="h4 fw-bolder mb-0 text-primary">{formatINR(finalTotal)}</span>
              </div>

              <div className="d-flex align-items-center gap-2 p-3 rounded-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <ShieldCheck size={20} className="text-success flex-shrink-0" />
                <span className="small text-muted">256-bit SSL encrypted checkout. Satisfaction guaranteed.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
