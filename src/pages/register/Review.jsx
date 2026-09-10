import React, { useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Check,
  Circle,
  Info,
} from "lucide-react";

import ProgressTracker from "./components/ProgressTracker";

import Card from "./components/Card";

const ReviewSubmit = ({ personalInfo = {}, onEdit, onSubmit }) => {
  const step = 6;
  const totalSteps = 6;

  const [confirmAccurate, setConfirmAccurate] = useState(false);
  const [agreePrivacyPolicy, setAgreePrivacyPolicy] = useState(false);
  const [consentVerification, setConsentVerification] = useState(false);

  const allChecked =
    confirmAccurate && agreePrivacyPolicy && consentVerification;

  const handleSubmit = () => {
    if (!allChecked) return;
    onSubmit?.();
  };

  return (
    <div className="flex flex-col items-stretch justify-center ">
      <div className="personal-info mt-2 inline-flex min-h-screennn flex-col items-stretch justify-center">
        <ProgressTracker step={step} totalSteps={totalSteps} />

        <Card
          title={"Review & Submit"}
          description={"Please review your information before final submission"}
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
                  onClick={onEdit}
                  className="text-sm font-medium text-sky-600 hover:text-sky-700"
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Name</p>
                  <p className="text-sm text-slate-900">
                    {personalInfo.name || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Phone</p>
                  <p className="text-sm text-slate-900">
                    {personalInfo.phone || "—"}
                  </p>
                </div>
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
                label="I consent to secure identity verification processing"
              />
            </div>

            {/* Submit */}
            <button
              type="button"
              disabled={!allChecked}
              onClick={handleSubmit}
              className={`w-full flex items-center justify-center gap-1.5 rounded-md py-1 text-sm font-medium text-white transition-colors ${
                allChecked
                  ? "bg-sky-400 hover:bg-sky-500 cursor-pointer"
                  : "bg-sky-300/60 cursor-not-allowed"
              }`}
            >
              Submit Verification
              <ChevronRight className="w-4 h-4 !border-none"  strokeWidth={2} />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

function ConfirmCheckbox({ checked, onClick, label }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group flex items-center gap-3 text-left w-full"
      >
        <span
          className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
            checked
              ? "border-sky-600 bg-sky-600"
              : "border-slate-300 bg-white group-hover:border-slate-400"
          }`}
        >
          <Check
            className={`!w-3.5 !h-3.5 text-white transition-opacity ${
              checked ? "opacity-100" : "opacity-0"
            }`}
            strokeWidth={3}
          />
        </span>
  
        <span className="text-sm text-slate-900">{label}</span>
      </button>
    );
  }

export default ReviewSubmit;