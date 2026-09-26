import React from 'react';

export default function FilterBar({
  categories = [],
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  minRating,
  onMinRatingChange,
  sortBy,
  onSortByChange,
  onReset
}) {
  return (
    <div className="filter-bar">
      {/* Category dropdown */}
      <div style={{ minWidth: '180px' }}>
        <select
          className="form-select"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id || cat} value={cat.name || cat}>
              {cat.name || cat}
            </option>
          ))}
        </select>
      </div>

      {/* Max Price filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          Max Price: ₹{priceRange}
        </span>
        <input
          type="range"
          min="500"
          max="10000"
          step="500"
          value={priceRange}
          onChange={(e) => onPriceRangeChange(Number(e.target.value))}
          style={{ cursor: 'pointer' }}
        />
      </div>

      {/* Rating filter */}
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

      {/* Sort By dropdown */}
      <div style={{ minWidth: '180px', marginLeft: 'auto' }}>
        <select
          className="form-select"
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
        >
          <option value="default">Sort: Default</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {/* Reset button */}
      <button className="btn btn-outline btn-sm" onClick={onReset}>
        Reset Filters
      </button>
    </div>
  );
}
