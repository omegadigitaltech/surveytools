import "./publish.css"
import config from "../../config/config"
import { Form, useNavigate } from "react-router-dom"
import { useState } from "react"
import useAuthStore from "../../store/useAuthStore";
import { redirect } from "react-router-dom";

import { toast } from "react-toastify";
import "./publish.css"

const Publish = ({ id }) => {
    // const [publish, setPublish] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const navigate = useNavigate();
    const authToken = localStorage.getItem("token");
    const currentSurveyId = useAuthStore((state) => state.currentSurveyId);

    const handlePublish = async () => {
        if (!currentSurveyId) {
            toast.error("Please create a survey first!");
            return;
        }
        setIsPublishing(true);

        const API_URL = `${config.API_URL}/surveys/${currentSurveyId}/publish`;

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${authToken}`,
                    "Content-Type": "application/json"
                }
            });
            const json = await response.json();
            console.log(json)

            if (response.ok) {
                toast.success("Survey published successfully!")
                setTimeout(() => navigate("/dashboard"), 1500);
            } else {
                toast.error(json.msg || "Failed to publish survey.");
            }
        }
        catch (error) {
            console.error("Error publishing survey:", error);
            toast.error("An error occurred while publishing.");
        } finally {
            setIsPublishing(false);
        }

    }

    return (
        <section className="publish flex">
            <div className="publish-box flex">
                <h2 className="publish-title">Ready to Go Live?</h2>
                <p className="publish-msg">Publish your survey and start collecting responses!</p>
                <button type="button" className="spin-btn" onClick={() => handlePublish()}
                    disabled={isPublishing}>
                    {isPublishing ? <span className="spinner"></span> : "Publish Now"}
                </button>
                {/* </Form> */}
            </div>
        </section>
    )
}
export default Publish;