import {
  Link,
  Form,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useAuthStore from "../../store/useAuthStore";
import Complete from "../../components/completed/complete";
import config from "../../config/config";
import backaro from "../../assets/img/backaro.svg";
import "./answersurvey.css";

const answerSurvey = () => {
  const { id } = useParams(); // Get the survey ID from the URL
  const navigate = useNavigate();
  const authToken = useAuthStore((state) => state.authToken);
  const location = useLocation();
  // const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [customInputs, setCustomInputs] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const { title, createdAt, points } = location.state || {};

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
        if (!response.ok)
          throw new Error(json.msg || "Failed to fetch survey questions");
        setQuestions(json.questions || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [id, authToken]);

  const handleAnswerChange = (questionId, response) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: response,
    }));
  };

  const handleCustomInputChange = (questionId, optionText, customValue) => {
    setCustomInputs((prev) => ({
      ...prev,
      [`${questionId}_${optionText}`]: customValue,
    }));
  };

  const handleMultipleSelectionChange = (questionId, optionValue, isChecked, allowsCustomInput = false) => {
    setAnswers((prevAnswers) => {
      // Get the current array of selected options or initialize empty array
      const currentSelections = Array.isArray(prevAnswers[questionId]) 
        ? [...prevAnswers[questionId]] 
        : [];
      
      // Add or remove the option based on checkbox state
      if (isChecked) {
        if (allowsCustomInput) {
          // For options that allow custom input, we'll handle this in the submit function
          return {
            ...prevAnswers,
            [questionId]: [...currentSelections, optionValue]
          };
        } else {
          return {
            ...prevAnswers,
            [questionId]: [...currentSelections, optionValue]
          };
        }
      } else {
        // Remove the option and clear any associated custom input
        if (allowsCustomInput) {
          setCustomInputs((prev) => {
            const newInputs = { ...prev };
            delete newInputs[`${questionId}_${optionValue}`];
            return newInputs;
          });
        }
        return {
          ...prevAnswers,
          [questionId]: currentSelections.filter(option => {
            if (typeof option === 'string') {
              return option !== optionValue;
            } else {
              return option.selectedOption !== optionValue;
            }
          })
        };
      }
    });
  };

  const formatAnswerForSubmission = (questionId, answer, question) => {
    if (question.questionType === "multiple_selection" && Array.isArray(answer)) {
      return answer.map(item => {
        if (typeof item === 'string') {
          // Check if this option allows custom input
          const option = question.options.find(opt => 
            (typeof opt === 'string' ? opt : opt.text) === item
          );
          const allowsCustomInput = typeof option === 'object' && option.allowsCustomInput;
          
          if (allowsCustomInput) {
            const customInput = customInputs[`${questionId}_${item}`];
            if (customInput) {
              return {
                selectedOption: item,
                customInput: customInput
              };
            }
          }
          return item;
        }
        return item;
      });
    } else if (typeof answer === 'string') {
      // Check if this is a single choice with custom input
      const option = question.options.find(opt => 
        (typeof opt === 'string' ? opt : opt.text) === answer
      );
      const allowsCustomInput = typeof option === 'object' && option.allowsCustomInput;
      
      if (allowsCustomInput) {
        const customInput = customInputs[`${questionId}_${answer}`];
        if (customInput) {
          return {
            selectedOption: answer,
            customInput: customInput
          };
        }
      }
      return answer;
    }
    return answer;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required multiple selection questions
    const missingRequiredSelections = questions
      .filter(q => q.questionType === "multiple_selection" && q.required)
      .some(q => !answers[q._id] || !Array.isArray(answers[q._id]) || answers[q._id].length === 0);
    
    if (missingRequiredSelections) {
      toast.error("Please select at least one option for all required multiple selection questions");
      return;
    }

    // Validate custom inputs
    const missingCustomInputs = questions.some(question => {
      const answer = answers[question._id];
      if (!answer) return false;

      // Check single choice questions
      if (question.questionType === "multiple_choice") {
        const option = question.options.find(opt => 
          (typeof opt === 'string' ? opt : opt.text) === answer
        );
        if (typeof option === 'object' && option.allowsCustomInput) {
          const customInput = customInputs[`${question._id}_${answer}`];
          return !customInput || customInput.trim() === '';
        }
      }

      // Check multiple selection questions
      if (question.questionType === "multiple_selection" && Array.isArray(answer)) {
        return answer.some(selectedOption => {
          const option = question.options.find(opt => 
            (typeof opt === 'string' ? opt : opt.text) === selectedOption
          );
          if (typeof option === 'object' && option.allowsCustomInput) {
            const customInput = customInputs[`${question._id}_${selectedOption}`];
            return !customInput || customInput.trim() === '';
          }
          return false;
        });
      }

      return false;
    });

    if (missingCustomInputs) {
      toast.error("Please provide custom input for all selected options that require it");
      return;
    }
    
    setSubmitting(true); // Set submitting state to true

    const answerArray = Object.entries(answers).map(
      ([questionId, response]) => ({
        questionId,
        response: formatAnswerForSubmission(questionId, response, questions.find(q => q._id === questionId)),
      })
    );
    console.log(answerArray[-2], answerArray[-1]);
    
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

      if (!response.ok) {
        throw new Error(json.msg || "Failed to submit survey");
      }
      // throw new Error(json.msg || "Failed to submit survey");
      setEarnedPoints(points); // Use points from location state
      setShowComplete(true);
    } catch (error) {
      console.log(error)
      console.error("Error submitting survey:", error);
      toast.error(error.message || "Error submitting survey!");
    } finally {
      setSubmitting(false); // Reset submitting state
    }
  };
  const handleDone = () => {
    navigate("/dashboard"); // Redirect to dashboard
  };

  if (loading) return <p className="ans-msg">Loading survey questions...</p>;
  if (questions.length === 0)
    return (
      <p className="ans-msg">
        Opps! No questions found here, check other surveys.
      </p>
    );

  return (
    <>
      {showComplete ? (
        <Complete points={earnedPoints} onDone={handleDone} />
      ) : (
        <section className="fillsurvey">
          <div className="fillsurvey_inner wrap">
            <div className="survey-ans-details flex">
              <div className="flex ans-back-title">
                <Link to={`/expandsurvey/${id}`}>
                  {" "}
                  <img src={backaro} className="backaro" />
                </Link>
                <div>
                  <h3 className="survey_title_ans">{title || "Survey"}</h3>
                  <p className="ans-post-time">
                    Posted{" "}
                    <span>
                      {createdAt ? new Date(createdAt).toLocaleString() : "--"}
                    </span>
                  </p>
                </div>
              </div>
              <div className="ans-point-earn flex">
                <h4 className="">Points to Earn</h4>
                <h5 className="ans-point">{points || "--"}</h5>
              </div>
            </div>
            <Form onSubmit={handleSubmit} className="ans-form">
              {questions.map((question, index) => (
                <div key={question._id} className="question-answer">
                  <p className="ans-question">
                    <span>{index + 1}.</span> {question.questionText}
                  </p>
                  {question.questionType === "multiple_choice" ? (
                    question.options.map((option, optIndex) => {
                      const optionText = typeof option === 'string' ? option : option.text;
                      const allowsCustomInput = typeof option === 'object' && option.allowsCustomInput;
                      const isSelected = answers[question._id] === optionText;
                      
                      return (
                        <div key={optIndex} className="option-with-input">
                          <label className="answer-ques-opt">
                            <input
                              type="radio"
                              className="tick-ans"
                              name={`question-${question._id}`}
                              value={optionText}
                              onChange={(e) => {
                                handleAnswerChange(question._id, e.target.value);
                                // Clear custom input if switching away from this option
                                if (!e.target.checked && allowsCustomInput) {
                                  handleCustomInputChange(question._id, optionText, '');
                                }
                              }}
                              required={question.required}
                            />
                            {optionText}
                          </label>
                          {allowsCustomInput && isSelected && (
                            <input
                              type="text"
                              className="custom-input-field"
                              placeholder="Please specify..."
                              value={customInputs[`${question._id}_${optionText}`] || ''}
                              onChange={(e) => handleCustomInputChange(question._id, optionText, e.target.value)}
                              required
                            />
                          )}
                        </div>
                      );
                    })
                  ) : question.questionType === "multiple_selection" ? (
                    question.options.map((option, optIndex) => {
                      const optionText = typeof option === 'string' ? option : option.text;
                      const allowsCustomInput = typeof option === 'object' && option.allowsCustomInput;
                      const isSelected = Array.isArray(answers[question._id]) && 
                        answers[question._id].some(item => 
                          typeof item === 'string' ? item === optionText : item.selectedOption === optionText
                        );
                      
                      return (
                        <div key={optIndex} className="option-with-input">
                          <label className="answer-ques-opt">
                            <input
                              type="checkbox"
                              className="tick-ans"
                              name={`question-${question._id}-option-${optIndex}`}
                              value={optionText}
                              onChange={(e) =>
                                handleMultipleSelectionChange(
                                  question._id, 
                                  e.target.value, 
                                  e.target.checked,
                                  allowsCustomInput
                                )
                              }
                            />
                            {optionText}
                          </label>
                          {allowsCustomInput && isSelected && (
                            <input
                              type="text"
                              className="custom-input-field"
                              placeholder="Please specify..."
                              value={customInputs[`${question._id}_${optionText}`] || ''}
                              onChange={(e) => handleCustomInputChange(question._id, optionText, e.target.value)}
                              required
                            />
                          )}
                        </div>
                      );
                    })
                  ) : question.questionType === "five_point" ? (
                    <div className="five-point-group">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <label key={n} className="answer-ques-opt">
                          <input
                            type="radio"
                            className="tick-ans"
                            name={`question-${question._id}`}
                            value={n}
                            onChange={(e) =>
                              handleAnswerChange(
                                question._id,
                                Number(e.target.value)
                              )
                            }
                            required={question.required}
                          />
                          {n}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      className="fillin-ans"
                      type="text"
                      name={`question-${question._id}`}
                      placeholder="Your answer"
                      onChange={(e) =>
                        handleAnswerChange(question._id, e.target.value)
                      }
                      required
                    />
                  )}
                </div>
              ))}
              <div className="submit-div flex">
                <button
                  type="submit"
                  className="submit-ans-btn"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </Form>
          </div>
        </section>
      )}
    </>
  );
};
export default answerSurvey;
