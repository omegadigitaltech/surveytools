import { redirect } from "react-router";
import config from "../../config/config";
import { toast } from "react-toastify";

const action = async ({ formData }) => {
  // const data = await request.formData();
  const user = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const API_URL = `${config.API_URL}/login`;
  const options = {
    body: JSON.stringify(user),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const resp = await fetch(API_URL, options);
    const json = await resp.json();

    if (json.status !== "success") {
      toast.error(json.msg || "Login failed. Please try again.");
      return { status: "error", message: json.msg || "Login failed. Please try again." };  
    }
    toast.success(json.msg);
    console.log("Login response:", json);

    // Store only the token in localStorage
    const token = json.token;
    if (token) {
      localStorage.setItem("token", token);
    }
    
    return {
      status: "success",
      token,
      userEmail: json.data.user.email,
      userName: json.data.user.fullname,
      userVerified: json.data.user.verified,
      userInst: json.data.user.instituition,
    };
  } catch (err) {
    toast.error("An error occurred. Please try again.");
    return { status: "error", message: "An error occurred. Please try again." };
  }
};

export default action;
