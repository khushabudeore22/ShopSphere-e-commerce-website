import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      await updateUser({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      });
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <Navbar />

      <main className="main-content">
        <div style={{ maxWidth: '650px', margin: '20px auto' }}>
          <div className="section-header">
            <div>
              <h1 className="section-title">My Profile</h1>
              <p className="section-subtitle">Manage your personal details and delivery information</p>
            </div>
          </div>

          <div className="form-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  fontWeight: 700,
                }}
              >
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h3 style={{ color: 'var(--dark)' }}>{formData.name || 'ShopSphere User'}</h3>
                <span className="badge badge-primary">{user?.role === 'admin' ? 'Administrator' : 'Customer'}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Read Only)</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  readOnly
                  disabled
                  style={{ backgroundColor: '#F1F5F9', cursor: 'not-allowed' }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                  Email address cannot be changed as it is tied to your account identity.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Saved Delivery Address</label>
                <textarea
                  name="address"
                  className="form-textarea"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Street address, building, city, zip"
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg btn-block"
                style={{ marginTop: '12px' }}
                disabled={saving}
              >
                {saving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
