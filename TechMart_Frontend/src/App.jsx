import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Register from './pages/register';
import Login from "./pages/login";
import Home from "./pages/home";
import ProductListing from "./pages/ProductListing";
import ProductDetail from "./pages/ProductDetail";
import Cart from './pages/cart';
import Wishlist from './pages/wishlist';
import Profile from './pages/profile';
import Orders from './pages/orders';
import Checkout from './pages/Checkout';

// Admin Pages
import AdminProducts from './pages/adminProducts';
import AdminCategories from './pages/adminCategories';
import AdminOrders from './pages/adminOrders';
import Payment from "./pages/payment";
import Ai from "./pages/ai";

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<ProductListing />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            
            {/* Protected Customer Routes */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/checkout" element={<Checkout />} />

            {/* Admin Routes */}
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/orders" element={<AdminOrders />} />

            <Route path="/payments/history" element={<Payment />} />
            <Route path="/ai" element={<Ai />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
