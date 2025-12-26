import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./formquestion.css";
import copy from "../../assets/img/copy.svg";
import del from "../../assets/img/del.svg";
import plus from "../../assets/img/icon-add.svg";
import useAuthStore from "../../store/useAuthStore";
import { toast } from "react-toastify";
import config from "../../config/config";

const FormQuestions = () => {
  const navigate = useNavigate();
  const { id: formId } = useParams();
  const location = useLocation();
  const authToken = useAuthStore((state) => state.authToken);
  const { clearFormDraft } = useAuthStore();
  
  const [isPosting, setIsPosting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [existingFormData, setExistingFormData] = useState(null);
  
  // Form metadata
  const [formTitle, setFormTitle] = useState("Untitled Form");
  const [formDescription, setFormDescription] = useState("");
  
  // Sections state
  const [sections, setSections] = useState([
    {
      id: "section_1",
      sectionId: null,
      title: "",
      description: "",
      order: 1,
      fields: [
        {
          id: "field_1",
          fieldId: "",
          label: "",
          type: "multiple_choice",
          required: false,
          options: ["Option 1", "Option 2"],
          likert: null,
        },
      ],
    },
  ]);

  const [selectedField, setSelectedField] = useState(null);
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
  const backgroundColors = ["#FFFFFF", "#FFF9E6", "#FFE6E6", "#E6F3FF", "#F0E6FF", "#000000"];
  const [selectedBgColor, setSelectedBgColor] = useState("#FFFFFF");
  const fontFamilies = ["Roboto", "Arial", "Georgia", "Times New Roman", "Courier New"];
  const [selectedFont, setSelectedFont] = useState("Roboto");

  // Select first field by default
  useEffect(() => {
    if (sections.length > 0 && sections[0].fields.length > 0) {
      setSelectedField({
        sectionId: sections[0].id,
        fieldId: sections[0].fields[0].id,
      });
    }
  }, []);

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

  // Get currently selected field object
  const getCurrentField = () => {
    if (!selectedField) return null;
    const section = sections.find((s) => s.id === selectedField.sectionId);
    return section?.fields.find((f) => f.id === selectedField.fieldId);
  };

  // Map UI field types to backend
  const mapFieldTypeToBackend = (uiType) => {
    const mapping = {
      multiple_choice: "multiple-choice",
      multiple_selection: "checkbox",
      fill_in: "text",
      likert: "likert",
    };
    return mapping[uiType] || uiType;
  };

  // Map backend field types to UI
  const mapBackendTypeToUI = (backendType) => {
    const mapping = {
      "multiple-choice": "multiple_choice",
      checkbox: "multiple_selection",
      text: "fill_in",
      textarea: "fill_in",
      date: "fill_in",
      number: "fill_in",
      likert: "likert",
    };
    return mapping[backendType] || "fill_in";
  };

  // Generate unique ID
  const generateUniqueId = () => {
    try {
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
      }
    } catch (error) {
      console.warn("crypto.randomUUID failed, using fallback:", error);
    }
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 15);
    const randomStr2 = Math.random().toString(36).substring(2, 15);
    return `form_${timestamp}_${randomStr}${randomStr2}`;
  };

  // Handle field changes
  const handleFieldChange = (sectionId, fieldId, field, value) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            fields: section.fields.map((f) =>
              f.id === fieldId
                ? {
                    ...f,
                    [field]: value,
                    ...(field === "type" && value === "fill_in"
                      ? { options: [], likert: null }
                      : {}),
                    ...(field === "type" && value === "likert"
                      ? { options: [], likert: null }
                      : {}),
                    ...(field === "type" &&
                    (value === "multiple_choice" || value === "multiple_selection") &&
                    f.options.length === 0
                      ? { options: ["Option 1"], likert: null }
                      : {}),
                  }
                : f
            ),
          };
        }
        return section;
      })
    );
  };

  // Delete section
  const deleteSection = (sectionId) => {
    if (sections.length === 1) {
      alert("You must have at least one section");
      return;
    }

    try {
      const section = sections.find((s) => s.id === sectionId);
      if (!section) {
        throw new Error("Section not found");
      }

      const remainingSections = sections.filter((s) => s.id !== sectionId);
      let updatedSections = remainingSections;

      if (remainingSections.length > 0 && section.fields.length > 0) {
        const targetSection = remainingSections[0];
        const fieldsToMove = section.fields.map((f) => ({
          ...f,
          sectionId: targetSection.sectionId,
        }));

        updatedSections = remainingSections.map((s) =>
          s.id === targetSection.id
            ? {
                ...s,
                fields: [...s.fields, ...fieldsToMove],
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

  // Add new field
  const addNewField = (sectionId) => {
    const newField = {
      id: `field_${Date.now()}_${Math.random()}`,
      fieldId: "",
      label: "",
      type: "multiple_choice",
      required: false,
      options: ["Option 1"],
      likert: null,
      sectionId: sections.find((s) => s.id === sectionId)?.sectionId || null,
    };

    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? { ...section, fields: [...section.fields, newField] }
          : section
      )
    );

    setSelectedField({ sectionId, fieldId: newField.id });
  };

  // Delete field
  const deleteField = (sectionId, fieldId) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          if (section.fields.length === 1) {
            alert("You must have at least one field in a section");
            return section;
          }
          const newFields = section.fields.filter((f) => f.id !== fieldId);

          if (selectedField?.fieldId === fieldId) {
            setSelectedField({
              sectionId,
              fieldId: newFields[0]?.id,
            });
          }

          return { ...section, fields: newFields };
        }
        return section;
      })
    );
  };

  // Duplicate field
  const duplicateField = (sectionId, fieldId) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          const fieldToDuplicate = section.fields.find((f) => f.id === fieldId);
          if (fieldToDuplicate) {
            const duplicatedField = {
              ...fieldToDuplicate,
              id: `field_${Date.now()}_${Math.random()}`,
              fieldId: "",
              likert: fieldToDuplicate.likert ? { ...fieldToDuplicate.likert } : null,
            };
            return {
              ...section,
              fields: [...section.fields, duplicatedField],
            };
          }
        }
        return section;
      })
    );
  };

  // Add option
  const addOption = (sectionId, fieldId) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            fields: section.fields.map((f) =>
              f.id === fieldId
                ? {
                    ...f,
                    options: [...f.options, `Option ${f.options.length + 1}`],
                  }
                : f
            ),
          };
        }
        return section;
      })
    );
  };

  // Handle option change
  const handleOptionChange = (sectionId, fieldId, index, value) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            fields: section.fields.map((f) =>
              f.id === fieldId
                ? {
                    ...f,
                    options: f.options.map((opt, i) => (i === index ? value : opt)),
                  }
                : f
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
      fields: [
        {
          id: `field_${Date.now()}_${Math.random()}`,
          fieldId: "",
          label: "",
          type: "multiple_choice",
          required: false,
          options: ["Option 1"],
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

  // Move field to section
  const moveFieldToSection = (currentSectionId, fieldId, targetSectionId) => {
    if (currentSectionId === targetSectionId) return;

    const currentSection = sections.find((s) => s.id === currentSectionId);
    const targetSection = sections.find((s) => s.id === targetSectionId);
    const field = currentSection?.fields.find((f) => f.id === fieldId);

    if (!field) return;

    setSections(
      sections.map((section) => {
        if (section.id === currentSectionId) {
          if (section.fields.length === 1) {
            alert("You must have at least one field in a section");
            return section;
          }
          return {
            ...section,
            fields: section.fields.filter((f) => f.id !== fieldId),
          };
        } else if (section.id === targetSectionId) {
          return {
            ...section,
            fields: [
              ...section.fields,
              {
                ...field,
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
    const field = getCurrentField();
    if (field && field.likert && field.likert.scale) {
      setCurrentLikertScale([...field.likert.scale]);
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

    if (selectedField) {
      handleFieldChange(
        selectedField.sectionId,
        selectedField.fieldId,
        "likert",
        { scale: currentLikertScale }
      );
    }
    setShowLikertModal(false);
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

  // Handle form submission
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setIsPosting(true);

    try {
      if (sections.length === 0) {
        toast.error("Please add at least one section to your form");
        setIsPosting(false);
        return;
      }

      for (const section of sections) {
        const validFields = section.fields.filter((field) => field.label.trim() !== "");
        if (validFields.length === 0) {
          toast.error(`Section "${section.title || 'Untitled'}" must have at least one field`);
          setIsPosting(false);
          return;
        }
      }

      const sectionsPayload = sections.map((section) => {
        const validFields = section.fields.filter((field) => field.label.trim() !== "");
        
        return {
          title: section.title.trim() || "Untitled Section",
          description: section.description.trim() || "",
          fields: validFields.map((field) => {
            const fieldData = {
              questionText: field.label.trim(),
              type: mapFieldTypeToBackend(field.type),
              required: Boolean(field.required),
            };

            if (field.type === "multiple_choice" || field.type === "multiple_selection") {
              const cleanOptions = field.options
                .map((opt) => (typeof opt === "string" ? opt.trim() : opt.text?.trim() || ""))
                .filter((opt) => opt !== "");
              if (cleanOptions.length === 0) {
                throw new Error(`Field "${field.label}" requires at least one option`);
              }
              fieldData.options = cleanOptions;
            } else if (field.type === "likert") {
              if (!field.likert || !field.likert.scale || field.likert.scale.length === 0) {
                throw new Error(`Field "${field.label}" requires a Likert scale`);
              }
              fieldData.likert = field.likert;
            } else {
              fieldData.options = [];
            }

            return fieldData;
          }),
        };
      });

      const uniqueId = generateUniqueId();
      const userId = useAuthStore.getState().userId;
      
      const finalPayload = {
        uniqueId: uniqueId,
        title: formTitle,
        description: formDescription,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        backgroundColor: selectedBgColor,
        fontFamily: selectedFont,
        config: {
          time: "",
          point: "",
          totalRequiredParticipants: "",
          preferredParticipants: "",
          totalParticipants: "",
        },
        shares: {
          type: "public",
          emails: [],
          userIds: [],
        },
        sections: sectionsPayload,
      };

      const response = await fetch(`${config.API_URL}/forms`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalPayload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.msg || responseData.message || "Failed to create form"
        );
      }

      toast.success("Form created successfully!");

      const returnedFormId = responseData.form?._id || responseData._id;
      
      if (returnedFormId) {
        const { setFormId } = useAuthStore.getState();
        setFormId(returnedFormId);
      }

      clearFormDraft();

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error creating form:", error);
      toast.error(error.message || "Error creating form");
    } finally {
      setIsPosting(false);
    }
  };

  const currentField = getCurrentField();
  const isDarkMode = selectedBgColor === "#000000";

  return (
    <div className={`form-builder ${isDarkMode ? "dark-mode" : ""}`}>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-bar-content">
          <h2>Create New Form</h2>
          <button 
            className="publish-btn"
            onClick={handlePostSubmit}
            disabled={isPosting}
          >
            {isPosting ? "Publishing..." : "Publish Form"}
          </button>
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
        <div ref={sidebarRef} className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <div className="sidebar-header-mobile">
            <h3>Set question type</h3>
            <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
              ×
            </button>
          </div>
          <div className="sidebar-content">
            <h3 className="sidebar-title-desktop">Edit Question</h3>

            {currentField ? (
              <>
                {/* Question Type */}
                <div className="form-group">
                  <label>Question Type</label>
                  <select
                    value={currentField.type}
                    onChange={(e) =>
                      handleFieldChange(
                        selectedField.sectionId,
                        selectedField.fieldId,
                        "type",
                        e.target.value
                      )
                    }
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="multiple_selection">Multiple Selection</option>
                    <option value="fill_in">Short Text</option>
                    <option value="likert">Likert Scale</option>
                  </select>
                </div>

                {/* Required Question */}
                <div className="form-group">
                  <label>Required Question</label>
                  <select
                    value={currentField.required ? "Yes" : "No"}
                    onChange={(e) =>
                      handleFieldChange(
                        selectedField.sectionId,
                        selectedField.fieldId,
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
                    value={selectedField.sectionId}
                    onChange={(e) =>
                      moveFieldToSection(
                        selectedField.sectionId,
                        selectedField.fieldId,
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
                {currentField.type === "likert" && (
                  <div className="form-group">
                    <button onClick={openLikertModal} className="likert-btn">
                      {currentField.likert && currentField.likert.scale
                        ? `Edit Scale (${currentField.likert.scale.length} items)`
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
                        className={`color-option ${selectedBgColor === color ? "active" : ""}`}
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
              <p className="no-selection">Select a question to edit its settings</p>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="content-area">
          {/* Form Title and Description */}
          <div className="form-meta-section">
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Untitled Form"
              className="form-title-input"
            />
            <input
              type="text"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Add Description"
              className="form-description-input"
            />
          </div>

          {sections.map((section, sIndex) => (
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
                    placeholder="Section Title (optional)"
                    className="section-title"
                  />
                  {section.description !== undefined && (
                    <input
                      type="text"
                      value={section.description}
                      onChange={(e) =>
                        handleSectionChange(section.id, "description", e.target.value)
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

              {/* Fields */}
              {section.fields.map((field, fIndex) => (
                <div
                  key={field.id}
                  onClick={() =>
                    setSelectedField({
                      sectionId: section.id,
                      fieldId: field.id,
                    })
                  }
                  className={`question-card ${
                    selectedField?.fieldId === field.id ? "selected" : ""
                  }`}
                >
                  {/* Field Header */}
                  <div className="question-header">
                    <div className="question-title-area">
                      <div className="form-q-btn flex">
                        <span className="question-number">{sIndex + 1}.{fIndex + 1}</span>
                        <div className="question-actions">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateField(section.id, field.id);
                            }}
                            className="icon-btn"
                            title="Duplicate"
                          >
                            <img src={copy} alt="Copy" className="copy-icon" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteField(section.id, field.id);
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
                        value={field.label}
                        onChange={(e) =>
                          handleFieldChange(
                            section.id,
                            field.id,
                            "label",
                            e.target.value
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Question"
                        className="question-input"
                      />
                    </div>
                  </div>

                  {/* Options for multiple choice/selection */}
                  {(field.type === "multiple_choice" ||
                    field.type === "multiple_selection") && (
                    <div className="options-area" onClick={(e) => e.stopPropagation()}>
                      {field.options.map((option, optIndex) => (
                        <div key={optIndex} className="option-row">
                          <span
                            className={`option-indicator ${
                              field.type === "multiple_choice" ? "radio" : "checkbox"
                            }`}
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) =>
                              handleOptionChange(
                                section.id,
                                field.id,
                                optIndex,
                                e.target.value
                              )
                            }
                            placeholder={`Option ${optIndex + 1}`}
                            className="option-input"
                          />
                        </div>
                      ))}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addOption(section.id, field.id);
                        }}
                        className="add-option-btn"
                      >
                        + Add option
                      </button>
                    </div>
                  )}

                  {/* Likert Scale Preview */}
                  {field.type === "likert" && field.likert && field.likert.scale && (
                    <div className="likert-preview">
                      {field.likert.scale.map((item, idx) => (
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
                  onClick={() => addNewField(section.id)}
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
        </div>
      </div>

      {/* Likert Scale Modal */}
      {showLikertModal && (
        <div className="modal-overlay" onClick={() => setShowLikertModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Configure Likert Scale</h3>
              <button onClick={() => setShowLikertModal(false)} className="modal-close">
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
                      updateLikertScaleItem(index, "value", parseInt(e.target.value) || 0)
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
              <button onClick={() => setShowLikertModal(false)} className="modal-cancel-btn">
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

export default FormQuestions;