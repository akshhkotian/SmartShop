import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';

import AuthLandingPage from './pages/AuthLandingPage';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrdersPage from './pages/OrdersPage';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          {/* Front Dashboard: Dedicated solely to Login and Registration when not signed in */}
          <Route path="/" element={isAuthenticated ? <HomePage /> : <AuthLandingPage initialTab="login" />} />
          
          {/* Store & Catalog Routes */}
          <Route path="/shop" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/dashboard" element={<UserDashboardPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          
          {/* Dedicated Auth Routes mapping to the Auth Dashboard tabs */}
          <Route path="/login" element={<AuthLandingPage initialTab="login" />} />
          <Route path="/register" element={<AuthLandingPage initialTab="register" />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
