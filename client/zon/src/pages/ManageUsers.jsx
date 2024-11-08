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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Manage Users</h1>
      {users.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={tableHeaderStyle}>User ID</th>
              <th style={tableHeaderStyle}>Name</th>
              <th style={tableHeaderStyle}>Email</th>
              <th style={tableHeaderStyle}>Balance</th>
              <th style={tableHeaderStyle}>Role</th>
              <th style={tableHeaderStyle}>Total Earnings</th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={tableCellStyle}>{user.id}</td>
                <td style={tableCellStyle}>
                  {editingUserId === user.id ? (
                    <input
                      type="text"
                      name="name"
                      value={updatedUser.name}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td style={tableCellStyle}>
                  {editingUserId === user.id ? (
                    <input
                      type="email"
                      name="email"
                      value={updatedUser.email}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td style={tableCellStyle}>
                  {editingUserId === user.id ? (
                    <input
                      type="number"
                      name="balance"
                      value={updatedUser.balance}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  ) : (
                    `$${Number(user.balance).toFixed(2)}`
                  )}
                </td>
                <td style={tableCellStyle}>
                  {editingUserId === user.id ? (
                    <input
                      type="text"
                      name="role"
                      value={updatedUser.role}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  ) : (
                    user.role
                  )}
                </td>
                <td style={tableCellStyle}>
                  {editingUserId === user.id ? (
                    <input
                      type="number"
                      name="total_earnings"
                      value={updatedUser.total_earnings}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  ) : (
                    `$${Number(user.total_earnings).toFixed(2)}`
                  )}
                </td>
                <td style={tableCellStyle}>
                  {editingUserId === user.id ? (
                    <button onClick={() => handleUpdateUser(user.id)} style={saveButtonStyle}>Save</button>
                  ) : (
                    <button onClick={() => handleEditClick(user)} style={editButtonStyle}>Edit</button>
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

// Styles for the table, input, and buttons
const tableHeaderStyle = {
  padding: '12px',
  textAlign: 'left',
  backgroundColor: '#f4f4f4',
  border: '1px solid #ddd',
};

const tableCellStyle = {
  padding: '10px',
  border: '1px solid #ddd',
  textAlign: 'center',
};

const inputStyle = {
  padding: '8px',
  width: '90%',
  border: '1px solid #ccc',
  borderRadius: '4px',
  boxSizing: 'border-box',
};

const editButtonStyle = {
  padding: '8px 16px',
  backgroundColor: '#008cba',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const saveButtonStyle = {
  padding: '8px 16px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

export default ManageUsers;
