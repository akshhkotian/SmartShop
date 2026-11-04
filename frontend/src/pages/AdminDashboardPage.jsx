import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Package,
  ShoppingBag,
  IndianRupee,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  Search,
  Eye,
  CheckCircle,
  X,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { formatINR } from '../utils/formatCurrency';

export default function AdminDashboardPage() {
  const { user, isAdmin, showToast } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // overview, products, rules, orders, users
  const [metrics, setMetrics] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [rules, setRules] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);

  // Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category_id: 1,
    price: '',
    original_price: '',
    stock: 25,
    description: '',
    image_url: '',
    badge: '',
    is_featured: 0,
    is_trending: 0
  });

  const loadAllData = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/metrics'),
      api.get('/admin/analytics'),
      api.get('/admin/rules'),
      api.get('/admin/products'),
      api.get('/admin/orders'),
      api.get('/admin/users'),
      api.get('/categories')
    ]).then(([metRes, anaRes, ruleRes, prodRes, ordRes, usrRes, catRes]) => {
      setMetrics(metRes.data);
      setAnalytics(anaRes.data);
      setRules(ruleRes.data.rules || []);
      setProducts(prodRes.data.products || []);
      setOrders(ordRes.data.orders || []);
      setUsersList(usrRes.data.users || []);
      setCategories(catRes.data.categories || []);
    }).catch(err => {
      console.error('Admin data load error:', err);
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleRetrainApriori = async () => {
    setRetraining(true);
    try {
      const res = await api.post('/recommendations/retrain');
      showToast(res.data.message);
      // reload rules
      const ruleRes = await api.get('/admin/rules');
      setRules(ruleRes.data.rules || []);
    } catch (err) {
      showToast('Apriori retraining failed.', 'error');
    } finally {
      setRetraining(false);
    }
  };

  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category_id: categories[0]?.id || 1,
      price: '',
      original_price: '',
      stock: 25,
      description: '',
      image_url: '',
      badge: '',
      is_featured: 0,
      is_trending: 0
    });
    setShowProductModal(true);
  };

  const openEditProductModal = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category_id: prod.category_id,
      price: prod.price,
      original_price: prod.original_price,
      stock: prod.stock,
      description: prod.description,
      image_url: prod.image_url,
      badge: prod.badge || '',
      is_featured: prod.is_featured ? 1 : 0,
      is_trending: prod.is_trending ? 1 : 0
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, productForm);
        showToast('Product updated successfully!');
      } else {
        await api.post('/admin/products', productForm);
        showToast('New product created successfully!');
      }
      setShowProductModal(false);
      loadAllData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save product.', 'error');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await api.delete(`/admin/products/${id}`);
        showToast(`Product "${name}" deleted.`);
        loadAllData();
      } catch (err) {
        showToast('Failed to delete product.', 'error');
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      showToast(`Order status updated to ${newStatus}.`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  return (
    <div className="py-4">
      <div className="container">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="smart-badge-apriori smart-badge">
                <Sparkles size={12} />
                Admin Intelligence Portal
              </span>
            </div>
            <h1 className="h3 fw-bold mb-0">Platform & Apriori Recommendation Operations</h1>
          </div>

          <div className="d-flex gap-2">
            <button
              onClick={handleRetrainApriori}
              disabled={retraining}
              className="btn btn-outline-custom d-flex align-items-center gap-2"
              title="Re-run Apriori association mining on recent transactions"
            >
              <RefreshCw size={16} className={retraining ? 'spin' : ''} />
              <span>{retraining ? 'Mining...' : 'Retrain Apriori Rules'}</span>
            </button>
            <button
              onClick={openAddProductModal}
              className="btn-primary-gradient d-flex align-items-center gap-2"
            >
              <Plus size={18} />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="d-flex gap-2 mb-4 border-bottom pb-2 overflow-auto" style={{ borderColor: 'var(--border-subtle)', scrollbarWidth: 'none' }}>
          {[
            { id: 'overview', label: 'Overview & Charts', icon: TrendingUp },
            { id: 'rules', label: `Apriori Rules (${rules.length})`, icon: Sparkles },
            { id: 'products', label: `Products (${products.length})`, icon: Package },
            { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
            { id: 'users', label: `Registered Users (${usersList.length})`, icon: Users }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn d-flex align-items-center gap-2 text-nowrap rounded-3 py-2 px-3 fw-semibold ${isActive ? 'btn-primary-gradient' : 'btn-outline-custom'}`}
                style={{ fontSize: '0.9rem' }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            {/* KPI Cards */}
            <div className="row g-4 mb-4">
              <div className="col-6 col-md-3">
                <div className="metric-card">
                  <div>
                    <span className="small text-muted mb-1 d-block">Total Revenue</span>
                    <div className="h3 fw-bolder mb-0 text-primary">{formatINR(metrics?.total_sales || 0)}</div>
                  </div>
                  <div className="metric-icon-wrap">
                    <IndianRupee size={24} />
                  </div>
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div className="metric-card">
                  <div>
                    <span className="small text-muted mb-1 d-block">Total Orders</span>
                    <div className="h3 fw-bolder mb-0">{metrics?.total_orders || 0}</div>
                  </div>
                  <div className="metric-icon-wrap">
                    <ShoppingBag size={24} />
                  </div>
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div className="metric-card">
                  <div>
                    <span className="small text-muted mb-1 d-block">Active Products</span>
                    <div className="h3 fw-bolder mb-0">{metrics?.total_products || 0}</div>
                  </div>
                  <div className="metric-icon-wrap">
                    <Package size={24} />
                  </div>
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div className="metric-card">
                  <div>
                    <span className="small text-muted mb-1 d-block">Mined Rules</span>
                    <div className="h3 fw-bolder mb-0">{rules.length}</div>
                  </div>
                  <div className="metric-icon-wrap">
                    <Sparkles size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Analytics Charts (Adaptive Theme Pure SVG/Canvas Rendering) */}
            <div className="row g-4 mb-5">
              {/* Revenue Growth Bar Chart */}
              <div className="col-lg-7">
                <div className="p-4 rounded-4 h-100" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">Sales & Revenue Velocity</h5>
                    <span className="badge rounded-pill" style={{ background: 'var(--badge-bg)', color: 'var(--color-primary)' }}>
                      +28% MoM Growth
                    </span>
                  </div>

                  {/* SVG Bar Chart */}
                  <div style={{ height: '240px', width: '100%', display: 'flex', alignItems: 'flex-end', gap: '18px', paddingBottom: '20px' }}>
                    {metrics?.sales_timeline?.map((item, idx) => {
                      const maxVal = Math.max(...metrics.sales_timeline.map(m => m.sales));
                      const heightPct = Math.round((item.sales / maxVal) * 80) + 10;
                      return (
                        <div key={idx} className="flex-grow-1 d-flex flex-column align-items-center h-100 justify-content-end">
                          <span className="small text-muted mb-1" style={{ fontSize: '0.72rem' }}>{formatINR(Math.round(item.sales))}</span>
                          <div
                            className="w-100 rounded-3 transition-all"
                            style={{
                              height: `${heightPct}%`,
                              background: idx === metrics.sales_timeline.length - 1 ? 'var(--grad-primary)' : 'var(--border-color)',
                              transition: 'height 0.4s ease'
                            }}
                          ></div>
                          <span className="small fw-semibold mt-2 text-muted" style={{ fontSize: '0.78rem' }}>{item.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Category Distribution Chart */}
              <div className="col-lg-5">
                <div className="p-4 rounded-4 h-100" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                  <h5 className="fw-bold mb-3">Product Catalog Distribution</h5>
                  <div className="d-flex flex-column gap-3">
                    {metrics?.category_distribution?.map((cat, idx) => {
                      const totalProds = metrics.total_products || 1;
                      const pct = Math.round((cat.product_count / totalProds) * 100);
                      return (
                        <div key={idx}>
                          <div className="d-flex justify-content-between small fw-semibold mb-1">
                            <span>{cat.name}</span>
                            <span className="text-muted">{cat.product_count} items ({pct}%)</span>
                          </div>
                          <div className="progress" style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
                            <div
                              className="progress-bar rounded-pill"
                              style={{
                                width: `${pct}%`,
                                background: idx % 2 === 0 ? 'var(--grad-primary)' : 'var(--grad-accent)'
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Searches & Top Viewed */}
            <div className="row g-4">
              <div className="col-md-6">
                <div className="p-4 rounded-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                  <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <Search size={18} className="text-primary" />
                    <span>Most Searched User Queries</span>
                  </h5>
                  <div className="d-flex flex-column gap-2">
                    {analytics?.top_searches?.map((s, idx) => (
                      <div key={idx} className="p-2 px-3 rounded-3 d-flex justify-content-between align-items-center" style={{ background: 'var(--bg-secondary)' }}>
                        <span className="fw-semibold">"{s.search_query}"</span>
                        <span className="badge rounded-pill" style={{ background: 'var(--badge-bg)', color: 'var(--color-primary)' }}>
                          {s.query_count} Searches
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="p-4 rounded-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                  <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <Eye size={18} className="text-primary" />
                    <span>Most Viewed Products</span>
                  </h5>
                  <div className="d-flex flex-column gap-2">
                    {analytics?.top_views?.map((v, idx) => (
                      <div key={idx} className="p-2 px-3 rounded-3 d-flex justify-content-between align-items-center" style={{ background: 'var(--bg-secondary)' }}>
                        <span className="fw-semibold text-truncate me-2" style={{ maxWidth: '300px' }}>{v.name}</span>
                        <span className="badge rounded-pill" style={{ background: 'var(--badge-bg)', color: 'var(--color-primary)' }}>
                          {v.view_count} Views
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. APRIORI RULES TAB */}
        {activeTab === 'rules' && (
          <div className="p-4 rounded-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
              <div>
                <h5 className="fw-bold mb-1">Mined Apriori Association Rules</h5>
                <p className="text-muted small mb-0">
                  Rules generated from basket patterns using Support, Confidence, and Lift metrics via Python MLxtend.
                </p>
              </div>
              <button onClick={handleRetrainApriori} disabled={retraining} className="btn-primary-gradient py-2 px-3 small">
                <RefreshCw size={14} className={retraining ? 'spin' : ''} />
                <span>Re-mine Rules</span>
              </button>
            </div>

            <div className="table-responsive">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Rule #</th>
                    <th>Antecedent (If Bought)</th>
                    <th>Consequent (Also Recommends)</th>
                    <th>Support</th>
                    <th>Confidence</th>
                    <th>Lift</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((r, idx) => (
                    <tr key={r.id || idx}>
                      <td className="fw-bold text-muted">#{idx + 1}</td>
                      <td>
                        <span className="fw-bold text-primary">{r.antecedent_names}</span>
                      </td>
                      <td>
                        <span className="fw-bold text-success">{r.consequent_names}</span>
                      </td>
                      <td>
                        <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                          {(Number(r.support) * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td>
                        <span className="badge" style={{ background: 'rgba(59, 178, 115, 0.15)', color: 'var(--color-success)' }}>
                          {(Number(r.confidence) * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-warning text-dark fw-bold">
                          {Number(r.lift).toFixed(2)}x
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. PRODUCTS MANAGEMENT TAB */}
        {activeTab === 'products' && (
          <div className="p-4 rounded-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Product Catalog Management</h5>
              <button onClick={openAddProductModal} className="btn-primary-gradient py-2 px-3">
                <Plus size={16} />
                <span>Add Product</span>
              </button>
            </div>

            <div className="table-responsive">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img src={p.image_url} alt={p.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />
                          <div>
                            <div className="fw-bold text-truncate" style={{ maxWidth: '280px' }}>{p.name}</div>
                            {p.badge && <span className="smart-badge">{p.badge}</span>}
                          </div>
                        </div>
                      </td>
                      <td>{p.category_name}</td>
                      <td className="fw-bold">{formatINR(p.price)}</td>
                      <td>
                        <span className={`badge ${p.stock > 10 ? 'bg-success' : p.stock > 0 ? 'bg-warning text-dark' : 'bg-danger'}`}>
                          {p.stock} in stock
                        </span>
                      </td>
                      <td>★ {Number(p.rating).toFixed(1)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => openEditProductModal(p)}
                            className="btn btn-sm btn-outline-custom p-2"
                            title="Edit Product"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="btn btn-sm btn-outline-custom p-2 text-danger"
                            title="Delete Product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="p-4 rounded-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <h5 className="fw-bold mb-3">All Customer Orders</h5>
            <div className="table-responsive">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="fw-bold">{o.order_number}</td>
                      <td>
                        <div className="fw-semibold">{o.full_name}</div>
                        <small className="text-muted">{o.email}</small>
                      </td>
                      <td>{o.items?.length || 1} item(s)</td>
                      <td className="fw-bold text-primary">{formatINR(o.final_amount)}</td>
                      <td>
                        <span className="badge px-3 py-2 bg-success">
                          {o.status}
                        </span>
                      </td>
                      <td>
                        <select
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                          className="form-control-custom py-1 px-2 small"
                          style={{ fontSize: '0.85rem' }}
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. USERS TAB */}
        {activeTab === 'users' && (
          <div className="p-4 rounded-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <h5 className="fw-bold mb-3">Registered Users & Shopping Profiles</h5>
            <div className="table-responsive">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Full Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>City</th>
                    <th>Orders</th>
                    <th>Total Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td className="fw-bold">{u.full_name}</td>
                      <td>@{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.city || 'N/A'}</td>
                      <td>{u.order_count || 0}</td>
                      <td className="fw-bold text-primary">${Number(u.total_spent || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Product Modal (Create / Edit) */}
        {showProductModal && (
          <div className="modal-backdrop-custom">
            <div className="modal-content-custom p-4 w-100" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">{editingProduct ? 'Edit Product' : 'Add New Product'}</h5>
                <button onClick={() => setShowProductModal(false)} className="btn p-1 border-0 text-muted">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveProduct}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small fw-semibold text-muted">Product Name</label>
                    <input
                      type="text"
                      className="form-control-custom w-100"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">Category</label>
                    <select
                      className="form-control-custom w-100"
                      value={productForm.category_id}
                      onChange={(e) => setProductForm({ ...productForm, category_id: Number(e.target.value) })}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small fw-semibold text-muted">Sale Price (₹)</label>
                    <input
                      type="number"
                      step="1"
                      className="form-control-custom w-100"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small fw-semibold text-muted">Original Price (₹)</label>
                    <input
                      type="number"
                      step="1"
                      className="form-control-custom w-100"
                      value={productForm.original_price}
                      onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">Stock Quantity</label>
                    <input
                      type="number"
                      className="form-control-custom w-100"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted">Badge (e.g. Best Seller)</label>
                    <input
                      type="text"
                      className="form-control-custom w-100"
                      value={productForm.badge}
                      onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold text-muted">Image URL</label>
                    <input
                      type="url"
                      className="form-control-custom w-100"
                      value={productForm.image_url}
                      onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold text-muted">Description</label>
                    <textarea
                      rows="3"
                      className="form-control-custom w-100"
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="col-12 d-flex gap-4">
                    <label className="form-check-label d-flex align-items-center gap-2 small">
                      <input
                        type="checkbox"
                        checked={productForm.is_featured === 1}
                        onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked ? 1 : 0 })}
                        className="form-check-input"
                      />
                      <span>Feature on Homepage</span>
                    </label>

                    <label className="form-check-label d-flex align-items-center gap-2 small">
                      <input
                        type="checkbox"
                        checked={productForm.is_trending === 1}
                        onChange={(e) => setProductForm({ ...productForm, is_trending: e.target.checked ? 1 : 0 })}
                        className="form-check-input"
                      />
                      <span>Mark as Trending</span>
                    </label>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-top d-flex justify-content-end gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
                  <button type="button" onClick={() => setShowProductModal(false)} className="btn-outline-custom">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary-gradient px-4">
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
