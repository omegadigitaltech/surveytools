import { Link, Form, useActionData, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import backaro from "../../assets/img/backaro.svg";
import del from "../../assets/img/del.svg";
import add from "../../assets/img/add.svg";
import plus from "../../assets/img/icon-add.svg";
import dot from "../../assets/img/dot.svg";
import copy from "../../assets/img/copy.svg";
import useAuthStore from "../../store/useAuthStore";
import { toast } from "react-toastify";
import config from "../../config/config";
import "./formquestion.css";

const FormQuestions = () => {
  const navigate = useNavigate();
  const data = useActionData();
  const { formDraft, setFormDraft, clearFormDraft } = useAuthStore();
  const [isPosting, setIsPosting] = useState(false);
  const authToken = useAuthStore((state) => state.authToken);
  const [isLoading, setIsLoading] = useState(false);

  // Add new state for delete loading
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [isDeletingSectionId, setIsDeletingSectionId] = useState(null);
  
  // Sections state - each section contains fields
  const [sections, setSections] = useState([]);
  
  // Likert scale management
  const [showLikertModal, setShowLikertModal] = useState(false);
  const [editingLikertFieldId, setEditingLikertFieldId] = useState(null);
  const [editingLikertSectionId, setEditingLikertSectionId] = useState(null);
  const [currentLikertScale, setCurrentLikertScale] = useState([
    { value: 1, label: "Strongly Disagree" },
    { value: 2, label: "Disagree" },
    { value: 3, label: "Neutral" },
    { value: 4, label: "Agree" },
    { value: 5, label: "Strongly Agree" },
  ]);

  // Map UI field types to backend field types
  const mapFieldTypeToBackend = (uiType) => {
    const mapping = {
      multiple_choice: "multiple-choice",
      multiple_selection: "checkbox",
      fill_in: "text",
      likert: "likert",
    };
    return mapping[uiType] || uiType;
  };

  // Map backend field types to UI field types
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

  // Generate a unique ID
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

  const sectionsInitializedRef = useRef(false);

  // Load draft data from Zustand on mount
  useEffect(() => {
    if (sectionsInitializedRef.current) return;

    if (!formDraft.title) {
      toast.error("Please start by creating a form");
      navigate("/create-form");
      return;
    }

    // Handle migration from old format (fields) to new format (sections)
    if (formDraft.sections && formDraft.sections.length > 0) {
      const formattedSections = formDraft.sections.map((section, sectionIndex) => ({
        id: `section_${Date.now()}_${sectionIndex}`,
        title: section.title || "",
        description: section.description || "",
        fields: (section.fields || []).map((field, fieldIndex) => ({
          id: `field_${Date.now()}_${sectionIndex}_${fieldIndex}`,
          label: field.questionText || field.label || "",
          type: mapBackendTypeToUI(field.type) || "fill_in",
          required: field.required !== undefined ? field.required : true,
          options: field.options || [],
          likert: field.likert || null,
        })),
      }));
      setSections(formattedSections);
    } else if (formDraft.fields && formDraft.fields.length > 0) {
      // Migrate old format: create a default section with all fields
      const formattedFields = formDraft.fields.map((field, index) => ({
        id: `field_${Date.now()}_${index}`,
        label: field.questionText || field.label || "",
        type: mapBackendTypeToUI(field.type) || "fill_in",
        required: field.required !== undefined ? field.required : true,
        options: field.options || [],
        likert: field.likert || null,
      }));
      setSections([
        {
          id: `section_${Date.now()}`,
          title: "",
          description: "",
          fields: formattedFields,
        },
      ]);
    }

    sectionsInitializedRef.current = true;
    setIsLoading(false);
  }, [formDraft.title, formDraft.sections, formDraft.fields, navigate]);

  // Save sections to draft whenever they change
  useEffect(() => {
    if (!sectionsInitializedRef.current) return;

    const sectionsPayload = sections.map((section) => ({
      title: section.title || "",
      description: section.description || "",
      fields: section.fields.map((field) => {
        const fieldData = {
          questionText: field.label || "",
          type: mapFieldTypeToBackend(field.type),
          required: Boolean(field.required),
        };

        if (field.type === "multiple_choice" || field.type === "multiple_selection") {
          fieldData.options = field.options
            .map((opt) => (typeof opt === "string" ? opt : opt.text || ""))
            .filter((opt) => opt !== "");
        } else if (field.type === "likert" && field.likert) {
          fieldData.likert = field.likert;
        } else {
          fieldData.options = [];
        }

        return fieldData;
      }),
    }));

    setFormDraft({ sections: sectionsPayload });
  }, [sections, setFormDraft]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setIsPosting(true);

    try {
      // Validate sections
      if (sections.length === 0) {
        toast.error("Please add at least one section to your form");
        setIsPosting(false);
        return;
      }

      // Validate each section has at least one field
      for (const section of sections) {
        const validFields = section.fields.filter((field) => field.label.trim() !== "");
        if (validFields.length === 0) {
          toast.error(`Section "${section.title || 'Untitled'}" must have at least one field`);
          setIsPosting(false);
          return;
        }
      }

      // Convert sections to backend format
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
                .map((opt) =>
                  typeof opt === "string" ? opt.trim() : opt.text?.trim() || ""
                )
                .filter((opt) => opt !== "");
              if (cleanOptions.length === 0) {
                throw new Error(
                  `Field "${field.label}" requires at least one option`
                );
              }
              fieldData.options = cleanOptions;
            } else if (field.type === "likert") {
              if (!field.likert || !field.likert.scale || field.likert.scale.length === 0) {
                throw new Error(
                  `Field "${field.label}" requires a Likert scale`
                );
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
      if (!uniqueId || uniqueId === "null" || uniqueId === "undefined") {
        throw new Error("Failed to generate unique ID. Please try again.");
      }
      const userId = useAuthStore.getState().userId;
      const finalPayload = {
        uniqueId: uniqueId,
        title: formDraft.title,
        description: formDraft.description,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        backgroundColor: formDraft.backgroundColor || "#ffffff",
        fontFamily: formDraft.fontFamily || "Arial",
        config: {
          time: formDraft.config?.time || "",
          point: formDraft.config?.point || "",
          totalRequiredParticipants:
            formDraft.config?.totalRequiredParticipants || "",
          preferredParticipants: formDraft.config?.preferredParticipants || "",
          totalParticipants: formDraft.config?.totalParticipants || "",
        },
        shares: {
          type: formDraft.shares?.type || "public",
          emails: formDraft.shares?.emails || [],
          userIds: formDraft.shares?.userIds || [],
        },
        sections: sectionsPayload,
      };

      console.log("=== FORM SUBMISSION DEBUG ===");
      console.log("Generated uniqueId:", uniqueId);
      console.log("Full payload:", JSON.stringify(finalPayload, null, 2));
      console.log("============================");

      const response = await fetch(`${config.API_URL}/forms`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalPayload),
      });

      const responseData = await response.json();
      console.log("Response:", responseData);

      if (!response.ok) {
        console.error("Error response:", responseData);

        if (
          responseData.error &&
          responseData.error.includes("E11000 duplicate key error")
        ) {
          if (responseData.error.includes("uniqueId")) {
            throw new Error(
              "Unique ID conflict. Please try creating the form again."
            );
          }
        }

        throw new Error(
          responseData.msg ||
            responseData.message ||
            responseData.error ||
            "Failed to create form"
        );
      }

      toast.success("Form created successfully!");

      const formId =
        responseData.form?._id ||
        responseData._id ||
        responseData.data?.form?._id ||
        responseData.data?._id;
      const shareLink =
        responseData.form?.shareLink ||
        responseData.shareLink ||
        responseData.data?.shareLink;

      if (formId) {
        const { setFormId } = useAuthStore.getState();
        setFormId(formId);
      }
      clearFormDraft();

      if (formId) {
        setTimeout(() => {
          navigate(`/forminsights/${formId}`);
        }, 1500);
      } else {
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (error) {
      console.error("Error creating form:", error);
      toast.error(error.message || "Error creating form");
    } finally {
      setIsPosting(false);
    }
  };

  // Section management
  const addNewSection = () => {
    const newSection = {
      id: `section_${Date.now()}`,
      title: "",
      description: "",
      fields: [],
    };
    setSections([...sections, newSection]);
  };

  const deleteSection = (sectionId) => {
    if (sections.length === 1) {
      toast.error("You must have at least one section");
      return;
    }

    setIsDeletingSectionId(sectionId);
    try {
      setSections(sections.filter((section) => section.id !== sectionId));
      toast.success("Section deleted successfully");
    } catch (error) {
      toast.error(error.message || "Error deleting section");
    } finally {
      setIsDeletingSectionId(null);
    }
  };

  const handleSectionChange = (sectionId, field, value) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId ? { ...section, [field]: value } : section
      )
    );
  };

  // Field management
  const addNewField = (sectionId) => {
    const newField = {
      id: `field_${Date.now()}_${sectionId}`,
      label: "",
      type: "fill_in",
      required: false,
      options: [],
      likert: null,
    };
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? { ...section, fields: [...section.fields, newField] }
          : section
      )
    );
  };

  const deleteField = (sectionId, fieldId) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          if (section.fields.length === 1) {
            toast.error("You must have at least one field in a section");
            return section;
          }
          return {
            ...section,
            fields: section.fields.filter((field) => field.id !== fieldId),
          };
        }
        return section;
      })
    );
    toast.success("Field deleted successfully");
  };

  const duplicateField = (sectionId, fieldId) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          const fieldToDuplicate = section.fields.find((f) => f.id === fieldId);
          if (fieldToDuplicate) {
            const duplicatedField = {
              ...fieldToDuplicate,
              id: `field_${Date.now()}_${sectionId}`,
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
    toast.success("Field duplicated");
  };

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
                    ...(field === "type" &&
                    (value === "multiple_choice" || value === "multiple_selection") &&
                    f.options.length === 0
                      ? { options: ["Option 1"], likert: null }
                      : {}),
                    ...(field === "type" && value === "likert"
                      ? { options: [], likert: null }
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

  const removeOption = (sectionId, fieldId, index) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          const field = section.fields.find((f) => f.id === fieldId);
          if (field && field.options.length <= 1) {
            toast.error("Must have at least one option");
            return section;
          }
          return {
            ...section,
            fields: section.fields.map((f) =>
              f.id === fieldId
                ? {
                    ...f,
                    options: f.options.filter((_, i) => i !== index),
                  }
                : f
            ),
          };
        }
        return section;
      })
    );
  };

  // Likert scale management
  const openLikertModal = (sectionId, fieldId) => {
    setEditingLikertSectionId(sectionId);
    setEditingLikertFieldId(fieldId);
    const field = sections
      .find((s) => s.id === sectionId)
      ?.fields.find((f) => f.id === fieldId);
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

  const closeLikertModal = () => {
    setShowLikertModal(false);
    setEditingLikertFieldId(null);
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
            fields: section.fields.map((f) =>
              f.id === editingLikertFieldId
                ? {
                    ...f,
                    likert: {
                      scale: currentLikertScale.map((item) => ({
                        value: item.value,
                        label: item.label.trim(),
                      })),
                    },
                  }
                : f
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
    setCurrentLikertScale(currentLikertScale.filter((_, i) => i !== index));
  };

  const updateLikertScaleItem = (index, field, value) => {
    setCurrentLikertScale(
      currentLikertScale.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  // Apply Likert scale to multiple questions
  const applyLikertToMultiple = (sectionId, startFieldId, endFieldId) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const startIndex = section.fields.findIndex((f) => f.id === startFieldId);
    const endIndex = section.fields.findIndex((f) => f.id === endFieldId);

    if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
      toast.error("Invalid field selection");
      return;
    }

    // Get the Likert scale from the first field
    const sourceField = section.fields[startIndex];
    if (!sourceField.likert || !sourceField.likert.scale) {
      toast.error("Please set a Likert scale on the first field first");
      return;
    }

    const scaleToApply = sourceField.likert.scale;

    setSections(
      sections.map((s) => {
        if (s.id === sectionId) {
          return {
            ...s,
            fields: s.fields.map((f, idx) => {
              if (idx >= startIndex && idx <= endIndex && f.type === "likert") {
                return {
                  ...f,
                  likert: { scale: scaleToApply },
                };
              }
              return f;
            }),
          };
        }
        return s;
      })
    );
    toast.success(`Likert scale applied to ${endIndex - startIndex + 1} questions`);
  };

  return (
    <>
      <section className="form-page">
        <div className="wrap">
          <div className="form-head flex">
            <Link to="/create-form">
              <img src={backaro} className="backaro" alt="Back" />
            </Link>
            <div className="form-h">
              <h3>Add Form Fields</h3>
            </div>
          </div>

          {isLoading ? (
            <div className="loading">Loading form fields...</div>
          ) : (
            <div className="form-container">
              <Form
                method="post"
                action="/formquestions"
                onSubmit={handlePostSubmit}
              >
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

                      {section.fields.map((field) => (
                        <div className="oneQuestion" key={field.id}>
                          <div className="question-field flex">
                            <input
                              className="question-input"
                              type="text"
                              name="label"
                              required
                              placeholder="Field Label"
                              value={field.label}
                              onChange={(e) =>
                                handleFieldChange(section.id, field.id, "label", e.target.value)
                              }
                            />
                            <img
                              src={copy}
                              className="copy-icon"
                              alt="Duplicate"
                              onClick={() => duplicateField(section.id, field.id)}
                            />
                            <img
                              src={del}
                              className="delete-icon"
                              alt="Delete"
                              onClick={() => deleteField(section.id, field.id)}
                            />
                          </div>

                          <div className="choice-field custom-dropdown flex">
                            <div className="wrap-icon type-row flex">
                              <img src={dot} className="dot-icon" alt="Dot" />
                              <select
                                name="type"
                                value={field.type}
                                onChange={(e) =>
                                  handleFieldChange(section.id, field.id, "type", e.target.value)
                                }
                                className="choice-select"
                              >
                                <option value="multiple_choice">
                                  Multiple Choice
                                </option>
                                <option value="multiple_selection">
                                  Multiple Selection
                                </option>
                                <option value="fill_in">Fill in</option>
                                <option value="likert">Likert</option>
                              </select>
                            </div>

                            <div className="required-field">
                              <label className="custom-input-checkbox">
                                <input
                                  type="checkbox"
                                  checked={field.required}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      section.id,
                                      field.id,
                                      "required",
                                      e.target.checked
                                    )
                                  }
                                />
                                <span className="checkbox-label">Required</span>
                              </label>
                            </div>

                            {field.type === "likert" && (
                              <div className="likert-controls">
                                <button
                                  type="button"
                                  className="likert-scale-btn"
                                  onClick={() => openLikertModal(section.id, field.id)}
                                >
                                  {field.likert && field.likert.scale
                                    ? `Edit Scale (${field.likert.scale.length} items)`
                                    : "Set Likert Scale"}
                                </button>
                                {field.likert && field.likert.scale && (
                                  <div className="likert-preview">
                                    {field.likert.scale.map((item, idx) => (
                                      <span key={idx} className="likert-item-preview">
                                        {item.value}: {item.label}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {(field.type === "multiple_choice" ||
                              field.type === "multiple_selection") && (
                              <div className="options-list flex">
                                <div className="option">
                                  {field.options.map((option, index) => (
                                    <div
                                      className="wrap-icon flex"
                                      key={index}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                        marginBottom: "0.5rem",
                                      }}
                                    >
                                      <input
                                        type="text"
                                        name="options"
                                        placeholder={`Option ${index + 1}`}
                                        value={
                                          typeof option === "string"
                                            ? option
                                            : option.text || ""
                                        }
                                        onChange={(e) =>
                                          handleOptionChange(
                                            section.id,
                                            field.id,
                                            index,
                                            e.target.value
                                          )
                                        }
                                        className="option-input"
                                        style={{ flex: 1 }}
                                      />
                                      {field.options.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeOption(section.id, field.id, index)
                                          }
                                          className="remove-option-btn"
                                          style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            fontSize: "1.5rem",
                                            color: "#ff4444",
                                            padding: "0 0.5rem",
                                          }}
                                          title="Remove option"
                                        >
                                          ×
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>

                                <button
                                  className="option-select flex"
                                  type="button"
                                  onClick={() => addOption(section.id, field.id)}
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
                        onClick={() => addNewField(section.id)}
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
                      <button
                        className="next-question flex"
                        type="button"
                        onClick={() => {
                          const lastSection = sections[sections.length - 1];
                          if (lastSection) {
                            addNewField(lastSection.id);
                          }
                        }}
                      >
                        Add Question <img src={add} alt="Add" />
                      </button>
                    </>
                  )}
                </div>

                <div className="button-group flex">
                  <button
                    type="submit"
                    className="post-btn"
                    disabled={isPosting}
                  >
                    {isPosting ? "Creating..." : "Create Form"}
                  </button>
                </div>
              </Form>
            </div>
          )}
        </div>
      </section>

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
    </>
  );
};

export default FormQuestions;
