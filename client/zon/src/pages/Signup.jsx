import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import './Auth.css'; // Import the CSS file (you can keep this if you have additional styles)

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        address: '',
        phone_number: ''
    });

    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const validateForm = () => {
        const { name, email, password, address, phone_number } = formData;

        if (!name || !email || !password || !address || !phone_number) {
            setErrorMessage('All fields are required!');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!validateForm()) {
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:5555/register', formData, { withCredentials: true });
            alert(response.data.message);
            
            const { token } = response.data;
            if (token) {
                Cookies.set('token', token);
            }

            navigate('/login');
        } catch (error) {
            setErrorMessage(error.response.data.message || 'Error registering. Please try again.');
        }
    };

    // Inline CSS Styles
    const containerStyle = {
        backgroundImage: 'url(/amazonback.jpg)', // Path relative to the public folder
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh', // Ensure the background covers the entire screen
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'black', // Text color for readability
        padding: '20px'
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
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit} style={formStyle}>
                <input
                    name="name"
                    placeholder="Name"
                    onChange={handleChange}
                    required
                    style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
                />
                <input
                    name="email"
                    placeholder="Email"
                    type="email"
                    onChange={handleChange}
                    required
                    style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
                />
                <input
                    name="password"
                    placeholder="Password"
                    type="password"
                    onChange={handleChange}
                    required
                    style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
                />
                <input
                    name="address"
                    placeholder="Address"
                    onChange={handleChange}
                    required
                    style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
                />
                <input
                    name="phone_number"
                    placeholder="Phone Number"
                    onChange={handleChange}
                    required
                    style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
                />
                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    Register
                </button>
            </form>
            {errorMessage && <p style={{ color: 'red', fontSize: '14px' }}>{errorMessage}</p>}
            <p style={{ fontSize: '14px' }}>
                Already have an account? <a href="/login" style={{ color: '#fff', textDecoration: 'underline' }}>Login here</a>
            </p>
        </div>
    );
};

export default Signup;
