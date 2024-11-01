import { redirect } from "react-router-dom";
import { toast } from "react-toastify";
import config from "../../config/config";

const action = async ({ request }) => {
  const data = await request.formData();
  const otpCode = data.get("otpCode");
  const API_URL = `${config.API_URL}/verification`;

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`, // Ensure token is stored on login
    },
    body: JSON.stringify({ otp: otpCode }),
  };

  try {
    const response = await fetch(API_URL, options);
    const result = await response.json();

    if (result.status !== "success") {
      console.error("Verification failed:", result.message); // Log error message
      return { status: "error", message: result.message || "Verification failed." };
    }

    toast.success("Verification successful!");
    return redirect("/dashboard");

  } catch (error) {
    console.error("Network or server error:", error);
    return { status: "error", message: "An error occurred. Please try again." };
  }
};

export default action;
