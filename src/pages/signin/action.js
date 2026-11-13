import { toast } from "react-toastify";
import { login } from "../../utils/kycApi";

const action = async ({ formData }) => {
  try {
    const json = await login(formData.get("email"), formData.get("password"));
    const { user, requiresEmailVerification } = json.data;

    toast.success(json.msg);
    return {
      status: "success",
      token: json.token,
      userEmail: user.email,
      userName: user.fullname,
      userType: user.userType,
      requiresEmailVerification: Boolean(requiresEmailVerification),
    };
  } catch (err) {
    // 401 here means bad credentials; never say which field was wrong
    const message =
      err.status === 401
        ? "Invalid email or password."
        : err.message || "An error occurred. Please try again.";
    toast.error(message);
    return { status: "error", message };
  }
};

export default action;
