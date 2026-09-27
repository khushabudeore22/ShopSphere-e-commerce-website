import React from 'react';
import Rating from './Rating';

export default function ReviewCard({ review }) {
  const reviewDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : review.date || 'Recent';

  const authorName = review.user?.name || review.userName || review.name || 'Anonymous User';

  return (
    <div className="review-card">
      <div className="review-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1rem',
            }}
          >
            {authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--dark)' }}>{authorName}</div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{reviewDate}</span>
          </div>
        </div>
        <Rating value={review.rating || 5} />
      </div>
      <p style={{ marginTop: '8px', color: 'var(--text-main)', fontSize: '0.95rem' }}>
        {review.comment || review.text}
      </p>
    </div>
  );
}
