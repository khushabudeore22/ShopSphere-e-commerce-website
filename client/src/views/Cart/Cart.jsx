import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CartItem from '../../components/CartItem';
import EmptyState from '../../components/EmptyState';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatPrice';

export default function Cart() {
  const { cart, count, subtotal, shipping, tax, total, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="page-container">
        <Navbar />
        <main className="main-content">
          <EmptyState
            title="Your Shopping Cart is Empty"
            description="Looks like you haven't added any products to your bag yet."
            icon="🛒"
            actionText="Start Shopping Now"
            actionLink="/products"
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-container">
      <Navbar />

      <main className="main-content">
        <div className="section-header">
          <div>
            <h1 className="section-title">Shopping Cart</h1>
            <p className="section-subtitle">Review items in your cart ({count} items)</p>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={clearCart}
            style={{ color: 'var(--danger)', borderColor: 'var(--border-color)' }}
          >
            Clear Entire Cart
          </button>
        </div>

        <div className="cart-layout">
          {/* CART ITEMS LIST */}
          <div className="cart-items-list">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '90px 2fr 1fr 1fr auto',
                gap: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              <span>Product</span>
              <span>Details</span>
              <span style={{ textAlign: 'center' }}>Quantity</span>
              <span style={{ textAlign: 'right' }}>Total</span>
              <span>Action</span>
            </div>

            {cart.map((item) => (
              <CartItem
                key={item._id || item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </div>

          {/* ORDER SUMMARY */}
          <div className="cart-summary">
            <h3 style={{ fontSize: '1.25rem', color: 'var(--dark)' }}>Order Summary</h3>

            <div className="summary-row">
              <span>Subtotal ({count} items)</span>
              <span style={{ fontWeight: 600, color: 'var(--dark)' }}>{formatPrice(subtotal)}</span>
            </div>

            <div className="summary-row">
              <span>Estimated Shipping</span>
              <span>{shipping === 0 ? <strong style={{ color: 'var(--success)' }}>FREE</strong> : formatPrice(shipping)}</span>
            </div>

            <div className="summary-row">
              <span>Estimated Tax (5% GST)</span>
              <span>{formatPrice(tax)}</span>
            </div>

            {shipping > 0 && (
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-hover)', background: 'var(--accent-light)', padding: '6px 10px', borderRadius: '6px' }}>
                💡 Add {formatPrice(1000 - subtotal)} more to qualify for FREE shipping!
              </div>
            )}

            <div className="summary-row summary-total">
              <span>Grand Total</span>
              <span style={{ color: 'var(--primary)' }}>{formatPrice(total)}</span>
            </div>

            <button
              className="btn btn-primary btn-lg btn-block"
              style={{ marginTop: '12px' }}
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout →
            </button>

            <Link
              to="/products"
              className="btn btn-outline btn-block btn-sm"
              style={{ textAlign: 'center' }}
            >
              ← Continue Shopping
            </Link>

            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '8px' }}>
              🔒 256-Bit SSL Encrypted & Secure Checkout
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
