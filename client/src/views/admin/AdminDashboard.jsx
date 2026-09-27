import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Loading from '../../components/Loading';
import { formatPrice } from '../../utils/formatPrice';
import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalSales: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const [prodRes, ordRes, userRes] = await Promise.allSettled([
          api.get('/products'),
          api.get('/admin/orders'),
          api.get('/admin/users'),
        ]);

        let prodsCount = 0;
        if (prodRes.status === 'fulfilled') {
          const list = prodRes.value.data?.products || prodRes.value.data || [];
          prodsCount = list.length;
        }

        let ordersCount = 0;
        let totalSalesVal = 0;
        if (ordRes.status === 'fulfilled') {
          const orders = ordRes.value.data?.orders || ordRes.value.data || [];
          ordersCount = orders.length;
          totalSalesVal = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        }

        let usersCount = 0;
        if (userRes.status === 'fulfilled') {
          const users = userRes.value.data?.users || userRes.value.data || [];
          usersCount = users.length;
        }

        setStats({
          totalProducts: prodsCount,
          totalOrders: ordersCount,
          totalUsers: usersCount,
          totalSales: totalSalesVal,
        });
      } catch (err) {
        console.warn('Dashboard stats error:', err?.message);
        setStats({
          totalProducts: 0,
          totalOrders: 0,
          totalUsers: 0,
          totalSales: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  return (
    <div className="page-container">
      <Navbar />

      <div className="admin-layout">
        {/* SIDEBAR */}
        <aside className="admin-sidebar">
          <div style={{ padding: '0 12px 16px', borderBottom: '1px solid #334155' }}>
            <h3 style={{ color: '#FFFFFF', fontSize: '1.2rem' }}>Admin Control</h3>
            <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>ShopSphere Management</span>
          </div>

          <div className="admin-sidebar-title">Menu</div>
          <Link to="/admin" className="admin-nav-link active">
            📊 Dashboard Overview
          </Link>
          <Link to="/admin/products" className="admin-nav-link">
            📦 Products Management
          </Link>
          <Link to="/admin/orders" className="admin-nav-link">
            🛍️ Orders Management
          </Link>
          <Link to="/admin/users" className="admin-nav-link">
            👥 Users Management
          </Link>
          <Link to="/admin/categories" className="admin-nav-link">
            🏷️ Categories Management
          </Link>

          <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #334155' }}>
            <Link to="/" className="admin-nav-link" style={{ color: '#94A3B8' }}>
              ← Return to Storefront
            </Link>
          </div>
        </aside>

        {/* MAIN ADMIN CONTENT */}
        <main className="admin-content">
          <div className="admin-header">
            <div>
              <h1 style={{ fontSize: '2rem', color: 'var(--dark)' }}>Admin Dashboard</h1>
              <p style={{ color: 'var(--text-muted)' }}>Real-time overview of business metrics and store operations</p>
            </div>
            <Link to="/admin/products/add" className="btn btn-primary">
              + Add New Product
            </Link>
          </div>

          {loading ? (
            <Loading message="Loading dashboard insights..." />
          ) : (
            <>
              {/* STAT CARDS */}
              <div className="dashboard-stats">
                <div className="stat-card">
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      TOTAL PRODUCTS
                    </span>
                    <div className="stat-val">{stats.totalProducts}</div>
                  </div>
                  <div className="stat-icon" style={{ background: '#DBEAFE', color: '#2563EB' }}>
                    📦
                  </div>
                </div>

                <div className="stat-card">
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      TOTAL ORDERS
                    </span>
                    <div className="stat-val">{stats.totalOrders}</div>
                  </div>
                  <div className="stat-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
                    🛍️
                  </div>
                </div>

                <div className="stat-card">
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      REGISTERED USERS
                    </span>
                    <div className="stat-val">{stats.totalUsers}</div>
                  </div>
                  <div className="stat-icon" style={{ background: '#D1FAE5', color: '#10B981' }}>
                    👥
                  </div>
                </div>

                <div className="stat-card">
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      TOTAL REVENUE
                    </span>
                    <div className="stat-val" style={{ color: 'var(--primary)' }}>
                      {formatPrice(stats.totalSales)}
                    </div>
                  </div>
                  <div className="stat-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                    💰
                  </div>
                </div>
              </div>

              {/* NAVIGATION CARDS */}
              <h2 style={{ fontSize: '1.4rem', color: 'var(--dark)', marginBottom: '16px' }}>
                Store Management Modules
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                <Link
                  to="/admin/products"
                  className="form-container"
                  style={{ textDecoration: 'none', transition: 'var(--transition)', cursor: 'pointer' }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📦</div>
                  <h3 style={{ color: 'var(--dark)', fontSize: '1.15rem' }}>Products Management</h3>
                  <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                    Create, update, remove inventory, adjust pricing, and control featured showcases.
                  </p>
                </Link>

                <Link
                  to="/admin/orders"
                  className="form-container"
                  style={{ textDecoration: 'none', transition: 'var(--transition)', cursor: 'pointer' }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🛍️</div>
                  <h3 style={{ color: 'var(--dark)', fontSize: '1.15rem' }}>Orders Management</h3>
                  <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                    Review customer orders, transition delivery lifecycle stages, and monitor payments.
                  </p>
                </Link>

                <Link
                  to="/admin/users"
                  className="form-container"
                  style={{ textDecoration: 'none', transition: 'var(--transition)', cursor: 'pointer' }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👥</div>
                  <h3 style={{ color: 'var(--dark)', fontSize: '1.15rem' }}>Users Management</h3>
                  <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                    Inspect user directories, assign administrative privileges, and toggle account activation.
                  </p>
                </Link>

                <Link
                  to="/admin/categories"
                  className="form-container"
                  style={{ textDecoration: 'none', transition: 'var(--transition)', cursor: 'pointer' }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏷️</div>
                  <h3 style={{ color: 'var(--dark)', fontSize: '1.15rem' }}>Categories Management</h3>
                  <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                    Add new departmental categories, manage descriptions, and organize catalog taxonomy.
                  </p>
                </Link>
              </div>
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
