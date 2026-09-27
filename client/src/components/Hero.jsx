import React from 'react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <span className="hero-badge">⚡ Special Festive Deals & Offers</span>
        <h1 className="hero-title">
          Shop Smart.<br />
          <span>Live Better.</span>
        </h1>
        <p className="hero-subtitle">
          Discover quality products at affordable prices. Explore electronics, fashion, beauty, home essentials and more.
        </p>
        <div className="hero-buttons">
          <Link to="/products" className="btn btn-accent btn-lg">
            Shop Now →
          </Link>
          <Link to="/about" className="btn btn-outline btn-lg" style={{ color: '#FFFFFF', borderColor: '#475569' }}>
            Learn More
          </Link>
        </div>
      </div>

      <div className="hero-image">
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700&auto=format&fit=crop&q=80"
          alt="ShopSphere Hero Banner"
        />
      </div>
    </section>
  );
}
