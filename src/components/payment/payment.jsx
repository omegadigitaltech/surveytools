import React, { useEffect, useState } from "react";
import { usePaystackPayment } from "react-paystack";
import useAuthStore from "../../components/store/useAuthStore";
import config from "../../config/config";

const Payment = ({ onSuccess }) => {
  const [price, setPrice] = useState(null);
  const [token, setToken] = useState("");
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
          console.error("Error fetching price:", data);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    if (currentSurveyId) fetchPrice();
  }, [currentSurveyId, authToken]);

  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email: userEmail,
    amount: price ? price * 100 : 0, // Convert to kobo
    publicKey: config.PAYSTACK_PUBLIC_KEY,
    metadata: {
      custom_fields: [
        { display_name: "Token", variable_name: "token", value: token },
      ],
    },
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handlePayment = () => {
    if (!price) {
      console.error("Price not loaded yet.");
      return;
    }
    initializePayment(
      (response) => {
        console.log("Payment successful:", response);
        verifyPayment(response.reference);
      },
      (error) => {
        console.log("Payment failed:", error);
      }
    );
  };

  const verifyPayment = async (reference) => {
    try {
      const res = await fetch(`${config.API_URL}/verify-payment`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference, surveyId: currentSurveyId }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log("Payment verified:", data);
        onSuccess();
      } else {
        console.error("Payment verification failed:", data);
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
    }
  };

  return (
    <section>
        <h3>PAYMENT INTEGRATION ONGOING CHECK BACK! </h3>
        <button onClick={handlePayment} className="paystack-btn" disabled={!price}>
      {price ? `Pay NGN ${price}` : "Loading..."}
    </button>
    </section>
    
  );
};

export default Payment;
