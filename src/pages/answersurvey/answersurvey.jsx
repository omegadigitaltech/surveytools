import { Link, Form } from "react-router-dom";
import backaro from "../../assets/img/backaro.svg";
import "./answersurvey.css"

const answerSurvey = () => {
    return (
        <section className="fillsurvey">
            <div className="fillsurvey_inner wrap">
                <div className="survey_details flex">
                    <div className="flex ans-back-title">
                        <Link to=""> <img src={backaro} className="backaro" /></Link>
                        <div>
                            <h3 className="survey_title">Diet and Excercise survey</h3>
                            <p className="ans-post-time">
                                Posted <span>2 hrs ago</span>
                            </p>
                        </div>
                    </div>
                    <div>
                        <h4 className="">Points to Earn</h4>
                        <h5 className="ans-point">20</h5>
                    </div>
                </div>
                <div className="question-answer">
                    <Form>
                        <div>
                            <p className="ans-question">
                                <span>1.</span> How much do you want on planet Earth?
                            </p>
                            {/* If the Question type received is multiple options */}
                            <p className="answer-ques-opt">
                                <span>A.</span> 10 Milli
                                <span className="ans-tick">
                                    <input className="check" name="answers" type="checkbox" required />
                                </span>
                            </p>
                            {/* If the Question type received is single/fill answer */}
                            <p className="answer-quest-fill">
                                <input type="text" name="answers" />
                            </p>
                        </div>
                        <div className="submit-div flex">

                        <button className="submit-ans-btn" type="submit">Submit</button>
                        </div>
                    </Form>
                </div>
            </div>
        </section>
    )
}
export default answerSurvey;