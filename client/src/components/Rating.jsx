import React from 'react';

export default function Rating({ value = 5, text = '', numReviews }) {
  const fullStars = Math.floor(value);
  const hasHalfStar = value % 1 >= 0.4;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="product-rating">
      <span className="stars">
        {'★'.repeat(fullStars)}
        {hasHalfStar ? '½' : ''}
        {'☆'.repeat(Math.max(0, emptyStars))}
      </span>
      <span style={{ fontWeight: 600, color: 'var(--dark)' }}>{value.toFixed(1)}</span>
      {(text || numReviews !== undefined) && (
        <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>
          ({numReviews ? `${numReviews} reviews` : text})
        </span>
      )}
    </div>
  );
}
