import React from 'react';
import { Link } from 'react-router-dom';

export default function CategoryCard({ category }) {
  const categoryName = category.name || category;
  const icon = category.icon || '🛍️';
  const count = category.count || category.description || 'Explore Products';

  return (
    <Link to={`/products?category=${encodeURIComponent(categoryName)}`} className="category-card">
      <div className="category-icon">{icon}</div>
      <div className="category-name">{categoryName}</div>
      <span className="category-count">{count}</span>
    </Link>
  );
}
