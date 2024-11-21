import config from "../../config/config";
import { toast } from "react-toastify";
import { redirect } from "react-router-dom";
import useAuthStore from "../../components/store/useAuthStore";

const action = async ({ request }) => {
  // Experiment
  const authToken = localStorage.getItem("authToken");
  console.log(authToken)
  // const isLoggedIn = !!authToken;
  // console.log("User logged in:", isLoggedIn);
  console.log(document.cookie);
  // Expo

  const formData = await request.formData();
  const survey = {
    title: formData.get("title"),
    description: formData.get("description"),
    max_participant: formData.get("max_participant"),
    duration: formData.get("duration"),
    preferred_participants: formData.get("preferred_participants"),
    point: formData.get("point"),
    // department: "elect"
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
