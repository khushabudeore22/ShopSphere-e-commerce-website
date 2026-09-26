import React from 'react';
import { Link } from 'react-router';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div>
          <div className="footer-brand">
            <span>Shop</span>Sphere
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '16px' }}>
            Your one-stop destination for quality lifestyle, fashion, electronics, and home essentials at unbeatable prices.
          </p>
          <div style={{ display: 'flex', gap: '12px', fontSize: '1.2rem' }}>
            <span>🌐</span> <span>📸</span> <span>🐦</span> <span>💼</span>
          </div>
        </div>

        <div>
          <h4 style={{ color: '#FFFFFF', marginBottom: '16px' }}>Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">All Products</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Support</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#FFFFFF', marginBottom: '16px' }}>Customer Service</h4>
          <ul className="footer-links">
            <li><Link to="/orders">Order Tracking</Link></li>
            <li><Link to="/cart">Shopping Cart</Link></li>
            <li><Link to="/wishlist">Wishlist</Link></li>
            <li><Link to="/profile">My Account</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#FFFFFF', marginBottom: '16px' }}>Stay Connected</h4>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '12px' }}>
            Subscribe to our newsletter for exclusive discounts and new product updates.
          </p>
          <div style={{ color: '#CBD5E1', fontSize: '0.9rem' }}>
            <p>📧 support@shopsphere.com</p>
            <p>📞 +91 98765 43210</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} ShopSphere Inc. All rights reserved.</p>
        <p>Built with MERN Stack</p>
      </div>
    </footer>
  );
}
