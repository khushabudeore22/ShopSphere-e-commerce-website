import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate(redirectPath);
        }
      }
    } catch {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Navbar />

      <main className="main-content">
        <div className="auth-card form-container">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--dark)' }}>Sign in to ShopSphere</h1>
            <p style={{ marginTop: '6px' }}>Enter your email and password to access your account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
                <a href="#forgot" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              style={{ marginTop: '12px' }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Login'}
            </button>
          </form>

          <div
            style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-color)',
              textAlign: 'center',
              fontSize: '0.9rem',
            }}
          >
            <p>
              Don't have an account yet?{' '}
              <Link to="/register" style={{ fontWeight: 600, color: 'var(--primary)' }}>
                Create Account
              </Link>
            </p>
          </div>

          {/* Quick Demo Credentials Box */}
          <div
            style={{
              marginTop: '20px',
              background: '#F1F5F9',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
            }}
          >
            <strong>Quick Demo Accounts:</strong>
            <div>User: <code>user@shopsphere.com</code> / <code>123456</code></div>
            <div>Admin: <code>admin@shopsphere.com</code> / <code>admin123</code></div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
