import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/formatPrice';

export default function OrderCard({ order }) {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'badge-success';
      case 'Cancelled':
        return 'badge-danger';
      case 'Shipped':
      case 'Out for Delivery':
        return 'badge-primary';
      default:
        return 'badge-warning';
    }
  };

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Recent';

  const orderId = order._id || order.id || 'N/A';

  return (
    <div className="order-card">
      <div className="order-card-header">
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Order ID:</span>
          <div style={{ fontWeight: 700, color: 'var(--dark)' }}>#{orderId.toString().slice(-8).toUpperCase()}</div>
        </div>

        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Date:</span>
          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{orderDate}</div>
        </div>

        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Amount:</span>
          <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>
            {formatPrice(order.totalPrice || order.total || 0)}
          </div>
        </div>

        <div>
          <span className={`badge ${getStatusBadgeClass(order.orderStatus || order.status || 'Pending')}`}>
            {order.orderStatus || order.status || 'Pending'}
          </span>
        </div>

        <div>
          <Link to={`/orders/${orderId}`} className="btn btn-outline btn-sm">
            View Details →
          </Link>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '8px 0' }}>
        {(order.orderItems || order.items || []).map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#F8FAFC',
              padding: '8px 12px',
              borderRadius: '8px',
              minWidth: '220px',
            }}
          >
            <img
              src={item.image || 'https://via.placeholder.com/50'}
              alt={item.name}
              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
            />
            <div style={{ fontSize: '0.85rem' }}>
              <div
                style={{
                  fontWeight: 600,
                  maxWidth: '140px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.name}
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                Qty: {item.qty || item.quantity} × {formatPrice(item.price)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
