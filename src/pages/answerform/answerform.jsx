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
import FormComplete from "../../components/completed/FormComplete";
import config from "../../config/config";
import backaro from "../../assets/img/backaro.svg";
import "./answerform.css";

const AnswerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const authToken = useAuthStore((state) => state.authToken);
  const location = useLocation();
  const [form, setForm] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const { title, createdAt } = location.state || {};
  const userEmail = useAuthStore((state) => state.userEmail);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (isAuthenticated && userEmail) {
      setEmail(userEmail);
    }
  }, [isAuthenticated, userEmail]);

  useEffect(() => {
    const fetchForm = async () => {
      const API_URL = `${config.API_URL}/forms/${id}`;
      const headers = {
        "Content-Type": "application/json",
      };
      
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      
      const options = {
        method: "GET",
        headers: headers,
      };
      
      try {
        const response = await fetch(API_URL, options);
        const json = await response.json();
        if (!response.ok)
          throw new Error(json.msg || json.message || "Failed to fetch form");
        setForm(json);

        let extractedFields = [];

        if (json.sections && Array.isArray(json.sections)) {
          json.sections.forEach(section => {
            if (Array.isArray(section.fields)) {
              extractedFields.push(
                ...section.fields.map(field => ({
                  ...field,
                  _id: field._id,
                  label: field.label || field.questionText
                }))
              );
            }
          });
        }

        setFields(extractedFields);
      } catch (error) {
        console.error("Error:", error);
        toast.error(error.message || "Failed to load form");
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [id, authToken]);

  // Calculate progress
  const totalFields = fields.length + 1; // +1 for email field
  const answeredFields = Object.keys(answers).filter((key) => {
    const answer = answers[key];
    if (Array.isArray(answer)) {
      return answer.length > 0;
    }
    return answer !== undefined && answer !== null && answer !== "";
  }).length + (email ? 1 : 0); // +1 if email is filled

  const handleAnswerChange = (fieldId, value) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [fieldId]: value,
    }));
  };

  const handleMultipleSelectionChange = (fieldId, optionValue, isChecked) => {
    setAnswers((prevAnswers) => {
      const currentSelections = Array.isArray(prevAnswers[fieldId])
        ? [...prevAnswers[fieldId]]
        : [];

      if (isChecked) {
        return {
          ...prevAnswers,
          [fieldId]: [...currentSelections, optionValue],
        };
      } else {
        return {
          ...prevAnswers,
          [fieldId]: currentSelections.filter((opt) => opt !== optionValue),
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || email.trim() === "") {
      toast.error("Please enter your email address");
      return;
    }

    const missingRequiredFields = fields
      .filter((field) => field.required)
      .some((field) => {
        const answer = answers[field._id || field.id];
        if (field.type === "checkbox") {
          return !answer || !Array.isArray(answer) || answer.length === 0;
        }
        return !answer || answer === "";
      });

    if (missingRequiredFields) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    const answersArray = fields
      .map((field) => {
        const fieldId = field._id;
        const answer = answers[fieldId];
        if (answer === undefined || answer === null) return null;

        let value = answer;
        if (field.type === "number" || field.type === "likert") {
          value = Number(answer);
        } else if (field.type === "checkbox") {
          value = Array.isArray(answer) ? answer : [answer];
        }

        return { fieldId, value };
      })
      .filter(a => a !== null);

    const payload = {
      email: email,
      submittedAt: new Date().toISOString(),
      answers: answersArray,
    };

    const API_URL = `${config.API_URL}/forms/${id}/responses`;
    const headers = {
      "Content-Type": "application/json",
    };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    
    const options = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    };

    try {
      const response = await fetch(API_URL, options);
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.msg || json.message || "Failed to submit form");
      }

      setShowComplete(true);
      toast.success("Form submitted successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Error submitting form!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDone = () => {
    navigate("/signup");
  };

  if (loading) return <p className="ans-msg">Loading form...</p>;
  if (!form || fields.length === 0)
    return (
      <p className="ans-msg">
        Oops! No form found, kindly reload
      </p>
    );

  return (
    <>
      {showComplete ? (
        <FormComplete onDone={handleDone} />
      ) : (
        <section className="fillform">
          <div className="fillform_inner">
            {/* Form Header - Sticky */}
            <div className="answer-header">
              <div className="fillform-header-content">
                <div className="fillform-headright">
                  <div className="fillform-header-info">
                    <h1 className="fillform-title">{form.title || title || "Form"}</h1>
                    {form.description && (
                      <p className="fillform-description">{form.description}</p>
                    )}
                  </div>
                </div>
              </div>
              {/* Progress Bar - Sticky */}
              <div className="progress-container">
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${
                        totalFields > 0
                          ? (answeredFields / totalFields) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="progress-text">
                  {answeredFields}/{totalFields}
                </span>
              </div>
            </div>

            {/* Form */}
            <Form onSubmit={handleSubmit} className="ans-form">
              {/* Email Field */}
              <div className="response-question-card">
                <p className="fillquestion-text fw-5h">
                  <span className="fillquestion-number">*</span>
                  <span>Recorded Email</span>
                </p>
                <input
                  type="email"
                  className="fill-text-input form-email-input"
                  placeholder="Enter your email address"
                  required
                  value={email}
                  readOnly={isAuthenticated && !!userEmail}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Form Fields */}
              {fields.map((field, index) => {
                const fieldId = field._id || field.id;
                return (
                  <div key={fieldId} className="response-question-card">
                    <p className="fillquestion-text fw-5h">
                      <span className="fillquestion-number">{index + 1}.</span>
                      <span>{field.label || field.questionText || ""}</span>
                      {field.required && <span className="required-star"> *</span>}
                    </p>

                    {/* Likert Scale */}
                    {field.type === "likert" ? (
                      <div className="likert-scale">
                        {field.likert?.scale?.length > 0 ? (
                          field.likert.scale.map((option) => (
                            <label key={option._id || option.value} className="likert-option">
                              <input
                                type="radio"
                                className="likert-input"
                                name={`likert-${field._id}`}
                                value={option.value}
                                onChange={(e) =>
                                  handleAnswerChange(field._id, Number(e.target.value))
                                }
                                required={field.required}
                              />
                              <span className="likert-label">{option.label}</span>
                            </label>
                          ))
                        ) : (
                          <p className="no-options">Loading options...</p>
                        )}
                      </div>
                    ) : field.type === "multiple-choice" || field.type === "radio" ? (
                      /* Multiple Choice */
                      <div className="filloptions-list">
                        {field.options && field.options.length > 0 ? (
                          field.options.map((option, optIndex) => (
                            <label key={optIndex} className="filloption-label">
                              <input
                                type="radio"
                                className="option-input"
                                name={`field-${fieldId}`}
                                value={option}
                                onChange={(e) =>
                                  handleAnswerChange(fieldId, e.target.value)
                                }
                                required={field.required}
                              />
                              <span className="option-text">{option}</span>
                            </label>
                          ))
                        ) : (
                          <p className="no-options">No options available</p>
                        )}
                      </div>
                    ) : field.type === "checkbox" ? (
                      /* Multiple Selection */
                      <div className="filloptions-list">
                        {field.options && field.options.length > 0 ? (
                          field.options.map((option, optIndex) => {
                            const isSelected =
                              Array.isArray(answers[fieldId]) &&
                              answers[fieldId].includes(option);
                            return (
                              <label key={optIndex} className="filloption-label">
                                <input
                                  type="checkbox"
                                  className="option-input checkbox"
                                  name={`field-${fieldId}-option-${optIndex}`}
                                  value={option}
                                  checked={isSelected}
                                  onChange={(e) =>
                                    handleMultipleSelectionChange(
                                      fieldId,
                                      e.target.value,
                                      e.target.checked
                                    )
                                  }
                                />
                                <span className="option-text">{option}</span>
                              </label>
                            );
                          })
                        ) : (
                          <p className="no-options">No options available</p>
                        )}
                      </div>
                    ) : field.type === "textarea" ? (
                      /* Textarea */
                      <textarea
                        className="fill-text-input"
                        name={`field-${fieldId}`}
                        placeholder="Your answer..."
                        rows="5"
                        value={answers[fieldId] || ""}
                        onChange={(e) =>
                          handleAnswerChange(fieldId, e.target.value)
                        }
                        required={field.required}
                      />
                    ) : field.type === "date" ? (
                      /* Date */
                      <input
                        className="fill-text-input"
                        type="date"
                        name={`field-${fieldId}`}
                        value={answers[fieldId] || ""}
                        onChange={(e) =>
                          handleAnswerChange(fieldId, e.target.value)
                        }
                        required={field.required}
                      />
                    ) : field.type === "number" ? (
                      /* Number */
                      <input
                        className="fill-text-input"
                        type="number"
                        name={`field-${fieldId}`}
                        placeholder="Enter a number"
                        value={answers[fieldId] || ""}
                        onChange={(e) =>
                          handleAnswerChange(fieldId, e.target.value)
                        }
                        required={field.required}
                      />
                    ) : (
                      /* Text (default) */
                      <input
                        className="fill-text-input"
                        type="text"
                        name={`field-${fieldId}`}
                        placeholder="Your answer..."
                        value={answers[fieldId] || ""}
                        onChange={(e) =>
                          handleAnswerChange(fieldId, e.target.value)
                        }
                        required={field.required}
                      />
                    )}
                  </div>
                );
              })}

              {/* Submit Button */}
              <div className="submit-container">
                <button
                  type="submit"
                  className="submit-button submit-form-btn"
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

export default AnswerForm;