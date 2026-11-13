import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { errorIncludes, submitConsent, submitLayer } from "../../../utils/kycApi";
import { KYC_ROUTES } from "../../../utils/kycFlow";

// Submits one respondent layer, recording NDPR consent for its data scopes
// first. Layers are single-submission, so a 409 means "already done" and the
// user simply moves on; a 403 means a prerequisite layer is missing.
export default function useLayerSubmit() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  // Consent is recorded once per visit even if the layer call needs a retry
  const consented = useRef(false);

  const submit = async (layer, payload, { scopes = [], next, successMsg }) => {
    setBusy(true);
    try {
      if (scopes.length && !consented.current) {
        await submitConsent(scopes);
        consented.current = true;
      }
      await submitLayer(layer, payload);
      toast.success(successMsg || "Saved.");
      navigate(next, { replace: true });
      return true;
    } catch (err) {
      if (err.status === 409) {
        toast.info("You've already completed this section.");
        navigate(next, { replace: true });
      } else if (errorIncludes(err, "phone not verified")) {
        // The backend still gates Layer 1 on phoneVerified even though account
        // verification moved to email. Sending the user to /verify would loop,
        // so explain instead until the backend gate is switched.
        toast.error(
          "We can't save your profile right now. Please try again later.",
        );
      } else if (err.status === 403) {
        toast.warning(err.message);
        navigate(KYC_ROUTES.home, { replace: true });
      } else if (err.status !== 401) {
        toast.error(err.message);
      }
      setBusy(false);
      return false;
    }
  };

  return { busy, submit };
}
