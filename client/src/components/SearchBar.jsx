import React from 'react';

export default function SearchBar({ value, onChange, placeholder = "Search for items, brands, or categories..." }) {
  return (
    <div className="search-input-wrap" style={{ maxWidth: '400px' }}>
      <input
        type="text"
        className="form-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="search-icon">🔍</span>
    </div>
  );
}
