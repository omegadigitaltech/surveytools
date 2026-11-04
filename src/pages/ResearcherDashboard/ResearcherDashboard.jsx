import { useState, useMemo, useEffect, useCallback } from "react";
import "./ResearcherDashboard.css";
import { Link, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  TrendingUp,
  CheckCircle2,
  Users,
} from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import { isCorporateTier } from "../../utils/kycFlow";
import { getMySurveys, getOverview, normalizeSurvey } from "./ResearcherDashboardApi";
import CorporateSurveyTools from "./CorporateSurveyTools";

const statusStyles = {
  active: {
    label: "Active",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  completed: {
    label: "Completed",
    dot: "bg-slate-400",
    text: "text-slate-600",
    bg: "bg-slate-100",
  },
  draft: {
    label: "Draft",
    dot: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50",
  },
};

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="profdashbd-stat-card flex-1 min-w-[160px] rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <Icon className="h-4 w-4 text-slate-400" strokeWidth={2} />
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}

function SurveyCard({ survey, corporate }) {
  const pct = survey.target
    ? Math.min(100, Math.round((survey.participants / survey.target) * 100))
    : 0;
  const s = statusStyles[survey.status];

  return (
    <div className="profdashbd-survey-card group w-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      {/* Same flow as My Surveys: survey details, then edit from there */}
      <Link
        to={`/expandsurvey/${survey.id}`}
        className="profdashbd-survey-inner flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <h3 className=" text-[15px] font-semibold text-slate-900">
              {survey.title}
            </h3>
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${s.bg} ${s.text}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
              {s.label}
            </span>
          </div>
          <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">
            {survey.description}
          </p>
        </div>

        <div className="profdashbd-progress-wrap flex shrink-0 items-center gap-6 sm:pl-4">
          <div className="profdashbd-progress w-32">
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-sm font-semibold text-slate-900">
                {survey.participants}/{survey.target}
              </span>
              <span className="text-xs text-slate-400">{pct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-(--btns) transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="mt-1 block text-xs text-slate-400">
              participants
            </span>
          </div>
        </div>
      </Link>
      {corporate && <CorporateSurveyTools surveyId={survey.id} />}
    </div>
  );
}

function SurveyCardSkeleton() {
  return (
    <div className="profdashbd-survey-card w-full animate-pulse rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded bg-slate-100" />
          <div className="h-3 w-full rounded bg-slate-100" />
          <div className="h-3 w-4/5 rounded bg-slate-100" />
        </div>
        <div className="h-8 w-32 rounded bg-slate-100" />
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
      <h3 className="text-base font-semibold text-slate-900">
        Couldn't load your surveys
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500">{message}</p>
      <button
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-(--btns) px-4 py-2.5 text-sm font-medium text-white shadow-sm transition active:scale-[0.98]"
      >
        Try again
      </button>
    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="profdashbd-empty flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center">
      <div className="profdashbd-empty-icon mb-5 flex h-25 w-25 items-center justify-center rounded-2xl ">
        <img src="/file.png" alt="" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">No surveys yet</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500">
        Your dashboard will display all your active surveys and performance
        stats once you create the first one.
      </p>
      <button
        onClick={onCreate}
        className="profdashbd-empty-cta mt-6 inline-flex items-center gap-2 rounded-lg bg-(--btns) px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
      >
        <span className="material-icons text-sm">edit</span> Create questionnaire
      </button>
    </div>
  );
}

export default function ResearcherDashboard() {
  const navigate = useNavigate();
  const researcherTier = useAuthStore((state) => state.researcherTier);
  const corporate = isCorporateTier(researcherTier);

  const [overview, setOverview] = useState(null); // corporate: { totalSurveys, activeSurveys, totalResponses }
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // the survey list failed

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const [surveysRes, overviewRes] = await Promise.allSettled([
      getMySurveys(),
      corporate ? getOverview() : null,
    ]);

    if (surveysRes.status === "fulfilled") {
      setSurveys(surveysRes.value.map(normalizeSurvey));
    } else if (surveysRes.reason.status !== 401) {
      setError(surveysRes.reason.message);
    }
    // Without /overview the corporate stats fall back to the survey list
    setOverview(overviewRes.status === "fulfilled" ? overviewRes.value : null);
    setLoading(false);
  }, [corporate]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    // Only corporate accounts have /overview, and it has no completed count,
    // so the list is the source for everything else.
    return {
      total: overview?.totalSurveys ?? surveys.length,
      active:
        overview?.activeSurveys ??
        surveys.filter((s) => s.status === "active").length,
      completed: surveys.filter((s) => s.status === "completed").length,
      responses:
        overview?.totalResponses ??
        surveys.reduce((sum, s) => sum + s.participants, 0),
    };
  }, [surveys, overview]);

  // Numbers derived from a list that failed to load would read as real zeros
  const show = (n, fromOverview) =>
    loading || (error && !fromOverview) ? "—" : n;

  return (
    <div className="profdashbd min-h-screen w-full bg-slate-50 px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="profdashbd-header mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <Link
              to="/postsurvey"
              className="inline-flex items-center gap-2 rounded-lg bg-(--btns) px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-(--base) active:scale-[0.98]"
            >
              <span className="material-icons text-sm">edit</span>
              Create questionnaire
            </Link>
          </div>
        </div>

        {/* Stat cards */}
        <div className="profdashbd-stats mb-8 flex flex-col gap-4 sm:flex-row">
          <StatCard
            label="Total surveys"
            value={show(stats.total, overview?.totalSurveys != null)}
            icon={ClipboardList}
          />
          <StatCard
            label="Active surveys"
            value={show(stats.active, overview?.activeSurveys != null)}
            icon={TrendingUp}
          />
          <StatCard
            label="Completed"
            value={show(stats.completed)}
            icon={CheckCircle2}
          />
          {corporate && (
            <StatCard
              label="Total responses"
              value={show(stats.responses, overview?.totalResponses != null)}
              icon={Users}
            />
          )}
        </div>

        {/* Survey list */}
        <div>
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            My surveys
          </h2>

          {loading ? (
            <div className="flex flex-col gap-3">
              <SurveyCardSkeleton />
              <SurveyCardSkeleton />
              <SurveyCardSkeleton />
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : surveys.length === 0 ? (
            <EmptyState onCreate={() => navigate("/postsurvey")} />
          ) : (
            <div className="flex flex-col gap-3">
              {surveys.map((survey) => (
                <SurveyCard key={survey.id} survey={survey} corporate={corporate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
