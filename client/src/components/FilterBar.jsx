import React from 'react';

export default function FilterBar({
  categories = [],
  selectedCategory = 'All',
  onCategoryChange,
  priceRange = 10000,
  onPriceRangeChange,
  minRating = 0,
  onMinRatingChange,
  sortBy = 'default',
  onSortByChange,
  onReset,
}) {
  return (
    <div className="filter-bar">
      {/* Category filter */}
      <div style={{ minWidth: '180px' }}>
        <select
          className="form-select"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="All">All Categories</option>
          {categories.map((cat, idx) => {
            const catName = typeof cat === 'string' ? cat : cat.name;
            return (
              <option key={idx} value={catName}>
                {catName}
              </option>
            );
          })}
        </select>
      </div>

      {/* Maximum Price Range */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          Max Price: ₹{priceRange.toLocaleString('en-IN')}
        </span>
        <input
          type="range"
          min="200"
          max="15000"
          step="200"
          value={priceRange}
          onChange={(e) => onPriceRangeChange(Number(e.target.value))}
          style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
        />
      </div>

      {/* Minimum Rating */}
      <div style={{ minWidth: '150px' }}>
        <select
          className="form-select"
          value={minRating}
          onChange={(e) => onMinRatingChange(Number(e.target.value))}
        >
          <option value="0">All Ratings</option>
          <option value="4.5">★ 4.5 & above</option>
          <option value="4.0">★ 4.0 & above</option>
          <option value="3.5">★ 3.5 & above</option>
        </select>
      </div>

      {/* Sorting options */}
      <div style={{ minWidth: '180px', marginLeft: 'auto' }}>
        <select
          className="form-select"
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
        >
          <option value="default">Sort by: Default</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Top Rated</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {/* Reset button */}
      <button className="btn btn-outline btn-sm" onClick={onReset} type="button">
        Reset Filters
      </button>
    </div>
  );
}
