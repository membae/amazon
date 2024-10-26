import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

// Component for payment options
const PaymentOptions = ({ onSelect, paymentMethod, onUploadMessage }) => {
  return (
    <div className="payment-options">
      <h3>Select a Payment Method</h3>
      <button onClick={() => onSelect("M-Pesa")}>M-Pesa</button>
      <button onClick={() => onSelect("Crypto")}>Crypto</button>

      {paymentMethod === "M-Pesa" && (
        <div>
          <p>Pay to: <strong>0123456789</strong></p>
          <textarea
            placeholder="Upload M-Pesa message"
            onChange={(e) => onUploadMessage(e.target.value)}
            rows="4"
            cols="50"
          />
        </div>
      )}

      {paymentMethod === "Crypto" && (
        <div>
          <p>Pay to Crypto Wallet Address: <strong>1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa</strong></p>
        </div>
      )}
    </div>
  );
}

function BalancePage() {
  const [balance, setBalance] = useState(0); // Initialize balance to 0
  const [rechargeAmount, setRechargeAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(""); // State for notifications
  const [showPaymentOptions, setShowPaymentOptions] = useState(false); // State to toggle payment options
  const [paymentMethod, setPaymentMethod] = useState(""); // State to hold selected payment method
  const [mpesaMessage, setMpesaMessage] = useState(""); // State to hold M-Pesa message

  // Fetch the balance for the currently logged-in user
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const user_id = Cookies.get("user_id"); // Assuming user_id is stored in cookies
        if (!user_id) throw new Error("User ID not found");

        const response = await axios.get(`http://127.0.0.1:5555/users/${user_id}/balance`, {
          withCredentials: true, // Send cookies with the request if needed
        });

        if (response.status === 200) {
          setBalance(response.data.balance); // Assuming the balance is returned in response.data.balance
        } else {
          throw new Error("Failed to fetch balance");
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchBalance();
  }, []);

  const handleRecharge = () => {
    if (rechargeAmount <= 0) {
      setError("Recharge amount must be greater than 0.");
      return;
    }

    // Make an API call to recharge the balance (adjust this to your backend logic)
    const rechargeBalance = async () => {
      try {
        const user_id = Cookies.get("user_id");
        const response = await axios.post(`http://127.0.0.1:5555/users/${user_id}/recharge`, {
          amount: rechargeAmount,
          paymentMethod: paymentMethod,
          mpesaMessage: mpesaMessage, // Include M-Pesa message in the request if applicable
        }, { withCredentials: true });

        if (response.status === 200) {
          setBalance((prevBalance) => prevBalance + parseFloat(rechargeAmount));
          setNotification(`Successfully recharged $${rechargeAmount}`);
          setRechargeAmount(0);
          setShowPaymentOptions(false); // Hide payment options after recharge
        } else {
          throw new Error("Failed to recharge balance");
        }
      } catch (err) {
        setError(err.message);
      }
    };

    rechargeBalance();
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

    // Make an API call to withdraw the balance (adjust this to your backend logic)
    const withdrawBalance = async () => {
      try {
        const user_id = Cookies.get("user_id");
        const response = await axios.post(`http://127.0.0.1:5555/users/${user_id}/withdraw`, {
          amount: withdrawAmount,
        }, { withCredentials: true });

        if (response.status === 200) {
          setBalance((prevBalance) => prevBalance - parseFloat(withdrawAmount));
          setNotification(`Successfully withdrew $${withdrawAmount}`);
          setWithdrawAmount(0);
        } else {
          throw new Error("Failed to withdraw balance");
        }
      } catch (err) {
        setError(err.message);
      }
    };

    withdrawBalance();
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
        {showPaymentOptions && (
          <PaymentOptions
            onSelect={(method) => {
              setPaymentMethod(method);
              setShowPaymentOptions(true);
            }}
            paymentMethod={paymentMethod}
            onUploadMessage={setMpesaMessage} // Callback to set the M-Pesa message
          />
        )}
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
