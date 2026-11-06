import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  ShoppingBag,
  Heart,
  Search,
  Eye,
  Sparkles,
  TrendingUp,
  Clock,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { formatINR } from '../utils/formatCurrency';

export default function UserDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const { cart, wishlist } = useCart();

  const [activitySummary, setActivitySummary] = useState(null);
  const [userRecommendations, setUserRecommendations] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);

    Promise.all([
      api.get('/activity/summary'),
      api.get('/recommendations/for-you?limit=4'),
      api.get('/recommendations/recently-viewed?limit=4'),
      api.get('/orders')
    ]).then(([actRes, recRes, viewRes, ordRes]) => {
      setActivitySummary(actRes.data);
      setUserRecommendations(recRes.data.products || []);
      setRecentlyViewed(viewRes.data.products || []);
      setRecentOrders(ordRes.data.orders?.slice(0, 3) || []);
    }).catch(err => {
      console.error('Failed to load dashboard:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="container py-5 text-center">
        <h3 className="fw-bold mb-3">Please Sign In</h3>
        <p className="text-muted mb-4">Sign in to access your personalized shopping dashboard.</p>
        <Link to="/login" className="btn-primary-gradient px-4 py-2">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="py-5">
      <div className="container">
        {/* Welcome Banner */}
        <div
          className="p-4 p-md-5 rounded-4 mb-5 position-relative overflow-hidden"
          style={{
            background: 'var(--grad-hero)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="smart-badge-apriori smart-badge">
                  <Sparkles size={12} />
                  Active Shopping Profile
                </span>
              </div>
              <h1 className="h2 fw-bolder mb-1">
                Welcome back, {user.full_name}!
              </h1>
              <p className="mb-0 text-muted" style={{ maxWidth: '520px' }}>
                Welcome to your personal shopping hub. Here is a snapshot of your activity, recent orders, and personalized product picks.
              </p>
            </div>

            <div className="d-flex gap-2">
              <Link to="/products" className="btn-primary-gradient px-4 py-2">
                Browse Products
              </Link>
            </div>
          </div>
        </div>

        {/* 1. Activity Metrics Summary */}
        <div className="row g-4 mb-5">
          <div className="col-6 col-md-3">
            <div className="metric-card">
              <div>
                <div className="small text-muted mb-1">Products Viewed</div>
                <div className="h3 fw-bolder mb-0">{activitySummary?.views_count || 0}</div>
              </div>
              <div className="metric-icon-wrap">
                <Eye size={24} />
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="metric-card">
              <div>
                <div className="small text-muted mb-1">Searches Run</div>
                <div className="h3 fw-bolder mb-0">{activitySummary?.searches_count || 0}</div>
              </div>
              <div className="metric-icon-wrap">
                <Search size={24} />
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="metric-card">
              <div>
                <div className="small text-muted mb-1">Cart Additions</div>
                <div className="h3 fw-bolder mb-0">{activitySummary?.cart_adds_count || 0}</div>
              </div>
              <div className="metric-icon-wrap">
                <ShoppingBag size={24} />
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="metric-card">
              <div>
                <div className="small text-muted mb-1">Completed Orders</div>
                <div className="h3 fw-bolder mb-0">{activitySummary?.orders_count || 0}</div>
              </div>
              <div className="metric-icon-wrap">
                <CheckCircle2 size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Top Explored Categories & Recent Searches */}
        <div className="row g-4 mb-5">
          <div className="col-lg-6">
            <div className="p-4 rounded-4 h-100" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <Layers size={18} className="text-primary" />
                <span>Your Top Explored Categories</span>
              </h5>
              {activitySummary?.top_categories?.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {activitySummary.top_categories.map((c) => (
                    <Link
                      key={c.id}
                      to={`/products?category=${c.slug}`}
                      className="p-3 rounded-3 d-flex justify-content-between align-items-center text-decoration-none"
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
                    >
                      <span className="fw-semibold">{c.name}</span>
                      <span className="badge rounded-pill" style={{ background: 'var(--badge-bg)', color: 'var(--color-primary)' }}>
                        {c.interaction_count} Interactions
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted small mb-0">Browse different categories to discover patterns!</p>
              )}
            </div>
          </div>

          <div className="col-lg-6">
            <div className="p-4 rounded-4 h-100" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <Clock size={18} className="text-primary" />
                <span>Recent Search Keywords</span>
              </h5>
              {activitySummary?.recent_searches?.length > 0 ? (
                <div className="d-flex flex-wrap gap-2">
                  {activitySummary.recent_searches.map((term, idx) => (
                    <Link
                      key={idx}
                      to={`/products?search=${encodeURIComponent(term)}`}
                      className="category-pill py-2 px-3 small text-decoration-none"
                    >
                      <Search size={13} className="text-muted" />
                      <span>{term}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted small mb-0">No search queries yet. Try typing in the search bar above!</p>
              )}
            </div>
          </div>
        </div>

        {/* 3. Personalized Recommendations */}
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold mb-0">Curated For You</h3>
            </div>
            <Link to="/products" className="btn-outline-custom">
              Browse More
            </Link>
          </div>

          <div className="row g-4">
            {userRecommendations.map((prod) => (
              <div key={prod.id} className="col-12 col-sm-6 col-md-3">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </section>

        {/* 4. Recent Orders Snippet */}
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold mb-0">Recent Order History</h4>
            <Link to="/orders" className="small fw-semibold text-primary text-decoration-none">
              View All Orders &rarr;
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="d-flex flex-column gap-3">
              {recentOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3 rounded-4 d-flex flex-wrap align-items-center justify-content-between gap-3"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
                >
                  <div>
                    <span className="fw-bold">{ord.order_number}</span>
                    <div className="small text-muted">{new Date(ord.created_at).toLocaleDateString()}</div>
                  </div>

                  <div>
                    <span className="badge bg-success">{ord.status}</span>
                  </div>

                  <div className="fw-bolder text-primary">
                    {formatINR(ord.final_amount)}
                  </div>

                  <Link to="/orders" className="btn btn-sm btn-outline-custom">
                    Details
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-4 text-center text-muted" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
              No orders placed yet.
            </div>
          )}
        </section>

        {/* 5. Recently Viewed Products */}
        {recentlyViewed.length > 0 && (
          <section className="mb-4">
            <h4 className="fw-bold mb-3">Recently Viewed Products</h4>
            <div className="row g-4">
              {recentlyViewed.map((prod) => (
                <div key={prod.id} className="col-12 col-sm-6 col-md-3">
                  <ProductCard product={prod} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
