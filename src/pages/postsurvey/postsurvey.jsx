import {Link, Form} from "react-router-dom";
import "./postsurvey.css"
import backaro from "../../assets/img/backaro.svg";

const PostSurvey = () =>{

return(
    <section className="postsurvey">
<div className="postsurvey_wrap wrap">
    <div className="post-head flex">
    <Link to="/dashboard"> <img src={backaro} className="backaro" /></Link>
    <h3>Post Questionaire</h3>
    </div>
    <div className="postsurvey_div">
        <Form className="survey_form">
        <div className="postsurvey-field">
                    <label className="postsurvey-label" htmlFor="usermail">
                       <h4>Title of Survey</h4> 
                    </label>
                    <input className="postsurvey-input" type="text" name="surveyTitle" id="surveyTitle" />
                </div>
                <div className="postsurvey-field">
                    <label className="postsurvey-label" htmlFor="usermail">
                       <h4>Description</h4> 
                    </label>
                    <input className="surveydescription" type="text" placeholder="Write your survey..." name="surveyDescription" id="surveyDescription" />
                </div>
        </Form>
    </div>
</div>
    </section>
)    
}       
export default PostSurvey;