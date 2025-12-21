import React, { useState, useEffect } from "react";
import "./surveyquestion.css";
import copy from "../../assets/img/copy.svg";
import del from "../../assets/img/del.svg";
import add from "../../assets/img/add.svg";
import plus from "../../assets/img/icon-add.svg";

const SurveyQuestions = () => {
  // State management
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const currentQuestion = getCurrentQuestion();
  const isDarkMode = selectedBgColor === "#000000";

  return (
    <div
      className={`survey-form ${isDarkMode ? "dark-mode" : ""}`}
      // style={{ fontFamily: selectedFont, backgroundColor: selectedBgColor }}
    >
      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-bar-content">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h2>Create A Questionnaire</h2>
          <button className="import-btn">Import from files</button>
        </div>
      </div>

      <div className="main-layout">
        
        {/* Left Sidebar - Settings */}
        <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <div className="sidebar-content">
            <h3>Edit Question</h3>

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
                      <span className="question-number">Q{qIndex + 1}</span>
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
                    <div className="question-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateQuestion(section.id, question.id);
                        }}
                        className="icon-btn"
                        title="Duplicate"
                      >
                        <img src={copy} alt="Copy" className="copy-icon" />
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
          <div className="action-buttons">
            <button className="save-btn">Save</button>
            <button className="post-btn">Post</button>
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
  );
};

export default SurveyQuestions;
