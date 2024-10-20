import React, { useState, useEffect } from "react";

// Mock functions to simulate fetching user and order details (replace with your actual API calls)
const fetchUserDetails = () => {
  return {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    address: "123 Main St, Springfield",
  };
};

const fetchUserOrders = () => {
  return [
    { id: 1, product: "Laptop", date: "2024-10-10", price: "$1200" },
    { id: 2, product: "Smartphone", date: "2024-09-20", price: "$800" },
  ];
};

const ProfilePage = () => {
  const [user, setUser] = useState({});
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [viewOrders, setViewOrders] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({});

  useEffect(() => {
    const userDetails = fetchUserDetails();
    const userOrders = fetchUserOrders();
    setUser(userDetails);
    setUpdatedUser(userDetails);
    setOrders(userOrders);
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // API call to update user details
    console.log("Updated user details:", updatedUser);
    setUser(updatedUser);
    setIsEditing(false);
  };

  const handleSignOut = () => {
    // Logic for signing out the user
    console.log("User signed out");
  };

  const handleSwitchAccount = () => {
    // Logic for switching accounts
    console.log("Switching account");
  };

  const toggleOrders = () => {
    setViewOrders(!viewOrders);
  };

  return (
    <div className="profile-page">
      <h1>User Profile</h1>

      {/* Buttons for various actions */}
      <div className="action-buttons">
        <button onClick={handleSwitchAccount}>Switch Account</button>
        <button onClick={handleSignOut}>Sign Out</button>
        <button onClick={toggleOrders}>
          {viewOrders ? "Hide Orders" : "Your Orders"}
        </button>
        <button onClick={handleEditToggle}>
          {isEditing ? "Cancel" : "Profile Details"}
        </button>
      </div>

      {/* Display user details or edit form */}
      {!viewOrders && (
        <div className="profile-details">
          {isEditing ? (
            <div>
              <div>
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={updatedUser.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={updatedUser.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Phone:</label>
                <input
                  type="tel"
                  name="phone"
                  value={updatedUser.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Address:</label>
                <input
                  type="text"
                  name="address"
                  value={updatedUser.address}
                  onChange={handleChange}
                />
              </div>

              <button onClick={handleSave} className="save-button">
                Save
              </button>
            </div>
          ) : (
            <div>
              <div>
                <label>Name:</label>
                <span>{user.name}</span>
              </div>

              <div>
                <label>Email:</label>
                <span>{user.email}</span>
              </div>

              <div>
                <label>Phone:</label>
                <span>{user.phone}</span>
              </div>

              <div>
                <label>Address:</label>
                <span>{user.address}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Display user's orders if 'Your Orders' is clicked */}
      {viewOrders && (
        <div className="orders-section">
          <h2>Your Orders</h2>
          {orders.length > 0 ? (
            <ul className="orders-list">
              {orders.map((order) => (
                <li key={order.id}>
                  <strong>{order.product}</strong>
                  <p>Date: {order.date}</p>
                  <p>Price: {order.price}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No orders found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
