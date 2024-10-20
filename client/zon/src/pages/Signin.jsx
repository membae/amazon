// src/components/Auth/Signin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate hook
import axios from 'axios';

const Signin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const navigate = useNavigate();  // Create navigate function

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(' http://127.0.0.1:5555/login', formData);
            alert(response.data.message); // Display success message

            // Assuming the response contains the session data
            if (response.data.success) {
                navigate('/'); // Redirect to home page after successful login
            }
        } catch (error) {
            alert(error.response.data.message); // Display error message
        }
    };

    return (
        <div>
            <h2>Sign In</h2>
            <form onSubmit={handleSubmit}>
                <input name="email" placeholder="Email" type="email" onChange={handleChange} required />
                <input name="password" placeholder="Password" type="password" onChange={handleChange} required />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Signin;
