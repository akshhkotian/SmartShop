import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, ShieldCheck, Truck, RotateCcw, Headphones, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { showToast } = useAuth();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    setSubscribed(true);
    showToast('Thank you for subscribing to ShopSmart exclusive offers!');
    setEmail('');
  };

  return (
    <footer className="mt-auto border-top" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
      {/* Value Proposition Bar */}
      <div className="py-4 border-bottom" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="container">
          <div className="row g-3 text-center text-md-start">
            <div className="col-6 col-md-3 d-flex align-items-center justify-content-center justify-content-md-start gap-3">
              <Truck size={28} style={{ color: 'var(--color-primary)' }} />
              <div>
                <h6 className="mb-0 fw-bold" style={{ fontSize: '0.92rem' }}>Free Shipping</h6>
                <small className="text-muted">On all orders above ₹499</small>
              </div>
            </div>
            <div className="col-6 col-md-3 d-flex align-items-center justify-content-center justify-content-md-start gap-3">
              <ShieldCheck size={28} style={{ color: 'var(--color-primary)' }} />
              <div>
                <h6 className="mb-0 fw-bold" style={{ fontSize: '0.92rem' }}>Secure Checkout</h6>
                <small className="text-muted">256-bit SSL encrypted</small>
              </div>
            </div>
            <div className="col-6 col-md-3 d-flex align-items-center justify-content-center justify-content-md-start gap-3">
              <RotateCcw size={28} style={{ color: 'var(--color-primary)' }} />
              <div>
                <h6 className="mb-0 fw-bold" style={{ fontSize: '0.92rem' }}>30-Day Returns</h6>
                <small className="text-muted">Hassle-free exchange</small>
              </div>
            </div>
            <div className="col-6 col-md-3 d-flex align-items-center justify-content-center justify-content-md-start gap-3">
              <Headphones size={28} style={{ color: 'var(--color-primary)' }} />
              <div>
                <h6 className="mb-0 fw-bold" style={{ fontSize: '0.92rem' }}>24/7 Support</h6>
                <small className="text-muted">Dedicated concierge team</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="py-5">
        <div className="container">
          <div className="row g-4">
            {/* Brand Info */}
            <div className="col-lg-4 col-md-6">
              <Link to="/" className="brand-logo text-decoration-none mb-3 d-inline-flex">
                <span>ShopSmart</span>
                <span className="brand-dot"></span>
              </Link>
              <p className="small mb-3" style={{ maxWidth: '340px' }}>
                Your destination for curated lifestyle, tech, and fashion essentials. Enjoy a smooth, intuitive shopping experience with fast delivery and premium customer care.
              </p>
              <div className="d-flex align-items-center gap-2">
                <span className="smart-badge-apriori smart-badge">
                  <Sparkles size={12} />
                  Curated For Your Style
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-lg-2 col-md-3 col-6">
              <h6 className="fw-bold mb-3">Shop Categories</h6>
              <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
                <li><Link to="/products?category=electronics" className="text-muted">Electronics</Link></li>
                <li><Link to="/products?category=fashion" className="text-muted">Fashion & Apparel</Link></li>
                <li><Link to="/products?category=beauty" className="text-muted">Beauty & Skincare</Link></li>
                <li><Link to="/products?category=home-appliances" className="text-muted">Home Appliances</Link></li>
                <li><Link to="/products?category=books" className="text-muted">Books & Guides</Link></li>
                <li><Link to="/products?category=sports" className="text-muted">Sports & Fitness</Link></li>
              </ul>
            </div>

            {/* Customer Care */}
            <div className="col-lg-2 col-md-3 col-6">
              <h6 className="fw-bold mb-3">Customer Care</h6>
              <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
                <li><Link to="/dashboard" className="text-muted">My Account</Link></li>
                <li><Link to="/orders" className="text-muted">Track Orders</Link></li>
                <li><Link to="/wishlist" className="text-muted">Saved Items</Link></li>
                <li><Link to="/cart" className="text-muted">Shopping Bag</Link></li>
                <li><Link to="/admin" className="text-muted">Admin Portal</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="col-lg-4 col-md-12">
              <h6 className="fw-bold mb-2">Join the ShopSmart Insider</h6>
              <p className="small text-muted mb-3">
                Receive handpicked curations, early access to flash drops, and members-only deal alerts.
              </p>

              {subscribed ? (
                <div className="p-3 rounded-3" style={{ background: 'var(--badge-bg)', border: '1px solid var(--border-color)' }}>
                  <span className="small fw-semibold" style={{ color: 'var(--color-primary)' }}>
                    ✨ You're all set! Check your inbox for your welcome coupon code: <strong>WELCOME10</strong>
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="d-flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="form-control-custom flex-grow-1"
                    style={{ height: '44px', fontSize: '0.9rem' }}
                  />
                  <button type="submit" className="btn-primary-gradient px-4">
                    <Send size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-5 pt-4 border-top d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 text-muted small" style={{ borderColor: 'var(--border-subtle)' }}>
            <div>
              &copy; {new Date().getFullYear()} ShopSmart Inc. All rights reserved.
            </div>
            <div className="d-flex gap-4">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Help & Support</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
