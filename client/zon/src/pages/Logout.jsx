import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const navigate = useNavigate(); // Get the navigate function for navigation

    const handleLogout = async () => {
        try {
            await axios.post('/http://127.0.0.1:5555/logout'); // Logout API call
            sessionStorage.removeItem('user'); // Clear user from session storage
            alert('Logout successful!');
            navigate('/login'); // Redirect to the sign-in page
        } catch (error) {
            alert('Error logging out.'); // Handle error
        }
    };

    return <button onClick={handleLogout}>Logout</button>;
};
