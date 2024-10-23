import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

// Function to fetch the currently logged-in user's details
const fetchUserDetails = async () => {
  try {
    const user_id = Cookies.get("user_id");
    if (!user_id) throw new Error("User ID not found in cookies");

    const response = await fetch(`http://127.0.0.1:5555/users/${user_id}`, {
      credentials: "include", // Ensure cookies are included with the request
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user details");
    }

    const data = await response.json();
    console.log("User details fetched successfully:", data);
    return data;
  } catch (err) {
    console.error("Error fetching user details:", err.message);
    throw err;
  }
};

// Function to fetch user orders using cookies
const fetchUserOrders = async () => {
  try {
    const user_id = Cookies.get("user_id");
    if (!user_id) throw new Error("User ID not found in cookies");

    const response = await fetch(`http://127.0.0.1:5555/orders/${user_id}`, {
      credentials: "include", // Ensure cookies are included with the request
    });

    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    const data = await response.json();
    console.log("User orders fetched successfully:", data);
    return data;
  } catch (err) {
    console.error("Error fetching user orders:", err.message);
    throw err;
  }
};

const ProfilePage = () => {
  // Initialize state from cookies or empty values
  const [user, setUser] = useState({
    name: Cookies.get("user_name") || "",
    email: Cookies.get("user_email") || "",
    phone_number: Cookies.get("user_phone") || "", // Changed to phone_number
    address: Cookies.get("user_address") || "",
  });

  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [viewOrders, setViewOrders] = useState(false);
  const [updatedUser, setUpdatedUser] = useState(user); // Start with user details from cookies
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch user details once when the component mounts
    fetchUserDetails()
      .then((userDetails) => {
        setUser(userDetails);
        setUpdatedUser(userDetails); // Initialize updatedUser with fetched userDetails
        console.log("User state set:", userDetails);
      })
      .catch((err) => {
        setError(err.message);
        console.error("Error in fetching user details:", err.message);
      });

    // Fetch user orders once when the component mounts
    fetchUserOrders()
      .then((userOrders) => {
        setOrders(userOrders);
        console.log("Orders state set:", userOrders);
      })
      .catch((err) => {
        setError(err.message);
        console.error("Error in fetching user orders:", err.message);
      });
  }, []); // Empty dependency array ensures this runs only once, when the component mounts

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    console.log("Edit mode toggled:", !isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prev) => ({ ...prev, [name]: value }));
    console.log(`Field '${name}' updated to:`, value);
  };

  const handleSave = async () => {
    try {
      const response = await axios.patch(
        `http://127.0.0.1:5555/users/${user.id}`,
        updatedUser,  // Only send the updated fields
        {
          withCredentials: true, // Ensure cookies are included with the request
        }
      );
      console.log("Updated user details:", response.data);
      setUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user details:", error);
      setError("Failed to save changes.");
    }
  };

  const handleSignOut = async () => {
    try {
      await axios.post(
        "http://127.0.0.1:5555/logout",
        {},
        {
          withCredentials: true, // Ensure cookies are included with the request
        }
      );
      // Clear cookies on sign out
      Cookies.remove("user_id");
      Cookies.remove("user_name");
      Cookies.remove("user_email");
      Cookies.remove("user_phone");
      Cookies.remove("user_address");
      console.log("User signed out, cookies cleared");
      alert("Logout successful!");
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Error logging out. Please try again.");
    }
  };

  const handleSwitchAccount = () => {
    console.log("Switching account");
  };

  const toggleOrders = () => {
    setViewOrders(!viewOrders);
    console.log("Orders view toggled:", !viewOrders);
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
                  value={updatedUser.name || ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={updatedUser.email || ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Phone:</label>
                <input
                  type="tel"
                  name="phone_number" // Changed to phone_number
                  value={updatedUser.phone_number || ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Address:</label>
                <input
                  type="text"
                  name="address"
                  value={updatedUser.address || ""}
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
                <span>{user.phone_number}</span> {/* Changed to phone_number */}
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

      {/* Show error if any */}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default ProfilePage;