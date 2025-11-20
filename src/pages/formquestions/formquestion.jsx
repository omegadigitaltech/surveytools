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

const FormQuestions = () => {
  const navigate = useNavigate();
  const data = useActionData();
  const { formDraft, setFormDraft, clearFormDraft } = useAuthStore();
  const [isPosting, setIsPosting] = useState(false);
  const authToken = useAuthStore((state) => state.authToken);
  const [isLoading, setIsLoading] = useState(false);

  // Add new state for delete loading
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [fields, setFields] = useState([
    {
      id: Date.now(),
      label: "",
      type: "fill_in",
      required: true,
      options: [],
    },
  ]);

  // Map UI field types to backend field types (forms API uses different format)
  const mapFieldTypeToBackend = (uiType) => {
    const mapping = {
      multiple_choice: "multiple-choice",
      multiple_selection: "checkbox",
      fill_in: "text",
      five_point: "multiple-choice",
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
    };
    return mapping[backendType] || "fill_in";
  };

  // Generate a unique ID for the form

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

  const fieldsInitializedRef = useRef(false);

  // Load draft data from Zustand on mount (only once)
  useEffect(() => {
    if (fieldsInitializedRef.current) return;

    if (!formDraft.title) {
      toast.error("Please start by creating a form");
      navigate("/create-form");
      return;
    }
    if (formDraft.fields && formDraft.fields.length > 0) {
      const formattedFields = formDraft.fields.map((field, index) => ({
        id: Date.now() + index,
        label: field.questionText || field.label || "",
        type: mapBackendTypeToUI(field.type) || "text",
        required: field.required !== undefined ? field.required : true,
        options: field.options || [],
      }));
      setFields(formattedFields);
    }

    fieldsInitializedRef.current = true;
    setIsLoading(false);
  }, [formDraft.title, formDraft.fields, navigate]);

  useEffect(() => {
    if (!fieldsInitializedRef.current) return;

    const fieldsPayload = fields.map((field) => {
      const fieldData = {
        questionText: field.label || "",
        type: mapFieldTypeToBackend(field.type),
        required: Boolean(field.required),
      };
      if (
        field.type === "multiple_choice" ||
        field.type === "multiple_selection"
      ) {
        fieldData.options = field.options
          .map((opt) => (typeof opt === "string" ? opt : opt.text || ""))
          .filter((opt) => opt !== "");
      } else if (field.type === "five_point") {
        fieldData.options = ["1", "2", "3", "4", "5"];
      } else {
        fieldData.options = [];
      }

      return fieldData;
    });

    setFormDraft({ fields: fieldsPayload });
  }, [fields, setFormDraft]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setIsPosting(true);

    try {
      const validFields = fields.filter((field) => field.label.trim() !== "");
      if (validFields.length === 0) {
        toast.error("Please add at least one field to your form");
        setIsPosting(false);
        return;
      }

      // Convert fields to backend format
      const fieldsPayload = validFields.map((field) => {
        const fieldData = {
          questionText: field.label.trim(),
          type: mapFieldTypeToBackend(field.type),
          required: Boolean(field.required),
        };

        // Add options for multiple_choice, multiple_selection, and five_point types
        if (
          field.type === "multiple_choice" ||
          field.type === "multiple_selection"
        ) {
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
        } else if (field.type === "five_point") {
          fieldData.options = ["1", "2", "3", "4", "5"];
        } else {
          fieldData.options = [];
        }

        return fieldData;
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
        fields: fieldsPayload,
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

        // Special handling for duplicate key error
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

      // Store form ID and share link if returned
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

      // Navigate to form insights page to show share link and form details
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

  const addNewField = () => {
    const newField = {
      id: Date.now(),
      label: "",
      type: "fill_in",
      required: false,
      options: [],
    };
    setFields([...fields, newField]);
  };

  const deleteField = async (id) => {
    if (fields.length === 1) {
      toast.error("You must have at least one field");
      return;
    }

    setIsDeletingId(id);
    try {
      setFields(fields.filter((field) => field.id !== id));
      toast.success("Field deleted successfully");
    } catch (error) {
      toast.error(error.message || "Error deleting field");
    } finally {
      setIsDeletingId(null);
    }
  };

  const duplicateField = (id) => {
    const fieldToDuplicate = fields.find((f) => f.id === id);
    if (fieldToDuplicate) {
      const duplicatedField = {
        ...fieldToDuplicate,
        id: Date.now(),
      };
      setFields([...fields, duplicatedField]);
      toast.success("Field duplicated");
    }
  };

  const handleFieldChange = (id, field, value) => {
    const updatedFields = fields.map((f) =>
      f.id === id
        ? {
            ...f,
            [field]: value,
            ...(field === "type" && value === "fill_in" ? { options: [] } : {}),
            ...(field === "type" &&
            (value === "multiple_choice" || value === "multiple_selection") &&
            f.options.length === 0
              ? { options: ["Option 1"] }
              : {}),
            ...(field === "type" && value === "five_point"
              ? { options: ["1", "2", "3", "4", "5"] }
              : {}),
          }
        : f
    );
    setFields(updatedFields);
  };

  const addOption = (id) => {
    const updatedFields = fields.map((f) =>
      f.id === id
        ? {
            ...f,
            options: [...f.options, `Option ${f.options.length + 1}`],
          }
        : f
    );
    setFields(updatedFields);
  };

  const handleOptionChange = (fieldId, index, value) => {
    const updatedFields = fields.map((f) =>
      f.id === fieldId
        ? {
            ...f,
            options: f.options.map((opt, i) => (i === index ? value : opt)),
          }
        : f
    );
    setFields(updatedFields);
  };

  const removeOption = (fieldId, index) => {
    const field = fields.find((f) => f.id === fieldId);
    if (field && field.options.length <= 1) {
      toast.error("Must have at least one option");
      return;
    }

    const updatedFields = fields.map((f) =>
      f.id === fieldId
        ? {
            ...f,
            options: f.options.filter((_, i) => i !== index),
          }
        : f
    );
    setFields(updatedFields);
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
                {fields.map((field) => (
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
                          handleFieldChange(field.id, "label", e.target.value)
                        }
                      />
                      <img
                        src={copy}
                        className="copy-icon"
                        alt="Duplicate"
                        onClick={() => duplicateField(field.id)}
                      />
                      {isDeletingId === field.id ? (
                        <span className="deleting-spinner">Deleting...</span>
                      ) : (
                        <img
                          src={del}
                          className="delete-icon"
                          alt="Delete"
                          onClick={() => deleteField(field.id)}
                        />
                      )}
                    </div>

                    <div className="choice-field custom-dropdown flex">
                      <div className="wrap-icon type-row flex">
                        <img src={dot} className="dot-icon" alt="Dot" />
                        <select
                          name="type"
                          value={field.type}
                          onChange={(e) =>
                            handleFieldChange(field.id, "type", e.target.value)
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
                          <option value="five_point">Five Point</option>
                        </select>
                      </div>

                      <div className="required-field">
                        <label className="custom-input-checkbox">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) =>
                              handleFieldChange(
                                field.id,
                                "required",
                                e.target.checked
                              )
                            }
                          />
                          <span className="checkbox-label">Required</span>
                        </label>
                      </div>

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
                                      removeOption(field.id, index)
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
                            onClick={() => addOption(field.id)}
                          >
                            Add option
                          </button>
                        </div>
                      )}
                      {field.type === "five_point" && (
                        <div className="options-list flex">
                          <div className="option">
                            <p style={{ color: "#666", fontStyle: "italic" }}>
                              Five point scale options: 1, 2, 3, 4, 5
                              (automatically set)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  className="next-question flex"
                  type="button"
                  onClick={addNewField}
                >
                  Add Field <img src={add} alt="Add" />
                </button>

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
    </>
  );
};

export default FormQuestions;
