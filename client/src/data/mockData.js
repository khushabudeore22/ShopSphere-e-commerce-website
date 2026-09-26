export const mockCategories = [
  { id: 'electronics', name: 'Electronics', icon: '📱', count: '120+ Products' },
  { id: 'fashion', name: 'Fashion & Apparel', icon: '👕', count: '350+ Products' },
  { id: 'home', name: 'Home & Kitchen', icon: '🏠', count: '180+ Products' },
  { id: 'beauty', name: 'Beauty & Personal Care', icon: '✨', count: '90+ Products' },
  { id: 'sports', name: 'Sports & Fitness', icon: '⚽', count: '75+ Products' },
  { id: 'books', name: 'Books & Stationery', icon: '📚', count: '200+ Products' }
];

export const mockProducts = [
  {
    id: '1',
    name: 'Wireless Noise-Cancelling Headphones Pro',
    category: 'Electronics',
    brand: 'SoundPulse',
    price: 3499,
    originalPrice: 4999,
    discount: 30,
    rating: 4.8,
    numReviews: 128,
    stock: 25,
    featured: true,
    isNew: true,
    active: true,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    description: 'Experience pure acoustic bliss with premium active noise cancellation, 40-hour battery life, and ultra-comfortable ear cushions.'
  },
  {
    id: '2',
    name: 'Ultra-Slim Fitness Smartwatch GPS',
    category: 'Electronics',
    brand: 'FitTrack',
    price: 2499,
    originalPrice: 3999,
    discount: 37,
    rating: 4.6,
    numReviews: 94,
    stock: 18,
    featured: true,
    isNew: true,
    active: true,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    description: 'Track your daily activity, heart rate, sleep quality, and workouts with real-time GPS and a crystal-clear AMOLED display.'
  },
  {
    id: '3',
    name: 'Classic Casual Denim Jacket',
    category: 'Fashion & Apparel',
    brand: 'UrbanVibe',
    price: 1899,
    originalPrice: 2999,
    discount: 36,
    rating: 4.5,
    numReviews: 76,
    stock: 14,
    featured: true,
    isNew: false,
    active: true,
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80',
    description: 'Timeless style meets modern comfort. Crafted with 100% durable cotton denim with tailored fit and buttoned cuffs.'
  },
  {
    id: '4',
    name: 'Ergonomic Memory Foam Office Chair',
    category: 'Home & Kitchen',
    brand: 'ErgoComfort',
    price: 6499,
    originalPrice: 8999,
    discount: 27,
    rating: 4.9,
    numReviews: 210,
    stock: 8,
    featured: true,
    isNew: false,
    active: true,
    image: 'https://images.unsplash.com/photo-1580481077198-4c2826649f83?w=600&auto=format&fit=crop&q=80',
    description: 'All-day comfort with adjustable lumbar support, 3D armrests, breathable mesh back, and smooth-gliding rollerblade wheels.'
  },
  {
    id: '5',
    name: 'Organic Vitamin C Radiant Glow Serum',
    category: 'Beauty & Personal Care',
    brand: 'GlowPure',
    price: 799,
    originalPrice: 1299,
    discount: 38,
    rating: 4.7,
    numReviews: 185,
    stock: 40,
    featured: false,
    isNew: true,
    active: true,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
    description: 'Brighten skin and boost collagen with pure cold-pressed vitamin C, hyaluronic acid, and botanical extracts.'
  },
  {
    id: '6',
    name: 'Stainless Steel Insulated Water Bottle (1L)',
    category: 'Sports & Fitness',
    brand: 'HydroSteel',
    price: 699,
    originalPrice: 1199,
    discount: 41,
    rating: 4.8,
    numReviews: 112,
    stock: 32,
    featured: false,
    isNew: false,
    active: true,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
    description: 'Double-wall vacuum insulation keeps drinks ice cold for 24 hours or piping hot for 12 hours. Leakproof spout lid.'
  }
];

export const mockReviews = [
  {
    id: 'r1',
    userName: 'Rohan Sharma',
    rating: 5,
    date: '2026-09-15',
    comment: 'Exceptional build quality! Exceeded my expectations. Delivery was lightning fast.'
  },
  {
    id: 'r2',
    userName: 'Priya Patel',
    rating: 4,
    date: '2026-09-10',
    comment: 'Great value for money. Looks exactly like the picture. Very satisfied with the purchase!'
  },
  {
    id: 'r3',
    userName: 'Amit Verma',
    rating: 5,
    date: '2026-08-28',
    comment: 'One of the best purchases I have made on ShopSphere. Highly recommended!'
  }
];
