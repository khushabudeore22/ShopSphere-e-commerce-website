import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/formatPrice';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const itemId = item._id || item.id;
  const qty = item.quantity || 1;

  return (
    <div className="cart-item">
      <Link to={`/products/${itemId}`}>
        <img
          src={item.image || 'https://via.placeholder.com/100'}
          alt={item.name}
          className="cart-item-image"
        />
      </Link>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          {item.category}
        </span>
        <Link
          to={`/products/${itemId}`}
          style={{ fontWeight: 600, color: 'var(--dark)', fontSize: '1rem', lineHeight: 1.3 }}
        >
          {item.name}
        </Link>
        <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.05rem', marginTop: '4px' }}>
          {formatPrice(item.price)}
        </span>
      </div>

      <div className="quantity-control">
        <button
          className="qty-btn"
          onClick={() => onUpdateQuantity(itemId, qty - 1)}
          disabled={qty <= 1}
        >
          -
        </button>
        <span className="qty-input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {qty}
        </span>
        <button
          className="qty-btn"
          onClick={() => onUpdateQuantity(itemId, qty + 1)}
          disabled={qty >= (item.stock || 99)}
        >
          +
        </button>
      </div>

      <div style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '1.1rem', textAlign: 'right' }}>
        {formatPrice(item.price * qty)}
      </div>

      <div>
        <button
          className="btn btn-outline btn-sm"
          style={{ color: 'var(--danger)', borderColor: 'var(--danger-light)' }}
          onClick={() => onRemove(itemId)}
          title="Remove from Cart"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
