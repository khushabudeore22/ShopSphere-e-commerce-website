import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function About() {
  return (
    <div className="page-container">
      <Navbar />

      <main className="main-content">
        {/* HERO SECTION */}
        <section className="about-hero">
          <span className="badge badge-primary" style={{ marginBottom: '12px' }}>
            About ShopSphere
          </span>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--dark)', marginBottom: '16px' }}>
            Everything You Need, All in One Place.
          </h1>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: 'var(--text-muted)' }}>
            ShopSphere is a full-featured, modern MERN Stack e-commerce web application engineered to deliver
            a seamless, reliable, and delightful shopping experience across desktop, tablet, and mobile devices.
          </p>
        </section>

        {/* MISSION STATEMENT */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            color: '#FFFFFF',
            padding: '40px',
            borderRadius: '16px',
            margin: '30px auto',
            textAlign: 'center',
            maxWidth: '900px',
          }}
        >
          <h2 style={{ color: '#F59E0B', marginBottom: '12px' }}>Our Mission</h2>
          <p style={{ color: '#CBD5E1', fontSize: '1.05rem', lineHeight: '1.7' }}>
            Our mission is to simplify online shopping by combining lightning-fast catalog exploration,
            transparent pricing, reliable doorstep fulfillment, and a high-security user environment powered by
            cutting-edge MongoDB Atlas and React technologies.
          </p>
        </div>

        {/* PILLARS / HIGHLIGHTS */}
        <div className="section-header" style={{ marginTop: '48px', justifyContent: 'center', textAlign: 'center' }}>
          <div>
            <h2 className="section-title">Why Choose ShopSphere?</h2>
            <p className="section-subtitle">Engineered with modern web architecture and user-first principles</p>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-box">
            <div style={{ fontSize: '2.5rem' }}>🛍️</div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--dark)' }}>Easy Shopping</h3>
            <p style={{ fontSize: '0.9rem' }}>
              Intuitive categories, multi-criteria filtering, live search queries, and single-click cart management.
            </p>
          </div>

          <div className="feature-box">
            <div style={{ fontSize: '2.5rem' }}>🔒</div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--dark)' }}>Secure Account</h3>
            <p style={{ fontSize: '0.9rem' }}>
              JWT authenticated sessions, role-based protection for administrators, and safe client state persistence.
            </p>
          </div>

          <div className="feature-box">
            <div style={{ fontSize: '2.5rem' }}>📦</div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--dark)' }}>Order Tracking</h3>
            <p style={{ fontSize: '0.9rem' }}>
              Instant order placement confirmation, itemized receipts, live status transitions, and easy cancellation.
            </p>
          </div>

          <div className="feature-box">
            <div style={{ fontSize: '2.5rem' }}>📱</div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--dark)' }}>Responsive Shopping</h3>
            <p style={{ fontSize: '0.9rem' }}>
              Fully responsive layouts crafted with pure modular CSS and fluid grids tailored for all screen sizes.
            </p>
          </div>
        </div>

        {/* CALL TO ACTION */}
        <div style={{ textAlign: 'center', margin: '48px 0 24px' }}>
          <Link to="/products" className="btn btn-primary btn-lg">
            Start Exploring Products →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
