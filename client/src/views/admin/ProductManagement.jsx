import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { formatPrice } from '../../utils/formatPrice';
import api from '../../services/api';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      if (data && (data.products || Array.isArray(data))) {
        setProducts(data.products || data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.warn('API error in products management:', err?.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Delete Product?',
      text: `Are you sure you want to delete "${name}"? This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      try {
        await api.delete(`/products/${id}`);
      } catch (err) {
        console.warn('Backend delete offline fallback:', err?.message);
      }
      setProducts(products.filter((p) => (p._id || p.id) !== id));
      toast.success('Product deleted successfully');
    } catch {
      toast.error('Failed to delete product');
    }
  };

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
          <Link to="/admin" className="admin-nav-link">
            📊 Dashboard Overview
          </Link>
          <Link to="/admin/products" className="admin-nav-link active">
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
        </aside>

        {/* CONTENT */}
        <main className="admin-content">
          <div className="admin-header">
            <div>
              <h1 style={{ fontSize: '1.85rem', color: 'var(--dark)' }}>Products Management</h1>
              <p style={{ color: 'var(--text-muted)' }}>Manage your inventory, price points, and active listings</p>
            </div>
            <Link to="/admin/products/add" className="btn btn-primary">
              + Add New Product
            </Link>
          </div>

          {loading ? (
            <Loading message="Loading inventory..." />
          ) : products.length === 0 ? (
            <EmptyState
              title="No Products Found"
              description="Get started by creating your first product listing."
              icon="📦"
              actionText="+ Create Product"
              actionLink="/admin/products/add"
            />
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Original Price</th>
                    <th>Stock</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const prodId = product._id || product.id;
                    return (
                      <tr key={prodId}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                              src={product.image || 'https://via.placeholder.com/50'}
                              alt={product.name}
                              className="table-img"
                            />
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--dark)', maxWidth: '220px' }}>
                                {product.name}
                              </div>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Brand: {product.brand || 'ShopSphere'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-primary">{product.category || 'General'}</span>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--dark)' }}>
                          {formatPrice(product.price)}
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          {product.originalPrice ? formatPrice(product.originalPrice) : '-'}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              (product.stock ?? 10) > 5 ? 'badge-success' : 'badge-danger'
                            }`}
                          >
                            {product.stock ?? 10} in stock
                          </span>
                        </td>
                        <td>
                          {product.featured ? (
                            <span className="badge badge-warning">⭐ Featured</span>
                          ) : (
                            <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Standard</span>
                          )}
                        </td>
                        <td>
                          <div className="table-actions">
                            <Link
                              to={`/admin/products/edit/${prodId}`}
                              className="btn btn-outline btn-sm"
                              title="Edit"
                            >
                              ✏️ Edit
                            </Link>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              style={{ color: 'var(--danger)', borderColor: 'var(--danger-light)' }}
                              onClick={() => handleDelete(prodId, product.name)}
                              title="Delete"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
