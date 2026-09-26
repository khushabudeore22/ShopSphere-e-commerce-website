import React from 'react';
import ProductCard from './ProductCard';
import EmptyState from './EmptyState';

export default function ProductList({ products = [], onAddToCart }) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="No Products Found"
        description="Try adjusting your search or filter keywords to find what you are looking for."
        icon="🔍"
      />
    );
  }

  return (
    <div className="products-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
}
