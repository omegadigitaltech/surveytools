import { Link, Form, useActionData, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import action from "./action";
import "./surveyquestion.css";
import backaro from "../../assets/img/backaro.svg";
import del from "../../assets/img/del.svg";
import add from "../../assets/img/add.svg";
import plus from "../../assets/img/icon-add.svg";
import dot from "../../assets/img/dot.svg";
import copy from "../../assets/img/copy.svg";
import close from "../../assets/img/close.svg";
import palette from "../../assets/img/palette.svg";
import add_circle from "../../assets/img/add_circle.svg";
import useAuthStore from "../../store/useAuthStore";
import PricingModal from "../../components/pricingmodal/pricingmodal";
import { toast } from "react-toastify";
import config from "../../config/config";
import axios from "axios";
import verifyPayment from "../../utils/helpers/verifyPayment";

// DRAG & DROP
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const SurveyQuestions = () => {
  const navigate = useNavigate();
  const data = useActionData();
  const { currentSurveyId, hasPaid, setHasPaid } = useAuthStore();
  const [isPosting, setIsPosting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const authToken = useAuthStore((state) => state.authToken);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  // Add new state for delete loading
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [questions, setQuestions] = useState([
    {
      id: Date.now(),
      questionId: "",
      questionText: "",
      questionType: "multiple_choice",
      required: true,
      options: [{ text: "", allowsCustomInput: false }],
    },
  ]);

  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);

  // Track Select questions
  const [activeQuestionId, setActiveQuestionId] = useState(null);

  const handleFocusQuestion = (id) => {
    setActiveQuestionId(id);
  };

  const handleBlurQuestion = () => {
    setActiveQuestionId(null);
  };
  // THEME
  const toggleTheme = () => {
    setShowTheme(!showTheme);
  };

  // Load existing questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          `${config.API_URL}/surveys/${currentSurveyId}/questions`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();

        if (response.ok && data.questions.length > 0) {
          const formattedQuestions = data.questions.map((q) => ({
            id: Date.now() + Math.random(),
            questionId: q._id,
            questionText: q.questionText,
            questionType: q.questionType,
            required: q.required,
            options: q.options.map((opt) => ({
              text: typeof opt === "string" ? opt : opt.text,
              allowsCustomInput:
                typeof opt === "object"
                  ? opt.allowsCustomInput || false
                  : false,
            })),
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
      // Prepare bulk payload
      const validTypes = [
        "multiple_choice",
        "five_point",
        "fill_in",
        "multiple_selection",
      ];

      const bulkPayload = {
        questions: questions.map((question) => ({
          questionId: question.questionId || "", // Keep existing ID or empty for new
          questionText: question.questionText.trim(), // Trim whitespace
          questionType: question.questionType,
          required: Boolean(question.required),
          // Conditional options handling
          options:
            question.questionType === "multiple_choice" ||
            question.questionType === "multiple_selection"
              ? question.options
                  .map((opt) => ({
                    text:
                      typeof opt === "string" ? opt.trim() : opt.text.trim(),
                    allowsCustomInput:
                      typeof opt === "object"
                        ? opt.allowsCustomInput || false
                        : false,
                  }))
                  .filter((opt) => opt.text !== "") // Remove empty options
              : undefined, // Exclude options for non-multiple_choice questions
        })),
      };

      const response = await fetch(
        `${config.API_URL}/surveys/${currentSurveyId}/bulk-questions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bulkPayload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Error response:", data);
        throw new Error("Failed to save question" || data.msg);
      }
      // Update question IDs from response
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) => {
          const serverQuestion = data.results.details.find(
            (sq) => sq.question === q.questionText
          );
          return serverQuestion?.questionId
            ? { ...q, questionId: serverQuestion.questionId }
            : q;
        })
      );

      toast.success("Questions saved successfully!" || data.msg);
    } catch (error) {
      toast.error("Faill to save questions");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setIsPosting(true);
    setIsCheckingPayment(true);

    try {
      await handleSave(); // Reuse bulk save logic

      // Check payment status before showing pricing modal
      const isPaid = await verifyPayment(currentSurveyId, authToken);
      setHasPaid(isPaid);

      if (isPaid) {
        // If payment verified, navigate directly to publish page
        toast.success("Payment already verified!");
        navigate("/publish");
      } else {
        // If not paid, show pricing modal
        setShowPricingModal(true);
      }
    } catch (error) {
      toast.error("Error saving questions");
    } finally {
      setIsPosting(false);
      setIsCheckingPayment(false);
    }
  };

  const addNewQuestion = (id) => {
    const newQuestion = {
      id: Date.now(),
      questionId: currentSurveyId,
      questionText: "",
      questionType: "multiple_choice",
      required: false,
      options: [{ text: "", allowsCustomInput: false }],
    };
    setQuestions([...questions, newQuestion]);
  };

  const deleteQuestion = async (id) => {
    setIsDeletingId(id); // Show loading state for specific question
    try {
      const questionToDelete = questions.find((q) => q.id === id);

      if (questionToDelete.questionId) {
        const response = await fetch(
          // here
          `${config.API_URL}/surveys/${currentSurveyId}/questions/${questionToDelete.questionId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${authToken}`,
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
      q.id === id
        ? {
            ...q,
            [field]: value,
            ...(field === "questionType" &&
            (value === "fill_in" || value === "five_point")
              ? { options: [] }
              : {}),
          }
        : q
    );
    setQuestions(updatedQuestions);
  };

  const addOption = (id) => {
    const updatedQuestions = questions.map((q) =>
      q.id === id
        ? {
            ...q,
            options: [...q.options, { text: "", allowsCustomInput: false }],
          }
        : q
    );
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionId, index, field, value) => {
    const updatedQuestions = questions.map((q) =>
      q.id === questionId
        ? {
            ...q,
            options: q.options.map((option, i) =>
              i === index ? { ...option, [field]: value } : option
            ),
          }
        : q
    );
    setQuestions(updatedQuestions);
  };

  // Question Upload Function
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    const formData = new FormData();
    formData.append("document", file);

    try {
      setIsUploading(true);
      setUploadProgress(30);

      // Used Axios for the upload tracking
      const response = await axios.post(
        `${config.API_URL}/surveys/${currentSurveyId}/upload-questionnaire`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      if (response.data.status === "success") {
        toast.success(response.data.msg);
        // Refresh questions after successful upload
        // here
        const newQuestionsResponse = await axios.get(
          `${config.API_URL}/surveys/${currentSurveyId}/questions`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const formattedQuestions = newQuestionsResponse.data.questions.map(
          (q) => ({
            id: Date.now() + Math.random(),
            questionId: q._id,
            questionText: q.questionText,
            questionType: q.questionType,
            required: q.required,
            options: q.options.map((opt) => ({
              text: typeof opt === "string" ? opt : opt.text,
              allowsCustomInput:
                typeof opt === "object"
                  ? opt.allowsCustomInput || false
                  : false,
            })),
          })
        );

        setQuestions(formattedQuestions);
      }
    } catch (error) {
      console.error("File upload failed:", error);
      toast.error(error.response?.data?.message || "Failed to upload PDF");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      e.target.value = ""; // Reset file input
    }
  };
  // DRAG & DROP
  const handleDragEnd = (result) => {
    if (!result.destination) return; // dropped outside
    const reordered = reorder(
      questions,
      result.source.index,
      result.destination.index
    );
    setQuestions(reordered);
  };

  return (
    <section className="form-page">
      <div className="wrap">
        <div className="surveyform-head flex">
          <h1 className="head">Create Questionnaire</h1>
          <div className="flex import_style">
            <label className="import-survey">
              {isUploading
                ? `Uploading... ${uploadProgress}%`
                : "Import from files"}
              <input
                type="file"
                accept=".pdf"
                name="document"
                onChange={handleFileUpload}
                style={{ display: "none" }}
                disabled={isUploading}
              />
            </label>
            <div className="theme-wrapper">
              {/* Palette Icon (keep existing positioning in page layout) */}
              <img
                src={palette}
                alt="palette"
                className="palette-icon"
                onClick={() => setShowTheme(!showTheme)}
              />

              {/* Theme side card */}
              <div className={`form-theme ${showTheme ? "open" : ""}`}>
                <div className="flex theme-head">
                  <p>Style</p>
                  <img
                    src={close}
                    alt="close"
                    onClick={() => setShowTheme(false)}
                  />
                </div>

                <div className="theme-section">
                  <p>Background Color</p>
                </div>

                <div className="theme-section">
                  <p>Font Family</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="question-box">
          {isLoading ? (
            <div className="loading">Loading questions...</div>
          ) : (
            <div className="form-container">
              <Form
                method="post"
                action="/surveyquestion"
                onSubmit={handlePostSubmit}
              >
                <h1 form-title>Title of my Survey will appear here</h1>
                {/* To pass id to action */}
                <input
                  type="hidden"
                  name="currentSurveyId"
                  value={currentSurveyId}
                />
                {/* ✅ DragDropContext wrapper */}
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="questions">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {questions.map((question, index) => {
                          const isActive = activeQuestionId === question.id;
                          return (
                            <Draggable
                              key={question.id}
                              draggableId={question.id.toString()}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`oneQuestion ${
                                    isActive ? "active" : ""
                                  } ${snapshot.isDragging ? "dragging" : ""}`}
                                  onClick={() =>
                                    handleFocusQuestion(question.id)
                                  }
                                >
                                  {/* 🔢 Add numbering */}
                                  <div className="flex num-drag">
                                    <div className="question-number">
                                      Q{index + 1}.
                                    </div>
                                    <div
                                      className="drag-handle"
                                      {...provided.dragHandleProps}
                                    >
                                      <div></div>
                                      <div></div>
                                      <div></div>
                                      <div></div>
                                      <div></div>
                                      <div></div>
                                      {/* <div></div><div></div><div></div> */}
                                    </div>
                                  </div>

                                  {/* <div
      className={`oneQuestion ${isActive ? "active" : ""}`}
      key={question.id}
      onClick={() => handleFocusQuestion(question.id)}
    > */}

                                  {isActive ? (
                                    <>
                                      <div className="question-field flex">
                                        <input
                                          className="question-input"
                                          type="text"
                                          name="questionText"
                                          required
                                          placeholder="Question title"
                                          value={question.questionText}
                                          onChange={(e) =>
                                            handleQuestionChange(
                                              question.id,
                                              "questionText",
                                              e.target.value
                                            )
                                          }
                                          onBlur={handleBlurQuestion}
                                        />
                                        <div className="question-actions flex">
                                          <img
                                            src={copy}
                                            className="copy-icon"
                                            alt="Duplicate"
                                            onClick={() =>
                                              duplicateQuestion(question.id)
                                            }
                                          />
                                          {isDeletingId === question.id ? (
                                            <span className="deleting-spinner">
                                              Deleting...
                                            </span>
                                          ) : (
                                            <img
                                              src={del}
                                              className="delete-icon"
                                              alt="Delete"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                deleteQuestion(question.id);
                                              }}
                                            />
                                          )}
                                        </div>
                                      </div>

                                      <div className="choice-field custom-dropdown flexx">
                                        <div className="wrap-icon type-row flex">
                                          <img
                                            src={dot}
                                            className="dot-icon"
                                            alt="Dot"
                                          />
                                          <select
                                            name="questionType"
                                            value={question.questionType}
                                            onChange={(e) =>
                                              handleQuestionChange(
                                                question.id,
                                                "questionType",
                                                e.target.value
                                              )
                                            }
                                            className="choice-select"
                                          >
                                            <option value="multiple_choice">
                                              Multiple Choice
                                            </option>
                                            <option value="multiple_selection">
                                              Multiple Selection
                                            </option>
                                            <option value="fill_in">
                                              Fill in
                                            </option>
                                            <option value="five_point">
                                              Five Point
                                            </option>
                                          </select>
                                        </div>

                                        {(question.questionType ===
                                          "multiple_choice" ||
                                          question.questionType ===
                                            "multiple_selection") && (
                                          <div className="options-list flex">
                                            {question.options.map(
                                              (option, index) => (
                                                <div
                                                  className="option-row flex"
                                                  key={index}
                                                >
                                                  <input
                                                    type="text"
                                                    placeholder={`Option ${
                                                      index + 1
                                                    }`}
                                                    value={option.text}
                                                    onChange={(e) =>
                                                      handleOptionChange(
                                                        question.id,
                                                        index,
                                                        "text",
                                                        e.target.value
                                                      )
                                                    }
                                                    className="option-input"
                                                  />
                                                  <div className="flex">
                                                    <label className="custom-input-checkbox switch">
                                                      <input
                                                        type="checkbox"
                                                        checked={
                                                          option.allowsCustomInput
                                                        }
                                                        onChange={(e) =>
                                                          handleOptionChange(
                                                            question.id,
                                                            index,
                                                            "allowsCustomInput",
                                                            e.target.checked
                                                          )
                                                        }
                                                      />
                                                      <span className="slider"></span>
                                                    </label>
                                                    <p className="switch-label-txt">
                                                      Allow custom input
                                                    </p>
                                                  </div>
                                                </div>
                                              )
                                            )}
                                            <button
                                              className="option-select flex"
                                              type="button"
                                              onClick={() =>
                                                addOption(question.id)
                                              }
                                            >
                                              Add option
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  ) : (
                                    //  Collapsed Preview Mode
                                    <div className="collapsed-preview">
                                      <p className="preview-question">
                                        {question.questionText ||
                                          "Untitled Question"}
                                      </p>
                                      {question.options &&
                                        question.options.length > 0 && (
                                          <ul className="preview-options">
                                            {question.options.map((opt, i) => (
                                              <li key={i}>
                                                {opt.text ||
                                                  "Option " + (i + 1)}
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                <button className="next-question flex" onClick={addNewQuestion}>
                  <img src={add_circle} alt="Add" /> Add Question
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
                    {isPosting ? "Publishng..." : "Publish"}
                  </button>
                </div>
              </Form>
            </div>
          )}

          <div className="form-theme">
            <div className="flex theme-head">
              <p>Style</p>
              <img src={close} alt="" />
            </div>
            <div>
              <p>Background Color</p>
            </div>
            <div>
              <p>Font Family</p>
            </div>
          </div>
        </div>
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
