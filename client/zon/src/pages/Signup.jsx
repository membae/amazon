// src/components/Auth/Signup.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate hook
import axios from 'axios';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        address: '',
        phone_number: ''
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
            const response = await axios.post(' http://127.0.0.1:5555/register', formData);
            alert(response.data.message); // Display success message
            navigate('/signin'); // Redirect to signin after successful signup
        } catch (error) {
            alert(error.response.data.message); // Display error message
        }
    };

    return (
        <div>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="Name" onChange={handleChange} required />
                <input name="email" placeholder="Email" type="email" onChange={handleChange} required />
                <input name="password" placeholder="Password" type="password" onChange={handleChange} required />
                <input name="address" placeholder="Address" onChange={handleChange} />
                <input name="phone_number" placeholder="Phone Number" onChange={handleChange} />
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Signup;
