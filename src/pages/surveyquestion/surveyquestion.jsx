import { Link, Form, useActionData, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import action from "./action";
import "./surveyquestion.css";
import backaro from "../../assets/img/backaro.svg";
import del from "../../assets/img/del.svg";
import add from "../../assets/img/add.svg";
import plus from "../../assets/img/icon-add.svg";
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
  const [isDeletingSectionId, setIsDeletingSectionId] = useState(null);
  
  // Sections state - each section contains questions (matching formquestions structure)
  const [sections, setSections] = useState([]);

  // Likert scale management
  const [showLikertModal, setShowLikertModal] = useState(false);
  const [editingLikertQuestionId, setEditingLikertQuestionId] = useState(null);
  const [editingLikertSectionId, setEditingLikertSectionId] = useState(null);
  const [currentLikertScale, setCurrentLikertScale] = useState([
    { value: 1, label: "Strongly Disagree" },
    { value: 2, label: "Disagree" },
    { value: 3, label: "Neutral" },
    { value: 4, label: "Agree" },
    { value: 5, label: "Strongly Agree" },
  ]);

  const sectionsInitializedRef = useRef(false);

  const refreshSectionsAndQuestions = async () => {
    try {
      let sectionsData = [];
      try {
        const sectionsResponse = await fetch(
          `${config.API_URL}/surveys/${currentSurveyId}/sections`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (sectionsResponse.ok) {
          const sectionsResult = await sectionsResponse.json();
          sectionsData = Array.isArray(sectionsResult)
            ? sectionsResult
            : sectionsResult.sections || [];
        } else if (sectionsResponse.status === 404) {
          sectionsData = [];
        }
      } catch (error) {
        sectionsData = [];
      }

      const questionsResponse = await fetch(
        `${config.API_URL}/surveys/${currentSurveyId}/questions`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      let questionsData = [];
      if (questionsResponse.ok) {
        const questionsResult = await questionsResponse.json();
        if (questionsResult.questions && questionsResult.questions.length > 0) {
          questionsData = questionsResult.questions.map((q) => {
            const secObj = q.section || {};
            const secId = q.sectionId || secObj._id || null;
            return {
              id: `question_${Date.now()}_${Math.random()}`,
              questionId: q._id,
              questionText: q.questionText || "",
              questionType: q.questionType === "five_point" ? "likert" : q.questionType,
              required: q.required !== undefined ? q.required : true,
              options: q.options
                ? q.options.map((opt) => ({
                    text: typeof opt === "string" ? opt : opt.text || "",
                    allowsCustomInput:
                      typeof opt === "object" ? opt.allowsCustomInput || false : false,
                  }))
                : [],
              likert: q.likert || null,
              sectionId: secId,
              __sectionMeta: {
                id: secId,
                title: secObj.title || "",
                description: secObj.description || "",
                order: secObj.order !== undefined ? secObj.order : undefined,
              },
            };
          });
        }
      }

      const sectionsMap = new Map();

      questionsData.forEach((q) => {
        const meta = q.__sectionMeta || {};
        const sid = meta.id || null;
        if (!sectionsMap.has(sid)) {
          sectionsMap.set(sid, {
            id: sid || `section_${sectionsMap.size + 1}`,
            sectionId: sid,
            title: meta.title || "",
            description: meta.description || "",
            order:
              meta.order !== undefined && meta.order !== null
                ? meta.order
                : sectionsMap.size + 1,
            questions: [],
          });
        }
        const s = sectionsMap.get(sid);
        s.questions.push({ ...q });
      });

      sectionsData.forEach((section) => {
        const sid = section._id || section.id || null;
        if (!sectionsMap.has(sid)) {
          sectionsMap.set(sid, {
            id: sid || `section_${sectionsMap.size + 1}`,
            sectionId: sid,
            title: section.title || "",
            description: section.description || "",
            order:
              section.order !== undefined && section.order !== null
                ? section.order
                : sectionsMap.size + 1,
            questions: [],
          });
        } else {
          const s = sectionsMap.get(sid);
          sectionsMap.set(sid, {
            ...s,
            title: section.title || s.title,
            description: section.description || s.description,
            order:
              section.order !== undefined && section.order !== null
                ? section.order
                : s.order,
          });
        }
      });

      let organizedSections = Array.from(sectionsMap.values());
      organizedSections = organizedSections.sort((a, b) => {
        const ao = a.order ?? 9999;
        const bo = b.order ?? 9999;
        if (ao === bo) return 0;
        return ao < bo ? -1 : 1;
      });

      if (organizedSections.length === 0 && questionsData.length > 0) {
        organizedSections.push({
          id: `section_${Date.now()}`,
          sectionId: null,
          title: "",
          description: "",
          order: 1,
          questions: questionsData,
        });
      }

      setSections(organizedSections);
      sectionsInitializedRef.current = true;
    } catch (error) {
      toast.error("Error loading survey data");
    } finally {
      setIsLoading(false);
    }
  };

  // Load sections and questions, then organize into sections structure
  useEffect(() => {
    if (sectionsInitializedRef.current) return;
    if (currentSurveyId) {
      refreshSectionsAndQuestions();
    } else {
      setIsLoading(false);
    }
  }, [currentSurveyId, authToken]);

  // Flatten sections to questions for saving
  const flattenSectionsToQuestions = () => {
    const allQuestions = [];
    sections.forEach((section) => {
      section.questions.forEach((question) => {
        allQuestions.push({
          ...question,
          sectionId: section.sectionId, // Use section's API ID
        });
      });
    });
    return allQuestions;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const allQuestions = flattenSectionsToQuestions();
      
      const bulkPayload = {
        questions: allQuestions.map((question) => {
          const questionData = {
            questionId: question.questionId || "",
            questionText: question.questionText.trim(),
            questionType: question.questionType === "likert" ? "likert" : question.questionType,
            required: Boolean(question.required),
          };

          if (
            question.questionType === "multiple_choice" ||
            question.questionType === "multiple_selection"
          ) {
            questionData.options = question.options
              .map((opt) => ({
                text: typeof opt === "string" ? opt.trim() : opt.text.trim(),
                allowsCustomInput:
                  typeof opt === "object" ? opt.allowsCustomInput || false : false,
              }))
              .filter((opt) => opt.text !== "");
          } else if (question.questionType === "likert") {
            if (question.likert && question.likert.scale && question.likert.scale.length > 0) {
              questionData.likert = question.likert;
            }
          }

          if (question.sectionId) {
            questionData.sectionId = question.sectionId;
          }

          return questionData;
        }),
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
      const updatedSections = sections.map((section) => ({
        ...section,
        questions: section.questions.map((q) => {
          const serverQuestion = data.results?.details?.find(
            (sq) => sq.question === q.questionText
          );
          return serverQuestion?.questionId
            ? { ...q, questionId: serverQuestion.questionId }
            : q;
        }),
      }));
      setSections(updatedSections);

      toast.success("Questions saved successfully!" || data.msg);
    } catch (error) {
      toast.error("Failed to save questions");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setIsPosting(true);
    setIsCheckingPayment(true);

    try {
      await handleSave();

      const isPaid = await verifyPayment(currentSurveyId, authToken);
      setHasPaid(isPaid);

      if (isPaid) {
        toast.success("Payment already verified!");
        navigate("/publish");
      } else {
        setShowPricingModal(true);
      }
    } catch (error) {
      toast.error("Error saving questions");
    } finally {
      setIsPosting(false);
      setIsCheckingPayment(false);
    }
  };

  // Section management
  const addNewSection = async () => {
    try {
      // Use a default title since API requires it
      const defaultTitle = `Section ${sections.length + 1}`;
      
      const response = await fetch(
        `${config.API_URL}/surveys/${currentSurveyId}/sections`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: defaultTitle,
            description: "",
            order: sections.length + 1,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.msg || "Failed to create section");
      }

      const newSection = data.section || data;
      setSections([
        ...sections,
        {
          id: newSection._id || newSection.id,
          sectionId: newSection._id || newSection.id,
          title: defaultTitle,
          description: "",
          order: newSection.order || sections.length + 1,
          questions: [],
        },
      ]);
      // toast.success("Section created successfully");
    } catch (error) {
      console.error("Error creating section:", error);
      toast.error( "Opps, Kindly retry" || error.message );
    }
  };

  const deleteSection = (sectionId) => {
    if (sections.length === 1) {
      toast.error("You must have at least one section");
      return;
    }

    setIsDeletingSectionId(sectionId);
    try {
      // Find section by local id
      const section = sections.find((s) => s.id === sectionId);
      
      if (!section) {
        throw new Error("Section not found");
      }

      // Move questions from deleted section to the first remaining section
      const remainingSections = sections.filter((s) => s.id !== sectionId);
      let updatedSections = remainingSections;

      if (remainingSections.length > 0 && section.questions.length > 0) {
        const targetSection = remainingSections[0];
        const questionsToMove = section.questions.map((q) => ({
          ...q,
          sectionId: targetSection.sectionId, // Update sectionId to target section
        }));

        // Update sections: remove deleted section and add questions to target section
        updatedSections = remainingSections.map((s) =>
          s.id === targetSection.id
            ? {
                ...s,
                questions: [...s.questions, ...questionsToMove],
              }
            : s
        );
      }

      // Update order of remaining sections
      updatedSections = updatedSections.map((s, index) => ({
        ...s,
        order: index + 1,
      }));

      setSections(updatedSections);
      // toast.success("Section deleted successfully");
    } catch (error) {
      console.error("Error deleting section:", error);
      toast.error(error.message || "Error deleting section");
    } finally {
      setIsDeletingSectionId(null);
    }
  };

  const handleSectionChange = async (sectionId, field, value) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    // Update local state immediately
    setSections(
      sections.map((s) =>
        s.id === sectionId ? { ...s, [field]: value } : s
      )
    );

    // Update on API if section has an API ID
    if (section.sectionId) {
      try {
        await fetch(
          `${config.API_URL}/surveys/${currentSurveyId}/sections/${section.sectionId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ [field]: value }),
          }
        );
      } catch (error) {
        console.error("Error updating section:", error);
      }
    }
  };

  // Question management
  const addNewQuestion = (sectionId) => {
    const newQuestion = {
      id: `question_${Date.now()}_${Math.random()}`,
      questionId: "",
      questionText: "",
      questionType: "multiple_choice",
      required: false,
      options: [{ text: "", allowsCustomInput: false }],
      likert: null,
      sectionId: sections.find((s) => s.id === sectionId)?.sectionId || null,
    };
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? { ...section, questions: [...section.questions, newQuestion] }
          : section
      )
    );
  };

  const deleteQuestion = async (sectionId, questionId) => {
    setIsDeletingId(questionId);
    try {
      const section = sections.find((s) => s.id === sectionId);
      const question = section?.questions.find((q) => q.id === questionId);

      if (question && question.questionId) {
        const response = await fetch(
          `${config.API_URL}/surveys/${currentSurveyId}/questions/${question.questionId}`,
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

      setSections(
        sections.map((section) => {
          if (section.id === sectionId) {
            if (section.questions.length === 1) {
              toast.error("You must have at least one question in a section");
              return section;
            }
            return {
              ...section,
              questions: section.questions.filter((q) => q.id !== questionId),
            };
          }
          return section;
        })
      );
      // toast.success("Question deleted successfully");
    } catch (error) {
      toast.error(error.message || "Error deleting question");
    } finally {
      setIsDeletingId(null);
    }
  };

  const duplicateQuestion = (sectionId, questionId) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          const questionToDuplicate = section.questions.find((q) => q.id === questionId);
          if (questionToDuplicate) {
            const duplicatedQuestion = {
              ...questionToDuplicate,
              id: `question_${Date.now()}_${Math.random()}`,
              questionId: "", // Reset for new question
              likert: questionToDuplicate.likert
                ? { ...questionToDuplicate.likert }
                : null,
            };
            return {
              ...section,
              questions: [...section.questions, duplicatedQuestion],
            };
          }
        }
        return section;
      })
    );
    // toast.success("Question duplicated");
  };

  const handleQuestionChange = (sectionId, questionId, field, value) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            questions: section.questions.map((q) =>
              q.id === questionId
                ? {
                    ...q,
                    [field]: value,
                    ...(field === "questionType" && value === "fill_in"
                      ? { options: [], likert: null }
                      : {}),
                    ...(field === "questionType" && value === "likert"
                      ? { options: [], likert: null }
                      : {}),
                    ...(field === "questionType" &&
                    (value === "multiple_choice" || value === "multiple_selection") &&
                    q.options.length === 0
                      ? { options: [{ text: "", allowsCustomInput: false }], likert: null }
                      : {}),
                  }
                : q
            ),
          };
        }
        return section;
      })
    );
  };

  // Move question to a different section
  const moveQuestionToSection = (currentSectionId, questionId, targetSectionId) => {
    if (currentSectionId === targetSectionId) return; // No change needed

    const currentSection = sections.find((s) => s.id === currentSectionId);
    const targetSection = sections.find((s) => s.id === targetSectionId);

    if (!currentSection || !targetSection) {
      toast.error("Section not found");
      return;
    }

    const question = currentSection.questions.find((q) => q.id === questionId);
    if (!question) {
      toast.error("Question not found");
      return;
    }

    // Remove question from current section and add to target section
    setSections(
      sections.map((section) => {
        if (section.id === currentSectionId) {
          // Remove question from current section
          if (section.questions.length === 1) {
            toast.error("You must have at least one question in a section");
            return section;
          }
          return {
            ...section,
            questions: section.questions.filter((q) => q.id !== questionId),
          };
        } else if (section.id === targetSectionId) {
          // Add question to target section with updated sectionId
          return {
            ...section,
            questions: [
              ...section.questions,
              {
                ...question,
                sectionId: targetSection.sectionId, // Update sectionId to match target section
              },
            ],
          };
        }
        return section;
      })
    );
    // toast.success("Question moved to section");
  };

  const addOption = (sectionId, questionId) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            questions: section.questions.map((q) =>
              q.id === questionId
                ? {
                    ...q,
                    options: [...q.options, { text: "", allowsCustomInput: false }],
                  }
                : q
            ),
          };
        }
        return section;
      })
    );
  };

  const handleOptionChange = (sectionId, questionId, index, field, value) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            questions: section.questions.map((q) =>
              q.id === questionId
                ? {
                    ...q,
                    options: q.options.map((option, i) =>
                      i === index ? { ...option, [field]: value } : option
                    ),
                  }
                : q
            ),
          };
        }
        return section;
      })
    );
  };

  // Likert scale management
  const openLikertModal = (sectionId, questionId) => {
    setEditingLikertSectionId(sectionId);
    setEditingLikertQuestionId(questionId);
    const section = sections.find((s) => s.id === sectionId);
    const question = section?.questions.find((q) => q.id === questionId);
    if (question && question.likert && question.likert.scale) {
      setCurrentLikertScale([...question.likert.scale]);
    } else {
      setCurrentLikertScale([
        { value: 1, label: "Strongly Disagree" },
        { value: 2, label: "Disagree" },
        { value: 3, label: "Neutral" },
        { value: 4, label: "Agree" },
        { value: 5, label: "Strongly Agree" },
      ]);
    }
    setShowLikertModal(true);
  };

  const closeLikertModal = () => {
    setShowLikertModal(false);
    setEditingLikertQuestionId(null);
    setEditingLikertSectionId(null);
  };

  const saveLikertScale = () => {
    if (currentLikertScale.length === 0) {
      toast.error("Likert scale must have at least one option");
      return;
    }

    setSections(
      sections.map((section) => {
        if (section.id === editingLikertSectionId) {
          return {
            ...section,
            questions: section.questions.map((q) =>
              q.id === editingLikertQuestionId
                ? {
                    ...q,
                    likert: {
                      scale: currentLikertScale.map((item) => ({
                        value: item.value,
                        label: item.label.trim(),
                      })),
                    },
                  }
                : q
            ),
          };
        }
        return section;
      })
    );
    closeLikertModal();
    toast.success("Likert scale saved");
  };

  const addLikertScaleItem = () => {
    const maxValue = Math.max(...currentLikertScale.map((item) => item.value), 0);
    setCurrentLikertScale([
      ...currentLikertScale,
      { value: maxValue + 1, label: "" },
    ]);
  };

  const removeLikertScaleItem = (index) => {
    if (currentLikertScale.length <= 1) {
      toast.error("Likert scale must have at least one option");
      return;
    }
    // Remove the item and renumber the remaining items sequentially
    const updatedScale = currentLikertScale
      .filter((_, i) => i !== index)
      .map((item, newIndex) => ({
        ...item,
        value: newIndex + 1, // Renumber starting from 1
      }));
    setCurrentLikertScale(updatedScale);
  };

  const updateLikertScaleItem = (index, field, value) => {
    setCurrentLikertScale(
      currentLikertScale.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
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

      const response = await axios.post(
        `${config.API_URL}/surveys/${currentSurveyId}/upload-questionnaire`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
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
        sectionsInitializedRef.current = false;
        setIsLoading(true);
        await refreshSectionsAndQuestions();
      }
    } catch (error) {
      console.error("File upload failed:", error);
      toast.error(error.response?.data?.message || "Failed to upload PDF");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      e.target.value = "";
    }
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
                  {isUploading
                    ? `Uploading... ${uploadProgress}%`
                    : "Upload Questions PDF"}
                </label>
                <p className="upload-note">
                  Upload a PDF file to automatically populate questions
                </p>
              </div>

              {/* To pass id to action */}
              <input type="hidden" name="currentSurveyId" value={currentSurveyId} />

              {sections.length === 0 ? (
                <div className="empty-state">
                  <p>No sections yet. Create your first section to get started.</p>
                </div>
              ) : (
                sections.map((section) => (
                  <div className="section-container" key={section.id}>
                    <div className="section-header">
                      <div className="section-title-field">
                        <input
                          className="section-title-input"
                          type="text"
                          placeholder="Section Title"
                          value={section.title}
                          onChange={(e) =>
                            handleSectionChange(section.id, "title", e.target.value)
                          }
                        />
                        <input
                          className="section-description-input"
                          type="text"
                          placeholder="Section Description (optional)"
                          value={section.description}
                          onChange={(e) =>
                            handleSectionChange(section.id, "description", e.target.value)
                          }
                        />
                      </div>
                      {isDeletingSectionId === section.id ? (
                        <span className="deleting-spinner">Deleting...</span>
                      ) : (
                        <img
                          src={del}
                          className="delete-icon"
                          alt="Delete Section"
                          onClick={() => deleteSection(section.id)}
                          title="Delete Section"
                        />
                      )}
                    </div>

                    {section.questions.map((question) => (
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
                              handleQuestionChange(
                                section.id,
                                question.id,
                                "questionText",
                                e.target.value
                              )
                            }
                          />
                          <img
                            src={copy}
                            className="copy-icon"
                            alt="Duplicate"
                            onClick={() => duplicateQuestion(section.id, question.id)}
                          />
                          {isDeletingId === question.id ? (
                            <span className="deleting-spinner">Deleting...</span>
                          ) : (
                            <img
                              src={del}
                              className="delete-icon"
                              alt="Delete"
                              onClick={() => deleteQuestion(section.id, question.id)}
                            />
                          )}
                        </div>

                        {/* Section selector for moving questions */}
                        <div style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}>
                          <label style={{ fontSize: "0.85rem", color: "#666", marginBottom: "0.3rem", display: "block" }}>
                            Section:
                          </label>
                          <select
                            className="choice-select"
                            value={section.id}
                            onChange={(e) => {
                              const targetSectionId = e.target.value;
                              moveQuestionToSection(section.id, question.id, targetSectionId);
                            }}
                            style={{ width: "100%", maxWidth: "300px", fontSize: "0.85rem" }}
                          >
                            {sections.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.title || `Section ${sections.indexOf(s) + 1}`}
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
                                handleQuestionChange(
                                  section.id,
                                  question.id,
                                  "questionType",
                                  e.target.value
                                )
                              }
                              className="choice-select"
                            >
                              <option value="multiple_choice">Multiple Choice</option>
                              <option value="multiple_selection">Multiple Selection</option>
                              <option value="fill_in">Short Text</option>
                              <option value="likert">Likert Scale</option>
                            </select>
                          </div>

                          <div className="required-field">
                            <label className="custom-input-checkbox">
                              <input
                                type="checkbox"
                                checked={question.required}
                                onChange={(e) =>
                                  handleQuestionChange(
                                    section.id,
                                    question.id,
                                    "required",
                                    e.target.checked
                                  )
                                }
                              />
                              <span className="checkbox-label">Required</span>
                            </label>
                          </div>

                          {question.questionType === "likert" && (
                            <div className="likert-controls">
                              <button
                                type="button"
                                className="likert-scale-btn"
                                onClick={() => openLikertModal(section.id, question.id)}
                              >
                                {question.likert && question.likert.scale
                                  ? `Edit Scale (${question.likert.scale.length} items)`
                                  : "Set Likert Scale"}
                              </button>
                              {question.likert && question.likert.scale && (
                                <div className="likert-preview">
                                  {question.likert.scale.map((item, idx) => (
                                    <span key={idx} className="likert-item-preview">
                                      {item.value}: {item.label}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {(question.questionType === "multiple_choice" ||
                            question.questionType === "multiple_selection") && (
                            <div className="options-list flex">
                              <div className="option">
                                {question.options.map((option, index) => (
                                  <div className="wrap-icon flex" key={index}>
                                    <input
                                      type="text"
                                      name="options"
                                      placeholder={`Option ${index + 1}`}
                                      value={option.text}
                                      onChange={(e) =>
                                        handleOptionChange(
                                          section.id,
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
                                            section.id,
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
                                onClick={() => addOption(section.id, question.id)}
                              >
                                Add option
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <button
                      className="next-question flex"
                      type="button"
                      onClick={() => addNewQuestion(section.id)}
                    >
                      Add Question <img src={add} alt="Add" />
                    </button>
                  </div>
                ))
              )}

              <div className="button-group-section">
                {sections.length === 0 ? (
                  <button
                    className="next-question flex"
                    type="button"
                    onClick={addNewSection}
                  >
                    Add Section <img src={add} alt="Add" />
                  </button>
                ) : (
                  <>
                    <button
                      className="next-question flex"
                      type="button"
                      onClick={addNewSection}
                    >
                      Add Section <img src={add} alt="Add" />
                    </button>
                    {/* <button
                      className="next-question flex"
                      type="button"
                      onClick={() => {
                        const lastSection = sections[sections.length - 1];
                        if (lastSection) {
                          addNewQuestion(lastSection.id);
                        }
                      }}
                    >
                      Add Question <img src={add} alt="Add" />
                    </button> */}
                  </>
                )}
              </div>

              <div className="button-group flex">
                <button
                  type="button"
                  className="save-btn"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>

                <button type="submit" className="post-btn" disabled={isPosting}>
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

      {/* Likert Scale Modal */}
      {showLikertModal && (
        <div className="modal-overlay" onClick={closeLikertModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Configure Likert Scale</h3>
              <button
                type="button"
                className="modal-close"
                onClick={closeLikertModal}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="likert-scale-items">
                {currentLikertScale.map((item, index) => (
                  <div key={index} className="likert-scale-item">
                    <input
                      type="number"
                      value={item.value}
                      onChange={(e) =>
                        updateLikertScaleItem(
                          index,
                          "value",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="likert-value-input"
                      placeholder="Value"
                    />
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) =>
                        updateLikertScaleItem(index, "label", e.target.value)
                      }
                      className="likert-label-input"
                      placeholder="Label"
                    />
                    {currentLikertScale.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLikertScaleItem(index)}
                        className="remove-likert-item-btn"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addLikertScaleItem}
                className="add-likert-item-btn"
              >
                Add Scale Item
              </button>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={closeLikertModal}
                className="modal-cancel-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveLikertScale}
                className="modal-save-btn"
              >
                Save Scale
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SurveyQuestions;
