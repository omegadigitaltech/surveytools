import { Form, Link, useNavigate } from "react-router-dom";
import backaro from "../../assets/img/backaro.svg";
import dept from "../../assets/img/blu-dept.svg";
import partps from "../../assets/img/partps.svg";



import "./expandsurvey.css"

const expandsurvey = () =>{
   // Temporary navigate
const navigate = useNavigate();

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
  <h4>Activities on this survey</h4>
  <div className="activity_row center flex">
  <li className="">Total participant required</li>
    <p className="required_no"> <span className="participant_no">200</span> Participants</p>
  </div>
  <div className="activity_row center flex">
  <li className="">Total participant required</li>
    <p className="required_no"> <span className="participant_no">100</span> Participated</p>
  </div>
  <div className="activity_row center flex">
    <li className="">Total participant required</li>
    <p className="required_no"> <span className="participant_no">20</span> Left</p>
  </div>
  </div>
  
<div className="survey_class flex">
  <div className="dept flex">
    <img src={dept} alt="" />
    <h4 className="department">Dept. of <span className="dept">Foreign Languages</span></h4>
  </div>
  <div className="participants flex">
<img src={partps} alt="" />
<p> <span className="num_participant">20</span> Participants</p>
  </div>
</div>
<div className="flex btn_div">
  <button className="start-btn btn" onClick={() => navigate('/postsurvey')}>
                    Start survey
                </button>
</div>

 </div>
    </section>
)
}
export default expandsurvey;