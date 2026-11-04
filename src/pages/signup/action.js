import { toast } from "react-toastify";
import { register } from "../../utils/kycApi";
import { ageFrom, toIsoDate } from "../../utils/kycFlow";

const action = async ({ formData }) => {
  const password = formData.get("password");
  const dob = formData.get("dateOfBirth");

  // Mirror the backend rules so the user gets inline feedback first
  if (password.length < 8) {
    toast.error("Password must be at least 8 characters.");
    return null;
  }
  if (password !== formData.get("confirm")) {
    toast.error("Passwords do not match.");
    return null;
  }
  if (ageFrom(dob) < 18) {
    toast.error("You must be 18 or older to register.");
    return null;
  }

  const user = {
    firstName: formData.get("firstname").trim(),
    lastName: formData.get("lastname").trim(),
    email: formData.get("email").trim(),
    password,
    userType: formData.get("userType"),
    dateOfBirth: toIsoDate(dob),
  };

  try {
    await register(user);
    // Registration returns no token: the user signs in next
    toast.success("Account created. Please log in to continue.");
    return { status: "success", signupEmail: user.email };
  } catch (err) {
    toast.error(
      /already registered/i.test(err.message)
        ? "An account with this email already exists. Log in instead?"
        : err.message,
    );
  }

  return null;
};

export default action;
