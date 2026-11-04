import { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuthStore from "../../../store/useAuthStore";
import { getLayerStatus } from "../../../utils/kycApi";
import { KYC_ROUTES, routeFromLayerStatus } from "../../../utils/kycFlow";
import Loader from "../../../components/loader/loader";

// Where a respondent at `stage` must go instead, or null if they may stay.
// Stages: "layer1" (onboarding), "layer2", "enrichment" (Layers 3-5).
const redirectFor = (stage, status) => {
  if (stage === "layer1") {
    return status.layer1Completed ? routeFromLayerStatus(status) : null;
  }
  if (stage === "layer2") {
    if (!status.layer1Completed) return KYC_ROUTES.layer1;
    if (!status.layer2Eligible) return KYC_ROUTES.home;
    if (status.layer2Completed) return KYC_ROUTES.enrichment;
    return null;
  }
  // enrichment
  return status.layer2Completed ? null : routeFromLayerStatus(status);
};

// Route wrapper: checks layer-status on every KYC page load (the guide's
// single source of truth) and keeps each user type in its own flow.
const KycGate = ({ stage }) => {
  const navigate = useNavigate();
  const userType = useAuthStore((state) => state.userType);
  const researcherTier = useAuthStore((state) => state.researcherTier);
  const [checking, setChecking] = useState(stage !== "researcher");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const isResearcher = userType === "researcher";
  const wrongFlow = stage === "researcher" ? !isResearcher : isResearcher;

  useEffect(() => {
    if (stage === "researcher" || wrongFlow) return;
    let cancelled = false;

    setChecking(true);
    setError("");
    getLayerStatus()
      .then((status) => {
        if (cancelled) return;
        const target = redirectFor(stage, status);
        if (!target) {
          setChecking(false);
          return;
        }
        if (target === KYC_ROUTES.home && stage !== "layer1") {
          toast.info("Complete more surveys to unlock your extended profile.", {
            toastId: "kyc-locked",
          });
        }
        navigate(target, { replace: true });
      })
      .catch((err) => {
        // 401 is handled globally by the session-expiry interceptor
        if (cancelled || err.status === 401) return;
        setError(err.message);
        setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [stage, wrongFlow, attempt, navigate]);

  if (wrongFlow) {
    return (
      <Navigate to={isResearcher ? KYC_ROUTES.researcher : KYC_ROUTES.layer1} replace />
    );
  }
  // A tier means the researcher profile is already submitted
  if (stage === "researcher" && researcherTier) {
    return <Navigate to={KYC_ROUTES.researcherHome} replace />;
  }
  if (checking) return <Loader text="Checking your profile..." />;
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
  return <Outlet />;
};

export default KycGate;
