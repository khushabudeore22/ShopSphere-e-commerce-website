import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand">
          <span>Shop</span>Sphere
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="navbar-search">
          <div className="search-input-wrap">
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </form>

        {/* Navigation Links */}
        <nav>
          <ul className="navbar-nav">
            <li>
              <NavLink to="/" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/products" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                Products
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                About
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                Contact
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* User Actions */}
        <div className="navbar-actions">
          <Link to="/wishlist" className="nav-icon-btn" title="Wishlist">
            ❤️
            <span className="nav-badge">2</span>
          </Link>

          <Link to="/cart" className="nav-icon-btn" title="Cart">
            🛒
            <span className="nav-badge">3</span>
          </Link>

          <Link to="/profile" className="nav-icon-btn" title="Profile">
            👤
          </Link>

          <Link to="/admin" className="btn btn-outline btn-sm">
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
