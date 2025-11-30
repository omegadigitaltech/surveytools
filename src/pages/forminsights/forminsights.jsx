import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "react-toastify";
import config from "../../config/config";
import useAuthStore from "../../store/useAuthStore";
import backaro from "../../assets/img/backaro.svg";
import downloadIcon from "../../assets/img/download.svg";
import "./forminsights.css";

const FormInsights = () => {
  const { id } = useParams();
  const location = useLocation();
  const [formData, setFormData] = useState(location.state?.formData);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(!formData);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [currentResponseIndex, setCurrentResponseIndex] = useState(0);
  const [individualResponses, setIndividualResponses] = useState([]);
  const authToken = useAuthStore((state) => state.authToken);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  useEffect(() => {
    const fetchFormInsights = async () => {
      try {
        // Fetch form details
        const formResponse = await fetch(`${config.API_URL}/forms/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const formJson = await formResponse.json();

        if (!formResponse.ok) {
          throw new Error(formJson.message || "Failed to fetch form");
        }

        setFormData(formJson);

        // Fetch all responses
        const responsesResponse = await fetch(
          `${config.API_URL}/forms/${id}/responses`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        const responsesJson = await responsesResponse.json();

        if (!responsesResponse.ok) {
          throw new Error(responsesJson.message || "Failed to fetch responses");
        }

        // Handle both array and object response formats
        const responsesArray = Array.isArray(responsesJson)
          ? responsesJson
          : responsesJson.responses || [];

        setResponses(responsesArray);
        
        // Transform responses into individual user responses (similar to survey insights)
        const userResponses = transformToIndividualResponses(formJson, responsesArray);
        setIndividualResponses(userResponses);
      } catch (error) {
        toast.error(error.message || "Error fetching insights");
      } finally {
        setLoading(false);
      }
    };

    fetchFormInsights();
  }, [id, authToken]);

  // Function to transform form responses into individual user responses (similar to survey)
  const transformToIndividualResponses = (form, responsesArray) => {
    if (!responsesArray || responsesArray.length === 0) return [];
    
    return responsesArray.map((response, index) => {
      const userResponse = {
        userId: response._id || `user_${index}`,
        answers: response.answers || [],
        submittedAt: response.submittedAt || new Date()
      };
      return userResponse;
    });
  };

  const exportToCSV = async () => {
    try {
      setExporting(true);
      
      // Try to use API endpoint first (similar to survey insights)
      try {
        const response = await fetch(`${config.API_URL}/forms/${id}/export`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          a.download = `${formData.title || "form"}-export.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          toast.success("Form data exported successfully");
          return;
        }
      } catch (apiError) {
        // Fall back to client-side export if API endpoint doesn't exist
      }

      // Fallback: Client-side CSV generation
      const allFields = formData.sections
        ? formData.sections.flatMap((section) => section.fields || [])
        : formData.fields || [];

      const headers = [
        "Response ID",
        "Submitted At",
        ...allFields.map((f) => f.label || f.questionText || "Field"),
      ];
      const rows = responses.map((response, idx) => {
        const row = [
          response._id || `response_${idx}`,
          response.submittedAt || "",
        ];

        allFields.forEach((field) => {
          const answer = response.answers?.find(
            (a) => a.fieldId === field._id || a.fieldId === field.id
          );
          let value = "";
          if (answer) {
            if (Array.isArray(answer.value)) {
              value = answer.value.join(", ");
            } else {
              value = String(answer.value || "");
            }
          }
          row.push(value);
        });

        return row;
      });

      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${formData.title || "form"}-export.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Form data exported successfully");
    } catch (error) {
      toast.error(error.message || "Error exporting form data");
    } finally {
      setExporting(false);
    }
  };

  const navigateField = (direction) => {
    const allFields = formData.sections
      ? formData.sections.flatMap((section) => section.fields || [])
      : formData.fields || [];
    
    if (
      direction === "next" &&
      currentFieldIndex < allFields.length - 1
    ) {
      setCurrentFieldIndex(currentFieldIndex + 1);
    } else if (direction === "prev" && currentFieldIndex > 0) {
      setCurrentFieldIndex(currentFieldIndex - 1);
    }
  };

  const navigateResponse = (direction) => {
    if (direction === "next" && currentResponseIndex < individualResponses.length - 1) {
      setCurrentResponseIndex(currentResponseIndex + 1);
    } else if (direction === "prev" && currentResponseIndex > 0) {
      setCurrentResponseIndex(currentResponseIndex - 1);
    }
  };

  // Helper function to get response counts for radio/checkbox fields (similar to survey multiple choice)
  const getOptionData = (field) => {
    if (!field.options || field.options.length === 0) return [];

    return field.options.map((option) => {
      let count = 0;
      let customInputs = [];

      responses.forEach((response) => {
        const answer = response.answers?.find(
          (a) => a.fieldId === field._id || a.fieldId === field.id
        );

        if (answer) {
          if (field.type === "checkbox") {
            // For checkbox, value might be an array
            if (Array.isArray(answer.value)) {
              answer.value.forEach((item) => {
                if (typeof item === "object" && item.selectedOption === option) {
                  count++;
                  if (item.customInput) {
                    customInputs.push(item.customInput);
                  }
                } else if (item === option) {
                  count++;
                }
              });
            } else if (answer.value === option) {
              count++;
            }
          } else {
            // For radio, value is a single string or object
            if (typeof answer.value === "object" && answer.value.selectedOption === option) {
              count++;
              if (answer.value.customInput) {
                customInputs.push(answer.value.customInput);
              }
            } else if (answer.value === option) {
              count++;
            }
          }
        }
      });

      return {
        option: option,
        responses: count,
        customInputs: customInputs,
        percentage:
          responses.length > 0
            ? ((count / responses.length) * 100).toFixed(1)
            : 0,
      };
    });
  };

  if (loading) return <div className="loading">Loading insights...</div>;
  if (!formData) return <div className="error">Failed to load form data</div>;

  // Handle both old structure (fields) and new structure (sections)
  const allFields = formData.sections
    ? formData.sections.flatMap((section) => section.fields || [])
    : formData.fields || [];

  // Ensure currentFieldIndex is valid
  const safeFieldIndex = Math.max(0, Math.min(currentFieldIndex, allFields.length - 1));
  if (safeFieldIndex !== currentFieldIndex && allFields.length > 0) {
    setCurrentFieldIndex(0);
  }

  const currentField = allFields.length > 0 ? allFields[safeFieldIndex] : null;
  const currentResponse = individualResponses[currentResponseIndex] || null;
  const totalResponses = responses.length;

  // Calculate participation data (similar to survey insights)
  const participationData = [
    { name: 'Completed', value: totalResponses },
    { name: 'Remaining', value: Math.max(0, (formData.config?.totalRequiredParticipants || 0) - totalResponses) }
  ];

  return (
    <section className="insights">
      <div className="insights-inner wrap">
        <div className="insights-header">
          <Link to="/dashboard">
            <img src={backaro} className="backaro" alt="Back" />
          </Link>
          <h2>{formData.title} - Insights</h2>
          <button
            className="export-button"
            onClick={exportToCSV}
            disabled={exporting}
          >
            <img src={downloadIcon} alt="" className="download-icon" />
            {exporting ? "Exporting..." : "Export to CSV"}
          </button>
        </div>

        <div className="insights-tabs">
          <button
            className={`tab-button ${activeTab === "summary" ? "active" : ""}`}
            onClick={() => setActiveTab("summary")}
          >
            Summary
          </button>
          <button
            className={`tab-button ${activeTab === "question" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("question");
            }}
          >
            Question
          </button>
          <button
            className={`tab-button ${
              activeTab === "individual" ? "active" : ""
            }`}
            onClick={() => {
              setActiveTab("individual");
            }}
          >
            Individual
          </button>
        </div>

        {activeTab === "summary" && (
          <div className="insights-grid">
            {/* Overview Cards */}
            <div className="overview-cards">
              <div className="card">
                <h3>Total Participants</h3>
                <p>{formData.config?.totalRequiredParticipants || totalResponses}</p>
              </div>
              <div className="card">
                <h3>Responses</h3>
                <p>{totalResponses}</p>
              </div>
              <div className="card">
                <h3>Response Rate</h3>
                <p>{formData.config?.totalRequiredParticipants 
                  ? ((totalResponses / formData.config.totalRequiredParticipants) * 100).toFixed(1)
                  : totalResponses > 0 ? "100.0" : "0.0"}%</p>
              </div>
            </div>

            {/* Participation Chart */}
            <div className="chart-container">
              <h3>Participation Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={participationData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {participationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Fields Summary */}
            <div className="questions-summary">
              <h3>Fields Overview</h3>
              <div className="questions-grid">
                {allFields.map((field, index) => {
                  const fieldResponses = responses.filter((response) => {
                    const answer = response.answers?.find(
                      (a) => a.fieldId === field._id || a.fieldId === field.id
                    );
                    return (
                      answer &&
                      answer.value !== undefined &&
                      answer.value !== ""
                    );
                  }).length;

                  return (
                    <div
                      key={field._id || field.id}
                      className="question-summary-card"
                      onClick={() => {
                        setActiveTab("question");
                        setCurrentFieldIndex(index);
                      }}
                    >
                      <h4>F{index + 1}</h4>
                      <p>
                        {(field.label || field.questionText || "").length > 40
                          ? (field.label || field.questionText || "").substring(
                              0,
                              40
                            ) + "..."
                          : field.label || field.questionText || ""}
                      </p>
                      <div className="response-count">
                        <span>{fieldResponses} responses</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "question" && currentField && allFields.length > 0 && (
          <div className="question-view">
            <div className="question-navigation">
              <button
                onClick={() => navigateField("prev")}
                disabled={currentFieldIndex === 0}
                className="nav-button"
              >
                &lt; Previous
              </button>
              <div className="question-pagination">
                Field {currentFieldIndex + 1} of {allFields.length}
              </div>
              <button
                onClick={() => navigateField("next")}
                disabled={currentFieldIndex === allFields.length - 1}
                className="nav-button"
              >
                Next &gt;
              </button>
            </div>

            <div className="question-detail">
              <h3>
                F{currentFieldIndex + 1}: {currentField.label || currentField.questionText}
              </h3>
              <div className="question-type">Type: {currentField.type === 'radio' 
                ? 'Multiple Choice' 
                : currentField.type === 'checkbox'
                  ? 'Multiple Selection'
                  : currentField.type === 'number'
                    ? 'Number'
                    : currentField.type === 'text' || currentField.type === 'textarea'
                      ? 'Fill in'
                      : currentField.type}</div>

              <div className="question-stats">
                <div className="stat-box">
                  <h4>Total Responses</h4>
                  <p>
                    {
                      responses.filter((r) => {
                        const answer = r.answers?.find(
                          (a) =>
                            a.fieldId === currentField._id ||
                            a.fieldId === currentField.id
                        );
                        return (
                          answer &&
                          answer.value !== undefined &&
                          answer.value !== ""
                        );
                      }).length
                    }
                  </p>
                </div>
                <div className="stat-box">
                  <h4>Response Rate</h4>
                  <p>
                    {totalResponses > 0
                      ? (
                          (responses.filter((r) => {
                            const answer = r.answers?.find(
                              (a) =>
                                a.fieldId === currentField._id ||
                                a.fieldId === currentField.id
                            );
                            return (
                              answer &&
                              answer.value !== undefined &&
                              answer.value !== ""
                            );
                          }).length /
                            totalResponses) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
              </div>

              {(currentField.type === "radio" ||
                currentField.type === "checkbox") && (
                <div className="response-distribution">
                  <h4>Response Distribution</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={getOptionData(currentField)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="option"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [`${value} (${name === 'responses' ? '' : '%'})`, name === 'responses' ? 'Responses' : 'Percentage (%)']} />
                      <Bar
                        dataKey="responses"
                        fill="#8884d8"
                        name="Responses"
                      />
                      <Bar
                        dataKey="percentage"
                        fill="#82ca9d"
                        name="Percentage (%)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  {/* Show custom inputs if any */}
                  {getOptionData(currentField).some(item => item.customInputs && item.customInputs.length > 0) && (
                    <div className="custom-inputs-section">
                      <h4>Custom Inputs</h4>
                      {getOptionData(currentField).map((item, idx) => 
                        item.customInputs && item.customInputs.length > 0 && (
                          <div key={idx} className="custom-input-group">
                            <h5>{item.option}:</h5>
                            <ul>
                              {item.customInputs.map((input, inputIdx) => (
                                <li key={inputIdx}>"{input}"</li>
                              ))}
                            </ul>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}

              {(currentField.type === "text" ||
                currentField.type === "textarea") && (
                <div className="text-responses">
                  <h4>
                    Text Responses ({responses.filter((r) => {
                      const answer = r.answers?.find(
                        (a) =>
                          a.fieldId === currentField._id ||
                          a.fieldId === currentField.id
                      );
                      return answer && answer.value;
                    }).length})
                  </h4>
                  <div className="text-responses-list">
                    {responses.filter((r) => {
                      const answer = r.answers?.find(
                        (a) =>
                          a.fieldId === currentField._id ||
                          a.fieldId === currentField.id
                      );
                      return answer && answer.value;
                    }).length > 0 ? (
                      responses
                        .filter((r) => {
                          const answer = r.answers?.find(
                            (a) =>
                              a.fieldId === currentField._id ||
                              a.fieldId === currentField.id
                          );
                          return answer && answer.value;
                        })
                        .map((response, idx) => {
                          const answer = response.answers?.find(
                            (a) =>
                              a.fieldId === currentField._id ||
                              a.fieldId === currentField.id
                          );
                          return (
                            <div key={idx} className="text-response-item">
                              <p>"{answer.value}"</p>
                            </div>
                          );
                        })
                    ) : (
                      <p className="no-responses">No text responses yet</p>
                    )}
                  </div>
                </div>
              )}

              {currentField.type === "number" && (
                <div className="number-responses">
                  <h4>Number Responses</h4>
                  <div className="number-stats">
                    {(() => {
                      const numberAnswers = responses
                        .map((r) => {
                          const answer = r.answers?.find(
                            (a) =>
                              a.fieldId === currentField._id ||
                              a.fieldId === currentField.id
                          );
                          return answer ? Number(answer.value) : null;
                        })
                        .filter((v) => v !== null && !isNaN(v));

                      if (numberAnswers.length === 0) {
                        return (
                          <p className="no-responses">
                            No number responses yet
                          </p>
                        );
                      }

                      const sum = numberAnswers.reduce((a, b) => a + b, 0);
                      const avg = sum / numberAnswers.length;
                      const min = Math.min(...numberAnswers);
                      const max = Math.max(...numberAnswers);

                      return (
                        <div className="number-stats-grid">
                          <div className="stat-box">
                            <h4>Average</h4>
                            <p>{avg.toFixed(2)}</p>
                          </div>
                          <div className="stat-box">
                            <h4>Min</h4>
                            <p>{min}</p>
                          </div>
                          <div className="stat-box">
                            <h4>Max</h4>
                            <p>{max}</p>
                          </div>
                          <div className="stat-box">
                            <h4>Total</h4>
                            <p>{sum}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "individual" && (
          <div className="individual-view">
            {individualResponses.length > 0 ? (
              <>
                <div className="response-navigation">
                  <div className="email-dropdown">
                    <select
                      value={currentResponseIndex}
                      onChange={(e) =>
                        setCurrentResponseIndex(Number(e.target.value))
                      }
                      className="email-selector"
                    >
                      {individualResponses.map((response, idx) => (
                        <option key={idx} value={idx}>
                          {`Response ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="navigation-controls">
                    <button
                      onClick={() => navigateResponse("prev")}
                      disabled={currentResponseIndex === 0}
                      className="nav-button"
                    >
                      &lt;
                    </button>
                    <div className="response-pagination">
                      {currentResponseIndex + 1} of {individualResponses.length}
                    </div>
                    <button
                      onClick={() => navigateResponse("next")}
                      disabled={currentResponseIndex === individualResponses.length - 1}
                      className="nav-button"
                    >
                      &gt;
                    </button>
                  </div>
                </div>

                <div className="response-detail">
                  <div className="response-header">
                    <h3>{`Response ${currentResponseIndex + 1}`}</h3>
                    <p className="submission-time">
                      Submitted: {currentResponse?.submittedAt
                        ? new Date(currentResponse.submittedAt).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>

                  <div className="response-answers">
                    {allFields.map((field, fIdx) => {
                      const answer = currentResponse?.answers?.find(
                        (a) => a.fieldId === field._id || a.fieldId === field.id
                      );
                      return (
                        <div key={fIdx} className="response-answer-item">
                          <h4>
                            F{fIdx + 1}: {field.label || field.questionText || ""}
                          </h4>
                          <div className="answer">
                            {answer &&
                            answer.value !== undefined &&
                            answer.value !== "" ? (
                              <p className="answer-text">
                                {field.type === 'number' 
                                  ? answer.value
                                  : field.type === 'checkbox' && Array.isArray(answer.value)
                                    ? answer.value.map(item => {
                                        if (typeof item === 'object' && item.selectedOption && item.customInput) {
                                          return `${item.selectedOption}: ${item.customInput}`;
                                        }
                                        return typeof item === 'string' ? item : item.selectedOption || item;
                                      }).join(', ')
                                    : typeof answer.value === 'object' && answer.value.selectedOption && answer.value.customInput
                                      ? `${answer.value.selectedOption}: ${answer.value.customInput}`
                                      : Array.isArray(answer.value)
                                        ? answer.value.join(", ")
                                        : String(answer.value)}
                              </p>
                            ) : (
                              <p className="no-answer">No answer provided</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="no-responses-message">
                <p>No individual responses available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default FormInsights;
