import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../components/store/useAuthStore';
import config from '../../config/config';
import './pricingmodal.css';

const PricingModal = ({ onClose }) => {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const authToken = useAuthStore((state) => state.authToken);
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
        } else {
          console.error("Error fetching price:", data);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
  }, [currentSurveyId, authToken]);

  const handleContinue = () => {
    navigate('/payment');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Survey Pricing</h2>
        {loading ? (
          <div className="loading-spinner">Loading price...</div>
        ) : (
          <>
            <div className="price-details">
              <p>To publish this survey, you need to pay:</p>
              <h3>NGN {price}</h3>
            </div>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={onClose}>Cancel</button>
              <button className="continue-btn" onClick={handleContinue}>
                Continue to Payment
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PricingModal; 