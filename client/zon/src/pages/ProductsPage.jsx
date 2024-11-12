import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import VIP1 from "../assets/productsImages/V1P1.jpeg"; // VIP1 Product 1 image
import VIP2 from "../assets/productsImages/V1P2.jpeg"; // VIP1 Product 2 image
import VIP3 from "../assets/productsImages/V1P3.jpeg"; // VIP1 Product 3 image
import VIP4 from "../assets/productsImages/V1P4.jpeg"; // VIP1 Product 4 image
import VIP5 from "../assets/productsImages/V1P5.jpeg"; // VIP1 Product 5 image

function ProductPage() {
  const [balance, setBalance] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(
    parseFloat(localStorage.getItem("totalEarnings")) || 0
  );
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchaseError, setPurchaseError] = useState("");
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const user_id = Cookies.get("user_id");
        if (!user_id) throw new Error("User ID not found");

        const response = await axios.get(`https://amazon-cp0v.onrender.com/users/${user_id}/balance`, {
          withCredentials: true,
        });

        if (response.status === 200) {
          setBalance(response.data.balance);
          if (totalEarnings === 0) {
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
            await axios.post(`https://amazon-cp0v.onrender.com/users/${user_id}/initialize-balance`, { amount: 0 });
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

  useEffect(() => {
    localStorage.setItem("totalEarnings", totalEarnings.toFixed(2));
  }, [totalEarnings]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("https://amazon-cp0v.onrender.com/products");
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
        shipping_address: "123 Main St, Anytown, USA",
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
          `https://amazon-cp0v.onrender.com/orders/${user_id}`,
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
          `https://amazon-cp0v.onrender.com/orders/${orderId}/items`,
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
        `https://amazon-cp0v.onrender.com/users/${user_id}/balance`,
        { amount: newBalance },
        { headers: { "Content-Type": "application/json" } }
      );

      if (balanceUpdateResponse.status === 200) {
        setBalance(newBalance);

        const earningsUpdateResponse = await axios.patch(
          `https://amazon-cp0v.onrender.com/users/${user_id}/update-earnings`,
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

  const getBackgroundImage = (product) => {
    switch (product.name) {
      case "VIP1 Product 1":
        return `url(${VIP1})`;
      case "VIP1 Product 2":
        return `url(${VIP2})`;
      case "VIP1 Product 3":
        return `url(${VIP3})`;
      case "VIP1 Product 4":
        return `url(${VIP4})`;
      case "VIP1 Product 5":
        return `url(${VIP5})`;
      default:
        return `url(${product.imageUrl})`;
    }
  };

  const isCategoryLocked = (category) => {
    if (totalEarnings === 0) {
      return true;
    }
    if (totalEarnings > 0 && totalEarnings < 200 && category !== "VIP1") {
      return true;
    }
    if (totalEarnings >= 200 && totalEarnings < 300 && category === "VIP3") {
      return true;
    }
    return false;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="product-page" style={{ paddingTop: '60px' }}>
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
                <div
                  key={product.id}
                  className="product-item"
                  style={{
                    backgroundImage: getBackgroundImage(product),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '200px',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '5px',
                    marginBottom: '20px',
                    position: 'relative',
                    opacity: isCategoryLocked(category) ? 0.5 : 1, // Make locked items semi-transparent
                    pointerEvents: isCategoryLocked(category) ? 'none' : 'auto', // Disable interaction for locked items
                  }}
                >
                  {isCategoryLocked(category) && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        fontSize: '24px',
                        fontWeight: 'bold',
                      }}
                    >
                      Locked
                    </div>
                  )}
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <p>Price: ${product.price}</p>
                  <p>Commission: ${(product.price * product.commission).toFixed(2)}</p>
                  {!isCategoryLocked(category) && (
                    <button onClick={() => handleBuy(product)}>Buy</button>
                  )}
                </div>
              ))
            ) : (
              <p>No products available for this category.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductPage;
