import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, ShieldCheck, Sparkles, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, adminLogin, showToast } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter both your email/username and password.');
      return;
    }

    setLoading(true);
    // The backend /api/auth/login now automatically handles both regular users and admins!
    const res = await login(identifier, password);
    setLoading(false);

    if (res.success) {
      const savedUser = JSON.parse(localStorage.getItem('shopsmart_user') || '{}');
      if (savedUser.is_admin) {
        navigate('/admin');
      } else if (redirect === 'checkout') {
        navigate('/checkout');
      } else {
        navigate('/dashboard');
      }
    } else {
      setErrorMessage(res.error || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="py-5" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-9 col-lg-6 col-xl-5">
            <div
              className="p-4 p-md-5 rounded-4"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              {/* Header */}
              <div className="text-center mb-4">
                <Link to="/" className="brand-logo justify-content-center text-decoration-none mb-2">
                  <span>ShopSmart</span>
                  <span className="brand-dot"></span>
                </Link>
                <h3 className="fw-bold mb-1">Welcome Back</h3>
                <p className="text-muted small">
                  Sign in to explore personalized recommendations tailored for you
                </p>
              </div>

              {/* Error Alert Display */}
              {errorMessage && (
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
                  <div>{errorMessage}</div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Email or Username</label>
                  <div className="position-relative">
                    <User
                      size={18}
                      className="position-absolute ms-3 top-50 translate-middle-y text-muted"
                    />
                    <input
                      type="text"
                      className="form-control-custom w-100 ps-5"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
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
                    <Lock
                      size={18}
                      className="position-absolute ms-3 top-50 translate-middle-y text-muted"
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control-custom w-100 ps-5 pe-5"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="btn position-absolute end-0 top-50 translate-middle-y me-2 p-1 border-0 bg-transparent"
                      style={{ color: 'var(--text-muted)' }}
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary-gradient w-100 py-3 mt-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                >
                  {loading ? (
                    <span>Signing In...</span>
                  ) : (
                    <>
                      <span>Sign In to Account</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-4 small text-muted">
                Don't have an account yet?{' '}
                <Link to="/register" className="fw-bold text-primary text-decoration-none">
                  Create free account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
