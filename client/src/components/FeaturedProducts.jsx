import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ProductCard from "./ProductCard";
import Loading from "./Loading";

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products");

      console.log("Featured products response:", response.data);

      // Backend returns an ARRAY directly
      const allProducts = Array.isArray(response.data)
        ? response.data
        : response.data.products || [];

      // Show products marked featured
      const featuredProducts = allProducts.filter(
        (product) => product.featured === true
      );

      // If no products are marked featured,
      // show the first 4 products
      setProducts(
        featuredProducts.length > 0
          ? featuredProducts.slice(0, 4)
          : allProducts.slice(0, 4)
      );
    } catch (error) {
      console.error(
        "FEATURED PRODUCTS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load featured products."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="featured-section">
        <div className="section-header">
          <h2>Featured Collection</h2>
          <p>
            Handpicked top quality items at unbeatable value
          </p>
        </div>

        <Loading message="Loading products..." />
      </section>
    );
  }

  return (
    <section className="featured-section">

      <div className="section-header">
        <div>
          <h2>Featured Collection</h2>
          <p>
            Handpicked top quality items at unbeatable value
          </p>
        </div>

        <Link
          to="/products"
          className="view-all-link"
        >
          View All →
        </Link>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!error && products.length === 0 && (
        <div className="empty-products">
          <h3>No featured products found</h3>
          <p>
            Add products from Postman or MongoDB Compass.
          </p>

          <Link
            to="/products"
            className="btn btn-primary"
          >
            View Products
          </Link>
        </div>
      )}

      {products.length > 0 && (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
            />
          ))}
        </div>
      )}

    </section>
  );
}