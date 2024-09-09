import { redirect } from "react-router";
import { useDispatch } from "react-redux";

import callAPI from "../../utils/helpers/callAPI";
import config from "../../config/config";
import { uiSliceAction } from "../../components/store/uiSlice";

const action = async ({ request }) => {
  //   const dispatch = useDispatch();

  const data = await request.formData();
  const user = {
    username: data.get("username"),
    confirm_password: data.get("password"),
  };

  const API_URL = `${config.API_URL}/register`;
  const options = {
    body: user,
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

    redirect("/dashboard");
  } catch (err) {
    console.log(err);
  }

  return null;
};

export default action;
