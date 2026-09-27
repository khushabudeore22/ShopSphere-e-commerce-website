import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Hero from '../../components/Hero';
import Categories from '../../components/Categories';
import FeaturedProducts from '../../components/FeaturedProducts';
import Loading from '../../components/Loading';
import api from '../../services/api';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.allSettled([
          api.get('/products'),
          api.get('/categories'),
        ]);

        let fetchedProds = [];
        if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value.data)) {
          fetchedProds = prodRes.value.data;
          setProducts(fetchedProds);
        } else if (prodRes.status === 'fulfilled' && prodRes.value.data?.products) {
          fetchedProds = prodRes.value.data.products;
          setProducts(fetchedProds);
        } else {
          setProducts([]);
        }

        if (catRes.status === 'fulfilled' && catRes.value.data?.categories?.length > 0) {
          setCategories(catRes.value.data.categories);
        } else if (catRes.status === 'fulfilled' && Array.isArray(catRes.value.data) && catRes.value.data.length > 0) {
          setCategories(catRes.value.data);
        } else if (fetchedProds.length > 0) {
          const uniqueCats = [...new Set(fetchedProds.map((p) => p.category).filter(Boolean))].map((c) => ({
            name: c,
            icon: '🛍️',
            description: 'Explore Collection',
          }));
          setCategories(uniqueCats);
        }
      } catch (err) {
        console.warn('Error fetching home data:', err?.message);
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const featured = products.filter((p) => p.featured) || [];
  const displayFeatured = featured.length > 0 ? featured : products.slice(0, 4);

  return (
    <div className="page-container">
      <Navbar />

      <main className="main-content-full">
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
          {/* HERO SECTION */}
          <Hero />

          {/* CATEGORIES SECTION */}
          <Categories categories={categories} />

          {/* FEATURED PRODUCTS SECTION */}
          {loading ? (
            <Loading message="Loading featured products..." />
          ) : (
            <FeaturedProducts
              title="Featured Collection"
              subtitle="Handpicked top quality items at unbeatable value"
              products={displayFeatured}
            />
          )}

          {/* PROMOTIONAL BANNER */}
          <section className="promo-banner">
            <div>
              <span className="badge badge-warning" style={{ marginBottom: '8px' }}>
                Limited Time
              </span>
              <h2 style={{ color: '#FFFFFF', fontSize: '2rem', marginBottom: '8px' }}>
                Get 20% Off Your First Order!
              </h2>
              <p style={{ color: '#CBD5E1', maxWidth: '500px' }}>
                Use code <strong>SPHERE20</strong> at checkout and enjoy lightning-fast nationwide delivery.
              </p>
            </div>
            <a href="/products" className="btn btn-accent btn-lg">
              Explore Deals →
            </a>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
