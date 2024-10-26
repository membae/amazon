import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import './Auth.css'; // Import the CSS file

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

    return (
        <div className="auth-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                <input name="name" placeholder="Name" onChange={handleChange} required />
                <input name="email" placeholder="Email" type="email" onChange={handleChange} required />
                <input name="password" placeholder="Password" type="password" onChange={handleChange} required />
                <input name="address" placeholder="Address" onChange={handleChange} required />
                <input name="phone_number" placeholder="Phone Number" onChange={handleChange} required />
                <button type="submit">Register</button>
            </form>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
    );
};

export default Signup;