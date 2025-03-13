import { Link, Form, useActionData, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import action from "./action";
import "./surveyquestion.css";
import backaro from "../../assets/img/backaro.svg";
import del from "../../assets/img/del.svg";
import add from "../../assets/img/add.svg";
import dot from "../../assets/img/dot.svg";
import option from "../../assets/img/option.svg";
import copy from "../../assets/img/copy.svg";
import useAuthStore from "../../store/useAuthStore";
import PricingModal from "../../components/pricingmodal/pricingmodal";
import { toast } from "react-toastify";
import config from "../../config/config";


const SurveyQuestions = () => {
  const navigate = useNavigate();
  const data = useActionData();
  const { currentSurveyId } = useAuthStore();
  const [isPosting, setIsPosting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const authToken = useAuthStore((state) => state.authToken);

  // Add loading state
  const [isLoading, setIsLoading] = useState(true);

  // Add new state for delete loading
  const [isDeletingId, setIsDeletingId] = useState(null);

  const [questions, setQuestions] = useState([
    {
      id: Date.now(),
      questionId: "",
      questionText: "",
      questionType: "multiple_choice",
      required: true,
      options: [""],
    },
  ]);

  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);

  // Load existing questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${config.API_URL}/surveys/${currentSurveyId}/questions`, {
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        
        if (response.ok && data.questions.length > 0) {
          const formattedQuestions = data.questions.map(q => ({
            id: Date.now() + Math.random(),
            questionId: q._id,
            questionText: q.questionText,
            questionType: q.questionType,
            required: q.required,
            options: q.options.map(opt => opt.text),
          }));
          setQuestions(formattedQuestions);
        }
      } catch (error) {
        console.error("Error loading questions:", error);
        toast.error("Error loading existing questions");
      } finally {
        setIsLoading(false);
      }
    };

    if (currentSurveyId) {
      fetchQuestions();
    } else {
      setIsLoading(false);
    }
  }, [currentSurveyId, authToken]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const question of questions) {
        const questionData = {
          questionId: question.questionId || "",
          questionText: question.questionText,
          questionType: question.questionType,
          required: question.required,
          options: question.questionType === "multiple_choice" 
            ? question.options
            : undefined
        };

        const response = await fetch(`${config.API_URL}/surveys/${currentSurveyId}/questions`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(questionData),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || "Failed to save question");
        }

        setQuestions(prevQuestions => 
          prevQuestions.map(q => 
            q.id === question.id 
              ? { ...q, questionId: data.survey.questions.find(sq => sq.questionText === q.questionText)?._id || q.questionId }
              : q
          )
        );
      }
      toast.success("Questions saved successfully!");
    } catch (error) {
      console.error("Error saving questions:", error);
      toast.error(error.message || "Error saving questions");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setIsPosting(true);

    try {
      // First save/update all questions like in handleSave
      for (const question of questions) {
        const questionData = {
          questionId: question.questionId || "",
          questionText: question.questionText,
          questionType: question.questionType,
          required: question.required,
          options: question.questionType === "multiple_choice" 
            ? question.options
            : undefined
        };

        const response = await fetch(`${config.API_URL}/surveys/${currentSurveyId}/questions`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(questionData),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || "Failed to save question");
        }

        // Update questions with new IDs
        setQuestions(prevQuestions => 
          prevQuestions.map(q => 
            q.id === question.id 
              ? { ...q, questionId: data.survey.questions.find(sq => sq.questionText === q.questionText)?._id || q.questionId }
              : q
          )
        );
      }

      // After all questions are saved, show the pricing modal
      setShowPricingModal(true);
    } catch (error) {
      console.error("Error posting questions:", error);
      toast.error("Error saving questions");
    } finally {
      setIsPosting(false);
    }
  };

  const addNewQuestion = (id) => {
    const newQuestion = {
      id: Date.now(),
      questionId: currentSurveyId,
      questionText: "",
      questionType: "multiple_choice",
      required: false,
      options: [""],
    };
    setQuestions([...questions, newQuestion]);
  };

  const deleteQuestion = async (id) => {
    setIsDeletingId(id); // Show loading state for specific question
    try {
      const questionToDelete = questions.find(q => q.id === id);
      
      if (questionToDelete.questionId) {
        const response = await fetch(
          `${config.API_URL}/surveys/${currentSurveyId}/questions/${questionToDelete.questionId}`, 
          {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to delete question");
        }
      }

      setQuestions(questions.filter((question) => question.id !== id));
      toast.success("Question deleted successfully");
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error(error.message || "Error deleting question");
    } finally {
      setIsDeletingId(null); // Clear loading state
    }
  };

  const duplicateQuestion = (id) => {
    const questionToDuplicate = questions.find((q) => q.id === id);
    if (questionToDuplicate) {
      const duplicatedQuestion = {
        ...questionToDuplicate,
        id: Date.now(),
        // id: questions.length + 1,
      };
      setQuestions([...questions, duplicatedQuestion]);
    }
  };

  const handleQuestionChange = (id, field, value) => {
    const updatedQuestions = questions.map((q) =>
      q.id === id ? { ...q, [field]: value, ...(field === "questionType" && value === "fill_in" ? { options: [] } : {}) } : q
    );
    setQuestions(updatedQuestions);
  };

  const addOption = (id) => {
    const updatedQuestions = questions.map((q) =>
      q.id === id ? { ...q, options: [...q.options, ""] } : q
    );
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionId, index, value) => {
    const updatedQuestions = questions.map((q) =>
      q.id === questionId
        ? {
          ...q,
          options: q.options.map((option, i) =>
            i === index ? value : option
          ),
        }
        : q
    );
    setQuestions(updatedQuestions);
  };

  return (
    <section className="form-page">
      <div className="wrap">
        <div className="form-head flex">
          <Link to="/postsurvey">
            <img src={backaro} className="backaro" alt="Back" />
          </Link>
          <div className="form-h">
            <h3>Add Questions</h3>
          </div>
        </div>

        {isLoading ? (
          <div className="loading">Loading questions...</div>
        ) : (
          <div className="form-container">
            <Form method="post" action="/surveyquestion" onSubmit={handlePostSubmit}>
              {/* To pass id to action */}
              <input type="hidden" name="currentSurveyId" value={currentSurveyId} />

              {questions.map((question) => (
                <div className="oneQuestion" key={question.id}>
                  <div className="question-field flex">
                    <input
                      className="question-input"
                      type="text"
                      name="questionText"
                      required
                      placeholder="Untitled Question"
                      value={question.questionText}
                      onChange={(e) =>
                        handleQuestionChange(question.id, "questionText", e.target.value)
                      }
                    />
                    <img
                      src={copy}
                      className="copy-icon"
                      alt="Duplicate"
                      onClick={() => duplicateQuestion(question.id)}
                    />
                    {isDeletingId === question.id ? (
                      <span className="deleting-spinner">Deleting...</span>
                    ) : (
                      <img
                        src={del}
                        className="delete-icon"
                        alt="Delete"
                        onClick={() => deleteQuestion(question.id)}
                      />
                    )}
                  </div>

                  <div className="choice-field custom-dropdown flex">
                    <div className="wrap-icon flex">
                      <img src={dot} className="dot-icon" alt="Dot" />
                      <select
                        name="questionType"
                        value={question.questionType}
                        onChange={(e) =>
                          handleQuestionChange(question.id, "questionType", e.target.value)
                        }
                        className="choice-select"
                      >
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="fill_in">Fill in</option>
                      </select>
                    </div>
                    {question.questionType === "multiple_choice" && (
                      <div className="options-list flex">
                        <div className="option">
                          {question.options.map((option, index) => (
                            <div className="wrap-icon flex" key={index}>
                              <input
                                key={index}
                                type="text"
                                name="options"
                                placeholder={`Option ${index + 1}`}
                                value={option}
                                onChange={(e) =>
                                  handleOptionChange(
                                    question.id,
                                    index,
                                    e.target.value
                                  )
                                }
                                className="option-input"
                              />
                            </div>
                          ))}
                        </div>

                        <button
                          className="option-select flex"
                          type="button"
                          onClick={() => addOption(question.id)}
                        >
                          Add option
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <button className="next-question flex" onClick={addNewQuestion}>
                Next Question <img src={add} alt="Add" />
              </button>

              <div className="button-group flex">
                <button 
                  type="button" 
                  className="save-btn"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                
                <button 
                  type="submit" 
                  className="post-btn"
                  disabled={isPosting}
                >
                  {isPosting ? "Posting..." : "Post"}
                </button>
              </div>
            </Form>
          </div>
        )}

      </div>

      {showPricingModal && (
        <PricingModal onClose={() => setShowPricingModal(false)} />
      )}

      {showSaveSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Success!</h3>
            <p>Your questions have been saved successfully.</p>
            <button 
              className="modal-btn"
              onClick={() => setShowSaveSuccessModal(false)}
            >
              Continue Editing
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default SurveyQuestions;