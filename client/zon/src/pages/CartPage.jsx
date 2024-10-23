import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

// Fetch the shopping cart for a specific user
const fetchUserCart = async (userId) => {
  try {
    const response = await fetch(`http://127.0.0.1:5555/users/${userId}/cart`, {
      credentials: 'include', // Include cookies in the request
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }

    const data = await response.json();
    console.log('User cart fetched successfully:', data);
    return data; // Return the array of cart items
  } catch (err) {
    console.error('Error fetching user cart:', err.message);
    throw err;
  }
};

// Fetch the user details (including the name)
const fetchUserDetails = async (userId) => {
  try {
    const response = await fetch(`http://127.0.0.1:5555/users/${userId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user details');
    }

    const data = await response.json();
    console.log('User details fetched successfully:', data);
    return data; // Return the user details
  } catch (err) {
    console.error('Error fetching user details:', err.message);
    throw err;
  }
};

// Add a product to the user's cart
const addToCart = async (userId, productId, quantity) => {
  try {
    const response = await fetch(`http://127.0.0.1:5555/users/${userId}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies in the request
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add product to cart: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Product added to cart successfully:', data);
    return data; // Return the newly added cart item
  } catch (err) {
    console.error('Error adding product to cart:', err.message);
    throw err;
  }
};

// Remove a product from the cart
const removeFromCart = async (userId, cartItemId) => {
  try {
    const response = await fetch(`http://127.0.0.1:5555/users/${userId}/cart/${cartItemId}`, {
      method: 'DELETE',
      credentials: 'include', // Include cookies in the request
    });

    if (!response.ok) {
      throw new Error(`Failed to remove product from cart: ${response.statusText}`);
    }

    console.log('Product removed from cart successfully');
  } catch (err) {
    console.error('Error removing product from cart:', err.message);
    throw err;
  }
};

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [userName, setUserName] = useState('');
  const userId = Cookies.get('user_id'); // Get the user ID from cookies or any auth context

  // Fetch user name and cart when the component mounts
  useEffect(() => {
    const loadUserDataAndCart = async () => {
      try {
        // Fetch user details and cart data
        const userDetails = await fetchUserDetails(userId);
        setUserName(userDetails.name); // Set the user name in state

        const cartData = await fetchUserCart(userId); // Fetch the cart data
        setCartItems(cartData); // Set the cart items
      } catch (err) {
        console.error('Error loading cart or user details:', err);
      }
    };
    loadUserDataAndCart();
  }, [userId]);

  // Handle adding product to cart
  const handleAddToCart = async (productId) => {
    try {
      await addToCart(userId, productId, 1); // Add 1 quantity of the product to cart
      const updatedCart = await fetchUserCart(userId); // Fetch updated cart after adding
      setCartItems(updatedCart); // Update state with the new cart items
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  // Handle removing product from cart
  const handleRemoveFromCart = async (cartItemId) => {
    try {
      await removeFromCart(userId, cartItemId); // Remove item from the cart
      const updatedCart = await fetchUserCart(userId); // Fetch updated cart after removing
      setCartItems(updatedCart); // Update state with the new cart items
    } catch (err) {
      console.error('Error removing from cart:', err);
    }
  };

  return (
    <div>
      <h2>{userName ? `${userName}'s Cart` : 'Your Cart'}</h2>
      {cartItems.length === 0 ? (
        <p>No items in your cart</p>
      ) : (
        <ul>
          {cartItems.map((item) => (
            <li key={item.cart_item_id}>
              Product ID: {item.product_id} - Quantity: {item.quantity}
              <button onClick={() => handleRemoveFromCart(item.cart_item_id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      {/* Example button to add a product to the cart */}
      <button onClick={() => handleAddToCart(1)}>Add Product 1 to Cart</button>
    </div>
  );
};

export default CartPage;
