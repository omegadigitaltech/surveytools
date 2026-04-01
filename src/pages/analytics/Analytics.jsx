import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { toast } from "react-toastify";
import config from "../../config/config";
import useAuthStore from "../../store/useAuthStore";
import backaro from "../../assets/img/backaro.svg";
import "./analytics.css";
// TEMP MOCK DATA
import { mockAnalyticsSurveys } from "../../utils/content/mockAnalytics";

const TIME_FILTERS = [
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
  { label: "3M", value: 90 },
  { label: "All", value: null },
];

// ── helpers 

const filterByDays = (surveys, days) => {
  if (!days) return surveys;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return surveys.filter((s) => new Date(s.createdAt) >= cutoff);
};

/** Build daily response-count timeline from submittedUsers timestamps */
const buildTimeline = (surveys) => {
  const counts = {};
  surveys.forEach((s) => {
    (s.submittedUsers || []).forEach((entry) => {
      const ts = entry?.submittedAt || entry?.createdAt;
      if (!ts) return;
      const day = new Date(ts).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      });
      counts[day] = (counts[day] || 0) + 1;
    });
    // Fallback: if submittedUsers has no timestamps, spread across createdAt date
    if (
      (s.submittedUsers || []).length > 0 &&
      !(s.submittedUsers[0]?.submittedAt || s.submittedUsers[0]?.createdAt)
    ) {
      const day = new Date(s.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      });
      counts[day] = (counts[day] || 0) + (s.submittedUsers?.length || 0);
    }
  });
  return Object.entries(counts)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([date, responses]) => ({ date, responses }));
};

/** 7-point rolling average for trend line */
const addTrend = (data) =>
  data.map((d, i, arr) => {
    const window = arr.slice(Math.max(0, i - 3), i + 4);
    const avg = window.reduce((s, x) => s + x.responses, 0) / window.length;
    return { ...d, trend: Math.round(avg * 10) / 10 };
  });

// ── custom tooltip ────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="an-tooltip">
      <p className="an-tooltip-label">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ── circular progress 

const CircularProgress = ({ pct, size = 54 }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  const color =
    pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#6366f1";
  return (
    <svg width={size} height={size} className="an-ring">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle"
        fontSize={size < 60 ? 11 : 13} fontWeight="700" fill={color}>
        {pct}%
      </text>
    </svg>
  );
};

// ── stat card ─────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub }) => (
  <div className="an-stat-card">
    <p className="an-stat-label">{label}</p>
    <p className="an-stat-value">{value}</p>
    {sub && <p className="an-stat-sub">{sub}</p>}
  </div>
);

// ── main component ────────────────────────────────────────────────────────────

