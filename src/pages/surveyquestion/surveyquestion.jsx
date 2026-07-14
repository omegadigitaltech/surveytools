import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./surveyquestion.css";
import copy from "../../assets/img/copy.svg";
import del from "../../assets/img/del.svg";
import plus from "../../assets/img/icon-add.svg";
import useAuthStore from "../../store/useAuthStore";
import { toast } from "react-toastify";
import config from "../../config/config";
import Loader from "../../components/loader/loader";
// import ShareLink from "../../components/sharelink/sharelink";

const SurveyQuestions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const authToken = useAuthStore((state) => state.authToken);
  const currentSurveyId = useAuthStore((state) => state.currentSurveyId);

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [sections, setSections] = useState([
    {
      id: "section_1",
      sectionId: null,
      title: "Diet And Exercise Survey",
      description: "",
      order: 1,
      questions: [
        {
          id: "question_1",
          questionId: "",
          questionText: "Have you ever been on a diet before?",
          questionType: "multiple_choice",
          required: false,
          options: [
            { text: "Option 1", allowsCustomInput: false },
            { text: "Option 2", allowsCustomInput: false },
          ],
          likert: null,
          sectionId: null,
        },
      ],
    },
  ]);

  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showLikertModal, setShowLikertModal] = useState(false);
  const [currentLikertScale, setCurrentLikertScale] = useState([
    { value: 1, label: "Strongly Disagree" },
    { value: 2, label: "Disagree" },
    { value: 3, label: "Neutral" },
    { value: 4, label: "Agree" },
    { value: 5, label: "Strongly Agree" },
  ]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  // Background colors and fonts
  const backgroundColors = [
    "#FFFFFF",
    "#FFF9E6",
    "#FFE6E6",
    "#E6F3FF",
    "#F0E6FF",
    "#000000",
  ];
  const [selectedBgColor, setSelectedBgColor] = useState("#FFFFFF");
  const fontFamilies = [
    "Roboto",
    "Arial",
    "Georgia",
    "Times New Roman",
    "Courier New",
  ];
  const [selectedFont, setSelectedFont] = useState("Roboto");

  // Select first question by default
  useEffect(() => {
    if (sections.length > 0 && sections[0].questions.length > 0) {
      setSelectedQuestion({
        sectionId: sections[0].id,
        questionId: sections[0].questions[0].id,
      });
    }
  }, []);

  // Fetch existing questions when in edit mode (surveyId passed via navigation state)
  useEffect(() => {
    const editSurveyId = location.state?.surveyId;
    if (!editSurveyId) return;

    const fetchExistingQuestions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${config.API_URL}/surveys/${editSurveyId}/questions`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        const json = await response.json();
        if (!response.ok)
          throw new Error(json.msg || "Failed to fetch survey questions");

        const backendQuestions = json.questions || json.survey?.questions || [];
        if (backendQuestions.length === 0) return;

        // Group questions by sectionId, preserving backend section metadata
        const sectionMap = new Map();
        backendQuestions.forEach((q) => {
          const key = q.sectionId || "_none";
          if (!sectionMap.has(key)) {
            sectionMap.set(key, {
              backendSectionId: q.sectionId || null,
              title: q.section?.title || "Section 1",
              description: q.section?.description || "",
              questions: [],
            });
          }
          sectionMap.get(key).questions.push(q);
        });

        const rebuiltSections = Array.from(sectionMap.entries()).map(
          ([, sec], index) => {
            const localId = `section_${index + 1}`;
            const mappedQuestions = sec.questions.map((q) => ({
              id: `question_${q._id}`,
              questionId: q._id || "",
              questionText: q.questionText || "",
              questionType: q.questionType || "multiple_choice",
              required: Boolean(q.required),
              options: (q.options || []).map((opt) =>
                typeof opt === "string"
                  ? { text: opt, allowsCustomInput: false }
                  : { text: opt.text || "", allowsCustomInput: opt.allowsCustomInput || false }
              ),
              likert: null,
              sectionId: sec.backendSectionId,
            }));
            return {
              id: localId,
              sectionId: sec.backendSectionId,
              title: sec.title,
              description: sec.description || "",
              order: index + 1,
              questions: mappedQuestions,
            };
          }
        );

        setSections(rebuiltSections);
        setSelectedQuestion({
          sectionId: rebuiltSections[0].id,
          questionId: rebuiltSections[0].questions[0].id,
        });
      } catch (error) {
        console.error("Error fetching questions:", error);
        toast.error(error.message || "Error loading survey questions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingQuestions();
  }, [location.state?.surveyId, authToken]);

  // Close sidebar when clicking outside (mobile only)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        window.innerWidth <= 768 &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest(".sidebar-toggle")
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get currently selected question object
  const getCurrentQuestion = () => {
    if (!selectedQuestion) return null;
    const section = sections.find((s) => s.id === selectedQuestion.sectionId);
    return section?.questions.find((q) => q.id === selectedQuestion.questionId);
  };

  // Handle question field changes
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
                    (value === "multiple_choice" ||
                      value === "multiple_selection") &&
                    q.options.length === 0
                      ? {
                          options: [{ text: "", allowsCustomInput: false }],
                          likert: null,
                        }
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
  // delete section
  const deleteSection = (sectionId) => {
    if (sections.length === 1) {
      alert("You must have at least one section");
      return;
    }

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
          sectionId: targetSection.sectionId,
        }));

        updatedSections = remainingSections.map((s) =>
          s.id === targetSection.id
            ? {
                ...s,
                questions: [...s.questions, ...questionsToMove],
              }
            : s
        );
      }

      updatedSections = updatedSections.map((s, index) => ({
        ...s,
        order: index + 1,
      }));

      setSections(updatedSections);
    } catch (error) {
      console.error("Error deleting section:", error);
      alert(error.message || "Error deleting section");
    }
  };

  // Add new question
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

    setSelectedQuestion({ sectionId, questionId: newQuestion.id });
  };

  // Delete question
  const deleteQuestion = (sectionId, questionId) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          if (section.questions.length === 1) {
            alert("You must have at least one question in a section");
            return section;
          }
          const newQuestions = section.questions.filter(
            (q) => q.id !== questionId
          );

          if (selectedQuestion?.questionId === questionId) {
            setSelectedQuestion({
              sectionId,
              questionId: newQuestions[0]?.id,
            });
          }

          return { ...section, questions: newQuestions };
        }
        return section;
      })
    );
  };

  // Duplicate question
  const duplicateQuestion = (sectionId, questionId) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          const questionToDuplicate = section.questions.find(
            (q) => q.id === questionId
          );
          if (questionToDuplicate) {
            const duplicatedQuestion = {
              ...questionToDuplicate,
              id: `question_${Date.now()}_${Math.random()}`,
              questionId: "",
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
  };

  // Add option
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
                    options: [
                      ...q.options,
                      { text: "", allowsCustomInput: false },
                    ],
                  }
                : q
            ),
          };
        }
        return section;
      })
    );
  };

  // Handle option change
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

  // Add new section
  const addNewSection = () => {
    const newSection = {
      id: `section_${Date.now()}`,
      sectionId: null,
      title: `Section ${sections.length + 1}`,
      description: "",
      order: sections.length + 1,
      questions: [
        {
          id: `question_${Date.now()}_${Math.random()}`,
          questionId: "",
          questionText: "",
          questionType: "multiple_choice",
          required: false,
          options: [{ text: "", allowsCustomInput: false }],
          likert: null,
          sectionId: null,
        },
      ],
    };
    setSections([...sections, newSection]);
  };

  // Handle section change
  const handleSectionChange = (sectionId, field, value) => {
    setSections(
      sections.map((s) => (s.id === sectionId ? { ...s, [field]: value } : s))
    );
  };

  // Move question to section
  const moveQuestionToSection = (
    currentSectionId,
    questionId,
    targetSectionId
  ) => {
    if (currentSectionId === targetSectionId) return;

    const currentSection = sections.find((s) => s.id === currentSectionId);
    const targetSection = sections.find((s) => s.id === targetSectionId);
    const question = currentSection?.questions.find((q) => q.id === questionId);

    if (!question) return;

    setSections(
      sections.map((section) => {
        if (section.id === currentSectionId) {
          if (section.questions.length === 1) {
            alert("You must have at least one question in a section");
            return section;
          }
          return {
            ...section,
            questions: section.questions.filter((q) => q.id !== questionId),
          };
        } else if (section.id === targetSectionId) {
          return {
            ...section,
            questions: [
              ...section.questions,
              {
                ...question,
                sectionId: targetSection.sectionId,
              },
            ],
          };
        }
        return section;
      })
    );
  };

  // Likert scale functions
  const openLikertModal = () => {
    const question = getCurrentQuestion();
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

  const saveLikertScale = () => {
    if (currentLikertScale.length === 0) {
      alert("Likert scale must have at least one option");
      return;
    }

    if (selectedQuestion) {
      handleQuestionChange(
        selectedQuestion.sectionId,
        selectedQuestion.questionId,
        "likert",
        { scale: currentLikertScale }
      );
    }
    setShowLikertModal(false);
  };

  const addLikertScaleItem = () => {
    const maxValue = Math.max(
      ...currentLikertScale.map((item) => item.value),
      0
    );
    setCurrentLikertScale([
      ...currentLikertScale,
      { value: maxValue + 1, label: "" },
    ]);
  };

  const removeLikertScaleItem = (index) => {
    if (currentLikertScale.length <= 1) {
      alert("Likert scale must have at least one option");
      return;
    }
    const updatedScale = currentLikertScale
      .filter((_, i) => i !== index)
      .map((item, newIndex) => ({
        ...item,
        value: newIndex + 1,
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

  const handleSave = async (shouldNavigate = false) => {
    const activeSurveyId = location.state?.surveyId || currentSurveyId;

    if (!activeSurveyId) {
      toast.error("No survey ID found. Please create a survey first.");
      return;
    }

    // Validate: each section needs at least one non-empty question
    for (const section of sections) {
      const valid = section.questions.filter((q) => q.questionText.trim() !== "");
      if (valid.length === 0) {
        toast.error(
          `Section "${section.title || "Untitled"}" must have at least one question`
        );
        return;
      }
    }

    if (shouldNavigate) {
      setIsPosting(true);
    } else {
      setIsSaving(true);
    }

    try {
      // Step 1: Create any sections that don't yet have a backend ID
      const resolvedSections = [];
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (section.sectionId) {
          resolvedSections.push(section);
          continue;
        }
        const res = await fetch(
          `${config.API_URL}/surveys/${activeSurveyId}/sections`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              title: section.title.trim() || `Section ${i + 1}`,
              description: section.description?.trim() || undefined,
              order: section.order || i + 1,
            }),
          }
        );
        const sectionJson = await res.json();
        if (!res.ok)
          throw new Error(
            sectionJson.msg || sectionJson.message || "Failed to create section"
          );
        resolvedSections.push({ ...section, sectionId: sectionJson.section._id });
      }

      // Step 2: Build flat questions array for bulk-questions endpoint
      const allQuestions = resolvedSections.flatMap((section) =>
        section.questions
          .filter((q) => q.questionText.trim() !== "")
          .map((q) => {
            const questionData = {
              questionText: q.questionText.trim(),
              // likert has no API equivalent — map to five_point
              questionType: q.questionType === "likert" ? "five_point" : q.questionType,
              required: Boolean(q.required),
            };
            // Include questionId for existing questions so the API updates instead of creates
            if (q.questionId) questionData.questionId = q.questionId;
            if (section.sectionId) questionData.sectionId = section.sectionId;
            if (
              q.questionType === "multiple_choice" ||
              q.questionType === "multiple_selection"
            ) {
              questionData.options = q.options
                .map((opt) => (typeof opt === "string" ? opt : opt.text || ""))
                .filter((t) => t.trim() !== "");
            }
            return questionData;
          })
      );

      // Step 3: Bulk save via the correct endpoint
      const response = await fetch(
        `${config.API_URL}/surveys/${activeSurveyId}/bulk-questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ questions: allQuestions }),
        }
      );

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.msg || json.message || "Failed to save questions");
      }

      // Step 4: Re-fetch questions to sync backend-assigned IDs into local state,
      // preventing duplicate creation on the next save
      const refetchRes = await fetch(
        `${config.API_URL}/surveys/${activeSurveyId}/questions`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (refetchRes.ok) {
        const refetchJson = await refetchRes.json();
        const backendQs = refetchJson.questions || [];

        // Group backend questions by sectionId for efficient lookup
        const questionsBySectionId = {};
        backendQs.forEach((bq) => {
          const key = bq.sectionId || "_none";
          if (!questionsBySectionId[key]) questionsBySectionId[key] = [];
          questionsBySectionId[key].push(bq);
        });

        setSections(
          resolvedSections.map((section) => {
            const sectionKey = section.sectionId || "_none";
            const sectionBackendQs = questionsBySectionId[sectionKey] || [];
            return {
              ...section,
              questions: section.questions
                .filter((q) => q.questionText.trim() !== "")
                .map((q) => {
                  // Already has an ID — keep as-is
                  if (q.questionId) return q;
                  // New question — match by text within the same section
                  const match = sectionBackendQs.find(
                    (bq) => bq.questionText === q.questionText.trim()
                  );
                  return match ? { ...q, questionId: match._id } : q;
                }),
            };
          })
        );
      } else {
        // Refetch failed — at least persist the resolved section IDs
        setSections(resolvedSections);
      }

      toast.success(json.msg || "Questions saved successfully!");

      if (shouldNavigate) {
        navigate("/publish");
      }
    } catch (error) {
      console.error("Error saving questions:", error);
      toast.error(error.message || "Error saving questions");
    } finally {
      if (shouldNavigate) {
        setIsPosting(false);
      } else {
        setIsSaving(false);
      }
    }
  };

  const currentQuestion = getCurrentQuestion();
  const isDarkMode = selectedBgColor === "#000000";

  if (isLoading) {
    return <Loader text="Loading survey questions..." />;
  }

  return (
    <>
      {/* <ShareLink /> */}
      <div className={`survey-form ${isDarkMode ? "dark-mode" : ""}`}>
        {/* Top Bar */}
        <div className="top-bar">
          <div className="top-bar-content">
            <h2>Create A Questionnaire</h2>
            <button className="import-btn">Import from files</button>
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <div className="mobile-toggle-container">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰ <span>Set question type</span>
          </button>
        </div>

        <div className="main-layout">
          {/* Left Sidebar - Settings */}
          <div
            ref={sidebarRef}
            className={`sidebar ${sidebarOpen ? "open" : "closed"}`}
          >
            <div className="sidebar-header-mobile">
              <h3>Set question type</h3>
              <button
                className="sidebar-close"
                onClick={() => setSidebarOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="sidebar-content">
              <h3 className="sidebar-title-desktop">Edit Question</h3>

              {currentQuestion ? (
                <>
                  {/* Question Type */}
                  <div className="form-group">
                    <label>Question Type</label>
                    <select
                      value={currentQuestion.questionType}
                      onChange={(e) =>
                        handleQuestionChange(
                          selectedQuestion.sectionId,
                          selectedQuestion.questionId,
                          "questionType",
                          e.target.value
                        )
                      }
                    >
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="multiple_selection">
                        Multiple Selection
                      </option>
                      <option value="fill_in">Short Text</option>
                      <option value="likert">Likert Scale</option>
                    </select>
                  </div>

                  {/* Required Question */}
                  <div className="form-group">
                    <label>Required Question</label>
                    <select
                      value={currentQuestion.required ? "Yes" : "No"}
                      onChange={(e) =>
                        handleQuestionChange(
                          selectedQuestion.sectionId,
                          selectedQuestion.questionId,
                          "required",
                          e.target.value === "Yes"
                        )
                      }
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  {/* Move to Section */}
                  <div className="form-group">
                    <label>Move to Section</label>
                    <select
                      value={selectedQuestion.sectionId}
                      onChange={(e) =>
                        moveQuestionToSection(
                          selectedQuestion.sectionId,
                          selectedQuestion.questionId,
                          e.target.value
                        )
                      }
                    >
                      {sections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title || `Section ${sections.indexOf(s) + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Likert Scale Config */}
                  {currentQuestion.questionType === "likert" && (
                    <div className="form-group">
                      <button onClick={openLikertModal} className="likert-btn">
                        {currentQuestion.likert && currentQuestion.likert.scale
                          ? `Edit Scale (${currentQuestion.likert.scale.length} items)`
                          : "Set Likert Scale"}
                      </button>
                    </div>
                  )}

                  {/* Background Color */}
                  <div className="form-group">
                    <label>Background Color</label>
                    <div className="color-picker">
                      {backgroundColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedBgColor(color)}
                          className={`color-option ${
                            selectedBgColor === color ? "active" : ""
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Font Family */}
                  <div className="form-group">
                    <label>Font Family</label>
                    <select
                      value={selectedFont}
                      onChange={(e) => setSelectedFont(e.target.value)}
                    >
                      {fontFamilies.map((font) => (
                        <option key={font} value={font}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <p className="no-selection">
                  Select a question to edit its settings
                </p>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="content-area">
            {sections.map((section) => (
              <div key={section.id} className="section-card">
                {/* Section Header */}
                <div className="section-header-input flex">
                  <div className="section-head-box">
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) =>
                        handleSectionChange(section.id, "title", e.target.value)
                      }
                      placeholder="Section Title"
                      className="section-title"
                    />
                    {section.description !== undefined && (
                      <input
                        type="text"
                        value={section.description}
                        onChange={(e) =>
                          handleSectionChange(
                            section.id,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Section Description (optional)"
                        className="section-description"
                      />
                    )}
                  </div>
                  <img
                    src={del}
                    className="delete-icon"
                    alt="Delete Section"
                    onClick={() => deleteSection(section.id)}
                    title="Delete Section"
                  />
                </div>

                {/* Questions */}
                {section.questions.map((question, qIndex) => (
                  <div
                    key={question.id}
                    onClick={() =>
                      setSelectedQuestion({
                        sectionId: section.id,
                        questionId: question.id,
                      })
                    }
                    className={`question-card ${
                      selectedQuestion?.questionId === question.id
                        ? "selected"
                        : ""
                    }`}
                  >
                    {/* Question Header */}
                    <div className="question-header">
                      <div className="question-title-area">
                        <div className="survey-q-btn flex">
                          <span className="question-number">Q{qIndex + 1}</span>
                          <div className="question-actions">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateQuestion(section.id, question.id);
                              }}
                              className="icon-btn"
                              title="Duplicate"
                            >
                              <img
                                src={copy}
                                alt="Copy"
                                className="copy-icon"
                              />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteQuestion(section.id, question.id);
                              }}
                              className="icon-btn delete"
                              title="Delete"
                            >
                              <img src={del} className="delete-icon" />
                            </button>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={question.questionText}
                          onChange={(e) =>
                            handleQuestionChange(
                              section.id,
                              question.id,
                              "questionText",
                              e.target.value
                            )
                          }
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Untitled Question"
                          className="question-input"
                        />
                      </div>
                    </div>

                    {/* Options for multiple choice/selection */}
                    {(question.questionType === "multiple_choice" ||
                      question.questionType === "multiple_selection") && (
                      <div
                        className="options-area"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="option-row">
                            <span
                              className={`option-indicator ${
                                question.questionType === "multiple_choice"
                                  ? "radio"
                                  : "checkbox"
                              }`}
                            />
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) =>
                                handleOptionChange(
                                  section.id,
                                  question.id,
                                  optIndex,
                                  "text",
                                  e.target.value
                                )
                              }
                              placeholder={`Option ${optIndex + 1}`}
                              className="option-input"
                            />
                            <label className="custom-input-label">
                              <input
                                type="checkbox"
                                checked={option.allowsCustomInput}
                                onChange={(e) =>
                                  handleOptionChange(
                                    section.id,
                                    question.id,
                                    optIndex,
                                    "allowsCustomInput",
                                    e.target.checked
                                  )
                                }
                              />
                              <span>Custom input</span>
                            </label>
                          </div>
                        ))}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addOption(section.id, question.id);
                          }}
                          className="add-option-btn"
                        >
                          + Add option
                        </button>
                      </div>
                    )}

                    {/* Likert Scale Preview */}
                    {question.questionType === "likert" &&
                      question.likert &&
                      question.likert.scale && (
                        <div className="likert-preview">
                          {question.likert.scale.map((item, idx) => (
                            <span key={idx} className="likert-item">
                              {item.value}: {item.label}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
                {/* Add Question Button */}
                <div className="add-new-btn flex">
                  <button
                    onClick={() => addNewQuestion(section.id)}
                    className="add-question-btn flex"
                  >
                    <img src={plus} /> Add Question
                  </button>
                </div>
              </div>
            ))}

            {/* Add Section Button */}
            <button onClick={addNewSection} className="add-section-btn flex">
              <img src={plus} /> <p>Add Section</p>
            </button>

            {/* Action Buttons */}
            <div className="action-buttons survey-ques-action">
              <button
                className="save-btn"
                onClick={() => handleSave(false)}
                disabled={isSaving || isPosting}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                className="post-btn"
                onClick={() => handleSave(true)}
                disabled={isSaving || isPosting}
              >
                {isPosting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>

        {/* Likert Scale Modal */}
        {showLikertModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowLikertModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Configure Likert Scale</h3>
                <button
                  onClick={() => setShowLikertModal(false)}
                  className="modal-close"
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
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
                        onClick={() => removeLikertScaleItem(index)}
                        className="remove-likert-btn"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={addLikertScaleItem} className="add-likert-btn">
                  Add Scale Item
                </button>
              </div>

              <div className="modal-footer">
                <button
                  onClick={() => setShowLikertModal(false)}
                  className="modal-cancel-btn"
                >
                  Cancel
                </button>
                <button onClick={saveLikertScale} className="modal-save-btn">
                  Save Scale
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SurveyQuestions;
