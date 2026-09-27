import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Rating from '../../components/Rating';
import ReviewCard from '../../components/ReviewCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/formatPrice';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      setLoading(true);
      try {
        const [prodRes, revRes] = await Promise.allSettled([
          api.get(`/products/${id}`),
          api.get(`/products/${id}/reviews`),
        ]);

        if (prodRes.status === 'fulfilled' && (prodRes.value.data?.product || prodRes.value.data)) {
          setProduct(prodRes.value.data.product || prodRes.value.data);
        } else {
          setProduct(null);
        }

        if (revRes.status === 'fulfilled' && Array.isArray(revRes.value.data)) {
          setReviews(revRes.value.data);
        } else if (revRes.status === 'fulfilled' && revRes.value.data?.reviews) {
          setReviews(revRes.value.data.reviews);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.warn('API error in product details:', err?.message);
        setProduct(null);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndReviews();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, qty);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to submit a review');
      return;
    }
    if (!reviewComment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    setSubmittingReview(true);
    try {
      const { data } = await api.post(`/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      if (data.review) {
        setReviews([data.review, ...reviews]);
        if (product) {
          // Update displayed product rating
          const updatedNum = (product.numReviews || 0) + 1;
          const updatedRating = Number(
            (((product.rating || 5) * (product.numReviews || 0) + reviewRating) / updatedNum).toFixed(1)
          );
          setProduct({ ...product, numReviews: updatedNum, rating: updatedRating });
        }
      }
      setReviewComment('');
      toast.success('Review submitted and saved to database!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <Navbar />
        <main className="main-content">
          <Loading message="Loading product information..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-container">
        <Navbar />
        <main className="main-content">
          <EmptyState
            title="Product Not Found"
            description="The product you are looking for might have been removed or does not exist."
            icon="⚠️"
            actionText="Back to Products"
            actionLink="/products"
          />
        </main>
        <Footer />
      </div>
    );
  }

  const discount = product.discount || (
    product.originalPrice && product.price && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0
  );

  const stock = product.stock !== undefined ? product.stock : 15;
  const inStock = stock > 0;

  return (
    <div className="page-container">
      <Navbar />

      <main className="main-content">
        {/* BREADCRUMB */}
        <div style={{ marginBottom: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <Link to="/">Home</Link> &nbsp;/&nbsp;
          <Link to="/products">Products</Link> &nbsp;/&nbsp;
          <Link to={`/products?category=${encodeURIComponent(product.category || '')}`}>
            {product.category || 'General'}
          </Link> &nbsp;/&nbsp;
          <span style={{ color: 'var(--dark)', fontWeight: 600 }}>{product.name}</span>
        </div>

        {/* MAIN PRODUCT DETAIL CARD */}
        <div className="product-details-container">
          {/* PRODUCT GALLERY */}
          <div className="product-gallery">
            <div className="main-image-wrap">
              <img
                src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80'}
                alt={product.name}
              />
            </div>
          </div>

          {/* PRODUCT INFO */}
          <div className="product-info">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="product-brand-tag">{product.brand || 'ShopSphere Collection'}</span>
              <span className={`product-stock-tag ${inStock ? 'in-stock' : 'out-of-stock'}`}>
                {inStock ? `● In Stock (${stock} available)` : '● Currently Out of Stock'}
              </span>
            </div>

            <h1 style={{ fontSize: '1.85rem', color: 'var(--dark)' }}>{product.name}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Rating value={product.rating || 4.8} numReviews={product.numReviews || reviews.length} />
              <span style={{ color: 'var(--text-light)' }}>|</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Category: <strong>{product.category || 'General'}</strong>
              </span>
            </div>

            <div className="product-price-row" style={{ marginTop: '10px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--dark)' }}>
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="product-original-price" style={{ fontSize: '1.2rem' }}>
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="badge badge-success" style={{ fontSize: '0.85rem' }}>
                  Save {discount}% OFF
                </span>
              )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />

            <div>
              <h4 style={{ marginBottom: '8px', color: 'var(--dark)' }}>Product Overview</h4>
              <p style={{ lineHeight: '1.7', color: 'var(--text-muted)' }}>
                {product.description || 'No detailed description available for this product.'}
              </p>
            </div>

            {/* QUANTITY & ACTIONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontWeight: 600, color: 'var(--dark)' }}>Quantity:</span>
                <div className="quantity-control">
                  <button
                    className="qty-btn"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={qty <= 1}
                  >
                    -
                  </button>
                  <span className="qty-input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {qty}
                  </span>
                  <button
                    className="qty-btn"
                    onClick={() => setQty(Math.min(stock, qty + 1))}
                    disabled={qty >= stock}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="product-actions">
                <button
                  className="btn btn-primary btn-lg"
                  style={{ flex: 2 }}
                  onClick={handleAddToCart}
                  disabled={!inStock}
                >
                  🛒 {inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
                <Link to="/cart" className="btn btn-accent btn-lg" style={{ flex: 1 }}>
                  View Cart →
                </Link>
              </div>
            </div>

            {/* ASSURANCES */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-color)',
                textAlign: 'center',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
              }}
            >
              <div>⚡ Fast Delivery</div>
              <div>🔒 Secure Payments</div>
              <div>🔄 7-Day Easy Return</div>
            </div>
          </div>
        </div>

        {/* CUSTOMER REVIEWS SECTION */}
        <section className="reviews-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Customer Reviews & Ratings</h2>
              <p className="section-subtitle">Real experiences shared by verified ShopSphere shoppers</p>
            </div>
          </div>

          {/* WRITE A REVIEW */}
          <div
            style={{
              background: '#F8FAFC',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              marginBottom: '32px',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', color: 'var(--dark)' }}>
              Write a Product Review
            </h3>
            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label className="form-label">Rating</label>
                <select
                  className="form-select"
                  style={{ maxWidth: '200px' }}
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                >
                  <option value="5">★★★★★ (5 Stars - Outstanding)</option>
                  <option value="4">★★★★☆ (4 Stars - Very Good)</option>
                  <option value="3">★★★☆☆ (3 Stars - Average)</option>
                  <option value="2">★★☆☆☆ (2 Stars - Disappointed)</option>
                  <option value="1">★☆☆☆☆ (1 Star - Poor)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Your Review Comment</label>
                <textarea
                  className="form-textarea"
                  placeholder="Share your experience regarding build quality, value for money, and delivery..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows="3"
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={submittingReview}
              >
                {submittingReview ? 'Submitting Review...' : 'Submit Review'}
              </button>
            </form>
          </div>

          {/* REVIEWS LIST */}
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                No reviews yet. Be the first to review this product!
              </p>
            ) : (
              reviews.map((rev, index) => (
                <ReviewCard key={rev._id || rev.id || index} review={rev} />
              ))
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
