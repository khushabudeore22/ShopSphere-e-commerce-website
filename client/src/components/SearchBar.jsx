import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search for products, brands, or categories...',
  compact = false,
}) {
  const [internalTerm, setInternalTerm] = useState('');
  const navigate = useNavigate();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const term = value !== undefined ? value : internalTerm;
      if (compact && term.trim()) {
        navigate(`/products?search=${encodeURIComponent(term.trim())}`);
      }
    }
  };

  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    } else {
      setInternalTerm(e.target.value);
    }
  };

  const currentValue = value !== undefined ? value : internalTerm;

  return (
    <div className="search-input-wrap" style={{ maxWidth: compact ? '320px' : '500px' }}>
      <input
        type="text"
        className="form-input"
        placeholder={placeholder}
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <span className="search-icon">🔍</span>
    </div>
  );
}
