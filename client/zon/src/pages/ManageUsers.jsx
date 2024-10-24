import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ManageUsers() {
  const [users, setUsers] = useState([]); // State to hold user data
  const [loading, setLoading] = useState(true); // State to track loading status
  const [error, setError] = useState(""); // State to hold error messages
  const [editingUserId, setEditingUserId] = useState(null); // State to track the user being edited
  const [updatedUser, setUpdatedUser] = useState({ name: '', email: '', balance: 0 }); // State for updated user data

  // Fetch users from the database when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5555/users'); // Adjust the URL based on your backend
        if (response.status === 200) {
          setUsers(response.data); // Set the users state with the fetched data
        } else {
          throw new Error("Failed to fetch users");
        }
      } catch (err) {
        setError(err.message); // Set the error message if there's an error
      } finally {
        setLoading(false); // Set loading to false regardless of success or error
      }
    };

    fetchUsers(); // Call the function to fetch users
  }, []); // Empty dependency array to run only on mount

  const handleEditClick = (user) => {
    setEditingUserId(user.id); // Set the user ID to edit
    setUpdatedUser({ name: user.name, email: user.email, balance: user.balance }); // Pre-fill the form with current user data
  };

  const handleUpdateUser = async (userId) => {
    try {
      const response = await axios.patch(`http://127.0.0.1:5555/users/${userId}`, updatedUser); // Update user API call
      if (response.status === 200) {
        setUsers((prevUsers) => 
          prevUsers.map((user) => (user.id === userId ? { ...user, ...updatedUser } : user))
        ); // Update the users state with the new data
        setEditingUserId(null); // Reset editing state
      }
    } catch (err) {
      setError(err.message); // Handle error
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prev) => ({ ...prev, [name]: value })); // Update user data in state
  };

  if (loading) {
    return <div>Loading users...</div>; // Display loading message
  }

  if (error) {
    return <div>Error: {error}</div>; // Display error message
  }

  return (
    <div>
      <h1>Manage Users</h1>
      {users.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Balance</th>
              <th>Actions</th> {/* Add actions column */}
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>
                  {editingUserId === user.id ? (
                    <input
                      type="text"
                      name="name"
                      value={updatedUser.name}
                      onChange={handleInputChange}
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td>
                  {editingUserId === user.id ? (
                    <input
                      type="email"
                      name="email"
                      value={updatedUser.email}
                      onChange={handleInputChange}
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td>
                  {editingUserId === user.id ? (
                    <input
                      type="number"
                      name="balance"
                      value={updatedUser.balance}
                      onChange={handleInputChange}
                    />
                  ) : (
                    `$${Number(user.balance).toFixed(2)}`
                  )}
                </td>
                <td>
                  {editingUserId === user.id ? (
                    <button onClick={() => handleUpdateUser(user.id)}>Save</button>
                  ) : (
                    <button onClick={() => handleEditClick(user)}>Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No users found.</p> // Display message if no users
      )}
    </div>
  );
}

export default ManageUsers;
