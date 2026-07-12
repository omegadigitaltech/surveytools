import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Treemap, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, 
  AreaChart as AreaChartIcon, Map, Network, Waypoints, BoxSelect, 
  AlignVerticalSpaceAround, AlignEndVertical, ScatterChart as ScatterIcon, Layers, GitMerge
} from 'lucide-react';
import config from '../../config/config';

import Tree from 'react-d3-tree';
import ForceGraph2D from 'react-force-graph-2d';
import DendrogramD3 from './DendrogramD3';
import TreemapD3 from './TreemapD3';
import AiInsightsPanel from './AiInsightsPanel';
import ExportToolbar from './ExportToolbar';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#84cc16'];

const GraphVisualizer = ({ surveyId, authToken, activeTab = 'basic' }) => {
  const [graphType, setGraphType] = useState('bar');
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState('');
  const [crossQuestionId, setCrossQuestionId] = useState('');
  const [graphData, setGraphData] = useState([]);
  const [rawPayload, setRawPayload] = useState(null); // For complex responses
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const graphRef = useRef(null);

  // Force default graphType when tab changes
  useEffect(() => {
    if (activeTab === 'basic') setGraphType('bar');
    else if (activeTab === 'cross') setGraphType('stacked_bar');
    else if (activeTab === 'stats') setGraphType('box_plot');
    else if (activeTab === 'advanced') setGraphType('dendrogram');
  }, [activeTab]);

  // Fetch survey questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoadingQuestions(true);
        const res = await fetch(`${config.API_URL}/surveys/${surveyId}/info`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const json = await res.json();
        
        if (res.ok) {
          const surveyQs = json.survey?.questions || json.data?.questions || json.questions || [];
          setQuestions(surveyQs);
          if (surveyQs.length > 0) {
            setSelectedQuestionId(surveyQs[0]._id || surveyQs[0].id);
            if (surveyQs.length > 1) {
              setCrossQuestionId(surveyQs[1]._id || surveyQs[1].id);
            } else {
              setCrossQuestionId(surveyQs[0]._id || surveyQs[0].id);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching questions", err);
      } finally {
        setLoadingQuestions(false);
      }
    };

    if (surveyId && authToken) {
      fetchQuestions();
    }
  }, [surveyId, authToken]);

  // Fetch graph data
  useEffect(() => {
    const fetchGraphData = async () => {
      // Advanced graphs might not need questionId
      if (!selectedQuestionId && activeTab !== 'advanced' && activeTab !== 'ai') return;
      if (activeTab === 'ai') return; // AI panel handles its own fetching
      
      try {
        setLoadingData(true);
        let url = `${config.API_URL}/surveys/${surveyId}/visualizations?graphType=${graphType}`;
        if (selectedQuestionId) url += `&questionId=${selectedQuestionId}`;
        if ((activeTab === 'cross' || graphType === 'inferential_stats') && crossQuestionId) {
          url += `&crossQuestionId=${crossQuestionId}`;
        }

        const res = await fetch(url, { headers: { Authorization: `Bearer ${authToken}` } });
        const json = await res.json();
        
        if (res.ok) {
          const fetchedData = json.data || json.visualizations || json;
          setRawPayload(fetchedData);
          
          let parsedData = [];
          
          // Basic Parsing
          if (fetchedData.labels && fetchedData.values) {
            parsedData = fetchedData.labels.map((label, index) => ({
              name: label,
              date: label,
              count: fetchedData.values[index],
              value: fetchedData.values[index],
              responses: fetchedData.values[index]
            }));
          } 
          // Intermediate Cross-Tab Parsing
          else if (fetchedData.labels && fetchedData.datasets) {
             parsedData = fetchedData.labels.map((label, idx) => {
               const obj = { name: label };
               fetchedData.datasets.forEach(ds => {
                 obj[ds.label] = ds.data[idx];
               });
               return obj;
             });
          }
          // Scatter Parsing
          else if (fetchedData.points) {
            parsedData = fetchedData.points;
          }
          // Array parsing
          else if (Array.isArray(fetchedData)) {
            parsedData = fetchedData;
          }
          
          setGraphData(parsedData);
        } else {
          setGraphData([]);
          setRawPayload(null);
        }
      } catch (err) {
        console.error("Error fetching visualizations", err);
        setGraphData([]);
        setRawPayload(null);
      } finally {
        setLoadingData(false);
      }
    };

    if (surveyId && authToken && (selectedQuestionId || activeTab === 'advanced')) {
      fetchGraphData();
    }
  }, [surveyId, authToken, selectedQuestionId, crossQuestionId, graphType, activeTab]);

  if (activeTab === 'ai') {
    return (
      <div className="w-full">
        <AiInsightsPanel surveyId={surveyId} authToken={authToken} />
      </div>
    );
  }

  const CustomizedTreemapContent = (props) => {
    const { root, depth, x, y, width, height, index, payload, name } = props;
    if (depth !== 1) return null; // Only draw the children, not the root container
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: COLORS[index % COLORS.length],
            stroke: '#fff',
            strokeWidth: 2,
            strokeOpacity: 1,
          }}
        />
        {width > 30 && height > 30 ? (
          <text x={x + width / 2} y={y + height / 2 + 5} textAnchor="middle" fill="#fff" fontSize={14} className="font-medium truncate">
            {name || (payload && payload.name)}
          </text>
        ) : null}
      </g>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-50">
          <p className="font-bold text-gray-900 dark:text-white mb-2 pb-1 border-b border-gray-100 dark:border-gray-700">{label || payload[0].payload.name}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="font-medium">{entry.name}:</span> {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderGraph = () => {
    if (loadingData || loadingQuestions) {
      return (
        <div className="h-[450px] w-full flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (!rawPayload && (!graphData || graphData.length === 0)) {
      return (
        <div className="h-[450px] w-full flex items-center justify-center text-gray-500 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-4xl mb-3 opacity-50">📉</div>
            <p className="font-medium">No data available for this selection.</p>
            <p className="text-sm mt-1 opacity-70">Try selecting a different question or chart type.</p>
          </div>
        </div>
      );
    }

    // ─────────────────────────────────────────────────────────────
    // BASIC GRAPHS
    // ─────────────────────────────────────────────────────────────
    if (graphType === 'bar' || graphType === 'histogram') {
      return (
        <ResponsiveContainer width="100%" height={450}>
          <BarChart data={graphData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} tickMargin={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
            <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(0,0,0,0.05)'}} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={graphType === 'histogram' ? 80 : 40} animationDuration={1000}>
              {graphData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }
    if (graphType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={450}>
          <PieChart>
            <Pie
              data={graphData} cx="50%" cy="50%" innerRadius={80} outerRadius={140}
              paddingAngle={5} dataKey="value" nameKey="name" animationDuration={1000}
            >
              {graphData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      );
    }
    if (graphType === 'line' || graphType === 'area') {
      const ChartComponent = graphType === 'area' ? AreaChart : LineChart;
      return (
        <ResponsiveContainer width="100%" height={450}>
          <ChartComponent data={graphData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
            <RechartsTooltip content={<CustomTooltip />} />
            {graphType === 'area' ? (
              <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorResponses)" animationDuration={1000} />
            ) : (
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} animationDuration={1000} />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      );
    }
    if (graphType === 'treemap') {
      let treeData = (Array.isArray(rawPayload?.tree) ? rawPayload.tree : Array.isArray(graphData) ? graphData : []);
      const validTreeData = treeData.filter(d => d.value > 0);
      
      if (validTreeData.length === 0) {
        return (
          <div className="h-[450px] w-full flex flex-col items-center justify-center text-gray-500">
            <p>No valid data points greater than 0 to display Treemap.</p>
          </div>
        );
      }
      
      return (
        <div className="w-full h-[450px]">
          <TreemapD3 data={validTreeData} width={800} height={450} />
        </div>
      );
    }

    // ─────────────────────────────────────────────────────────────
    // INTERMEDIATE GRAPHS (Cross-Tabulation)
    // ─────────────────────────────────────────────────────────────
    if (graphType === 'stacked_bar' || graphType === 'clustered_bar') {
      const keys = rawPayload.datasets ? rawPayload.datasets.map(d => d.label) : [];
      return (
        <ResponsiveContainer width="100%" height={450}>
          <BarChart data={graphData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            {keys.map((key, index) => (
              <Bar 
                key={key} 
                dataKey={key} 
                stackId={graphType === 'stacked_bar' ? "a" : undefined} 
                fill={COLORS[index % COLORS.length]} 
                radius={graphType === 'stacked_bar' ? [0,0,0,0] : [4,4,0,0]}
                animationDuration={1000} 
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }
    if (graphType === 'scatter') {
      return (
        <ResponsiveContainer width="100%" height={450}>
          <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" dataKey="x" name="Question 1" tick={{fill: '#6b7280'}} />
            <YAxis type="number" dataKey="y" name="Question 2" tick={{fill: '#6b7280'}} />
            <RechartsTooltip cursor={{strokeDasharray: '3 3'}} content={<CustomTooltip />} />
            <Scatter name="Responses" data={graphData} fill="#8884d8">
              {graphData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    if (graphType === 'heatmap') {
      const keys = rawPayload?.datasets ? rawPayload.datasets.map(d => d.label) : [];
      let maxValue = 0;
      graphData.forEach(row => {
        keys.forEach(k => {
          if (row[k] > maxValue) maxValue = row[k];
        });
      });

      return (
        <div className="w-full h-[450px] overflow-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <table className="w-full text-sm text-center border-collapse min-w-[600px]">
            <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10">
              <tr>
                <th className="p-4 border-b-2 border-r border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-300 text-left w-1/4 uppercase tracking-wider text-xs">
                  Cross-Tabulation
                </th>
                {keys.map(k => (
                  <th key={k} className="p-4 border-b-2 border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-xs">
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {graphData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="p-4 border-r border-b border-gray-100 dark:border-gray-700 font-medium text-left text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800">
                    {row.name}
                  </td>
                  {keys.map(k => {
                    const val = row[k] || 0;
                    const intensity = maxValue === 0 ? 0 : val / maxValue;
                    const bgColor = val === 0 ? 'transparent' : `rgba(59, 130, 246, ${Math.max(0.1, intensity * 0.9)})`;
                    const textColor = intensity > 0.6 ? '#ffffff' : '';
                    return (
                      <td key={k} className="p-4 border-b border-gray-100 dark:border-gray-700 transition-all duration-300" style={{ backgroundColor: bgColor, color: textColor }}>
                        <span className="font-semibold text-base">{val > 0 ? val : '-'}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // ─────────────────────────────────────────────────────────────
    // STATISTICAL GRAPHS
    // ─────────────────────────────────────────────────────────────
    if (graphType === 'box_plot') {
      const stats = rawPayload || {};
      return (
        <div className="h-[450px] w-full flex items-center justify-center">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full">
            {[
              { label: 'Minimum', value: stats.min, color: 'bg-blue-100 text-blue-700 border-blue-200' },
              { label: '25th Percentile (Q1)', value: stats.q1, color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
              { label: 'Median', value: stats.median, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
              { label: '75th Percentile (Q3)', value: stats.q3, color: 'bg-orange-100 text-orange-700 border-orange-200' },
              { label: 'Maximum', value: stats.max, color: 'bg-rose-100 text-rose-700 border-rose-200' }
            ].map(stat => (
              <div key={stat.label} className={`p-6 rounded-2xl border flex flex-col items-center justify-center shadow-sm ${stat.color}`}>
                <div className="text-4xl font-bold mb-2">{stat.value !== undefined ? stat.value : '-'}</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-center opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (graphType === 'inferential_stats') {
      const result = rawPayload || {};

      if (result.error) {
         return (
           <div className="h-[450px] w-full flex items-center justify-center flex-col bg-rose-50 border border-rose-200 rounded-xl text-rose-700 p-8 text-center">
             <h3 className="text-xl font-bold mb-2">Analysis Failed</h3>
             <p className="mb-4 text-sm max-w-md">{result.error}</p>
           </div>
         );
      }
      
      if (!result.testName) {
        return <div className="h-[450px] w-full flex items-center justify-center text-gray-500">Calculating advanced statistical inference... (Select a secondary question if needed)</div>;
      }
      
      return (
        <div className="h-[450px] w-full flex flex-col justify-center max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-sm p-10 flex flex-col items-center text-center transform transition-all hover:scale-[1.02]">
            <div className="bg-amber-100 text-amber-700 px-5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-8 shadow-inner border border-amber-200">
              {result.testName}
            </div>
            
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-10 leading-tight">
              {result.interpretation}
            </h3>
            
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl px-8 py-5 w-full flex flex-col items-center shadow-inner">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">APA Citable Format</span>
              <code className="text-xl font-mono text-gray-800 dark:text-gray-200 select-all tracking-wide">{result.apa}</code>
            </div>
          </div>
        </div>
      );
    }

    // ─────────────────────────────────────────────────────────────
    // ADVANCED GRAPHS
    // ─────────────────────────────────────────────────────────────
    if (graphType === 'dendrogram') {
      const dendroData = rawPayload;

      if (!dendroData || !dendroData.name || !Array.isArray(dendroData.children)) {
        return <div className="h-[450px] w-full flex items-center justify-center text-gray-500">Computing cluster dendrogram...</div>;
      }
      return (
        <div style={{ width: '100%', height: '450px' }} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-inner relative">
          <style>{`
            .rd3t-link {
              stroke: #9ca3af !important;
              stroke-width: 1.5px !important;
            }
            .dark .rd3t-link {
              stroke: #4b5563 !important;
            }
          `}</style>
          <p className="absolute bottom-4 right-4 z-10 text-gray-400 font-medium text-xs opacity-50 pointer-events-none">Scroll to zoom, Drag to pan</p>
          <DendrogramD3 data={dendroData} width={800} height={450} />
        </div>
      );
    }
    
    if (graphType === 'network') {
      const netData = {
        nodes: Array.isArray(rawPayload?.nodes) ? rawPayload.nodes : [],
        links: Array.isArray(rawPayload?.links) ? rawPayload.links : []
      };

      if (netData.nodes.length === 0) {
        return <div className="h-[450px] w-full flex items-center justify-center text-gray-500">Mapping network relationships...</div>;
      }

      return (
        <div className="w-full h-[450px] bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden relative flex justify-center items-center shadow-inner cursor-move">
          <p className="absolute bottom-4 right-4 z-10 text-gray-400 font-medium text-xs opacity-50 pointer-events-none">Force Directed Graph (Drag nodes to interact)</p>
          <ForceGraph2D 
            graphData={netData} 
            width={800} 
            height={450} 
            nodeAutoColorBy="group"
            linkColor={() => document.documentElement.classList.contains('dark') ? '#4b5563' : '#cbd5e1'}
            linkWidth={1.5}
            linkDirectionalArrowLength={3.5}
            linkDirectionalArrowRelPos={1}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.label || node.id;
              const fontSize = 12 / globalScale;
              
              // Draw node circle
              const nodeR = 6;
              ctx.beginPath();
              ctx.arc(node.x, node.y, nodeR, 0, 2 * Math.PI, false);
              ctx.fillStyle = node.group === 'question' ? '#3b82f6' : '#10b981'; // Blue for questions, Green for answers
              ctx.fill();
              ctx.strokeStyle = '#fff';
              ctx.lineWidth = 1.5 / globalScale;
              ctx.stroke();

              // Draw text label
              ctx.font = `500 ${fontSize}px Inter, Sans-Serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'top';
              ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151';
              ctx.fillText(label, node.x, node.y + nodeR + 4 / globalScale);
              
              node.__bckgDimensions = [nodeR * 2, nodeR * 2]; // For hit-detection
            }}
            nodePointerAreaPaint={(node, color, ctx) => {
              ctx.fillStyle = color;
              const bckgDimensions = node.__bckgDimensions;
              bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
            }}
          />
        </div>
      );
    }

    if (graphType === 'map') {
      return (
        <div className="h-[450px] w-full flex items-center justify-center flex-col">
          <Map className="w-16 h-16 text-emerald-500 mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-2">Geospatial Distribution</h3>
          <div className="flex gap-2 flex-wrap max-w-md justify-center">
            {rawPayload?.locations?.map((loc, i) => (
              <span key={i} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                {loc.name}: {loc.value} responses
              </span>
            ))}
            {(!rawPayload?.locations || rawPayload.locations.length === 0) && (
              <span className="text-gray-500">No location data found in survey.</span>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  const FallbackMsg = ({ lib, cmd }) => (
    <div className="h-[450px] w-full flex items-center justify-center flex-col bg-rose-50 border border-rose-200 rounded-xl text-rose-700 p-8 text-center">
      <BoxSelect className="w-12 h-12 mb-4 opacity-50" />
      <h3 className="text-xl font-bold mb-2">Missing Library: {lib}</h3>
      <p className="mb-4 text-sm max-w-md">This advanced visualization requires a third-party library to render. Please run the following command in your terminal:</p>
      <code className="bg-white px-4 py-2 rounded-lg font-mono text-sm border shadow-sm select-all">{cmd}</code>
      <p className="mt-4 text-xs opacity-70">Restart your frontend server after installing.</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          
          {/* Question Selectors */}
          <div className="flex-1 w-full max-w-2xl flex flex-col sm:flex-row gap-4">
            {(activeTab === 'basic' || activeTab === 'cross' || activeTab === 'stats') && (
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-1.5 block tracking-wider">PRIMARY QUESTION</label>
                <select 
                  value={selectedQuestionId}
                  onChange={(e) => setSelectedQuestionId(e.target.value)}
                  disabled={loadingQuestions || questions.length === 0}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none shadow-sm transition-all"
                >
                  {questions.length === 0 && <option value="">No questions available</option>}
                  {questions.map((q) => (
                    <option key={q._id || q.id} value={q._id || q.id}>
                      {q.question_title?.length > 60 ? `${q.question_title.substring(0, 60)}...` : q.question_title || q.questionText || q.text || 'Untitled Question'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(activeTab === 'cross' || (activeTab === 'stats' && graphType === 'inferential_stats')) && (
              <div className="flex-1">
                <label className="text-xs text-indigo-500 dark:text-indigo-400 font-bold mb-1.5 block tracking-wider flex items-center gap-1">
                  <GitMerge className="w-3 h-3" /> COMPARE WITH
                </label>
                <select 
                  value={crossQuestionId}
                  onChange={(e) => setCrossQuestionId(e.target.value)}
                  disabled={loadingQuestions || questions.length < 2}
                  className="w-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 outline-none shadow-sm transition-all"
                >
                  {questions.length < 2 && <option value="">Need at least 2 questions</option>}
                  {questions.filter(q => (q._id || q.id) !== selectedQuestionId).map((q) => (
                    <option key={q._id || q.id} value={q._id || q.id}>
                      {q.question_title?.length > 40 ? `${q.question_title.substring(0, 40)}...` : q.question_title || q.questionText || q.text || 'Untitled Question'}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {activeTab === 'advanced' && (
              <div className="flex-1">
                <label className="text-xs text-emerald-500 dark:text-emerald-400 font-bold mb-1.5 block tracking-wider">SURVEY WIDE ANALYSIS</label>
                <div className="w-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-sm rounded-xl p-3 shadow-sm">
                  These machine learning models analyze the entire survey simultaneously.
                </div>
              </div>
            )}
          </div>

          {/* Graph Type Toggles */}
          <div className="flex flex-wrap bg-white dark:bg-gray-900 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            {activeTab === 'basic' && [
              { id: 'bar', icon: <BarChart3 className="w-4 h-4" />, label: 'Bar' },
              { id: 'pie', icon: <PieChartIcon className="w-4 h-4" />, label: 'Pie' },
              { id: 'line', icon: <LineChartIcon className="w-4 h-4" />, label: 'Line' },
              { id: 'area', icon: <AreaChartIcon className="w-4 h-4" />, label: 'Area' },
              { id: 'histogram', icon: <AlignEndVertical className="w-4 h-4" />, label: 'Hist' },
              { id: 'treemap', icon: <Layout className="w-4 h-4" />, label: 'Tree' }
            ].map(t => (
              <button key={t.id} onClick={() => setGraphType(t.id)} className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all ${graphType === t.id ? 'bg-blue-600 text-white shadow-md scale-105' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                {t.icon} <span className="hidden xl:inline">{t.label}</span>
              </button>
            ))}

            {activeTab === 'cross' && [
              { id: 'stacked_bar', icon: <Layers className="w-4 h-4" />, label: 'Stacked' },
              { id: 'clustered_bar', icon: <AlignVerticalSpaceAround className="w-4 h-4" />, label: 'Grouped' },
              { id: 'heatmap', icon: <Map className="w-4 h-4" />, label: 'Heatmap' },
              { id: 'scatter', icon: <ScatterIcon className="w-4 h-4" />, label: 'Scatter' },
            ].map(t => (
              <button key={t.id} onClick={() => setGraphType(t.id)} className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all ${graphType === t.id ? 'bg-indigo-600 text-white shadow-md scale-105' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                {t.icon} <span className="hidden xl:inline">{t.label}</span>
              </button>
            ))}

            {activeTab === 'advanced' && [
              { id: 'dendrogram', icon: <Waypoints className="w-4 h-4" />, label: 'Dendrogram' },
              { id: 'network', icon: <Network className="w-4 h-4" />, label: 'Network' },
              { id: 'map', icon: <Map className="w-4 h-4" />, label: 'Map' },
            ].map(t => (
              <button key={t.id} onClick={() => setGraphType(t.id)} className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all ${graphType === t.id ? 'bg-emerald-600 text-white shadow-md scale-105' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                {t.icon} <span className="hidden xl:inline">{t.label}</span>
              </button>
            ))}
            
            {activeTab === 'stats' && [
              { id: 'box_plot', icon: <BoxSelect className="w-4 h-4" />, label: '5-Number Summary' },
              { id: 'inferential_stats', icon: <Network className="w-4 h-4" />, label: 'Inferential Tests' }
            ].map(t => (
              <button key={t.id} onClick={() => setGraphType(t.id)} className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all ${graphType === t.id ? 'bg-amber-600 text-white shadow-md scale-105' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                {t.icon} <span className="hidden xl:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full p-6 relative bg-white dark:bg-gray-800" ref={graphRef}>
        <ExportToolbar 
          targetRef={graphRef} 
          fileName={`Survey_Graph_${graphType}`} 
        />
        {renderGraph()}
      </div>
    </motion.div>
  );
};

// Quick fix for icon import missing Layout
const Layout = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>;

export default GraphVisualizer;
