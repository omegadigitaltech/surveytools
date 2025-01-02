import { Link, Form, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuthStore from "../../components/store/useAuthStore";
import config from "../../config/config";
import backaro from "../../assets/img/backaro.svg";
import "./answersurvey.css"

const answerSurvey = () => {

    const { id } = useParams(); // Get the survey ID from the URL
    const navigate = useNavigate();
    const authToken = useAuthStore((state) => state.authToken);
    // const [survey, setSurvey] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        const fetchQuestions = async () => {
            const API_URL = `${config.API_URL}/surveys/${id}/questions`;
            const options = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            };
            try {
                const response = await fetch(API_URL, options);
                const json = await response.json();
                if (!response.ok) throw new Error(json.msg || "Failed to fetch survey questions");

                console.log("API URL:", API_URL);
                console.log("Auth Token:", authToken);
                console.log("Request Headers:", options.headers);
                console.log("Response JSON:", json);
                

                // setSurvey(json.survey);
                setQuestions(json.questions || []);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchQuestions();
    }, [id, authToken]);
    
    const handleAnswerChange = (questionId, response) => {
      setAnswers((prevAnswers) => ({
        ...prevAnswers,
        [questionId]: response,
      }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const answerArray = Object.entries(answers).map(([questionId, response]) => ({
            questionId,
            response,
        }));
        

        const API_URL = `${config.API_URL}/surveys/${id}/submit`;
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ answers: answerArray }),
        };

        try {
            const response = await fetch(API_URL, options);
            const json = await response.json();
            if (!response.ok) throw new Error(json.msg || "Failed to submit survey");
            alert("Survey submitted successfully!");
            navigate("/dashboard"); // Redirect to dashboard after successful submission
        } catch (error) {
            console.error("Error submitting survey:", error);
        }
    };

    if (loading) return <p>Loading survey questions...</p>;
    if (questions.length === 0) return <p>Survey not found or does not contain any questions.</p>;

    return (
        <section className="fillsurvey">
            <div className="fillsurvey_inner wrap">
                <div className="survey_details flex">
                    <div className="flex ans-back-title">
                        <Link to={`/expandsurvey/${id}`}> <img src={backaro} className="backaro" /></Link>
                        <div>
                            <h3 className="survey_title">--</h3>
                            <p className="ans-post-time">
                                Posted <span>--</span>
                            </p>
                        </div>
                    </div>
                    <div>
                        <h4 className="">Points to Earn</h4>
                        <h5 className="ans-point">--</h5>
                    </div>
                </div>
                <Form onSubmit={handleSubmit}>
                {questions.map((question, index) => (
            <div key={question._id} className="question-answer">
              <p className="ans-question">
                <span>{index + 1}.</span> {question.questionText}
              </p>
              {question.questionType === "multiple_choice" ? (
               question.options.map((option, optIndex) => (
                  <label key={optIndex} className="answer-ques-opt">
                    <input
                      type="checkbox"
                      name={`question-${question._id}`}
                      value={option._id}
                      onChange={(e) =>
                        handleAnswerChange(
                          question._id,
                          e.target.checked
                            ? [...(answers[question._id] || []), option._id]
                            : (answers[question._id] || []).filter((opt) => opt !== option._id)
                        )
                      }
                    />
                     {option.text}
                  </label>
                ))
              ) : (
                <input
                  type="text"
                  name={`question-${question._id}`}
                  placeholder="Your answer"
                  onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                  required={question.required}
                />
              )}
            </div>
          ))}
          <div className="submit-div flex">
            <button type="submit" className="submit-ans-btn">
              Submit
            </button>
          </div>
                </Form>
                </div>
        </section>
    )
}
export default answerSurvey;