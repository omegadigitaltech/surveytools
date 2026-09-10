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

const HOUSING_OPTIONS = [
  "Hostel",
  "Rental",
  "Family home",
  "Owned Property",
];

const TRANSPORT_OPTIONS = [
  "Walking",
  "Public Transport",
  "Personal Car",
  "Motorcycle",
  "Other",
];

const INCOME_OPTIONS = [
  "Below ₦50,000",
  "₦50,000 - ₦100,000",
  "₦100,000 - ₦250,000",
  "₦250,000 - ₦500,000",
  "Above ₦500,000",
];

const INTERNET_OPTIONS = [
  "Poor",
  "Fair",
  "Good",
  "Excellent",
];

const DEVICE_OPTIONS = [
  "Smartphone",
  "Laptop",
  "Tablet",
  "Desktop",
  "Other",
];

const SocioEconomic = () => {
  const step = 3;
  const totalSteps = 6;

  const [housing, setHousing] = useState("");
  const [primaryTransport, setPrimaryTransport] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [internetStrength, setInternetStrength] = useState("");
  const [primaryDevice, setPrimaryDevice] = useState("");

  return (
    <div className="flex flex-col items-stretch justify-center ">
      <div className="personal-info inline-flex min-h-screen flex-col items-stretch justify-center">
        <ProgressTracker step={step} totalSteps={totalSteps} />

        <Card
          title={"Socioeconomic Profile"}
          description={"This helps us understand your living context."}
          optional={true}
        >
          <form className="space-y-6">
            {/* Monthly Household Income */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Monthly Household Income
              </label>

              <select
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="input"
              >
                <option value="" disabled>
                  Select an option
                </option>

                {INCOME_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Housing */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Housing
              </label>

              <div className="flex flex-wrap gap-2">
                {HOUSING_OPTIONS.map((option) => (
                  <RadioOption
                    key={option}
                    label={option}
                    selected={housing === option}
                    onClick={() => setHousing(option)}
                  />
                ))}
              </div>
            </div>

            {/* Primary Transport */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Primary Transport
              </label>

              <div className="flex flex-wrap gap-2">
                {TRANSPORT_OPTIONS.map((option) => (
                  <RadioOption
                    key={option}
                    label={option}
                    selected={primaryTransport === option}
                    onClick={() => setPrimaryTransport(option)}
                  />
                ))}
              </div>
            </div>

            {/* Internet Strength + Primary Device */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 pt-2">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Internet Strength
                </label>

                <select
                  value={internetStrength}
                  onChange={(e) => setInternetStrength(e.target.value)}
                  className="input"
                >
                  <option value="" disabled>
                    Select Option
                  </option>

                  {INTERNET_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Primary Device
                </label>

                <select
                  value={primaryDevice}
                  onChange={(e) => setPrimaryDevice(e.target.value)}
                  className="input"
                >
                  <option value="" disabled>
                    Select Option
                  </option>

                  {DEVICE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
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

export default SocioEconomic;