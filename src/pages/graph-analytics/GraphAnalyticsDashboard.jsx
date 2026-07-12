import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart2, Calendar, Users, PieChart as PieChartIcon, GitMerge, Calculator, Network } from 'lucide-react';
import { toast } from 'react-toastify';
import config from '../../config/config';
import useAuthStore from '../../store/useAuthStore';

import MetricCardsHero from '../../components/GraphAnalytics/MetricCardsHero';
import GraphVisualizer from '../../components/GraphAnalytics/GraphVisualizer';

const GraphAnalyticsDashboard = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const authToken = useAuthStore((state) => state.authToken);
  
  const [surveysList, setSurveysList] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(!surveyId);
  const [activeTab, setActiveTab] = useState('basic'); // basic, cross, stats, advanced

  // If no surveyId is provided, we fetch the list of surveys to let the user select one.
  useEffect(() => {
    if (surveyId) {
      setLoadingInitial(false);
      return;
    }

    const fetchMySurveys = async () => {
      try {
        setLoadingInitial(true);
        const res = await fetch(`${config.API_URL}/my-surveys`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || 'Failed to load surveys');
        
        setSurveysList(data.mySurveys || []);
      } catch (err) {
        toast.error('Error loading surveys for analytics');
      } finally {
        setLoadingInitial(false);
      }
    };

    if (authToken) {
      fetchMySurveys();
    }
  }, [surveyId, authToken]);

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  // --- VIEW 1: SURVEY LIST SELECTION ---
  if (!surveyId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <Link 
                to="/dashboard" 
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 mb-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Select a Survey
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Choose a survey to view its detailed graph analytics.
              </p>
            </div>
          </div>

          {surveysList.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md mx-auto w-full mt-10 border border-gray-100">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No surveys yet</h3>
              <p className="text-gray-500 mb-6">Create and publish your first survey to start seeing analytics here.</p>
              <Link to="/postsurvey" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                Create a Survey
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {surveysList.map((survey) => (
                <div 
                  key={survey._id} 
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col"
                  onClick={() => navigate(`/analytics/${survey._id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-2 leading-tight">
                      {survey.title}
                    </h3>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg shrink-0 ml-4">
                      <BarChart2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-1">
                    {survey.description || 'No description provided.'}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-50 dark:border-gray-700 pt-4 mt-auto">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>{survey.participantCounts?.filled || 0} Responses</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {survey.createdAt ? new Date(survey.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- VIEW 2: DETAILED GRAPH ANALYTICS FOR A SPECIFIC SURVEY ---
  const tabs = [
    { id: 'basic', label: 'Basic Analytics', icon: <PieChartIcon className="w-4 h-4" />, desc: 'Single Question Distribution' },
    { id: 'cross', label: 'Cross-Tabulation', icon: <GitMerge className="w-4 h-4" />, desc: 'Compare Two Questions' },
    { id: 'stats', label: 'Statistical Summary', icon: <Calculator className="w-4 h-4" />, desc: 'Box Plots & Outliers' },
    { id: 'advanced', label: 'Advanced Insights', icon: <Network className="w-4 h-4" />, desc: 'Machine Learning & Clustering' },
    { id: 'ai', label: 'Data Analyst', icon: <span className="text-lg leading-none">✨</span>, desc: 'Automated Insight Reports' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <Link 
              to="/analytics" 
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Survey List
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Survey Analytics
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Interactive visualizations for your survey questions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
              Export CSV
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
              Share Report
            </button>
          </div>
        </div>

        {/* 1. Hero Section (Analytics Cards) */}
        <MetricCardsHero surveyId={surveyId} authToken={authToken} />

        {/* 2. Tab Navigation */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <div className="flex space-x-6 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 pt-2 flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <div className="text-left">
                  <div className="font-semibold text-sm">{tab.label}</div>
                  <div className={`text-xs ${activeTab === tab.id ? 'text-blue-500/80' : 'text-gray-400'}`}>
                    {tab.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Main Graph Visualization */}
        <div className="w-full">
          <GraphVisualizer surveyId={surveyId} authToken={authToken} activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
};

export default GraphAnalyticsDashboard;
