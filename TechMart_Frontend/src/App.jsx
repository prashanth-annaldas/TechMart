import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Register from './pages/register';
import Login from "./pages/login";
import Home from "./pages/home";
import AdminProducts from './pages/adminProducts';
import AdminCategories from './pages/adminCategories';
import Profile from './pages/profile';
import Orders from './pages/orders';
import Wishlist from './pages/wishlist';
import Cart from './pages/cart';
import AdminOrders from './pages/adminOrders';

function App() {
  return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/products"
                    element={<AdminProducts />}
                />

                <Route
                    path="/categories"
                    element={<AdminCategories />}
                />

                <Route
                    path="/profile"
                    element={<Profile />}
                />

                <Route
                    path="/orders"
                    element={<Orders />}
                />

                <Route
                    path="/wishlist"
                    element={<Wishlist />}
                />

                <Route
                    path="/cart"
                    element={<Cart />}
                />

                <Route
                    path="/adminOrders"
                    element={<AdminOrders />}
                />

            </Routes>

        </BrowserRouter>
  );
}

export default App;
