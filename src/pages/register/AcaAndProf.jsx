import React, { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import ProgressTracker from "./components/ProgressTracker";
import Card from "./components/Card";

const ACADEMIC_STATUS_OPTIONS = [
  "Undergraduate",
  "Graduate",
  "MSc/MBA",
  "PhD Candidate",
  "Non-academic Professional",
];

export default function AcaAndProf() {
  const [gender, setGender] = useState("");
  const [academicStatus, setAcademicStatus] = useState("");
  const step = 2;
  const totalSteps = 6;

  return (
    <div className="flex flex-col items-stretch justify-center ">
      <div className="personal-info inline-flex min-h-screen flex-col items-stretch justify-center">
        <ProgressTracker step={step} totalSteps={totalSteps} />
        <Card
          title={"Academic & Professional Profile"}
          description={"Help us understand your background."}
        >
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-3">
                Academic Status <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ACADEMIC_STATUS_OPTIONS.map((option) => (
                  <OptionCard
                    key={option}
                    label={option}
                    selected={academicStatus === option}
                    onClick={() => setAcademicStatus(option)}
                    full={option === "Non-academic Professional"}
                  />
                ))}
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

function OptionCard({ label, selected, onClick, full }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
        full ? "sm:col-span-2" : ""
      } ${
        selected
          ? "border-sky-600 bg-sky-50 text-sky-700"
          : "border-slate-200 text-slate-700 hover:border-slate-300"
      }`}
    >
      {label}
    </button>
  );
}
