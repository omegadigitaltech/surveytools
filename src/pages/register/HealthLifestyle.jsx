import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProgressTracker from "./components/ProgressTracker";
import Card from "./components/Card";
import { ConfirmCheckbox, Field, PillOption, TextField } from "./components/fields";
import useOptionalLayer from "./components/useOptionalLayer";
import { CONSENT_SCOPES } from "../../utils/kycApi";
import { ENRICHMENT_STEPS, HEALTH_GROUPS } from "./kycOptions";

// Selections are keyed by option label: a few options legitimately send null
const initialSelections = () =>
  HEALTH_GROUPS.reduce((acc, g) => ({ ...acc, [g.key]: [] }), {});

const HealthLifestyle = () => {
  const navigate = useNavigate();
  const [selections, setSelections] = useState(initialSelections);
  const [form, setForm] = useState({ bloodGroup: "", genotype: "" });
  const { busy, consent, consentError, toggleConsent, handleContinue, skip } =
    useOptionalLayer({
      layer: 3,
      scope: CONSENT_SCOPES.health,
      next: "/register/socioeconomic",
      successMsg: "Health & lifestyle saved.",
    });

  const toggleOption = (group, label) => {
    setSelections((prev) => {
      const current = prev[group.key];
      if (!group.multiple) {
        return { ...prev, [group.key]: current[0] === label ? [] : [label] };
      }
      // "None" can't be combined with an actual condition
      const isNone = (l) => l === "None";
      const next = current.includes(label)
        ? current.filter((o) => o !== label)
        : isNone(label)
          ? [label]
          : [...current.filter((o) => !isNone(o)), label];
      return { ...prev, [group.key]: next };
    });
  };

  const buildPayload = () => {
    const payload = {};
    HEALTH_GROUPS.forEach((group) => {
      const values = selections[group.key].map(
        (label) => group.options.find((o) => o.label === label).value,
      );
      payload[group.key] = group.multiple ? values : (values[0] ?? undefined);
    });
    return { ...payload, bloodGroup: form.bloodGroup.trim(), genotype: form.genotype.trim() };
  };

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  return (
    <div className="flex flex-col items-stretch justify-center ">
      <div className="personal-info inline-flex min-h-screen flex-col items-stretch justify-center">
        <ProgressTracker step={2} totalSteps={ENRICHMENT_STEPS} />
        <Card
          title={"Health & Lifestyle"}
          description={"Select all that apply."}
          optional={true}
          onBack={() => navigate("/dashboard")}
          onContinue={() => handleContinue(buildPayload())}
          onSkip={skip}
          busy={busy}
        >
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {HEALTH_GROUPS.map((group) => (
              <div key={group.key}>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  {group.label}
                </label>
                <div className="flex flex-wrap gap-2">
                  {group.options.map((option) => (
                    <PillOption
                      key={option.label}
                      label={option.label}
                      selected={selections[group.key].includes(option.label)}
                      onClick={() => toggleOption(group, option.label)}
                    />
                  ))}
                </div>
              </div>
            ))}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 pt-2">
              <TextField
                label="Blood Group"
                name="bloodGroup"
                placeholder="Enter blood group"
                form={form}
                setField={setField}
              />
              <TextField
                label="Genotype"
                name="genotype"
                placeholder="Enter your genotype"
                form={form}
                setField={setField}
              />
            </div>

            <Field error={consentError}>
              <ConfirmCheckbox
                checked={consent}
                onClick={toggleConsent}
                label="I consent to SurveyTools processing my health information. It is stored encrypted."
              />
            </Field>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default HealthLifestyle;
