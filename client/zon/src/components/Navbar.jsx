import React from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import './Navbar.css'; // Importing the CSS

const Navbar = () => {
    // Get the user's role from cookies
    const userRole = Cookies.get('user_role');

    // Check if the role is 'admin'
    const isAdmin = userRole === 'admin';

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
