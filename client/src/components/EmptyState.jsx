import React from 'react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  title = 'No Items Found',
  description = 'There are currently no items to display.',
  icon = '📦',
  actionText,
  actionLink = '/products',
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 style={{ fontSize: '1.4rem', color: 'var(--dark)' }}>{title}</h3>
      <p style={{ maxWidth: '400px', margin: '0 auto' }}>{description}</p>
      {actionText && (
        <Link to={actionLink} className="btn btn-primary" style={{ marginTop: '8px' }}>
          {actionText}
        </Link>
      )}
    </div>
  );
}
