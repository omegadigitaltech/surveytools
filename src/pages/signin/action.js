import { redirect } from "react-router";
import config from "../../config/config";

const action = async ({ request }) => {
  const data = await request.formData();
  const user = {
    email: data.get("email"),
    password: data.get("password"),
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
      return { status: "error", message: json.msg || "Login failed. Please try again." };
    }

    console.log("Login response:", json);

    // Store token in localStorage/sessionStorage for future requests
 const token = json.token;
  if (token) {
    localStorage.setItem("token", token);
  }

  // Redirect based on verification status
  if (!json.data.user.verified) {
    return redirect("/verify"); // Redirect to verification page if not verified
  }
  
  return redirect("/dashboard"); // Redirect to dashboard if verified

  } catch (err) {
    return { status: "error", message: "An error occurred. Please try again." };
  }
};

export default action;
