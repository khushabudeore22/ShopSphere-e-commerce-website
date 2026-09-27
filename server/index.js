import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import User from './models/user.js';
import Product from './models/product.js';
import Category from './models/category.js';
import Review from './models/review.js';
import Order from './models/order.js';
import Cart from './models/cart.js';
import Wishlist from './models/wishlist.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'shopsphere_super_secret_jwt_key_2026';

// Helper: Generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '30d' });
};

// Middleware: Authentication
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  return res.status(401).json({ success: false, message: 'Not authorized, no token' });
};

// Middleware: Admin Only
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied: Admin role required' });
};

// Seed Function
const seedInitialData = async () => {
  try {

    const adminUser = await User.findOne({ email: 'admin@shopsphere.com' });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'ShopSphere Admin',
        email: 'admin@shopsphere.com',
        password: hashedPassword,
        role: 'admin',
        phone: '+91 9876543210',
        address: 'ShopSphere Headquarters, Nashik, India',
      });
      console.log('Created default admin account (admin@shopsphere.com / admin123)');
    }

    const demoUser = await User.findOne({ email: 'user@shopsphere.com' });
    if (!demoUser) {
      const hashedUserPass = await bcrypt.hash('123456', 10);
      await User.create({
        name: 'Demo User',
        email: 'user@shopsphere.com',
        password: hashedUserPass,
        role: 'user',
        phone: '+91 9876543211',
        address: '123 College Road, Nashik, India',
      });
      console.log('Created default user account (user@shopsphere.com / 123456)');
    }
  } catch (err) {
    console.warn('Seed check error:', err.message);
  }
};

// Database Connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('MONGO_URI is not set in .env');
      return;
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    if (conn) {
      console.log('MongoDB connected successfully');
      await seedInitialData();
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
  }
};

/* ==========================================================================
   USER ROUTES
   ========================================================================== */

// POST /api/users/register
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      address: address || '',
      role: 'user',
    });

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/users/login
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'This account has been deactivated' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/profile
app.get('/api/users/profile', protect, async (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      _id: req.user._id,
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      address: req.user.address,
      role: req.user.role,
      isActive: req.user.isActive,
    },
  });
});

