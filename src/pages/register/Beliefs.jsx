import React, { useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Info,
} from "lucide-react";

import ProgressTracker from "./components/ProgressTracker";

import Card from "./components/Card";

const RELIGION_OPTIONS = [
  "Christianity",
  "Islam",
  "Traditional",
  "Other",
  "Prefer not to say",
];

const ETHNICITY_OPTIONS = [
  "Yoruba",
  "Igbo",
  "Hausa",
  "Other",
  "Prefer not to say",
];

const MARITAL_STATUS_OPTIONS = [
  "Single",
  "Married",
  "Divorced",
  "Widowed",
];

const DEPENDANTS_OPTIONS = [
  "0",
  "1-2",
  "3-4",
  "5+",
];

const LANGUAGE_OPTIONS = [
  "English",
  "Yoruba",
  "Igbo",
  "Hausa",
  "Pidgin",
];

const Beliefs = () => {
  const step = 4;
  const totalSteps = 6;

  const [religion, setReligion] = useState("");
  const [ethnicity, setEthnicity] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [dependants, setDependants] = useState("");
  const [languageSpoken, setLanguageSpoken] = useState("");

  return (
    <div className="flex flex-col items-stretch justify-center ">
      <div className="personal-info inline-flex min-h-screen flex-col items-stretch justify-center">
        <ProgressTracker step={step} totalSteps={totalSteps} />

        <Card
          title={"Religion & Culture"}
          description={"This helps us understand your living context."}
          optional={true}
        >
          <form className="space-y-6">
            {/* Religion + Ethnicity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Religion
                </label>

                <select
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  className="input"
                >
                  <option value="" disabled>
                    Select Option
                  </option>

                  {RELIGION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Ethnicity
                </label>

                <select
                  value={ethnicity}
                  onChange={(e) => setEthnicity(e.target.value)}
                  className="input"
                >
                  <option value="" disabled>
                    Select Option
                  </option>

                  {ETHNICITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Marital Status + Dependants */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Marital Status
                </label>

                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  className="input"
                >
                  <option value="" disabled>
                    Select Option
                  </option>

                  {MARITAL_STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Dependants
                </label>

                <select
                  value={dependants}
                  onChange={(e) => setDependants(e.target.value)}
                  className="input"
                >
                  <option value="" disabled>
                    Select Option
                  </option>

                  {DEPENDANTS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Language Spoken */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Language Spoken
              </label>

              <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((option) => (
                  <RadioOption
                    key={option}
                    label={option}
                    selected={languageSpoken === option}
                    onClick={() => setLanguageSpoken(option)}
                  />
                ))}
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

function RadioOption({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs transition-colors ${
        selected
          ? "border-sky-600 bg-sky-50 text-sky-700"
          : "border-slate-200 text-slate-600 hover:border-slate-300"
      }`}
    >
      {selected ? (
        <CheckCircle2
          className="w-3.5 h-3.5"
          strokeWidth={2}
        />
      ) : (
        <Circle
          className="w-3.5 h-3.5 text-slate-300"
          strokeWidth={2}
        />
      )}

      {label}
    </button>
  );
}

export default Beliefs;