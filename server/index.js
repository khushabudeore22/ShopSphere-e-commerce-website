import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "./models/user.js";
import Product from "./models/products.js";
import Category from "./models/category.js";
import Review from "./models/review.js";
import Order from "./models/order.js";
import Cart from "./models/cart.js";
import Wishlist from "./models/wishlist.js";

dotenv.config();

const app = express();

/* =========================================================
   MIDDLEWARE
========================================================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  "https://shopsphere-e-commerce-website.onrender.com",
  "https://shopsphere-e-commerce-website-api.onrender.com",
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".onrender.com") ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8080;

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "shopsphere_super_secret_jwt_key_2026";

/* =========================================================
   JWT TOKEN
========================================================= */

const generateToken = (userId, role) => {
  return jwt.sign(
    {
      id: userId,
      role: role,
    },
    JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

/* =========================================================
   AUTH MIDDLEWARE
========================================================= */

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );

    const user = await User.findById(
      decoded.id
    ).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(
      "AUTH ERROR:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

/* =========================================================
   ADMIN MIDDLEWARE
========================================================= */

const adminOnly = (req, res, next) => {
  if (
    req.user &&
    req.user.role === "admin"
  ) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Admin access required",
  });
};

/* =========================================================
   DATABASE
========================================================= */

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.log(
        "MONGO_URI is missing in .env"
      );
      return;
    }

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "MongoDB connected successfully"
    );

    await createDefaultUsers();
  } catch (error) {
    console.error(
      "MongoDB connection error:",
      error.message
    );
  }
};

/* =========================================================
   DEFAULT USERS
========================================================= */

const createDefaultUsers = async () => {
  try {
    let admin = await User.findOne({
      email: "admin@shopsphere.com",
    });

    if (!admin) {
      const password =
        await bcrypt.hash(
          "admin123",
          10
        );

      admin = await User.create({
        name: "ShopSphere Admin",
        email: "admin@shopsphere.com",
        password,
        role: "admin",
        phone: "9876543210",
        address: "ShopSphere Headquarters",
      });

      console.log(
        "Admin created:"
      );

      console.log(
        "admin@shopsphere.com / admin123"
      );
    }

    let user = await User.findOne({
      email: "user@shopsphere.com",
    });

    if (!user) {
      const password =
        await bcrypt.hash(
          "123456",
          10
        );

      user = await User.create({
        name: "Demo User",
        email: "user@shopsphere.com",
        password,
        role: "user",
        phone: "9876543211",
        address: "Nashik",
      });

      console.log(
        "Demo user created:"
      );

      console.log(
        "user@shopsphere.com / 123456"
      );
    }
  } catch (error) {
    console.log(
      "Default user error:",
      error.message
    );
  }
};

/* =========================================================
   ROOT
========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "ShopSphere API is running",
  });
});

/* =========================================================
   USER REGISTER
========================================================= */

