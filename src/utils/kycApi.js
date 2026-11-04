// kycApi.js
// Service layer for auth + KYC (docs/apiCollections and the KYC integration
// guide). Every endpoint answers with the envelope { status, code, msg, data }.
//
// Requests go through window.fetch so the global 401 handler in
// utils/setupAuthInterceptor.js logs the user out on an expired session.
// Nothing here logs request or response bodies: they carry tokens, OTPs and
// personal data.

import config from "../config/config";
import useAuthStore from "../store/useAuthStore";

/* -------------------------------------------------------------------------- */
/*  Core request helper                                                       */
/* -------------------------------------------------------------------------- */

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status; // 0 = no HTTP response (offline, DNS, timeout)
  }
}

// auth: false for public endpoints (register, login, password reset)
export async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = body ? { "Content-Type": "application/json" } : {};
  if (auth) {
    headers.Authorization = `Bearer ${useAuthStore.getState().authToken}`;
  }

  let res;
  try {
    res = await fetch(`${config.API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Network error. Please check your connection.", 0);
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON body */
  }
  if (!res.ok || json?.status === "failure") {
    throw new ApiError(
      json?.msg || json?.message || `Request failed (${res.status})`,
      json?.code || res.status,
    );
  }
  return json ?? {};
}

const post = (path, body, opts) =>
  request(path, { method: "POST", body, ...opts });

// Case-insensitive match on the backend's error message. The API has no error
// codes beyond the HTTP status, so a few flows branch on the documented text.
export const errorIncludes = (err, text) =>
  (err?.message || "").toLowerCase().includes(text.toLowerCase());

/* -------------------------------------------------------------------------- */
/*  Auth                                                                      */
/* -------------------------------------------------------------------------- */

// { firstName, lastName, email, password, userType, dateOfBirth } -> no token
export const register = (payload) =>
  post("/v1/kyc/register", payload, { auth: false });

// Returns the raw envelope: the token sits at the top level, not under data
export const login = (email, password) =>
  post("/auth/login", { email, password }, { auth: false });

// Server-side session invalidation. Takes the token explicitly because the
// store is usually cleared before this resolves.
export const logoutSession = (token) =>
  fetch(`${config.API_URL}/auth/logout`, {
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});

export const requestPasswordReset = (email) =>
  post("/forget-password", { email }, { auth: false });

export const resetPassword = (payload) =>
  post("/reset-password", payload, { auth: false });

/* -------------------------------------------------------------------------- */
/*  OTP                                                                       */
/* -------------------------------------------------------------------------- */

export const requestPhoneOtp = (phone) => post("/v1/kyc/otp/request", { phone });
export const verifyPhoneOtp = (phone, code) =>
  post("/v1/kyc/otp/verify", { phone, code });

export const requestEmailOtp = (email) =>
  post("/v1/kyc/email-otp/request", { email });
export const verifyEmailOtp = (email, code) =>
  post("/v1/kyc/email-otp/verify", { email, code });

/* -------------------------------------------------------------------------- */
/*  Respondent layers                                                         */
/* -------------------------------------------------------------------------- */

// { layer1Completed, layer2Eligible, layer2Completed }
export const getLayerStatus = async () =>
  (await request("/v1/kyc/respondent/layer-status")).data ?? {};

export const submitLayer = (layer, payload) =>
  post(`/v1/kyc/respondent/layer${layer}`, payload);

export const notifySurveyCompleted = () =>
  post("/v1/kyc/respondent/survey-completed");

/* -------------------------------------------------------------------------- */
/*  Researcher                                                                */
/* -------------------------------------------------------------------------- */

export const submitResearcherProfile = (payload) =>
  post("/v1/kyc/researcher/profile", payload);

// "standard" | "premium" | "institutional" (the docs also spell it capitalised)
export const getResearcherTier = async () => {
  const tier = (await request("/v1/kyc/researcher/tier")).data?.tier;
  return tier ? String(tier).toLowerCase() : null;
};

/* -------------------------------------------------------------------------- */
/*  NDPR consent                                                              */
/* -------------------------------------------------------------------------- */

export const CONSENT_SCOPES = {
  basicProfile: "basic_profile",
  health: "health_data",
  socioeconomic: "socioeconomic_data",
  religiousCultural: "religious_cultural_data",
  surveyParticipation: "survey_participation",
  marketing: "marketing",
};

export const submitConsent = (scopes) => post("/v1/kyc/consent", { scopes });

export const setConsentScope = (scope, granted) =>
  request(`/v1/kyc/consent/${scope}`, { method: "PATCH", body: { granted } });
