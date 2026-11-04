import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Star, Sparkles } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { formatINR } from '../utils/formatCurrency';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter state
  const selectedCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort_by') || 'popularity';
  const minRating = searchParams.get('min_rating') || '';
  const maxPriceParam = searchParams.get('max_price') || '250000';

  const [priceRange, setPriceRange] = useState(maxPriceParam);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    // Fetch categories
    api.get('/categories')
      .then(res => setCategories(res.data.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();

    if (selectedCategory) params.set('category', selectedCategory);
    if (searchQuery) params.set('search', searchQuery);
    if (sortBy) params.set('sort_by', sortBy);
    if (minRating) params.set('min_rating', minRating);
    if (priceRange && Number(priceRange) < 250000) params.set('max_price', priceRange);
    params.set('limit', '30');

    api.get(`/products?${params.toString()}`)
      .then(res => {
        setProducts(res.data.products || []);
        setTotalCount(res.data.total || 0);
      })
      .catch(err => {
        console.error('Failed to load products:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams, priceRange]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setPriceRange('250000');
  };

  const hasActiveFilters = !!(selectedCategory || searchQuery || minRating || Number(priceRange) < 250000);

  return (
    <div className="py-4">
      <div className="container">
        {/* Header Breadcrumb & Results count */}
        <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
          <div>
            <h1 className="h3 fw-bold mb-1">
              {searchQuery ? `Search results for "${searchQuery}"` : selectedCategory ? `${selectedCategory.toUpperCase()} Collection` : 'All Products'}
            </h1>
            <p className="text-muted small mb-0">
              Showing {products.length} of {totalCount} items
            </p>
          </div>

          {/* Sort Dropdown & Mobile Filter Button */}
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-custom d-lg-none d-flex align-items-center gap-2"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            >
              <Filter size={16} />
              <span>Filters</span>
            </button>

            <div className="d-flex align-items-center gap-2">
              <ArrowUpDown size={16} className="text-muted d-none d-sm-block" />
              <select
                value={sortBy}
                onChange={(e) => updateParam('sort_by', e.target.value)}
                className="form-control-custom py-2 px-3"
                style={{ width: '190px', fontSize: '0.9rem' }}
              >
                <option value="popularity">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <div className="d-flex flex-wrap align-items-center gap-2 mb-4 p-3 rounded-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <span className="small fw-semibold text-muted">Active Filters:</span>
            {selectedCategory && (
              <span className="smart-badge d-flex align-items-center gap-1">
                Category: {selectedCategory}
                <X size={13} className="cursor-pointer" onClick={() => updateParam('category', '')} />
              </span>
            )}
            {searchQuery && (
              <span className="smart-badge d-flex align-items-center gap-1">
                Keyword: "{searchQuery}"
                <X size={13} className="cursor-pointer" onClick={() => updateParam('search', '')} />
              </span>
            )}
            {minRating && (
              <span className="smart-badge d-flex align-items-center gap-1">
                Rating: {minRating}★+
                <X size={13} className="cursor-pointer" onClick={() => updateParam('min_rating', '')} />
              </span>
            )}
            {Number(priceRange) < 250000 && (
              <span className="smart-badge d-flex align-items-center gap-1">
                Under {formatINR(priceRange)}
                <X size={13} className="cursor-pointer" onClick={() => setPriceRange('250000')} />
              </span>
            )}
            <button onClick={clearAllFilters} className="btn btn-sm btn-link text-danger p-0 ms-auto small text-decoration-none fw-bold">
              Clear All
            </button>
          </div>
        )}

        <div className="row g-4">
          {/* Sidebar Filters */}
          <aside className={`col-lg-3 ${mobileFilterOpen ? 'd-block' : 'd-none d-lg-block'}`}>
            <div className="p-4 rounded-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <SlidersHorizontal size={18} />
                  <span>Filters</span>
                </h5>
                {hasActiveFilters && (
                  <button onClick={clearAllFilters} className="btn btn-sm btn-link text-danger p-0 text-decoration-none small">
                    Reset
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-4">
                <label className="fw-bold small text-muted text-uppercase mb-2 d-block" style={{ letterSpacing: '0.04em' }}>
                  Categories
                </label>
                <div className="d-flex flex-column gap-1">
                  <div
                    className={`p-2 rounded-2 cursor-pointer small fw-semibold ${!selectedCategory ? 'text-primary fw-bold' : ''}`}
                    onClick={() => updateParam('category', '')}
                    style={{ background: !selectedCategory ? 'var(--badge-bg)' : 'transparent', cursor: 'pointer' }}
                  >
                    All Categories ({totalCount})
                  </div>
                  {categories.map((c) => (
                    <div
                      key={c.id}
                      className={`p-2 rounded-2 cursor-pointer small d-flex justify-content-between align-items-center ${selectedCategory === c.slug ? 'text-primary fw-bold' : ''}`}
                      onClick={() => updateParam('category', c.slug)}
                      style={{ background: selectedCategory === c.slug ? 'var(--badge-bg)' : 'transparent', cursor: 'pointer' }}
                    >
                      <span>{c.name}</span>
                      <span className="badge rounded-pill text-muted" style={{ background: 'var(--bg-secondary)' }}>
                        {c.product_count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Filter Slider */}
              <div className="mb-4 border-top pt-3" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="fw-bold small text-muted text-uppercase mb-0">Max Price</label>
                  <span className="fw-bold text-primary">{formatINR(priceRange)}</span>
                </div>
                <input
                  type="range"
                  className="form-range"
                  min="100"
                  max="250000"
                  step="500"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                />
                <div className="d-flex justify-content-between small text-muted">
                  <span>₹100</span>
                  <span>₹2,50,000</span>
                </div>
              </div>

              {/* Minimum Rating */}
              <div className="border-top pt-3" style={{ borderColor: 'var(--border-subtle)' }}>
                <label className="fw-bold small text-muted text-uppercase mb-2 d-block">Customer Rating</label>
                <div className="d-flex flex-column gap-2">
                  {[4.5, 4.0, 3.5].map((star) => (
                    <div
                      key={star}
                      className="d-flex align-items-center gap-2 cursor-pointer small"
                      onClick={() => updateParam('min_rating', minRating === String(star) ? '' : String(star))}
                      style={{ cursor: 'pointer' }}
                    >
                      <input
                        type="checkbox"
                        checked={minRating === String(star)}
                        onChange={() => {}}
                        className="form-check-input mt-0"
                      />
                      <span className="d-flex align-items-center text-warning">
                        ★ {star} & Up
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="col-lg-9">
            {loading ? (
              <div className="row g-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="col-12 col-sm-6 col-md-4">
                    <div className="smart-card p-3">
                      <div className="placeholder-glow" style={{ height: '220px', background: 'var(--border-subtle)', borderRadius: '12px' }}></div>
                      <div className="placeholder-glow mt-3">
                        <span className="placeholder col-8"></span>
                        <span className="placeholder col-4"></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="row g-4">
                {products.map((p) => (
                  <div key={p.id} className="col-12 col-sm-6 col-md-4">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 p-4 rounded-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                <Sparkles size={48} className="text-muted mb-3 opacity-50" />
                <h4 className="fw-bold mb-2">No products match your criteria</h4>
                <p className="text-muted mb-4">Try clearing active filters or searching with different keywords.</p>
                <button onClick={clearAllFilters} className="btn-primary-gradient px-4 py-2">
                  Reset All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
