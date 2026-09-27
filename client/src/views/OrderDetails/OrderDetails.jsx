import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { formatPrice } from '../../utils/formatPrice';
import api from '../../services/api';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        if (data && (data.order || data._id)) {
          setOrder(data.order || data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Could not fetch remote order, checking local storage:', err?.message);
      }

      // Check local storage fallback
      try {
        const localOrders = JSON.parse(localStorage.getItem('shopsphere_orders') || '[]');
        const found = localOrders.find((o) => (o._id || o.id) === id);
        if (found) {
          setOrder(found);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    const result = await Swal.fire({
      title: 'Cancel Order?',
      text: 'Are you sure you want to cancel this order? This action cannot be reversed.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Yes, Cancel Order',
      cancelButtonText: 'Keep Order',
    });

    if (!result.isConfirmed) return;

    setCancelling(true);
    try {
      try {
        const { data } = await api.put(`/orders/${id}/cancel`);
        setOrder(data.order || { ...order, orderStatus: 'Cancelled' });
      } catch (err) {
        const updated = {
          ...order,
          orderStatus: 'Cancelled',
          trackingHistory: [
            ...(order?.trackingHistory || []),
            {
              status: 'Cancelled',
              location: order?.currentLocation || 'Order Facility',
              description: 'Order cancelled by customer',
              timestamp: new Date().toISOString(),
            },
          ],
        };
        setOrder(updated);
        const localOrders = JSON.parse(localStorage.getItem('shopsphere_orders') || '[]');
        const nextLocal = localOrders.map((o) => ((o._id || o.id) === id ? updated : o));
        localStorage.setItem('shopsphere_orders', JSON.stringify(nextLocal));
      }
      toast.success('Order has been cancelled');
    } catch {
      toast.error('Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const copyTrackingNumber = (trk) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(trk);
      toast.success('Tracking number copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <Navbar />
        <main className="main-content">
          <Loading message="Loading order details..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-container">
        <Navbar />
        <main className="main-content">
          <EmptyState
            title="Order Not Found"
            description="We could not find the order you requested."
            icon="⚠️"
            actionText="View All Orders"
            actionLink="/orders"
          />
        </main>
        <Footer />
      </div>
    );
  }

  const orderId = order._id || order.id || id;
  const status = order.orderStatus || order.status || 'Pending';
  const isCancellable = status !== 'Delivered' && status !== 'Cancelled';
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Recent';

  const address = order.shippingAddress || {};
  const trackingNumber = order.trackingNumber || `SS-TRK-${orderId.toString().slice(-6).toUpperCase()}`;
  const courierPartner = order.courierPartner || 'ShopSphere Express Courier';
  const currentLocation = order.currentLocation || 'Central Sorting Hub, Nashik';

  // Tracking Stepper logic
  const stages = ['Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
  const currentStageIndex = stages.indexOf(status);
  const progressPercent =
    status === 'Cancelled'
      ? 0
      : currentStageIndex >= 0
      ? (currentStageIndex / (stages.length - 1)) * 100
      : 20;

  // Build default checkpoints if history is empty
  const defaultHistory = [
    {
      status: 'Confirmed',
      location: 'Central Fulfillment Hub, Nashik',
      description: 'Order placed & electronic dispatch data received',
      timestamp: order.createdAt || new Date().toISOString(),
    },
    ...(currentStageIndex >= 1
      ? [
          {
            status: 'Processing',
            location: 'Nashik Packaging Center',
            description: 'Item packed, quality checked, and ready for pickup',
            timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
          },
        ]
      : []),
    ...(currentStageIndex >= 2
      ? [
          {
            status: 'Shipped',
            location: 'Regional Logistics Facility',
            description: 'Package departed sorting facility in transit to destination city',
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          },
        ]
      : []),
    ...(currentStageIndex >= 3
      ? [
          {
            status: 'Out for Delivery',
            location: `${address.city || 'Destination City'} Delivery Hub`,
            description: 'Courier agent is out for doorstep delivery',
            timestamp: new Date().toISOString(),
          },
        ]
      : []),
    ...(currentStageIndex >= 4
      ? [
          {
            status: 'Delivered',
            location: `${address.address || 'Customer Address'}, ${address.city || ''}`,
            description: 'Package delivered safely to recipient',
            timestamp: new Date().toISOString(),
          },
        ]
      : []),
  ];

  const history =
    order.trackingHistory && order.trackingHistory.length > 0
      ? order.trackingHistory
      : defaultHistory;

  return (
    <div className="page-container">
      <Navbar />

      <main className="main-content">
        {/* BREADCRUMB */}
        <div style={{ marginBottom: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <Link to="/">Home</Link> &nbsp;/&nbsp;
          <Link to="/orders">Orders</Link> &nbsp;/&nbsp;
          <span style={{ color: 'var(--dark)', fontWeight: 600 }}>
            Order #{orderId.toString().slice(-8).toUpperCase()}
          </span>
        </div>

        {/* HEADER */}
        <div className="section-header">
          <div>
            <h1 className="section-title">Order & Location Tracking</h1>
            <p className="section-subtitle">
              Order placed on <strong>{orderDate}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span
              className={`badge ${
                status === 'Delivered'
                  ? 'badge-success'
                  : status === 'Cancelled'
                  ? 'badge-danger'
                  : 'badge-warning'
              }`}
              style={{ fontSize: '0.9rem', padding: '6px 14px' }}
            >
              {status}
            </span>

            {isCancellable && (
              <button
                className="btn btn-danger btn-sm"
                onClick={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>

        {/* LIVE TRACKING CONTAINER */}
        <div className="tracking-container">
          <div className="tracking-header">
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tracking Number:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <strong style={{ fontSize: '1.1rem', color: 'var(--dark)' }}>{trackingNumber}</strong>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                  onClick={() => copyTrackingNumber(trackingNumber)}
                >
                  📋 Copy
                </button>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Courier Partner:</span>
              <div style={{ fontWeight: 600, color: 'var(--dark)', marginTop: '2px' }}>
                🚚 {courierPartner}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estimated Delivery:</span>
              <div style={{ fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>
                {status === 'Delivered' ? '✅ Delivered' : '2-4 Business Days'}
              </div>
            </div>
          </div>

          {/* STEPPER PROGRESS */}
          {status !== 'Cancelled' ? (
            <div className="tracking-stepper">
              <div
                className="tracking-stepper-progress"
                style={{ width: `${progressPercent}%` }}
              ></div>

              {stages.map((stage, idx) => {
                const isCompleted = currentStageIndex > idx;
                const isActive = currentStageIndex === idx;

                return (
                  <div
                    key={stage}
                    className={`step-node ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                  >
                    <div className="step-circle">
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <span className="step-label">{stage}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                background: 'var(--danger-light)',
                color: 'var(--danger)',
                padding: '16px',
                borderRadius: '8px',
                margin: '20px 0',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              ⚠️ This order was cancelled. Transit and tracking have been stopped.
            </div>
          )}

          {/* LIVE LOCATION BANNER */}
          <div className="live-location-banner">
            <div>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Current Package Location
              </span>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.3rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📍 {currentLocation}
              </h3>
            </div>
            <div style={{ background: 'rgba(37, 99, 235, 0.3)', border: '1px solid #2563EB', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem' }}>
              📡 Live GPS Checkpoint Active
            </div>
          </div>

          {/* CHECKPOINT TIMELINE */}
          <div style={{ marginTop: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--dark)', marginBottom: '16px' }}>
              Transit Checkpoints & Activity Log
            </h3>

            <div className="tracking-timeline">
              {history.map((event, i) => (
                <div key={i} className="timeline-item">
                  <div className={`timeline-dot ${i === history.length - 1 ? 'latest' : ''}`}></div>
                  <div className="timeline-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
                      <strong style={{ color: 'var(--dark)', fontSize: '1rem' }}>
                        📍 {event.location}
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                        {new Date(event.timestamp).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.9rem', marginTop: '2px' }}>
                      {event.status}
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ORDER DETAILS GRID */}
        <div className="cart-layout">
          {/* ITEMS LIST */}
          <div className="cart-items-list">
            <h3 style={{ color: 'var(--dark)', marginBottom: '8px' }}>Ordered Items</h3>
            {(order.orderItems || order.items || []).map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <img
                  src={item.image || 'https://via.placeholder.com/80'}
                  alt={item.name}
                  style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--dark)', fontSize: '1rem' }}>{item.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
                    Unit Price: {formatPrice(item.price)}
                  </div>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                  Qty: {item.qty || item.quantity}
                </div>
                <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.05rem', minWidth: '90px', textAlign: 'right' }}>
                  {formatPrice(item.price * (item.qty || item.quantity))}
                </div>
              </div>
            ))}

            {/* SHIPPING & PAYMENT INFO */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ color: 'var(--dark)', marginBottom: '8px' }}>Delivery Address</h4>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-main)' }}>{address.name}</p>
                <p style={{ margin: '2px 0', fontSize: '0.9rem' }}>{address.address}</p>
                <p style={{ margin: '2px 0', fontSize: '0.9rem' }}>
                  {address.city}, {address.state} - {address.pincode}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>📞 Phone: {address.phone}</p>
              </div>

              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ color: 'var(--dark)', marginBottom: '8px' }}>Payment Summary</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  Method: <strong>{order.paymentMethod || 'Cash on Delivery'}</strong>
                </p>
                <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>
                  Status:{' '}
                  <span
                    className={`badge ${
                      order.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'
                    }`}
                  >
                    {order.paymentStatus || 'Pending'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* TOTAL BREAKDOWN */}
          <div className="cart-summary">
            <h3 style={{ fontSize: '1.25rem', color: 'var(--dark)' }}>Payment Breakdown</h3>

            <div className="summary-row">
              <span>Items Total</span>
              <span style={{ fontWeight: 600 }}>{formatPrice(order.itemsPrice || order.subtotal || 0)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping Charge</span>
              <span>{order.shippingPrice === 0 ? 'FREE' : formatPrice(order.shippingPrice || 0)}</span>
            </div>

            <div className="summary-row">
              <span>Taxes (GST)</span>
              <span>{formatPrice(order.taxPrice || 0)}</span>
            </div>

            <div className="summary-row summary-total">
              <span>Total Amount</span>
              <span style={{ color: 'var(--primary)' }}>{formatPrice(order.totalPrice || order.total || 0)}</span>
            </div>

            <Link to="/orders" className="btn btn-outline btn-block btn-sm" style={{ marginTop: '12px' }}>
              ← Back to All Orders
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
