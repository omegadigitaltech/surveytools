import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import ProgressTracker from "./components/ProgressTracker";

import Card from "./components/Card";
import { ConfirmCheckbox, Field, PillOption, SelectField } from "./components/fields";
import useOptionalLayer from "./components/useOptionalLayer";
import { CONSENT_SCOPES } from "../../utils/kycApi";
import { KYC_ROUTES } from "../../utils/kycFlow";
import {
  ENRICHMENT_STEPS,
  ETHNICITIES,
  LANGUAGES,
  MARITAL_STATUSES,
  RELIGIONS,
} from "./kycOptions";

const Beliefs = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ religion: "", ethnicity: "", maritalStatus: "" });
  const [languagesSpoken, setLanguagesSpoken] = useState([]);
  const { busy, consent, consentError, toggleConsent, handleContinue, skip } =
    useOptionalLayer({
      layer: 5,
      scope: CONSENT_SCOPES.religiousCultural,
      next: KYC_ROUTES.home,
      successMsg: "Profile complete. Thank you!",
    });

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const toggleLanguage = (language) =>
    setLanguagesSpoken((prev) =>
      prev.includes(language) ? prev.filter((l) => l !== language) : [...prev, language],
    );

  const fieldProps = { form, setField };

  return (
    <div className="flex flex-col items-stretch justify-center ">
      <div className="personal-info inline-flex min-h-screen flex-col items-stretch justify-center">
        <ProgressTracker step={ENRICHMENT_STEPS} totalSteps={ENRICHMENT_STEPS} />

        <Card
          title={"Religion & Culture"}
          description={"This helps us understand your living context."}
          optional={true}
          onBack={() => navigate("/register/socioeconomic")}
          onContinue={() => handleContinue({ ...form, languagesSpoken })}
          onSkip={skip}
          continueLabel="Finish"
          busy={busy}
        >
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Religion + Ethnicity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <SelectField label="Religion" name="religion" options={RELIGIONS} {...fieldProps} />
              <SelectField label="Ethnicity" name="ethnicity" options={ETHNICITIES} {...fieldProps} />
              <SelectField
                label="Marital Status"
                name="maritalStatus"
                options={MARITAL_STATUSES}
                {...fieldProps}
              />
            </div>

            {/* Language Spoken */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Languages Spoken
              </label>

              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((option) => (
                  <PillOption
                    key={option}
                    label={option}
                    selected={languagesSpoken.includes(option)}
                    onClick={() => toggleLanguage(option)}
                  />
                ))}
              </div>
            </div>

            <Field error={consentError}>
              <ConfirmCheckbox
                checked={consent}
                onClick={toggleConsent}
                label="I consent to SurveyTools processing my religious and cultural information. It is stored encrypted."
              />
            </Field>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Beliefs;
