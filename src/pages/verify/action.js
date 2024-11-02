import { redirect } from "react-router-dom";
import { toast } from "react-toastify";
import config from "../../config/config";

const action = async ({ request }) => {
  const data = await request.formData();
  const otpCode = data.get("code");
  const API_URL = `${config.API_URL}/verify`;

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Allow-Control-Allow-Origin": "*",
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ otp: otpCode }),
  };

  try {
    const response = await fetch(API_URL, options);
    const result = await response.json();

    console.log("API Response Status:", response.status); // Log status
    console.log("API Response Data:", result); // Log complete response data

    if (result.status !== "success") {
      console.error("Verification failed:", result.message); // Log error details
      return { status: "error", message: result.message || "Verification failed." };
    }

    toast.success("Verification successful!");
    return redirect("/dashboard");

  } catch (error) {
    console.error("Network or server error:", error); // Log network errors
    return { status: "error", message: "An error occurred. Please try again." };
  }
};

export default action;
