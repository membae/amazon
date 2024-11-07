import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import './Navbar.css'; // Importing the CSS

const Navbar = () => {
    const location = useLocation(); // Get the current location
    const userRole = Cookies.get('user_role');
    
    // Do not render Navbar on /login or /signup routes
    if (location.pathname === '/login' || location.pathname === '/signup') {
        return null; // Return nothing, effectively hiding the Navbar
    }

    // Check if the user is an admin
    const isAdmin = userRole && userRole === 'admin';

    return (
        <nav>
            {isAdmin ? (
                <>
                    <Link to="/">Home</Link>
                    <Link to="/wallet">Wallet</Link>
                    <Link to="/profile">Profile</Link>
                    <Link to="/admin">Manage Users</Link>
                    <Link to="/manageProducts">Manage Products</Link>
                </>
            ) : (
                <>
                    <Link to="/">Home</Link>
                    <Link to="/wallet">Wallet</Link>
                    <Link to="/profile">Profile</Link>
                </>
            )}
        </nav>
    );
};

export default Navbar;
