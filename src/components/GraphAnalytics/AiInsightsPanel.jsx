import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import config from '../../config/config';
import ExportToolbar from './ExportToolbar';

const AiInsightsPanel = ({ surveyId, authToken }) => {
  const [analysisType, setAnalysisType] = useState('Descriptive');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const reportRef = useRef(null);

  const analysisTypes = [
    { id: 'Descriptive', title: 'Descriptive', desc: 'What happened? (Means, frequencies)' },
    { id: 'Diagnostic', title: 'Diagnostic', desc: 'Why did it happen? (Anomalies, patterns)' },
    { id: 'Predictive', title: 'Predictive', desc: 'What is likely to happen? (Forecasts)' },
    { id: 'Prescriptive', title: 'Prescriptive', desc: 'What should we do? (Recommendations)' },
    { id: 'Customer', title: 'Customer Analysis', desc: 'Customer behavior and demographics' },
    { id: 'Market', title: 'Market Analysis', desc: 'Market trends and competitive shifts' },
    { id: 'Financial', title: 'Financial Analysis', desc: 'Revenue, costs, willingness to pay' },
    { id: 'Operational', title: 'Operational Analysis', desc: 'Efficiency and bottleneck identification' },
    { id: 'Inferential', title: 'Inferential Stats', desc: 'Population inferences from sample' },
    { id: 'Correlation', title: 'Correlation', desc: 'Relationships between variables' }
  ];

  const generateReport = async () => {
    if (!surveyId || !authToken) return;
    
    setLoading(true);
    setError('');
    setReport('');
    setIsDrawerOpen(false);

    try {
      const res = await fetch(`${config.API_URL}/surveys/${surveyId}/analytics/ai-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ analysisType })
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.msg || 'Failed to generate report');
      }

      setReport(json.data.markdownReport);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while connecting to the AI service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 min-h-[500px]">
        
        {/* Sidebar: Analysis Type Selection */}
        <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-100 dark:border-gray-700 pr-0 md:pr-6 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-xl">✨</span> AI Frameworks
          </h2>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 mb-6">
            {analysisTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setAnalysisType(type.id);
                  setReport('');
                }}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  analysisType === type.id 
                    ? 'bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 shadow-sm' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
                }`}
              >
                <div className={`font-semibold text-sm ${analysisType === type.id ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  {type.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {type.desc}
                </div>
              </button>
            ))}
          </div>

          <button 
            onClick={generateReport}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing Data...
              </>
            ) : (
              <>Generate Analysis</>
            )}
          </button>
        </div>

        {/* Main Content: Markdown Report Viewer */}
        <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col relative">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-blue-100 dark:border-gray-700 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-2xl">✨</div>
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-600 dark:text-gray-200">Google Gemini is analyzing the responses...</p>
                <p className="text-sm mt-2 max-w-sm text-gray-500 dark:text-gray-400">This might take a few seconds depending on the size of your survey and the complexity of the analytical framework.</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-xl border border-red-100 dark:border-red-800 text-center max-w-md shadow-sm">
                <div className="text-3xl mb-3">⚠️</div>
                <h3 className="font-bold text-lg mb-2">Analysis Failed</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : report ? (
            <div className="flex-1 flex flex-col bg-gray-50 dark:bg-slate-800/80 rounded-xl border border-gray-200 dark:border-slate-700 p-6 md:p-8 relative overflow-hidden shadow-inner">
              {/* Top Accent Gradient */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </span>
                  Executive Summary
                </h3>
              </div>
              
              {/* Snippet Viewer with fade-out */}
              <div className="relative flex-1 w-full max-h-[280px] overflow-hidden rounded-md">
                <article className="prose prose-blue dark:prose-invert max-w-none text-gray-800 dark:text-gray-100 prose-headings:text-gray-900 dark:prose-headings:text-white prose-strong:text-gray-900 dark:prose-strong:text-white">
                  <ReactMarkdown>{report}</ReactMarkdown>
                </article>
                {/* Fade out gradient for collapsed view */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-50 dark:from-slate-800 to-transparent pointer-events-none"></div>
              </div>
              
              <div className="mt-6 flex justify-center border-t border-gray-200 dark:border-slate-700 pt-6">
                <button 
                  onClick={() => setIsDrawerOpen(true)}
                  className="px-6 py-2.5 bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold text-sm rounded-full shadow border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 hover:shadow-md transition-all flex items-center gap-2 group"
                >
                  Read Full Report 
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <div className="text-6xl mb-4 opacity-50 grayscale">🤖</div>
              <h3 className="font-medium text-gray-600 dark:text-gray-300 text-lg mb-2">Ready to generate insights</h3>
              <p className="text-sm text-center max-w-sm text-gray-500 dark:text-gray-400">Select an analytical framework from the sidebar and click "Generate Analysis" to have Gemini process your survey data.</p>
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Drawer for Full Report */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop with fade-in */}
          <div 
            className="fixed inset-0 bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setIsDrawerOpen(false)}
          ></div>
          
          {/* Drawer Panel sliding from right */}
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-[slideInRight_0.3s_ease-out] border-l border-gray-200 dark:border-slate-700">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                    Full AI Analysis
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5 uppercase tracking-wider">
                    {analysisTypes.find(t => t.id === analysisType)?.title || 'Report'} Framework
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ExportToolbar 
                  targetRef={reportRef} 
                  fileName={`AI_Analysis_${analysisType}`} 
                  textToCopy={report} 
                />
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Close panel"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            
            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-gray-50 dark:bg-slate-900" ref={reportRef}>
              <article className="prose prose-blue dark:prose-invert max-w-none text-gray-800 dark:text-gray-100 prose-headings:text-gray-900 dark:prose-headings:text-white prose-strong:text-gray-900 dark:prose-strong:text-white prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-li:marker:text-gray-400 dark:prose-li:marker:text-gray-500">
                <ReactMarkdown>{report}</ReactMarkdown>
              </article>
            </div>
          </div>
        </div>
      )}

      {/* Add custom animations for the drawer if not already in tailwind config */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}} />
    </>
  );
};

export default AiInsightsPanel;

