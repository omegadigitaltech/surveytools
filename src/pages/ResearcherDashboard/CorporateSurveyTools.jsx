import { useEffect, useState } from "react";
import {
  ANALYTICS_FILTERS,
  downloadInvoicePdf,
  exportSurvey,
  getAnalytics,
  getInvoice,
} from "./ResearcherDashboardApi";

const EXPORT_FORMATS = ["csv", "pdf", "xlsx", "json", "pptx"];

const FILTER_LABELS = Object.fromEntries(
  ANALYTICS_FILTERS.map(({ value, label }) => [value, label]),
);

const PANELS = [
  { id: "demographics", label: "Demographics" },
  { id: "invoice", label: "Invoice" },
  { id: "export", label: "Export" },
];

function PanelError({ message, onRetry }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center">
      <p className="text-sm text-slate-500">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-lg bg-(--btns) px-3 py-1.5 text-xs font-medium text-white"
      >
        Try again
      </button>
    </div>
  );
}

function DemographicsPanel({ surveyId }) {
  const [filters, setFilters] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const filtersKey = filters.join(",");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getAnalytics(surveyId, filtersKey ? filtersKey.split(",") : [])
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [surveyId, filtersKey, attempt]);

  const toggleFilter = (value) =>
    setFilters((prev) =>
      prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value],
    );

  const fields = Object.entries(data ?? {}).filter(([, rows]) => rows?.length);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {ANALYTICS_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={filters.includes(value)}
            onClick={() => toggleFilter(value)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
              filters.includes(value)
                ? "border-(--btns) bg-(--btns) text-white"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-3 w-1/3 rounded bg-slate-100" />
          <div className="h-3 w-full rounded bg-slate-100" />
          <div className="h-3 w-4/5 rounded bg-slate-100" />
        </div>
      ) : error ? (
        <PanelError message={error} onRetry={() => setAttempt((n) => n + 1)} />
      ) : fields.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
          No demographic data yet. It appears here after respondents submit
          answers and the results are processed.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {fields.map(([field, rows]) => {
            const max = Math.max(...rows.map((row) => row.count), 1);
            return (
              <div key={field}>
                <h4 className="mb-2 text-sm font-semibold text-slate-900">
                  {FILTER_LABELS[field] ?? field}
                </h4>
                <ul className="space-y-2">
                  {rows.map((row) => (
                    <li key={String(row.value)} title={`${row.value}: ${row.count}`}>
                      <div className="mb-1 flex justify-between gap-3 text-xs">
                        <span className="min-w-0 truncate text-slate-500">
                          {String(row.value)}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {row.count}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-(--btns)"
                          style={{ width: `${(row.count / max) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InvoicePanel({ surveyId }) {
  const [result, setResult] = useState(null); // { invoice, pdfBase64 }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setResult(await getInvoice(surveyId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) return <PanelError message={error} onRetry={load} />;

  if (!result) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          An invoice is created for this survey the first time you request it.
        </p>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="shrink-0 rounded-lg bg-(--btns) px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Loading..." : "Get invoice"}
        </button>
      </div>
    );
  }

  const { invoice, pdfBase64 } = result;

  return (
    <div>
      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs text-slate-500">Reference</dt>
          <dd className="break-words font-medium text-slate-900">{invoice.poReference}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Status</dt>
          <dd className="font-medium text-slate-900">{invoice.status}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Issued</dt>
          <dd className="font-medium text-slate-900">
            {invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString() : "N/A"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Amount</dt>
          <dd className="font-medium text-slate-900">{invoice.amount?.toLocaleString()}</dd>
        </div>
      </dl>
      {invoice.billingAddress && (
        <p className="mt-3 text-sm text-slate-500">{invoice.billingAddress}</p>
      )}
      {invoice.lineItems?.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-sm text-slate-500">
          {invoice.lineItems.map((item) => (
            <li key={item.description} className="flex justify-between gap-3">
              <span>
                {item.description} x {item.quantity}
              </span>
              <span className="font-medium text-slate-900">{item.total?.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={() => downloadInvoicePdf(pdfBase64, `invoice_${surveyId}.pdf`)}
        className="mt-4 rounded-lg bg-(--btns) px-3 py-2 text-sm font-medium text-white"
      >
        Download PDF
      </button>
    </div>
  );
}

function ExportPanel({ surveyId }) {
  const [busy, setBusy] = useState(""); // format being downloaded
  const [error, setError] = useState("");

  const download = async (format) => {
    setBusy(format);
    setError("");
    try {
      await exportSurvey(surveyId, format);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {EXPORT_FORMATS.map((format) => (
          <button
            key={format}
            type="button"
            disabled={Boolean(busy)}
            onClick={() => download(format)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium uppercase text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {busy === format ? "Exporting..." : format}
          </button>
        ))}
        <button
          type="button"
          disabled
          title="SPSS export isn't available yet"
          className="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-400"
        >
          SPSS (coming soon)
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}

// Corporate-only actions on a posted survey. Only render for the Institutional tier.
export default function CorporateSurveyTools({ surveyId }) {
  const [panel, setPanel] = useState(null);

  return (
    <div className="mt-4 border-t border-slate-100 pt-3">
      <div className="flex flex-wrap gap-2">
        {PANELS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-expanded={panel === id}
            onClick={() => setPanel((open) => (open === id ? null : id))}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              panel === id
                ? "bg-(--btns) text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {panel && (
        <div className="mt-4">
          {panel === "demographics" && <DemographicsPanel surveyId={surveyId} />}
          {panel === "invoice" && <InvoicePanel surveyId={surveyId} />}
          {panel === "export" && <ExportPanel surveyId={surveyId} />}
        </div>
      )}
    </div>
  );
}
