// kycFlow.js
// Decides which onboarding / KYC screen a signed-in user belongs on, plus the
// small validators shared by the auth and KYC forms.

import { getLayerStatus, getResearcherTier } from "./kycApi";
import useAuthStore from "../store/useAuthStore";

export const KYC_ROUTES = {
  verify: "/verify",
  layer1: "/register/personalinfo",
  layer2: "/register/education",
  enrichment: "/register/healthlifestyle",
  researcher: "/register/researcher",
  home: "/dashboard",
  researcherHome: "/researcher-dashboard",
};

export const isResearcher = (userType) => userType === "researcher";

// The Institutional tier is what the flow document calls a corporate researcher
export const isCorporateTier = (tier) => tier === "institutional";

export const getHomeRoute = (userType) =>
  isResearcher(userType) ? KYC_ROUTES.researcherHome : KYC_ROUTES.home;

// Mirrors the decision tree in the KYC guide (section 12.1). Layer 2 is only
// pushed once it unlocks; Layers 3-5 are optional and never forced.
export const routeFromLayerStatus = (status) => {
  if (!status.layer1Completed) return KYC_ROUTES.layer1;
  if (status.layer2Eligible && !status.layer2Completed) return KYC_ROUTES.layer2;
  return KYC_ROUTES.home;
};

// Where to send a user right after login or email verification.
export const getPostAuthRoute = async ({ userType, requiresEmailVerification }) => {
  if (requiresEmailVerification) return KYC_ROUTES.verify;

  try {
    if (isResearcher(userType)) {
      // The guide has no "profile exists" flag; a resolved tier is the only
      // signal that the researcher profile was submitted.
      const tier = await getResearcherTier();
      useAuthStore.getState().setResearcherTier(tier);
      return tier ? KYC_ROUTES.researcherHome : KYC_ROUTES.researcher;
    }
    return routeFromLayerStatus(await getLayerStatus());
  } catch (err) {
    // A 4xx from the tier endpoint means no researcher profile yet. Anything
    // else (offline, 5xx) shouldn't trap the user outside the dashboard.
    if (isResearcher(userType) && err.status >= 400 && err.status < 500) {
      return KYC_ROUTES.researcher;
    }
    return getHomeRoute(userType);
  }
};

/* -------------------------------------------------------------------------- */
/*  Validators                                                                */
/* -------------------------------------------------------------------------- */

export const E164_REGEX = /^\+\d{7,15}$/;

// Accepts "+2348012345678", "2348012345678" or the local "08012345678".
export const normalizePhone = (raw) => {
  const digits = raw.replace(/[\s()-]/g, "");
  if (/^0\d{10}$/.test(digits)) return `+234${digits.slice(1)}`;
  if (/^234\d{10}$/.test(digits)) return `+${digits}`;
  return digits;
};

export const ageFrom = (isoDate) => {
  const dob = new Date(isoDate);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
};

// <input type="date"> value ("YYYY-MM-DD") -> ISO-8601 datetime at UTC midnight
export const toIsoDate = (dateInput) => `${dateInput}T00:00:00Z`;

export const isEduNgEmail = (email) => /^[^\s@]+@[^\s@]+\.edu\.ng$/i.test(email);

export const OTP_REGEX = /^\d{6}$/;
