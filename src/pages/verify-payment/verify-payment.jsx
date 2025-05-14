import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import verifyPayment from '../../utils/helpers/verifyPayment';
import { toast } from 'react-toastify';
import './verify-payment.css';

const VerifyPayment = () => {
  const navigate = useNavigate();
  const { currentSurveyId, authToken, setHasPaid } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!currentSurveyId) {
        toast.error('No survey selected. Please create a survey first.');
        navigate('/postsurvey');
        return;
      }

      try {
        setIsVerifying(true);
        const isPaid = await verifyPayment(currentSurveyId, authToken);
        
        setPaymentStatus(isPaid);
        setHasPaid(isPaid);
        
        // Redirect based on payment status
        if (isPaid) {
          toast.success('Payment verified!');
          setTimeout(() => navigate('/publish'), 1500);
        } else {
          // When not paid, redirect to surveyquestion first to add questions
          toast.info('Please add questions to your survey');
          setTimeout(() => navigate('/surveyquestion'), 1500);
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        toast.error('Failed to verify payment status');
        // If verification fails, redirect to surveyquestion as fallback
        setTimeout(() => navigate('/surveyquestion'), 1500);
      } finally {
        setIsVerifying(false);
      }
    };

    checkPaymentStatus();
  }, [currentSurveyId, authToken, navigate, setHasPaid]);

  return (
    <div className="verify-payment-container">
      <div className="verify-payment-card">
        <h2>Verifying Payment Status</h2>
        
        {isVerifying ? (
          <div className="verify-payment-loading">
            <div className="spinner"></div>
            <p>Checking payment status...</p>
          </div>
        ) : (
          <div className="verify-payment-result">
            {paymentStatus ? (
              <>
                <div className="success-icon">✓</div>
                <p>Payment verified! Redirecting to publish page...</p>
              </>
            ) : (
              <>
                <div className="info-icon">i</div>
                <p>Continue to add questions to your survey...</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyPayment; 