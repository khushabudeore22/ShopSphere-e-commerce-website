import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import toast from 'react-hot-toast';

export default function ProductCard({
  product,
  onAddToCart,
  onRemoveFromWishlist,
  isWishlistMode = false,
}) {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(() => {
    try {
      const saved = localStorage.getItem('shopsphere_wishlist');
      const list = saved ? JSON.parse(saved) : [];
      return list.some((item) => (item._id || item.id) === (product._id || product.id));
    } catch {
      return false;
    }
  });

  const prodId = product._id || product.id;

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const saved = localStorage.getItem('shopsphere_wishlist');
      let list = saved ? JSON.parse(saved) : [];

      if (isWishlistMode && onRemoveFromWishlist) {
        onRemoveFromWishlist(prodId);
        return;
      }

      if (isWishlisted) {
        list = list.filter((item) => (item._id || item.id) !== prodId);
        setIsWishlisted(false);
        toast.success(`Removed ${product.name} from wishlist`);
      } else {
        list.push(product);
        setIsWishlisted(true);
        toast.success(`Added ${product.name} to wishlist!`);
      }
      localStorage.setItem('shopsphere_wishlist', JSON.stringify(list));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addToCart(product, 1);
    }
  };

  const discount = product.discount || (
    product.originalPrice && product.price && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0
  );

  return (
    <div className="product-card">
      <Link to={`/products/${prodId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="product-card-image-wrap">
          <img
            src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80'}
            alt={product.name}
            className="product-card-image"
            loading="lazy"
          />
          {discount > 0 && <span className="product-badge">-{discount}% OFF</span>}
          <button
            type="button"
            className={`product-wishlist-btn ${isWishlisted || isWishlistMode ? 'active' : ''}`}
            onClick={handleWishlistToggle}
            title={isWishlistMode ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            {isWishlistMode ? '✕' : isWishlisted ? '❤️' : '🤍'}
          </button>
        </div>

        <div className="product-card-body">
          <span className="product-category">{product.category || 'General'}</span>
          <h3 className="product-title" title={product.name}>
            {product.name}
          </h3>

          <Rating value={product.rating || 4.5} numReviews={product.numReviews || 12} />

          <div className="product-price-row">
            <span className="product-price">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="product-original-price">{formatPrice(product.originalPrice)}</span>
            )}
            {discount > 0 && <span className="product-discount">{discount}% off</span>}
          </div>
        </div>
      </Link>

      <div className="product-card-footer">
        {isWishlistMode ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary btn-sm btn-block" onClick={handleCartClick}>
              Move to Cart
            </button>
            <button className="btn btn-outline btn-sm" onClick={handleWishlistToggle}>
              Remove
            </button>
          </div>
        ) : (
          <button className="btn btn-primary btn-block btn-sm" onClick={handleCartClick}>
            🛒 Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
