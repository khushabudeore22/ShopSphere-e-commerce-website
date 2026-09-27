import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Rating from "./Rating";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/formatPrice";
import api from "../services/api";
import toast from "react-hot-toast";

export default function ProductCard({
  product,
  onAddToCart,
  onRemoveFromWishlist,
  isWishlistMode = false,
}) {
  const { addToCart } = useCart();

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const prodId = product?._id || product?.id;

  // --------------------------------------------------
  // CHECK LOCAL WISHLIST STATUS
  // --------------------------------------------------
  useEffect(() => {
    try {
      const saved = localStorage.getItem("shopsphere_wishlist");

      if (saved) {
        const list = JSON.parse(saved);

        const exists = list.some(
          (item) =>
            String(item._id || item.id) === String(prodId)
        );

        setIsWishlisted(exists);
      }
    } catch (error) {
      console.error("Wishlist local storage error:", error);
    }
  }, [prodId]);

  // --------------------------------------------------
  // SAVE WISHLIST TO LOCAL STORAGE
  // --------------------------------------------------
  const saveWishlistLocally = (list) => {
    localStorage.setItem(
      "shopsphere_wishlist",
      JSON.stringify(list)
    );
  };

  // --------------------------------------------------
  // ADD / REMOVE WISHLIST
  // --------------------------------------------------
  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!prodId) {
      toast.error("Product ID is missing");
      return;
    }

    const token = localStorage.getItem(
      "shopsphere_token"
    );

    // User must login
    if (!token) {
      toast.error("Please login to use wishlist");
      return;
    }

    if (wishlistLoading) return;

    try {
      setWishlistLoading(true);

      // ============================================
      // REMOVE FROM WISHLIST
      // ============================================
      if (isWishlisted || isWishlistMode) {
        await api.delete(
          `/wishlist/${prodId}`
        );

        setIsWishlisted(false);

        // Update local storage
        try {
          const saved =
            localStorage.getItem(
              "shopsphere_wishlist"
            );

          const list = saved
            ? JSON.parse(saved)
            : [];

          const updated = list.filter(
            (item) =>
              String(item._id || item.id) !==
              String(prodId)
          );

          saveWishlistLocally(updated);
        } catch (error) {
          console.error(
            "Local wishlist update error:",
            error
          );
        }

        toast.success(
          `${product.name} removed from wishlist`
        );

        // If this is Wishlist page,
        // notify parent component
        if (
          isWishlistMode &&
          onRemoveFromWishlist
        ) {
          onRemoveFromWishlist(prodId);
        }

        return;
      }

      // ============================================
      // ADD TO WISHLIST
      // ============================================
      const response = await api.post(
        "/wishlist",
        {
          productId: prodId,
        }
      );

      console.log(
        "Wishlist response:",
        response.data
      );

      setIsWishlisted(true);

      // Update local storage
      try {
        const saved =
          localStorage.getItem(
            "shopsphere_wishlist"
          );

        let list = saved
          ? JSON.parse(saved)
          : [];

        const alreadyExists = list.some(
          (item) =>
            String(item._id || item.id) ===
            String(prodId)
        );

        if (!alreadyExists) {
          list.push(product);
        }

        saveWishlistLocally(list);
      } catch (error) {
        console.error(
          "Local wishlist save error:",
          error
        );
      }

      toast.success(
        `${product.name} added to wishlist ❤️`
      );
    } catch (error) {
      console.error(
        "WISHLIST ERROR:",
        error
      );

      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );

      // Handle authentication error
      if (error.response?.status === 401) {
        toast.error(
          "Session expired. Please login again."
        );

        localStorage.removeItem(
          "shopsphere_token"
        );

        localStorage.removeItem(
          "shopsphere_user"
        );

        return;
      }

      // Product not found
      if (error.response?.status === 404) {
        toast.error(
          error.response?.data?.message ||
            "Product not found"
        );

        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Unable to update wishlist"
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  // --------------------------------------------------
  // CART
  // --------------------------------------------------
  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addToCart(product, 1);
    }
  };

  // --------------------------------------------------
  // DISCOUNT
  // --------------------------------------------------
  const discount =
    product.discount ||
    (product.originalPrice &&
    product.price &&
    product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice -
            product.price) /
            product.originalPrice) *
            100
        )
      : 0);

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div className="product-card">

      {/* PRODUCT IMAGE */}
      <div className="product-card-image-wrap">

        <Link
          to={`/products/${prodId}`}
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <img
            src={
              product.image ||
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80"
            }
            alt={product.name}
            className="product-card-image"
            loading="lazy"
          />

          {discount > 0 && (
            <span className="product-badge">
              -{discount}% OFF
            </span>
          )}
        </Link>

        {/* WISHLIST BUTTON */}
        <button
          type="button"
          className={`product-wishlist-btn ${
            isWishlisted || isWishlistMode
              ? "active"
              : ""
          }`}
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          title={
            isWishlisted || isWishlistMode
              ? "Remove from Wishlist"
              : "Add to Wishlist"
          }
        >
          {wishlistLoading
            ? "⏳"
            : isWishlisted || isWishlistMode
            ? "❤️"
            : "🤍"}
        </button>
      </div>

      {/* PRODUCT INFORMATION */}
      <Link
        to={`/products/${prodId}`}
        style={{
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <div className="product-card-body">

          <span className="product-category">
            {product.category || "General"}
          </span>

          <h3
            className="product-title"
            title={product.name}
          >
            {product.name}
          </h3>

          <Rating
            value={product.rating || 0}
            numReviews={product.numReviews || 0}
          />

          <div className="product-price-row">

            <span className="product-price">
              {formatPrice(product.price)}
            </span>

            {product.originalPrice > product.price && (
              <span className="product-original-price">
                {formatPrice(product.originalPrice)}
              </span>
            )}

            {discount > 0 && (
              <span className="product-discount">
                {discount}% off
              </span>
            )}

          </div>
        </div>
      </Link>

      {/* FOOTER */}
      <div className="product-card-footer">

        {isWishlistMode ? (
          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >

            <button
              className="btn btn-primary btn-sm btn-block"
              onClick={handleCartClick}
            >
              🛒 Move to Cart
            </button>

            <button
              className="btn btn-outline btn-sm"
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
            >
              Remove
            </button>

          </div>
        ) : (
          <button
            className="btn btn-primary btn-block btn-sm"
            onClick={handleCartClick}
          >
            🛒 Add to Cart
          </button>
        )}

      </div>
    </div>
  );
}