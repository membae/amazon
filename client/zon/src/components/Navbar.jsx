import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Importing the CSS

const Navbar = () => {
    return (
        <nav>
            <Link to="/">Home</Link>
            <Link to="/wallet">Wallet</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/admin">Manage Users</Link>
            <Link to="/manageProducts">Manage Products</Link>
        </nav>
    );
};

export default Navbar;
