import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie'; // Import js-cookie to manage cookies

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        address: '',
        phone_number: ''
    });

    const [errorMessage, setErrorMessage] = useState(''); // To display validation errors
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
        setErrorMessage(''); // Reset error message

        if (!validateForm()) {
            return; // Do not proceed if validation fails
        }

        try {
            const response = await axios.post('http://127.0.0.1:5555/register', formData, { withCredentials: true });
            alert(response.data.message); // Display success message
            
            // Assuming the server sets a cookie on successful registration
            const { token } = response.data; // Adjust based on your server's response
            if (token) {
                Cookies.set('token', token); // Save token in cookies if needed
            }

            navigate('/'); // Redirect to sign-in page
        } catch (error) {
            setErrorMessage(error.response.data.message || 'Error registering. Please try again.');
        }
    };

    return (
        <div>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="Name" onChange={handleChange} required />
                <input name="email" placeholder="Email" type="email" onChange={handleChange} required />
                <input name="password" placeholder="Password" type="password" onChange={handleChange} required />
                <input name="address" placeholder="Address" onChange={handleChange} required />
                <input name="phone_number" placeholder="Phone Number" onChange={handleChange} required />
                <button type="submit">Register</button>
            </form>

            {/* Show validation or server error messages */}
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
    );
};

export default Signup;
