// ResearcherDashboardApi.js
// Service layer for the researcher dashboard: the survey list every tier sees,
// plus the Corporate Dashboard endpoints (Institutional tier only).

import config from "../../config/config";
import useAuthStore from "../../store/useAuthStore";
import { ApiError, request } from "../../utils/kycApi";

const DASHBOARD = "/v1/dashboard/corporate";

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* -------------------------------------------------------------------------- */
/*  Survey list (all researcher tiers)                                        */
/* -------------------------------------------------------------------------- */

export function normalizeSurvey(raw) {
  const participants = raw.participantCounts?.filled ?? 0;
  const target = raw.no_of_participants ?? 0;

  let status = "draft";
  if (target > 0 && participants >= target) status = "completed";
  else if (raw.published) status = "active";

  return {
    id: raw._id,
    title: raw.title ?? "Untitled survey",
    description: raw.description ?? "",
    participants,
    target,
    status,
  };
}

// The caller's own surveys, as the API returns them
export const getMySurveys = async () =>
  (await request("/my-surveys")).mySurveys ?? [];

/* -------------------------------------------------------------------------- */
/*  Corporate dashboard endpoints (Institutional tier)                        */
/* -------------------------------------------------------------------------- */

// Query values accepted by /analytics; anything else fails validation with a 400
export const ANALYTICS_FILTERS = [
  { value: "gender", label: "Gender" },
  { value: "stateOfOrigin", label: "State of origin" },
  { value: "stateOfResidence", label: "State of residence" },
  { value: "lgaOfResidence", label: "LGA of residence" },
  { value: "isStudent", label: "Student" },
  { value: "academicLevel", label: "Academic level" },
  { value: "levelOfStudy", label: "Level of study" },
  { value: "institution", label: "Institution" },
  { value: "faculty", label: "Faculty" },
  { value: "department", label: "Department" },
  { value: "professionalOccupation", label: "Occupation" },
  { value: "employmentSector", label: "Employment sector" },
  { value: "graduateStatus", label: "Graduate status" },
  { value: "educationLevel", label: "Education level" },
  { value: "employmentStatus", label: "Employment status" },
  { value: "incomeRange", label: "Income range" },
  { value: "maritalStatus", label: "Marital status" },
  { value: "bloodGroup", label: "Blood group" },
  { value: "religion", label: "Religion" },
  { value: "housingType", label: "Housing type" },
];

// -> { totalSurveys, activeSurveys, totalResponses }
export const getOverview = async () =>
  (await request(`${DASHBOARD}/overview`)).data;

// -> { gender: [{value, count}], stateOfResidence: [...], ... }  (may be {})
// filters: optional array of ANALYTICS_FILTERS values
export const getAnalytics = async (surveyId, filters = []) => {
  const params = new URLSearchParams({ surveyId });
  if (filters.length) params.set("filters", filters.join(","));
  return (await request(`${DASHBOARD}/analytics?${params}`)).data ?? {};
};

// -> { invoice, pdfBase64 }. Despite being a GET this creates the invoice on the
// first call, so only ever call it from an explicit user action.
export const getInvoice = async (surveyId) =>
  (await request(`${DASHBOARD}/invoice/${surveyId}`)).data;

export function downloadInvoicePdf(pdfBase64, filename = "invoice.pdf") {
  const bytes = Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0));
  saveBlob(new Blob([bytes], { type: "application/pdf" }), filename);
}

// format: csv | pdf | xlsx | json | pptx   (spss currently returns a 501)
// Answers with the file itself rather than the JSON envelope, so this can't go
// through request().
export async function exportSurvey(surveyId, format = "csv") {
  const params = new URLSearchParams({ surveyId, format });

  let res;
  try {
    res = await fetch(`${config.API_URL}${DASHBOARD}/export?${params}`, {
      headers: { Authorization: `Bearer ${useAuthStore.getState().authToken}` },
    });
  } catch {
    throw new ApiError("Network error. Please check your connection.", 0);
  }

  if (!res.ok) {
    let body = {};
    try {
      body = await res.json();
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(body.msg || `Request failed (${res.status})`, res.status);
  }
  saveBlob(await res.blob(), `survey_export_${surveyId}.${format}`);
}
