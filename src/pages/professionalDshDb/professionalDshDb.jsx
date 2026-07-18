import { useState, useMemo } from "react";
import "./professionaldsh.css"
import {
  FileText,
  ClipboardList,
  Plus,
  FolderOpen,
  Users,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

const mockSurveys = [
  {
    id: 1,
    title: "Education and its impact in the life of a teenage child",
    description:
      "Professionals come together to take a consensus. We are aware our predecessors didn't focus too much on this, and we're here to change that with detailed, evidence-based insight.",
    participants: 200,
    target: 400,
    status: "active",
  },
  {
    id: 2,
    title: "Remote work productivity across mid-size teams",
    description:
      "A cross-industry look at how flexible schedules and async tools are reshaping output, collaboration, and burnout risk for teams of 20–200 people.",
    participants: 400,
    target: 400,
    status: "completed",
  },
  {
    id: 3,
    title: "Mental health support access in higher education",
    description:
      "Gathering perspectives from students and counselors to understand gaps in on-campus mental health resources and where policy attention is most needed.",
    participants: 96,
    target: 400,
    status: "draft",
  },
  {
    id: 4,
    title: "Consumer trust in AI-assisted customer service",
    description:
      "Measuring how automated support interactions affect brand trust, resolution satisfaction, and willingness to recommend across retail and finance sectors.",
    participants: 200,
    target: 400,
    status: "active",
  },
];

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

function SurveyCard({ survey }) {
  const pct = Math.min(
    100,
    Math.round((survey.participants / survey.target) * 100),
  );
  const s = statusStyles[survey.status] ?? statusStyles.active;

  return (
    <div className="profdashbd-survey-card group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transiter:shadow-md">
      <div className="profdashbd-survey-inner flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
      </div>
    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="profdashbd-empty flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center">
      <div className="profdashbd-empty-icon mb-5 flex h-25 w-25 items-center justify-center rounded-2xl ">
        <img src="./file.png" alt="" />
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

export default function ProfessionalDashboard({ surveys: surveysProp }) {
  const [previewEmpty, setPreviewEmpty] = useState(false);

  const surveys = surveysProp ?? (previewEmpty ? [] : mockSurveys);

  const stats = useMemo(() => {
    const total = surveys.length;
    const active = surveys.filter((s) => s.status === "active").length;
    const completed = surveys.filter((s) => s.status === "completed").length;
    return { total, active, completed };
  }, [surveys]);

  return (
    <div className="profdashbd min-h-screen w-full bg-slate-50 px-4 py-6 sm:px-8 sm:py-10">
      {/* Scoped responsive CSS — namespaced under .profdashbd so nothing
          here can conflict with class names elsewhere on the page. */}
      <style>{`
        
      `}</style>

      {/* Dev-only preview toggle — remove when wiring real data */}
      <div className="mx-auto mb-4 max-w-6xl">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
          <input
            type="checkbox"
            checked={previewEmpty}
            onChange={(e) => setPreviewEmpty(e.target.checked)}
            className="h-3.5 w-3.5 accent-blue-600"
          />
          Preview empty state
        </label>
      </div>

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="profdashbd-header mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-blue-700">
              <FileText className="h-4 w-4" strokeWidth={2} />
              Create a form
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-(--btns) px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-(--base) active:scale-[0.98]">
            <span className="material-icons text-sm">edit</span>
              Create questionnaire
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="profdashbd-stats mb-8 flex flex-col gap-4 sm:flex-row">
          <StatCard
            label="Total surveys"
            value={stats.total}
            icon={ClipboardList}
          />
          <StatCard
            label="Active surveys"
            value={stats.active}
            icon={TrendingUp}
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={CheckCircle2}
          />
        </div>

        {/* Survey list */}
        <div>
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            My surveys
          </h2>

          {surveys.length === 0 ? (
            <EmptyState onCreate={() => {}} />
          ) : (
            <div className="flex flex-col gap-3">
              {surveys.map((survey) => (
                <SurveyCard key={survey.id} survey={survey} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
