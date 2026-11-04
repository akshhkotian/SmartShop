import React from 'react';
import ProductCard from './ProductCard';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecommendationSection({
  title,
  subtitle,
  badgeText = 'Recommended For You',
  products = [],
  viewAllLink = null,
  loading = false,
  emptyMessage = 'No recommendations yet. Start browsing to discover personalized picks!'
}) {
  if (loading) {
    return (
      <section className="my-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <div className="placeholder-glow mb-2">
                <span className="placeholder col-4 rounded-pill"></span>
              </div>
              <div className="placeholder-glow">
                <span className="placeholder col-6" style={{ height: '28px' }}></span>
              </div>
            </div>
          </div>
          <div className="row g-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="smart-card p-3">
                  <div className="placeholder-glow" style={{ height: '200px', background: 'var(--border-subtle)', borderRadius: '12px' }}></div>
                  <div className="placeholder-glow mt-3">
                    <span className="placeholder col-8"></span>
                    <span className="placeholder col-4"></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="my-5">
      <div className="container">
        {/* Section Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-end mb-4 gap-2">
          <div>
            {badgeText && (
              <span className="smart-badge-apriori smart-badge mb-2 d-inline-flex">
                <Sparkles size={12} />
                {badgeText}
              </span>
            )}
            <h2 className="section-title">
              {title}
            </h2>
            {subtitle && <p className="section-subtitle mb-0">{subtitle}</p>}
          </div>

          {viewAllLink && (
            <Link to={viewAllLink} className="btn-outline-custom text-decoration-none d-inline-flex align-items-center gap-2">
              <span>View All</span>
              <ArrowRight size={15} />
            </Link>
          )}
        </div>

        {/* Product Grid */}
        <div className="row g-4">
          {products.slice(0, 8).map(product => (
            <div key={product.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
