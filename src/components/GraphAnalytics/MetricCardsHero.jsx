import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, Clock, TrendingDown } from 'lucide-react';
import config from '../../config/config';

const MetricCard = ({ title, value, icon: Icon, trend, trendValue, delay }) => {
  const isPositive = trend === 'up';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
      <div className="flex items-baseline gap-2 mt-auto">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
      </div>
      {trendValue && (
        <div className="mt-2 text-sm flex items-center gap-1">
          <span
            className={`font-medium ${
              isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {isPositive ? '↑' : '↓'} {trendValue}
          </span>
          <span className="text-gray-400 dark:text-gray-500">vs last week</span>
        </div>
      )}
    </motion.div>
  );
};

const MetricCardsHero = ({ surveyId, authToken }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${config.API_URL}/surveys/${surveyId}/analytics/overview`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const json = await res.json();
        if (res.ok) {
          setData(json.data || json); // Adjust depending on response format
        }
      } catch (err) {
        console.error("Error fetching overview", err);
      } finally {
        setLoading(false);
      }
    };

    if (surveyId && authToken) {
      fetchOverview();
    }
  }, [surveyId, authToken]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 h-32 animate-pulse border border-gray-100 dark:border-gray-700"></div>
        ))}
      </div>
    );
  }

  // Fallback to 0 if API data is missing properties
  const metrics = {
    totalResponses: data?.totalResponses || 0,
    completionRate: `${data?.completionRate || 0}%`,
    avgTime: data?.averageCompletionTime || '0m 0s',
    bounceRate: `${data?.bounceRate || 0}%`,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Total Responses"
        value={metrics.totalResponses}
        icon={Users}
        trend="up"
        trendValue="0%" // Could come from API if implemented
        delay={0.1}
      />
      <MetricCard
        title="Completion Rate"
        value={metrics.completionRate}
        icon={CheckCircle}
        trend="up"
        trendValue="0%"
        delay={0.2}
      />
      <MetricCard
        title="Avg. Completion Time"
        value={metrics.avgTime}
        icon={Clock}
        trend="down"
        trendValue="0s"
        delay={0.3}
      />
      <MetricCard
        title="Bounce Rate"
        value={metrics.bounceRate}
        icon={TrendingDown}
        trend="down"
        trendValue="0%"
        delay={0.4}
      />
    </div>
  );
};

export default MetricCardsHero;
