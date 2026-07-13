import config from "../../config/config";
import { toast } from "react-toastify";
import useAuthStore from "../../store/useAuthStore";

const action = async ({ request }) => {
  const formData = await request.formData();
  const token = useAuthStore.getState().authToken;
  const currentSurveyId =
    formData.get("currentSurveyId") || useAuthStore.getState().currentSurveyId;

  if (!currentSurveyId) {
    toast.error("No survey ID found. Please create a survey first.");
    return null;
  }

  const questions = [];
  let currentQuestion = {};

  formData.forEach((value, key) => {
    if (key === "questionText") {
      if (Object.keys(currentQuestion).length > 0) {
        questions.push(currentQuestion);
      }
      currentQuestion = {
        questionText: value,
        questionType: "multiple_choice",
        required: false,
        options: [],
      };
    } else if (key === "options") {
      currentQuestion.options.push({ text: value, allowsCustomInput: false });
    }
  });
  if (Object.keys(currentQuestion).length > 0) {
    questions.push(currentQuestion);
  }

  try {
    const response = await fetch(
      `${config.API_URL}/surveys/${currentSurveyId}/bulk-questions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ questions }),
      }
    );

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.msg || json.message || "Failed to add questions");
    }

    toast.success(json.msg || "Questions Added Successfully");
    return { status: "success" };
  } catch (error) {
    toast.error(error.message || "Error adding questions");
    console.error("Error:", error);
    return null;
  }
};

export default action;
