import React, { useState } from 'react';
import { Link } from 'react-router';
import Rating from './Rating';

export default function ProductCard({
  product,
  onAddToCart,
  onRemoveFromWishlist,
  isWishlistMode = false
}) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlistMode && onRemoveFromWishlist) {
      onRemoveFromWishlist(product.id);
    } else {
      setIsWishlisted(!isWishlisted);
    }
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      alert(`Added "${product.name}" to cart!`);
    }
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="product-card-image-wrap">
          <img
            src={product.image || 'https://via.placeholder.com/300'}
            alt={product.name}
            className="product-card-image"
            loading="lazy"
          />
          {product.discount > 0 && (
            <span className="product-badge">-{product.discount}%</span>
          )}
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
          <span className="product-category">{product.category}</span>
          <h3 className="product-title" title={product.name}>{product.name}</h3>
          
          <Rating value={product.rating || 4.5} numReviews={product.numReviews} />

          <div className="product-price-row">
            <span className="product-price">₹{product.price?.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="product-original-price">₹{product.originalPrice?.toLocaleString()}</span>
            )}
            {product.discount > 0 && (
              <span className="product-discount">{product.discount}% off</span>
            )}
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
