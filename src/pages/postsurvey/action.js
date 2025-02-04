import config from "../../config/config";
import { toast } from "react-toastify";
import { redirect } from "react-router-dom";
import useAuthStore from "../../components/store/useAuthStore";

const action = async ({ request }) => {
  // Experiment
  const authToken = localStorage.getItem("token");
  console.log(authToken)
  // Expo

  const formData = await request.formData();
  const survey = {
    title: formData.get("title"),
    description: formData.get("description"),
    no_of_participants: formData.get("participant_num"),
    gender: formData.get("gender"),
    preferred_participants: formData.get("preferred_participants"),
    amount_to_be_paid: formData.get("amount"),
  }

  const API_URL = `${config.API_URL}/surveys`;
  const options = {
    body: JSON.stringify(survey),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Allow-Control-Allow-Origin": "*",
      "Authorization": `Bearer ${authToken}`
    },
  };

  const response = await fetch(API_URL, options);
  const json = await response.json();

  console.log(json)

  try {
    if (!response.ok) {
      throw new Error("Failed to submit survey");
    }
    // Store to Zustand
    const { setSurveyId } = useAuthStore.getState();
    setSurveyId(json.survey._id);

    toast.success("Survey submitted successfully!");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(redirect("/surveyform"));
      }, 1500);
    });
    // return { surveyID: json.survey._id }

  } catch (error) {
    toast.error("Error submitting survey");
    console.error("Caught error:", error);
    console.log(json.msg)
    return null;
  }

};

export default action;
