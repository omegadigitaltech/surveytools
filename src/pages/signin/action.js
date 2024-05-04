const action = async ({ request }) => {
    const data = await request.formData();
    const user = {
        email: data.get("email"),
        password: data.get("password")
    }

    console.log(user);

    return null;
}

export default action;