import React, { useEffect, useState } from "react";

function ProductPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false); // State to toggle cart visibility

  useEffect(() => {
    fetch("http://127.0.0.1:5555/products")
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error("Error fetching products:", error));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => [...prevCart, product]);
  };

  const removeFromCart = (index) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const cartTotal = cart.reduce((total, product) => total + product.price, 0);

  const categoryLevelMap = {
    1: "VIP1",
    2: "VIP2",
    3: "VIP3",
  };

  const vip1Products = products.filter(product => categoryLevelMap[product.category_id] === "VIP1");
  const vip2Products = products.filter(product => categoryLevelMap[product.category_id] === "VIP2");
  const vip3Products = products.filter(product => categoryLevelMap[product.category_id] === "VIP3");

  return (
    <div>
      <h1>Products</h1>

      <div className="product-group">
        <h2>VIP1 Products</h2>
        <div className="product-list">
          {vip1Products.map((product) => (
            <div key={product.id} className="product-item">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p>Price: ${product.price}</p>
              <button onClick={() => addToCart(product)}>Add to Cart</button>
            </div>
          ))}
        </div>
      </div>

      <div className="product-group">
        <h2>VIP2 Products</h2>
        <div className="product-list">
          {vip2Products.map((product) => (
            <div key={product.id} className="product-item">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p>Price: ${product.price}</p>
              <button onClick={() => addToCart(product)}>Add to Cart</button>
            </div>
          ))}
        </div>
      </div>

      <div className="product-group">
        <h2>VIP3 Products</h2>
        <div className="product-list">
          {vip3Products.map((product) => (
            <div key={product.id} className="product-item">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p>Price: ${product.price}</p>
              <button onClick={() => addToCart(product)}>Add to Cart</button>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Icon */}
      <div className="cart-icon" onClick={toggleCart}>
        <span role="img" aria-label="cart">🛒</span>
        <div className="cart-count">{cart.length}</div>
      </div>

      {/* Cart Dropdown */}
      {isCartOpen && (
        <div className="cart">
          <h2>Your Cart</h2>
          <div className="cart-items">
            {cart.length > 0 ? (
              cart.map((item, index) => (
                <div key={index} className="cart-item">
                  <h3>{item.name}</h3>
                  <p>Price: ${item.price}</p>
                  <button onClick={() => removeFromCart(index)}>Remove</button>
                </div>
              ))
            ) : (
              <p>Your cart is empty.</p>
            )}
          </div>
          <div className="cart-total">
            <h3>Total: ${cartTotal.toFixed(2)}</h3>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductPage;
