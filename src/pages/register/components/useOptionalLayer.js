import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useLayerSubmit from "./useLayerSubmit";

const isBlank = (v) =>
  v === null || v === undefined || (typeof v === "string" ? !v.trim() : Array.isArray(v) && !v.length);

// Layers 3-5 are optional and single-submission. Continuing with nothing
// filled in counts as a skip, so the one allowed submission isn't spent on an
// empty payload. Consent for the layer's sensitive scope is only required
// when there is data to send.
export default function useOptionalLayer({ layer, scope, next, successMsg }) {
  const navigate = useNavigate();
  const { busy, submit } = useLayerSubmit();
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState("");

  const skip = () => navigate(next);

  const toggleConsent = () => {
    setConsent((v) => !v);
    setConsentError("");
  };

  const handleContinue = (payload) => {
    const filled = Object.fromEntries(
      Object.entries(payload).filter(([, v]) => !isBlank(v)),
    );
    if (!Object.keys(filled).length) return skip();
    if (!consent) {
      setConsentError("Please give consent, or skip this section.");
      return;
    }
    submit(layer, filled, { scopes: [scope], next, successMsg });
  };

  return { busy, consent, consentError, toggleConsent, handleContinue, skip };
}
