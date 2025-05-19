import config from "../../config/config";
import { toast } from "react-toastify";
import { redirect } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

const action = async ({ request }) => {
  // Experiment
  const authToken = localStorage.getItem("token");
  console.log(authToken)
  // Expo
  const formData = await request.formData();
  
  const faculty = formData.get("faculty");
  const department = formData.get("department");
  

  const preferredParticipants = [];
  if (faculty === "all_faculties" || !faculty) {
    preferredParticipants.push("All Faculties");
  } else {
    preferredParticipants.push(faculty);
    if (department === "all_departments" || !department) {
      preferredParticipants.push("All Departments");
    } else if (department) {
      preferredParticipants.push(department);
    }
  }
  
  const survey = {
    title: formData.get("title"),
    description: formData.get("description"),
    no_of_participants: formData.get("participant_num"),
    gender: formData.get("gender"),
    preferred_participants: preferredParticipants,
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

  try {
    const response = await fetch(API_URL, options);
    const json = await response.json();
    
    console.log(json);
    
    if (response.ok) {
      toast.success("Survey created successfully!");
      const surveyId = json.survey._id;
      
      // Store survey ID in Zustand store
      const { setSurveyId } = useAuthStore.getState();
      setSurveyId(surveyId);
      
      // First go to verify-payment to check if the user has already paid
      return redirect('/verify-payment');
    } else {
      toast.error(json.msg || "Failed to create survey");
      return null;
    }
  } catch (error) {
    console.error("Error creating survey:", error);
    toast.error("An error occurred. Please try again.");
    return null;
  }
};

export default action;
