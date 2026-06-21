import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Calendar, Activity, UserMinus } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import config from '../../config/config';

const AnalyticsContextDrawer = ({ surveyId, authToken }) => {
  const [trendsData, setTrendsData] = useState([]);
  const [funnelData, setFunnelData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContextData = async () => {
      try {
        setLoading(true);

        // Fetch Trends
        const trendsRes = await fetch(`${config.API_URL}/surveys/${surveyId}/analytics/trends?timeframe=weekly`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        // Fetch Engagement
        const engagementRes = await fetch(`${config.API_URL}/analytics/engagement`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });

        if (trendsRes.ok) {
          const trendsJson = await trendsRes.json();
          setTrendsData(trendsJson.data || trendsJson.trends || []);
        }

        if (engagementRes.ok) {
          const engagementJson = await engagementRes.json();
          // Filter engagement funnel to match this specific survey if possible, 
          // or use the global one if the backend doesn't support survey scoping.
          setFunnelData(engagementJson.data || engagementJson.engagement || engagementJson.funnel || []);
        }

      } catch (err) {
        console.error("Error fetching context data", err);
      } finally {
        setLoading(false);
      }
    };

    if (surveyId && authToken) {
      fetchContextData();
    }
  }, [surveyId, authToken]);

  if (loading) {
    return (
      <div className="h-[600px] bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
        <div className="space-y-4">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[600px] overflow-hidden"
    >
      <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          Engagement Insights
        </h3>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
        
        {/* Drop-off Funnel */}
        <div className="mb-8">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <UserMinus className="w-4 h-4" /> Funnel Drop-off
          </h4>
          
          {funnelData.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No funnel data available</p>
          ) : (
            <div className="space-y-3">
              {funnelData.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{item.step || item.name}</span>
                    <span className="text-gray-500 dark:text-gray-400">{item.count || item.value} ({item.percentage || 0}%)</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage || 0}%` }}
                      transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                      className={`h-full rounded-full ${
                        idx === funnelData.length - 1 ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                    ></motion.div>
                  </div>
                  {idx < funnelData.length - 1 && (
                    <div className="absolute -bottom-3 right-2 text-[10px] text-red-500 flex items-center">
                      ↓ {((funnelData[idx].percentage || 0) - (funnelData[idx+1]?.percentage || 0)).toFixed(1)}% drop
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Period Comparison Trend */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Response Trends
            </h4>
            <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full font-medium">
              vs Prev. Period
            </span>
          </div>
          
          {trendsData.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No trend data available</p>
          ) : (
            <>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendsData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="current" 
                      name="Current"
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      dot={{r: 3}}
                      activeDot={{ r: 5 }} 
                    />
                    {trendsData[0]?.previous !== undefined && (
                      <Line 
                        type="monotone" 
                        dataKey="previous" 
                        name="Previous"
                        stroke="#d1d5db" 
                        strokeWidth={2} 
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {trendsData[0]?.previous !== undefined && (
                <div className="mt-4 flex items-center justify-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="text-gray-600 dark:text-gray-400">Current</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                    <span className="text-gray-600 dark:text-gray-400">Previous</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default AnalyticsContextDrawer;
