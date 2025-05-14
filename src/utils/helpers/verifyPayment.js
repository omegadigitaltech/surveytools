import config from "../../config/config";
import useAuthStore from "../../store/useAuthStore";

/**
 * Verifies if payment has been made for the current survey
 * @param {string} surveyId - The ID of the survey to check
 * @param {string} authToken - The user's authentication token
 * @returns {Promise<boolean>} - Returns true if payment is verified, false otherwise
 */
export const verifyPayment = async (surveyId, authToken) => {
  try {
    const response = await fetch(`${config.API_URL}/surveys/${surveyId}/verify-payment`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return response.ok && data.status === "success";
  } catch (error) {
    console.error("Error verifying payment:", error);
    return false;
  }
};

export default verifyPayment; 