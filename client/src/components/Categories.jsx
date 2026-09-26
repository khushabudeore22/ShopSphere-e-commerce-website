import React from 'react';
import CategoryCard from './CategoryCard';
import { mockCategories } from '../data/mockData';

export default function Categories({ categories = mockCategories }) {
  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Explore Categories</h2>
          <p className="section-subtitle">Browse through top departments tailored for you</p>
        </div>
      </div>
      <div className="categories-grid">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </section>
  );
}
