import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register, showToast } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    full_name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (formData.password.length < 6) {
      showToast('Password should be at least 6 characters.', 'error');
      return;
    }

    setLoading(true);
    const res = await register(formData);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-9 col-lg-7">
            <div
              className="p-4 p-md-5 rounded-4"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <div className="text-center mb-4">
                <Link to="/" className="brand-logo justify-content-center text-decoration-none mb-2">
                  <span>ShopSmart</span>
                  <span className="brand-dot"></span>
                </Link>
                <h4 className="fw-bold mb-1">Create Your Account</h4>
                <p className="text-muted small">
                  Unlock personalized product recommendations tailored to your style
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="form-control-custom w-100"
                      placeholder="Jane Doe"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="form-control-custom w-100"
                      placeholder="janedoe"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-control-custom w-100"
                      placeholder="jane@example.com"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-control-custom w-100"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="form-control-custom w-100"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">Confirm Password</label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      className="form-control-custom w-100"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold text-muted">Shipping Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="form-control-custom w-100"
                      placeholder="Street address, apartment or suite"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="form-control-custom w-100"
                      placeholder="City"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">Postal / ZIP Code</label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                      className="form-control-custom w-100"
                      placeholder="ZIP Code"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary-gradient w-100 py-3 mt-4"
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </button>
              </form>

              <div className="text-center mt-4 small text-muted">
                Already have an account?{' '}
                <Link to="/login" className="fw-bold text-primary text-decoration-none">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
