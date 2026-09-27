import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* BRAND */}
        <div>
          <div className="footer-brand">
            Shop<span>Sphere</span>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '12px' }}>
            Everything You Need, All in One Place.
          </p>
          <p style={{ color: '#64748B', fontSize: '0.85rem' }}>
            Premium e-commerce platform built on the MERN stack with modern responsive design and seamless user experience.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h4 style={{ color: '#FFFFFF', marginBottom: '16px' }}>Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/products">All Products</Link></li>
            <li><Link to="/orders">My Orders</Link></li>
            <li><Link to="/wishlist">My Wishlist</Link></li>
            <li><Link to="/cart">Shopping Cart</Link></li>
          </ul>
        </div>

        {/* COMPANY */}
        <div>
          <h4 style={{ color: '#FFFFFF', marginBottom: '16px' }}>Company</h4>
          <ul className="footer-links">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Support</Link></li>
            <li><Link to="/products?category=Electronics">Electronics</Link></li>
            <li><Link to="/products?category=Fashion">Fashion</Link></li>
          </ul>
        </div>

        {/* SUPPORT */}
        <div>
          <h4 style={{ color: '#FFFFFF', marginBottom: '16px' }}>Customer Support</h4>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '8px' }}>
            📧 support@shopsphere.com
          </p>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '8px' }}>
            📞 +91 98765 43210
          </p>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            📍 Nashik, Maharashtra, India
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <div>
          © {new Date().getFullYear()} ShopSphere. All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/about" style={{ color: '#94A3B8' }}>Privacy</Link>
          <Link to="/about" style={{ color: '#94A3B8' }}>Terms</Link>
          <Link to="/contact" style={{ color: '#94A3B8' }}>Help</Link>
        </div>
      </div>
    </footer>
  );
}