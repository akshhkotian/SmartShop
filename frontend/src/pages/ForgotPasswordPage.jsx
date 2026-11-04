import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const { showToast } = useAuth();
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password should be at least 6 characters.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
        new_password: newPassword
      });
      showToast(res.data.message || 'Password reset successful!');
      setResetDone(true);
    } catch (err) {
      showToast(err.response?.data?.error || 'Password reset failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-5">
            <div
              className="p-4 p-md-5 rounded-4"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <Link to="/login" className="d-inline-flex align-items-center gap-1 text-muted text-decoration-none small mb-4">
                <ArrowLeft size={16} />
                <span>Back to Sign In</span>
              </Link>

              <div className="text-center mb-4">
                <h4 className="fw-bold mb-1">Reset Password</h4>
                <p className="text-muted small">
                  Enter your registered email and choose your new password
                </p>
              </div>

              {resetDone ? (
                <div className="text-center py-3">
                  <CheckCircle2 size={48} className="text-success mb-3" />
                  <h5 className="fw-bold mb-2">Password Updated!</h5>
                  <p className="text-muted small mb-4">
                    Your password has been securely reset. You can now log into your account.
                  </p>
                  <Link to="/login" className="btn-primary-gradient px-4 py-2">
                    Sign In Now
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleReset}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Registered Email</label>
                    <div className="position-relative">
                      <Mail size={18} className="position-absolute ms-3 top-50 translate-middle-y text-muted" />
                      <input
                        type="email"
                        className="form-control-custom w-100 ps-5"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">New Password</label>
                    <div className="position-relative">
                      <Lock size={18} className="position-absolute ms-3 top-50 translate-middle-y text-muted" />
                      <input
                        type="password"
                        className="form-control-custom w-100 ps-5"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-muted">Confirm New Password</label>
                    <div className="position-relative">
                      <Lock size={18} className="position-absolute ms-3 top-50 translate-middle-y text-muted" />
                      <input
                        type="password"
                        className="form-control-custom w-100 ps-5"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary-gradient w-100 py-3"
                  >
                    {loading ? 'Updating Password...' : 'Reset Password'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
