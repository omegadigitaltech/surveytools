import config from "../../config/config";
import { toast } from "react-toastify";
import useAuthStore from "../../store/useAuthStore";
import { redirect } from "react-router-dom";

const action = async ({ request }) => {

  const formData = await request.formData();
  const token = localStorage.getItem("token");
  const currentSurveyId = formData.get("currentSurveyId");

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
        options: []
      };
    } else if (key === "options") {
      currentQuestion.options.push({ text: value });
    }
  });
  if (Object.keys(currentQuestion).length > 0) {
    questions.push(currentQuestion);
  }

  try {

      const json = await response.json();
      console.log(json)
      if (!response.ok) {
        throw new Error(json.message || "Failed to add question");
      }

  toast.success(json.msg || "Questions Added Successfully");
  return { status: "success" };

} catch (error) {
  toast.error(error.message || "Error adding questions");
  console.error("Omo:", error);
  return null;
}
};

export default action;
