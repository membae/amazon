import React, { useState, useEffect } from "react";

// Component for payment options
const PaymentOptions = ({ onSelect }) => {
  return (
    <div className="payment-options">
      <h3>Select a Payment Method</h3>
      <button onClick={() => onSelect("M-Pesa")}>M-Pesa</button>
      <button onClick={() => onSelect("Crypto")}>Crypto</button>
    </div>
  );
};

function BalancePage() {
  const [balance, setBalance] = useState(() => {
    const savedBalance = localStorage.getItem("balance");
    return savedBalance ? parseFloat(savedBalance) : 0; // Initialize balance from localStorage or set to 0
  });
  const [rechargeAmount, setRechargeAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(""); // State for notifications
  const [showPaymentOptions, setShowPaymentOptions] = useState(false); // State to toggle payment options

  useEffect(() => {
    localStorage.setItem("balance", balance); // Persist balance to localStorage
  }, [balance]);

  const handleRecharge = () => {
    if (rechargeAmount <= 0) {
      setError("Recharge amount must be greater than 0.");
      return;
    }
    setBalance((prevBalance) => prevBalance + parseFloat(rechargeAmount));
    setRechargeAmount(0);
    setError("");
    setNotification(`Successfully recharged $${rechargeAmount}`); // Set notification
    setTimeout(() => setNotification(""), 3000); // Clear notification after 3 seconds
    setShowPaymentOptions(false); // Hide payment options after recharge
  };

  const handleWithdraw = () => {
    if (withdrawAmount <= 0) {
      setError("Withdrawal amount must be greater than 0.");
      return;
    }
    if (withdrawAmount > balance) {
      setError("Insufficient balance for this withdrawal.");
      return;
    }
    setBalance((prevBalance) => prevBalance - parseFloat(withdrawAmount));
    setWithdrawAmount(0);
    setError("");
    setNotification(`Successfully withdrew $${withdrawAmount}`); // Set notification
    setTimeout(() => setNotification(""), 3000); // Clear notification after 3 seconds
  };

  return (
    <div className="balance-page">
      <h1>Account Balance</h1>
      <h2>${balance.toFixed(2)}</h2>

      {notification && <p className="notification">{notification}</p>} {/* Display notification */}

      <div className="recharge-section">
        <h3>Recharge Balance</h3>
        <input
          type="number"
          value={rechargeAmount}
          onChange={(e) => setRechargeAmount(e.target.value)}
          placeholder="Enter amount to recharge"
        />
        <button onClick={() => setShowPaymentOptions(true)}>Choose Payment Method</button> {/* Button to show payment options */}
        {showPaymentOptions && <PaymentOptions onSelect={handleRecharge} />}
      </div>

      <div className="withdraw-section">
        <h3>Withdraw Balance</h3>
        <input
          type="number"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          placeholder="Enter amount to withdraw"
        />
        <button onClick={handleWithdraw}>Withdraw</button>
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default BalancePage;
