import { Form, Link, useNavigate } from "react-router-dom";
import backaro from "../../assets/img/backaro.svg";

import "./expandsurvey.css"

const expandsurvey = () =>{
return(
    <section className="expand">
 <div className="dashboard_inner wrap">
    <Link to="/dashboard"> <img src={backaro} className="backaro" /></Link>
    <div className="post_time flex">
    <p className="posted">Posted 2hr ago</p>
    <p className="duration">points to earn</p>
  </div>
  <div className="survey_details flex">
    <h3 className="survey_title">Diet and Excercise survey</h3>
    <h4 className="point">20 points</h4>
  </div>
  <div className="description">
    <h4>Description</h4>
    <p>This survey is part of a research project to determine the average position of students who are aware of the
        occupational therapy seesion in OAU, how important their professional courses are to the nation, other opportunities
        out there waiting for them and the future of they all holds about their courses
    </p>
  </div>
  <div className="pre_participants">
  <h4>Preferred participants</h4>
  <ul>
    <li>Undergarduate only</li>
    <li>Undergarduate only</li>
    <li>Undergarduate only</li>
    <li>Undergarduate only</li>
  </ul>
  </div>
  <div className="activities">

  </div>
 </div>
    </section>
)
}
export default expandsurvey;