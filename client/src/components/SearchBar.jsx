import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search for products, brands, or categories...',
  compact = false,
}) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const urlSearchTerm = searchParams.get('search') || '';
  const [internalTerm, setInternalTerm] = useState(value !== undefined ? value : urlSearchTerm);

  useEffect(() => {
    if (value !== undefined) {
      setInternalTerm(value);
    } else {
      setInternalTerm(urlSearchTerm);
    }
  }, [value, urlSearchTerm]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const term = (value !== undefined ? value : internalTerm) || '';

    if (compact || location.pathname !== '/products') {
      if (term.trim()) {
        navigate(`/products?search=${encodeURIComponent(term.trim())}`);
      } else {
        navigate('/products');
      }
    } else {
      if (onChange) {
        onChange(term);
      }
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setInternalTerm(val);
    if (onChange) {
      onChange(val);
    }
  };

  const handleClear = () => {
    setInternalTerm('');
    if (onChange) {
      onChange('');
    } else if (compact && location.pathname === '/products') {
      navigate('/products');
    }
  };

  const currentValue = value !== undefined ? value : internalTerm;

  return (
    <form
      onSubmit={handleSubmit}
      className="search-input-wrap"
      style={{ maxWidth: compact ? '450px' : '500px', margin: 0 }}
    >
      <input
        type="text"
        className="form-input"
        placeholder={placeholder}
        value={currentValue}
        onChange={handleChange}
      />
      <button
        type="submit"
        className="search-icon"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Search"
      >
        🔍
      </button>
      {currentValue && (
        <button
          type="button"
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-light, #94a3b8)',
            fontSize: '1rem',
            padding: '2px 6px',
          }}
          title="Clear search"
        >
          ✕
        </button>
      )}
    </form>
  );
}
