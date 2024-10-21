import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const navigate = useNavigate(); // Get the navigate function for navigation

    const handleLogout = async () => {
        try {
            await axios.post('/api/logout'); // Logout API call
            sessionStorage.removeItem('user'); // Clear user from session storage
            alert('Logout successful!');
            navigate('/signin'); // Redirect to the sign-in page
        } catch (error) {
            alert('Error logging out.'); // Handle error
        }
    };

    return <button onClick={handleLogout}>Logout</button>;
};
