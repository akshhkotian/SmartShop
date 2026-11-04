import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShoppingBag,
  TrendingUp,
  Zap,
  Laptop,
  Shirt,
  Home,
  BookOpen,
  Watch,
  Activity
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import RecommendationSection from '../components/RecommendationSection';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();

  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [recommendedForYou, setRecommendedForYou] = useState([]);
  const [fbtProducts, setFbtProducts] = useState([]);
  const [searchRecs, setSearchRecs] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category Icon mapper
  const getCategoryIcon = (iconName) => {
    switch (iconName?.toLowerCase()) {
      case 'laptop': return <Laptop size={20} />;
      case 'shirt': return <Shirt size={20} />;
      case 'sparkles': return <Sparkles size={20} />;
      case 'home': return <Home size={20} />;
      case 'bookopen': return <BookOpen size={20} />;
      case 'watch': return <Watch size={20} />;
      case 'activity': return <Activity size={20} />;
      default: return <ShoppingBag size={20} />;
    }
  };

  useEffect(() => {
    setLoading(true);

    // Fetch categories & featured
    Promise.all([
      api.get('/categories'),
      api.get('/products/featured?limit=8'),
      api.get('/products/trending?limit=8'),
      api.get('/recommendations/for-you?limit=8'),
      api.get('/recommendations/frequently-bought-together?product_id=1&limit=4'),
      api.get('/recommendations/recent-searches?limit=4'),
      api.get('/recommendations/recently-viewed?limit=4')
    ]).then(([catRes, featRes, trendRes, recRes, fbtRes, searchRes, viewRes]) => {
      setCategories(catRes.data.categories || []);
      setFeaturedProducts(featRes.data.products || []);
      setTrendingProducts(trendRes.data.products || []);
      setRecommendedForYou(recRes.data.products || []);
      setFbtProducts(fbtRes.data.products || []);
      setSearchRecs(searchRes.data.products || []);
      setRecentlyViewed(viewRes.data.products || []);
    }).catch(err => {
      console.error('Home data load error:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, [user]);

  return (
    <div className="homepage-wrapper">
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-7 text-center text-lg-start">
              <div className="d-inline-flex align-items-center gap-2 apriori-pill mb-3">
                <Sparkles size={14} />
                <span>Smart Personalized Shopping</span>
              </div>

              <h1 className="display-4 fw-bolder mb-3" style={{ letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                Intelligent Shopping, <br />
                <span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Personalized For You.
                </span>
              </h1>

              <p className="lead mb-4" style={{ color: 'var(--text-secondary)', maxWidth: '540px' }}>
                Discover handpicked collections crafted for you. From cutting-edge electronics to everyday essentials and designer apparel, enjoy recommendations tailored to your taste.
              </p>

              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                <Link to="/products" className="btn-primary-gradient px-4 py-3" style={{ fontSize: '1rem' }}>
                  <ShoppingBag size={18} />
                  <span>Explore Catalog</span>
                  <ArrowRight size={18} />
                </Link>

                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn-outline-custom px-4 py-3" style={{ fontSize: '1rem' }}>
                    <span>My Dashboard</span>
                  </Link>
                ) : (
                  <Link to="/register" className="btn-outline-custom px-4 py-3" style={{ fontSize: '1rem' }}>
                    <span>Join ShopSmart</span>
                  </Link>
                )}
              </div>

              {/* Quick stats banner */}
              <div className="d-flex flex-wrap gap-4 mt-4 pt-3 border-top justify-content-center justify-content-lg-start" style={{ borderColor: 'var(--border-subtle)' }}>
                <div>
                  <div className="h5 fw-bold mb-0">100+</div>
                  <small className="text-muted">Curated Collections</small>
                </div>
                <div className="vr" style={{ opacity: 0.15 }}></div>
                <div>
                  <div className="h5 fw-bold mb-0">100%</div>
                  <small className="text-muted">Tailored For You</small>
                </div>
                <div className="vr" style={{ opacity: 0.15 }}></div>
                <div>
                  <div className="h5 fw-bold mb-0">4.9 ★</div>
                  <small className="text-muted">Customer Satisfaction</small>
                </div>
              </div>
            </div>

            {/* Hero Visual Card Carousel */}
            <div className="col-lg-5">
              <div
                className="p-4 rounded-4 position-relative"
                style={{
                  background: 'var(--grad-card)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="badge rounded-pill" style={{ background: 'var(--badge-bg)', color: 'var(--color-primary)' }}>
                    🔥 Perfect Pair
                  </span>
                  <small className="text-muted fw-semibold">Top Recommendation</small>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-7">
                    <img
                      src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80"
                      alt="MacBook Pro"
                      style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '14px' }}
                    />
                  </div>
                  <div className="col-5 d-flex flex-column gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80"
                      alt="Wireless Mouse"
                      style={{ width: '100%', height: '86px', objectFit: 'cover', borderRadius: '12px' }}
                    />
                    <img
                      src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80"
                      alt="Mechanical Keyboard"
                      style={{ width: '100%', height: '86px', objectFit: 'cover', borderRadius: '12px' }}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="fw-bold mb-0">Developer Workstation Bundle</h6>
                    <small className="text-muted">Frequently Bought Together</small>
                  </div>
                  <Link to="/products/1" className="btn btn-sm btn-primary-gradient px-3 py-2">
                    View
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Navigation Pills */}
      <section className="py-4 border-bottom" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="d-flex gap-3 overflow-auto py-2" style={{ scrollbarWidth: 'none' }}>
            <Link to="/products" className="category-pill text-nowrap flex-shrink-0">
              <ShoppingBag size={18} />
              <span>All Products</span>
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/products?category=${c.slug}`}
                className="category-pill text-nowrap flex-shrink-0"
              >
                {getCategoryIcon(c.icon)}
                <span>{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Recommended For You */}
      <RecommendationSection
        title={isAuthenticated ? `Recommended For You, ${user.full_name?.split(' ')[0]}` : "Recommended For You"}
        subtitle="Handpicked selections matching your browsing journey and style preferences"
        badgeText="Curated For You"
        products={recommendedForYou}
        viewAllLink="/products"
        loading={loading}
      />

      {/* 4. Promotional Banner (Special Offer) */}
      <section className="my-5">
        <div className="container">
          <div
            className="p-5 rounded-4 position-relative overflow-hidden"
            style={{
              background: 'var(--grad-banner)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div className="row align-items-center">
              <div className="col-lg-8">
                <span className="smart-badge mb-3 d-inline-block">Special Offer</span>
                <h3 className="fw-bolder mb-2" style={{ letterSpacing: '-0.02em' }}>
                  Upgrade Your Setup: Save 20% With Code <span style={{ color: 'var(--color-primary)' }}>SMART20</span>
                </h3>
                <p className="mb-4" style={{ maxWidth: '520px' }}>
                  Save on curated audio, workstation accessories, and lifestyle essentials. Free expedited shipping on all orders above ₹499.
                </p>
                <Link to="/products?category=electronics" className="btn-primary-gradient px-4 py-2">
                  <span>Shop Electronics Drop</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
              <div className="col-lg-4 d-none d-lg-block text-end">
                <Zap size={140} style={{ color: 'var(--color-primary)', opacity: 0.15 }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Trending Products */}
      <RecommendationSection
        title="Trending Products"
        subtitle="Top-rated essentials gaining the most attention across the community"
        badgeText="Community Trending"
        products={trendingProducts}
        viewAllLink="/products?trending=1"
        loading={loading}
      />

      {/* 6. Frequently Bought Together */}
      {fbtProducts.length > 0 && (
        <RecommendationSection
          title="Frequently Bought Together"
          subtitle="Items shoppers frequently pair together"
          badgeText="Best Value Bundle"
          products={fbtProducts}
          viewAllLink="/products"
        />
      )}

      {/* 7. Based on Recent Searches */}
      {searchRecs.length > 0 && (
        <RecommendationSection
          title="Based on Recent Searches"
          subtitle="Products inspired by what you've been looking for"
          badgeText="Based on Searches"
          products={searchRecs}
          viewAllLink="/products"
        />
      )}

      {/* 8. Recently Viewed Products (Personal History) */}
      {recentlyViewed.length > 0 && (
        <RecommendationSection
          title="Recently Viewed Products"
          subtitle="Pick up right where you left off"
          badgeText="Browsing History"
          products={recentlyViewed}
        />
      )}
    </div>
  );
}
