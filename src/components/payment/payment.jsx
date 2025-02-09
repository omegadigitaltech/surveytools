import React, { useEffect, useState } from "react";
import { usePaystackPayment } from "react-paystack";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuthStore from "../../components/store/useAuthStore";
import config from "../../config/config";
import './payment.css'

const Payment = () => {
  const [price, setPrice] = useState(null);
  const [token, setToken] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  
  const authToken = useAuthStore((state) => state.authToken);
  const userEmail = useAuthStore((state) => state.userEmail);
  const currentSurveyId = useAuthStore((state) => state.currentSurveyId);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(`${config.API_URL}/get-price`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ surveyId: currentSurveyId }),
        });

        const data = await res.json();
        if (res.ok) {
          setPrice(data.price);
          setToken(data.token);
        } else {
          toast.error(data.message || "Error fetching price");
        }
      } catch (error) {
        toast.error("Network error while fetching price");
        console.error("Error:", error);
      }
    };

    if (currentSurveyId) fetchPrice();
  }, [currentSurveyId, authToken]);

  const paystackConfig = {
    reference: `${currentSurveyId}_${new Date().getTime()}`,
    email: userEmail,
    amount: price ? price * 100 : 0, // Convert to kobo
    publicKey: config.PAYSTACK_PUBLIC_KEY,
    metadata: {
      custom_fields: [
        { 
          display_name: "Token",
          variable_name: "token",
          value: token
        }
      ],
    },
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handlePaymentSuccess = async (reference) => {
    console.log("Payment response:", reference);
    setIsProcessing(true);
    try {
      const res = await fetch(`${config.API_URL}/verify-payment`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Payment successful!");
        navigate("/publish");
      } else {
        toast.error(data.msg || "Payment verification failed");
      }
    } catch (error) {
      toast.error("Error verifying payment");
      console.error("Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error) => {
    console.error("Payment failed:", error);
    toast.error("Payment failed. Please try again.");
  };

  const handlePaymentClose = () => {
    toast.info("Payment cancelled");
  };

  const handlePayment = () => {
    if (!price) {
      toast.error("Price not loaded yet");
      return;
    }
    if (!currentSurveyId) {
      toast.error("Survey ID not found");
      return;
    }
    initializePayment(handlePaymentSuccess, handlePaymentClose);
  };

  return (
    <section className="payment-section">
      <div className="payment-container">
        <h2>Complete Payment</h2>
        <div className="payment-details">
          <p>Amount to pay: {price ? `NGN ${price.toLocaleString()}` : "Loading..."}</p>
        </div>
        <button 
          onClick={handlePayment} 
          className="paystack-btn"
          disabled={!price || isProcessing}
        >
          {isProcessing ? "Processing..." : price ? `Pay NGN ${price.toLocaleString()}` : "Loading..."}
        </button>
      </div>
    </section>
  );
};

export default Payment;
