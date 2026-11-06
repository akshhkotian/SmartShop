import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import RecommendationSection from '../components/RecommendationSection';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();

  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [recommendedForYou, setRecommendedForYou] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    Promise.all([
      api.get('/categories'),
      api.get('/products/featured?limit=8'),
      api.get('/products/trending?limit=8'),
      api.get('/recommendations/for-you?limit=8')
    ]).then(([catRes, featRes, trendRes, recRes]) => {
      setCategories(catRes.data.categories || []);
      setFeaturedProducts(featRes.data.products || []);
      setTrendingProducts(trendRes.data.products || []);
      setRecommendedForYou(recRes.data.products || []);
    }).catch(err => {
      console.error('Home data load error:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, [user]);

  return (
    <div className="homepage-wrapper">
      {/* 1. Serene Aesthetic Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 text-center text-lg-start">
              <span
                className="d-inline-block small text-uppercase fw-semibold mb-3"
                style={{
                  letterSpacing: '0.14em',
                  color: 'var(--color-secondary)',
                  fontSize: '0.78rem'
                }}
              >
                Curated Collection
              </span>

              <h1
                className="display-5 fw-bold mb-3"
                style={{
                  letterSpacing: '-0.025em',
                  lineHeight: 1.18,
                  color: 'var(--text-primary)'
                }}
              >
                Simplicity, quality, <br />
                <span style={{ color: 'var(--color-secondary)' }}>
                  crafted for living.
                </span>
              </h1>

              <p
                className="mb-4"
                style={{
                  color: 'var(--text-secondary)',
                  maxWidth: '460px',
                  fontSize: '1rem',
                  lineHeight: 1.6
                }}
              >
                Thoughtfully designed essentials for work, home, and personal wellness.
              </p>

              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                <Link to="/products" className="btn-primary-gradient px-4 py-2">
                  <span>Explore Collection</span>
                  <ArrowRight size={16} />
                </Link>

                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn-outline-custom px-4 py-2">
                    <span>Account</span>
                  </Link>
                ) : (
                  <Link to="/register" className="btn-outline-custom px-4 py-2">
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Clean Hero Visual */}
            <div className="col-lg-6">
              <div
                className="position-relative overflow-hidden"
                style={{
                  borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-md)',
                  maxHeight: '380px'
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&q=80"
                  alt="Aesthetic Living"
                  style={{
                    width: '100%',
                    height: '380px',
                    objectFit: 'cover'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Minimalist Category Navigation */}
      <section className="py-3 border-bottom" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="d-flex gap-2 overflow-auto py-1 justify-content-start justify-content-md-center" style={{ scrollbarWidth: 'none' }}>
            <Link to="/products" className="category-pill flex-shrink-0">
              <span>All Products</span>
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/products?category=${c.slug}`}
                className="category-pill flex-shrink-0"
              >
                <span>{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Curated Recommendations */}
      <RecommendationSection
        title={isAuthenticated ? `Selected for you, ${user.full_name?.split(' ')[0]}` : "Curated for you"}
        subtitle="Pieces matching your personal taste and lifestyle"
        products={recommendedForYou}
        viewAllLink="/products"
        loading={loading}
      />

      {/* 4. Quiet Aesthetic Notice */}
      <div className="container my-3">
        <div
          className="py-3 px-4 rounded-3 text-center d-flex align-items-center justify-content-center gap-2"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            fontSize: '0.88rem'
          }}
        >
          <span>Complimentary shipping across India on orders above ₹499. Use code <strong>SMART20</strong> for 20% off.</span>
        </div>
      </div>

      {/* 5. Trending / Community Favorites */}
      <RecommendationSection
        title="Community favorites"
        subtitle="The season's most loved items"
        products={trendingProducts}
        viewAllLink="/products"
        loading={loading}
      />
    </div>
  );
}
