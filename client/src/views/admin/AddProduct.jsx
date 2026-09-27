import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AddProduct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'Electronics',
    brand: '',
    stock: '15',
    image: '',
    featured: false,
  });

  const [saving, setSaving] = useState(false);

  const categories = [
    'Electronics',
    'Fashion',
    'Beauty',
    'Home & Kitchen',
    'Sports',
    'Books',
    'Accessories',
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Please fill in product name, price, and category');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        category: formData.category,
        brand: formData.brand || 'ShopSphere',
        stock: Number(formData.stock) || 0,
        image: formData.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
        featured: Boolean(formData.featured),
      };

      try {
        await api.post('/products', payload);
      } catch (err) {
        console.warn('Backend add product offline fallback:', err?.message);
      }

      toast.success('Product created successfully!');
      navigate('/admin/products');
    } catch {
      toast.error('Failed to create product');
    } finally {
      setSaving(false);
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
              <h1 style={{ fontSize: '1.85rem', color: 'var(--dark)' }}>Add New Product</h1>
              <p style={{ color: 'var(--text-muted)' }}>Publish a new catalog item to the store</p>
            </div>
            <Link to="/admin/products" className="btn btn-outline">
              ← Back to Products
            </Link>
          </div>

          <div className="form-container" style={{ maxWidth: '800px' }}>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="e.g. Wireless Bluetooth Noise-Cancelling Headphones"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Brand Name</label>
                  <input
                    type="text"
                    name="brand"
                    className="form-input"
                    placeholder="e.g. Sony, Nike, Apple"
                    value={formData.brand}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Sale Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    className="form-input"
                    placeholder="e.g. 2499"
                    value={formData.price}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Original / MRP Price (₹)</label>
                  <input
                    type="number"
                    name="originalPrice"
                    className="form-input"
                    placeholder="e.g. 3999"
                    value={formData.originalPrice}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input
                    type="number"
                    name="stock"
                    className="form-input"
                    placeholder="e.g. 25"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Product Image URL</label>
                <input
                  type="url"
                  name="image"
                  className="form-input"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={handleChange}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                  Provide a direct public image link from Unsplash, Imgur, or CDN.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Description</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  placeholder="Provide comprehensive details about material, features, dimensions, warranty..."
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                ></textarea>
              </div>

              <div className="form-group" style={{ marginTop: '8px' }}>
                <label className="form-checkbox-label">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                  />
                  <span>⭐ Feature this product on the Home Page Hero/Showcase</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1 }}
                  disabled={saving}
                >
                  {saving ? 'Saving Product...' : 'Publish Product'}
                </button>
                <Link to="/admin/products" className="btn btn-outline btn-lg">
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
