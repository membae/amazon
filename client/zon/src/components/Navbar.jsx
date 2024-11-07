import React from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import './Navbar.css'; // Importing the CSS

const Navbar = () => {
    // Get the user's email from cookies
    const userName = Cookies.get('user_name');

    // Check if the email includes 'admin'
    const isAdmin = userName && userName.includes('admin');

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
