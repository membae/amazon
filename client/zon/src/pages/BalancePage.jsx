import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

// Component for payment options
const PaymentOptions = ({ onSelect, paymentMethod, onUploadMessage }) => {
  return (
    <div style={{
      padding: '20px', 
      backgroundColor: '#f7f7f7', 
      borderRadius: '8px', 
      marginTop: '20px', 
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{ color: '#333' }}>Select a Payment Method</h3>
      <button 
        onClick={() => onSelect("M-Pesa")} 
        style={{
          backgroundColor: '#28a745', 
          color: '#fff', 
          padding: '10px 20px', 
          fontSize: '1rem', 
          border: 'none', 
          borderRadius: '5px', 
          cursor: 'pointer', 
          marginRight: '10px'
        }}
      >
        M-Pesa
      </button>
      <button 
        onClick={() => onSelect("Crypto")} 
        style={{
          backgroundColor: '#28a745', 
          color: '#fff', 
          padding: '10px 20px', 
          fontSize: '1rem', 
          border: 'none', 
          borderRadius: '5px', 
          cursor: 'pointer'
        }}
      >
        Crypto
      </button>

      {paymentMethod === "M-Pesa" && (
        <div>
          <p style={{ color: '#333' }}>Pay to: <strong>0123456789</strong></p>
          <textarea
            placeholder="Upload M-Pesa message"
            onChange={(e) => onUploadMessage(e.target.value)}
            rows="4"
            cols="50"
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              fontSize: '1rem',
              minHeight: '100px',
              resize: 'vertical'
            }}
          />
        </div>
      )}

      {paymentMethod === "Crypto" && (
        <div>
          <p style={{ color: '#333' }}>Pay to Crypto Wallet Address: <strong>1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa</strong></p>
        </div>
      )}
    </div>
  );
}

function BalancePage() {
  const [balance, setBalance] = useState(0); 
  const [rechargeAmount, setRechargeAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(""); 
  const [showPaymentOptions, setShowPaymentOptions] = useState(false); 
  const [paymentMethod, setPaymentMethod] = useState(""); 
  const [mpesaMessage, setMpesaMessage] = useState(""); 

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

    const rechargeBalance = async () => {
      try {
        const user_id = Cookies.get("user_id");
        const response = await axios.post(`https://amazon-cp0v.onrender.com/users/${user_id}/recharge`, {
          amount: rechargeAmount,
          paymentMethod: paymentMethod,
          mpesaMessage: mpesaMessage,
        }, { withCredentials: true });

        if (response.status === 200) {
          setBalance((prevBalance) => prevBalance + parseFloat(rechargeAmount));
          setNotification(`Successfully recharged $${rechargeAmount}`);
          setRechargeAmount(0);
          setShowPaymentOptions(false); 
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

    const withdrawBalance = async () => {
      try {
        const user_id = Cookies.get("user_id");
        const response = await axios.post(`https://amazon-cp0v.onrender.com/users/${user_id}/withdraw`, {
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
    <div style={{
      width: '80%', 
      margin: '0 auto', 
      padding: '20px', 
      backgroundColor: '#fff', 
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', 
      borderRadius: '8px', 
      marginTop: '20px'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>Account Balance</h1>
      <h2 style={{
        textAlign: 'center', 
        marginBottom: '30px', 
        fontSize: '2em', 
        color: '#4CAF50'
      }}>${balance.toFixed(2)}</h2>

      {notification && (
        <p style={{
          backgroundColor: '#d4edda', 
          color: '#155724', 
          padding: '10px', 
          margin: '15px 0', 
          borderRadius: '5px', 
          fontWeight: 'bold'
        }}>
          {notification}
        </p>
      )}

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '10px', color: '#333' }}>Recharge Balance</h3>
        <input
          type="number"
          value={rechargeAmount}
          onChange={(e) => setRechargeAmount(e.target.value)}
          placeholder="Enter amount to recharge"
          style={{
            padding: '10px', 
            width: '100%', 
            maxWidth: '300px', 
            marginBottom: '10px', 
            border: '1px solid #ccc', 
            borderRadius: '5px', 
            fontSize: '1rem'
          }}
        />
        <button 
          onClick={() => setShowPaymentOptions(true)} 
          style={{
            backgroundColor: '#007bff', 
            color: '#fff', 
            padding: '10px 20px', 
            fontSize: '1rem', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer', 
            transition: 'background-color 0.3s'
          }}
        >
          Choose Payment Method
        </button>

        {showPaymentOptions && (
          <PaymentOptions
            onSelect={(method) => {
              setPaymentMethod(method);
              setShowPaymentOptions(true);
            }}
            paymentMethod={paymentMethod}
            onUploadMessage={setMpesaMessage} 
          />
        )}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '10px', color: '#333' }}>Withdraw Balance</h3>
        <input
          type="number"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          placeholder="Enter amount to withdraw"
          style={{
            padding: '10px', 
            width: '100%', 
            maxWidth: '300px', 
            marginBottom: '10px', 
            border: '1px solid #ccc', 
            borderRadius: '5px', 
            fontSize: '1rem'
          }}
        />
        <button 
          onClick={handleWithdraw} 
          style={{
            backgroundColor: '#007bff', 
            color: '#fff', 
            padding: '10px 20px', 
            fontSize: '1rem', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer', 
            transition: 'background-color 0.3s'
          }}
        >
          Withdraw
        </button>
      </div>

      {error && (
        <p style={{
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '10px', 
          margin: '15px 0', 
          borderRadius: '5px', 
          fontWeight: 'bold'
        }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default BalancePage;