app.post(
  "/api/users/register",
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        phone,
        address,
      } = req.body;

      if (
        !name ||
        !email ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Name, email and password are required",
        });
      }

      const existingUser =
        await User.findOne({
          email:
            email.toLowerCase(),
        });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message:
            "User already exists",
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      const user =
        await User.create({
          name,
          email:
            email.toLowerCase(),
          password:
            hashedPassword,
          phone:
            phone || "",
          address:
            address || "",
          role: "user",
        });

      const token =
        generateToken(
          user._id,
          user.role
        );

      res.status(201).json({
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
      console.error(
        "REGISTER ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/* =========================================================
   USER LOGIN
========================================================= */

app.post(
  "/api/users/login",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      if (
        !email ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email and password are required",
        });
      }

      const user =
        await User.findOne({
          email:
            email.toLowerCase(),
        });

      if (!user) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password",
        });
      }

      const match =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!match) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password",
        });
      }

      const token =
        generateToken(
          user._id,
          user.role
        );

      res.json({
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
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/* =========================================================
   USER PROFILE
========================================================= */

app.get(
  "/api/users/profile",
  protect,
  async (req, res) => {
    res.json({
      success: true,
      user: req.user,
    });
  }
);

/* =========================================================
   UPDATE PROFILE
========================================================= */

app.put(
  "/api/users/profile",
  protect,
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user._id
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (req.body.name) {
        user.name =
          req.body.name;
      }

      if (
        req.body.phone !==
        undefined
      ) {
        user.phone =
          req.body.phone;
      }

      if (
        req.body.address !==
        undefined
      ) {
        user.address =
          req.body.address;
      }

      if (req.body.password) {
        user.password =
          await bcrypt.hash(
            req.body.password,
            10
          );
      }

      await user.save();

      res.json({
        success: true,
        user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/* =========================================================
   GET PRODUCTS
========================================================= */

app.get(
  "/api/products",
  async (req, res) => {
    try {
      const {
        category,
        search,
        minPrice,
        maxPrice,
        sort,
      } = req.query;

      const query = {};

      if (
        category &&
        category !== "All"
      ) {
        query.category = {
          $regex: category,
          $options: "i",
        };
      }

      if (search) {
        query.$or = [
          {
            name: {
              $regex: search,
              $options: "i",
            },
          },
          {
            description: {
              $regex: search,
              $options: "i",
            },
          },
          {
            brand: {
              $regex: search,
              $options: "i",
            },
          },
          {
            category: {
              $regex: search,
              $options: "i",
            },
          },
        ];
      }

      if (
        minPrice ||
        maxPrice
      ) {
        query.price = {};

        if (minPrice) {
          query.price.$gte =
            Number(minPrice);
        }

        if (maxPrice) {
          query.price.$lte =
            Number(maxPrice);
        }
      }

      let sortOption = {
        createdAt: -1,
      };

      if (sort === "price-low") {
        sortOption = {
          price: 1,
        };
      }

      if (sort === "price-high") {
        sortOption = {
          price: -1,
        };
      }

      if (sort === "rating") {
        sortOption = {
          rating: -1,
        };
      }

      if (sort === "name") {
        sortOption = {
          name: 1,
        };
      }

      const products =
        await Product.find(
          query
        ).sort(sortOption);

      res.json({
        success: true,
        count: products.length,
        products,
      });
    } catch (error) {
      console.error(
        "GET PRODUCTS ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/* =========================================================
   GET SINGLE PRODUCT
========================================================= */

app.get(
  "/api/products/:id",
  async (req, res) => {
    try {
      const product =
        await Product.findById(
          req.params.id
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      res.json({
        success: true,
        product,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          "Invalid product ID",
      });
    }
  }
);

/* =========================================================
   ADD PRODUCT
   SINGLE + BULK
========================================================= */

app.post(
  "/api/products",
  async (req, res) => {
    try {
      console.log(
        "================================"
      );

      console.log(
        "POST /api/products"
      );

      console.log(
        "Request received"
      );

      console.log(
        "================================"
      );

      /* ---------------------------------------------------
         BULK PRODUCT INSERT
      --------------------------------------------------- */

      if (
        Array.isArray(
          req.body
        )
      ) {
        const products =
          req.body;

        if (
          products.length === 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Product array is empty",
          });
        }

        const preparedProducts =
          [];

        for (
          let i = 0;
          i < products.length;
          i++
        ) {
          const item =
            products[i];

          if (
            !item.name ||
            item.name.trim() === ""
          ) {
            return res.status(400).json({
              success: false,
              message:
                `Product name is required at index ${i}`,
            });
          }

          if (
            item.price ===
              undefined ||
            item.price === null ||
            item.price === ""
          ) {
            return res.status(400).json({
              success: false,
              message:
                `Product price is required at index ${i}`,
            });
          }

          if (
            !item.category ||
            item.category.trim() === ""
          ) {
            return res.status(400).json({
              success: false,
              message:
                `Product category is required at index ${i}`,
            });
          }

          preparedProducts.push({
            name:
              item.name.trim(),

            description:
              item.description ||
              "",

            price:
              Number(
                item.price
              ),

            originalPrice:
              item.originalPrice !==
                undefined &&
              item.originalPrice !==
                null &&
              item.originalPrice !==
                ""
                ? Number(
                    item.originalPrice
                  )
                : 0,

            category:
              item.category.trim(),

            brand:
              item.brand ||
              "ShopSphere",

            stock:
              item.stock !==
                undefined &&
              item.stock !==
                null &&
              item.stock !==
                ""
                ? Number(
                    item.stock
                  )
                : 0,

            image:
              item.image ||
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",

            rating:
              item.rating !==
                undefined &&
              item.rating !==
                null &&
              item.rating !==
                ""
                ? Number(
                    item.rating
                  )
                : 0,

            numReviews:
              item.numReviews !==
                undefined &&
              item.numReviews !==
                null &&
              item.numReviews !==
                ""
                ? Number(
                    item.numReviews
                  )
                : 0,

            featured:
              item.featured ===
                true ||
              item.featured ===
                "true",
          });
        }

        const savedProducts =
          await Product.insertMany(
            preparedProducts
          );

        console.log(
          `${savedProducts.length} products saved`
        );

        return res.status(201).json({
          success: true,
          message:
            `${savedProducts.length} products added successfully`,
          count:
            savedProducts.length,
          products:
            savedProducts,
        });
      }

      /* ---------------------------------------------------
         SINGLE PRODUCT
      --------------------------------------------------- */

      const {
        name,
        description,
        price,
        originalPrice,
        category,
        brand,
        stock,
        image,
        rating,
        numReviews,
        featured,
      } = req.body;

      if (
        !name ||
        name.trim() === ""
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Product name is required",
        });
      }

      if (
        price === undefined ||
        price === null ||
        price === ""
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Product price is required",
        });
      }

      if (
        !category ||
        category.trim() === ""
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Product category is required",
        });
      }

      const product =
        await Product.create({
          name:
            name.trim(),

          description:
            description || "",

          price:
            Number(price),

          originalPrice:
            originalPrice !==
              undefined &&
            originalPrice !==
              null &&
            originalPrice !==
              ""
              ? Number(
                  originalPrice
                )
              : 0,

          category:
            category.trim(),

          brand:
            brand ||
            "ShopSphere",

          stock:
            stock !==
              undefined &&
            stock !== null &&
            stock !== ""
              ? Number(stock)
              : 0,

          image:
            image ||
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",

          rating:
            rating !==
              undefined &&
            rating !== null &&
            rating !== ""
              ? Number(rating)
              : 0,

          numReviews:
            numReviews !==
              undefined &&
            numReviews !== null &&
            numReviews !== ""
              ? Number(numReviews)
              : 0,

          featured:
            featured === true ||
            featured === "true",
        });

      console.log(
        "Product saved:",
        product._id
      );

      return res.status(201).json({
        success: true,
        message:
          "Product added successfully",
        product,
      });
    } catch (error) {
      console.error(
        "ADD PRODUCT ERROR:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          "Failed to add product",
        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   UPDATE PRODUCT
========================================================= */

app.put(
  "/api/products/:id",
  async (req, res) => {
    try {
      const product =
        await Product.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
            runValidators: true,
          }
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      res.json({
        success: true,
        message:
          "Product updated successfully",
        product,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/* =========================================================
   DELETE PRODUCT
========================================================= */

app.delete(
  "/api/products/:id",
  async (req, res) => {
    try {
      const product =
        await Product.findByIdAndDelete(
          req.params.id
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      res.json({
        success: true,
        message:
          "Product deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/* =========================================================
   REVIEWS
========================================================= */

app.get(
  "/api/products/:id/reviews",
  async (req, res) => {
    try {
      const reviews =
        await Review.find({
          product:
            req.params.id,
        })
          .populate(
            "user",
            "name"
          )
          .sort({
            createdAt: -1,
          });

      res.json({
        success: true,
        reviews,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

app.post(
  "/api/products/:id/reviews",
  protect,
  async (req, res) => {
    try {
      const {
        rating,
        comment,
      } = req.body;

      if (!rating) {
        return res.status(400).json({
          success: false,
          message:
            "Rating is required",
        });
      }

      const existing =
        await Review.findOne({
          product:
            req.params.id,
          user:
            req.user._id,
        });

      if (existing) {
        return res.status(400).json({
          success: false,
          message:
            "You already reviewed this product",
        });
      }

      const review =
        await Review.create({
          product:
            req.params.id,
          user:
            req.user._id,
          rating:
            Number(rating),
          comment:
            comment || "",
        });

      const reviews =
        await Review.find({
          product:
            req.params.id,
        });

      const product =
        await Product.findById(
          req.params.id
        );

      if (product) {
        const total =
          reviews.reduce(
            (sum, item) =>
              sum +
              Number(
                item.rating
              ),
            0
          );

        product.rating =
          reviews.length
            ? total /
              reviews.length
            : 0;

        product.numReviews =
          reviews.length;

        await product.save();
      }

      res.status(201).json({
        success: true,
        review,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/* =========================================================
   CART
========================================================= */

app.get(
  "/api/cart",
  protect,
  async (req, res) => {
    try {
      const cart =
        await Cart.findOne({
          user:
            req.user._id,
        }).populate(
          "items.product"
        );

      res.json({
        success: true,
        cart:
          cart || {
            user:
              req.user._id,
            items: [],
          },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

app.post(
  "/api/cart",
  protect,
  async (req, res) => {
    try {
      const {
        productId,
        product,
        quantity = 1,
      } = req.body;

      const id =
        productId ||
        product?._id ||
        product?.id;

      if (!id) {
        return res.status(400).json({
          success: false,
          message:
            "Product ID is required",
        });
      }

      let cart =
        await Cart.findOne({
          user:
            req.user._id,
        });

      if (!cart) {
        cart =
          await Cart.create({
            user:
              req.user._id,
            items: [],
          });
      }

      const existing =
        cart.items.find(
          (item) =>
            item.product.toString() ===
            id.toString()
        );

      if (existing) {
        existing.quantity +=
          Number(quantity);
      } else {
        cart.items.push({
          product: id,
          quantity:
            Number(quantity),
        });
      }

      await cart.save();

      await cart.populate(
        "items.product"
      );

      res.status(201).json({
        success: true,
        cart,
      });
    } catch (error) {
      console.error(
        "CART ERROR:",
        error
      );

      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

app.put(
  "/api/cart/:id",
  protect,
  async (req, res) => {
    try {
      const cart =
        await Cart.findOne({
          user:
            req.user._id,
        });

      if (!cart) {
        return res.status(404).json({
          success: false,
          message:
            "Cart not found",
        });
      }

      const item =
        cart.items.find(
          (item) =>
            item._id.toString() ===
            req.params.id
        );

      if (!item) {
        return res.status(404).json({
          success: false,
          message:
            "Cart item not found",
        });
      }

      item.quantity =
        Number(
          req.body.quantity
        );

      if (item.quantity <= 0) {
        cart.items =
          cart.items.filter(
            (x) =>
              x._id.toString() !==
              req.params.id
          );
      }

      await cart.save();

      await cart.populate(
        "items.product"
      );

      res.json({
        success: true,
        cart,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

app.delete(
  "/api/cart/:id",
  protect,
  async (req, res) => {
    try {
      const cart =
        await Cart.findOne({
          user:
            req.user._id,
        });

      if (!cart) {
        return res.status(404).json({
          success: false,
          message:
            "Cart not found",
        });
      }

      cart.items =
        cart.items.filter(
          (item) =>
            item._id.toString() !==
            req.params.id
        );

      await cart.save();

      await cart.populate(
        "items.product"
      );

      res.json({
        success: true,
        cart,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

app.delete(
  "/api/cart",
  protect,
  async (req, res) => {
    try {
      await Cart.findOneAndDelete({
        user:
          req.user._id,
      });

      res.json({
        success: true,
        message:
          "Cart cleared successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/* =========================================================
   WISHLIST
========================================================= */

/*
   Your Wishlist model:

   user
   products: [Product IDs]

   Therefore wishlist is stored in:
   shopsphere
      └── wishlists
*/

/* GET WISHLIST */

app.get(
  "/api/wishlist",
  protect,
  async (req, res) => {
    try {
      let wishlist =
        await Wishlist.findOne({
          user:
            req.user._id,
        }).populate(
          "products"
        );

      if (!wishlist) {
        wishlist =
          await Wishlist.create({
            user:
              req.user._id,
            products: [],
          });

        await wishlist.populate(
          "products"
        );
      }

      res.json({
        success: true,
        wishlist,
        products:
          wishlist.products,
      });
    } catch (error) {
      console.error(
        "GET WISHLIST ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/* ADD TO WISHLIST */

app.post(
  "/api/wishlist",
  protect,
  async (req, res) => {
    try {
      const productId =
        req.body.productId ||
        req.body.product?._id ||
        req.body.product?.id;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message:
            "Product ID is required",
        });
      }

      const product =
        await Product.findById(
          productId
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      let wishlist =
        await Wishlist.findOne({
          user:
            req.user._id,
        });

      if (!wishlist) {
        wishlist =
          await Wishlist.create({
            user:
              req.user._id,
            products: [],
          });
      }

      const alreadyExists =
        wishlist.products.some(
          (id) =>
            id.toString() ===
            productId.toString()
        );

      if (!alreadyExists) {
        wishlist.products.push(
          productId
        );

        await wishlist.save();
      }

      await wishlist.populate(
        "products"
      );

      res.status(200).json({
        success: true,
        message:
          "Product added to wishlist",
        wishlist,
        products:
          wishlist.products,
      });
    } catch (error) {
      console.error(
        "ADD WISHLIST ERROR:",
        error
      );

      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/* REMOVE FROM WISHLIST */

app.delete(
  "/api/wishlist/:productId",
  protect,
  async (req, res) => {
    try {
      const wishlist =
        await Wishlist.findOne({
          user:
            req.user._id,
        });

      if (!wishlist) {
        return res.status(404).json({
          success: false,
          message:
            "Wishlist not found",
        });
      }

      wishlist.products =
        wishlist.products.filter(
          (id) =>
            id.toString() !==
            req.params.productId
        );

      await wishlist.save();

      await wishlist.populate(
        "products"
      );

      res.json({
        success: true,
        message:
          "Product removed from wishlist",
        wishlist,
        products:
          wishlist.products,
      });
    } catch (error) {
      console.error(
        "REMOVE WISHLIST ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/* =========================================================
   ORDERS
========================================================= */

app.post(
  "/api/orders",
  protect,
  async (req, res) => {
    try {
      const orderData = {
        ...req.body,
        user:
          req.user._id,
      };

      const order =
        await Order.create(
          orderData
        );

      res.status(201).json({
        success: true,
        order,
      });
    } catch (error) {
      console.error(
        "CREATE ORDER ERROR:",
        error
      );

      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

app.get(
  "/api/orders",
  protect,
  async (req, res) => {
    try {
      const orders =
        await Order.find({
          user:
            req.user._id,
        }).sort({
          createdAt: -1,
        });

      res.json({
        success: true,
        count:
          orders.length,
        orders,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

app.get(
  "/api/orders/:id",
  protect,
  async (req, res) => {
    try {
      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found",
        });
      }

      res.json({
        success: true,
        order,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

app.put(
  "/api/orders/:id/cancel",
  protect,
  async (req, res) => {
    try {
      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found",
        });
      }

      order.orderStatus =
        "Cancelled";

      await order.save();

      res.json({
        success: true,
        order,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/* =========================================================
   CATEGORIES
========================================================= */

app.get(
  "/api/categories",
  async (req, res) => {
    try {
      const categories =
        await Category.find(
          {}
        ).sort({
          name: 1,
        });

      res.json({
        success: true,
        count:
          categories.length,
        categories,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

app.post(
  "/api/categories",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const category =
        await Category.create(
          req.body
        );

      res.status(201).json({
        success: true,
        category,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

app.put(
  "/api/categories/:id",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const category =
        await Category.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
            runValidators: true,
          }
        );

      if (!category) {
        return res.status(404).json({
          success: false,
          message:
            "Category not found",
        });
      }

      res.json({
        success: true,
        category,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

app.delete(
  "/api/categories/:id",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      await Category.findByIdAndDelete(
        req.params.id
      );

      res.json({
        success: true,
        message:
          "Category deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/* =========================================================
   ADMIN - USERS
========================================================= */

app.get(
  "/api/admin/users",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const users =
        await User.find({})
          .select("-password")
          .sort({
            createdAt: -1,
          });

      res.json({
        success: true,
        count:
          users.length,
        users,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/* CHANGE USER ROLE */

app.put(
  "/api/admin/users/:id/role",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      user.role =
        req.body.role;

      await user.save();

      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/* CHANGE USER STATUS */

app.put(
  "/api/admin/users/:id/status",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      user.isActive =
        Boolean(
          req.body.isActive
        );

      await user.save();

      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive:
            user.isActive,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/* =========================================================
   ADMIN - ORDERS
========================================================= */

app.get(
  "/api/admin/orders",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const orders =
        await Order.find({})
          .populate(
            "user",
            "name email"
          )
          .sort({
            createdAt: -1,
          });

      res.json({
        success: true,
        count:
          orders.length,
        orders,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

app.put(
  "/api/admin/orders/:id/status",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found",
        });
      }

      if (
        req.body.orderStatus
      ) {
        order.orderStatus =
          req.body.orderStatus;
      }

      if (
        req.body.paymentStatus
      ) {
        order.paymentStatus =
          req.body.paymentStatus;
      }

      if (
        req.body.currentLocation
      ) {
        order.currentLocation =
          req.body.currentLocation;
      }

      await order.save();

      res.json({
        success: true,
        order,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/* =========================================================
   ERROR HANDLER FOR INVALID JSON
========================================================= */

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    if (
      error instanceof
      SyntaxError &&
      error.status === 400 &&
      "body" in error
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid JSON. Check commas, quotes and brackets.",
      });
    }

    next(error);
  }
);

/* =========================================================
   START SERVER
========================================================= */

app.listen(
  PORT,
  async () => {
    console.log(
      `Server is running on port ${PORT}`
    );

    await connectDB();
  }
);