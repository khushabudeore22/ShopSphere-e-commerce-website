import React from 'react';
import CategoryCard from './CategoryCard';

export default function Categories({ categories = [] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Browse through top categories handpicked for your lifestyle</p>
        </div>
      </div>
      <div className="categories-grid">
        {categories.map((cat, idx) => (
          <CategoryCard key={cat._id || cat.id || idx} category={cat} />
        ))}
      </div>
    </section>
  );
}
