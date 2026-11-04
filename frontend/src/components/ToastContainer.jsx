import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useAuth();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container-custom">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let color = 'var(--color-success)';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          color = 'var(--color-danger)';
        } else if (toast.type === 'info') {
          Icon = Info;
          color = 'var(--color-primary)';
        }

        return (
          <div key={toast.id} className="custom-toast">
            <Icon size={20} style={{ color, flexShrink: 0 }} />
            <span className="flex-grow-1 fw-medium" style={{ fontSize: '0.92rem' }}>
              {toast.message}
            </span>
            <button
              onClick={() => removeToast(toast.id)}
              className="btn btn-sm p-0 border-0 bg-transparent ms-2"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
