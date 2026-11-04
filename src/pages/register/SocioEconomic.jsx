import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import ProgressTracker from "./components/ProgressTracker";

import Card from "./components/Card";
import { ConfirmCheckbox, Field, PillOption, SelectField, TextField } from "./components/fields";
import useOptionalLayer from "./components/useOptionalLayer";
import { CONSENT_SCOPES } from "../../utils/kycApi";
import {
  DEVICES,
  ENRICHMENT_STEPS,
  HOUSING_TYPES,
  INCOME_RANGES,
  INTERNET_QUALITY,
  TRANSPORT_MODES,
} from "./kycOptions";

const SocioEconomic = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    monthlyHouseholdIncome: "",
    housingType: "",
    primaryTransport: "",
    internetAccessQuality: "",
    primaryDevice: "",
    numberOfDependants: "",
  });
  const [errors, setErrors] = useState({});
  const { busy, consent, consentError, toggleConsent, handleContinue, skip } =
    useOptionalLayer({
      layer: 4,
      scope: CONSENT_SCOPES.socioeconomic,
      next: "/register/beliefs",
      successMsg: "Socioeconomic profile saved.",
    });

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const onContinue = () => {
    const raw = form.numberOfDependants.trim();
    const dependants = raw === "" ? undefined : Number(raw);
    if (dependants !== undefined && (!Number.isInteger(dependants) || dependants < 0)) {
      setErrors({ numberOfDependants: "Enter a whole number, e.g. 0, 2, 5." });
      return;
    }
    handleContinue({ ...form, numberOfDependants: dependants });
  };

  const fieldProps = { form, setField, errors };

  return (
    <div className="flex flex-col items-stretch justify-center ">
      <div className="personal-info inline-flex min-h-screen flex-col items-stretch justify-center">
        <ProgressTracker step={3} totalSteps={ENRICHMENT_STEPS} />

        <Card
          title={"Socioeconomic Profile"}
          description={"This helps us understand your living context."}
          optional={true}
          onBack={() => navigate("/register/healthlifestyle")}
          onContinue={onContinue}
          onSkip={skip}
          busy={busy}
        >
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Monthly Household Income */}
            <SelectField
              label="Monthly Household Income"
              name="monthlyHouseholdIncome"
              options={INCOME_RANGES}
              placeholder="Select an option"
              {...fieldProps}
            />

            {/* Housing */}
            <PillGroup
              label="Housing"
              options={HOUSING_TYPES}
              value={form.housingType}
              onChange={(v) => setField("housingType", v)}
            />

            {/* Primary Transport */}
            <PillGroup
              label="Primary Transport"
              options={TRANSPORT_MODES}
              value={form.primaryTransport}
              onChange={(v) => setField("primaryTransport", v)}
            />

            {/* Internet Strength + Primary Device */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 pt-2">
              <SelectField
                label="Internet Strength"
                name="internetAccessQuality"
                options={INTERNET_QUALITY}
                {...fieldProps}
              />
              <SelectField
                label="Primary Device"
                name="primaryDevice"
                options={DEVICES}
                {...fieldProps}
              />
              <TextField
                label="Number of Dependants"
                name="numberOfDependants"
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                placeholder="People who depend on you financially"
                {...fieldProps}
              />
            </div>

            <Field error={consentError}>
              <ConfirmCheckbox
                checked={consent}
                onClick={toggleConsent}
                label="I consent to SurveyTools processing my household information. It is stored encrypted."
              />
            </Field>
          </form>
        </Card>
      </div>
    </div>
  );
};

// Single-choice pills; clicking the selected pill clears it
function PillGroup({ label, options, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-900 mb-2">
        {label}
      </label>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <PillOption
            key={option.value}
            label={option.label}
            selected={value === option.value}
            onClick={() => onChange(value === option.value ? "" : option.value)}
          />
        ))}
      </div>
    </div>
  );
}

export default SocioEconomic;
