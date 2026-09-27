import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import OrderCard from '../../components/OrderCard';
import EmptyState from '../../components/EmptyState';
import Loading from '../../components/Loading';
import api from '../../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders');
        if (data && (data.orders || Array.isArray(data))) {
          const fetchedOrders = data.orders || data;
          setOrders(fetchedOrders);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Backend orders fetch failed, reading localStorage:', err?.message);
      }

      // Local storage fallback
      try {
        const saved = localStorage.getItem('shopsphere_orders');
        setOrders(saved ? JSON.parse(saved) : []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="page-container">
      <Navbar />

      <main className="main-content">
        <div className="section-header">
          <div>
            <h1 className="section-title">My Orders</h1>
            <p className="section-subtitle">Track, view, and manage all your placed orders ({orders.length})</p>
          </div>
        </div>

        {loading ? (
          <Loading message="Fetching your orders..." />
        ) : orders.length === 0 ? (
          <EmptyState
            title="No Orders Found"
            description="You have not placed any orders with ShopSphere yet."
            icon="🛍️"
            actionText="Start Shopping"
            actionLink="/products"
          />
        ) : (
          <div className="orders-list">
            {orders.map((order, idx) => (
              <OrderCard key={order._id || order.id || idx} order={order} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
