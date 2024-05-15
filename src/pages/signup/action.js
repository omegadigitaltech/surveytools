import { redirect } from "react-router";
import config from "../../config/config";

const action = async ({ request }) => {
    const data = await request.formData();

    const user = {
        first_name: "",
        last_name: "",
        email: data.get("email"),
        department: "elect",
        password: data.get("password"),
        confirm_password: data.get("password")
    }

    if (user.password !== user.confirm_password) {
        return { message: "Password does not match" }
    }

    const resp = await fetch(config.signup, {
        method: "POST",
        body: JSON.stringify({
            ...user
        })
    });

    return redirect("/signup");
}

export default action;