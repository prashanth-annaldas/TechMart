import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Register from './pages/register';
import Login from "./pages/login";
import Home from "./pages/home";
import AdminProduct from './pages/adminProduct';
import AdminCategory from './pages/adminCategory';

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
                    path="/adminProduct"
                    element={<AdminProduct />}
                />

                <Route
                    path="/adminCategory"
                    element={<AdminCategory />}
                />

            </Routes>

        </BrowserRouter>
  );
}

export default App;