// PUT /api/users/profile
app.put('/api/users/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.address = req.body.address !== undefined ? req.body.address : user.address;

    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      user: {
        _id: updatedUser._id,
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/* ==========================================================================
   PRODUCT ROUTES
   ========================================================================== */

// GET /api/products (and alias /api/product)
app.get(['/api/products', '/api/product'], async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(category, 'i') };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };

    let products = await Product.find(query).sort(sortOption);
    if (!products || products.length === 0) {
      try {
        const rawProducts = await mongoose.connection.db.collection('product').find(query).sort(sortOption).toArray();
        if (rawProducts && rawProducts.length > 0) {
          products = rawProducts;
        }
      } catch {
        // fallback
      }
    }

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/:id
app.get('/api/products/:id', async (req, res) => {
  try {
    let product;
    try {
      product = await Product.findById(req.params.id);
    } catch {
      // ignore
    }

    if (!product) {
      try {
        const { ObjectId } = mongoose.Types;
        const objId = ObjectId.isValid(req.params.id) ? new ObjectId(req.params.id) : req.params.id;
        product = await mongoose.connection.db.collection('product').findOne({
          $or: [{ _id: objId }, { _id: req.params.id }, { id: req.params.id }]
        });
      } catch {
        // ignore
      }
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/products
app.post('/api/products', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json({ success: true, product });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/products/:id
app.put('/api/products/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/products/:id
app.delete('/api/products/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/* ==========================================================================
   REVIEW ROUTES (PERSISTED IN MONGODB)
   ========================================================================== */

// GET /api/products/:id/reviews
app.get('/api/products/:id/reviews', async (req, res) => {
  try {
    const { ObjectId } = mongoose.Types;
    const prodIdObj = ObjectId.isValid(req.params.id) ? new ObjectId(req.params.id) : null;

    let query = {
      $or: [
        { product: req.params.id },
        ...(prodIdObj ? [{ product: prodIdObj }] : []),
      ],
    };

    let reviews = await Review.find(query)
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    if (!reviews || reviews.length === 0) {
      try {
        const rawReviews = await mongoose.connection.db
          .collection('reviews')
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();
        if (rawReviews && rawReviews.length > 0) {
          reviews = rawReviews;
        } else {
          const rawReviewSingular = await mongoose.connection.db
            .collection('review')
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();
          if (rawReviewSingular && rawReviewSingular.length > 0) {
            reviews = rawReviewSingular;
          }
        }
      } catch {
        // ignore
      }
    }

    return res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/products/:id/reviews
app.post('/api/products/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment, name } = req.body;
    if (!comment || !rating) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required' });
    }

    const { ObjectId } = mongoose.Types;
    const prodIdObj = ObjectId.isValid(req.params.id) ? new ObjectId(req.params.id) : null;

    let product = await Product.findById(req.params.id).catch(() => null);
    if (!product && prodIdObj) {
      product = await mongoose.connection.db
        .collection('product')
        .findOne({ _id: prodIdObj })
        .catch(() => null);
    }

    const reviewerName = req.user?.name || name || 'Verified Customer';

    const review = await Review.create({
      user: req.user._id,
      product: prodIdObj || req.params.id,
      name: reviewerName,
      rating: Number(rating),
      comment: comment.trim(),
    });

    // Update product rating and numReviews in MongoDB
    const allReviews = await Review.find({
      $or: [
        { product: req.params.id },
        ...(prodIdObj ? [{ product: prodIdObj }] : []),
      ],
    });

    const numReviews = allReviews.length;
    const avgRating = Number(
      (allReviews.reduce((acc, item) => item.rating + acc, 0) / numReviews).toFixed(1)
    );

    if (product) {
      if (product.save) {
        product.numReviews = numReviews;
        product.rating = avgRating;
        await product.save().catch(() => {});
      } else {
        await mongoose.connection.db.collection('product').updateOne(
          { _id: prodIdObj || product._id },
          { $set: { numReviews: numReviews, rating: avgRating } }
        ).catch(() => {});
      }
    }

    return res.status(201).json({ success: true, review });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

/* ==========================================================================
   CART ROUTES
   ========================================================================== */

// GET /api/cart
app.get('/api/cart', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    return res.status(200).json({ success: true, items: cart.items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/cart
app.post('/api/cart', protect, async (req, res) => {
  try {
    const { productId, qty = 1 } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].qty += Number(qty);
    } else {
      cart.items.push({ product: productId, qty: Number(qty) });
    }

    await cart.save();
    const updated = await Cart.findById(cart._id).populate('items.product');
    return res.status(200).json({ success: true, items: updated.items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/cart/:id
app.put('/api/cart/:id', protect, async (req, res) => {
  try {
    const { qty } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === req.params.id || item._id.toString() === req.params.id
    );

    if (itemIndex > -1) {
      if (qty <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].qty = Number(qty);
      }
      await cart.save();
    }

    const updated = await Cart.findById(cart._id).populate('items.product');
    return res.status(200).json({ success: true, items: updated.items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/cart/:id
app.delete('/api/cart/:id', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = cart.items.filter(
        (item) =>
          item.product.toString() !== req.params.id &&
          item._id.toString() !== req.params.id
      );
      await cart.save();
    }
    return res.status(200).json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/cart
app.delete('/api/cart', protect, async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    return res.status(200).json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/* ==========================================================================
   WISHLIST ROUTES
   ========================================================================== */

// GET /api/wishlist
app.get('/api/wishlist', protect, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    return res.status(200).json({ success: true, products: wishlist.products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/wishlist
app.post('/api/wishlist', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    const updated = await Wishlist.findById(wishlist._id).populate('products');
    return res.status(200).json({ success: true, products: updated.products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/wishlist/:id
app.delete('/api/wishlist/:id', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        (p) => p.toString() !== req.params.id
      );
      await wishlist.save();
    }
    return res.status(200).json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/* ==========================================================================
   ORDER ROUTES (WITH LOCATION TRACKING)
   ========================================================================== */

// POST /api/orders
app.post('/api/orders', protect, async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items specified' });
    }

    const trackingNumber = `SS-TRK-${Math.floor(100000 + Math.random() * 900000)}`;
    const initialLocation = 'ShopSphere Central Hub, Nashik';

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      paymentStatus: 'Pending',
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      orderStatus: 'Confirmed',
      trackingNumber,
      courierPartner: 'ShopSphere Express Courier',
      currentLocation: initialLocation,
      trackingHistory: [
        {
          status: 'Confirmed',
          location: initialLocation,
          description: 'Order confirmed and registered for dispatch',
          timestamp: new Date(),
        },
      ],
    });

    // Clear remote cart after order
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    return res.status(201).json({ success: true, order });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/orders
app.get('/api/orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders/:id
app.get('/api/orders/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/orders/:id/cancel
app.put('/api/orders/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot cancel this order in its current status' });
    }

    order.orderStatus = 'Cancelled';
    order.trackingHistory.push({
      status: 'Cancelled',
      location: order.currentLocation || 'Order Facility',
      description: 'Order was cancelled by customer',
      timestamp: new Date(),
    });

    await order.save();

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Helper: Guess Category Emoji / Icon
const getCategoryIcon = (name = '') => {
  const n = (name || '').toLowerCase();
  if (n.includes('elect') || n.includes('phone') || n.includes('headphone') || n.includes('audio') || n.includes('gadget') || n.includes('tech')) return '📱';
  if (n.includes('fash') || n.includes('cloth') || n.includes('apparel') || n.includes('wear') || n.includes('shirt')) return '👕';
  if (n.includes('beauty') || n.includes('cosmetic') || n.includes('skin') || n.includes('care')) return '✨';
  if (n.includes('home') || n.includes('kitchen') || n.includes('furnitur') || n.includes('decor')) return '🏠';
  if (n.includes('sport') || n.includes('fit') || n.includes('gym') || n.includes('outdoor')) return '⚽';
  if (n.includes('book') || n.includes('read') || n.includes('stationery') || n.includes('study')) return '📚';
  if (n.includes('access') || n.includes('bag') || n.includes('watch') || n.includes('jewelry') || n.includes('glasses')) return '🎒';
  if (n.includes('game') || n.includes('gaming') || n.includes('console')) return '🎮';
  if (n.includes('toy') || n.includes('kid') || n.includes('baby')) return '🧸';
  if (n.includes('food') || n.includes('grocery') || n.includes('snack') || n.includes('drink')) return '🍔';
  if (n.includes('shoe') || n.includes('footwear') || n.includes('sneaker')) return '👟';
  if (n.includes('auto') || n.includes('car') || n.includes('bike') || n.includes('motor')) return '🚗';
  return '🏷️';
};

/* ==========================================================================
   CATEGORY ROUTES (AUTO-DETECT FROM PRODUCTS & DATABASE)
   ========================================================================== */

// GET /api/categories
app.get('/api/categories', async (req, res) => {
  try {
    let dbCategories = await Category.find({}).sort({ name: 1 });
    if (!dbCategories || dbCategories.length === 0) {
      try {
        const rawCats = await mongoose.connection.db.collection('category').find({}).sort({ name: 1 }).toArray();
        if (rawCats && rawCats.length > 0) {
          dbCategories = rawCats;
        }
      } catch {
        // ignore
      }
    }

    // Get all products to compute product counts and auto-discover categories
    let allProducts = await Product.find({}).select('category');
    if (!allProducts || allProducts.length === 0) {
      try {
        const rawProds = await mongoose.connection.db.collection('product').find({}).project({ category: 1 }).toArray();
        if (rawProds && rawProds.length > 0) {
          allProducts = rawProds;
        }
      } catch {
        // ignore
      }
    }

    // Count products per category
    const categoryCounts = {};
    (allProducts || []).forEach((p) => {
      if (p.category && typeof p.category === 'string') {
        const catClean = p.category.trim();
        const catKey = catClean.toLowerCase();
        categoryCounts[catKey] = (categoryCounts[catKey] || 0) + 1;
      }
    });

    const categoriesMap = new Map();

    // Add registered categories
    (dbCategories || []).forEach((c) => {
      const name = c.name?.trim() || '';
      if (!name) return;
      const count = categoryCounts[name.toLowerCase()] || 0;
      categoriesMap.set(name.toLowerCase(), {
        _id: c._id || c.id,
        name: name,
        icon: c.icon || getCategoryIcon(name),
        description: c.description || `${count} ${count === 1 ? 'Product' : 'Products'}`,
        count: `${count} ${count === 1 ? 'Product' : 'Products'}`,
        productCount: count,
      });
    });

    // Auto-add any category that exists on products but not in Category collection
    (allProducts || []).forEach((p) => {
      if (p.category && typeof p.category === 'string') {
        const name = p.category.trim();
        const key = name.toLowerCase();
        if (!categoriesMap.has(key)) {
          const count = categoryCounts[key] || 1;
          const autoCat = {
            name: name,
            icon: getCategoryIcon(name),
            description: `${count} ${count === 1 ? 'Product' : 'Products'}`,
            count: `${count} ${count === 1 ? 'Product' : 'Products'}`,
            productCount: count,
          };
          categoriesMap.set(key, autoCat);

          // Auto-persist new category into MongoDB in background
          Category.create({
            name: name,
            icon: autoCat.icon,
            description: `Collection for ${name}`,
          }).catch(() => {});
        }
      }
    });

    const finalCategories = Array.from(categoriesMap.values());
    return res.status(200).json({ success: true, count: finalCategories.length, categories: finalCategories });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/categories
app.post('/api/categories', protect, adminOnly, async (req, res) => {
  try {
    const payload = {
      ...req.body,
      icon: req.body.icon || getCategoryIcon(req.body.name),
    };
    const category = await Category.create(payload);
    return res.status(201).json({ success: true, category });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/categories/:id
app.put('/api/categories/:id', protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    return res.status(200).json({ success: true, category });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/categories/:id
app.delete('/api/categories/:id', protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    return res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/* ==========================================================================
   ADMIN ROUTES (WITH LIVE STATUS & LOCATION MANAGEMENT)
   ========================================================================== */

// GET /api/admin/orders
app.get('/api/admin/orders', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/orders/:id/status
app.put('/api/admin/orders/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { orderStatus, currentLocation, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
      if (orderStatus === 'Delivered') {
        order.paymentStatus = 'Paid';
      }
    }

    if (currentLocation) {
      order.currentLocation = currentLocation;
    }

    const locDesc =
      note ||
      (orderStatus === 'Shipped'
        ? 'Package left origin facility and is in transit'
        : orderStatus === 'Out for Delivery'
        ? 'Delivery courier agent is en route to customer destination'
        : orderStatus === 'Delivered'
        ? 'Package delivered to recipient successfully'
        : `Status updated to ${orderStatus}`);

    order.trackingHistory.push({
      status: orderStatus || order.orderStatus,
      location: currentLocation || order.currentLocation || 'Transit Facility',
      description: locDesc,
      timestamp: new Date(),
    });

    await order.save();

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/admin/users
app.get('/api/admin/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/users/:id/role
app.put('/api/admin/users/:id/role', protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/users/:id/status
app.put('/api/admin/users/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = Boolean(isActive);
    await user.save();

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// Root Health Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ShopSphere API server is up and running',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
