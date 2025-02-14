import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { toast } from "react-toastify";
import config from "../../config/config";
import useAuthStore from "../../components/store/useAuthStore";
import backaro from "../../assets/img/backaro.svg";
import "./insights.css";

const Insights = () => {
  const { id } = useParams();
  const location = useLocation();
  const [surveyData, setSurveyData] = useState(location.state?.surveyData);
  const [loading, setLoading] = useState(!surveyData);
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
      } catch (error) {
        toast.error(error.message || "Error fetching insights");
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyInsights();
  }, [id, authToken]);

  if (loading) return <div className="loading">Loading insights...</div>;
  if (!surveyData) return <div className="error">Failed to load survey data</div>;

  const participationData = [
    { name: 'Completed', value: surveyData.participantCounts.filled },
    { name: 'Remaining', value: surveyData.participantCounts.remaining }
  ];

  return (
    <section className="insights">
      <div className="insights-inner wrap">
        <div className="insights-header">
          <Link to="/dashboard">
            <img src={backaro} className="backaro" alt="Back" />
          </Link>
          <h2>{surveyData.title} - Insights</h2>
        </div>

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

          {/* Questions Analysis */}
          <div className="questions-analysis">
            <h3>Questions Analysis</h3>
            {surveyData.questions.map((question, index) => (
              <div key={question._id} className="question-card">
                <h4>Q{index + 1}: {question.questionText}</h4>
                <div className="question-stats">
                  <p>Total Responses: {question.analytics.totalResponses}</p>
                  {question.questionType === 'multiple_choice' && (
                    <div className="response-distribution">
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={question.options.map(opt => ({
                          option: opt.text,
                          responses: question.answers.filter(a => a.response === opt.text).length
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="option" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="responses" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Insights; 