import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProductList from '../../components/ProductList';
import FilterBar from '../../components/FilterBar';
import SearchBar from '../../components/SearchBar';
import Loading from '../../components/Loading';
import api from '../../services/api';

export default function Product() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState(100000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('default');

  // Sync searchParams when URL changes
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    setSelectedCategory(urlCategory || 'All');

    const urlSearch = searchParams.get('search');
    setSearchTerm(urlSearch || '');
  }, [searchParams]);

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.allSettled([
          api.get('/products'),
          api.get('/categories'),
        ]);

        console.log("PRODUCT API RESPONSE:", prodRes.status === 'fulfilled' ? prodRes.value.data : prodRes.reason);

        let fetchedProducts = [];
        if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value.data)) {
          fetchedProducts = prodRes.value.data;
          setProducts(fetchedProducts);
        } else if (prodRes.status === 'fulfilled' && prodRes.value.data?.products) {
          fetchedProducts = prodRes.value.data.products;
          setProducts(fetchedProducts);
        } else {
          setProducts([]);
        }

        if (catRes.status === 'fulfilled' && catRes.value.data?.categories?.length > 0) {
          setCategories(catRes.value.data.categories);
        } else if (catRes.status === 'fulfilled' && Array.isArray(catRes.value.data) && catRes.value.data.length > 0) {
          setCategories(catRes.value.data);
        } else if (fetchedProducts.length > 0) {
          // Extract unique categories from fetched products
          const uniqueCats = [...new Set(fetchedProducts.map((p) => p.category).filter(Boolean))].map((c) => ({
            name: c,
          }));
          if (uniqueCats.length > 0) {
            setCategories(uniqueCats);
          }
        }
      } catch (err) {
        console.warn('API error fetching products:', err?.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndCategories();
  }, []);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat && cat !== 'All') {
      newParams.set('category', cat);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    const newParams = new URLSearchParams(searchParams);
    if (term && term.trim()) {
      newParams.set('search', term);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setPriceRange(100000);
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
        const prodCat = (product.category || '').toLowerCase();
        const targetCat = selectedCategory.toLowerCase();
        if (!prodCat.includes(targetCat) && !targetCat.includes(prodCat)) {
          return false;
        }
      }

      // Price filter
      const numPrice = Number(product.price);
      if (!isNaN(numPrice) && numPrice > priceRange) {
        return false;
      }

      // Rating filter
      const numRating = Number(product.rating || 0);
      if (minRating > 0 && numRating < minRating) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') {
        return (Number(a.price) || 0) - (Number(b.price) || 0);
      }
      if (sortBy === 'price-high') {
        return (Number(b.price) || 0) - (Number(a.price) || 0);
      }
      if (sortBy === 'rating') {
        return (Number(b.rating) || 0) - (Number(a.rating) || 0);
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
          <ProductList products={filteredProducts} onReset={handleResetFilters} />
        )}
      </main>

      <Footer />
    </div>
  );
}
