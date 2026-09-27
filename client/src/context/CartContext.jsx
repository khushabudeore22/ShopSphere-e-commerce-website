import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('shopsphere_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('shopsphere_cart', JSON.stringify(cart));
  }, [cart]);

  // Load from backend if token exists
  useEffect(() => {
    const fetchRemoteCart = async () => {
      const token = localStorage.getItem('shopsphere_token');
      if (token) {
        try {
          const { data } = await api.get('/cart');
          if (data && data.items && data.items.length > 0) {
            // Map remote items
            const remoteCart = data.items.map((item) => ({
              _id: item.product?._id || item.product || item._id,
              id: item.product?._id || item.product || item.id,
              name: item.product?.name || item.name,
              price: item.product?.price || item.price,
              image: item.product?.image || item.image,
              category: item.product?.category || item.category,
              stock: item.product?.stock ?? 10,
              quantity: item.qty || item.quantity || 1,
            }));
            setCart(remoteCart);
          }
        } catch {
          // Keep local cart
        }
      }
    };

    fetchRemoteCart();
  }, []);

  const addToCart = async (product, qty = 1) => {
    const prodId = product._id || product.id;
    const existingIndex = cart.findIndex((item) => (item._id || item.id) === prodId);

    let updatedCart;
    if (existingIndex > -1) {
      updatedCart = cart.map((item, index) => {
        if (index === existingIndex) {
          const newQty = item.quantity + qty;
          return { ...item, quantity: newQty };
        }
        return item;
      });
    } else {
      const newItem = {
        _id: prodId,
        id: prodId,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        category: product.category,
        brand: product.brand,
        stock: product.stock ?? 10,
        quantity: qty,
      };
      updatedCart = [...cart, newItem];
    }

    setCart(updatedCart);
    toast.success(`Added ${product.name} to cart!`);

    // Sync to backend if logged in
    const token = localStorage.getItem('shopsphere_token');
    if (token) {
      try {
        await api.post('/cart', {
          productId: prodId,
          qty: qty,
        });
      } catch (err) {
        console.warn('Backend cart sync failed:', err?.message);
      }
    }
  };

  const updateQuantity = async (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }

    const updatedCart = cart.map((item) => {
      if ((item._id || item.id) === productId) {
        return { ...item, quantity: qty };
      }
      return item;
    });

    setCart(updatedCart);

    const token = localStorage.getItem('shopsphere_token');
    if (token) {
      try {
        await api.put(`/cart/${productId}`, { qty });
      } catch (err) {
        console.warn('Backend cart update failed:', err?.message);
      }
    }
  };

  const removeFromCart = async (productId) => {
    const itemToRemove = cart.find((item) => (item._id || item.id) === productId);
    const updatedCart = cart.filter((item) => (item._id || item.id) !== productId);
    setCart(updatedCart);

    if (itemToRemove) {
      toast.success(`Removed ${itemToRemove.name} from cart`);
    }

    const token = localStorage.getItem('shopsphere_token');
    if (token) {
      try {
        await api.delete(`/cart/${productId}`);
      } catch (err) {
        console.warn('Backend cart item delete failed:', err?.message);
      }
    }
  };

  const clearCart = async () => {
    setCart([]);
    localStorage.removeItem('shopsphere_cart');

    const token = localStorage.getItem('shopsphere_token');
    if (token) {
      try {
        await api.delete('/cart');
      } catch (err) {
        console.warn('Backend cart clear failed:', err?.message);
      }
    }
  };

  const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
  const subtotal = cart.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0);
  const shipping = subtotal > 1000 || subtotal === 0 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const total = subtotal + shipping + tax;

  const value = {
    cart,
    count,
    subtotal,
    shipping,
    tax,
    total,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
