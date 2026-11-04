import React, { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ChevronRight, CheckCircle2 } from "lucide-react";

import ProgressTracker from "./components/ProgressTracker";
import Card from "./components/Card";
import { ConfirmCheckbox } from "./components/fields";
import useLayerSubmit from "./components/useLayerSubmit";
import useKycStore from "../../store/useKycStore";
import { CONSENT_SCOPES } from "../../utils/kycApi";
import { KYC_ROUTES } from "../../utils/kycFlow";
import {
  LAYER1_STEPS,
  buildLayer1Payload,
  isStudent,
  validateAcademic,
  validatePersonal,
} from "./layer1";

const GENDER_LABELS = {
  male: "Male",
  female: "Female",
  "prefer-not-to-say": "Prefer not to say",
};

const ReviewSubmit = () => {
  const navigate = useNavigate();
  const { layer1, resetLayer1 } = useKycStore();
  const { busy, submit } = useLayerSubmit();

  const [confirmAccurate, setConfirmAccurate] = useState(false);
  const [agreePrivacyPolicy, setAgreePrivacyPolicy] = useState(false);
  const [consentVerification, setConsentVerification] = useState(false);

  const allChecked =
    confirmAccurate && agreePrivacyPolicy && consentVerification;

  // Drop the draft once we've left the page after a successful submit.
  // Clearing it earlier would trip the redirects below mid-navigation.
  const submitted = useRef(false);
  useEffect(() => () => submitted.current && resetLayer1(), [resetLayer1]);

  // The draft is in memory only; after a refresh, start again at step 1
  if (Object.keys(validatePersonal(layer1)).length) {
    return <Navigate to="/register/personalinfo" replace />;
  }
  if (Object.keys(validateAcademic(layer1)).length) {
    return <Navigate to="/register/academicprofile" replace />;
  }

  const handleSubmit = async () => {
    if (!allChecked || busy) return;
    const done = await submit(1, buildLayer1Payload(layer1), {
      // NDPR minimum: identity/location data + permission to receive surveys
      scopes: [CONSENT_SCOPES.basicProfile, CONSENT_SCOPES.surveyParticipation],
      next: KYC_ROUTES.home,
      successMsg: "Profile submitted. You can start taking surveys!",
    });
    submitted.current = done;
  };

  const summary = [
    ["Gender", GENDER_LABELS[layer1.gender]],
    ["Date of Birth", new Date(`${layer1.dateOfBirth}T00:00`).toLocaleDateString()],
    ["State of Origin", layer1.stateOfOrigin],
    ["Residence", `${layer1.lgaOfResidence}, ${layer1.stateOfResidence}`],
    ["Academic Status", layer1.academicStatus],
    ...(isStudent(layer1)
      ? [
          ["Institution", layer1.institution],
          ["Level of Study", layer1.levelOfStudy],
        ]
      : []),
  ];

  return (
    <div className="flex flex-col items-stretch justify-center ">
      <div className="personal-info mt-2 inline-flex min-h-screennn flex-col items-stretch justify-center">
        <ProgressTracker step={LAYER1_STEPS} totalSteps={LAYER1_STEPS} showSaved={false} />

        <Card
          title={"Review & Submit"}
          description={"Please review your information before final submission"}
          onBack={() => navigate("/register/academicprofile")}
          showContinue={false}
        >
          <div className="space-y-6">
            {/* Personal Information Summary */}
            <div className="rounded-lg border  border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center flex-wrap justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className="w-5 h-5 text-emerald-500"
                    strokeWidth={2}
                  />

                  <span className="text-sm font-semibold text-slate-900">
                    Personal Information Summary
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/register/personalinfo")}
                  disabled={busy}
                  className="text-sm font-medium text-sky-600 hover:text-sky-700"
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {summary.map(([label, value]) => (
                  <div key={label}>
                    <p className="text-sm text-slate-400">{label}</p>
                    <p className="text-sm text-slate-900">{value || "—"}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirmation checkboxes */}
            <div className="space-y-4">
              <ConfirmCheckbox
                checked={confirmAccurate}
                onClick={() => setConfirmAccurate((v) => !v)}
                label="I confirm that this information is correct and accurate to the best of my knowledge"
              />

              <ConfirmCheckbox
                checked={agreePrivacyPolicy}
                onClick={() => setAgreePrivacyPolicy((v) => !v)}
                label="I agree to the Privacy Policy and terms of Data Processing"
              />

              <ConfirmCheckbox
                checked={consentVerification}
                onClick={() => setConsentVerification((v) => !v)}
                label="I consent to my profile being processed to match me with surveys"
              />
            </div>

            {/* Submit */}
            <button
              type="button"
              disabled={!allChecked || busy}
              onClick={handleSubmit}
              className={`w-full flex items-center justify-center gap-1.5 rounded-md py-1 text-sm font-medium text-white transition-colors ${
                allChecked && !busy
                  ? "bg-sky-400 hover:bg-sky-500 cursor-pointer"
                  : "bg-sky-300/60 cursor-not-allowed"
              }`}
            >
              {busy ? "Submitting..." : "Submit Verification"}
              <ChevronRight className="w-4 h-4 !border-none"  strokeWidth={2} />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReviewSubmit;
