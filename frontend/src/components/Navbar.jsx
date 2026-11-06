import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Search,
  User,
  ShieldAlert,
  LogOut,
  ChevronDown,
  Layers,
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ThemeToggle from './ThemeToggle';
import api from '../services/api';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout, trackActivity } = useAuth();
  const { cart, wishlist } = useCart();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ products: [], categories: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Fetch categories for navbar
  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data.categories || []))
      .catch(() => {});
  }, []);

  // Autocomplete suggestions debounced
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions({ products: [], categories: [] });
      return;
    }

    const timer = setTimeout(() => {
      api.get(`/products/search/suggestions?q=${encodeURIComponent(searchQuery.trim())}`)
        .then(res => {
          setSuggestions(res.data);
          setShowSuggestions(true);
        })
        .catch(() => {});
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    trackActivity('search', { query_text: searchQuery.trim() });
    navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSuggestionClick = (p) => {
    setShowSuggestions(false);
    setSearchQuery('');
    trackActivity('search', { query_text: p.name });
    navigate(`/products/${p.id}`);
  };

  const cartCount = cart.item_count || 0;
  const wishCount = wishlist.length || 0;
  const location = useLocation();

  // If not logged in and on the front dashboard or login/register page, keep the navigation minimal and focused
  if (!isAuthenticated && (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register')) {
    return (
      <nav className="navbar-custom py-3">
        <div className="container d-flex align-items-center justify-content-between">
          <Link to="/" className="brand-logo text-decoration-none">
            <span>ShopSmart</span>
            <span className="brand-dot"></span>
          </Link>

          <div className="d-flex align-items-center gap-2">
            <Link
              to="/shop"
              className="btn btn-sm btn-outline-custom d-flex align-items-center gap-2 py-2 px-3"
              style={{ borderRadius: '12px' }}
            >
              <ShoppingBag size={16} />
              <span>Explore Store</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar-custom py-2">
      <div className="container d-flex align-items-center justify-content-between gap-3">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo text-decoration-none me-2">
          <span>ShopSmart</span>
          <span className="brand-dot"></span>
        </Link>

        {/* Categories Mega Dropdown Trigger */}
        <div className="dropdown d-none d-lg-block">
          <button
            className="btn btn-outline-custom py-2 px-3 d-flex align-items-center gap-2"
            onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
            style={{ borderRadius: '12px' }}
          >
            <Layers size={17} />
            <span>Categories</span>
            <ChevronDown size={14} />
          </button>

          {categoryMenuOpen && (
            <div
              className="search-dropdown p-2 mt-2"
              style={{ width: '240px' }}
              onMouseLeave={() => setCategoryMenuOpen(false)}
            >
              <Link
                to="/products"
                className="search-suggestion-item text-decoration-none rounded-2"
                onClick={() => setCategoryMenuOpen(false)}
              >
                <span className="fw-bold">All Products</span>
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/products?category=${c.slug}`}
                  className="search-suggestion-item text-decoration-none rounded-2"
                  onClick={() => setCategoryMenuOpen(false)}
                >
                  <span>{c.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Search Bar with Live Autocomplete */}
        <div className="flex-grow-1 mx-2 position-relative" ref={searchRef} style={{ maxWidth: '580px' }}>
          <form onSubmit={handleSearchSubmit} className="d-flex align-items-center position-relative">
            <Search
              size={18}
              className="position-absolute ms-3"
              style={{ color: 'var(--text-muted)', pointerEvents: 'none' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
              placeholder="Search collection..."
              className="form-control-custom w-100 ps-5 pe-5"
              style={{ height: '44px', fontSize: '0.92rem' }}
            />
            {searchQuery && (
              <button
                type="button"
                className="btn position-absolute end-0 me-2 p-1 border-0"
                onClick={() => setSearchQuery('')}
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            )}
          </form>

          {/* Autocomplete Dropdown */}
          {showSuggestions && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
            <div className="search-dropdown">
              {suggestions.categories.length > 0 && (
                <div className="p-2 border-bottom" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="text-muted small fw-bold px-2 text-uppercase" style={{ fontSize: '0.7rem' }}>
                    Categories
                  </span>
                  {suggestions.categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.slug}`}
                      className="search-suggestion-item text-decoration-none"
                      onClick={() => setShowSuggestions(false)}
                    >
                      <Layers size={14} className="text-primary" />
                      <span className="fw-medium">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              )}

              {suggestions.products.length > 0 && (
                <div className="p-2">
                  <span className="text-muted small fw-bold px-2 text-uppercase" style={{ fontSize: '0.7rem' }}>
                    Products
                  </span>
                  {suggestions.products.map((prod) => (
                    <div
                      key={prod.id}
                      className="search-suggestion-item"
                      onClick={() => handleSuggestionClick(prod)}
                    >
                      <img
                        src={prod.image_url}
                        alt={prod.name}
                        style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                      <div className="d-flex flex-column flex-grow-1 overflow-hidden">
                        <span className="fw-medium text-truncate" style={{ fontSize: '0.9rem' }}>
                          {prod.name}
                        </span>
                        <span className="small text-muted">₹{Number(prod.price).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Navigation Controls */}
        <div className="d-flex align-items-center gap-2">
          {/* Theme Toggle Sun / Moon */}
          <ThemeToggle />

          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            className="btn btn-outline-custom position-relative p-2"
            title="Wishlist"
            style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Heart size={20} />
            {wishCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                style={{ background: 'var(--color-accent)', fontSize: '0.68rem', padding: '3px 6px' }}
              >
                {wishCount}
              </span>
            )}
          </Link>

          {/* Shopping Cart Link */}
          <Link
            to="/cart"
            className="btn btn-outline-custom position-relative p-2"
            title="Shopping Cart"
            style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                style={{ background: 'var(--color-primary)', fontSize: '0.68rem', padding: '3px 6px' }}
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Account Dropdown */}
          <div className="position-relative" ref={userMenuRef}>
            {isAuthenticated ? (
              <button
                className="btn btn-outline-custom d-flex align-items-center gap-2 py-2 px-3"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{ borderRadius: '12px' }}
              >
                <User size={18} />
                <span className="d-none d-md-inline fw-semibold" style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.full_name?.split(' ')[0] || user.username}
                </span>
                <ChevronDown size={14} />
              </button>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-custom py-2 px-3 d-none d-sm-inline-flex">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary-gradient py-2 px-3">
                  Register
                </Link>
              </div>
            )}

            {/* User Dropdown Menu */}
            {userMenuOpen && isAuthenticated && (
              <div
                className="search-dropdown p-2 mt-2 position-absolute end-0"
                style={{ width: '220px' }}
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <div className="px-3 py-2 border-bottom" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="fw-bold text-truncate" style={{ color: 'var(--text-primary)' }}>
                    {user.full_name}
                  </div>
                  <div className="small text-muted text-truncate">{user.email}</div>
                  {isAdmin && (
                    <span className="badge mt-1" style={{ background: 'rgba(233, 196, 106, 0.2)', color: 'var(--color-warning)' }}>
                      Admin
                    </span>
                  )}
                </div>

                {!isAdmin && (
                  <>
                    <Link
                      to="/dashboard"
                      className="search-suggestion-item text-decoration-none rounded-2"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User size={15} />
                      <span>My Dashboard</span>
                    </Link>
                    <Link
                      to="/orders"
                      className="search-suggestion-item text-decoration-none rounded-2"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <ShoppingBag size={15} />
                      <span>Order History</span>
                    </Link>
                    <Link
                      to="/wishlist"
                      className="search-suggestion-item text-decoration-none rounded-2"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Heart size={15} />
                      <span>My Wishlist</span>
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="search-suggestion-item text-decoration-none rounded-2"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <ShieldAlert size={15} className="text-warning" />
                    <span className="fw-bold">Admin Portal</span>
                  </Link>
                )}

                <div className="border-top mt-1 pt-1" style={{ borderColor: 'var(--border-subtle)' }}>
                  <button
                    className="search-suggestion-item w-100 text-start border-0 bg-transparent text-danger"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
