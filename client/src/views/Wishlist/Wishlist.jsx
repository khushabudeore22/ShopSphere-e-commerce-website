import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import EmptyState from "../../components/EmptyState";
import Loading from "../../components/Loading";
import { useCart } from "../../context/CartContext";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();

  /*
  =====================================================
  FETCH WISHLIST FROM MONGODB
  =====================================================
  */

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem(
        "shopsphere_token"
      );

      if (!token) {
        setWishlist([]);

        toast.error(
          "Please login to view your wishlist"
        );

        return;
      }

      const response = await api.get(
        "/wishlist"
      );

      console.log(
        "Wishlist from backend:",
        response.data
      );

      if (
        response.data &&
        Array.isArray(response.data.products)
      ) {
        setWishlist(
          response.data.products
        );
      } else {
        setWishlist([]);
      }
    } catch (error) {
      console.error(
        "Wishlist fetch error:",
        error
      );

      setWishlist([]);

      toast.error(
        error.response?.data?.message ||
          "Unable to load wishlist"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  =====================================================
  REMOVE PRODUCT FROM WISHLIST
  =====================================================
  */

  const handleRemoveFromWishlist =
    async (productId) => {
      try {
        if (!productId) {
          toast.error(
            "Product ID is missing"
          );
          return;
        }

        await api.delete(
          `/wishlist/${productId}`
        );

        /*
        Remove from screen immediately
        */

        setWishlist((previous) =>
          previous.filter(
            (product) =>
              product._id !== productId
          )
        );

        toast.success(
          "Product removed from wishlist"
        );
      } catch (error) {
        console.error(
          "Remove wishlist error:",
          error
        );

        toast.error(
          error.response?.data?.message ||
            "Unable to remove product"
        );
      }
    };

  /*
  =====================================================
  ADD PRODUCT TO CART
  =====================================================
  */

  const handleAddToCart = (product) => {
    addToCart(product, 1);

    toast.success(
      `${product.name} added to cart`
    );
  };

  /*
  =====================================================
  LOADING
  =====================================================
  */

  if (loading) {
    return (
      <div className="page-container">
        <Navbar />

        <main className="main-content">
          <Loading message="Loading wishlist items..." />
        </main>

        <Footer />
      </div>
    );
  }

  /*
  =====================================================
  PAGE
  =====================================================
  */

  return (
    <div className="page-container">
      <Navbar />

      <main className="main-content">

        {/* HEADER */}

        <div className="section-header">
          <div>

            <h1 className="section-title">
              My Wishlist
            </h1>

            <p className="section-subtitle">
              Products you saved for later (
              {wishlist.length}{" "}
              {wishlist.length === 1
                ? "item"
                : "items"}
              )
            </p>

          </div>
        </div>

        {/* EMPTY */}

        {wishlist.length === 0 ? (

          <EmptyState
            title="Your Wishlist is Empty"
            description="Explore our wide range of products and click the heart icon on items you love!"
            icon="🤍"
            actionText="Discover Products"
            actionLink="/products"
          />

        ) : (

          /* PRODUCTS */

          <div className="products-grid">

            {wishlist.map((product) => (

              <ProductCard
                key={product._id}
                product={product}
                isWishlistMode={true}
                onAddToCart={() =>
                  handleAddToCart(product)
                }
                onRemoveFromWishlist={() =>
                  handleRemoveFromWishlist(
                    product._id
                  )
                }
              />

            ))}

          </div>

        )}

      </main>

      <Footer />
    </div>
  );
}