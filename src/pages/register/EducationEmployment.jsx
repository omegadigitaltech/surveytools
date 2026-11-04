import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProgressTracker from "./components/ProgressTracker";
import Card from "./components/Card";
import {
  ConfirmCheckbox,
  Field,
  OptionCard,
  SelectField,
  TextField,
} from "./components/fields";
import useLayerSubmit from "./components/useLayerSubmit";
import { CONSENT_SCOPES } from "../../utils/kycApi";
import { KYC_ROUTES, isEduNgEmail } from "../../utils/kycFlow";
import {
  EDUCATION_LEVELS,
  EMPLOYMENT_STATUSES,
  ENRICHMENT_STEPS,
  GRADUATE_STATUSES,
  INCOME_RANGES,
  MARITAL_STATUSES,
} from "./kycOptions";

const REQUIRED = {
  educationLevel: "Select your highest level of education.",
  employmentStatus: "Select your employment status.",
  incomeRange: "Select your monthly income range.",
  maritalStatus: "Select your marital status.",
};

// Layer 2: socioeconomic profiling, unlocked after the survey milestone
const EducationEmployment = () => {
  const navigate = useNavigate();
  const { busy, submit } = useLayerSubmit();
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [consent, setConsent] = useState(false);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const isStudent = form.employmentStatus === "student";
  const isWorking = ["employed", "self_employed"].includes(form.employmentStatus);
  const isGraduate = ["undergraduate", "postgraduate"].includes(form.educationLevel);

  const validate = () => {
    const found = {};
    Object.entries(REQUIRED).forEach(([key, msg]) => {
      if (!form[key]) found[key] = msg;
    });
    if (isStudent && form.studentEmail && !isEduNgEmail(form.studentEmail.trim())) {
      found.studentEmail = "Only .edu.ng institutional emails are accepted.";
    }
    if (!consent) found.consent = "Please give consent to continue.";
    return found;
  };

  const handleContinue = () => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    const optional = isStudent
      ? ["studentEmail", "matriculationNumber"]
      : [
          ...(isWorking ? ["professionalOccupation", "employmentSector"] : []),
          ...(isGraduate ? ["graduateStatus"] : []),
        ];
    const payload = Object.fromEntries(Object.keys(REQUIRED).map((k) => [k, form[k]]));
    optional.forEach((key) => {
      const value = form[key]?.trim();
      if (value) payload[key] = value;
    });

    submit(2, payload, {
      scopes: [CONSENT_SCOPES.socioeconomic],
      next: KYC_ROUTES.enrichment,
      successMsg: "Extended profile saved.",
    });
  };

  const fieldProps = { form, setField, errors };

  return (
    <div className="flex flex-col items-stretch justify-center ">
      <div className="personal-info inline-flex min-h-screen flex-col items-stretch justify-center">
        <ProgressTracker step={1} totalSteps={ENRICHMENT_STEPS} showSaved={false} />

        <Card
          title={"Education & Employment"}
          description={"You've unlocked your extended profile. This helps match you to more surveys."}
          onBack={() => navigate(KYC_ROUTES.home)}
          onContinue={handleContinue}
          busy={busy}
        >
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleContinue(); }}>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-3">
                Employment Status <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {EMPLOYMENT_STATUSES.map((option) => (
                  <OptionCard
                    key={option.value}
                    label={option.label}
                    selected={form.employmentStatus === option.value}
                    onClick={() => setField("employmentStatus", option.value)}
                  />
                ))}
              </div>
              {errors.employmentStatus && (
                <p className="text-xs text-red-500 mt-1" role="alert">
                  {errors.employmentStatus}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <SelectField
                label="Highest Education Level"
                name="educationLevel"
                options={EDUCATION_LEVELS}
                required
                {...fieldProps}
              />
              <SelectField
                label="Monthly Income"
                name="incomeRange"
                options={INCOME_RANGES}
                required
                {...fieldProps}
              />
              <SelectField
                label="Marital Status"
                name="maritalStatus"
                options={MARITAL_STATUSES}
                required
                {...fieldProps}
              />

              {isWorking && (
                <>
                  <TextField
                    label="Occupation"
                    name="professionalOccupation"
                    placeholder="e.g. Software Engineer, Trader"
                    {...fieldProps}
                  />
                  <TextField
                    label="Employment Sector"
                    name="employmentSector"
                    placeholder="e.g. Technology, Finance"
                    {...fieldProps}
                  />
                </>
              )}

              {!isStudent && isGraduate && (
                <SelectField
                  label="Graduate Status"
                  name="graduateStatus"
                  options={GRADUATE_STATUSES}
                  {...fieldProps}
                />
              )}

              {isStudent && (
                <>
                  <TextField
                    label="Student Email"
                    name="studentEmail"
                    type="email"
                    placeholder="you@student.school.edu.ng"
                    {...fieldProps}
                  />
                  <TextField
                    label="Registration/ Matric number"
                    name="matriculationNumber"
                    {...fieldProps}
                  />
                </>
              )}
            </div>

            <Field error={errors.consent}>
              <ConfirmCheckbox
                checked={consent}
                onClick={() => {
                  setConsent((v) => !v);
                  setErrors((prev) => ({ ...prev, consent: undefined }));
                }}
                label="I consent to SurveyTools processing my education, employment and income information"
              />
            </Field>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EducationEmployment;
