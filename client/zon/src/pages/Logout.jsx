// src/components/Auth/Logout.js
import React from 'react';
import axios from 'axios';

const Logout = () => {
    const handleLogout = async () => {
        try {
            await axios.post('/api/logout');
            sessionStorage.removeItem('user'); // Clear user from session storage
            alert('Logout successful!');
        } catch (error) {
            alert('Error logging out.'); // Handle error
        }
    };

    return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;
