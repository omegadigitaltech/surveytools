import config from "../../config/config";
import { toast } from "react-toastify";
import useAuthStore from "../../components/store/useAuthStore";
import { redirect } from "react-router-dom";

const action = async ({ request, formData }) => {
  if (!formData && request) {
    formData = await request.formData();
  }
  // const formData = await request.formData();
  
  const token = localStorage.getItem("token");
  const currentSurveyId = formData.get("currentSurveyId");
console.log(currentSurveyId)
  const questions = [];
  formData.forEach((value, key) => {
    if (key === "questionText") {
      questions.push({
        questionId: currentSurveyId,
        questionText: value,
        questionType: formData.get("questionType"),
        required: true,
        options: formData.getAll("options").filter((opt) => opt !== ""),
      });
    }
  });

  // const questionType = formData.get("questionType");
  // const questionText = formData.get("questionText");
  // const options = formData.getAll("options");
  // Convert the array of options into a single string
  // const optionsString = options.join(",");

  // const questions = {
  //   questionId: currentSurveyId,
  //   questionType: questionType,
  //   questionText: questionText,
  //   required: "",
  //   options: options,
  // }

  // const API_URL = `${config.API_URL}/surveys/${currentSurveyId}/questions`;
  // const API_option = {
  //   body: JSON.stringify(questions),
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     "Allow-Control-Allow-Origin": "*",
  //     "Authorization": `Bearer ${token}`
  //   },
  // };

  // Making the API request
  // const response = await fetch(API_URL, API_option);
  // const json = await response.json();

  // console.log(json)

  // try {
  //   if (!response.ok) {
  //     throw new Error(json.msg || "Failed to add questions");
  //   }

  //   toast.success("Questions Added")
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       resolve((redirect("/publish")))
  //     }, 1500); 
  //   });

  // } catch(error) {
  //   toast.error("Error adding questions");
  //   console.error("Caught error:", error);
  // }
  // return null;


  try {
      for (const question of questions) {
        const API_URL = `${config.API_URL}/surveys/${currentSurveyId}/questions`;
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Allow-Control-Allow-Origin": "*",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(question),
        };
  
        const response = await fetch(API_URL, options);
        const json = await response.json();
        console.log(json)
        if (!response.ok) {
          throw new Error(json.message || "Failed to add question");
        }
      }

    toast.success("Questions Added Successfully");
    return { status: "success" };

  } catch (error) {
    toast.error("Error adding questions");
    console.error("Omo:", error);
  }
  return null;
};

export default action;
