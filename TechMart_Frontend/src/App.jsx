import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Register from './pages/register';
import Login from "./pages/login";
import Home from "./pages/home";

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
                    path="/home"
                    element={<Home />}
                />

            </Routes>

        </BrowserRouter>
  );
}

export default App;
