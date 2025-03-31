import config from "../../config/config";
import { toast } from "react-toastify";
import useAuthStore from "../../store/useAuthStore";
import { redirect } from "react-router-dom";

const action = async ({ request }) => {
  // if (!formData && request) {
  //   formData = await request.formData();
  // }

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

  //     questions.push({
  //       questionId: currentSurveyId,
  //       questionText: value,
  //       questionType: formData.get("questionType"),
  //       required: true,
  //       options: formData.getAll("options").filter((opt) => opt !== ""),
  //     });
  //   }
  // });

  try {
    // for (const question of questions) {
    //   // Here
    //   const API_URL = `${config.API_URL}/surveys/${currentSurveyId}/bulk-questions`;
    //   const options = {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "Allow-Control-Allow-Origin": "*",
    //       "Authorization": `Bearer ${token}`,
    //     },
    //     body: JSON.stringify(question),
    //   };

    //   const response = await fetch(API_URL, options);

    const response = await fetch(
      `${config.API_URL}/surveys/${currentSurveyId}/bulk-questions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ questions }),
      }
    );

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
