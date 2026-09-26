import React from 'react';
import { Link } from 'react-router';

export default function CategoryCard({ category }) {
  return (
    <Link to={`/products?category=${encodeURIComponent(category.name)}`} className="category-card">
      <div className="category-icon">{category.icon}</div>
      <div className="category-name">{category.name}</div>
      <span className="category-count">{category.count}</span>
    </Link>
  );
}
