import React from 'react';

export default function Loading({ message = 'Loading...' }) {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{message}</p>
    </div>
  );
}
