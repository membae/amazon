// src/components/Auth/Signin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

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
        setError(''); // Clear any previous error messages
        try {
            const response = await axios.post('http://127.0.0.1:5555/login', formData, {
                withCredentials: true // Ensure cookies are sent
            });
            console.log('Response:', response);
            console.log('Response Data:', response.data);

            // Check for successful login response
            if (response.data.message==='Login successful!') {
                alert("Login successful!"); // Optional: Display success message
                console.log(response.data)
                // Set session cookies (without expiration)
                Cookies.set('user_id', response.data.user.id);
                Cookies.set('user_name', response.data.user.name);
                Cookies.set('user_email', response.data.user.email);
                Cookies.set('user_phone', response.data.user.phone_number);
                Cookies.set('user_role', response.data.user.role);

                navigate('/'); // Redirect to profile page after successful login
            } else {
                setError(response.data.message); // Show failure message if success is false
            }
        } catch (error) {
            // Handle login error (wrong credentials, server error, etc.)
            setError(error.response?.data?.message || 'Login failed. Please try again.');
            console.error("Login error:", error);
        }
    };

    return (
        <div>
            <h2>Sign In</h2>
            <form onSubmit={handleSubmit}>
                <input
                    name="email"
                    placeholder="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <input
                    name="password"
                    placeholder="Password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Login</button>
            </form>
            {/* Display error message if exists */}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default Signin;
