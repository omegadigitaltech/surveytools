import config from "../../config/config";
import { toast } from "react-toastify";

const action = async ({ request }) => {
  const authToken = localStorage.getItem("authToken");
const isLoggedIn = !!authToken;
console.log("User logged in:", isLoggedIn);

  const formData = await request.formData();

  const title = formData.get("title");
  const description = formData.get("description");
  const max_participant = formData.get("max_participant");
  const duration = formData.get("duration");
  const preferred_participants = formData.get("preferred_participants");
  const point = formData.get("point");

  try {
    const response = await fetch(`${config.API_URL}/surveys`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      "Allow-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        title,
        description,
        max_participant: parseInt(max_participant, 10),
        duration: parseInt(duration, 10),
        preferred_participants,
        point: parseInt(point, 10),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit survey");
    }

    toast.success("Survey submitted successfully!");
    return null; // React Router expects an explicit return
  } catch (error) {
    toast.error("Error submitting survey");
    console.error("Caught error:", error);
    return null;
  }
  
};

export default action;
