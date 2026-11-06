import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 4.5, count = null, size = 15 }) {
  const rounded = Math.round(rating * 2) / 2;

  return (
    <div className="d-flex align-items-center gap-1">
      <div className="d-flex align-items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= rating;
          const half = !filled && star - 0.5 <= rating;

          return (
            <Star
              key={star}
              size={size}
              style={{
                fill: filled ? '#c69c6d' : half ? '#dfb987' : 'transparent',
                stroke: filled || half ? '#c69c6d' : 'var(--border-color)',
                marginRight: '1px'
              }}
            />
          );
        })}
      </div>
      <span className="small fw-semibold ms-1" style={{ color: 'var(--text-secondary)' }}>
        {Number(rating).toFixed(1)}
      </span>
      {count !== null && (
        <span className="small text-muted ms-1">
          ({count})
        </span>
      )}
    </div>
  );
}
