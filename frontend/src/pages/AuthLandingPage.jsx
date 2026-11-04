import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, User, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthLandingPage({ initialTab = 'login' }) {
  const { login, adminLogin, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [activeTab, setActiveTab] = useState(initialTab); // 'login' | 'register'
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regData, setRegData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    address: '',
    city: '',
    postal_code: ''
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginIdentifier.trim() || !loginPassword) {
      setLoginError('Please enter both your email/username and password.');
      return;
    }

    setLoginLoading(true);
    const res = await login(loginIdentifier.trim(), loginPassword);
    setLoginLoading(false);

    if (res.success) {
      const savedUser = JSON.parse(localStorage.getItem('shopsmart_user') || '{}');
      if (savedUser.is_admin) {
        navigate('/admin');
      } else if (redirect === 'checkout') {
        navigate('/checkout');
      } else {
        navigate('/');
      }
    } else {
      setLoginError(res.error || 'Login failed. Please check your credentials.');
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');

    if (regData.password !== regData.confirm_password) {
      setRegError('Passwords do not match.');
      return;
    }
    if (regData.password.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }

    setRegLoading(true);
    const res = await register(regData);
    setRegLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setRegError(res.error || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div className="py-4 py-md-5" style={{ minHeight: '88vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-7 col-xl-6">
            <div
              className="p-4 p-sm-5 rounded-4"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              {/* Header Branding */}
              <div className="text-center mb-4">
                <Link to="/" className="brand-logo justify-content-center text-decoration-none mb-2">
                  <span>ShopSmart</span>
                  <span className="brand-dot"></span>
                </Link>
                <h3 className="fw-bolder mb-1" style={{ letterSpacing: '-0.02em' }}>
                  {activeTab === 'login' ? 'Welcome Back' : 'Create an Account'}
                </h3>
                <p className="text-muted small mb-0">
                  {activeTab === 'login'
                    ? 'Sign in to access your personalized shopping experience'
                    : 'Join ShopSmart to discover products tailored to your taste'}
                </p>
              </div>

              {/* Tab Selector: Login vs Register */}
              <div
                className="d-flex p-1 rounded-3 mb-4"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <button
                  type="button"
                  className={`flex-grow-1 btn py-2 rounded-2 fw-semibold transition-all ${
                    activeTab === 'login'
                      ? 'btn-primary-gradient shadow-sm'
                      : 'btn-outline-custom border-0'
                  }`}
                  style={{ fontSize: '0.92rem' }}
                  onClick={() => {
                    setActiveTab('login');
                    setLoginError('');
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`flex-grow-1 btn py-2 rounded-2 fw-semibold transition-all ${
                    activeTab === 'register'
                      ? 'btn-primary-gradient shadow-sm'
                      : 'btn-outline-custom border-0'
                  }`}
                  style={{ fontSize: '0.92rem' }}
                  onClick={() => {
                    setActiveTab('register');
                    setRegError('');
                  }}
                >
                  Create Account
                </button>
              </div>

              {/* ================= TAB 1: LOGIN FORM ================= */}
              {activeTab === 'login' && (
                <div>
                  {loginError && (
                    <div
                      className="p-3 rounded-3 mb-3 d-flex align-items-start gap-2"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        fontSize: '0.88rem'
                      }}
                    >
                      <AlertCircle size={18} className="flex-shrink-0 mt-1" />
                      <div>{loginError}</div>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit}>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted">Email or Username</label>
                      <div className="position-relative">
                        <User size={18} className="position-absolute ms-3 top-50 translate-middle-y text-muted" />
                        <input
                          type="text"
                          className="form-control-custom w-100 ps-5"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          placeholder="e.g. alex@example.com or admin"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label small fw-semibold text-muted mb-0">Password</label>
                        <Link to="/forgot-password" className="small text-muted text-decoration-none">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="position-relative">
                        <Lock size={18} className="position-absolute ms-3 top-50 translate-middle-y text-muted" />
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          className="form-control-custom w-100 ps-5 pe-5"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                        />
                        <button
                          type="button"
                          className="btn position-absolute end-0 top-50 translate-middle-y me-2 p-1 border-0 bg-transparent"
                          style={{ color: 'var(--text-muted)' }}
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          title={showLoginPassword ? 'Hide password' : 'Show password'}
                        >
                          {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="btn-primary-gradient w-100 py-3 mt-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                    >
                      {loginLoading ? (
                        <span>Signing In...</span>
                      ) : (
                        <>
                          <span>Sign In to Account</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* ================= TAB 2: REGISTER FORM ================= */}
              {activeTab === 'register' && (
                <div>
                  {regError && (
                    <div
                      className="p-3 rounded-3 mb-3 d-flex align-items-start gap-2"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        fontSize: '0.88rem'
                      }}
                    >
                      <AlertCircle size={18} className="flex-shrink-0 mt-1" />
                      <div>{regError}</div>
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit}>
                    <div className="row g-3">
                      <div className="col-12 col-sm-6">
                        <label className="form-label small fw-semibold text-muted">Full Name</label>
                        <input
                          type="text"
                          className="form-control-custom w-100"
                          value={regData.full_name}
                          onChange={(e) => setRegData({ ...regData, full_name: e.target.value })}
                          placeholder="Jane Doe"
                          required
                        />
                      </div>

                      <div className="col-12 col-sm-6">
                        <label className="form-label small fw-semibold text-muted">Username</label>
                        <input
                          type="text"
                          className="form-control-custom w-100"
                          value={regData.username}
                          onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                          placeholder="janedoe"
                          required
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-semibold text-muted">Email Address</label>
                        <input
                          type="email"
                          className="form-control-custom w-100"
                          value={regData.email}
                          onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                          placeholder="jane@example.com"
                          required
                        />
                      </div>

                      <div className="col-12 col-sm-6">
                        <label className="form-label small fw-semibold text-muted">Password</label>
                        <div className="position-relative">
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            className="form-control-custom w-100 pe-5"
                            value={regData.password}
                            onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                            placeholder="At least 6 characters"
                            required
                          />
                          <button
                            type="button"
                            className="btn position-absolute end-0 top-50 translate-middle-y me-2 p-1 border-0 bg-transparent"
                            style={{ color: 'var(--text-muted)' }}
                            onClick={() => setShowRegPassword(!showRegPassword)}
                          >
                            {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="col-12 col-sm-6">
                        <label className="form-label small fw-semibold text-muted">Confirm Password</label>
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          className="form-control-custom w-100"
                          value={regData.confirm_password}
                          onChange={(e) => setRegData({ ...regData, confirm_password: e.target.value })}
                          placeholder="Repeat password"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={regLoading}
                      className="btn-primary-gradient w-100 py-3 mt-4 fw-semibold d-flex align-items-center justify-content-center gap-2"
                    >
                      {regLoading ? (
                        <span>Creating Account...</span>
                      ) : (
                        <>
                          <span>Create Free Account</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Bottom Quick Store Link */}
              <div className="text-center mt-4 pt-3 border-top" style={{ borderColor: 'var(--border-subtle)' }}>
                <Link
                  to="/shop"
                  className="small text-muted text-decoration-none d-inline-flex align-items-center gap-1 hover-primary"
                >
                  <ShoppingBag size={14} />
                  <span>Or explore the storefront as a guest &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
