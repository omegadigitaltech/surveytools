import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "./components/Card";
import EmailOtpField from "./components/EmailOtpField";
import {
  ConfirmCheckbox,
  Field,
  OptionCard,
  SelectField,
  TextField,
} from "./components/fields";
import {
  CONSENT_SCOPES,
  getResearcherTier,
  submitConsent,
  submitResearcherProfile,
} from "../../utils/kycApi";
import { KYC_ROUTES } from "../../utils/kycFlow";
import useAuthStore from "../../store/useAuthStore";
import {
  MONTHLY_SURVEY_VOLUMES,
  ORG_TYPES,
  RESEARCHER_ACADEMIC_STATUSES,
  RESEARCHER_TYPES,
  TIER_LABELS,
  TITLES,
} from "./kycOptions";

// Fields per researcherType (KYC guide sections 7.1-7.3). `kind` picks the
// input: select, textarea, eduEmail (with OTP), or a plain input type.
const VARIANTS = {
  student: [
    { name: "academicStatus", label: "Academic Status", kind: "select", options: RESEARCHER_ACADEMIC_STATUSES },
    { name: "institution", label: "Institution", placeholder: "e.g. University of Lagos" },
    { name: "studentEmail", label: "Student Email", kind: "eduEmail" },
    { name: "faculty", label: "Faculty", placeholder: "e.g. Faculty of Engineering" },
    { name: "department", label: "Department" },
    { name: "level", label: "Level", placeholder: "e.g. 300 Level, Final Year" },
    { name: "matriculationNumber", label: "Matric Number", optional: true },
    { name: "researchTopic", label: "Research Topic", optional: true, full: true },
  ],
  professional: [
    { name: "title", label: "Title", kind: "select", options: TITLES },
    { name: "profession", label: "Profession", placeholder: "e.g. Data Scientist" },
    { name: "areaOfSpecialisation", label: "Area of Specialisation", placeholder: "e.g. Public Health" },
    { name: "employer", label: "Employer" },
    { name: "workEmail", label: "Work Email", type: "email" },
    { name: "stateOfPractice", label: "State of Practice", placeholder: "e.g. Lagos" },
    { name: "licenseNo", label: "License Number", optional: true },
    { name: "researchPurpose", label: "Research Purpose", kind: "textarea", full: true, placeholder: "What kind of surveys do you plan to run?" },
  ],
  corporate: [
    { name: "orgName", label: "Organisation Name" },
    { name: "orgType", label: "Organisation Type", kind: "select", options: ORG_TYPES },
    { name: "industry", label: "Industry", placeholder: "e.g. FMCG, Healthcare" },
    { name: "rcNumber", label: "RC Number (CAC)", optional: true },
    { name: "orgEmail", label: "Organisation Email", type: "email" },
    { name: "orgPhone", label: "Organisation Phone", type: "tel" },
    { name: "contactName", label: "Contact Person" },
    { name: "contactRole", label: "Contact Role", placeholder: "e.g. Research Manager" },
    { name: "stateOfOperation", label: "State of Operation", placeholder: "e.g. Lagos" },
    { name: "expectedMonthlySurveys", label: "Expected Surveys / Month", kind: "select", options: MONTHLY_SURVEY_VOLUMES },
    { name: "billingAddress", label: "Billing Address", full: true },
    { name: "researchPurpose", label: "Research Purpose", kind: "textarea", full: true, placeholder: "What business need will surveys serve?" },
  ],
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ResearcherProfile = () => {
  const navigate = useNavigate();
  const setResearcherTier = useAuthStore((state) => state.setResearcherTier);
  const [researcherType, setResearcherType] = useState("");
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [emailVerified, setEmailVerified] = useState(false);
  const [confirmAccurate, setConfirmAccurate] = useState(false);
  const [agreePrivacyPolicy, setAgreePrivacyPolicy] = useState(false);
  const [busy, setBusy] = useState(false);
  const consented = useRef(false);

  const fields = VARIANTS[researcherType] || [];

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const found = {};
    if (!researcherType) found.researcherType = "Select the type of researcher you are.";
    fields.forEach(({ name, label, optional, type }) => {
      const value = (form[name] || "").trim();
      if (!optional && !value) found[name] = `${label} is required.`;
      else if (type === "email" && value && !EMAIL_REGEX.test(value)) {
        found[name] = "Enter a valid email address.";
      }
    });
    if (researcherType === "student" && !found.studentEmail && !emailVerified) {
      found.studentEmail = "Verify your student email to continue.";
    }
    if (!confirmAccurate || !agreePrivacyPolicy) {
      found.consent = "Please confirm both statements to continue.";
    }
    return found;
  };

  const handleSubmit = async () => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    const payload = { researcherType };
    fields.forEach(({ name }) => {
      const value = (form[name] || "").trim();
      if (value) payload[name] = value;
    });

    setBusy(true);
    try {
      if (!consented.current) {
        await submitConsent([CONSENT_SCOPES.basicProfile, CONSENT_SCOPES.surveyParticipation]);
        consented.current = true;
      }
      await submitResearcherProfile(payload);
      const tier = await getResearcherTier().catch(() => null);
      toast.success(
        tier
          ? `Profile submitted. Your plan: ${TIER_LABELS[tier] || tier}.`
          : "Profile submitted.",
      );
      setResearcherTier(tier);
      navigate(KYC_ROUTES.researcherHome, { replace: true });
    } catch (err) {
      if (err.status === 409) {
        toast.info("You've already submitted a researcher profile.");
        navigate(KYC_ROUTES.researcherHome, { replace: true });
        return;
      }
      if (err.status !== 401) toast.error(err.message);
      setBusy(false);
    }
  };

  const renderField = (field) => {
    const common = {
      label: field.label,
      name: field.name,
      form,
      setField,
      errors,
      required: !field.optional,
      full: field.full,
    };
    if (field.kind === "eduEmail") {
      return (
        <EmailOtpField
          key={field.name}
          label={field.label}
          email={form.studentEmail || ""}
          onEmailChange={(v) => setField("studentEmail", v)}
          verified={emailVerified}
          onVerified={(v) => {
            setEmailVerified(v);
            if (v) setErrors((prev) => ({ ...prev, studentEmail: undefined }));
          }}
          error={errors.studentEmail}
        />
      );
    }
    if (field.kind === "select") {
      return <SelectField key={field.name} {...common} options={field.options} />;
    }
    if (field.kind === "textarea") {
      return (
        <Field key={field.name} label={field.label} required full error={errors[field.name]} htmlFor={field.name}>
          <textarea
            id={field.name}
            rows={3}
            className="input"
            placeholder={field.placeholder}
            value={form[field.name] || ""}
            onChange={(e) => setField(field.name, e.target.value)}
          />
        </Field>
      );
    }
    return (
      <TextField
        key={field.name}
        {...common}
        type={field.type || "text"}
        placeholder={field.placeholder}
      />
    );
  };

  return (
    <div className="flex flex-col items-stretch justify-center mt-3">
      <div className="personal-info w-[100%] inline-flex min-h-screen flex-col items-stretch justify-center">
        <Card
          title={"Researcher Profile"}
          description={"Tell us who you are so we can set up your research access."}
          onBack={() => navigate(KYC_ROUTES.home)}
          onContinue={handleSubmit}
          continueLabel="Submit Profile"
          busy={busy}
        >
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-3">
                I am a <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {RESEARCHER_TYPES.map((option) => (
                  <OptionCard
                    key={option.value}
                    label={option.label}
                    selected={researcherType === option.value}
                    onClick={() => {
                      setResearcherType(option.value);
                      setErrors({});
                    }}
                  />
                ))}
              </div>
              {errors.researcherType && (
                <p className="text-xs text-red-500 mt-1" role="alert">
                  {errors.researcherType}
                </p>
              )}
            </div>

            {researcherType && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                {fields.map(renderField)}
              </div>
            )}

            <Field error={errors.consent}>
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
              </div>
            </Field>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResearcherProfile;
