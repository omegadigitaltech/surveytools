import { redirect } from "react-router";
import config from "../../config/config";

const action = async ({ request }) => {
    const data = await request.formData();
    return null;

}

export default action;