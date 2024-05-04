import { redirect } from "react-router";

const action = async ({ request }) => {
    const data = await request.formData();
    const user = {
        fullname: data.get("fullname"),
        password: data.get("password"),
        schoolId: data.get("schoolId"),
        email: data.get("email"),
        check: data.get("check")
    }

    if (user.password !== user.check) {
        return { message: "Password does not match" }
    }

    return redirect("/signin");
}

export default action;