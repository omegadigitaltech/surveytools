import backaro from "../../assets/img/backaro.svg";


const fillSurvey = () => {
    return(
        <section className="fillsurvey">
<div className="fillsurvey_inner wrap">
<div className="survey_details flex">
    <h3 className="survey_title">Diet and Excercise survey</h3>
    <h4 className="point">20 points</h4>
<Link to=""> <img src={backaro} className="backaro" /></Link>
  </div>

</div>
        </section>
    )
}
export default fillSurvey;