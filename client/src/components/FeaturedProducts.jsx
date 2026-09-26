import React from 'react';
import ProductCard from './ProductCard';
import { mockProducts } from '../data/mockData';

export default function FeaturedProducts({
  title = "Featured Products",
  subtitle = "Our handpicked selections for top quality and value",
  products = mockProducts.filter(p => p.featured)
}) {
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
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
