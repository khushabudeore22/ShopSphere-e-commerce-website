import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProductList from '../../components/ProductList';
import FilterBar from '../../components/FilterBar';
import SearchBar from '../../components/SearchBar';
import Loading from '../../components/Loading';
import api from '../../services/api';
import { mockProducts, mockCategories } from '../../data/mockData';

export default function Product() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(mockCategories);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState(10000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('default');

  // Sync searchParams when URL changes
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    }
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null) {
      setSearchTerm(urlSearch);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.allSettled([
          api.get('/products'),
          api.get('/categories'),
        ]);

        if (prodRes.status === 'fulfilled' && prodRes.value.data?.products) {
          setProducts(prodRes.value.data.products);
        } else if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value.data)) {
          setProducts(prodRes.value.data);
        } else {
          setProducts(mockProducts);
        }

        if (catRes.status === 'fulfilled' && catRes.value.data?.categories) {
          setCategories(catRes.value.data.categories);
        } else if (catRes.status === 'fulfilled' && Array.isArray(catRes.value.data)) {
          setCategories(catRes.value.data);
        }
      } catch (err) {
        console.warn('API error, falling back to mock data:', err?.message);
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndCategories();
  }, []);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    if (term) {
      searchParams.set('search', term);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setPriceRange(10000);
    setMinRating(0);
    setSortBy('default');
    setSearchParams({});
  };

  // Filter & Sort logic
  const filteredProducts = products
    .filter((product) => {
      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = product.name?.toLowerCase().includes(query);
        const matchesCat = product.category?.toLowerCase().includes(query);
        const matchesBrand = product.brand?.toLowerCase().includes(query);
        const matchesDesc = product.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesCat && !matchesBrand && !matchesDesc) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'All') {
        const prodCat = product.category?.toLowerCase() || '';
        const targetCat = selectedCategory.toLowerCase();
        if (!prodCat.includes(targetCat) && !targetCat.includes(prodCat)) {
          return false;
        }
      }

      // Price filter
      if (product.price && product.price > priceRange) {
        return false;
      }

      // Rating filter
      if (minRating > 0 && (product.rating || 0) < minRating) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') {
        return (a.price || 0) - (b.price || 0);
      }
      if (sortBy === 'price-high') {
        return (b.price || 0) - (a.price || 0);
      }
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      return 0;
    });

  return (
    <div className="page-container">
      <Navbar />

      <main className="main-content">
        <div className="section-header">
          <div>
            <h1 className="section-title">Browse All Products</h1>
            <p className="section-subtitle">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>

          <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by name, brand, or tag..."
          />
        </div>

        {/* FILTERS AND SORTING */}
        <FilterBar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          minRating={minRating}
          onMinRatingChange={setMinRating}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          onReset={handleResetFilters}
        />

        {/* PRODUCTS GRID */}
        {loading ? (
          <Loading message="Loading catalog..." />
        ) : (
          <ProductList products={filteredProducts} />
        )}
      </main>

      <Footer />
    </div>
  );
}
