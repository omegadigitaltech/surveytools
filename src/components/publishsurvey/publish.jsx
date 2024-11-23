import "./publish.css"
import config from "../../config/config"
// import action from "./action"
import { Form } from "react-router-dom"
import { useState } from "react"

const Publish = ({ id }) => {
    const [publish, setPublish] = useState([]);
    const authToken = localStorage.getItem("token");

    const handlePublish = async () => {
        const API_URL = `${config.API_URL}/surveys/${id}/publish`;
        const publishFetch = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        })
        const publishData = await publishFetch.json();

        setPublish(publishData);
        return null;
    }
    console.log(publish)

    return (
        <section className="publish flex">
            <div className="publish-box flex">
                <p className="publish-msg">Now proceed to publish this survey.</p>
                <Form method="post" action="/publish">
                    {/* Include surveyId in form data */}
                    <input type="hidden" name="surveyId" value="12345" /> {/* Replace with actual ID */}

                    <button type="button" className="post-btn" onClick={() => handlePublish()}>
                        Publish
                    </button>
                </Form>
            </div>
        </section>
    )
}
export default Publish;