const Analytics = () => {
  const authToken = useAuthStore((s) => s.authToken);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(null); // null = All time

  useEffect(() => {
    const fetch_ = async () => {
      try {
        setLoading(true);
  
        // TEMP: Using mock data instead of API
        // TODO: Restore API call later
  
        setTimeout(() => {
          setSurveys(mockAnalyticsSurveys);
          setLoading(false);
        }, 800);
  
        /*
        // ORIGINAL API CALL (commented temporarily)
  
        const res = await fetch(`${config.API_URL}/surveys/my-surveys`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
  
        const data = await res.json();
  
        if (!res.ok)
          throw new Error(data.message || "Failed to load surveys");
  
        setSurveys(data.mySurveys || []);
        */
  
      } catch (err) {
        toast.error(err.message || "Error loading analytics");
        setLoading(false);
      }
    };
  
    fetch_();
  }, [authToken]);

  const filtered = useMemo(
    () => filterByDays(surveys, activeFilter),
    [surveys, activeFilter]
  );

  const timeline = useMemo(() => addTrend(buildTimeline(filtered)), [filtered]);

  const totalResponses = useMemo(
    () => filtered.reduce((s, sv) => s + (sv.submittedUsers?.length || 0), 0),
    [filtered]
  );

  const totalTarget = useMemo(
    () => filtered.reduce((s, sv) => s + (sv.no_of_participants || 0), 0),
    [filtered]
  );

  const overallPct =
    totalTarget > 0 ? Math.min(100, Math.round((totalResponses / totalTarget) * 100)) : 0;

  const avgCompletion =
    filtered.length > 0
      ? Math.round(
          filtered.reduce((s, sv) => {
            const pct = sv.no_of_participants
              ? Math.min(100, Math.round(((sv.submittedUsers?.length || 0) / sv.no_of_participants) * 100))
              : 0;
            return s + pct;
          }, 0) / filtered.length
        )
      : 0;

  if (loading)
    return (
      <section className="analytics">
        <div className="an-loading">
          <div className="an-spinner" />
          <p>Loading analytics…</p>
        </div>
      </section>
    );

  if (!surveys.length)
    return (
      <section className="analytics">
        <div className="an-empty">
          <div className="an-empty-icon">📊</div>
          <h3>No surveys yet</h3>
          <p>Create and publish your first survey to start seeing analytics here.</p>
          <Link to="/dashboard" className="an-cta-btn">Go to Dashboard</Link>
        </div>
      </section>
    );

  return (
    <section className="analytics">
      <div className="an-inner wrappp">

        {/* ── header */}
        <div className="an-header">
          <div className="an-header-left">
            <Link to="/dashboard">
              <img src={backaro} alt="Back" className="backaro" />
            </Link>
            <div>
              <h2 className="an-title">Analytics</h2>
              <p className="an-subtitle">
                {filtered.length} survey{filtered.length !== 1 ? "s" : ""} · All responses
              </p>
            </div>
          </div>

          {/* time filter */}
          <div className="an-filter-pills">
            {TIME_FILTERS.map((f) => (
              <button
                key={f.label}
                className={`an-pill ${activeFilter === f.value ? "active" : ""}`}
                onClick={() => setActiveFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── stat cards */}
        <div className="an-stats-row">
          <StatCard label="Total Responses" value={totalResponses} sub="across all surveys" />
          <StatCard label="Target Responses" value={totalTarget} sub="combined goal" />
          <StatCard
            label="Overall Progress"
            value={`${overallPct}%`}
            sub="responses vs target"
          />
          <StatCard
            label="Avg. Completion"
            value={`${avgCompletion}%`}
            sub="per survey"
          />
        </div>

        {/* ── charts row */}
        <div className="an-charts-row">

{/* Response Timeline */}
<div className="an-chart-card an-chart-wide">
  <div className="an-chart-header">
    <h3>Response Timeline</h3>
    <span className="an-chart-meta">Total responses per day</span>
  </div>
  {timeline.length > 0 ? (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={timeline} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="respGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2793CD" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#2793CD" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area
          type="monotone"
          dataKey="responses"
          name="Responses"
          stroke="#2793CD"
          fill="url(#respGrad)"
          strokeWidth={2}
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="trend"
          name="Trend"
          stroke="#961B1E"
          fill="none"
          strokeWidth={2}
          strokeDasharray="5 3"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  ) : (
    <div className="an-chart-empty">No response data for this period</div>
  )}
</div>

{/* Survey Response Bars */}
<div className="an-chart-card">
  <div className="an-chart-header">
    <h3>Responses per Survey</h3>
    <span className="an-chart-meta">Received vs target</span>
  </div>
  {filtered.length > 0 ? (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={filtered.map((s) => ({
          name: s.title.length > 14 ? s.title.slice(0, 14) + "…" : s.title,
          Received: s.submittedUsers?.length || 0,
          Target: s.no_of_participants || 0,
        }))}
        margin={{ top: 10, right: 10, left: -10, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" angle={-35} textAnchor="end" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Target" fill="#961B1E" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Received" fill="#2793CD" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  ) : (
    <div className="an-chart-empty">No surveys in this period</div>
  )}
</div>

</div>

        {/* ── survey progress */}
        <div className="an-progress-section">
          <div className="an-section-header">
            <h3>Survey Progress</h3>
            <span className="an-chart-meta">{filtered.length} surveys</span>
          </div>
          <div className="an-progress-grid">
            {filtered.map((s) => {
              const received = s.submittedUsers?.length || 0;
              const target = s.no_of_participants || 0;
              const pct = target > 0 ? Math.min(100, Math.round((received / target) * 100)) : 0;
              return (
                <div key={s._id} className="an-progress-card">
                  <div className="an-progress-info">
                    <p className="an-progress-title" title={s.title}>
                      {s.title.length > 28 ? s.title.slice(0, 28) + "…" : s.title}
                    </p>
                    <p className="an-progress-meta">
                      {received} / {target} Submitted
                    </p>
                    <div className="an-bar-wrap">
                      <div
                        className="an-bar-fill"
                        style={{
                          width: `${pct}%`,
                          background:
                            pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#2793CD",
                        }}
                      />
                    </div>
                  </div>
                  <CircularProgress pct={pct} />
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Analytics;