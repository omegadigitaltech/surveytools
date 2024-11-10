import { redirect } from "react-router";
import { toast } from "react-toastify";

import { uiSliceAction } from "../../components/store/uiSlice";
import callAPI from "../../utils/helpers/callAPI";
import config from "../../config/config";

const action = async ({ request }) => {
  const data = await request.formData();
  const user = {
    first_name: data.get("firstname"),
    last_name: data.get("lastname"),
    email: data.get("email"),
    password: data.get("password"),
    confirm_password: data.get("confirm"),
  };
  console.log(user);

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
    console.log(json);
    if (json.code !== 201) throw new Error(json.msg);

    toast.success(json.msg);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(redirect("/verify"));
      }, 1500);
    });

    // return redirect("/verify");

  } catch (err) {
    toast.error(err.message);
  }

  return null;
};

export default action;
