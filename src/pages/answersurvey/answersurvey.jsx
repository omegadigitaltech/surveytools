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

const AnswerSurvey = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const authToken = useAuthStore((state) => state.authToken);
  const location = useLocation();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [customInputs, setCustomInputs] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const { title, description, createdAt, points } = location.state || {};

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

  // Calculate progress
  const totalQuestions = questions.length;
  const answeredQuestions = Object.keys(answers).filter((key) => {
    const answer = answers[key];
    if (Array.isArray(answer)) {
      return answer.length > 0;
    }
    return answer !== undefined && answer !== null && answer !== "";
  }).length;

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

  const handleMultipleSelectionChange = (
    questionId,
    optionValue,
    isChecked,
    allowsCustomInput = false
  ) => {
    setAnswers((prevAnswers) => {
      const currentSelections = Array.isArray(prevAnswers[questionId])
        ? [...prevAnswers[questionId]]
        : [];

      if (isChecked) {
        if (allowsCustomInput) {
          return {
            ...prevAnswers,
            [questionId]: [...currentSelections, optionValue],
          };
        } else {
          return {
            ...prevAnswers,
            [questionId]: [...currentSelections, optionValue],
          };
        }
      } else {
        if (allowsCustomInput) {
          setCustomInputs((prev) => {
            const newInputs = { ...prev };
            delete newInputs[`${questionId}_${optionValue}`];
            return newInputs;
          });
        }
        return {
          ...prevAnswers,
          [questionId]: currentSelections.filter((option) => {
            if (typeof option === "string") {
              return option !== optionValue;
            } else {
              return option.selectedOption !== optionValue;
            }
          }),
        };
      }
    });
  };

  const formatAnswerForSubmission = (questionId, answer, question) => {
    if (
      question.questionType === "multiple_selection" &&
      Array.isArray(answer)
    ) {
      return answer.map((item) => {
        if (typeof item === "string") {
          const option = question.options.find(
            (opt) => (typeof opt === "string" ? opt : opt.text) === item
          );
          const allowsCustomInput =
            typeof option === "object" && option.allowsCustomInput;

          if (allowsCustomInput) {
            const customInput = customInputs[`${questionId}_${item}`];
            if (customInput) {
              return {
                selectedOption: item,
                customInput: customInput,
              };
            }
          }
          return item;
        }
        return item;
      });
    } else if (typeof answer === "string") {
      const option = question.options.find(
        (opt) => (typeof opt === "string" ? opt : opt.text) === answer
      );
      const allowsCustomInput =
        typeof option === "object" && option.allowsCustomInput;

      if (allowsCustomInput) {
        const customInput = customInputs[`${questionId}_${answer}`];
        if (customInput) {
          return {
            selectedOption: answer,
            customInput: customInput,
          };
        }
      }
      return answer;
    }
    return answer;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const missingRequiredSelections = questions
      .filter((q) => q.questionType === "multiple_selection" && q.required)
      .some(
        (q) =>
          !answers[q._id] ||
          !Array.isArray(answers[q._id]) ||
          answers[q._id].length === 0
      );

    if (missingRequiredSelections) {
      toast.error(
        "Please select at least one option for all required multiple selection questions"
      );
      return;
    }

    const missingCustomInputs = questions.some((question) => {
      const answer = answers[question._id];
      if (!answer) return false;

      if (question.questionType === "multiple_choice") {
        const option = question.options.find(
          (opt) => (typeof opt === "string" ? opt : opt.text) === answer
        );
        if (typeof option === "object" && option.allowsCustomInput) {
          const customInput = customInputs[`${question._id}_${answer}`];
          return !customInput || customInput.trim() === "";
        }
      }

      if (
        question.questionType === "multiple_selection" &&
        Array.isArray(answer)
      ) {
        return answer.some((selectedOption) => {
          const option = question.options.find(
            (opt) =>
              (typeof opt === "string" ? opt : opt.text) === selectedOption
          );
          if (typeof option === "object" && option.allowsCustomInput) {
            const customInput =
              customInputs[`${question._id}_${selectedOption}`];
            return !customInput || customInput.trim() === "";
          }
          return false;
        });
      }

      return false;
    });

    if (missingCustomInputs) {
      toast.error(
        "Please provide custom input for all selected options that require it"
      );
      return;
    }

    setSubmitting(true);

    const answerArray = Object.entries(answers).map(
      ([questionId, response]) => ({
        questionId,
        response: formatAnswerForSubmission(
          questionId,
          response,
          questions.find((q) => q._id === questionId)
        ),
      })
    );

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
      setEarnedPoints(points);
      setShowComplete(true);
    } catch (error) {
      console.log(error);
      console.error("Error submitting survey:", error);
      toast.error(error.message || "Error submitting survey!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDone = () => {
    navigate("/dashboard");
  };

  if (loading) return <p className="ans-msg">Loading survey questions...</p>;
  if (questions.length === 0)
    return (
      <p className="ans-msg">
        Oops! No questions found here, check other surveys.
      </p>
    );

  return (
    <>
      {showComplete ? (
        <Complete points={earnedPoints} onDone={handleDone} />
      ) : (
        <section className="fillsurvey">
          <div className="fillsurvey_inner">
            {/* Survey Header - Sticky */}
            <div className="answer-header">
              <div className="fillsurvey-header-content">
                <Link to={`/expandsurvey/${id}`} className="back-link">
                  <img src={backaro} className="backaro" alt="Back" />
                </Link>
                <div className="fillsurv-headright">
                  <div className="fillsurvey-header-info">
                    <h1 className="fillsurvey-title">{title || "Survey"}</h1>
                    <p className="fillsurvey-description">
                      Kindly answer the following questions
                    </p>
                  </div>
                  <div className="fillpoints-badge">{points || 0} points</div>
                </div>
              </div>
              {/* Progress Bar - Sticky */}
              <div className="progress-container">
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${
                        totalQuestions > 0
                          ? (answeredQuestions / totalQuestions) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="progress-text">
                  {answeredQuestions}/{totalQuestions}
                </span>
              </div>
            </div>

            {/* Questions Form */}
            <Form onSubmit={handleSubmit} className="ans-form">
              {questions.map((question, index) => (
                <div key={question._id} className="response-question-card">
                  <p className="fillquestion-text fw-5h">
                    <span className="fillquestion-number">{index + 1}.</span>
                    <span>{question.questionText}</span>
                  </p>

                  {/* Multiple Choice */}
                  {question.questionType === "multiple_choice" && (
                    <div className="filloptions-list">
                      {question.options.map((option, optIndex) => {
                        const optionText =
                          typeof option === "string" ? option : option.text;
                        const allowsCustomInput =
                          typeof option === "object" &&
                          option.allowsCustomInput;
                        const isSelected = answers[question._id] === optionText;

                        return (
                          <div key={optIndex} className="filloption-wrapper">
                            <label className="filloption-label">
                              <input
                                type="radio"
                                className="option-input"
                                name={`question-${question._id}`}
                                value={optionText}
                                onChange={(e) => {
                                  handleAnswerChange(
                                    question._id,
                                    e.target.value
                                  );
                                  if (!e.target.checked && allowsCustomInput) {
                                    handleCustomInputChange(
                                      question._id,
                                      optionText,
                                      ""
                                    );
                                  }
                                }}
                                required={question.required}
                              />
                              <span className="option-text">{optionText}</span>
                            </label>
                            {allowsCustomInput && isSelected && (
                              <input
                                type="text"
                                className="custom-input-field"
                                placeholder="Please specify..."
                                value={
                                  customInputs[
                                    `${question._id}_${optionText}`
                                  ] || ""
                                }
                                onChange={(e) =>
                                  handleCustomInputChange(
                                    question._id,
                                    optionText,
                                    e.target.value
                                  )
                                }
                                required
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Multiple Selection */}
                  {question.questionType === "multiple_selection" && (
                    <div className="options-list">
                      {question.options.map((option, optIndex) => {
                        const optionText =
                          typeof option === "string" ? option : option.text;
                        const allowsCustomInput =
                          typeof option === "object" &&
                          option.allowsCustomInput;
                        const isSelected =
                          Array.isArray(answers[question._id]) &&
                          answers[question._id].some((item) =>
                            typeof item === "string"
                              ? item === optionText
                              : item.selectedOption === optionText
                          );

                        return (
                          <div key={optIndex} className="option-wrapper">
                            <label className="filloption-label">
                              <input
                                type="checkbox"
                                className="option-input checkbox"
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
                              <span className="option-text">{optionText}</span>
                            </label>
                            {allowsCustomInput && isSelected && (
                              <input
                                type="text"
                                className="custom-input-field"
                                placeholder="Please specify..."
                                value={
                                  customInputs[
                                    `${question._id}_${optionText}`
                                  ] || ""
                                }
                                onChange={(e) =>
                                  handleCustomInputChange(
                                    question._id,
                                    optionText,
                                    e.target.value
                                  )
                                }
                                required
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Likert Scale */}
                  {(question.questionType === "likert" ||
                    question.questionType === "five_point") && (
                    <div className="likert-scale">
                      {question.likert && question.likert.scale
                        ? question.likert.scale.map((item) => (
                            <label key={item.value} className="likert-option">
                              <input
                                type="radio"
                                className="likert-input"
                                name={`question-${question._id}`}
                                value={item.value}
                                onChange={(e) =>
                                  handleAnswerChange(
                                    question._id,
                                    Number(e.target.value)
                                  )
                                }
                                required={question.required}
                              />
                              <span className="likert-label">{item.label}</span>
                            </label>
                          ))
                        : [1, 2, 3, 4, 5].map((n) => (
                            <label key={n} className="likert-option">
                              <input
                                type="radio"
                                className="likert-input"
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
                              <span className="likert-label">{n}</span>
                            </label>
                          ))}
                    </div>
                  )}

                  {/* Fill In (Short Text) */}
                  {question.questionType === "fill_in" && (
                    <textarea
                      className="fill-text-input"
                      name={`question-${question._id}`}
                      placeholder="Your answer should be provided here..."
                      onChange={(e) =>
                        handleAnswerChange(question._id, e.target.value)
                      }
                      required={question.required}
                      rows={3}
                    />
                  )}
                </div>
              ))}

              {/* Submit Button */}
              <div className="submit-container">
                <button
                  type="submit"
                  className="submit-button submit-surv-btn"
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

export default AnswerSurvey;
