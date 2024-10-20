// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import BalancePage from './pages/BalancePage';
import ProfilePage from './pages/ProfilePage';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
// // import CartPage from './pages/CartPage';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';

const App = () => {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<ProductsPage />} /> 
                <Route path="/signup" element={<Signup />} /> {/* Home page */}
                <Route path="/signin" element={<Signin />} /> 
                <Route path="/cart" element={<CartPage />} />
                <Route path="/wallet" element={<BalancePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                
                {/* <Route path="/register" element={<RegisterPage />} /> */}
            </Routes>
            <Footer />
        </Router>
    );
};

export default App;
