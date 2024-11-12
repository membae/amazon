import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

// Function to fetch the currently logged-in user's details
const fetchUserDetails = async () => {
  try {
    const user_id = Cookies.get("user_id");
    if (!user_id) throw new Error("User ID not found in cookies");

    const response = await fetch(`https://amazon-cp0v.onrender.com/users/${user_id}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user details");
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching user details:", err.message);
    throw err;
  }
};

// Function to fetch user orders
const fetchUserOrders = async () => {
  try {
    const user_id = Cookies.get("user_id");
    if (!user_id) throw new Error("User ID not found in cookies");

    const response = await fetch(`https://amazon-cp0v.onrender.com/orders/${user_id}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching user orders:", err.message);
    throw err;
  }
};

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [viewOrders, setViewOrders] = useState(false);
  const [error, setError] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true); // Loading state for user
  const [balance, setBalance] = useState(0); // Balance state

  useEffect(() => {
    const loadUserData = async () => {
      setLoadingUser(true);
      try {
        const userDetails = await fetchUserDetails();
        setUser(userDetails);

        // Fetch user balance
        const balanceResponse = await axios.get(
          `https://amazon-cp0v.onrender.com/users/${userDetails.id}/balance`,
          { withCredentials: true }
        );
        setBalance(balanceResponse.data.balance);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    const loadUserOrders = async () => {
      setLoadingOrders(true);
      try {
        const userOrders = await fetchUserOrders();
        setOrders(userOrders);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingOrders(false);
      }
    };

    loadUserOrders();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await axios.patch(
        `https://amazon-cp0v.onrender.com/users/${user.id}`,
        user,
        {
          withCredentials: true,
        }
      );
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user details:", error);
      setError("Failed to save changes.");
    }
  };

  const handleSignOut = async () => {
    try {
      await axios.post(
        "https://amazon-cp0v.onrender.com/logout",
        {},
        {
          withCredentials: true,
        }
      );
      Cookies.remove("user_id");
      alert("Logout successful!");
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Error logging out. Please try again.");
    }
  };

  const toggleOrders = () => {
    setViewOrders(!viewOrders);
  };

  if (loadingUser) {
    return <p>Loading user details...</p>;
  }

  return (
    <div className="profile-page" style={{ paddingTop: '60px' }}>
      <h1>Your Profile</h1>
      <h2>Balance: ${balance.toFixed(2)}</h2>

      <div className="action-buttons">
        <button onClick={handleSignOut}>Sign Out</button>
        <button onClick={toggleOrders}>
          {viewOrders ? "Hide Orders" : "Your Orders"}
        </button>
        <button onClick={handleEditToggle}>
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <div className="profile-details">
        {isEditing ? (
          <>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={user.name || ""}
              onChange={handleChange}
            />
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={user.email || ""}
              onChange={handleChange}
            />
            <label>Phone:</label>
            <input
              type="tel"
              name="phone_number"
              value={user.phone_number || ""}
              onChange={handleChange}
            />
            <label>Address:</label>
            <input
              type="text"
              name="address"
              value={user.address || ""}
              onChange={handleChange}
            />
            <button onClick={handleSave} className="save-button">
              Save
            </button>
          </>
        ) : (
          <>
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
              <span>{user.phone_number}</span>
            </div>
            <div>
              <label>Address:</label>
              <span>{user.address}</span>
            </div>
          </>
        )}
      </div>

      {viewOrders && (
        <div className="orders-section">
          <h2>Your Orders</h2>
          {loadingOrders ? (
            <p>Loading orders...</p>
          ) : orders.length > 0 ? (
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

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default ProfilePage;
