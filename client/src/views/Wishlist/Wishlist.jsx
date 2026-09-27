import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import EmptyState from '../../components/EmptyState';
import Loading from '../../components/Loading';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem('shopsphere_token');
        if (token) {
          const { data } = await api.get('/wishlist');
          if (data && data.products) {
            setWishlist(data.products);
            localStorage.setItem('shopsphere_wishlist', JSON.stringify(data.products));
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend wishlist fetch failed, loading local storage:', err?.message);
      }

      // Local storage fallback
      try {
        const saved = localStorage.getItem('shopsphere_wishlist');
        setWishlist(saved ? JSON.parse(saved) : []);
      } catch {
        setWishlist([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (productId) => {
    const updated = wishlist.filter((item) => (item._id || item.id) !== productId);
    setWishlist(updated);
    localStorage.setItem('shopsphere_wishlist', JSON.stringify(updated));
    toast.success('Removed from wishlist');

    const token = localStorage.getItem('shopsphere_token');
    if (token) {
      try {
        await api.delete(`/wishlist/${productId}`);
      } catch {
        // Handled locally
      }
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  return (
    <div className="page-container">
      <Navbar />

      <main className="main-content">
        <div className="section-header">
          <div>
            <h1 className="section-title">My Wishlist</h1>
            <p className="section-subtitle">Products you saved for later ({wishlist.length} items)</p>
          </div>
        </div>

        {loading ? (
          <Loading message="Loading wishlist items..." />
        ) : wishlist.length === 0 ? (
          <EmptyState
            title="Your Wishlist is Empty"
            description="Explore our wide range of products and click the heart icon on items you love!"
            icon="🤍"
            actionText="Discover Products"
            actionLink="/products"
          />
        ) : (
          <div className="products-grid">
            {wishlist.map((prod) => (
              <ProductCard
                key={prod._id || prod.id}
                product={prod}
                isWishlistMode={true}
                onAddToCart={() => handleAddToCart(prod)}
                onRemoveFromWishlist={() => handleRemoveFromWishlist(prod._id || prod.id)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
