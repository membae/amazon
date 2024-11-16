import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import emailjs from 'emailjs-com'; // Import EmailJS
import './Auth.css'; // Import your custom CSS if needed

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

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Validate form input
    const validateForm = () => {
        const { name, email, password, address, phone_number } = formData;
        if (!name || !email || !password || !address || !phone_number) {
            setErrorMessage('All fields are required!');
            return false;
        }
        return true;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        // Validate form before submitting
        if (!validateForm()) {
            return;
        }

        try {
            const response = await axios.post('https://amazon-cp0v.onrender.com/register', formData, { withCredentials: true });
            alert(response.data.message);

            const { token } = response.data;
            if (token) {
                Cookies.set('token', token);
            }

            // Send welcome email to the user
            await sendEmailToUser();

            // Send notification email to admin
            await sendEmailToAdmin();

            // Redirect to login page after successful registration
            navigate('/login');
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Error registering. Please try again.');
        }
    };

    // Send a welcome email to the user via EmailJS
    const sendEmailToUser = async () => {
        try {
            await emailjs.send('service_3ygj9sb', 'template_lgsd1ga', {
                to_name: formData.name,
                to_email: formData.email,
                message: 'Welcome to our shop! We’re delighted to have you join us. Explore our range of products and enjoy exclusive deals and offers. Happy shopping!',
            }, 'rHMCfjJwQ86mQP0Cp');
            console.log('User email sent successfully');
        } catch (error) {
            console.error('Error sending user email:', error.text);
        }
    };

    // Send notification email to the admin via EmailJS
    const sendEmailToAdmin = async () => {
        try {
            await emailjs.send('service_3ygj9sb', 'template_yu5vasp', {
                admin_email: 'codeazon415@gmail.com', // Replace with your admin email
                user_name: formData.name,
                user_email: formData.email,
                user_phone: formData.phone_number,
                user_address: formData.address,
            }, 'rHMCfjJwQ86mQP0Cp');
            console.log('Admin notification sent successfully');
        } catch (error) {
            console.error('Error sending admin notification:', error.text);
        }
    };

    // Styles for the page and form container
    const containerStyle = {
        backgroundColor: 'black',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        padding: '20px',
    };

    const formStyle = {
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '30px',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '450px',
    };

    const inputStyle = {
        width: '100%',
        marginBottom: '15px',
        padding: '12px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        fontSize: '16px',
    };

    const buttonStyle = {
        width: '100%',
        padding: '12px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        borderRadius: '5px',
        fontSize: '16px',
    };

    const errorStyle = {
        color: 'red',
        fontSize: '14px',
        marginTop: '10px',
    };

    const linkStyle = {
        color: '#fff',
        textDecoration: 'underline',
    };

    return (
        <div style={containerStyle}>
            <div style={formStyle}>
                <h2>Sign Up</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />
                    <input
                        name="address"
                        placeholder="Address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />
                    <input
                        name="phone_number"
                        placeholder="Phone Number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />
                    <button type="submit" style={buttonStyle}>Register</button>
                </form>

                {errorMessage && <p style={errorStyle}>{errorMessage}</p>}

                <p style={{ fontSize: '14px' }}>
                    Already have an account? <a href="/login" style={linkStyle}>Login here</a>
                </p>
            </div>
        </div>
    );
};

export default Signup;
