import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import SearchBar from './SearchBar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* LOGO */}
        <Link to="/" className="navbar-brand">
          Shop<span>Sphere</span>
        </Link>

        {/* SEARCH BAR (Compact in header) */}
        <div className="navbar-search">
          <SearchBar compact placeholder="Search products..." />
        </div>

        {/* NAVIGATION LINKS */}
        <nav className={`navbar-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <Link to="/" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>
          <Link to="/products" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
            Products
          </Link>
          <Link to="/about" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
            About
          </Link>
          <Link to="/contact" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
            Contact
          </Link>

          <Link to="/wishlist" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
            🤍 Wishlist
          </Link>

          <Link to="/cart" className="navbar-link cart-link" onClick={() => setMobileMenuOpen(false)}>
            🛒 Cart <b className="cart-badge">{count}</b>
          </Link>

          {user ? (
            <div className="user-menu" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link
                to={user.role === 'admin' ? '/admin' : '/profile'}
                className="btn btn-outline btn-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                👤 {user.name ? user.name.split(' ')[0] : 'Account'}
                {user.role === 'admin' && ' (Admin)'}
              </Link>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ color: 'var(--danger)', borderColor: 'var(--border-color)' }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" className="btn btn-primary btn-sm" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="btn btn-outline btn-sm" onClick={() => setMobileMenuOpen(false)}>
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}