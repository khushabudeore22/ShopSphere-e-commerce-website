import React from 'react';
import CategoryCard from './CategoryCard';

const defaultCategories = [
  { id: 'electronics', name: 'Electronics', icon: '📱', count: '120+ Products' },
  { id: 'fashion', name: 'Fashion', icon: '👕', count: '350+ Products' },
  { id: 'beauty', name: 'Beauty', icon: '✨', count: '90+ Products' },
  { id: 'home', name: 'Home & Kitchen', icon: '🏠', count: '180+ Products' },
  { id: 'sports', name: 'Sports', icon: '⚽', count: '75+ Products' },
  { id: 'books', name: 'Books', icon: '📚', count: '200+ Products' },
  { id: 'accessories', name: 'Accessories', icon: '🎒', count: '110+ Products' },
];

export default function Categories({ categories }) {
  const displayCategories = categories && categories.length > 0 ? categories : defaultCategories;

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Browse through top categories handpicked for your lifestyle</p>
        </div>
      </div>
      <div className="categories-grid">
        {displayCategories.map((cat, idx) => (
          <CategoryCard key={cat._id || cat.id || idx} category={cat} />
        ))}
      </div>
    </section>
  );
}
