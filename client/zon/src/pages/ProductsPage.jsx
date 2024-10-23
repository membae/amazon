import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

function ProductPage() {
  const [balance, setBalance] = useState(0); // Initialize balance to 0
  const [products, setProducts] = useState([]); // State to store products
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(""); // State for error handling
  const [purchaseError, setPurchaseError] = useState(""); // State for purchase error

  // Fetch the user's balance when the component loads
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const user_id = Cookies.get("user_id"); // Assuming user_id is stored in cookies
        if (!user_id) throw new Error("User ID not found");

        const response = await axios.get(`http://127.0.0.1:5555/users/${user_id}/balance`, {
          withCredentials: true, // Send cookies with the request if needed
        });

        if (response.status === 200) {
          setBalance(response.data.balance); // Update balance
        } else {
          throw new Error("Failed to fetch balance");
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchBalance();
  }, []);

  // Fetch products from the backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5555/products"); // Replace with your actual API endpoint for products
        if (response.status === 200) {
          setProducts(response.data); // Assuming the products are returned in response.data
          setLoading(false); // Stop loading once products are fetched
        } else {
          throw new Error("Failed to fetch products");
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle product purchase
  const handleBuy = async (product) => {
    setPurchaseError(""); // Clear any previous purchase errors

    if (balance >= product.price) {
      // Sufficient balance
      try {
        const user_id = Cookies.get("user_id"); // Assuming user_id is stored in cookies

        // Perform purchase logic (this could involve deducting balance on the server and saving the transaction)
        const response = await axios.post(`http://127.0.0.1:5555/users/${user_id}/purchase`, {
          product_id: product.id, // Send product ID to purchase
          price: product.price, // Send product price
        });

        if (response.status === 200) {
          // Deduct balance and update state
          setBalance((prevBalance) => prevBalance - product.price);
        } else {
          throw new Error("Purchase failed");
        }
      } catch (err) {
        setPurchaseError("An error occurred while processing your purchase.");
      }
    } else {
      // Insufficient balance
      setPurchaseError("Insufficient balance to purchase this product.");
    }
  };

  // Filter products by category (VIP1, VIP2, VIP3)
  const categoryLevelMap = {
    1: "VIP1",
    2: "VIP2",
    3: "VIP3",
  };

  const vip1Products = products.filter((product) => categoryLevelMap[product.category_id] === "VIP1");
  const vip2Products = products.filter((product) => categoryLevelMap[product.category_id] === "VIP2");
  const vip3Products = products.filter((product) => categoryLevelMap[product.category_id] === "VIP3");

  // Display loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>; // Display error if there's an issue
  }

  return (
    <div className="product-page">
      <h1>Your Account Balance</h1>
      <h2>${balance.toFixed(2)}</h2> {/* Display the balance */}

      {/* Display purchase error if any */}
      {purchaseError && <div style={{ color: "red" }}>{purchaseError}</div>}

      <h2>VIP1 Products</h2>
      <div className="product-list">
        {vip1Products.length > 0 ? (
          vip1Products.map((product) => (
            <div key={product.id} className="product-item">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p>Price: ${product.price}</p>
              <button onClick={() => handleBuy(product)}>Buy</button> {/* Add Buy button */}
            </div>
          ))
        ) : (
          <p>No VIP1 products available.</p>
        )}
      </div>

      <h2>VIP2 Products</h2>
      <div className="product-list">
        {vip2Products.length > 0 ? (
          vip2Products.map((product) => (
            <div key={product.id} className="product-item">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p>Price: ${product.price}</p>
              <button onClick={() => handleBuy(product)}>Buy</button> {/* Add Buy button */}
            </div>
          ))
        ) : (
          <p>No VIP2 products available.</p>
        )}
      </div>

      <h2>VIP3 Products</h2>
      <div className="product-list">
        {vip3Products.length > 0 ? (
          vip3Products.map((product) => (
            <div key={product.id} className="product-item">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p>Price: ${product.price}</p>
              <button onClick={() => handleBuy(product)}>Buy</button> {/* Add Buy button */}
            </div>
          ))
        ) : (
          <p>No VIP3 products available.</p>
        )}
      </div>
    </div>
  );
}

export default ProductPage;
