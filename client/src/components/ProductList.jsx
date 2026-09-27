import React from 'react';
import ProductCard from './ProductCard';
import EmptyState from './EmptyState';

export default function ProductList({ products = [], onAddToCart, onReset }) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="No Products Found"
        description="Try adjusting your search query, price filters, or category selection."
        icon="🔍"
        actionText="Browse All Products / Reset Filters"
        actionLink={onReset ? undefined : '/products'}
        onAction={onReset}
      />
    );
  }

  return (
    <div className="products-grid">
      {products.map((product) => (
        <ProductCard
          key={product._id || product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
