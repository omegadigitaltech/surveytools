import {Link} from "react-router-dom";
import backaro from "../../assets/img/backaro.svg";
import "./answersurvey.css"

const answerSurvey = () => {
    return(
        <section className="fillsurvey">
<div className="fillsurvey_inner wrap">
<div className="survey_details flex">
<Link to=""> <img src={backaro} className="backaro" /></Link>
    <h3 className="survey_title">Diet and Excercise survey</h3>
    <h4 className="point">Points to Earn</h4>
  </div>

</div>
        </section>
    )
}
export default answerSurvey;