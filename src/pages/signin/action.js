import { redirect } from "react-router";
import { useDispatch } from "react-redux";

import callAPI from "../../utils/helpers/callAPI";
import config from "../../config/config";
import { uiSliceAction } from "../../components/store/uiSlice";

const action = async ({ request }) => {
  //   const dispatch = useDispatch();

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
      // "Access-Control-Allow-Origin": "http://localhost:5174",
      // "Access-Control-Allow-Methods": "POST",
      // "Access-Control-Allow-Headers": "Content-Type",

    },
  };

  try {
    const resp = await fetch(API_URL, options);
    const json = await resp.json();
    console.log(json);

    if(json.status !== "success"){
      throw new Error(resp.msg);
    }
    
      return redirect("/dashboard");

  } catch (err) {
    console.log(err);
    return err.message
  }

  return null;
};

export default action;
