import React from 'react';
import ProductCard from './ProductCard';

export default function FeaturedProducts({
  title = 'Featured Products',
  subtitle = 'Our handpicked selections for top quality and unmatched value',
  products = [],
  onAddToCart,
}) {
  if (!products || products.length === 0) return null;

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">{title}</h2>
          <p className="section-subtitle">{subtitle}</p>
        </div>
      </div>
      <div className="products-grid">
        {products.map((product) => (
          <ProductCard
            key={product._id || product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  );
}
