import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Calendar, PackageCheck, Truck, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/formatCurrency';

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    api.get('/orders')
      .then(res => setOrders(res.data.orders || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container py-5 text-center">
        <h3 className="fw-bold mb-3">Please Sign In</h3>
        <Link to="/login" className="btn-primary-gradient px-4 py-2">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="py-5">
      <div className="container">
        <h1 className="h3 fw-bold mb-4">My Orders</h1>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : orders.length > 0 ? (
          <div className="d-flex flex-column gap-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 rounded-4"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
              >
                {/* Order Top Bar */}
                <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-3 border-bottom gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div>
                    <span className="small text-muted d-block">Order Placed</span>
                    <span className="fw-semibold">{new Date(ord.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  <div>
                    <span className="small text-muted d-block">Total Amount</span>
                    <span className="fw-bold text-primary">{formatINR(ord.final_amount)}</span>
                  </div>

                  <div>
                    <span className="small text-muted d-block">Order #</span>
                    <span className="fw-bold">{ord.order_number}</span>
                  </div>

                  <div>
                    <span className="badge px-3 py-2" style={{ background: 'rgba(59, 178, 115, 0.15)', color: 'var(--color-success)', fontSize: '0.85rem' }}>
                      {ord.status}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="d-flex flex-column gap-3">
                  {ord.items?.map((item, idx) => (
                    <div key={idx} className="d-flex align-items-center gap-3">
                      <img src={item.image_url} alt={item.name} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '10px' }} />
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-0 text-truncate" style={{ maxWidth: '400px' }}>
                          <Link to={`/products/${item.slug}`} className="text-decoration-none">
                            {item.name}
                          </Link>
                        </h6>
                        <small className="text-muted">Quantity: {item.quantity}</small>
                      </div>
                      <div className="fw-bold">
                        {formatINR(item.total_price)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Details */}
                <div className="mt-3 pt-3 border-top d-flex justify-content-between align-items-center small text-muted" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span>Delivered to: {ord.shipping_address}</span>
                  <span className="fw-medium">Paid with {ord.payment_method}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5 p-4 rounded-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
            <ShoppingBag size={48} className="text-muted mb-3 opacity-50" />
            <h4 className="fw-bold mb-2">No orders placed yet</h4>
            <p className="text-muted mb-4">Explore our catalog and find something you love today!</p>
            <Link to="/products" className="btn-primary-gradient px-4 py-2">
              Explore Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
