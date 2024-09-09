import { redirect } from "react-router-dom";
import config from "../../config/config";

const SignInAction = async ({ request }) => {
    let formData = await request.formData();

    const username = formData.get("usermail");
    const password = formData.get("password");

    try {
        const data = await fetch(`${config.API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                username: username, password: password
            })
        });
        const resp = await data.json();
        console.log(resp)
        return redirect("/dashboard")  
    } catch (error) {
        return { message: error.message }
    }

}

export default SignInAction;