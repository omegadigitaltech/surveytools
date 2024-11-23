import config from "../../config/config";
import { toast } from "react-toastify";
import useAuthStore from "../../components/store/useAuthStore";
import { redirect } from "react-router-dom";

const action = async ({ request }) => {


  const formData = await request.formData();
  const currentSurveyId = formData.get("currentSurveyId");
  const questionType = formData.get("questionType");
  const questionText = formData.get("questionText");
  const options = formData.getAll("options");
  // Convert the array of options into a single string
  const optionsString = options.join(",");

  const token = localStorage.getItem("token");
  const questions = {
    questionId: currentSurveyId,
    questionType: "fill_in",
    questionText: questionText,
    required: "",
    options: "",
  }

  console.log(questions)

  const API_URL = `${config.API_URL}/surveys/${currentSurveyId}/questions`;
  const API_option = {
    body: JSON.stringify(questions),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Allow-Control-Allow-Origin": "*",
      "Authorization": `Bearer ${token}`
    },
  };

  // Making the API request
  const response = await fetch(API_URL, API_option);
  const json = await response.json();

  console.log(json)

  try {
    // Log response status and text

    // if (!response.ok) {
    //   throw new Error("Failed to submit survey");
    // } 
    toast.success("Questions Added")
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(null)
        // resolve(redirect("/dashboard"));
      }, 1500); 
    });
    // return {
    //   status: "success"
    // }

  } catch (error) {
    toast.error("Error adding questions");
    console.error("Caught error:", error);
  }
  return null;
};

export default action;
