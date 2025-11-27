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
import "./answerform.css";

const AnswerForm = () => {
  const { id } = useParams(); // Get the form ID from the URL
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
      
      // Only include Authorization header if user is authenticated
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

        // setFields(json.fields || []);
      // Flatten section.fields → into a single fields array for the renderer
let extractedFields = [];

if (json.sections && Array.isArray(json.sections)) {
  json.sections.forEach(section => {
    if (Array.isArray(section.fields)) {
      extractedFields.push(
        ...section.fields.map(field => ({
          ...field,
          _id: field._id,   // JUST ADDED
          label: field.label || field.questionText  // ensure renderer reads label
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

    // Validate required fields
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

    // Format answers according to API structure
    // const answersArray = fields
    //   .map((field) => {
    //     const fieldId = field._id || field.id;
    //     const answer = answers[fieldId];
    //     if (!answer) return null;

    //     // Convert answer to appropriate format
    //     let value = answer;
    //     if (field.type === "number") {
    //       value = Number(answer);
    //     } else if (field.type === "checkbox") {
    //       value = Array.isArray(answer) ? answer : [answer];
    //     }

    //     return {
    //       fieldId: fieldId,
    //       value: value,
    //     };
    //   })
    //   .filter((answer) => answer !== null);
    const answersArray = fields
  .map((field) => {
    const fieldId = field._id;  // always use _id from API
    const answer = answers[fieldId];
    if (answer === undefined || answer === null) return null;

    let value = answer;
    // if (field.type === "number") value = Number(answer);
    if (field.type === "number" || field.type === "likert") {
      value = Number(answer);
    }    
    else if (field.type === "checkbox") value = Array.isArray(answer) ? answer : [answer];

    return { fieldId, value };
  })
  .filter(a => a !== null);


    const payload = {
      // formId: id,
      email: email,
      submittedAt: new Date().toISOString(),
      answers: answersArray,
    };
    console.log("Payload being sent:", JSON.stringify(payload));

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
    navigate("/dashboard");
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
        <Complete points={0} onDone={handleDone} />
      ) : (
        <section className="fillsurvey">
          <div className="fillsurvey_inner wrap">
            <div className="survey-ans-details flex">
              <div className="flex ans-back-title">
                <Link to="/dashboard">
                  <img src={backaro} className="backaro" alt="Back" />
                </Link>
                <div>
                  <h3 className="survey_title_ans">{form.title || title || "Form"}</h3>
                  {form.description && (
                    <p className="ans-description">{form.description}</p>
                  )}
                  <p className="ans-post-time">
                    {form.createdAt && (
                      <>
                        Created{" "}
                        <span>
                          {new Date(form.createdAt).toLocaleString()}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

{/* Email Section */}
<div className="question-answer">
  <p className="ans-question">
    Your Email <span className="required-star">*</span>
  </p>
  <input
    type="email"
    className="fillin-ans"
    placeholder="Enter your email"
    required
    value={email}
    readOnly={isAuthenticated && !!userEmail}   // if logged in → disable editing
    onChange={(e) => setEmail(e.target.value)}
  />
</div>
            <Form onSubmit={handleSubmit} className="ans-form">
              {fields.map((field, index) => {
                const fieldId = field._id || field.id;
                return (
                  <div key={fieldId} className="question-answer">
                    <p className="ans-question">
                      <span>{index + 1}.</span> {field.label || field.questionText || ""}
                      {field.required && <span className="required-star"> *</span>}
                    </p>

                    {field.type === "likert" ? (
  // <div className="likert-scale-container">
  //   {field.likert?.scale?.length > 0 ? (
  //     <div className="likert-options">
  //       {field.likert.scale.map((option) => (
  //         <label key={option._id} className="likert-option">
  //           <input
  //             type="radio"
  //             name={`likert-${field._id}`}
  //             value={option.value}
  //             onChange={(e) =>
  //               handleAnswerChange(field._id, e.target.value)
  //             }
  //             required={field.required}
  //           />
  //           <span>{option.label}</span>
  //         </label>
  //       ))}
  //     </div>
  //   ) : (
  //     <p>No likert scale options found</p>
  //   )}
  // </div>

  // FIRST THAT SHOW
  <div className="likert-scale-container">
  {field.likert?.scale?.length > 0 ? (
    <fieldset className="likert-fieldset">
      {/* <legend className="likert-legend">{field.label}</legend> */}

      <div className="likert-options">
        {field.likert.scale.map((option) => (
          <label key={option._id} className="likert-option">
            <input
              type="radio"
              name={`likert-${field._id}`}
              value={option.value}
              onChange={(e) =>
                handleAnswerChange(field._id, Number(e.target.value))
              }
              required={field.required}
            />
            <span className="likert-label">{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  ) : (
    <p>Getting options, kinly wait</p>
  )}
</div>

) : field.type === "multiple-choice" || field.type === "radio" ? (


                    // {field.type === "multiple-choice" || field.type === "radio" ? (
                      field.options && field.options.length > 0 ? (
                        field.options.map((option, optIndex) => (
                          <label key={optIndex} className="answer-ques-opt">
                            <input
                              type="radio"
                              className="tick-ans"
                              name={`field-${fieldId}`}
                              value={option}
                              onChange={(e) =>
                                handleAnswerChange(fieldId, e.target.value)
                              }
                              required={field.required}
                            />
                            {option}
                          </label>
                        ))
                      ) : (
                        <p className="no-options">No options available</p>
                      )
                    ) : field.type === "checkbox" ? (
                      field.options && field.options.length > 0 ? (
                        field.options.map((option, optIndex) => {
                          const isSelected =
                            Array.isArray(answers[fieldId]) &&
                            answers[fieldId].includes(option);
                          return (
                            <label key={optIndex} className="answer-ques-opt">
                              <input
                                type="checkbox"
                                className="tick-ans"
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
                              {option}
                            </label>
                          );
                        })
                      ) : (
                        <p className="no-options">No options available</p>
                      )
                    ) : field.type === "textarea" ? (
                      <textarea
                        className="fillin-ans textarea-ans"
                        name={`field-${fieldId}`}
                        placeholder="Your answer"
                        rows="5"
                        value={answers[fieldId] || ""}
                        onChange={(e) =>
                          handleAnswerChange(fieldId, e.target.value)
                        }
                        required={field.required}
                      />
                    ) : field.type === "date" ? (
                      <input
                        className="fillin-ans"
                        type="date"
                        name={`field-${fieldId}`}
                        value={answers[fieldId] || ""}
                        onChange={(e) =>
                          handleAnswerChange(fieldId, e.target.value)
                        }
                        required={field.required}
                      />
                    ) : field.type === "number" ? (
                      <input
                        className="fillin-ans"
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
                      <input
                        className="fillin-ans"
                        type="text"
                        name={`field-${fieldId}`}
                        placeholder="Your answer"
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

export default AnswerForm;


