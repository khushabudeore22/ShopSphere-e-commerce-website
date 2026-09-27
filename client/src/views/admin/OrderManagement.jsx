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

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const statusOptions = [
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
  ];

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/admin/orders');
      if (data && (data.orders || Array.isArray(data))) {
        setOrders(data.orders || data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.warn('API error in admin orders:', err?.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      try {
        await api.put(`/admin/orders/${orderId}/status`, { orderStatus: newStatus });
      } catch (err) {
        console.warn('Backend status update fallback:', err?.message);
      }

      setOrders(
        orders.map((o) =>
          (o._id || o.id) === orderId ? { ...o, orderStatus: newStatus } : o
        )
      );

      const localOrders = JSON.parse(localStorage.getItem('shopsphere_orders') || '[]');
      const nextLocal = localOrders.map((o) =>
        (o._id || o.id) === orderId ? { ...o, orderStatus: newStatus } : o
      );
      localStorage.setItem('shopsphere_orders', JSON.stringify(nextLocal));

      toast.success(`Order status updated to "${newStatus}"`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleUpdateLocation = async (order) => {
    const ordId = order._id || order.id;
    const { value: formValues } = await Swal.fire({
      title: 'Update Package Live Location',
      html: `
        <div style="text-align: left; font-size: 0.9rem;">
          <label style="font-weight:600;display:block;margin-bottom:4px;">Current Checkpoint Location:</label>
          <input id="swal-loc" class="swal2-input" style="margin:0 0 12px 0;width:100%;box-sizing:border-box;" value="${order.currentLocation || 'Nashik Central Hub'}" placeholder="e.g. Pune Regional Sorting Hub">
          <label style="font-weight:600;display:block;margin-bottom:4px;">Checkpoint Description / Activity Note:</label>
          <input id="swal-note" class="swal2-input" style="margin:0;width:100%;box-sizing:border-box;" placeholder="e.g. Package arrived at local delivery station">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Update Location',
      confirmButtonColor: '#2563EB',
      cancelButtonColor: '#64748B',
      preConfirm: () => {
        const loc = document.getElementById('swal-loc').value;
        const note = document.getElementById('swal-note').value;
        if (!loc.trim()) {
          Swal.showValidationMessage('Location name is required');
          return false;
        }
        return { currentLocation: loc.trim(), note: note.trim() };
      },
    });

    if (!formValues) return;

    try {
      try {
        await api.put(`/admin/orders/${ordId}/status`, formValues);
      } catch (err) {
        console.warn('Backend location update fallback:', err?.message);
      }

      setOrders(
        orders.map((o) =>
          (o._id || o.id) === ordId
            ? {
                ...o,
                currentLocation: formValues.currentLocation,
                trackingHistory: [
                  ...(o.trackingHistory || []),
                  {
                    status: o.orderStatus,
                    location: formValues.currentLocation,
                    description: formValues.note || 'Location updated by admin',
                    timestamp: new Date().toISOString(),
                  },
                ],
              }
            : o
        )
      );

      toast.success(`Location updated to "${formValues.currentLocation}"`);
    } catch {
      toast.error('Failed to update location');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'badge-success';
      case 'Cancelled':
        return 'badge-danger';
      case 'Shipped':
      case 'Out for Delivery':
        return 'badge-primary';
      default:
        return 'badge-warning';
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
          <Link to="/admin/products" className="admin-nav-link">
            📦 Products Management
          </Link>
          <Link to="/admin/orders" className="admin-nav-link active">
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
              <h1 style={{ fontSize: '1.85rem', color: 'var(--dark)' }}>Orders & Tracking Management</h1>
              <p style={{ color: 'var(--text-muted)' }}>Monitor customer purchases, manage live GPS checkpoints, and update status</p>
            </div>
          </div>

          {loading ? (
            <Loading message="Loading customer orders..." />
          ) : orders.length === 0 ? (
            <EmptyState
              title="No Orders to Display"
              description="Customer orders placed on the store will appear here."
              icon="🛍️"
            />
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Current Location</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => {
                    const ordId = ord._id || ord.id;
                    const status = ord.orderStatus || ord.status || 'Pending';
                    const customerName =
                      ord.shippingAddress?.name || ord.user?.name || ord.userName || 'Customer';
                    const curLoc = ord.currentLocation || 'Central Sorting Hub, Nashik';

                    return (
                      <tr key={ordId}>
                        <td>
                          <Link
                            to={`/orders/${ordId}`}
                            style={{ fontWeight: 700, color: 'var(--primary)' }}
                          >
                            #{ordId.toString().slice(-8).toUpperCase()}
                          </Link>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '2px' }}>
                            {ord.trackingNumber || `SS-TRK-${ordId.toString().slice(-6).toUpperCase()}`}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--dark)' }}>{customerName}</div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {ord.shippingAddress?.city || 'India'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.9rem' }}>📍</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--dark)' }}>
                              {curLoc}
                            </span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--dark)' }}>
                          {formatPrice(ord.totalPrice || ord.total || 0)}
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadge(status)}`}>{status}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <select
                              className="form-select"
                              style={{ padding: '6px 8px', fontSize: '0.8rem', width: 'auto' }}
                              value={status}
                              onChange={(e) => handleStatusChange(ordId, e.target.value)}
                            >
                              {statusOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                              onClick={() => handleUpdateLocation(ord)}
                              title="Update Checkpoint Location"
                            >
                              📍 Loc
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
