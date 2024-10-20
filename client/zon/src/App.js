// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProductsPage from './pages/ProductsPage';
// // import CartPage from './pages/CartPage';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';

const App = () => {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<ProductsPage />} /> {/* Home page */}
                {/* <Route path="/cart" element={<CartPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} /> */}
            </Routes>
            <Footer />
        </Router>
    );
};

export default App;
