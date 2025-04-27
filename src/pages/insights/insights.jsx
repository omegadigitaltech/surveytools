import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { toast } from "react-toastify";
import config from "../../config/config";
import useAuthStore from "../../store/useAuthStore";
import backaro from "../../assets/img/backaro.svg";
import downloadIcon from "../../assets/img/download.svg";
import "./insights.css";

const Insights = () => {
  const { id } = useParams();
  const location = useLocation();
  const [surveyData, setSurveyData] = useState(location.state?.surveyData);
  const [loading, setLoading] = useState(!surveyData);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [acceptingResponses, setAcceptingResponses] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentResponseIndex, setCurrentResponseIndex] = useState(0);
  const [individualResponses, setIndividualResponses] = useState([]);
  const [currentView, setCurrentView] = useState("question"); // "question" or "individual"
  const authToken = useAuthStore((state) => state.authToken);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    const fetchSurveyInsights = async () => {
      try {
        const response = await fetch(`${config.API_URL}/surveys/${id}/info`, {
          headers: {
            "Authorization": `Bearer ${authToken}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch insights");
        }

        setSurveyData(data.survey);
        
        // Get individual responses
        const responsesResponse = await fetch(`${config.API_URL}/surveys/${id}/responses`, {
          headers: {
            "Authorization": `Bearer ${authToken}`,
          },
        });
        
        const responsesData = await responsesResponse.json();
        if (responsesResponse.ok) {
          setIndividualResponses(responsesData.responses || []);
        }
      } catch (error) {
        toast.error(error.message || "Error fetching insights");
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyInsights();
  }, [id, authToken]);

  const toggleAcceptingResponses = async () => {
    try {
      const response = await fetch(`${config.API_URL}/surveys/${id}/toggle-status`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ accepting: !acceptingResponses })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to update survey status");
      }

      setAcceptingResponses(!acceptingResponses);
      toast.success(`Survey is now ${!acceptingResponses ? "accepting" : "not accepting"} responses`);
    } catch (error) {
      toast.error(error.message || "Error updating survey status");
    }
  };

  const exportToCSV = async () => {
    try {
      setExporting(true);
      const response = await fetch(`${config.API_URL}/surveys/${id}/export`, {
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to export data");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${surveyData.title}-export.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Survey data exported successfully");
    } catch (error) {
      toast.error(error.message || "Error exporting survey data");
    } finally {
      setExporting(false);
    }
  };

  const navigateQuestion = (direction) => {
    if (direction === 'next' && currentQuestionIndex < surveyData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const navigateResponse = (direction) => {
    if (direction === 'next' && currentResponseIndex < individualResponses.length - 1) {
      setCurrentResponseIndex(currentResponseIndex + 1);
    } else if (direction === 'prev' && currentResponseIndex > 0) {
      setCurrentResponseIndex(currentResponseIndex - 1);
    }
  };

  if (loading) return <div className="loading">Loading insights...</div>;
  if (!surveyData) return <div className="error">Failed to load survey data</div>;

  const participationData = [
    { name: 'Completed', value: surveyData.participantCounts.filled },
    { name: 'Remaining', value: surveyData.participantCounts.remaining }
  ];

  const currentQuestion = surveyData.questions[currentQuestionIndex];
  const currentResponse = individualResponses[currentResponseIndex] || null;

  return (
    <section className="insights">
      <div className="insights-inner wrap">
        <div className="insights-header">
          <Link to="/dashboard">
            <img src={backaro} className="backaro" alt="Back" />
          </Link>
          <h2>{surveyData.title} - Insights</h2>
          <button 
            className="export-button" 
            onClick={exportToCSV} 
            disabled={exporting}
          >
            <img src={downloadIcon} alt="" className="download-icon" />
            {exporting ? "Exporting..." : "Export to CSV"}
          </button>
        </div>

        {/* <div className="response-toggle">
          <div className="toggle-indicator">
            <span>Accepting responses</span>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={acceptingResponses} 
                onChange={toggleAcceptingResponses}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div> */}

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
              setCurrentView("question");
            }}
          >
            Question
          </button>
          {/* <button 
            className={`tab-button ${activeTab === "individual" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("individual");
              setCurrentView("individual");
            }}
          >
            Individual
          </button> */}
        </div>

        {activeTab === "summary" && (
          <div className="insights-grid">
            {/* Overview Cards */}
            <div className="overview-cards">
              <div className="card">
                <h3>Total Participants</h3>
                <p>{surveyData.no_of_participants}</p>
              </div>
              <div className="card">
                <h3>Responses</h3>
                <p>{surveyData.participantCounts.filled}</p>
              </div>
              <div className="card">
                <h3>Response Rate</h3>
                <p>{((surveyData.participantCounts.filled / surveyData.no_of_participants) * 100).toFixed(1)}%</p>
              </div>
              {/* <div className="card">
                <h3>Average Completion Time</h3>
                <p>{surveyData.avgCompletionTime || "N/A"}</p>
              </div> */}
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

            {/* Quick Question Summary */}
            <div className="questions-summary">
              <h3>Questions Overview</h3>
              <div className="questions-grid">
                {surveyData.questions.map((question, index) => (
                  <div key={question._id} className="question-summary-card" onClick={() => {
                    setActiveTab("question");
                    setCurrentQuestionIndex(index);
                  }}>
                    <h4>Q{index + 1}</h4>
                    <p>{question.questionText.length > 40 
                      ? question.questionText.substring(0, 40) + "..." 
                      : question.questionText}
                    </p>
                    <div className="response-count">
                      <span>{question.analytics?.totalResponses || 0} responses</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "question" && (
          <div className="question-view">
            <div className="question-navigation">
              <button 
                onClick={() => navigateQuestion('prev')} 
                disabled={currentQuestionIndex === 0}
                className="nav-button"
              >
                &lt; Previous
              </button>
              <div className="question-pagination">
                Question {currentQuestionIndex + 1} of {surveyData.questions.length}
              </div>
              <button 
                onClick={() => navigateQuestion('next')} 
                disabled={currentQuestionIndex === surveyData.questions.length - 1}
                className="nav-button"
              >
                Next &gt;
              </button>
            </div>
            
            <div className="question-detail">
              <h3>Q{currentQuestionIndex + 1}: {currentQuestion.questionText}</h3>
              <div className="question-type">Type: {currentQuestion.questionType === 'multiple_choice' 
                ? 'Multiple Choice' 
                : currentQuestion.questionType === 'five_point' 
                  ? 'Five Point Scale' 
                  : 'Fill in'}</div>
              
              <div className="question-stats">
                <div className="stat-box">
                  <h4>Total Responses</h4>
                  <p>{currentQuestion.analytics?.totalResponses || 0}</p>
                </div>
                <div className="stat-box">
                  <h4>Response Rate</h4>
                  <p>{surveyData.participantCounts.filled 
                    ? (((currentQuestion.analytics?.totalResponses || 0) / surveyData.participantCounts.filled) * 100).toFixed(1) 
                    : 0}%</p>
                </div>
              </div>

              {currentQuestion.questionType === 'multiple_choice' && (
                <div className="response-distribution">
                  <h4>Response Distribution</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart 
                      data={currentQuestion.options.map(opt => ({
                        option: opt.text,
                        responses: currentQuestion.answers?.filter(a => a.response === opt.text).length || 0,
                        percentage: surveyData.participantCounts.filled 
                          ? ((currentQuestion.answers?.filter(a => a.response === opt.text).length || 0) / surveyData.participantCounts.filled * 100).toFixed(1) 
                          : 0
                      }))}
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
                      <Tooltip formatter={(value, name) => [`${value} (${name === 'responses' ? '' : '%'})`, name === 'responses' ? 'Responses' : 'Percentage']} />
                      <Bar dataKey="responses" fill="#8884d8" name="Responses" />
                      <Bar dataKey="percentage" fill="#82ca9d" name="Percentage (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {currentQuestion.questionType === 'five_point' && (
                <div className="response-distribution">
                  <h4>Response Distribution</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart 
                      data={[1, 2, 3, 4, 5].map(point => ({
                        point: `${point}`,
                        responses: currentQuestion.answers?.filter(a => a.response === point.toString()).length || 0,
                        percentage: surveyData.participantCounts.filled 
                          ? ((currentQuestion.answers?.filter(a => a.response === point.toString()).length || 0) / surveyData.participantCounts.filled * 100).toFixed(1) 
                          : 0
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="point" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [`${value} (${name === 'responses' ? '' : '%'})`, name === 'responses' ? 'Responses' : 'Percentage']} />
                      <Bar dataKey="responses" fill="#8884d8" name="Responses" />
                      <Bar dataKey="percentage" fill="#82ca9d" name="Percentage (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {currentQuestion.questionType === 'fill_in' && (
                <div className="text-responses">
                  <h4>Text Responses ({currentQuestion.answers?.length || 0})</h4>
                  <div className="text-responses-list">
                    {currentQuestion.answers?.length > 0 ? 
                      currentQuestion.answers.map((answer, idx) => (
                        <div key={idx} className="text-response-item">
                          <p>"{answer.response}"</p>
                        </div>
                      )) : 
                      <p className="no-responses">No text responses yet</p>
                    }
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
                      onChange={(e) => setCurrentResponseIndex(Number(e.target.value))}
                      className="email-selector"
                    >
                      {individualResponses.map((response, idx) => (
                        <option key={idx} value={idx}>
                          {response.userEmail || `Response ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="navigation-controls">
                    <button 
                      onClick={() => navigateResponse('prev')} 
                      disabled={currentResponseIndex === 0}
                      className="nav-button"
                    >
                      &lt;
                    </button>
                    <div className="response-pagination">
                      {currentResponseIndex + 1} of {individualResponses.length}
                    </div>
                    <button 
                      onClick={() => navigateResponse('next')} 
                      disabled={currentResponseIndex === individualResponses.length - 1}
                      className="nav-button"
                    >
                      &gt;
                    </button>
                  </div>
                </div>

                <div className="response-detail">
                  <div className="response-header">
                    <h3>{currentResponse?.userEmail || `Response ${currentResponseIndex + 1}`}</h3>
                    <p className="submission-time">
                      Submitted: {new Date(currentResponse?.submittedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="response-answers">
                    {surveyData.questions.map((question, qIdx) => {
                      const answer = currentResponse?.answers?.find(a => a.questionId === question._id);
                      return (
                        <div key={qIdx} className="response-answer-item">
                          <h4>Q{qIdx + 1}: {question.questionText}</h4>
                          <div className="answer">
                            {answer ? (
                              <p className="answer-text">
                                {question.questionType === 'five_point' 
                                  ? `${answer.response} / 5` 
                                  : answer.response}
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

export default Insights; 