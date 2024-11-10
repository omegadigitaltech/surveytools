import { redirect } from "react-router-dom";
import { toast } from "react-toastify";
import config from "../../config/config";

const action = async ({ request }) => {
  const data = await request.formData();
  const otpCode = data.get("code");
  const API_URL = `${config.API_URL}/verify`;
  const token = localStorage.getItem("token");
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Allow-Control-Allow-Origin": "*",
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ code: otpCode }),
  };
 // Log details being submitted to the backend
 console.log("Submitting to backend:");
 console.log("URL:", `${config.API_URL}/verify`);
 console.log("Headers:", {
   "Content-Type": "application/json",
   "Authorization": `Bearer ${token}`,
 });
 console.log("Body:", { code: otpCode });

  try {
    const response = await fetch(API_URL, options);
    const result = await response.json();

    console.log("API Response Status:", response.status); 
    console.log("API Response Data:", result); 

    const isVerified = result.status === "success";
    console.log("Verification status:", isVerified);

    if (result.status !== "success") {
      console.error("Verification failed:", result.message); 
      return { status: "error", message: result.message || "Verification failed." };
    }

    toast.success("Verification successful!");

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(redirect("/dashboard"));
      }, 3000); // 2-second delay for toast display
    });


  } catch (error) {
    console.error("Network or server error:", error); 
    return { status: "error", message: "An error occurred. Please try again." };
  }
};

export default action;
