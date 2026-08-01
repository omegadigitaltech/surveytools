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
const GROUPS = [
  {
    key: "chronicConditions",
    label: "Chronic Conditions",
    options: [
      "Diabetes",
      "Hypertension",
      "Asthma",
      "Sickle Cell",
      "Other",
      "None",
    ],
  },
  {
    key: "disabilityStatus",
    label: "Disability Status",
    options: [
      "Physical",
      "Visual",
      "Cognitive",
      "Hearing",
      "Prefer not to say",
      "None",
    ],
  },
  {
    key: "dietaryPattern",
    label: "Dietary Pattern",
    options: [
      "Omnivore",
      "Vegan",
      "Vegetarian",
      "Religious Restrictions",
      "Other",
    ],
  },
  {
    key: "exerciseFrequency",
    label: "Exercise Frequency",
    options: ["Sedentary", "Light", "Moderate", "Vigorous"],
  },
  {
    key: "menstrualHealthStatus",
    label: "Menstrual Health Status",
    options: ["Active", "Menopausal", "N/A"],
  },
  {
    key: "parentalPregnancyStatus",
    label: "Parental/Pregnancy Status",
    options: ["Pregnant", "Parent", "N/A"],
  },
  {
    key: "smokingStatus",
    label: "Smoking Status",
    options: ["Active(Occasional/Daily)", "Former", "N/A"],
  },
  {
    key: "alcoholConsumption",
    label: "Alcohol Consumption",
    options: ["Frequent", "Moderate", "Occasional", "N/A"],
  },
];

const HealthLifestyle = () => {
  const step = 2;
  const totalSteps = 6;
  const [selections, setSelections] = useState(
    GROUPS.reduce((acc, g) => ({ ...acc, [g.key]: [] }), {}),
  );
  const toggleOption = (groupKey, option) => {
    setSelections((prev) => {
      const current = prev[groupKey];
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [groupKey]: next };
    });
  };
  return (
    <div className="flex flex-col items-stretch justify-center ">
      <div className="personal-info inline-flex min-h-screen flex-col items-stretch justify-center">
        <ProgressTracker step={step} totalSteps={totalSteps} />
        <Card
          title={"Health &amp; Lifestyle"}
          description={"Select all that apply."}
          optional={true}
        >
          <form className="space-y-6">
            {GROUPS.map((group) => (
              <div key={group.key}>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  {group.label}
                </label>
                <div className="flex flex-wrap gap-2">
                  {group.options.map((option) => (
                    <PillOption
                      key={option}
                      label={option}
                      selected={selections[group.key].includes(option)}
                      onClick={() => toggleOption(group.key, option)}
                    />
                  ))}
                </div>
              </div>
            ))}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 pt-2">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Blood Group
                </label>
                <input
                  type="text"
                  placeholder="Enter blood group"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Genotype
                </label>
                <input
                  type="text"
                  placeholder="Enter your genotype"
                  className="input"
                />
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

function PillOption({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-colors ${
        selected
          ? "border-sky-600 bg-sky-50 text-sky-700"
          : "border-slate-200 text-slate-600 hover:border-slate-300"
      }`}
    >
      {selected ? (
        <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
      ) : (
        <Circle className="w-3.5 h-3.5 text-slate-300" strokeWidth={2} />
      )}
      {label}
    </button>
  );
}

export default HealthLifestyle;
