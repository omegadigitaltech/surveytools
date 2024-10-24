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

    // Store token in localStorage/sessionStorage for future requests
    localStorage.setItem("token", json.data.token);

    // Optionally trigger global login state update
    // dispatch or use some global state update function here

    return redirect("/dashboard");

  } catch (err) {
    return { status: "error", message: "An error occurred. Please try again." };
  }
};

export default action;
