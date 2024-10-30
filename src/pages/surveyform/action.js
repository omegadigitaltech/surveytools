import config from "../../config/config";
import { toast } from "react-toastify";

const action = async ({ request }) => {
  try {
    // Parsing form data and logging it
    const formData = await request.formData();
    const questions = JSON.parse(formData.get("questions"));
    console.log("Parsed questions:", questions);

    // Making the API request
    const response = await fetch(`${config.API_URL}/surveys`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
      "Allow-Control-Allow-Origin": "*"
       },
      body: JSON.stringify({ questions }),
    });

    // Log response status and text
    console.log("Response status:", response.status);
    console.log("Response text:", await response.text());

    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response text:", response.status, "Details:", errorText);
      throw new Error("Failed to submit survey");
    } else {
      console.log("Survey submitted successfully");
    }

    // If successful, show success toast
    toast.success("Survey submitted successfully!");
  } catch (error) {
    // Show error toast and log the error
    toast.error("Error submitting survey");
    console.error("Caught error:", error);
  }
  return null;
};

export default action;
