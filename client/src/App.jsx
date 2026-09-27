import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./views/home/home";
import Products from "./views/Product/Product";
import ProductDetails from "./views/ProductDetails/ProductDetails";
import Login from "./views/login/login";
import Register from "./views/Register/Register";
import Profile from "./views/Profle/Profile";
import Cart from "./views/Cart/Cart";
import Wishlist from "./views/Wishlist/Wishlist";
import Checkout from "./views/Checkout/Checkout";
import Orders from "./views/Orders/Orders";
import OrderDetails from "./views/OrderDetails/OrderDetails";
import About from "./views/about/about";
import Contact from "./views/contact/contact";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import AdminDashboard from "./views/admin/AdminDashboard";
import ProductsManagement from "./views/admin/ProductManagement";
import AddProduct from "./views/admin/AddProduct";
import EditProduct from "./views/admin/EditProduct";
import OrdersManagement from "./views/admin/OrderManagement";
import UsersManagement from "./views/admin/UserManagement";
import CategoriesManagement from "./views/admin/CategoriesManagement";

function App() {
  return (
    <Routes>
      {/* PUBLIC USER PAGES */}
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      {/* PROTECTED USER ROUTES */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetails />} />

        {/* PROTECTED ADMIN ROUTES */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<ProductsManagement />} />
          <Route path="/admin/products/add" element={<AddProduct />} />
          <Route path="/admin/products/edit/:id" element={<EditProduct />} />
          <Route path="/admin/orders" element={<OrdersManagement />} />
          <Route path="/admin/users" element={<UsersManagement />} />
          <Route path="/admin/categories" element={<CategoriesManagement />} />
        </Route>
      </Route>

      {/* FALLBACK ROUTE */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default App;