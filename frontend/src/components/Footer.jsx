import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto border-top py-5" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
      <div className="container">
        <div className="row g-4 justify-content-between">
          {/* Brand Info */}
          <div className="col-lg-4 col-md-6">
            <Link to="/" className="brand-logo text-decoration-none mb-2 d-inline-flex">
              <span>ShopSmart</span>
              <span className="brand-dot"></span>
            </Link>
            <p className="small mb-0" style={{ color: 'var(--text-secondary)', maxWidth: '300px' }}>
              Thoughtfully curated goods for mindful living, designed with quality and simplicity.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="fw-semibold mb-3 small text-uppercase" style={{ letterSpacing: '0.06em', color: 'var(--text-primary)' }}>
              Categories
            </h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0" style={{ color: 'var(--text-secondary)' }}>
              <li><Link to="/products?category=electronics" className="text-decoration-none">Electronics</Link></li>
              <li><Link to="/products?category=fashion" className="text-decoration-none">Fashion</Link></li>
              <li><Link to="/products?category=beauty" className="text-decoration-none">Wellness</Link></li>
              <li><Link to="/products?category=home-appliances" className="text-decoration-none">Home</Link></li>
            </ul>
          </div>

          {/* Navigation */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="fw-semibold mb-3 small text-uppercase" style={{ letterSpacing: '0.06em', color: 'var(--text-primary)' }}>
              Account
            </h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0" style={{ color: 'var(--text-secondary)' }}>
              <li><Link to="/dashboard" className="text-decoration-none">Dashboard</Link></li>
              <li><Link to="/orders" className="text-decoration-none">Orders</Link></li>
              <li><Link to="/wishlist" className="text-decoration-none">Wishlist</Link></li>
              <li><Link to="/cart" className="text-decoration-none">Bag</Link></li>
            </ul>
          </div>

          {/* Minimalist Notice */}
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-semibold mb-3 small text-uppercase" style={{ letterSpacing: '0.06em', color: 'var(--text-primary)' }}>
              Complimentary Delivery
            </h6>
            <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
              Free standard delivery across India on orders above ₹499. Easy 30-day returns on all essentials.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-5 pt-4 border-top d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2 text-muted small" style={{ borderColor: 'var(--border-subtle)', fontSize: '0.82rem' }}>
          <div>
            &copy; {new Date().getFullYear()} ShopSmart. All rights reserved.
          </div>
          <div className="d-flex gap-3">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
