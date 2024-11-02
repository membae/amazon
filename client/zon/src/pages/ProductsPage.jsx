import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

function ProductPage() {
  const [balance, setBalance] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(
    parseFloat(localStorage.getItem("totalEarnings")) || 0
  ); // Initialize from localStorage
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchaseError, setPurchaseError] = useState("");
  const [orderId, setOrderId] = useState(null);

  // Fetch the user's balance when the component loads
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const user_id = Cookies.get("user_id");
        if (!user_id) throw new Error("User ID not found");

        const response = await axios.get(`http://127.0.0.1:5555/users/${user_id}/balance`, {
          withCredentials: true,
        });

        if (response.status === 200) {
          setBalance(response.data.balance);
          if (totalEarnings === 0) {
            // Initialize total earnings only if not set
            setTotalEarnings(response.data.balance);
          }
        } else {
          throw new Error("Failed to fetch balance");
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setBalance(0);
          setTotalEarnings(0);

          try {
            const user_id = Cookies.get("user_id");
            await axios.post(`http://127.0.0.1:5555/users/${user_id}/initialize-balance`, { amount: 0 });
          } catch (initializeError) {
            console.error("Failed to initialize balance:", initializeError);
          }
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  // Save totalEarnings to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("totalEarnings", totalEarnings.toFixed(2));
  }, [totalEarnings]);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5555/products");
        console.log(response.data);
        if (response.status === 200) {
          setProducts(response.data);
        } else {
          throw new Error("Failed to fetch products");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle product purchase
  const handleBuy = async (product) => {
    setPurchaseError("");
  
    const commissionAmount = product.price * product.commission;
    const totalCost = product.price - commissionAmount;
  
    if (balance < totalCost) {
      setPurchaseError("Insufficient balance.");
      return;
    }
  
    try {
      const user_id = Cookies.get("user_id");
  
      const orderData = {
        shipping_address: "123 Main St, Anytown, USA", // Replace with user-provided address
        payment_method: "mpesa",
        order_items: [
          {
            product_id: product.id,
            quantity: 1,
            price_at_purchase: product.price,
            commission: commissionAmount,
          },
        ],
      };
  
      if (!orderId) {
        const newOrderResponse = await axios.post(
          `http://127.0.0.1:5555/orders/${user_id}`,
          orderData,
          { headers: { "Content-Type": "application/json" } }
        );
        if (newOrderResponse.status === 201) {
          setOrderId(newOrderResponse.data.order_id);
        } else {
          throw new Error("Failed to create a new order");
        }
      } else {
        const updateOrderResponse = await axios.post(
          `http://127.0.0.1:5555/orders/${orderId}/items`,
          {
            product_id: product.id,
            quantity: 1,
            price_at_purchase: product.price,
            commission: commissionAmount,
          },
          { headers: { "Content-Type": "application/json" } }
        );
  
        if (updateOrderResponse.status !== 201) {
          throw new Error("Failed to add item to the order");
        }
      }
  
      const newBalance = balance - totalCost;
      const balanceUpdateResponse = await axios.patch(
        `http://127.0.0.1:5555/users/${user_id}/balance`,
        { amount: newBalance },
        { headers: { "Content-Type": "application/json" } }
      );
  
      if (balanceUpdateResponse.status === 200) {
        setBalance(newBalance);
  
        // Update total earnings in the database with commission amount
        const earningsUpdateResponse = await axios.patch(
          `http://127.0.0.1:5555/users/${user_id}/update-earnings`,
          { commission: commissionAmount },
          { headers: { "Content-Type": "application/json" } }
        );
  
        if (earningsUpdateResponse.status === 200) {
          setTotalEarnings(earningsUpdateResponse.data.total_earnings);
        } else {
          throw new Error("Failed to update total earnings in the database");
        }
      } else {
        throw new Error("Failed to update balance");
      }
    } catch (err) {
      setPurchaseError(err.message);
    }
  };
  

  const categoryLevelMap = {
    1: "VIP1",
    2: "VIP2",
    3: "VIP3",
  };

  const categorizedProducts = {
    VIP1: products.filter((product) => categoryLevelMap[product.category_id] === "VIP1"),
    VIP2: products.filter((product) => categoryLevelMap[product.category_id] === "VIP2"),
    VIP3: products.filter((product) => categoryLevelMap[product.category_id] === "VIP3"),
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="product-page">
      <h1>Your Account Balance</h1>
      <h2>${balance.toFixed(2)}</h2>
      <h2>Total Earnings: ${totalEarnings.toFixed(2)}</h2>

      {purchaseError && <div style={{ color: "red" }}>{purchaseError}</div>}

      {Object.entries(categorizedProducts).map(([category, items]) => (
        <div key={category}>
          <h2>{category} Products</h2>
          <div className="product-list">
            {items.length > 0 ? (
              items.map((product) => (
                <div key={product.id} className="product-item">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <p>Price: ${product.price}</p>
                  <p>Commission: ${(product.price * product.commission).toFixed(2)}</p>
                  <button onClick={() => handleBuy(product)}>Make an Order</button>
                </div>
              ))
            ) : (
              <p>No {category} products available.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductPage;
