import { redirect } from "react-router";
import { toast } from "react-toastify";
import config from "../../config/config";
// import { uiSliceAction } from "../../components/store/uiSlice";
// import callAPI from "../../utils/helpers/callAPI";

const action = async ({ formData }) => {
  // const data = await request.formData();
  const user = {
    first_name: formData.get("firstname"),
    last_name: formData.get("lastname"),
    email: formData.get("email"),
    department: formData.get("department"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm"),
  };

  const API_URL = `${config.API_URL}/register`;
  const options = {
    body: JSON.stringify(user),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Allow-Control-Allow-Origin": "*",
    },
  };

  try {
    const resp = await fetch(API_URL, options);
    const json = await resp.json();
    if (json.code !== 201) {
      throw new Error(json.msg);
    }
    toast.success(json.msg);
    
    return{
      signupEmail: json.data.user.email,
    };
    
  } catch (err) {
    toast.error(err.message);
    // throw err;
  }

  return null;
};

export default action;
