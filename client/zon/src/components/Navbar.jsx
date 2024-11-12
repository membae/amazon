import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false); // State to control the menu visibility
    const location = useLocation(); // Get the current location
    const userRole = Cookies.get('user_role');
    
    // Do not render Navbar on /login or /signup routes
    if (location.pathname === '/login' || location.pathname === '/signup') {
        return null; // Return nothing, effectively hiding the Navbar
    }

    // Check if the user is an admin
    const isAdmin = userRole && userRole === 'admin';

    const toggleMenu = () => {
        setMenuOpen(!menuOpen); // Toggle the menu visibility
    };

    const handleLinkClick = () => {
        setMenuOpen(false); // Close the menu when a link is clicked
    };

    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '100%', // Full width of the screen
            backgroundColor: '#333',
            zIndex: 1000,
            padding: '10px 20px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
        }}>
            {/* Menu icon for mobile devices */}
            <div
                className="menu-icon"
                onClick={toggleMenu}
                style={{
                    fontSize: '30px',
                    color: '#fff',
                    cursor: 'pointer',
                    marginRight: '20px',
                }}
            >
                ☰
            </div>

            {/* Menu links */}
            <div
                className={`menu ${menuOpen ? 'show' : ''}`}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    position: 'absolute',
                    top: '60px', // Space below the menu icon
                    right: 0,
                    backgroundColor: '#333',
                    width: '200px', // Adjust width of the menu
                    padding: '10px 0',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    visibility: menuOpen ? 'visible' : 'hidden',
                    opacity: menuOpen ? '1' : '0',
                    transition: 'opacity 0.3s ease, visibility 0.3s ease',
                }}
            >
                {isAdmin ? (
                    <>
                        <Link
                            to="/products"
                            onClick={handleLinkClick} // Close menu on click
                            style={{
                                color: '#fff',
                                textDecoration: 'none',
                                padding: '10px 20px',
                                textAlign: 'center',
                                display: 'block',
                            }}
                        >
                            Home
                        </Link>
                        <Link
                            to="/wallet"
                            onClick={handleLinkClick} // Close menu on click
                            style={{
                                color: '#fff',
                                textDecoration: 'none',
                                padding: '10px 20px',
                                textAlign: 'center',
                                display: 'block',
                            }}
                        >
                            Wallet
                        </Link>
                        <Link
                            to="/profile"
                            onClick={handleLinkClick} // Close menu on click
                            style={{
                                color: '#fff',
                                textDecoration: 'none',
                                padding: '10px 20px',
                                textAlign: 'center',
                                display: 'block',
                            }}
                        >
                            Profile
                        </Link>
                        <Link
                            to="/admin"
                            onClick={handleLinkClick} // Close menu on click
                            style={{
                                color: '#fff',
                                textDecoration: 'none',
                                padding: '10px 20px',
                                textAlign: 'center',
                                display: 'block',
                            }}
                        >
                            Manage Users
                        </Link>
                        <Link
                            to="/manageProducts"
                            onClick={handleLinkClick} // Close menu on click
                            style={{
                                color: '#fff',
                                textDecoration: 'none',
                                padding: '10px 20px',
                                textAlign: 'center',
                                display: 'block',
                            }}
                        >
                            Manage Products
                        </Link>
                    </>
                ) : (
                    <>
                        <Link
                            to="/"
                            onClick={handleLinkClick} // Close menu on click
                            style={{
                                color: '#fff',
                                textDecoration: 'none',
                                padding: '10px 20px',
                                textAlign: 'center',
                                display: 'block',
                            }}
                        >
                            Home
                        </Link>
                        <Link
                            to="/wallet"
                            onClick={handleLinkClick} // Close menu on click
                            style={{
                                color: '#fff',
                                textDecoration: 'none',
                                padding: '10px 20px',
                                textAlign: 'center',
                                display: 'block',
                            }}
                        >
                            Wallet
                        </Link>
                        <Link
                            to="/profile"
                            onClick={handleLinkClick} // Close menu on click
                            style={{
                                color: '#fff',
                                textDecoration: 'none',
                                padding: '10px 20px',
                                textAlign: 'center',
                                display: 'block',
                            }}
                        >
                            Profile
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
