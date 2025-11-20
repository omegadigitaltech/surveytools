import { Link, Form, useActionData, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import action from "./action";
import "./surveyquestion.css";
import backaro from "../../assets/img/backaro.svg";
import del from "../../assets/img/del.svg";
import add from "../../assets/img/add.svg";
import plus from "../../assets/img/icon-add.svg"
import dot from "../../assets/img/dot.svg";
import copy from "../../assets/img/copy.svg";
import useAuthStore from "../../store/useAuthStore";
import PricingModal from "../../components/pricingmodal/pricingmodal";
import { toast } from "react-toastify";
import config from "../../config/config";
import axios from "axios";
import verifyPayment from "../../utils/helpers/verifyPayment";

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
  
  // Section state management
  const [sections, setSections] = useState([]);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionDescription, setSectionDescription] = useState("");
  const [isCreatingSection, setIsCreatingSection] = useState(false);

  // Load existing sections
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch(`${config.API_URL}/surveys/${currentSurveyId}/sections`, {
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          // Assuming the API returns an array of sections or { sections: [...] }
          const sectionsData = Array.isArray(data) ? data : (data.sections || []);
          setSections(sectionsData);
        }
      } catch (error) {
        console.error("Error loading sections:", error);
        // Don't show error toast as sections might not exist yet
      }
    };

    if (currentSurveyId) {
      fetchSections();
    }
  }, [currentSurveyId, authToken]);

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
        
        if (response.ok && data.questions && data.questions.length > 0) {
          const formattedQuestions = data.questions.map(q => ({
            id: Date.now() + Math.random(),
            questionId: q._id,
            questionText: q.questionText,
            questionType: q.questionType,
            required: q.required,
            sectionId: q.sectionId || null, // Include sectionId from API
            options: q.options.map(opt => ({
              text: typeof opt === 'string' ? opt : opt.text,
              allowsCustomInput: typeof opt === 'object' ? opt.allowsCustomInput || false : false
            })),
          }));
          setQuestions(formattedQuestions);
        } else if (response.ok && (!data.questions || data.questions.length === 0)) {
          // If no questions, keep the default empty question
          setQuestions([{
            id: Date.now(),
            questionId: "",
            questionText: "",
            questionType: "multiple_choice",
            required: true,
            options: [{ text: "", allowsCustomInput: false }],
            sectionId: null,
          }]);
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
      const validTypes = ["multiple_choice", "five_point", "fill_in", "multiple_selection"];

      const bulkPayload = {
     questions: questions.map((question) => {
       const questionData = {
         questionId: question.questionId || "", // Keep existing ID or empty for new
         questionText: question.questionText.trim(), // Trim whitespace
         questionType: question.questionType,
         required: Boolean(question.required),
         // Conditional options handling
         options: 
          (question.questionType === "multiple_choice" || question.questionType === "multiple_selection")
            ? question.options
            .map(opt => ({
              text: typeof opt === 'string' ? opt.trim() : opt.text.trim(),
              allowsCustomInput: typeof opt === 'object' ? opt.allowsCustomInput || false : false
            }))
            .filter(opt => opt.text !== "") // Remove empty options
            : undefined // Exclude options for non-multiple_choice questions
       };
       
       // Include sectionId only if it exists
       if (question.sectionId) {
         questionData.sectionId = question.sectionId;
       }
       
       return questionData;
     })
  };
       
        const response = await fetch(`${config.API_URL}/surveys/${currentSurveyId}/bulk-questions`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bulkPayload),
        });

        const data = await response.json();
        
        if (!response.ok) {
          console.error("Error response:", data);
          throw new Error("Failed to save question" || data.msg  );
        }
    // Update question IDs from response
        setQuestions(prevQuestions => 
          prevQuestions.map(q => {
            const serverQuestion = data.results.details.find(
              sq => sq.question === q.questionText
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

  const addNewQuestion = (sectionId = null) => {
    const newQuestion = {
      id: Date.now(),
      questionId: "",
      questionText: "",
      questionType: "multiple_choice",
      required: false,
      options: [{ text: "", allowsCustomInput: false }],
      sectionId: sectionId, // Allow specifying section when adding question
    };
    setQuestions([...questions, newQuestion]);
  };

  const deleteQuestion = async (id) => {
    setIsDeletingId(id); // Show loading state for specific question
    try {
      const questionToDelete = questions.find(q => q.id === id);
      
      if (questionToDelete.questionId) {
        const response = await fetch(
        // here
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
        questionId: "", // Reset questionId for duplicated question
        // id: questions.length + 1,
      };
      setQuestions([...questions, duplicatedQuestion]);
    }
  };

  const handleQuestionChange = (id, field, value) => {
    const updatedQuestions = questions.map((q) =>
      q.id === id ? { 
        ...q, 
        [field]: value, 
        ...(field === "questionType" && (value === "fill_in" || value === "five_point") ? { options: [] } : {})
      } : q
    );
    setQuestions(updatedQuestions);
  };

  const addOption = (id) => {
    const updatedQuestions = questions.map((q) =>
      q.id === id ? { ...q, options: [...q.options, { text: "", allowsCustomInput: false }] } : q
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

  // Create section function
  const handleCreateSection = async (e) => {
    e.preventDefault();
    
    if (!sectionTitle.trim()) {
      toast.error("Section title is required");
      return;
    }

    setIsCreatingSection(true);
    try {
      const response = await fetch(`${config.API_URL}/surveys/${currentSurveyId}/sections`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: sectionTitle.trim(),
          description: sectionDescription.trim() || "",
          order: sections.length + 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.msg || "Failed to create section");
      }

      // Add the new section to state
      const newSection = data.section || data; // Handle different response formats
      setSections([...sections, newSection]);
      toast.success("Section created successfully!");
      
      // Reset form and close modal
      setSectionTitle("");
      setSectionDescription("");
      setShowSectionModal(false);
    } catch (error) {
      console.error("Error creating section:", error);
      toast.error(error.message || "Error creating section");
    } finally {
      setIsCreatingSection(false);
    }
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
          "Authorization": `Bearer ${authToken}`,
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
            "Authorization": `Bearer ${authToken}`,
          },
        }
      );
      
      const formattedQuestions = newQuestionsResponse.data.questions.map(q => ({
        id: Date.now() + Math.random(),
        questionId: q._id,
        questionText: q.questionText,
        questionType: q.questionType,
        required: q.required,
        sectionId: q.sectionId || null,
        options: q.options.map(opt => ({
          text: typeof opt === 'string' ? opt : opt.text,
          allowsCustomInput: typeof opt === 'object' ? opt.allowsCustomInput || false : false
        })),
      }));
      
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

  // Group questions by section
  const groupedQuestions = questions.reduce((acc, q) => {
    const key = q.sectionId || "unsectioned";
    if (!acc[key]) acc[key] = [];
    acc[key].push(q);
    return acc;
  }, {});

  // Get section info by ID
  const getSectionInfo = (sectionId) => {
    if (!sectionId || sectionId === "unsectioned") return null;
    return sections.find(s => s._id === sectionId || s.id === sectionId);
  };

  // Sort section keys: sections first (by order), then unsectioned
  const sortedSectionKeys = Object.keys(groupedQuestions).sort((a, b) => {
    if (a === "unsectioned") return 1; // Unsectioned goes last
    if (b === "unsectioned") return -1;
    
    const sectionA = getSectionInfo(a);
    const sectionB = getSectionInfo(b);
    const orderA = sectionA?.order || 0;
    const orderB = sectionB?.order || 0;
    return orderA - orderB;
  });

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
         
            {/* Upload File Questions */}
            <div className="Q-file-upload">
                <label className="flex Q-upload">
                  <input
                    type="file"
                    accept=".pdf"
                    name="document"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                    disabled={isUploading}
                  />
                  <img src={plus} alt="" />
                  {isUploading ? (
                    `Uploading... ${uploadProgress}%`
                  ) : (
                    "Upload Questions PDF"
                  )}
                </label>
                <p className="upload-note">
                  Upload a PDF file to automatically populate questions
                </p>
              </div>

              {/* Add Section Button */}
              <div style={{ marginBottom: "1.5rem" }}>
                <button
                  type="button"
                  className="next-question flex"
                  onClick={() => setShowSectionModal(true)}
                  style={{ marginBottom: "0" }}
                >
                  Add Section <img src={add} alt="Add" />
                </button>
              </div>

              {/* To pass id to action */}
              <input type="hidden" name="currentSurveyId" value={currentSurveyId} />

              {/* Render questions grouped by section */}
              {sortedSectionKeys.map((sectionKey) => {
                const sectionQuestions = groupedQuestions[sectionKey];
                const sectionInfo = getSectionInfo(sectionKey);
                const isUnsectioned = sectionKey === "unsectioned";

                return (
                  <div key={sectionKey} className="section-group" style={{ marginBottom: "2rem" }}>
                    {/* Section Header */}
                    {!isUnsectioned && sectionInfo ? (
                      <div className="section-header" style={{
                        padding: "1rem",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "8px",
                        marginBottom: "1rem",
                        borderLeft: "4px solid var(--base)"
                      }}>
                        <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem", fontWeight: "600" }}>
                          {sectionInfo.title}
                        </h4>
                        {sectionInfo.description && (
                          <p style={{ margin: "0", color: "#666", fontSize: "0.9rem" }}>
                            {sectionInfo.description}
                          </p>
                        )}
                      </div>
                    ) : isUnsectioned && (
                      <div className="section-header" style={{
                        padding: ".6rem",
                        backgroundColor: "#f9f9f9",
                        borderRadius: "8px",
                        marginBottom: "1rem",
                        borderLeft: "4px solid #ccc"
                      }}>
                        <h4 style={{ margin: "0", fontSize: ".9rem", fontWeight: "500", color: "#666" }}>
                          Unsectioned Questions
                        </h4>
                      </div>
                    )}

                    {/* Questions in this section */}
                    {sectionQuestions.map((question) => (
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

                  {/* Section selector for individual question */}
                  <div style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}>
                    <select
                      className="choice-select"
                      value={question.sectionId || "none"}
                      onChange={(e) => {
                        const selectedSectionId = e.target.value === "none" ? null : e.target.value;
                        handleQuestionChange(question.id, "sectionId", selectedSectionId);
                      }}
                      style={{ width: "100%", maxWidth: "300px", fontSize: "0.85rem" }}
                    >
                      <option value="none">No Section</option>
                      {sections.map((section) => (
                        <option key={section._id || section.id} value={section._id || section.id}>
                          {section.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="choice-field custom-dropdown flex">
                    <div className="wrap-icon type-row flex">
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
                        <option value="multiple_selection">Multiple Selection</option>
                        <option value="fill_in">Fill in</option>
                        <option value="five_point">Five Point</option>
                      </select>
                    </div>
                    {(question.questionType === "multiple_choice" || question.questionType === "multiple_selection") && (
                      <div className="options-list flex">
                        <div className="option">
                          {question.options.map((option, index) => (
                            <div className="wrap-icon flex" key={index}>
                              <input
                                key={index}
                                type="text"
                                name="options"
                                placeholder={`Option ${index + 1}`}
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
                              <label className="custom-input-checkbox">
                                <input
                                  type="checkbox"
                                  checked={option.allowsCustomInput}
                                  onChange={(e) =>
                                    handleOptionChange(
                                      question.id,
                                      index,
                                      "allowsCustomInput",
                                      e.target.checked
                                    )
                                  }
                                />
                                <span className="checkbox-label">Allow custom input</span>
                              </label>
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

                    {/* Add Question button for this section */}
                    <button
                      type="button"
                      className="next-question flex"
                      onClick={() => addNewQuestion(isUnsectioned ? null : sectionKey)}
                      style={{ marginTop: "1rem", marginBottom: "1rem" }}
                    >
                      Add Question {!isUnsectioned ? "to Section" : ""} <img src={add} alt="Add" />
                    </button>
                  </div>
                );
              })}

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

      {/* Add Section Modal */}
      {showSectionModal && (
        <div className="modal-overlay" onClick={() => setShowSectionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ margin: 0 }}>Add Section</h2>
              <button
                onClick={() => setShowSectionModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "#666"
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateSection}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                  Section Title <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  className="question-input"
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  placeholder="Enter section title"
                  required
                  style={{ width: "100%" }}
                />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                  Description (Optional)
                </label>
                <textarea
                  className="question-input"
                  value={sectionDescription}
                  onChange={(e) => setSectionDescription(e.target.value)}
                  placeholder="Enter section description"
                  rows="3"
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>
              <div className="modal-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowSectionModal(false);
                    setSectionTitle("");
                    setSectionDescription("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="continue-btn"
                  disabled={isCreatingSection}
                >
                  {isCreatingSection ? "Creating..." : "Create Section"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default SurveyQuestions;