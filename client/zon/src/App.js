import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import BalancePage from './pages/BalancePage';
import ProfilePage from './pages/ProfilePage';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import ManageUsers from './pages/ManageUsers';
import ManageProducts from './pages/ManageProducts';

const App = () => {
    const location = useLocation();  // Use location hook to get current path

    // Paths where we don't want to show the Navbar and Footer
    const noNavFooterRoutes = ['/', '/signup'];

    return (
        <>
            {/* Conditionally render Navbar if not on signin/signup */}
            {!noNavFooterRoutes.includes(location.pathname) && <Navbar />}

            <Routes>
                <Route path="/products" element={<ProductsPage />} /> 
                <Route path="/signup" element={<Signup />} />
                <Route path="/" element={<Signin />} />
                <Route path="/login" element={<Signin />} />
                {/* <Route path="/cart" element={<CartPage />} /> */}
                <Route path="/wallet" element={<BalancePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin" element={<ManageUsers />} />
                <Route path="/manageProducts" element={<ManageProducts />} />
            </Routes>

            {/* Conditionally render Footer if not on signin/signup */}
            {!noNavFooterRoutes.includes(location.pathname) && <Footer />}
        </>
    );
};

const WrappedApp = () => {
    return (
        <Router>
            <App />
        </Router>
    );
};

export default WrappedApp;
