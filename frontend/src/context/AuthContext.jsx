import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('shopsmart_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const login = async (identifier, password) => {
    try {
      const res = await api.post('/auth/login', { identifier, password });
      const userData = res.data.user;
      setUser(userData);
      localStorage.setItem('shopsmart_user', JSON.stringify(userData));
      showToast(res.data.message || 'Login successful!');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please check your credentials.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const adminLogin = async (identifier, password) => {
    try {
      const res = await api.post('/auth/admin-login', { identifier, password });
      const adminData = res.data.user;
      setUser(adminData);
      localStorage.setItem('shopsmart_user', JSON.stringify(adminData));
      showToast(res.data.message || 'Admin login successful!');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid administrator credentials.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      const userData = res.data.user;
      setUser(userData);
      localStorage.setItem('shopsmart_user', JSON.stringify(userData));
      showToast(res.data.message || 'Welcome to ShopSmart!');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    setUser(null);
    localStorage.removeItem('shopsmart_user');
    showToast('Logged out successfully.');
  };

  const updateProfile = async (data) => {
    try {
      const res = await api.put('/auth/profile', data);
      const updated = res.data.user;
      setUser(updated);
      localStorage.setItem('shopsmart_user', JSON.stringify(updated));
      showToast('Profile updated successfully!');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update profile.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const trackActivity = async (activityType, meta = {}) => {
    try {
      await api.post('/activity/track', {
        activity_type: activityType,
        product_id: meta.product_id || null,
        category_id: meta.category_id || null,
        query_text: meta.query_text || null,
        duration_seconds: meta.duration_seconds || 10,
        results_count: meta.results_count || 0
      });
    } catch {
      // non-blocking
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = !!(user && user.is_admin);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        login,
        adminLogin,
        register,
        logout,
        updateProfile,
        trackActivity,
        showToast,
        toasts,
        removeToast
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
