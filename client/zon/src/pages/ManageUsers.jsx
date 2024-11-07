import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [updatedUser, setUpdatedUser] = useState({ name: '', email: '', role: '', balance: 0, total_earnings: 0 });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5555/users');
        if (response.status === 200) {
          setUsers(response.data);
        } else {
          throw new Error("Failed to fetch users");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleEditClick = (user) => {
    setEditingUserId(user.id);
    setUpdatedUser({
      name: user.name,
      email: user.email,
      role: user.role,
      balance: user.balance,
      total_earnings: user.total_earnings,
    });
  };

  const handleUpdateUser = async (userId) => {
    try {
      const response = await axios.patch(`http://127.0.0.1:5555/users/${userId}`, updatedUser);
      if (response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user.id === userId ? { ...user, ...updatedUser } : user))
        );
        setEditingUserId(null);
      } else {
        throw new Error("Failed to update user");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
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
              <th>Role</th>
              <th>Total Earnings</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
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
                    <input
                      type="text"
                      name="role"
                      value={updatedUser.role}
                      onChange={handleInputChange}
                    />
                  ) : (
                    user.role
                  )}
                </td>
                <td>
                  {editingUserId === user.id ? (
                    <input
                      type="number"
                      name="total_earnings"
                      value={updatedUser.total_earnings}
                      onChange={handleInputChange}
                    />
                  ) : (
                    `$${Number(user.total_earnings).toFixed(2)}`
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
        <p>No users found.</p>
      )}
    </div>
  );
}

export default ManageUsers;
