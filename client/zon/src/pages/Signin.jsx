import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import './Auth.css'; // Import the CSS file (you can keep this if you have additional styles)

const Signin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('https://amazon-cp0v.onrender.com/login', formData, {
                withCredentials: true
            });
            console.log(response.data);

            if (response.data.message === 'Login successful!') {
                alert("Login successful!");
                Cookies.set('user_id', response.data.user.id, { expires: 7 });  // Expires in 7 days
                Cookies.set('user_name', response.data.user.name, { expires: 7 });
                Cookies.set('user_email', response.data.user.email, { expires: 7 });
                Cookies.set('user_phone', response.data.user.phone_number, { expires: 7 });
                Cookies.set('user_role', response.data.user.role, { expires: 7 });
                navigate('/products');
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed. Please try again.');
            console.error("Login error:", error);
        }
    };

    const containerStyle = {
        backgroundColor: 'black', // Plain black background
        minHeight: '100vh', // Ensure the background covers the entire screen
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white', // Text color for readability
        padding: '20px',
        fontSize: "80px"
    };

    const formStyle = {
        background: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background for the form
        padding: '20px',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '400px',
    };

    return (
        <div style={containerStyle}>
            <h2>Sign In</h2>
            <form onSubmit={handleSubmit} style={formStyle}>
                <input
                    name="email"
                    placeholder="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
                />
                <input
                    name="password"
                    placeholder="Password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
                />
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Login
                </button>
            </form>
            {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
            <p style={{ fontSize: '14px' }}>
                Don't have an account? <a href="/signup" style={{ color: '#fff', textDecoration: 'underline' }}>Register here</a>
            </p>
        </div>
    );
};

export default Signin;
