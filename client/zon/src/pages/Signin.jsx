import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import './Auth.css'; // Import the CSS file

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
                Cookies.set('user_id', response.data.user.id, { expires: 7 });
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

    return (
        <div className="signin-container">
            <h2 className="signin-title">Sign In</h2>
            <form onSubmit={handleSubmit} className="signin-form">
                <input
                    name="email"
                    placeholder="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="signin-input"
                />
                <input
                    name="password"
                    placeholder="Password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="signin-input"
                />
                <button type="submit" className="signin-button">
                    Login
                </button>
            </form>
            {error && <p className="error-message">{error}</p>}
            <p className="signup-link">
                Don't have an account? <a href="/signup" className="signup-link-text">Register here</a>
            </p>
        </div>
    );
};

export default Signin;
