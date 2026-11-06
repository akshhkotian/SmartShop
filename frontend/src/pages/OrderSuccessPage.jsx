import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { formatINR } from '../utils/formatCurrency';

export default function OrderSuccessPage() {
  const location = useLocation();
  const order = location.state?.order;

  const [postPurchaseRecs, setPostPurchaseRecs] = useState([]);

  useEffect(() => {
    // Fetch updated Apriori recommendations
    api.get('/recommendations/for-you?limit=4')
      .then(res => setPostPurchaseRecs(res.data.products || []))
      .catch(() => {});
  }, []);

  return (
    <div className="py-5">
      <div className="container text-center">
        {/* Success Header */}
        <div className="p-5 rounded-4 mx-auto mb-5" style={{ maxWidth: '640px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
          <div className="mb-3 d-inline-flex p-3 rounded-circle" style={{ background: 'rgba(59, 178, 115, 0.12)' }}>
            <CheckCircle size={48} className="text-success" />
          </div>

          <h2 className="fw-bolder mb-2">Thank You for Your Order!</h2>
          <p className="text-muted mb-4">
            Your payment was processed successfully. A confirmation summary has been saved to your account.
          </p>

          {order && (
            <div className="p-3 rounded-3 text-start mb-4 small" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Order Number:</span>
                <span className="fw-bold">{order.order_number}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Total Paid:</span>
                <span className="fw-bold text-primary">{formatINR(order.final_amount)}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Status:</span>
                <span className="badge bg-success">{order.status || 'Confirmed'}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Delivering To:</span>
                <span className="fw-medium text-truncate" style={{ maxWidth: '280px' }}>{order.shipping_address}</span>
              </div>
            </div>
          )}

          <div className="d-flex flex-wrap gap-2 justify-content-center">
            <Link to="/orders" className="btn-outline-custom px-4 py-2">
              View Order History
            </Link>
            <Link to="/products" className="btn-primary-gradient px-4 py-2">
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Post-Purchase Recommendations */}
        {postPurchaseRecs.length > 0 && (
          <div className="text-start mt-5">
            <h4 className="fw-bold mb-3">You might also enjoy</h4>
            <div className="row g-4">
              {postPurchaseRecs.map((prod) => (
                <div key={prod.id} className="col-12 col-sm-6 col-md-3">
                  <ProductCard product={prod} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
