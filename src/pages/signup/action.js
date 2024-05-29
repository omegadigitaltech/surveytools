import { redirect } from "react-router";
import config from "../../config/config";

const action = async ({ request }) => {
    const data = await request.formData();
    const user = {
        fullname: data.get("fullname"),
        email: data.get("email"),
        password: data.get("password"),
        confirm_password: data.get("confirm")
    }

    const req = await fetch(config.signup, {
        method: "POST",
        body: user
    });
    const res = await req.json();
    
    console.log(res);
    return null;
}

export default action;