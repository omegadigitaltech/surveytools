import config from "../../config/config";
import { toast } from "react-toastify";
import useAuthStore from "../../components/store/useAuthStore";

const action = async ({ request }) => {
  const {currentSurveyId} = useAuthStore()
    const formData = await request.formData();
    const surveyId = formData.get("surveyId"); // Assuming surveyId is passed
  
    const API_URL = `${config.API_URL}/surveys/${currentSurveyId}/publish`;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Allow-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ surveyId }),
    };
  
    try {
      const response = await fetch(API_URL, options);
      if (!response.ok) {
        throw new Error("Failed to publish survey");
      }
      
      toast.success("Survey published successfully!");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(redirect("/dashboard"));
        }, 1500);
      });

    } catch (error) {
      toast.error("Error publishing survey");
      console.error(error);
    }
  };

export default action;
