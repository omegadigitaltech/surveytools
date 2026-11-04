import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import { getResearcherTier } from "../../utils/kycApi";
import { KYC_ROUTES, getHomeRoute, isResearcher } from "../../utils/kycFlow";
import { getMySurveys } from "../../pages/ResearcherDashboard/ResearcherDashboardApi";
import Loader from "../loader/loader";

// Keeps each account type on its own routes; everyone else is redirected to
// their own dashboard. Nest inside ProtectRoute.
//
// allow: "respondent" | "researcher" | "none" (feature switched off for everyone)
// allowSurveyOwners: on a researcher route, also let in respondents who posted
//   surveys before account types existed, so they can keep managing them.
const RoleRoute = ({ allow, allowSurveyOwners = false }) => {
  const userType = useAuthStore((state) => state.userType);
  const researcherTier = useAuthStore((state) => state.researcherTier);
  const setResearcherTier = useAuthStore((state) => state.setResearcherTier);
  const ownsSurveys = useAuthStore((state) => state.ownsSurveys);
  const setOwnsSurveys = useAuthStore((state) => state.setOwnsSurveys);

  const [noProfile, setNoProfile] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const researcher = isResearcher(userType);
  const needsTier = allow === "researcher" && researcher && !researcherTier;
  const needsOwnership =
    allow === "researcher" && !researcher && allowSurveyOwners && ownsSurveys === null;

  useEffect(() => {
    if (!needsTier && !needsOwnership) return;
    let cancelled = false;
    setError("");

    const check = needsTier
      ? getResearcherTier().then((tier) => {
          if (cancelled) return;
          setResearcherTier(tier);
          if (!tier) setNoProfile(true);
        })
      : getMySurveys().then((surveys) => {
          if (!cancelled) setOwnsSurveys(surveys.length > 0);
        });

    check.catch((err) => {
      // 401 is handled globally by the session-expiry interceptor
      if (cancelled || err.status === 401) return;
      // A 4xx from the tier endpoint means no researcher profile yet
      if (needsTier && err.status >= 400 && err.status < 500) setNoProfile(true);
      else setError(err.message);
    });

    return () => {
      cancelled = true;
    };
  }, [needsTier, needsOwnership, attempt, setResearcherTier, setOwnsSurveys]);

  const home = <Navigate to={getHomeRoute(userType)} replace />;

  if (allow === "none") return home;
  if (allow === "respondent") return researcher ? home : <Outlet />;

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-slate-600">{error}</p>
        <button
          type="button"
          onClick={() => setAttempt((n) => n + 1)}
          className="bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          Try again
        </button>
      </div>
    );
  }
  if (noProfile) return <Navigate to={KYC_ROUTES.researcher} replace />;
  if (needsTier || needsOwnership) return <Loader text="Checking your account..." />;
  if (researcher || (allowSurveyOwners && ownsSurveys)) return <Outlet />;
  return home;
};

export default RoleRoute;
