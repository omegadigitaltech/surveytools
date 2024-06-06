import { redirect } from "react-router";
import callAPI from "../../utils/helpers/callAPI";
import config from "../../config/config";

const action = async ({ request }) => {
    const data = await request.formData();
    const user = {
        first_name: data.get("fullname"),
        last_name: data.get("fullname"),
        email: data.get("email"),
        department: null,
        password: data.get("password"),
        confirm_password: data.get("confirm")
    }

    const API_URL = `${config.API_URL}/register`;
    const options = {
        body: user,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Allow-Control-Allow-Origin": "*"
        }
    }

    try {
        const resp = await fetch(API_URL, options);
        const json = await resp.json();
        console.log(json)
    } catch (err) {
        console.log(err)
        
    }

    
    return null;
}

export default action;